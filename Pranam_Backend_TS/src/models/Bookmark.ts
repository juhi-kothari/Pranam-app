import mongoose, { Schema, Model } from 'mongoose';
import { IBookmark } from '@/types';

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    publicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Publication ID is required'],
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
bookmarkSchema.index({ userId: 1 });
bookmarkSchema.index({ publicationId: 1 });
bookmarkSchema.index({ userId: 1, publicationId: 1 }, { unique: true });
bookmarkSchema.index({ createdAt: -1 });

// Virtual for formatted date
bookmarkSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

// Static method to find bookmarks by user
bookmarkSchema.statics.findByUser = function(userId: mongoose.Types.ObjectId) {
  return this.find({ userId })
    .populate('publicationId')
    .sort({ createdAt: -1 });
};

// Static method to check if publication is bookmarked by user
bookmarkSchema.statics.isBookmarked = async function(userId: mongoose.Types.ObjectId, publicationId: mongoose.Types.ObjectId) {
  const bookmark = await this.findOne({ userId, publicationId });
  return !!bookmark;
};

// Static method to toggle bookmark
bookmarkSchema.statics.toggle = async function(userId: mongoose.Types.ObjectId, publicationId: mongoose.Types.ObjectId) {
  const existingBookmark = await this.findOne({ userId, publicationId });
  
  if (existingBookmark) {
    await existingBookmark.deleteOne();
    return { action: 'removed', bookmark: null };
  } else {
    const newBookmark = await this.create({ userId, publicationId });
    return { action: 'added', bookmark: newBookmark };
  }
};

// Static method to get bookmark count for a publication
bookmarkSchema.statics.getBookmarkCount = function(publicationId: mongoose.Types.ObjectId) {
  return this.countDocuments({ publicationId });
};

// Static method to get user's bookmark count
bookmarkSchema.statics.getUserBookmarkCount = function(userId: mongoose.Types.ObjectId) {
  return this.countDocuments({ userId });
};

// Static method to find popular publications (most bookmarked)
bookmarkSchema.statics.findPopularPublications = function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$publicationId',
        bookmarkCount: { $sum: 1 }
      }
    },
    {
      $sort: { bookmarkCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'publications',
        localField: '_id',
        foreignField: '_id',
        as: 'publication'
      }
    },
    {
      $unwind: '$publication'
    },
    {
      $project: {
        _id: 0,
        publication: 1,
        bookmarkCount: 1
      }
    }
  ]);
};

// Instance method to get publication details
bookmarkSchema.methods.getPublicationDetails = function() {
  return this.populate('publicationId');
};

// Ensure virtual fields are serialized
bookmarkSchema.set('toJSON', { virtuals: true });
bookmarkSchema.set('toObject', { virtuals: true });

const Bookmark: Model<IBookmark> = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);

export default Bookmark;
