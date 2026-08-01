import { Router } from 'express';
import {
  signup,
  login,
  getMe,
  getUsers,
  getNewUsersCount,
  deleteUser,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/change-password', protect, admin, changePassword);
router.get('/me', protect, getMe);
router.get('/users', protect, admin, getUsers);
router.get('/users/count', protect, admin, getNewUsersCount);
router.delete('/users/:id', protect, admin, validateObjectId, deleteUser);

export default router;
