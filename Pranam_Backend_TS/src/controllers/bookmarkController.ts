import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Bookmark, Publication } from '@/models';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

/**
 * Get user's bookmarks
 */
export const getUserBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      Bookmark.find({ userId: req.user._id })
        .populate({
          path: 'publicationId',
          match: { isActive: true },
          select: 'title subtitle author price image textColor category',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bookmark.countDocuments({ userId: req.user._id }),
    ]);

    // Filter out bookmarks where publication was not found (inactive publications)
    const validBookmarks = bookmarks.filter(bookmark => bookmark.publicationId);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: validBookmarks,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get user bookmarks error:', error);
    throw error;
  }
};

/**
 * Add publication to bookmarks
 */
export const addBookmark = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const { publicationId } = req.body;

    // Check if publication exists and is active
    const publication = await Publication.findOne({ _id: publicationId, isActive: true });
    if (!publication) {
      throw new CustomError('Publication not found', 404);
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      userId: req.user._id,
      publicationId,
    });

    if (existingBookmark) {
      throw new CustomError('Publication is already bookmarked', 400);
    }

    // Create bookmark
    const bookmark = new Bookmark({
      userId: req.user._id,
      publicationId,
    });

    await bookmark.save();

    // Populate publication details for response
    await bookmark.populate('publicationId', 'title subtitle author price image textColor category');

    logger.info(`Publication bookmarked: ${publication.title} by user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Publication bookmarked successfully',
      data: bookmark,
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Add bookmark error:', error);
    throw error;
  }
};

/**
 * Remove publication from bookmarks
 */
export const removeBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicationId } = req.params;

    const bookmark = await Bookmark.findOne({
      userId: req.user._id,
      publicationId,
    });

    if (!bookmark) {
      throw new CustomError('Bookmark not found', 404);
    }

    await bookmark.deleteOne();

    logger.info(`Bookmark removed: ${publicationId} by user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Bookmark removed successfully',
    };

    res.json(response);
  } catch (error) {
    logger.error('Remove bookmark error:', error);
    throw error;
  }
};

/**
 * Toggle bookmark (add if not exists, remove if exists)
 */
export const toggleBookmark = async (req: Request, res: Response): Promise<void> => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(err => err.msg).join(', '), 400);
  }

  try {
    const { publicationId } = req.body;

    // Check if publication exists and is active
    const publication = await Publication.findOne({ _id: publicationId, isActive: true });
    if (!publication) {
      throw new CustomError('Publication not found', 404);
    }

    // Toggle bookmark
    const result = await Bookmark.toggle(req.user._id, publicationId);

    let responseData = null;
    if (result.bookmark) {
      await result.bookmark.populate('publicationId', 'title subtitle author price image textColor category');
      responseData = result.bookmark;
    }

    logger.info(`Bookmark ${result.action}: ${publication.title} by user: ${req.user.email}`);

    const response: ApiResponse = {
      success: true,
      message: `Publication ${result.action === 'added' ? 'bookmarked' : 'removed from bookmarks'} successfully`,
      data: {
        action: result.action,
        bookmark: responseData,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Toggle bookmark error:', error);
    throw error;
  }
};

/**
 * Check if publication is bookmarked by user
 */
export const checkBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicationId } = req.params;

    const isBookmarked = await Bookmark.isBookmarked(req.user._id, publicationId);

    const response: ApiResponse = {
      success: true,
      data: { isBookmarked },
    };

    res.json(response);
  } catch (error) {
    logger.error('Check bookmark error:', error);
    throw error;
  }
};

/**
 * Get bookmark count for user
 */
export const getBookmarkCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Bookmark.getUserBookmarkCount(req.user._id);

    const response: ApiResponse = {
      success: true,
      data: { count },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get bookmark count error:', error);
    throw error;
  }
};

/**
 * Get popular publications (most bookmarked) - Public endpoint
 */
export const getPopularPublications = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

    const popularPublications = await Bookmark.findPopularPublications(limit);

    const response: ApiResponse = {
      success: true,
      data: popularPublications,
    };

    res.json(response);
  } catch (error) {
    logger.error('Get popular publications error:', error);
    throw error;
  }
};

/**
 * Clear all bookmarks for user
 */
export const clearBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await Bookmark.deleteMany({ userId: req.user._id });

    logger.info(`All bookmarks cleared for user: ${req.user.email} (${result.deletedCount} bookmarks)`);

    const response: ApiResponse = {
      success: true,
      message: `${result.deletedCount} bookmarks cleared successfully`,
    };

    res.json(response);
  } catch (error) {
    logger.error('Clear bookmarks error:', error);
    throw error;
  }
};
