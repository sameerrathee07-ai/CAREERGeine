import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ValidationError(formatted));
  }
  next();
}
