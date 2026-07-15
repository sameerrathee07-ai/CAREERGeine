import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileValidator, changePasswordValidator } from '../utils/validators.js';
import { uploadAvatar, handleMulterError } from '../middleware/upload.js';
import * as userController from '../controllers/userController.js';

const router = Router();

router.put('/profile', verifyToken, updateProfileValidator, validate, userController.updateProfile);
router.post('/avatar', verifyToken, uploadAvatar, handleMulterError, userController.uploadAvatar);
router.put('/password', verifyToken, changePasswordValidator, validate, userController.changePassword);
router.put('/preferences', verifyToken, userController.updatePreferences);
router.get('/activity', verifyToken, userController.getActivityHistory);
router.get('/export', verifyToken, userController.exportData);

export default router;
