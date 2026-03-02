// middleware/upload.ts (or utilities/multerutilit.ts)
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Memory storage for Cloudinary
const storage = multer.memoryStorage();

// File filter with proper typing - FIXED: Removed 'any' type
const fileFilter = (
  req: Request, 
  file: Express.Multer.File, 
  cb: FileFilterCallback
): void => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// Single file upload middleware
export const uploadSingle = upload.single('image');