import { ForbiddenError } from '../utils/errors.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}

export function authorizeSelfOrRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }
    const targetUid = req.params.userId || req.params.id;
    if (req.user.uid === targetUid || roles.includes(req.user.role)) {
      return next();
    }
    return next(new ForbiddenError('Insufficient permissions'));
  };
}
