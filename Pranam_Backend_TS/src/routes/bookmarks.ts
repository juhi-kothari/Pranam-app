import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  toggleBookmark,
  checkBookmark,
  getBookmarkCount,
  getPopularPublications,
  clearBookmarks,
} from '@/controllers/bookmarkController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { mongoIdValidation, paginationValidation } from '@/utils/validation';

const router = Router();

// Public routes
router.get('/popular', getPopularPublications);

// Protected routes
router.use(authenticate);

// Bookmark validation schemas
const bookmarkValidation = [
  body('publicationId')
    .isMongoId()
    .withMessage('Invalid publication ID'),
];

// Routes
router.get('/', paginationValidation, getUserBookmarks);
router.get('/count', getBookmarkCount);
router.post('/', bookmarkValidation, addBookmark);
router.post('/toggle', bookmarkValidation, toggleBookmark);
router.get('/check/:publicationId', mongoIdValidation, checkBookmark);
router.delete('/clear', clearBookmarks);
router.delete('/:publicationId', mongoIdValidation, removeBookmark);

export default router;
