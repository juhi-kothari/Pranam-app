import mongoose from 'mongoose';
import { User } from '@/models/User';
import { Publication } from '@/models/Publication';
import { Blog } from '@/models/Blog';
import { connectDB } from '@/config/database';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';

/**
 * Production seed script
 * Creates essential data for production environment
 */

const seedProduction = async (): Promise<void> => {
  try {
    logger.info('Starting production seed...');

    // Connect to database
    await connectDB();

    // Create admin user if it doesn't exist
    const adminEmail = config.adminEmail || 'admin@pranam.com';
    const adminPassword = config.adminPassword || 'admin123';

    const existingAdmin = await User.findByEmail(adminEmail);
    if (!existingAdmin) {
      const admin = new User({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      await admin.save();
      logger.info(`Admin user created: ${adminEmail}`);
    } else {
      logger.info('Admin user already exists');
    }

    // Create essential categories if no publications exist
    const publicationCount = await Publication.countDocuments();
    if (publicationCount === 0) {
      const essentialPublications = [
        {
          title: 'Welcome to Pranam',
          subtitle: 'Getting Started Guide',
          author: 'Pranam Team',
          description: 'A comprehensive guide to get started with Pranam publications.',
          price: 0,
          category: 'Publication',
          image: '/images/welcome-guide.jpg',
          stock: 1000,
          tags: ['guide', 'welcome', 'getting-started'],
          isActive: true,
        },
      ];

      for (const pubData of essentialPublications) {
        const publication = new Publication(pubData);
        await publication.save();
        logger.info(`Created publication: ${publication.title}`);
      }
    }

    // Create welcome blog post if no blogs exist
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      const welcomeBlog = new Blog({
        title: 'Welcome to Pranam Blog',
        description: 'Introduction to our publication platform',
        content: `
# Welcome to Pranam

We are excited to welcome you to Pranam, your premier destination for spiritual and philosophical publications.

## What We Offer

- **Publications**: A curated collection of books and materials
- **Blog**: Insights and articles from our community
- **Community**: Connect with like-minded individuals

## Getting Started

1. Browse our publications
2. Create an account
3. Start your journey

Thank you for joining us!
        `.trim(),
        author: 'Pranam Team',
        authorId: (await User.findByEmail(adminEmail))!._id,
        category: 'Announcement',
        tags: ['welcome', 'introduction', 'getting-started'],
        isPublished: true,
        date: new Date(),
      });

      await welcomeBlog.save();
      logger.info(`Created welcome blog: ${welcomeBlog.title}`);
    }

    logger.info('Production seed completed successfully');
  } catch (error) {
    logger.error('Production seed failed:', error);
    throw error;
  }
};

// Run seed if called directly
if (require.main === module) {
  seedProduction()
    .then(() => {
      logger.info('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seedProduction };
