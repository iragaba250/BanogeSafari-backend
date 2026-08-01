import { Router } from 'express';
import {
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
} from '../controllers/tourController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.get('/', getTours);
router.get('/:id', validateObjectId, getTour);
router.post('/', protect, admin, createTour);
router.put('/:id', protect, admin, validateObjectId, updateTour);
router.delete('/:id', protect, admin, validateObjectId, deleteTour);

export default router;
