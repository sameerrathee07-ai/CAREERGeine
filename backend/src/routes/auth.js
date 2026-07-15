import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerValidator, forgotPasswordValidator } from '../utils/validators.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/signup', registerValidator, validate, authController.signup);
router.post('/google', authController.googleSignIn);
router.post('/set-role', verifyToken, authController.setUserRole);
router.post('/verify-token', authController.verifyIdToken);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/send-verification', verifyToken, authController.sendVerificationEmail);
router.get('/profile', verifyToken, authController.getProfile);
router.delete('/account', verifyToken, authController.deleteAccount);

export default router;
