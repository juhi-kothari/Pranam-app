import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  author: string;
  authorId?: Types.ObjectId;
  date: Date;
  image: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  readCount: number;
  likes: number;
  comments: Types.ObjectId[];

  incrementReadCount(): Promise<IBlog>;
  incrementLikes(): Promise<IBlog>;
  addComment(commentId: Types.ObjectId): Promise<IBlog>;
  removeComment(commentId: Types.ObjectId): Promise<IBlog>;

  formattedDate?: string;
  readingTime?: string;
  excerpt?: string;
  commentCount?: number;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    author: { type: String, required: true, trim: true, maxlength: 100 },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now, required: true },
    image: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      trim: true,
      enum: ['Spiritual', 'Philosophy', 'Life', 'Wisdom', 'Experience', 'Teaching', 'Other'],
      default: 'Spiritual',
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    isPublished: { type: Boolean, default: true },
    readCount: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
blogSchema.index({ title: 'text', description: 'text', content: 'text' });
blogSchema.index({ author: 1, authorId: 1, category: 1, tags: 1, isPublished: 1 });
blogSchema.index({ date: -1, readCount: -1, likes: -1, createdAt: -1 });

// Virtuals
blogSchema.virtual('formattedDate').get(function () {
  return this.date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
});

blogSchema.virtual('readingTime').get(function () {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
});

blogSchema.virtual('excerpt').get(function () {
  const maxLength = 150;
  return this.description.length <= maxLength ? this.description : this.description.substring(0, maxLength).trim() + '...';
});

blogSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Instance methods
blogSchema.methods.incrementReadCount = async function (): Promise<IBlog> {
  this.readCount = (this.readCount || 0) + 1;
  return this.save();
};

blogSchema.methods.incrementLikes = async function (): Promise<IBlog> {
  this.likes = (this.likes || 0) + 1;
  return this.save();
};

blogSchema.methods.addComment = async function (commentId: Types.ObjectId): Promise<IBlog> {
  this.comments.push(commentId);
  return this.save();
};

blogSchema.methods.removeComment = async function (commentId: Types.ObjectId): Promise<IBlog> {
  this.comments = this.comments.filter((id) => !id.equals(commentId));
  return this.save();
};

// Pre-save middleware
blogSchema.pre('save', function (next) {
  if (this.isModified('content') && !this.isNew) {
    this.date = new Date();
  }
  next();
});

const Blog: Model<IBlog> = mongoose.model<IBlog>('Blog', blogSchema);

export default Blog;
