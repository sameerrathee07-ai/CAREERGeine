import { db, Timestamp } from '../config/firebase.js';
import { queryDocuments } from '../services/firestore.js';
import { sendNotification } from '../services/email.js';
import logger from '../services/logger.js';
import { BadRequestError } from '../utils/errors.js';
import { createAuditLog } from '../utils/helpers.js';

export async function submitContact(req, res, next) {
  try {
    const { name, email, subject, message, category } = req.body;

    if (!name || !name.trim()) throw new BadRequestError('Name is required');
    if (!email || !email.trim()) throw new BadRequestError('Email is required');
    if (!message || !message.trim()) throw new BadRequestError('Message is required');

    const contact = {
      name: name.trim(),
      email: email.trim(),
      subject: (subject || '').trim(),
      message: message.trim(),
      category: category || 'general',
      status: 'unread',
      userId: req.user?.uid || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const ref = await db.collection('contacts').add(contact);

    // Notify admins
    const adminSnap = await db.collection('users').where('role', '==', 'admin').get();
    const batch = db.batch();
    adminSnap.docs.forEach((admin) => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        userId: admin.id,
        type: 'new_contact',
        title: 'New Contact Form Submission',
        message: `${contact.name} sent: ${contact.subject || '(no subject)'}`,
        relatedId: ref.id,
        read: false,
        createdAt: Timestamp.now(),
      });
    });
    await batch.commit();

    logger.info(`Contact form submitted: ${ref.id} from ${email}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user?.uid || 'anonymous', action: 'contact.submit', resource: 'contacts',
      resourceId: ref.id, req,
    }));

    res.status(201).json({ success: true, data: { id: ref.id, ...contact, userId: undefined } });
  } catch (err) {
    next(err);
  }
}

export async function listContacts(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filters = [];
    if (status) filters.push({ type: 'where', field: 'status', op: '==', value: status });

    const result = await queryDocuments({
      collection: 'contacts',
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

export async function updateContactStatus(req, res, next) {
  try {
    const { status, response } = req.body;
    if (!['unread', 'read', 'replied', 'closed'].includes(status)) {
      throw new BadRequestError('Invalid status. Must be: unread, read, replied, or closed');
    }

    const ref = db.collection('contacts').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
    }

    const updates = { status, updatedAt: Timestamp.now() };
    if (response) updates.adminResponse = response;

    await ref.update(updates);

    logger.info(`Contact ${req.params.id} -> ${status} by admin ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'contact.updateStatus', resource: 'contacts',
      resourceId: req.params.id, details: { status }, req,
    }));

    res.json({ success: true, data: { id: req.params.id, ...doc.data(), ...updates } });
  } catch (err) {
    next(err);
  }
}
