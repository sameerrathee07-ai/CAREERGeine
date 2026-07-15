import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import * as applicationController from '../controllers/applicationController.js';

const router = Router();

router.post('/', verifyToken, authorize('student'), applicationController.createApplication);
router.get('/', verifyToken, applicationController.listApplications);
router.get('/:id', verifyToken, applicationController.getApplication);
router.patch('/:id/status', verifyToken, authorize('recruiter', 'admin'), applicationController.updateApplicationStatus);
router.post('/:id/shortlist', verifyToken, authorize('recruiter', 'admin'), applicationController.shortlistCandidate);

export default router;
