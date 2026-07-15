import { Router } from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createJobValidator, updateJobValidator, paginationValidator } from '../utils/validators.js';
import * as jobController from '../controllers/jobController.js';

const router = Router();

router.post('/', verifyToken, authorize('recruiter', 'admin'), createJobValidator, validate, jobController.createJob);
router.get('/', optionalAuth, jobController.listJobs);
router.get('/saved', verifyToken, authorize('student'), jobController.getSavedJobs);
router.get('/:id', optionalAuth, jobController.getJob);
router.put('/:id', verifyToken, authorize('recruiter', 'admin'), updateJobValidator, validate, jobController.updateJob);
router.delete('/:id', verifyToken, authorize('recruiter', 'admin'), jobController.deleteJob);
router.post('/:id/save', verifyToken, authorize('student'), jobController.saveJob);
router.delete('/:id/save', verifyToken, authorize('student'), jobController.unsaveJob);

export default router;
