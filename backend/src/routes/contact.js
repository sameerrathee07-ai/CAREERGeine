import { Router } from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import * as contactController from '../controllers/contactController.js';

const router = Router();

router.post('/', optionalAuth, contactController.submitContact);
router.get('/', verifyToken, authorize('admin'), contactController.listContacts);
router.patch('/:id/status', verifyToken, authorize('admin'), contactController.updateContactStatus);

export default router;
