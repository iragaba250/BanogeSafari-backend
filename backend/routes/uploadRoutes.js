import { Router } from 'express';
import { upload, handleUploadError } from '../middleware/upload.js';
import {
  uploadHeroImage,
  uploadTourImage,
  uploadGalleryImage,
  removeHeroImage,
  removeGalleryImage,
} from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/hero', protect, admin, upload.single('image'), handleUploadError, uploadHeroImage);
router.post('/tour', protect, admin, upload.single('image'), handleUploadError, uploadTourImage);
router.post('/gallery', protect, admin, upload.single('image'), handleUploadError, uploadGalleryImage);
router.delete('/hero/:index', protect, admin, removeHeroImage);
router.delete('/gallery/:index', protect, admin, removeGalleryImage);

export default router;
