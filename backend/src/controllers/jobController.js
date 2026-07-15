import { db, Timestamp } from '../config/firebase.js';
import { createDocument, getDocument, updateDocument, deleteDocument, queryDocuments, incrementField } from '../services/firestore.js';
import { sendNotification } from '../services/email.js';
import { aiMatchJob } from '../services/aiJobMatching.js';
import { isAiConfigured } from '../services/openai.js';
import logger from '../services/logger.js';
import { BadRequestError } from '../utils/errors.js';
import { createAuditLog, buildPaginationQuery } from '../utils/helpers.js';
import { extractSkills, computeMatchScore } from '../services/nlp.js';

export async function createJob(req, res, next) {
  try {
    const { title, description, location, type, experienceLevel, salary, skills, requirements, responsibilities } = req.body;

    const jobData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      type,
      experienceLevel,
      salary: salary || 'Competitive',
      skills: skills.map((s) => s.trim()),
      requirements: (requirements || []).map((r) => r.trim()),
      responsibilities: (responsibilities || []).map((r) => r.trim()),
      recruiterId: req.user.uid,
      status: 'active',
      applicationsCount: 0,
      views: 0,
    };

    const job = await createDocument('jobs', jobData);

    await incrementField('users', req.user.uid, 'stats.jobsPosted');

    logger.info(`Job created: ${job.id} - ${title} by recruiter ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'job.create', resource: 'jobs',
      resourceId: job.id, details: { title }, req,
    }));

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function listJobs(req, res, next) {
  try {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', type, experienceLevel, location, skills, search, recruiterId } = req.query;

    const filters = [];

    // Default: show only active jobs for students, all for recruiters/admins
    if (req.user?.role === 'student' || !req.user) {
      filters.push({ type: 'where', field: 'status', op: '==', value: 'active' });
    }
    if (type) filters.push({ type: 'where', field: 'type', op: '==', value: type });
    if (experienceLevel) filters.push({ type: 'where', field: 'experienceLevel', op: '==', value: experienceLevel });
    if (location) filters.push({ type: 'where', field: 'location', op: '==', value: location });
    if (recruiterId) filters.push({ type: 'where', field: 'recruiterId', op: '==', value: recruiterId });

    const result = await queryDocuments({
      collection: 'jobs',
      filters,
      sort,
      order,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    let data = result.data;

    // Text search (client-side filter)
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((j) => {
        const searchable = `${j.title} ${j.description || ''} ${(j.skills || []).join(' ')} ${j.location || ''}`.toLowerCase();
        return searchable.includes(q);
      });
    }

    // Skill filter
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim().toLowerCase());
      data = data.filter((j) =>
        skillList.some((s) => (j.skills || []).some((js) => js.toLowerCase().includes(s)))
      );
    }

    // Compute match scores for students
    if (req.user?.role === 'student') {
      const resumeSnap = await db.collection('resumes')
        .where('userId', '==', req.user.uid)
        .where('status', '==', 'completed')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!resumeSnap.empty) {
        const analysis = resumeSnap.docs[0].data().analysis;
        const resumeSkills = analysis?.skills || [];
        const resumeText = analysis?.sections ? Object.values(analysis.sections).join(' ') : '';

        // Compute NLP scores first (fast, all jobs)
        data = data.map((j) => ({
          ...j,
          matchScore: computeMatchScore(resumeText, j.description + ' ' + (j.skills || []).join(' '), resumeSkills),
        }));

        // Enhance top matches with AI (when configured, rate-limit to top 5)
        if (isAiConfigured()) {
          const topNlp = [...data].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 5);
          await Promise.all(topNlp.map(async (job) => {
            try {
              const ai = await aiMatchJob({
                resumeText,
                jobTitle: job.title,
                jobDescription: job.description,
                jobSkills: job.skills || [],
              });
              if (ai && ai.matchPercentage) {
                const idx = data.findIndex((j) => j.id === job.id);
                if (idx !== -1) data[idx] = { ...data[idx], matchScore: ai.matchPercentage, aiMatch: true };
              }
            } catch { /* keep NLP score */ }
          }));
        }

        data.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }
    }

    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page)),
        limit: Math.min(100, parseInt(limit)),
        total: data.length,
        totalPages: Math.ceil(data.length / parseInt(limit)),
        hasMore: Math.max(1, parseInt(page)) * parseInt(limit) < data.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getJob(req, res, next) {
  try {
    const job = await getDocument('jobs', req.params.id);
    await incrementField('jobs', req.params.id, 'views');
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req, res, next) {
  try {
    const job = await getDocument('jobs', req.params.id);
    if (job.recruiterId !== req.user.uid && req.user.role !== 'admin') {
      throw new BadRequestError('You can only edit your own job postings');
    }

    const allowed = ['title', 'description', 'location', 'type', 'experienceLevel', 'salary', 'skills', 'requirements', 'responsibilities', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = Array.isArray(req.body[key])
          ? req.body[key].map((s) => s.trim())
          : typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
      }
    }

    const updated = await updateDocument('jobs', req.params.id, updates);

    logger.info(`Job updated: ${req.params.id} by user ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'job.update', resource: 'jobs',
      resourceId: req.params.id, details: { updated: Object.keys(updates) }, req,
    }));

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const job = await getDocument('jobs', req.params.id);
    if (job.recruiterId !== req.user.uid && req.user.role !== 'admin') {
      throw new BadRequestError('You can only delete your own job postings');
    }

    await deleteDocument('jobs', req.params.id);

    // Cascade delete related applications
    const appSnap = await db.collection('applications').where('jobId', '==', req.params.id).get();
    const batch = db.batch();
    appSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    logger.info(`Job deleted: ${req.params.id} by user ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'job.delete', resource: 'jobs',
      resourceId: req.params.id, details: { title: job.title }, req,
    }));

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function saveJob(req, res, next) {
  try {
    // Verify job exists
    await getDocument('jobs', req.params.id);

    const existing = await db.collection('savedJobs')
      .where('userId', '==', req.user.uid)
      .where('jobId', '==', req.params.id)
      .get();

    if (!existing.empty) {
      return res.json({ success: true, data: { id: existing.docs[0].id }, message: 'Job already saved' });
    }

    const saved = await createDocument('savedJobs', { userId: req.user.uid, jobId: req.params.id });
    await incrementField('users', req.user.uid, 'stats.jobsSaved');

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}

export async function unsaveJob(req, res, next) {
  try {
    const snap = await db.collection('savedJobs')
      .where('userId', '==', req.user.uid)
      .where('jobId', '==', req.params.id)
      .get();

    if (!snap.empty) {
      await deleteDocument('savedJobs', snap.docs[0].id);
    }

    res.json({ success: true, message: 'Job removed from saved' });
  } catch (err) {
    next(err);
  }
}

export async function getSavedJobs(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await queryDocuments({
      collection: 'savedJobs',
      filters: [{ type: 'where', field: 'userId', op: '==', value: req.user.uid }],
      sort: 'createdAt',
      order: 'desc',
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const jobIds = result.data.map((s) => s.jobId);
    const jobs = [];
    for (const id of jobIds) {
      try { const j = await getDocument('jobs', id); jobs.push(j); } catch { /* deleted */ }
    }

    res.json({ success: true, data: jobs, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getRecruiterJobs(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await queryDocuments({
      collection: 'jobs',
      filters: [{ type: 'where', field: 'recruiterId', op: '==', value: req.user.uid }],
      sort: 'createdAt',
      order: 'desc',
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
