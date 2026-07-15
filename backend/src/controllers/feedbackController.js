import { db, Timestamp } from '../config/firebase.js';
import { queryDocuments } from '../services/firestore.js';
import logger from '../services/logger.js';
import { BadRequestError } from '../utils/errors.js';
import { createAuditLog } from '../utils/helpers.js';

export async function submitFeedback(req, res, next) {
  try {
    const { type, category, subject, message, rating } = req.body;

    if (!message || !message.trim()) throw new BadRequestError('Message is required');
    if (type && !['bug', 'feature', 'improvement', 'general'].includes(type)) {
      throw new BadRequestError('Invalid type. Must be: bug, feature, improvement, or general');
    }

    const feedback = {
      userId: req.user.uid,
      email: req.user.email || '',
      type: type || 'general',
      category: category || '',
      subject: subject || '',
      message: message.trim(),
      rating: rating || null,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const ref = await db.collection('feedback').add(feedback);

    logger.info(`Feedback submitted: ${ref.id} by user ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'feedback.submit', resource: 'feedback',
      resourceId: ref.id, req,
    }));

    res.status(201).json({ success: true, data: { id: ref.id, ...feedback } });
  } catch (err) {
    next(err);
  }
}

export async function getMyFeedback(req, res, next) {
  try {
    const snap = await db.collection('feedback')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listFeedback(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filters = [{ type: 'where', field: 'userId', op: '==', value: req.user.uid }];
    if (status) filters.push({ type: 'where', field: 'status', op: '==', value: status });

    const result = await queryDocuments({
      collection: 'feedback',
      filters,
      sort: 'createdAt',
      order: 'desc',
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function updateFeedbackStatus(req, res, next) {
  try {
    const { status, adminNote } = req.body;
    if (!['pending', 'reviewed', 'addressed', 'closed'].includes(status)) {
      throw new BadRequestError('Invalid status. Must be: pending, reviewed, addressed, or closed');
    }

    const ref = db.collection('feedback').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback not found' } });
    }

    const updates = { status, updatedAt: Timestamp.now() };
    if (adminNote) updates.adminNote = adminNote;

    await ref.update(updates);

    logger.info(`Feedback ${req.params.id} -> ${status} by admin ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'feedback.updateStatus', resource: 'feedback',
      resourceId: req.params.id, details: { status }, req,
    }));

    res.json({ success: true, data: { id: req.params.id, ...doc.data(), ...updates } });
  } catch (err) {
    next(err);
  }
}
