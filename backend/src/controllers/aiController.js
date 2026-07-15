import { getDocument } from '../services/firestore.js';
import {
  askCareerAdvice, getInterviewPrep, getSalaryInsights, getLearningPath,
} from '../services/aiCareerAssistant.js';
import { aiMatchJob } from '../services/aiJobMatching.js';
import { aiAnalyzeResume } from '../services/aiResumeAnalysis.js';
import { rankCandidates, compareResumes, generateCandidateSummary } from '../services/aiRecruiter.js';
import logger from '../services/logger.js';
import { BadRequestError } from '../utils/errors.js';

export async function careerAdvice(req, res, next) {
  try {
    const { query } = req.body;
    if (!query?.trim()) throw new BadRequestError('Query is required');

    const { uid, role } = req.user;
    const userDoc = await getDocument('users', uid).catch(() => ({}));
    const context = {
      role: userDoc.role || role,
      field: userDoc.field || '',
      experience: userDoc.stats?.jobTitle || '',
      skills: userDoc.skills || [],
    };

    const result = await askCareerAdvice(query, context);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function interviewPrep(req, res, next) {
  try {
    const { role, company, resumeId } = req.body;
    if (!role?.trim()) throw new BadRequestError('Role is required');

    let resumeText = '';
    if (resumeId) {
      const resume = await getDocument('resumes', resumeId).catch(() => null);
      if (resume?.analysis?.sections) {
        resumeText = Object.values(resume.analysis.sections).filter(Boolean).join('\n');
      }
    }

    const result = await getInterviewPrep(role, company || '', resumeText);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function salaryInsights(req, res, next) {
  try {
    const { role, location, experience } = req.body;
    if (!role?.trim()) throw new BadRequestError('Role is required');

    const result = await getSalaryInsights(role, location || 'Remote', experience || 'mid');
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function learningPath(req, res, next) {
  try {
    const { targetRole, currentSkills } = req.body;
    if (!targetRole?.trim()) throw new BadRequestError('Target role is required');

    const userDoc = await getDocument('users', req.user.uid).catch(() => ({}));
    const skills = currentSkills || userDoc.skills || [];

    const result = await getLearningPath(userDoc.role || '', skills, targetRole);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function analyzeResumeAI(req, res, next) {
  try {
    const resume = await getDocument('resumes', req.params.id);
    if (resume.userId !== req.user.uid && req.user.role !== 'admin') {
      throw new BadRequestError('Access denied');
    }

    const resumeText = resume.analysis?.sections
      ? Object.values(resume.analysis.sections).filter(Boolean).join('\n')
      : '';

    if (!resumeText && resume.fileUrl) {
      return res.json({ success: true, data: null, message: 'Re-upload and analyze the resume first' });
    }

    const analysis = await aiAnalyzeResume(resumeText);
    res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
}

export async function matchJobAI(req, res, next) {
  try {
    const { resumeId, jobId } = req.body;
    if (!resumeId || !jobId) throw new BadRequestError('resumeId and jobId are required');

    const [resume, job] = await Promise.all([
      getDocument('resumes', resumeId),
      getDocument('jobs', jobId),
    ]);

    const resumeText = resume.analysis?.sections
      ? Object.values(resume.analysis.sections).filter(Boolean).join('\n')
      : '';

    const result = await aiMatchJob({
      resumeText,
      jobTitle: job.title,
      jobDescription: job.description,
      jobSkills: job.skills || [],
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function rankCandidatesHandler(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = await getDocument('jobs', jobId);

    if (job.recruiterId !== req.user.uid && req.user.role !== 'admin') {
      throw new BadRequestError('Access denied');
    }

    const { db } = await import('../config/firebase.js');
    const appsSnap = await db.collection('applications')
      .where('jobId', '==', jobId)
      .get();

    if (appsSnap.empty) {
      return res.json({ success: true, data: { rankings: [], topCandidateIndex: -1, comparisonSummary: 'No applicants yet' } });
    }

    const candidates = await Promise.all(appsSnap.docs.map(async (d) => {
      const app = { id: d.id, ...d.data() };
      try {
        const userDoc = await getDocument('users', app.userId);
        const resume = app.resumeId ? await getDocument('resumes', app.resumeId).catch(() => null) : null;
        return {
          name: userDoc.name || userDoc.email || 'Unknown',
          skills: resume?.analysis?.skills || [],
          experience: resume?.analysis?.experience?.years || '',
          education: resume?.analysis?.education || '',
          strengths: [],
          matchScore: app.matchScore || 0,
          userId: app.userId,
        };
      } catch {
        return null;
      }
    }));

    const valid = candidates.filter(Boolean);
    const result = await rankCandidates(job.title, job.description, valid);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function compareCandidates(req, res, next) {
  try {
    const { candidateIds } = req.body;
    if (!candidateIds?.length || candidateIds.length < 2) {
      throw new BadRequestError('At least 2 candidate IDs required');
    }

    const { db } = await import('../config/firebase.js');
    const resumes = await Promise.all(candidateIds.map(async (id) => {
      try {
        const userDoc = await getDocument('users', id);
        const appsSnap = await db.collection('applications')
          .where('userId', '==', id)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        let resumeData = { skills: [], experience: '', education: '', strengths: [] };
        if (!appsSnap.empty) {
          const app = appsSnap.docs[0].data();
          if (app.resumeId) {
            const resume = await getDocument('resumes', app.resumeId).catch(() => null);
            if (resume?.analysis) {
              resumeData = {
                skills: resume.analysis.skills || [],
                experience: resume.analysis.experience || '',
                education: resume.analysis.education || '',
                strengths: [],
              };
            }
          }
        }
        return { name: userDoc.name || userDoc.email || 'Unknown', ...resumeData };
      } catch {
        return null;
      }
    }));

    const valid = resumes.filter(Boolean);
    const result = await compareResumes(valid);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function candidateSummary(req, res, next) {
  try {
    const { userId } = req.params;
    const userDoc = await getDocument('users', userId);

    const { db } = await import('../config/firebase.js');
    const appsSnap = await db.collection('applications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    let resumeText = '';
    if (!appsSnap.empty) {
      const app = appsSnap.docs[0].data();
      if (app.resumeId) {
        const resume = await getDocument('resumes', app.resumeId).catch(() => null);
        if (resume?.analysis?.sections) {
          resumeText = Object.values(resume.analysis.sections).filter(Boolean).join('\n');
        }
      }
    }

    const result = await generateCandidateSummary(userDoc.name || userDoc.email || 'Unknown', resumeText);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
