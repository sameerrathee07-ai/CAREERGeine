import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import * as feedbackController from '../controllers/feedbackController.js';

const router = Router();

router.post('/', verifyToken, feedbackController.submitFeedback);
router.get('/', verifyToken, feedbackController.getMyFeedback);
router.patch('/:id/status', verifyToken, authorize('admin'), feedbackController.updateFeedbackStatus);

export default router;
