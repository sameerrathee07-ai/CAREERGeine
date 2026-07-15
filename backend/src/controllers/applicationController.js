import { db, Timestamp } from '../config/firebase.js';
import { createDocument, getDocument, updateDocument, queryDocuments, incrementField } from '../services/firestore.js';
import { sendNotification } from '../services/email.js';
import { aiMatchJob } from '../services/aiJobMatching.js';
import logger from '../services/logger.js';
import { BadRequestError } from '../utils/errors.js';
import { createAuditLog } from '../utils/helpers.js';
import { computeMatchScore } from '../services/nlp.js';

export async function createApplication(req, res, next) {
  try {
    const { jobId, resumeId, coverLetter } = req.body;

    // Validate job exists and is active
    const job = await getDocument('jobs', jobId);
    if (job.status !== 'active') {
      throw new BadRequestError('This job is no longer accepting applications');
    }

    // Prevent duplicate applications
    const existing = await db.collection('applications')
      .where('userId', '==', req.user.uid)
      .where('jobId', '==', jobId)
      .get();
    if (!existing.empty) {
      throw new BadRequestError('You have already applied to this job');
    }

    // Validate resume belongs to user
    const resume = await getDocument('resumes', resumeId);
    if (resume.userId !== req.user.uid) {
      throw new BadRequestError('Invalid resume specified');
    }

    // Calculate match score using AI (with NLP fallback)
    const resumeText = resume.analysis?.sections
      ? Object.values(resume.analysis.sections).filter(Boolean).join(' ')
      : '';
    const jobText = `${job.title} ${job.description} ${(job.skills || []).join(' ')}`;
    const resumeSkills = resume.analysis?.skills || [];

    let matchScore = computeMatchScore(resumeText, jobText, resumeSkills);
    let aiMatch = null;

    try {
      aiMatch = await aiMatchJob({
        resumeText,
        jobTitle: job.title,
        jobDescription: job.description,
        jobSkills: job.skills || [],
      });
      if (aiMatch) matchScore = aiMatch.matchPercentage;
    } catch { /* use NLP fallback */ }

    const application = await createDocument('applications', {
      jobId,
      userId: req.user.uid,
      resumeId,
      coverLetter: (coverLetter || '').trim(),
      status: 'pending',
      matchScore,
      aiMatchData: aiMatch || { matchPercentage: matchScore, _source: 'nlp' },
      recruiterNotes: '',
    });

    // Update counts
    await incrementField('jobs', jobId, 'applicationsCount');
    await incrementField('users', req.user.uid, 'stats.jobsApplied');

    // Notify recruiter
    await sendNotification({
      userId: job.recruiterId,
      type: 'new_application',
      title: `New Application: ${job.title}`,
      message: `${req.user.name || req.user.email} has applied for ${job.title}`,
      data: { applicationId: application.id, jobId, candidateId: req.user.uid },
    });

    logger.info(`Application created: ${application.id} for job ${jobId} by user ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'application.create', resource: 'applications',
      resourceId: application.id, details: { jobId, matchScore }, req,
    }));

    res.status(201).json({ success: true, data: { ...application, matchScore } });
  } catch (err) {
    next(err);
  }
}

export async function listApplications(req, res, next) {
  try {
    const { page = 1, limit = 20, status, jobId, sort = 'createdAt', order = 'desc' } = req.query;
    const filters = [];

    if (req.user.role === 'student') {
      filters.push({ type: 'where', field: 'userId', op: '==', value: req.user.uid });
    } else if (req.user.role === 'recruiter') {
      // Get jobs owned by this recruiter
      const jobsSnap = await db.collection('jobs')
        .where('recruiterId', '==', req.user.uid)
        .get();
      const jobIds = jobsSnap.docs.map((d) => d.id);
      if (jobIds.length === 0) {
        return res.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } });
      }
      // Firestore 'in' queries are limited to 10 values - batch if needed
      for (let i = 0; i < jobIds.length; i += 10) {
        const batch = jobIds.slice(i, i + 10);
        // We'll filter client-side instead
      }
      // Store jobIds for client-side filtering
      req._recruiterJobIds = jobIds;
    }

    if (status) filters.push({ type: 'where', field: 'status', op: '==', value: status });
    if (jobId) filters.push({ type: 'where', field: 'jobId', op: '==', value: jobId });

    const result = await queryDocuments({
      collection: 'applications',
      filters,
      sort,
      order,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    // Filter for recruiter (client-side)
    let data = result.data;
    if (req.user.role === 'recruiter' && req._recruiterJobIds) {
      data = data.filter((a) => req._recruiterJobIds.includes(a.jobId));
    }

    // Enrich with job and user info
    const enriched = await Promise.all(data.map(async (app) => {
      try {
        const [job, user] = await Promise.all([
          getDocument('jobs', app.jobId),
          getDocument('users', app.userId),
        ]);
        const { password, ...safeUser } = user;
        return { ...app, job: { id: job.id, title: job.title, location: job.location, type: job.type, status: job.status }, user: safeUser };
      } catch {
        return app;
      }
    }));

    res.json({ success: true, data: enriched, pagination: { ...result.pagination, total: enriched.length } });
  } catch (err) {
    next(err);
  }
}

export async function getApplication(req, res, next) {
  try {
    const app = await getDocument('applications', req.params.id);

    // Authorization: student owns it, recruiter owns the job, or admin
    if (app.userId !== req.user.uid) {
      const job = await getDocument('jobs', app.jobId);
      if (job.recruiterId !== req.user.uid && req.user.role !== 'admin') {
        throw new BadRequestError('Access denied');
      }
    }

    const [job, user, resume] = await Promise.all([
      getDocument('jobs', app.jobId).catch(() => ({})),
      getDocument('users', app.userId).catch(() => ({})),
      getDocument('resumes', app.resumeId).catch(() => ({})),
    ]);

    const { password, ...safeUser } = user;
    res.json({ success: true, data: { ...app, job, user: safeUser, resume } });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const app = await getDocument('applications', req.params.id);
    const job = await getDocument('jobs', app.jobId);

    if (job.recruiterId !== req.user.uid && req.user.role !== 'admin') {
      throw new BadRequestError('You can only update applications for your own jobs');
    }

    const previousStatus = app.status;
    const updated = await updateDocument('applications', req.params.id, { status });

    // Notify applicant
    await sendNotification({
      userId: app.userId,
      type: 'application_status',
      title: `Application ${status}: ${job.title}`,
      message: `Your application for ${job.title} has been updated to "${status}".`,
      data: { applicationId: req.params.id, status, jobId: app.jobId },
    });

    logger.info(`Application ${req.params.id} status changed: ${previousStatus} -> ${status} by ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'application.updateStatus', resource: 'applications',
      resourceId: req.params.id, details: { from: previousStatus, to: status }, req,
    }));

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function shortlistCandidate(req, res, next) {
  try {
    const app = await getDocument('applications', req.params.id);
    const job = await getDocument('jobs', app.jobId);

    if (job.recruiterId !== req.user.uid && req.user.role !== 'admin') {
      throw new BadRequestError('Access denied');
    }

    await updateDocument('applications', req.params.id, { status: 'shortlisted' });

    await sendNotification({
      userId: app.userId,
      type: 'application_shortlisted',
      title: 'Congratulations! You\'ve Been Shortlisted',
      message: `Your application for ${job.title} has been shortlisted. The recruiter will contact you soon.`,
      data: { applicationId: req.params.id, jobId: app.jobId },
    });

    logger.info(`Candidate shortlisted: ${app.userId} for job ${app.jobId} by ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'application.shortlist', resource: 'applications',
      resourceId: req.params.id, details: { candidateId: app.userId, jobId: app.jobId }, req,
    }));

    res.json({ success: true, message: 'Candidate shortlisted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getApplicationStats(req, res, next) {
  try {
    const jobsSnap = await db.collection('jobs')
      .where('recruiterId', '==', req.user.uid)
      .get();
    const jobIds = jobsSnap.docs.map((d) => d.id);

    if (jobIds.length === 0) {
      return res.json({ success: true, data: { total: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 } });
    }

    const appsSnap = await db.collection('applications')
      .where('jobId', 'in', jobIds.slice(0, 10))
      .get();

    const stats = { total: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 };
    appsSnap.docs.forEach((d) => {
      const s = d.data().status;
      stats.total++;
      if (stats[s] !== undefined) stats[s]++;
    });

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
