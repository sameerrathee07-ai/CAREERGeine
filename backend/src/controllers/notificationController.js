import { db } from '../config/firebase.js';
import { queryDocuments } from '../services/firestore.js';

export async function listNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await queryDocuments({
      collection: 'notifications',
      filters: [{ type: 'where', field: 'userId', op: '==', value: req.user.uid }],
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

export async function markAsRead(req, res, next) {
  try {
    const ref = db.collection('notifications').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }
    await ref.update({ read: true });
    res.json({ success: true, data: { id: doc.id, ...doc.data(), read: true } });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user.uid)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user.uid)
      .where('read', '==', false)
      .count()
      .get();

    res.json({ success: true, data: { count: snap.data().count } });
  } catch (err) {
    next(err);
  }
}
