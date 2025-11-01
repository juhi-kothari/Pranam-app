import mongoose, { Schema, Model } from 'mongoose';
import { IComment } from '@/types';

const commentSchema = new Schema<IComment>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    replies: [{
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
commentSchema.index({ blogId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ isApproved: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ blogId: 1, isApproved: 1, createdAt: -1 });

// Virtual for formatted date
commentSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for is reply
commentSchema.virtual('isReply').get(function() {
  return !!this.parentComment;
});

// Static method to find approved comments
commentSchema.statics.findApproved = function(filter = {}) {
  return this.find({ ...filter, isApproved: true });
};

// Static method to find comments by blog
commentSchema.statics.findByBlog = function(blogId: mongoose.Types.ObjectId, includeUnapproved = false) {
  const filter: any = { blogId };
  if (!includeUnapproved) {
    filter.isApproved = true;
  }
  return this.find(filter).sort({ createdAt: -1 });
};

// Static method to find top-level comments (not replies)
commentSchema.statics.findTopLevel = function(blogId: mongoose.Types.ObjectId, includeUnapproved = false) {
  const filter: any = { blogId, parentComment: { $exists: false } };
  if (!includeUnapproved) {
    filter.isApproved = true;
  }
  return this.find(filter).sort({ createdAt: -1 });
};

// Static method to find replies to a comment
commentSchema.statics.findReplies = function(parentCommentId: mongoose.Types.ObjectId, includeUnapproved = false) {
  const filter: any = { parentComment: parentCommentId };
  if (!includeUnapproved) {
    filter.isApproved = true;
  }
  return this.find(filter).sort({ createdAt: 1 });
};

// Instance method to approve comment
commentSchema.methods.approve = function() {
  this.isApproved = true;
  return this.save();
};

// Instance method to add reply
commentSchema.methods.addReply = function(replyId: mongoose.Types.ObjectId) {
  this.replies.push(replyId);
  return this.save();
};

// Instance method to remove reply
commentSchema.methods.removeReply = function(replyId: mongoose.Types.ObjectId) {
  this.replies = this.replies.filter(id => !id.equals(replyId));
  return this.save();
};

// Pre-save middleware to auto-approve comments from registered users
commentSchema.pre('save', function(next) {
  if (this.isNew && this.userId) {
    this.isApproved = true;
  }
  next();
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
