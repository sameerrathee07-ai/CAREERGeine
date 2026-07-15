import { body, param, query } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('role').isIn(['student', 'recruiter']).withMessage('Role must be student or recruiter'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const forgotPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
];

export const resetPasswordValidator = [
  body('code').notEmpty().withMessage('Reset code required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const updateProfileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('phone').optional().trim(),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

export const createJobValidator = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('type').isIn(['full-time', 'part-time', 'contract', 'internship', 'remote']).withMessage('Invalid job type'),
  body('experienceLevel').isIn(['entry', 'mid', 'senior', 'lead']).withMessage('Invalid experience level'),
  body('salary').optional().trim(),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill required'),
  body('requirements').optional().isArray(),
  body('responsibilities').optional().isArray(),
];

export const updateJobValidator = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  body('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'lead']),
  body('skills').optional().isArray({ min: 1 }),
];

export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort').optional().isIn(['createdAt', 'updatedAt', 'title', 'matchScore', 'applicationsCount']),
  query('order').optional().isIn(['asc', 'desc']),
];

export const mongoIdValidator = [
  param('id').isString().notEmpty().withMessage('Valid ID required'),
];
