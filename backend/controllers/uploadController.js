import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import Setting from '../models/Setting.js';
import { errorResponse } from '../utils/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const sanitizePrefix = (value) => {
  const clean = String(value || 'image')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40);
  return clean || 'image';
};

const buildUrl = async (req) => {
  if (!req.file?.buffer) return null;

  const prefix = sanitizePrefix(req.query.prefix);

  if (cloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'banoge-safari',
        public_id: `${prefix}-${Date.now()}`,
        resource_type: 'image',
        overwrite: true,
      }
    );
    return result.secure_url;
  }

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  const ext = path.extname(req.file.originalname).toLowerCase();
  const filename = `${prefix}-${Date.now()}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
  return `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/${filename}`;
};

const validIndex = (value) => {
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 ? index : -1;
};

export const uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const url = await buildUrl(req);

    const setting = await Setting.findOne({ key: 'heroImages' });
    const images = setting?.value || [];
    images.push(url);

    await Setting.findOneAndUpdate(
      { key: 'heroImages' },
      { value: images },
      { upsert: true }
    );

    res.json({ url, images, message: 'Image uploaded' });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const uploadTourImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const url = await buildUrl(req);
    res.json({ url, message: 'Image uploaded' });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const url = await buildUrl(req);

    const setting = await Setting.findOne({ key: 'galleryImages' });
    const images = setting?.value || [];
    images.push(url);

    await Setting.findOneAndUpdate(
      { key: 'galleryImages' },
      { value: images },
      { upsert: true }
    );

    res.json({ url, images, message: 'Image uploaded' });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const removeGalleryImage = async (req, res) => {
  try {
    const index = validIndex(req.params.index);
    const setting = await Setting.findOne({ key: 'galleryImages' });
    const images = setting?.value || [];

    if (index < 0 || index >= images.length) {
      return res.status(400).json({ message: 'Invalid index' });
    }

    images.splice(index, 1);

    await Setting.findOneAndUpdate(
      { key: 'galleryImages' },
      { value: images },
      { upsert: true }
    );

    res.json({ images, message: 'Image removed' });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const removeHeroImage = async (req, res) => {
  try {
    const index = validIndex(req.params.index);
    const setting = await Setting.findOne({ key: 'heroImages' });
    const images = setting?.value || [];

    if (index < 0 || index >= images.length) {
      return res.status(400).json({ message: 'Invalid index' });
    }

    images.splice(index, 1);

    await Setting.findOneAndUpdate(
      { key: 'heroImages' },
      { value: images },
      { upsert: true }
    );

    res.json({ images, message: 'Image removed' });
  } catch (error) {
    errorResponse(res, error);
  }
};
