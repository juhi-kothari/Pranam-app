import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Publication } from '@/models';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse, PublicationFilters } from '@/types';

/**
 * Get all publications with filtering, searching, and pagination
 */
export const getPublications = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = 'createdAt',
      order = 'desc',
      category,
      author,
      minPrice,
      maxPrice,
      search,
      tags,
    }: PublicationFilters = req.query;

    // Build filter object
    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (author) {
      filter.author = new RegExp(author, 'i');
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
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
      query = Publication.find({
        ...filter,
        $text: { $search: search }
      }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, ...sortObj });
    } else {
      query = Publication.find(filter).sort(sortObj);
    }

    // Execute query with pagination
    const [publications, total] = await Promise.all([
      query.skip(skip).limit(limitNum).lean(),
      Publication.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const response: ApiResponse = {
      success: true,
      data: publications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get publications error:', error);
    throw error;
  }
};

/**
 * Get publication by ID
 */
export const getPublicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const publication = await Publication.findOne({ _id: id, isActive: true });

    if (!publication) {
      throw new CustomError('Publication not found', 404);
    }

    // Increment read count
    await publication.incrementReadCount();

    const response: ApiResponse = {
      success: true,
      data: publication,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get publication by ID error:', error);
    throw error;
  }
};

/**
 * Create new publication (Admin only)
 */
export const createPublication = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const publicationData = req.body;

    // Check for duplicate title and author combination
    const existingPublication = await Publication.findOne({
      title: publicationData.title,
      author: publicationData.author,
    });

    if (existingPublication) {
      throw new CustomError('Publication with this title and author already exists', 400);
    }

    const publication = new Publication(publicationData);
    await publication.save();

    logger.info(`New publication created: ${publication.title} by ${publication.author}`);

    const response: ApiResponse = {
      success: true,
      message: 'Publication created successfully',
      data: publication,
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Create publication error:', error);
    throw error;
  }
};

/**
 * Update publication (Admin only)
 */
export const updatePublication = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const { id } = req.params;
    const updateData = req.body;

    const publication = await Publication.findById(id);

    if (!publication) {
      throw new CustomError('Publication not found', 404);
    }

    // Check for duplicate title and author combination if title or author is being updated
    if (updateData.title || updateData.author) {
      const title = updateData.title || publication.title;
      const author = updateData.author || publication.author;

      const existingPublication = await Publication.findOne({
        _id: { $ne: id },
        title,
        author,
      });

      if (existingPublication) {
        throw new CustomError('Publication with this title and author already exists', 400);
      }
    }

    // Update publication
    Object.assign(publication, updateData);
    await publication.save();

    logger.info(`Publication updated: ${publication.title} by ${publication.author}`);

    const response: ApiResponse = {
      success: true,
      message: 'Publication updated successfully',
      data: publication,
    };

    res.json(response);
  } catch (error) {
    logger.error('Update publication error:', error);
    throw error;
  }
};

/**
 * Delete publication (Admin only)
 */
export const deletePublication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const publication = await Publication.findById(id);

    if (!publication) {
      throw new CustomError('Publication not found', 404);
    }

    // Soft delete by setting isActive to false
    publication.isActive = false;
    await publication.save();

    logger.info(`Publication deleted: ${publication.title} by ${publication.author}`);

    const response: ApiResponse = {
      success: true,
      message: 'Publication deleted successfully',
    };

    res.json(response);
  } catch (error) {
    logger.error('Delete publication error:', error);
    throw error;
  }
};

/**
 * Get publication categories
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Publication.distinct('category', { isActive: true });

    const response: ApiResponse = {
      success: true,
      data: categories.sort(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Get categories error:', error);
    throw error;
  }
};

/**
 * Get publication authors
 */
export const getAuthors = async (req: Request, res: Response): Promise<void> => {
  try {
    const authors = await Publication.distinct('author', { isActive: true });

    const response: ApiResponse = {
      success: true,
      data: authors.sort(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Get authors error:', error);
    throw error;
  }
};

/**
 * Get featured publications (most read)
 */
export const getFeaturedPublications = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 6));

    const publications = await Publication.find({ isActive: true })
      .sort({ readCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const response: ApiResponse = {
      success: true,
      data: publications,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get featured publications error:', error);
    throw error;
  }
};

/**
 * Get related publications
 */
export const getRelatedPublications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 4));

    const publication = await Publication.findById(id);

    if (!publication) {
      throw new CustomError('Publication not found', 404);
    }

    // Find related publications by category and tags
    const relatedPublications = await Publication.find({
      _id: { $ne: id },
      isActive: true,
      $or: [
        { category: publication.category },
        { tags: { $in: publication.tags || [] } },
        { author: publication.author },
      ],
    })
    .sort({ readCount: -1, createdAt: -1 })
    .limit(limit)
    .lean();

    const response: ApiResponse = {
      success: true,
      data: relatedPublications,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get related publications error:', error);
    throw error;
  }
};
