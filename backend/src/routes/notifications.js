import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();

router.get('/', verifyToken, notificationController.listNotifications);
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);
router.patch('/:id/read', verifyToken, notificationController.markAsRead);
router.patch('/read-all', verifyToken, notificationController.markAllAsRead);

export default router;
