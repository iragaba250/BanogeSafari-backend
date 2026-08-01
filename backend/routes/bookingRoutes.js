import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getPendingCount,
  getStats,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.post('/', protect, createBooking);
router.get('/mine', protect, getMyBookings);
router.get('/stats', protect, admin, getStats);
router.get('/pending-count', protect, admin, getPendingCount);
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, validateObjectId, updateBookingStatus);
router.put('/:id/cancel', protect, validateObjectId, cancelBooking);

export default router;
