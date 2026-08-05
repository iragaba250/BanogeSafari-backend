import multer from 'multer';
import path from 'path';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const ALLOWED_MIME_PREFIX = 'image/';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = (file.mimetype || '').startsWith(ALLOWED_MIME_PREFIX);
  if (ALLOWED_EXTENSIONS.includes(ext) && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WebP, and AVIF images are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};
