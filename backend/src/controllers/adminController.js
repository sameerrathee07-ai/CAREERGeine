import { auth, db, Timestamp } from '../config/firebase.js';
import { getDocument, updateDocument, queryDocuments } from '../services/firestore.js';
import { sendNotification, sendAccountSuspendedEmail, sendRecruiterApprovedEmail } from '../services/email.js';
import logger from '../services/logger.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { createAuditLog } from '../utils/helpers.js';

export async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filters = [];

    if (role) filters.push({ type: 'where', field: 'role', op: '==', value: role });

    const result = await queryDocuments({
      collection: 'users',
      filters,
      sort: 'createdAt',
      order: 'desc',
      page: parseInt(page),
      limit: parseInt(limit),
    });

    let data = result.data;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }

    // Remove sensitive fields
    data = data.map(({ password, ...rest }) => rest);

    res.json({ success: true, data, pagination: { ...result.pagination, total: data.length } });
  } catch (err) {
    next(err);
  }
}

export async function getUserDetail(req, res, next) {
  try {
    const user = await getDocument('users', req.params.id);
    const { password, ...safe } = user;

    const [resumesSnap, appsSnap] = await Promise.all([
      db.collection('resumes').where('userId', '==', req.params.id).get(),
      db.collection('applications').where('userId', '==', req.params.id).get(),
    ]);

    res.json({
      success: true,
      data: {
        ...safe,
        stats: {
          ...safe.stats,
          resumes: resumesSnap.size,
          applications: appsSnap.size,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['student', 'recruiter', 'admin'].includes(role)) {
      throw new BadRequestError('Invalid role. Must be: student, recruiter, or admin');
    }

    await auth.setCustomUserClaims(req.params.id, { role });
    const updated = await updateDocument('users', req.params.id, { role });

    await sendNotification({
      userId: req.params.id,
      type: 'role_changed',
      title: 'Account Role Updated',
      message: `Your CareerGenie role has been changed to "${role}".`,
    });

    logger.info(`User role updated: ${req.params.id} -> ${role} by admin ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'admin.updateUserRole', resource: 'users',
      resourceId: req.params.id, details: { newRole: role }, req,
    }));

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function suspendUser(req, res, next) {
  try {
    await auth.updateUser(req.params.id, { disabled: true });

    await sendNotification({
      userId: req.params.id,
      type: 'account_suspended',
      title: 'Account Suspended',
      message: 'Your CareerGenie account has been suspended. Contact support for details.',
    });

    try {
      const userDoc = await db.collection('users').doc(req.params.id).get();
      if (userDoc.exists) {
        const user = userDoc.data();
        await sendAccountSuspendedEmail(user.email, user.name || 'User');
      }
    } catch { /* non-blocking */ }

    logger.warn(`User suspended: ${req.params.id} by admin ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'admin.suspendUser', resource: 'users',
      resourceId: req.params.id, req,
    }));

    res.json({ success: true, message: 'User suspended successfully' });
  } catch (err) {
    next(err);
  }
}

export async function activateUser(req, res, next) {
  try {
    await auth.updateUser(req.params.id, { disabled: false });

    await sendNotification({
      userId: req.params.id,
      type: 'account_activated',
      title: 'Account Activated',
      message: 'Your CareerGenie account has been reactivated.',
    });

    logger.info(`User activated: ${req.params.id} by admin ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'admin.activateUser', resource: 'users',
      resourceId: req.params.id, req,
    }));

    res.json({ success: true, message: 'User activated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function approveRecruiter(req, res, next) {
  try {
    const user = await getDocument('users', req.params.id);
    if (user.role !== 'recruiter') {
      throw new BadRequestError('User is not a recruiter');
    }

    await updateDocument('users', req.params.id, { 'company.verified': true });

    await sendNotification({
      userId: req.params.id,
      type: 'recruiter_approved',
      title: 'Recruiter Account Approved',
      message: 'Your recruiter account has been approved. You can now post jobs and manage candidates.',
    });

    try {
      await sendRecruiterApprovedEmail(user.email, user.name || 'User');
    } catch { /* non-blocking */ }

    logger.info(`Recruiter approved: ${req.params.id} by admin ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'admin.approveRecruiter', resource: 'users',
      resourceId: req.params.id, req,
    }));

    res.json({ success: true, message: 'Recruiter approved successfully' });
  } catch (err) {
    next(err);
  }
}

