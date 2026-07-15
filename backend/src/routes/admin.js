import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.use(verifyToken, authorize('admin'));

// User management
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id/role', adminController.updateUserRole);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/activate', adminController.activateUser);

// Recruiter management
router.post('/recruiters/:id/approve', adminController.approveRecruiter);

// Job moderation
router.patch('/jobs/:id/moderate', adminController.moderateJob);

// Analytics & Reports
router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);

// Platform settings
router.get('/settings', adminController.getPlatformSettings);
router.put('/settings', adminController.updatePlatformSettings);

export default router;
