import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = {
    resume: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    avatar: ['image/jpeg', 'image/png', 'image/webp'],
  };

  const type = req.uploadType || 'resume';
  const allowed = allowedMimes[type] || [];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Allowed: ${allowed.join(', ')}`), false);
  }
};

export const uploadResume = multer({
  storage,
  fileFilter: (req, file, cb) => {
    req.uploadType = 'resume';
    fileFilter(req, file, cb);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('resume');

export const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    req.uploadType = 'avatar';
    fileFilter(req, file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('avatar');

export function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new BadRequestError('File too large'));
    }
    return next(new BadRequestError(err.message));
  }
  next(err);
}