export async function moderateJob(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'flagged', 'closed'].includes(status)) {
      throw new BadRequestError('Invalid status. Must be: active, flagged, or closed');
    }

    const job = await getDocument('jobs', req.params.id);
    const updated = await updateDocument('jobs', req.params.id, { status });

    await sendNotification({
      userId: job.recruiterId,
      type: 'job_moderated',
      title: `Job Posting ${status}`,
      message: `Your job "${job.title}" has been ${status} by an admin.`,
    });

    logger.info(`Job moderated: ${req.params.id} -> ${status} by admin ${req.user.uid}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'admin.moderateJob', resource: 'jobs',
      resourceId: req.params.id, details: { status }, req,
    }));

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      usersCount, recruitersCount, studentsCount,
      jobsCount, activeJobsCount, resumesCount, appsCount,
      monthlyUsersSnap,
      completedResumesSnap,
    ] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('users').where('role', '==', 'recruiter').count().get(),
      db.collection('users').where('role', '==', 'student').count().get(),
      db.collection('jobs').count().get(),
      db.collection('jobs').where('status', '==', 'active').count().get(),
      db.collection('resumes').count().get(),
      db.collection('applications').count().get(),
      db.collection('users').where('createdAt', '>=', Timestamp.fromDate(sixMonthsAgo)).orderBy('createdAt', 'asc').get(),
      db.collection('resumes').where('status', '==', 'completed').limit(100).get(),
    ]);

    // Monthly growth
    const monthlyGrowth = {};
    monthlyUsersSnap.docs.forEach((d) => {
      const date = d.data().createdAt?.toDate() || new Date();
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyGrowth[key] = (monthlyGrowth[key] || 0) + 1;
    });

    // Top skills
    const skillCount = {};
    completedResumesSnap.docs.forEach((d) => {
      (d.data().analysis?.skills || []).forEach((s) => {
        skillCount[s] = (skillCount[s] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count }));

    // Application status distribution
    const appsSnap = await db.collection('applications').get();
    const appStatusDist = { pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 };
    appsSnap.docs.forEach((d) => {
      const s = d.data().status;
      if (appStatusDist[s] !== undefined) appStatusDist[s]++;
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: usersCount.data().count,
          students: studentsCount.data().count,
          recruiters: recruitersCount.data().count,
          totalJobs: jobsCount.data().count,
          activeJobs: activeJobsCount.data().count,
          totalResumes: resumesCount.data().count,
          totalApplications: appsCount.data().count,
        },
        monthlyGrowth,
        topSkills,
        applicationStatusDistribution: appStatusDist,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await queryDocuments({
      collection: 'auditLogs',
      filters: [],
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

export async function updatePlatformSettings(req, res, next) {
  try {
    const settingsRef = db.collection('settings').doc('platform');
    const doc = await settingsRef.get();
    const data = { ...req.body, updatedAt: Timestamp.now(), updatedBy: req.user.uid };

    if (!doc.exists) {
      await settingsRef.set({ ...data, createdAt: Timestamp.now() });
    } else {
      await settingsRef.update(data);
    }

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'admin.updateSettings', resource: 'settings',
      resourceId: 'platform', details: { updated: Object.keys(req.body) }, req,
    }));

    res.json({ success: true, message: 'Platform settings updated' });
  } catch (err) {
    next(err);
  }
}

export async function getPlatformSettings(req, res, next) {
  try {
    const doc = await db.collection('settings').doc('platform').get();
    res.json({ success: true, data: doc.exists ? doc.data() : {} });
  } catch (err) {
    next(err);
  }
}
