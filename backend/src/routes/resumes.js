import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { uploadResume, handleMulterError } from '../middleware/upload.js';
import * as resumeController from '../controllers/resumeController.js';

const router = Router();

router.post('/', verifyToken, uploadResume, handleMulterError, resumeController.uploadResume);
router.get('/', verifyToken, resumeController.listResumes);
router.get('/:id', verifyToken, resumeController.getResume);
router.delete('/:id', verifyToken, resumeController.deleteResume);
router.post('/:id/analyze', verifyToken, resumeController.analyzeResumeHandler);

export default router;
