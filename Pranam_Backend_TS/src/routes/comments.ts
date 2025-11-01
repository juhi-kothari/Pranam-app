import { Router } from 'express';
import {
  getCommentsByBlog,
  createComment,
  approveComment,
  deleteComment,
  getPendingComments,
  getCommentStats,
} from '@/controllers/commentController';
import { authenticate, requireAdmin, optionalAuth } from '@/middleware/auth';
import {
  createCommentValidation,
  mongoIdValidation,
  paginationValidation,
} from '@/utils/validation';

const router = Router();

// Public routes (with optional auth)
router.get('/blog/:blogId', optionalAuth, mongoIdValidation, paginationValidation, getCommentsByBlog);
router.post('/', optionalAuth, createCommentValidation, createComment);

// Admin only routes
router.use(authenticate, requireAdmin);

router.get('/pending', paginationValidation, getPendingComments);
router.get('/stats', getCommentStats);
router.put('/:id/approve', mongoIdValidation, approveComment);
router.delete('/:id', mongoIdValidation, deleteComment);

export default router;
