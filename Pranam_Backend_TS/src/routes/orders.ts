import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from '@/controllers/orderController';
import { authenticate, requireAdmin } from '@/middleware/auth';
import {
  createOrderValidation,
  mongoIdValidation,
  paginationValidation,
} from '@/utils/validation';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', createOrderValidation, createOrder);
router.get('/my-orders', paginationValidation, getUserOrders);
router.get('/:id', mongoIdValidation, getOrderById);
router.put('/:id/cancel', mongoIdValidation, cancelOrder);

// Admin only routes
router.use(requireAdmin);

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tracking number must be between 1 and 50 characters'),
];

router.get('/', paginationValidation, getAllOrders);
router.get('/admin/stats', getOrderStats);
router.put('/:id/status', mongoIdValidation, updateOrderStatusValidation, updateOrderStatus);

export default router;
