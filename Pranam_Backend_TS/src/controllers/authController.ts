import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '@/models';
import { generateTokenPair, verifyRefreshToken } from '@/utils/jwt';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse, AuthResponse, LoginCredentials, RegisterData } from '@/types';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  const { name, email, password }: RegisterData = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError('User already exists with this email', 400);
    }

    // Create new user
    const user = new User({
      name: name?.trim() || '',
      email: email.toLowerCase().trim(),
      password,
    });

    await user.save();

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`New user registered: ${user.email}`);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: accessToken, // Frontend expects 'token'
        accessToken,
        refreshToken,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  const { email, password }: LoginCredentials = req.body;

  try {
    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: accessToken, // Frontend expects 'token'
        accessToken,
        refreshToken,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new CustomError('Refresh token is required', 400);
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new CustomError('Invalid refresh token', 401);
    }

    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(tokenPayload);

    // Replace old refresh token with new one
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens[tokenIndex] = newRefreshToken;
    await user.save();

    const response: ApiResponse<{ accessToken: string; refreshToken: string }> = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken && req.user) {
      // Remove refresh token from user
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
      }
    }

    logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.json(response);
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: user.profile,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  const { name } = req.body;

  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Update fields
    if (name !== undefined) {
      user.name = name.trim();
    }

    await user.save();

    logger.info(`User profile updated: ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: user.profile,
    };

    res.json(response);
  } catch (error) {
    logger.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new CustomError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    
    // Clear all refresh tokens to force re-login
    user.refreshTokens = [];
    
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully. Please login again.',
    };

    res.json(response);
  } catch (error) {
    logger.error('Change password error:', error);
    throw error;
  }
};
