import { Router } from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.get('/', getPosts);
router.get('/:id', validateObjectId, getPost);
router.post('/', protect, admin, createPost);
router.put('/:id', protect, admin, validateObjectId, updatePost);
router.delete('/:id', protect, admin, validateObjectId, deletePost);

export default router;
