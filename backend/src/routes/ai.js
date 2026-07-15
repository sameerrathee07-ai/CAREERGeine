import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import * as aiController from '../controllers/aiController.js';

const router = Router();

// Career Assistant
router.post('/advice', verifyToken, aiController.careerAdvice);
router.post('/interview-prep', verifyToken, aiController.interviewPrep);
router.post('/salary', verifyToken, aiController.salaryInsights);
router.post('/learning-path', verifyToken, aiController.learningPath);

// Resume AI
router.get('/analyze-resume/:id', verifyToken, aiController.analyzeResumeAI);
router.post('/match-job', verifyToken, aiController.matchJobAI);

// Recruiter AI
router.get('/rank-candidates/:jobId', verifyToken, authorize('recruiter', 'admin'), aiController.rankCandidatesHandler);
router.post('/compare-candidates', verifyToken, authorize('recruiter', 'admin'), aiController.compareCandidates);
router.get('/candidate-summary/:userId', verifyToken, authorize('recruiter', 'admin'), aiController.candidateSummary);

export default router;
