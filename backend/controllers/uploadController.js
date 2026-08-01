import Setting from '../models/Setting.js';
import { errorResponse } from '../utils/errorHandler.js';

const buildUrl = (filename) =>
  `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/${filename}`;

const validIndex = (value) => {
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 ? index : -1;
};

export const uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const url = buildUrl(req.file.filename);

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

    const url = buildUrl(req.file.filename);
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

    const url = buildUrl(req.file.filename);

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
