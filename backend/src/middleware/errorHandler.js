import { AppError } from '../utils/errors.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    const body = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.errors) body.error.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }

  if (err.code === 'permission-denied' || err.code === 7) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied' },
    });
  }

  if (err.code === 'not-found' || err.code === 5) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Resource not found' },
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}
