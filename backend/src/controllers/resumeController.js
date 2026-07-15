import { db, Timestamp } from '../config/firebase.js';
import { createDocument, getDocument, updateDocument, deleteDocument, queryDocuments } from '../services/firestore.js';
import { uploadFile, deleteFile } from '../services/storage.js';
import { analyzeResume, saveUploadedFile, deleteUploadedFile, getUploadPath } from '../services/resumeParser.js';
import { aiAnalyzeResume } from '../services/aiResumeAnalysis.js';
import { aiParseResume } from '../services/aiResumeParser.js';
import { sendNotification } from '../services/email.js';
import logger from '../services/logger.js';
import { BadRequestError } from '../utils/errors.js';
import { createAuditLog } from '../utils/helpers.js';
import { isAiConfigured } from '../services/openai.js';
import path from 'path';

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) throw new BadRequestError('No file provided. Upload a PDF or DOCX resume.');
    if (req.file.size > 10 * 1024 * 1024) throw new BadRequestError('File too large. Maximum size is 10MB.');
    if (req.file.mimetype !== 'application/pdf') throw new BadRequestError('Only PDF files are supported for parsing');

    const { filename, filePath } = saveUploadedFile(req.file.buffer, req.file.originalname);

    // Upload to Firebase Storage
    const { url } = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'resumes');

    // Create resume document
    const resume = await createDocument('resumes', {
      userId: req.user.uid,
      filename,
      originalName: req.file.originalname,
      fileUrl: url,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      analysis: null,
      status: 'pending',
    });

    // Update user stats
    await db.collection('users').doc(req.user.uid).update({
      'stats.resumesUploaded': db.FieldValue.increment(1),
    });

    // Clean up temp file
    deleteUploadedFile(filePath);

    logger.info(`Resume uploaded: ${req.file.originalname} by user ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'resume.upload', resource: 'resumes',
      resourceId: resume.id, details: { filename: req.file.originalname, size: req.file.size }, req,
    }));

    res.status(201).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
}

export async function listResumes(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filters = [{ type: 'where', field: 'userId', op: '==', value: req.user.uid }];
    if (status) filters.push({ type: 'where', field: 'status', op: '==', value: status });

    const result = await queryDocuments({
      collection: 'resumes',
      filters,
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

export async function getResume(req, res, next) {
  try {
    const resume = await getDocument('resumes', req.params.id);

    if (resume.userId !== req.user.uid) {
      if (req.user.role === 'admin') {
        // Allow
      } else if (req.user.role === 'recruiter') {
        const appSnap = await db.collection('applications')
          .where('userId', '==', resume.userId)
          .where('resumeId', '==', req.params.id)
          .get();
        if (appSnap.empty) throw new BadRequestError('Access denied');
      } else {
        throw new BadRequestError('Access denied');
      }
    }

    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
}

export async function downloadResume(req, res, next) {
  try {
    const resume = await getDocument('resumes', req.params.id);

    if (resume.userId !== req.user.uid) {
      if (req.user.role === 'admin') {
        // Allow
      } else if (req.user.role === 'recruiter') {
        const appSnap = await db.collection('applications')
          .where('userId', '==', resume.userId)
          .where('resumeId', '==', req.params.id)
          .get();
        if (appSnap.empty) throw new BadRequestError('Access denied');
      } else {
        throw new BadRequestError('Access denied');
      }
    }

    // Redirect to Firebase Storage URL
    const encodedUrl = encodeURI(resume.fileUrl);
    res.json({ success: true, data: { downloadUrl: encodedUrl, filename: resume.originalName } });
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req, res, next) {
  try {
    const resume = await getDocument('resumes', req.params.id);
    if (resume.userId !== req.user.uid && req.user.role !== 'admin') {
      throw new BadRequestError('Access denied');
    }

    await deleteFile(resume.fileUrl);
    await deleteDocument('resumes', req.params.id);

    logger.info(`Resume deleted: ${resume.id} by user ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'resume.delete', resource: 'resumes',
      resourceId: req.params.id, req,
    }));

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function analyzeResumeHandler(req, res, next) {
  let tempFilePath = null;
  try {
    const resume = await getDocument('resumes', req.params.id);
    if (resume.userId !== req.user.uid) {
      throw new BadRequestError('Access denied');
    }
    if (resume.mimeType !== 'application/pdf') {
      throw new BadRequestError('Only PDF resumes can be analyzed');
    }

    // Update status to analyzing
    await updateDocument('resumes', req.params.id, { status: 'analyzing' });

    // Download file from Firebase Storage
    const { storage } = await import('../config/firebase.js');
    const bucket = storage;
    const filePathFromUrl = decodeURIComponent(resume.fileUrl.split('/o/')[1]?.split('?')[0] || '');

    const tempDir = path.resolve('uploads');
    const localPath = path.join(tempDir, `analysis-${resume.filename}`);
    tempFilePath = localPath;

    // Download from Firebase to local temp
    await bucket.file(filePathFromUrl).download({ destination: localPath });

    // Parse resume text via pdf-parse
    const parsed = await analyzeResume(localPath);
    const resumeText = parsed.text;

    // AI-powered analysis (with NLP fallback)
    const [aiParsed, aiAnalysis] = await Promise.all([
      aiParseResume(resumeText),
      aiAnalyzeResume(resumeText),
    ]);

    // Save analysis results (AI-enhanced, with NLP fallback)
    await updateDocument('resumes', req.params.id, {
      status: 'completed',
      analysis: {
        // AI-enhanced scores
        resumeScore: aiAnalysis.resumeScore,
        atsScore: aiAnalysis.atsScore,
        skillScore: aiAnalysis.skillScore,
        contentScore: aiAnalysis.contentScore,
        formatScore: aiAnalysis.formatScore,
        matchScore: aiAnalysis.matchScore || 0,
        // AI analysis results
        summary: aiAnalysis.summary || '',
        strengths: aiAnalysis.strengths || [],
        weaknesses: aiAnalysis.weaknesses || [],
        suggestions: aiAnalysis.suggestions || parsed.suggestions || [],
        actionVerbs: aiAnalysis.actionVerbs || [],
        keywordSuggestions: aiAnalysis.keywordSuggestions || [],
        careerRecommendations: aiAnalysis.careerRecommendations || [],
        targetRoles: aiAnalysis.targetRoles || [],
        missingSections: aiAnalysis.missingSections || [],
        formattingIssues: aiAnalysis.formattingIssues || [],
        grammarIssues: aiAnalysis.grammarIssues || [],
        actionVerbScore: aiAnalysis.actionVerbScore || 0,
        keywordDensity: aiAnalysis.keywordDensity || 0,
        recruiterReadiness: aiAnalysis.recruiterReadiness || 0,
        readabilityScore: aiAnalysis.readabilityScore || 0,
        // AI-parsed resume data
        skills: aiParsed.skills || parsed.skills || [],
        extractedName: aiParsed.name || parsed.name || '',
        extractedEmail: aiParsed.email || parsed.email || '',
        extractedPhone: aiParsed.phone || parsed.phone || '',
        experience: aiParsed.experience || [{ title: '', company: '', description: parsed.experience || '' }],
        education: aiParsed.education || [{ degree: parsed.education || '', institution: '' }],
        certifications: aiParsed.certifications || [],
        projects: aiParsed.projects || [],
        languages: aiParsed.languages || [],
        tools: aiParsed.tools || [],
        softSkills: aiParsed.softSkills || [],
        // Structure
        sections: parsed.sections || {},
        wordCount: parsed.wordCount || resumeText.split(/\s+/).length,
        pageCount: parsed.pageCount || 1,
        // Metadata
        analyzedAt: Timestamp.now(),
        aiSource: aiAnalysis._source || 'nlp',
      },
    });

    // Clean up
    if (tempFilePath) deleteUploadedFile(tempFilePath);

    // Send notification
    await sendNotification({
      userId: req.user.uid,
      type: 'resume_analyzed',
      title: 'Resume Analysis Complete',
      message: `Your resume scored ${aiAnalysis.resumeScore}%. View detailed feedback.`,
      data: { resumeId: req.params.id, score: aiAnalysis.resumeScore, aiSource: aiAnalysis._source },
    });

    // Send email
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (userDoc.exists) {
        const user = userDoc.data();
        const { sendResumeAnalyzedEmail } = await import('../services/email.js');
        await sendResumeAnalyzedEmail(user.email, user.name, aiAnalysis.resumeScore);
      }
    } catch { /* email non-blocking */ }

    logger.info(`Resume analyzed: ${resume.id} score=${aiAnalysis.resumeScore}% (source=${aiAnalysis._source})`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'resume.analyze', resource: 'resumes',
      resourceId: req.params.id, details: { score: aiAnalysis.resumeScore, source: aiAnalysis._source }, req,
    }));

    // Return updated resume
    const updated = await getDocument('resumes', req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    // Mark as failed
    try { await updateDocument('resumes', req.params.id, { status: 'failed' }); } catch { /* ignore */ }
    if (tempFilePath) deleteUploadedFile(tempFilePath);
    next(err);
  }
}
