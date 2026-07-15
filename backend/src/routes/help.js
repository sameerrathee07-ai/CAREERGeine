import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import * as helpController from '../controllers/helpController.js';

const router = Router();

router.post('/', verifyToken, authorize('admin'), helpController.createArticle);
router.get('/', helpController.listArticles);
router.get('/:id', helpController.getArticle);
router.put('/:id', verifyToken, authorize('admin'), helpController.updateArticle);
router.delete('/:id', verifyToken, authorize('admin'), helpController.deleteArticle);
router.post('/:id/feedback', helpController.markHelpful);

export default router;
