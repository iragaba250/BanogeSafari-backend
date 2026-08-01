import { Router } from 'express';
import {
  getSettings,
  updateSetting,
  updateSettings,
} from '../controllers/settingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getSettings);
router.put('/', protect, admin, updateSetting);
router.put('/bulk', protect, admin, updateSettings);

export default router;
