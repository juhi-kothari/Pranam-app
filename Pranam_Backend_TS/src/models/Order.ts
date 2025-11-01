import mongoose, { Schema, Model } from 'mongoose';
import { IOrder, IOrderItem, IShippingAddress } from '@/types';

const orderItemSchema = new Schema<IOrderItem>(
  {
    publicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Publication ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Invalid pincode format'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid phone number format'],
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      trim: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    totalItems: {
      type: Number,
      required: [true, 'Total items is required'],
      min: [1, 'Total items must be at least 1'],
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cod', 'online'],
        message: 'Invalid payment method',
      },
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: 'Invalid payment status',
      },
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: 'Invalid order status',
      },
      default: 'pending',
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function() {
  return `₹${this.totalAmount.toFixed(2)}`;
});

// Virtual for formatted order date
orderSchema.virtual('formattedOrderDate').get(function() {
  return this.createdAt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

// Virtual for is cancellable
orderSchema.virtual('isCancellable').get(function() {
  return ['pending', 'confirmed'].includes(this.orderStatus);
});

// Virtual for is delivered
orderSchema.virtual('isDelivered').get(function() {
  return this.orderStatus === 'delivered';
});

// Virtual for is cancelled
orderSchema.virtual('isCancelled').get(function() {
  return this.orderStatus === 'cancelled';
});

// Static method to generate order number
orderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId: mongoose.Types.ObjectId, filter = {}) {
  return this.find({ ...filter, userId }).sort({ createdAt: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status: string, filter = {}) {
  return this.find({ ...filter, orderStatus: status });
};

// Instance method to update status
orderSchema.methods.updateStatus = function(status: string, notes?: string) {
  this.orderStatus = status;
  if (notes) {
    this.notes = notes;
  }

  // Set timestamps for specific statuses
  if (status === 'delivered') {
    this.deliveredAt = new Date();
  } else if (status === 'cancelled') {
    this.cancelledAt = new Date();
  }

  return this.save();
};

// Instance method to update payment status
orderSchema.methods.updatePaymentStatus = function(status: string) {
  this.paymentStatus = status;
  
  if (status === 'refunded') {
    this.refundedAt = new Date();
  }

  return this.save();
};

// Instance method to add tracking number
orderSchema.methods.addTrackingNumber = function(trackingNumber: string) {
  this.trackingNumber = trackingNumber;
  if (this.orderStatus === 'processing') {
    this.orderStatus = 'shipped';
  }
  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancel = function(reason?: string) {
  if (!this.isCancellable) {
    throw new Error('Order cannot be cancelled');
  }
  
  this.orderStatus = 'cancelled';
  this.cancelledAt = new Date();
  if (reason) {
    this.notes = reason;
  }
  
  return this.save();
};

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = (this.constructor as any).generateOrderNumber();
  }
  next();
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
