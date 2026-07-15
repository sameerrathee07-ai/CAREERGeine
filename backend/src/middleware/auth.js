import { auth } from '../config/firebase.js';
import { db } from '../config/firebase.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      throw new UnauthorizedError('User not found');
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified || false,
      role: userDoc.data().role,
      ...userDoc.data(),
    };

    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return next(new UnauthorizedError('Token expired'));
    }
    if (error.code === 'auth/argument-error') {
      return next(new UnauthorizedError('Invalid token'));
    }
    if (error.isOperational) return next(error);
    return next(new UnauthorizedError('Authentication failed'));
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.exists) {
      req.user = { uid: decoded.uid, email: decoded.email, role: userDoc.data().role, ...userDoc.data() };
    }
    next();
  } catch {
    next();
  }
}
