import mongoose, { Schema, Model } from 'mongoose';
import { ICart, ICartItem } from '@/types';

const cartItemSchema = new Schema<ICartItem>(
  {
    publicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Publication ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Quantity cannot exceed 10'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
    },
    totalItems: {
      type: Number,
      default: 0,
      min: [0, 'Total items cannot be negative'],
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
cartSchema.index({ userId: 1 }, { unique: true });
cartSchema.index({ 'items.publicationId': 1 });
cartSchema.index({ updatedAt: -1 });

// Virtual for is empty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Virtual for formatted total
cartSchema.virtual('formattedTotal').get(function() {
  return `₹${this.totalAmount.toFixed(2)}`;
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId: mongoose.Types.ObjectId) {
  let cart = await this.findOne({ userId });
  if (!cart) {
    cart = await this.create({ userId, items: [] });
  }
  return cart;
};

// Instance method to add item
cartSchema.methods.addItem = function(publicationId: mongoose.Types.ObjectId, quantity: number, price: number) {
  const existingItemIndex = this.items.findIndex(item => 
    item.publicationId.equals(publicationId)
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Update price in case it changed
  } else {
    // Add new item
    this.items.push({ publicationId, quantity, price });
  }

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(publicationId: mongoose.Types.ObjectId, quantity: number) {
  const itemIndex = this.items.findIndex(item => 
    item.publicationId.equals(publicationId)
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    this.items.splice(itemIndex, 1);
  } else {
    this.items[itemIndex].quantity = quantity;
  }

  return this.save();
};

// Instance method to remove item
cartSchema.methods.removeItem = function(publicationId: mongoose.Types.ObjectId) {
  this.items = this.items.filter(item => !item.publicationId.equals(publicationId));
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Instance method to get item by publication ID
cartSchema.methods.getItem = function(publicationId: mongoose.Types.ObjectId) {
  return this.items.find(item => item.publicationId.equals(publicationId));
};

// Instance method to check if item exists
cartSchema.methods.hasItem = function(publicationId: mongoose.Types.ObjectId) {
  return this.items.some(item => item.publicationId.equals(publicationId));
};

// Ensure virtual fields are serialized
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart: Model<ICart> = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;
