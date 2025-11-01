import mongoose, { Schema, Model } from 'mongoose';
import { IBlog } from '@/types';

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      enum: {
        values: ['Spiritual', 'Philosophy', 'Life', 'Wisdom', 'Experience', 'Teaching', 'Other'],
        message: 'Invalid category',
      },
      default: 'Spiritual',
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    readCount: {
      type: Number,
      default: 0,
      min: [0, 'Read count cannot be negative'],
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, 'Likes cannot be negative'],
    },
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
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
blogSchema.index({ title: 'text', description: 'text', content: 'text' });
blogSchema.index({ author: 1 });
blogSchema.index({ authorId: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isPublished: 1 });
blogSchema.index({ date: -1 });
blogSchema.index({ readCount: -1 });
blogSchema.index({ likes: -1 });
blogSchema.index({ createdAt: -1 });

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

// Virtual for reading time estimate (words per minute = 200)
blogSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
});

// Virtual for excerpt
blogSchema.virtual('excerpt').get(function() {
  const maxLength = 150;
  if (this.description.length <= maxLength) {
    return this.description;
  }
  return this.description.substring(0, maxLength).trim() + '...';
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Static method to find published blogs
blogSchema.statics.findPublished = function(filter = {}) {
  return this.find({ ...filter, isPublished: true });
};

// Static method to search blogs
blogSchema.statics.search = function(query: string, filter = {}) {
  return this.find({
    ...filter,
    isPublished: true,
    $text: { $search: query }
  }, { score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } });
};

// Static method to find by author
blogSchema.statics.findByAuthor = function(author: string, filter = {}) {
  return this.find({ ...filter, author, isPublished: true });
};

// Static method to find by category
blogSchema.statics.findByCategory = function(category: string, filter = {}) {
  return this.find({ ...filter, category, isPublished: true });
};

// Static method to find by tags
blogSchema.statics.findByTags = function(tags: string[], filter = {}) {
  return this.find({ ...filter, tags: { $in: tags }, isPublished: true });
};

// Instance method to increment read count
blogSchema.methods.incrementReadCount = function() {
  this.readCount += 1;
  return this.save();
};

// Instance method to increment likes
blogSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Instance method to add comment
blogSchema.methods.addComment = function(commentId: mongoose.Types.ObjectId) {
  this.comments.push(commentId);
  return this.save();
};

// Instance method to remove comment
blogSchema.methods.removeComment = function(commentId: mongoose.Types.ObjectId) {
  this.comments = this.comments.filter(id => !id.equals(commentId));
  return this.save();
};

// Pre-save middleware to update date if content is modified
blogSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.date = new Date();
  }
  next();
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

const Blog: Model<IBlog> = mongoose.model<IBlog>('Blog', blogSchema);

export default Blog;
