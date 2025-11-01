import { Router } from 'express';
import {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  getCategories,
  getAuthors,
  getFeaturedPublications,
  getRelatedPublications,
} from '@/controllers/publicationController';
import { authenticate, requireAdmin, optionalAuth } from '@/middleware/auth';
import {
  createPublicationValidation,
  updatePublicationValidation,
  mongoIdValidation,
  paginationValidation,
} from '@/utils/validation';

const router = Router();

// Public routes
router.get('/', paginationValidation, getPublications);
router.get('/categories', getCategories);
router.get('/authors', getAuthors);
router.get('/featured', getFeaturedPublications);
router.get('/:id', mongoIdValidation, getPublicationById);
router.get('/:id/related', mongoIdValidation, getRelatedPublications);

// Admin only routes
router.use(authenticate, requireAdmin);

router.post('/', createPublicationValidation, createPublication);
router.put('/:id', mongoIdValidation, updatePublicationValidation, updatePublication);
router.delete('/:id', mongoIdValidation, deletePublication);

export default router;
