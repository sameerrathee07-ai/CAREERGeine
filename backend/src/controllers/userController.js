import { auth, db, Timestamp } from '../config/firebase.js';
import { getDocumentOpt, updateDocument } from '../services/firestore.js';
import { uploadFile, deleteFile } from '../services/storage.js';
import { sendNotification, sendPasswordChangedEmail } from '../services/email.js';
import logger from '../services/logger.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { createAuditLog } from '../utils/helpers.js';

export async function updateProfile(req, res, next) {
  try {
    const { name, bio, phone } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    if (Object.keys(updates).length === 0) {
      throw new BadRequestError('No fields to update');
    }

    const user = await updateDocument('users', req.user.uid, updates);

    if (name) {
      await auth.updateUser(req.user.uid, { displayName: name.trim() });
    }

    logger.info(`Profile updated: ${req.user.uid}`);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) throw new BadRequestError('No image file provided');
    if (!req.file.mimetype.startsWith('image/')) throw new BadRequestError('File must be an image (JPEG, PNG, WebP)');

    const user = await getDocumentOpt('users', req.user.uid);
    if (user?.avatarUrl) {
      await deleteFile(user.avatarUrl).catch(() => {});
    }

    const { url } = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'avatars');
    const updated = await updateDocument('users', req.user.uid, { avatarUrl: url });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters');
    }

    await auth.updateUser(req.user.uid, { password: newPassword });

    // Send notification
    await sendNotification({
      userId: req.user.uid,
      type: 'security',
      title: 'Password Changed',
      message: 'Your CareerGenie password was successfully changed.',
    });

    // Send email notification
    try {
      const user = await getDocumentOpt('users', req.user.uid);
      if (user?.email) {
        await sendPasswordChangedEmail(user.email, user.name || 'User');
      }
    } catch { /* non-blocking */ }

    logger.info(`Password changed: ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'user.changePassword', resource: 'users',
      resourceId: req.user.uid, req,
    }));

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const { notifications, privacy } = req.body;
    const user = await getDocumentOpt('users', req.user.uid);
    if (!user) throw new NotFoundError('User not found');

    const prefs = {
      notifications: { ...user.preferences?.notifications, ...notifications },
      privacy: { ...user.preferences?.privacy, ...privacy },
    };

    const updated = await updateDocument('users', req.user.uid, { preferences: prefs });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function getActivityHistory(req, res, next) {
  try {
    const snap = await db.collection('auditLogs')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const activities = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
}

export async function exportData(req, res, next) {
  try {
    const collections = ['users', 'resumes', 'applications', 'notifications', 'savedJobs'];
    const data = {};

    for (const coll of collections) {
      const snap = await db.collection(coll).where('userId', '==', req.user.uid).get();
      data[coll] = snap.docs.map((d) => {
        const doc = { id: d.id, ...d.data() };
        // Remove sensitive fields
        delete doc.password;
        return doc;
      });
    }

    // Include jobs for recruiter
    const jobsSnap = await db.collection('jobs').where('recruiterId', '==', req.user.uid).get();
    data.jobs = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    res.json({
      success: true,
      data,
      metadata: { exportedAt: new Date().toISOString(), userId: req.user.uid },
    });
  } catch (err) {
    next(err);
  }
}
