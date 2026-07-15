import { auth, db, Timestamp } from '../config/firebase.js';
import { setDocument, getDocumentOpt, getDocument, updateDocument } from '../services/firestore.js';
import { sendNotification, sendWelcomeEmail } from '../services/email.js';
import logger from '../services/logger.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';
import { createAuditLog } from '../utils/helpers.js';

export async function signup(req, res, next) {
  try {
    const { email, password, name, role } = req.body;

    if (!['student', 'recruiter'].includes(role)) {
      throw new BadRequestError('Role must be "student" or "recruiter"');
    }

    // Get ID token from Authorization header (set by frontend interceptor)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestError('ID token is required');
    }
    const idToken = authHeader.split('Bearer ')[1];

    // Verify the token and get the UID
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Create user document in Firestore
    const userData = {
      uid,
      email,
      name: name.trim(),
      role,
      avatarUrl: null,
      emailVerified: decoded.email_verified || false,
      bio: '',
      phone: '',
      preferences: {
        notifications: { email: true },
        privacy: { showProfile: true },
      },
      stats: { resumesUploaded: 0, jobsApplied: 0, jobsSaved: 0, jobsPosted: 0 },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (role === 'recruiter') {
      userData.company = {
        name: '',
        website: '',
        size: '',
        industry: '',
        description: '',
        logoUrl: null,
        verified: false,
      };
    }

    await db.collection('users').doc(uid).set(userData);

    // Send welcome notification
    await sendNotification({
      userId: uid,
      type: 'welcome',
      title: 'Welcome to CareerGenie!',
      message: `Hi ${name}! Upload your resume to get started with AI-powered analysis.`,
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch { /* non-blocking */ }

    // Generate custom token
    const token = await auth.createCustomToken(uid);

    logger.info(`New user registered: ${uid} (${email}) as ${role}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: uid, action: 'auth.signup', resource: 'users',
      resourceId: uid, details: { email, role }, req,
    }));

    res.status(201).json({
      success: true,
      data: {
        token,
        uid,
        email,
        name,
        role,
      },
      message: 'Account created successfully. Please verify your email.',
    });
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return next(new UnauthorizedError('Session expired. Please sign in again.'));
    }
    if (err.code === 'auth/argument-error') {
      return next(new BadRequestError('Invalid token'));
    }
    next(err);
  }
}

export async function verifyIdToken(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new BadRequestError('ID token is required');

    const decoded = await auth.verifyIdToken(idToken);
    const user = await getDocumentOpt('users', decoded.uid);
    if (!user) throw new UnauthorizedError('User account not found');

    const token = await auth.createCustomToken(decoded.uid);

    res.json({
      success: true,
      data: {
        token,
        uid: decoded.uid,
        email: decoded.email,
        name: user.name,
        role: user.role,
        emailVerified: decoded.email_verified || false,
      },
    });
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return next(new UnauthorizedError('Session expired. Please sign in again.'));
    }
    next(err);
  }
}

export async function sendVerificationEmail(req, res, next) {
  try {
    const { email } = req.user;
    const link = await auth.generateEmailVerificationLink(email);
    logger.info(`Verification email sent to ${email}`);
    res.json({ success: true, message: 'Verification email sent. Check your inbox.' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    // Always return success to prevent email enumeration
    try {
      await auth.generatePasswordResetLink(email);
    } catch { /* email may not exist - don't reveal */ }

    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { code, newPassword } = req.body;
    if (!code) throw new BadRequestError('Reset code is required');
    if (!newPassword || newPassword.length < 8) throw new BadRequestError('Password must be at least 8 characters');

    // Verify the reset code against Firebase
    try {
      await auth.verifyPasswordResetCode(code);
      await auth.confirmPasswordReset(code, newPassword);
    } catch (err) {
      if (err.code === 'auth/expired-action-code') {
        throw new BadRequestError('Reset link has expired. Please request a new one.');
      }
      if (err.code === 'auth/invalid-action-code') {
        throw new BadRequestError('Invalid reset link. Please request a new one.');
      }
      throw err;
    }

    logger.info(`Password reset completed for code: ${code.substring(0, 8)}...`);

    res.json({ success: true, message: 'Password has been reset successfully. You can now sign in with your new password.' });
  } catch (err) {
    next(err);
  }
}

export async function googleSignIn(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new BadRequestError('ID token is required');

    const decoded = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    if (!email) throw new BadRequestError('Google account must have an email address');

    let userDoc = await getDocumentOpt('users', uid);
    let isNewUser = false;

    if (!userDoc) {
      isNewUser = true;

      const userData = {
        uid,
        email,
        name: name || email.split('@')[0],
        profilePhoto: picture || null,
        role: '',
        authProvider: 'google',
        emailVerified: decoded.email_verified || false,
        bio: '',
        phone: '',
        preferences: {
          notifications: { email: true },
          privacy: { showProfile: true },
        },
        stats: { resumesUploaded: 0, jobsApplied: 0, jobsSaved: 0, jobsPosted: 0 },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await db.collection('users').doc(uid).set(userData);
      userDoc = { ...userData };

      logger.info(`New Google user created: ${uid} (${email})`);
    } else {
      const updates = {};
      if (name && userDoc.name !== name) updates.name = name;
      if (picture && userDoc.profilePhoto !== picture) updates.profilePhoto = picture;
      if (userDoc.authProvider !== 'google') updates.authProvider = 'google';
      if (!userDoc.emailVerified && decoded.email_verified) updates.emailVerified = true;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Timestamp.now();
        await db.collection('users').doc(uid).update(updates);
        Object.assign(userDoc, updates);
      }
    }

    const customToken = await auth.createCustomToken(uid);

    logger.info(`Google sign-in: ${uid} (${email})`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: uid, action: isNewUser ? 'auth.googleSignUp' : 'auth.googleSignIn', resource: 'users',
      resourceId: uid, details: { email, isNewUser }, req,
    }));

    res.json({
      success: true,
      data: {
        token: customToken,
        uid,
        email,
        name: userDoc.name,
        role: userDoc.role,
        profilePhoto: userDoc.profilePhoto,
        authProvider: 'google',
        roleSet: !!userDoc.role,
        isNewUser,
      },
    });
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return next(new UnauthorizedError('Session expired. Please sign in again.'));
    }
    if (err.code === 'auth/argument-error') {
      return next(new BadRequestError('Invalid token'));
    }
    next(err);
  }
}

export async function setUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['student', 'recruiter'].includes(role)) {
      throw new BadRequestError('Role must be "student" or "recruiter"');
    }

    await updateDocument('users', req.user.uid, { role });

    await auth.setCustomUserClaims(req.user.uid, { role });

    if (role === 'recruiter') {
      await db.collection('users').doc(req.user.uid).update({
        company: {
          name: '', website: '', size: '', industry: '', description: '', logoUrl: null, verified: false,
        },
      });
    }

    await sendNotification({
      userId: req.user.uid,
      type: 'role_set',
      title: `Welcome as a ${role.charAt(0).toUpperCase() + role.slice(1)}!`,
      message: role === 'student'
        ? 'Start by uploading your resume for AI-powered analysis.'
        : 'Set up your company profile and start posting jobs.',
    });

    logger.info(`Role set for ${req.user.uid}: ${role}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'auth.setRole', resource: 'users',
      resourceId: req.user.uid, details: { role }, req,
    }));

    res.json({ success: true, data: { uid: req.user.uid, role } });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await getDocument('users', req.user.uid);
    const { password, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const uid = req.user.uid;

    // Delete Firebase Auth user
    await auth.deleteUser(uid);

    // Delete Firestore user document
    await db.collection('users').doc(uid).delete();

    // Cascade delete all user data
    const collections = ['resumes', 'applications', 'notifications', 'savedJobs'];
    for (const coll of collections) {
      const snap = await db.collection(coll).where('userId', '==', uid).get();
      if (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }

    // Delete user's jobs if recruiter
    const jobsSnap = await db.collection('jobs').where('recruiterId', '==', uid).get();
    if (!jobsSnap.empty) {
      const batch = db.batch();
      jobsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    logger.info(`Account deleted: ${uid}`);

    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (err) {
    next(err);
  }
}
