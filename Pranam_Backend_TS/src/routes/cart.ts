import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
} from '@/controllers/cartController';
import { authenticate } from '@/middleware/auth';
import { mongoIdValidation } from '@/utils/validation';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Cart validation schemas
const addToCartValidation = [
  body('publicationId')
    .isMongoId()
    .withMessage('Invalid publication ID'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
];

const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 0, max: 10 })
    .withMessage('Quantity must be between 0 and 10'),
];

// Routes
router.get('/', getCart);
router.get('/count', getCartItemCount);
router.post('/add', addToCartValidation, addToCart);
router.put('/item/:publicationId', mongoIdValidation, updateCartItemValidation, updateCartItem);
router.delete('/item/:publicationId', mongoIdValidation, removeFromCart);
router.delete('/clear', clearCart);

export default router;
