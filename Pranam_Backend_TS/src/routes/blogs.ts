import { Router } from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getCategories,
  getAuthors,
  getFeaturedBlogs,
  getRelatedBlogs,
  likeBlog,
} from '@/controllers/blogController';
import { authenticate, requireAdmin, optionalAuth } from '@/middleware/auth';
import {
  createBlogValidation,
  mongoIdValidation,
  paginationValidation,
} from '@/utils/validation';

const router = Router();

// Public routes (with optional auth for admin features)
router.get('/', optionalAuth, paginationValidation, getBlogs);
router.get('/categories', optionalAuth, getCategories);
router.get('/authors', optionalAuth, getAuthors);
router.get('/featured', optionalAuth, getFeaturedBlogs);
router.get('/:id', optionalAuth, mongoIdValidation, getBlogById);
router.get('/:id/related', optionalAuth, mongoIdValidation, getRelatedBlogs);

// Routes that require authentication
router.post('/:id/like', authenticate, mongoIdValidation, likeBlog);

// Admin only routes
router.use(authenticate, requireAdmin);

router.post('/', createBlogValidation, createBlog);
router.put('/:id', mongoIdValidation, updateBlog);
router.delete('/:id', mongoIdValidation, deleteBlog);

export default router;
