import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Order, Cart, Publication } from '@/models';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

/**
 * Create new order
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate items and calculate total
    let totalAmount = 0;
    let totalItems = 0;
    const orderItems = [];

    for (const item of items) {
      const publication = await Publication.findById(item.publicationId);
      
      if (!publication) {
        throw new CustomError(`Publication not found: ${item.publicationId}`, 404);
      }

      if (!publication.isActive) {
        throw new CustomError(`Publication is not available: ${publication.title}`, 400);
      }

      if (!publication.isInStock(item.quantity)) {
        throw new CustomError(`Insufficient stock for: ${publication.title}`, 400);
      }

      const itemTotal = publication.price * item.quantity;
      totalAmount += itemTotal;
      totalItems += item.quantity;

      orderItems.push({
        publicationId: publication._id,
        title: publication.title,
        author: publication.author,
        price: publication.price,
        quantity: item.quantity,
        image: publication.image,
      });
    }

    // Create order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      totalItems,
      shippingAddress,
      paymentMethod,
      notes,
    });

    await order.save();

    // Reduce stock for each item
    for (const item of items) {
      const publication = await Publication.findById(item.publicationId);
      if (publication) {
        await publication.reduceStock(item.quantity);
      }
    }

    // Clear user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      await cart.clearCart();
    }

    logger.info(`New order created: ${order.orderNumber} for user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Order placed successfully',
      data: order,
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Create order error:', error);
    throw error;
  }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ userId: req.user._id }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get user orders error:', error);
    throw error;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const filter: any = { _id: id };

    // Non-admin users can only see their own orders
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const order = await Order.findOne(filter);

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: order,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get order by ID error:', error);
    throw error;
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const filter: any = { _id: id };

    // Non-admin users can only cancel their own orders
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const order = await Order.findOne(filter);

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    if (!order.isCancellable) {
      throw new CustomError('Order cannot be cancelled', 400);
    }

    // Cancel order
    await order.cancel(reason);

    // Restore stock for each item
    for (const item of order.items) {
      const publication = await Publication.findById(item.publicationId);
      if (publication) {
        publication.stock += item.quantity;
        await publication.save();
      }
    }

    logger.info(`Order cancelled: ${order.orderNumber} by user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    };

    res.json(response);
  } catch (error) {
    logger.error('Cancel order error:', error);
    throw error;
  }
};

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: any = {};
    if (status) {
      filter.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get all orders error:', error);
    throw error;
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes, trackingNumber } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    // Update status
    await order.updateStatus(status, notes);

    // Add tracking number if provided
    if (trackingNumber) {
      await order.addTrackingNumber(trackingNumber);
    }

    logger.info(`Order status updated: ${order.orderNumber} to ${status} by admin: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Order status updated successfully',
      data: order,
    };

    res.json(response);
  } catch (error) {
    logger.error('Update order status error:', error);
    throw error;
  }
};

/**
 * Get order statistics (Admin only)
 */
export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'confirmed' }),
      Order.countDocuments({ orderStatus: 'shipped' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        revenue: totalRevenue[0]?.total || 0,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get order stats error:', error);
    throw error;
  }
};
