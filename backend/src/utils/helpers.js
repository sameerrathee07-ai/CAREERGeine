import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from '../config/firebase.js';

export function generateId() {
  return uuidv4();
}

export function now() {
  return Timestamp.now();
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export function buildPaginationQuery({ page = 1, limit = 20, sort = 'createdAt', order = 'desc' }) {
  return { page: Math.max(1, page), limit: Math.min(100, Math.max(1, limit)), sort, order };
}

export function paginatedResponse(docs, total, { page, limit }) {
  return {
    data: docs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export function createAuditLog({ userId, action, resource, resourceId, details, req }) {
  return {
    userId: userId || null,
    action,
    resource,
    resourceId: resourceId || null,
    details: details || {},
    ip: req?.ip || null,
    userAgent: req?.get('user-agent') || null,
    createdAt: now(),
  };
}

export function calculateMatchScore(resumeSkills = [], jobSkills = []) {
  if (!resumeSkills.length || !jobSkills.length) return 0;
  const normalizedResume = resumeSkills.map((s) => s.toLowerCase().trim());
  const normalizedJob = jobSkills.map((s) => s.toLowerCase().trim());
  const matches = normalizedJob.filter((s) => normalizedResume.includes(s));
  return Math.round((matches.length / normalizedJob.length) * 100);
}

export function generateNotification(type, title, message, data = {}) {
  return { type, title, message, data, read: false, createdAt: now() };
}
