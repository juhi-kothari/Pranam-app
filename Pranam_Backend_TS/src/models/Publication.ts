import mongoose, { Schema, Model } from 'mongoose';
import { IPublication } from '@/types';

const publicationSchema = new Schema<IPublication>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: ['Publication', 'Calendar', 'Poetry', 'Spiritual', 'Philosophy', 'Self-Help', 'Other'],
        message: 'Invalid category',
      },
    },
    weight: {
      type: String,
      trim: true,
      default: '0.35kg',
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allow multiple null values
      match: [/^(?:\d{9}[\dX]|\d{13})$/, 'Invalid ISBN format'],
    },
    noOfPages: {
      type: Number,
      min: [1, 'Number of pages must be at least 1'],
    },
    image: {
      type: String,
      required: [true, 'Main image is required'],
      trim: true,
    },
    images: [{
      type: String,
      trim: true,
    }],
    textColor: {
      type: String,
      trim: true,
      default: '#000000',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    readCount: {
      type: Number,
      default: 0,
      min: [0, 'Read count cannot be negative'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }],
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
publicationSchema.index({ title: 'text', author: 'text', description: 'text' });
publicationSchema.index({ category: 1 });
publicationSchema.index({ author: 1 });
publicationSchema.index({ price: 1 });
publicationSchema.index({ isActive: 1 });
publicationSchema.index({ stock: 1 });
publicationSchema.index({ tags: 1 });
publicationSchema.index({ readCount: -1 });
publicationSchema.index({ rating: -1 });
publicationSchema.index({ createdAt: -1 });
publicationSchema.index({ 'title': 1, 'author': 1 }, { unique: true });

// Virtual for formatted price
publicationSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toFixed(2)}`;
});

// Virtual for discount percentage
publicationSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for availability status
publicationSchema.virtual('isAvailable').get(function() {
  return this.isActive && this.stock > 0;
});

// Static method to find active publications
publicationSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isActive: true });
};

// Static method to find available publications (active and in stock)
publicationSchema.statics.findAvailable = function(filter = {}) {
  return this.find({ ...filter, isActive: true, stock: { $gt: 0 } });
};

// Static method to search publications
publicationSchema.statics.search = function(query: string, filter = {}) {
  return this.find({
    ...filter,
    isActive: true,
    $text: { $search: query }
  }, { score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } });
};

// Instance method to increment read count
publicationSchema.methods.incrementReadCount = function() {
  this.readCount += 1;
  return this.save();
};

// Instance method to check if in stock
publicationSchema.methods.isInStock = function(quantity = 1) {
  return this.stock >= quantity;
};

// Instance method to reduce stock
publicationSchema.methods.reduceStock = function(quantity: number) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  return this.save();
};

// Ensure virtual fields are serialized
publicationSchema.set('toJSON', { virtuals: true });
publicationSchema.set('toObject', { virtuals: true });

const Publication: Model<IPublication> = mongoose.model<IPublication>('Publication', publicationSchema);

export default Publication;
