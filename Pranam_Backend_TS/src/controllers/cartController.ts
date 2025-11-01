import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Cart, Publication } from '@/models';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

/**
 * Get user's cart
 */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOrCreateForUser(req.user._id)
      .populate({
        path: 'items.publicationId',
        select: 'title author price image stock isActive',
      });

    // Filter out inactive publications or out of stock items
    const validItems = cart.items.filter(item => {
      const publication = item.publicationId as any;
      return publication && publication.isActive && publication.stock > 0;
    });

    // Update cart if items were filtered out
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const response: ApiResponse = {
      success: true,
      data: cart,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get cart error:', error);
    throw error;
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const { publicationId, quantity = 1 } = req.body;

    // Check if publication exists and is available
    const publication = await Publication.findById(publicationId);
    if (!publication) {
      throw new CustomError('Publication not found', 404);
    }

    if (!publication.isActive) {
      throw new CustomError('Publication is not available', 400);
    }

    if (!publication.isInStock(quantity)) {
      throw new CustomError('Insufficient stock', 400);
    }

    // Get or create cart
    const cart = await Cart.findOrCreateForUser(req.user._id);

    // Add item to cart
    await cart.addItem(publication._id, quantity, publication.price);

    // Populate cart items for response
    await cart.populate({
      path: 'items.publicationId',
      select: 'title author price image stock isActive',
    });

    logger.info(`Item added to cart: ${publication.title} for user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Item added to cart successfully',
      data: cart,
    };

    res.json(response);
  } catch (error) {
    logger.error('Add to cart error:', error);
    throw error;
  }
};

/**
 * Update item quantity in cart
 */
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const { publicationId } = req.params;
    const { quantity } = req.body;

    // Check if publication exists and is available
    const publication = await Publication.findById(publicationId);
    if (!publication) {
      throw new CustomError('Publication not found', 404);
    }

    if (!publication.isActive) {
      throw new CustomError('Publication is not available', 400);
    }

    if (quantity > 0 && !publication.isInStock(quantity)) {
      throw new CustomError('Insufficient stock', 400);
    }

    // Get cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new CustomError('Cart not found', 404);
    }

    // Update item quantity
    await cart.updateItemQuantity(publication._id, quantity);

    // Populate cart items for response
    await cart.populate({
      path: 'items.publicationId',
      select: 'title author price image stock isActive',
    });

    logger.info(`Cart item updated: ${publication.title} quantity: ${quantity} for user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Cart item updated successfully',
      data: cart,
    };

    res.json(response);
  } catch (error) {
    logger.error('Update cart item error:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicationId } = req.params;

    // Get cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new CustomError('Cart not found', 404);
    }

    // Check if item exists in cart
    if (!cart.hasItem(publicationId)) {
      throw new CustomError('Item not found in cart', 404);
    }

    // Remove item from cart
    await cart.removeItem(publicationId);

    // Populate cart items for response
    await cart.populate({
      path: 'items.publicationId',
      select: 'title author price image stock isActive',
    });

    logger.info(`Item removed from cart: ${publicationId} for user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Item removed from cart successfully',
      data: cart,
    };

    res.json(response);
  } catch (error) {
    logger.error('Remove from cart error:', error);
    throw error;
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new CustomError('Cart not found', 404);
    }

    // Clear cart
    await cart.clearCart();

    logger.info(`Cart cleared for user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    };

    res.json(response);
  } catch (error) {
    logger.error('Clear cart error:', error);
    throw error;
  }
};

/**
 * Get cart item count
 */
export const getCartItemCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    
    const itemCount = cart ? cart.totalItems : 0;

    const response: ApiResponse = {
      success: true,
      data: { itemCount },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get cart item count error:', error);
    throw error;
  }
};
