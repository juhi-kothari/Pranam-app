import { Router } from 'express';
import { authenticate, requireAdmin } from '@/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.use(requireAdmin);

// TODO: Implement user management routes for admin
// GET /users - List all users
// GET /users/:id - Get user by ID
// PUT /users/:id - Update user
// DELETE /users/:id - Delete user
// PUT /users/:id/activate - Activate user
// PUT /users/:id/deactivate - Deactivate user

export default router;
