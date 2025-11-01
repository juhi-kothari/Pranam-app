import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Comment, Blog } from '@/models';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

/**
 * Get comments for a blog
 */
export const getCommentsByBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new CustomError('Blog not found', 404);
    }

    const includeUnapproved = req.user?.role === 'admin';

    // Get top-level comments with replies
    const filter: any = { 
      blogId, 
      parentComment: { $exists: false } 
    };

    if (!includeUnapproved) {
      filter.isApproved = true;
    }

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate({
          path: 'replies',
          match: includeUnapproved ? {} : { isApproved: true },
          options: { sort: { createdAt: 1 } },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get comments by blog error:', error);
    throw error;
  }
};

/**
 * Create a new comment
 */
export const createComment = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const { name, email, text, blogId, parentComment } = req.body;

    // Check if blog exists and is published
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new CustomError('Blog not found', 404);
    }

    if (!blog.isPublished && req.user?.role !== 'admin') {
      throw new CustomError('Cannot comment on unpublished blog', 400);
    }

    // If it's a reply, check if parent comment exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent || !parent.blogId.equals(blogId)) {
        throw new CustomError('Parent comment not found', 404);
      }
    }

    // Create comment
    const commentData: any = {
      name: name.trim(),
      text: text.trim(),
      blogId,
    };

    if (email) {
      commentData.email = email.toLowerCase().trim();
    }

    if (req.user) {
      commentData.userId = req.user._id;
      commentData.isApproved = true; // Auto-approve for authenticated users
    }

    if (parentComment) {
      commentData.parentComment = parentComment;
    }

    const comment = new Comment(commentData);
    await comment.save();

    // Add comment to blog
    await blog.addComment(comment._id);

    // If it's a reply, add to parent comment
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent) {
        await parent.addReply(comment._id);
      }
    }

    logger.info(`New comment created on blog: ${blog.title} by ${comment.name}`);

    const response: ApiResponse = {
      success: true,
      message: req.user ? 'Comment posted successfully' : 'Comment submitted for approval',
      data: comment,
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Create comment error:', error);
    throw error;
  }
};

/**
 * Approve comment (Admin only)
 */
export const approveComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      throw new CustomError('Comment not found', 404);
    }

    if (comment.isApproved) {
      throw new CustomError('Comment is already approved', 400);
    }

    await comment.approve();

    logger.info(`Comment approved: ${comment._id} by ${comment.name}`);

    const response: ApiResponse = {
      success: true,
      message: 'Comment approved successfully',
      data: comment,
    };

    res.json(response);
  } catch (error) {
    logger.error('Approve comment error:', error);
    throw error;
  }
};

/**
 * Delete comment (Admin only)
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      throw new CustomError('Comment not found', 404);
    }

    // Remove from blog
    const blog = await Blog.findById(comment.blogId);
    if (blog) {
      await blog.removeComment(comment._id);
    }

    // Remove from parent comment if it's a reply
    if (comment.parentComment) {
      const parent = await Comment.findById(comment.parentComment);
      if (parent) {
        await parent.removeReply(comment._id);
      }
    }

    // Delete all replies
    await Comment.deleteMany({ parentComment: comment._id });

    // Delete comment
    await comment.deleteOne();

    logger.info(`Comment deleted: ${comment._id} by ${comment.name}`);

    const response: ApiResponse = {
      success: true,
      message: 'Comment deleted successfully',
    };

    res.json(response);
  } catch (error) {
    logger.error('Delete comment error:', error);
    throw error;
  }
};

/**
 * Get pending comments (Admin only)
 */
export const getPendingComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ isApproved: false })
        .populate('blogId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ isApproved: false }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get pending comments error:', error);
    throw error;
  }
};

/**
 * Get comment statistics (Admin only)
 */
export const getCommentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalComments, approvedComments, pendingComments] = await Promise.all([
      Comment.countDocuments(),
      Comment.countDocuments({ isApproved: true }),
      Comment.countDocuments({ isApproved: false }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        total: totalComments,
        approved: approvedComments,
        pending: pendingComments,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get comment stats error:', error);
    throw error;
  }
};
