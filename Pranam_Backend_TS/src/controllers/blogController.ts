import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Blog, Comment } from '@/models';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse, BlogFilters } from '@/types';

/**
 * Get all blogs with filtering, searching, and pagination
 */
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'date',
      order = 'desc',
      author,
      category,
      search,
      tags,
      published = true,
    }: BlogFilters = req.query;

    // Build filter object
    const filter: any = {};

    // Only show published blogs for non-admin users
    if (req.user?.role !== 'admin') {
      filter.status = "published";
    } else if (published !== undefined) {
      filter.isPublished = published;
    }

    if (author) {
      filter.author = new RegExp(author, 'i');
    }

    if (category) {
      filter.category = category;
    }

    if (tags && Array.isArray(tags)) {
      filter.tags = { $in: tags };
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query;

    // Handle search
    if (search) {
      query = Blog.find({
        ...filter,
        $text: { $search: search }
      }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, ...sortObj });
    } else {
      query = Blog.find(filter).sort(sortObj);
    }

    // Execute query with pagination
    const [blogs, total] = await Promise.all([
      query.skip(skip).limit(limitNum).populate('comments', 'name text createdAt isApproved').lean(),
      Blog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const response: ApiResponse = {
      success: true,
      data: blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get blogs error:', error);
    throw error;
  }
};

/**
 * Get blog by ID
 */
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const filter: any = { _id: id };

    // Only show published blogs for non-admin users
    if (req.user?.role !== 'admin') {
      filter.status = "published";
    }

    const blog = await Blog.findOne(filter)
      .populate({
        path: 'comments',
        match: { isApproved: true, parentComment: { $exists: false } },
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'replies',
          match: { isApproved: true },
          options: { sort: { createdAt: 1 } },
        },
      });

    if (!blog) {
      throw new CustomError('Blog not found', 404);
    }

    // Increment read count
    await blog.incrementReadCount();

    const response: ApiResponse = {
      success: true,
      data: blog,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get blog by ID error:', error);
    throw error;
  }
};

/**
 * Create new blog (Admin only)
 */
export const createBlog = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const blogData = {
      ...req.body,
      authorId: req.user._id,
    };

    const blog = new Blog(blogData);
    await blog.save();

    logger.info(`New blog created: ${blog.title} by ${blog.author}`);

    const response: ApiResponse = {
      success: true,
      message: 'Blog created successfully',
      data: blog,
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Create blog error:', error);
    throw error;
  }
};

/**
 * Update blog (Admin only)
 */
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new CustomError('Blog not found', 404);
    }

    // Update blog
    Object.assign(blog, updateData);
    await blog.save();

    logger.info(`Blog updated: ${blog.title} by ${blog.author}`);

    const response: ApiResponse = {
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    };

    res.json(response);
  } catch (error) {
    logger.error('Update blog error:', error);
    throw error;
  }
};

/**
 * Delete blog (Admin only)
 */
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new CustomError('Blog not found', 404);
    }

    // Delete associated comments
    await Comment.deleteMany({ blogId: id });

    // Delete blog
    await blog.deleteOne();

    logger.info(`Blog deleted: ${blog.title} by ${blog.author}`);

    const response: ApiResponse = {
      success: true,
      message: 'Blog deleted successfully',
    };

    res.json(response);
  } catch (error) {
    logger.error('Delete blog error:', error);
    throw error;
  }
};

/**
 * Get blog categories
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Only show published blogs for non-admin users
    if (req.user?.role !== 'admin') {
      filter.status = "published";
    }

    const categories = await Blog.distinct('category', filter);

    const response: ApiResponse = {
      success: true,
      data: categories.sort(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Get blog categories error:', error);
    throw error;
  }
};

/**
 * Get blog authors
 */
export const getAuthors = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Only show published blogs for non-admin users
    if (req.user?.role !== 'admin') {
      filter.status = "published";
    }

    const authors = await Blog.distinct('author', filter);

    const response: ApiResponse = {
      success: true,
      data: authors.sort(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Get blog authors error:', error);
    throw error;
  }
};

/**
 * Get featured blogs (most read)
 */
export const getFeaturedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 5));

    const filter: any = {};

    // Only show published blogs for non-admin users
    if (req.user?.role !== 'admin') {
      //filter.isPublished = true;
      filter.status = "published";

    }

    const blogs = await Blog.find(filter)
      .sort({ readCount: -1, date: -1 })
      .limit(limit)
      .lean();

    const response: ApiResponse = {
      success: true,
      data: blogs,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get featured blogs error:', error);
    throw error;
  }
};

/**
 * Get related blogs
 */
export const getRelatedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 3));

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new CustomError('Blog not found', 404);
    }

    const filter: any = {
      _id: { $ne: id },
    };

    // Only show published blogs for non-admin users
    if (req.user?.role !== 'admin') {
      //filter.isPublished = true;
      filter.status = "published";
    }

    // Find related blogs by category, tags, and author
    const relatedBlogs = await Blog.find({
      ...filter,
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags || [] } },
        { author: blog.author },
      ],
    })
    .sort({ readCount: -1, date: -1 })
    .limit(limit)
    .lean();

    const response: ApiResponse = {
      success: true,
      data: relatedBlogs,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get related blogs error:', error);
    throw error;
  }
};

/**
 * Like a blog
 */
export const likeBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new CustomError('Blog not found', 404);
    }

    if (!blog.isPublished && req.user?.role !== 'admin') {
      throw new CustomError('Blog not found', 404);
    }

    await blog.incrementLikes();

    const response: ApiResponse = {
      success: true,
      message: 'Blog liked successfully',
      data: { likes: blog.likes },
    };

    res.json(response);
  } catch (error) {
    logger.error('Like blog error:', error);
    throw error;
  }
};
