import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,tex,zip,png,jpg,jpeg').split(',');

// Use memory storage for Backblaze B2 uploads
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase().substring(1);

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 10
  }
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'files', maxCount: 10 }
]);