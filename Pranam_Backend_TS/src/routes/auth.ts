import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
} from '@/controllers/authController';
import { authenticate, authRateLimit } from '@/middleware/auth';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from '@/utils/validation';

const router = Router();

// Public routes
router.post('/register', authRateLimit(5, 15 * 60 * 1000), registerValidation, register);
router.post('/login', authRateLimit(5, 15 * 60 * 1000), loginValidation, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);

export default router;
