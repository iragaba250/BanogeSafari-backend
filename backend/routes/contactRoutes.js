import { Router } from 'express';
import {
  createMessage,
  getMessages,
  getNewMessageCount,
  updateMessage,
  deleteMessage,
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.post('/', contactLimiter, createMessage);
router.get('/new-count', protect, admin, getNewMessageCount);
router.get('/', protect, admin, getMessages);
router.put('/:id', protect, admin, validateObjectId, updateMessage);
router.delete('/:id', protect, admin, validateObjectId, deleteMessage);

export default router;
