import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const makeStorage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destination = path.join('uploads', folder);
      ensureDir(destination);
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
      cb(null, `${Date.now()}-${safeName}`);
    }
  });

const imageFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const resumeFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only PDF or Word resume files are allowed'));
};

export const uploadProjectImage = multer({
  storage: makeStorage('projects'),
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024 }
});

export const uploadResume = multer({
  storage: makeStorage('resumes'),
  fileFilter: resumeFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
