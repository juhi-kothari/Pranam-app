import mongoose from 'mongoose';
import { User } from '@/models/User';
import { Publication } from '@/models/Publication';
import { Blog } from '@/models/Blog';
import { Comment } from '@/models/Comment';
import { connectDB } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Demo seed script - FOR DEVELOPMENT/DEMO ONLY
 * Creates sample data for testing and demonstration
 * 
 * WARNING: This script is for development/demo purposes only.
 * Do not run in production environment.
 */

const seedDemo = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Demo seed cannot be run in production environment');
    }

    logger.info('Starting demo seed... (--demo-only)');

    // Connect to database
    await connectDB();

    // Clear existing data (demo only)
    await User.deleteMany({});
    await Publication.deleteMany({});
    await Blog.deleteMany({});
    await Comment.deleteMany({});
    logger.info('Cleared existing demo data');

    // Create demo users
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          pincode: '123456',
          country: 'India',
        },
      },
      {
        name: 'John Doe',
        email: 'john@demo.com',
        password: 'user123',
        role: 'user',
        phone: '9876543211',
        address: {
          street: '456 User Avenue',
          city: 'User City',
          state: 'User State',
          pincode: '654321',
          country: 'India',
        },
      },
      {
        name: 'Jane Smith',
        email: 'jane@demo.com',
        password: 'user123',
        role: 'user',
        phone: '9876543212',
      },
    ];

    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      logger.info(`Created demo user: ${user.email}`);
    }

    // Create demo publications
    const demoPublications = [
      {
        title: 'The Art of Mindfulness',
        subtitle: 'A Practical Guide to Present Moment Awareness',
        author: 'Dr. Sarah Johnson',
        description: 'Discover the transformative power of mindfulness in daily life. This comprehensive guide offers practical techniques and insights for cultivating present moment awareness.',
        price: 299,
        category: 'Spiritual',
        image: '/images/mindfulness.jpg',
        stock: 50,
        tags: ['mindfulness', 'meditation', 'spiritual-growth'],
        textColor: '#2D5A87',
      },
      {
        title: 'Philosophy of Ancient Wisdom',
        subtitle: 'Timeless Teachings for Modern Living',
        author: 'Prof. Michael Chen',
        description: 'Explore the profound wisdom of ancient philosophers and how their teachings remain relevant in our contemporary world.',
        price: 399,
        category: 'Philosophy',
        image: '/images/ancient-wisdom.jpg',
        stock: 30,
        tags: ['philosophy', 'wisdom', 'ancient-teachings'],
        textColor: '#8B4513',
      },
      {
        title: 'Self-Discovery Journey',
        subtitle: 'Finding Your True Purpose',
        author: 'Lisa Williams',
        description: 'A transformative guide to understanding yourself and discovering your life\'s true purpose through introspection and practical exercises.',
        price: 249,
        category: 'Self-Help',
        image: '/images/self-discovery.jpg',
        stock: 75,
        tags: ['self-help', 'personal-growth', 'purpose'],
        textColor: '#4A90E2',
      },
      {
        title: 'Spiritual Calendar 2024',
        subtitle: 'Daily Inspiration and Guidance',
        author: 'Pranam Publications',
        description: 'A beautiful calendar featuring daily spiritual quotes, moon phases, and important spiritual dates for the year 2024.',
        price: 199,
        category: 'Calendar',
        image: '/images/calendar-2024.jpg',
        stock: 100,
        tags: ['calendar', 'inspiration', 'daily-guidance'],
        textColor: '#9B59B6',
      },
      {
        title: 'Poetry of the Soul',
        subtitle: 'Verses from the Heart',
        author: 'Ravi Sharma',
        description: 'A collection of heartfelt poetry exploring themes of love, spirituality, and the human experience.',
        price: 179,
        category: 'Poetry',
        image: '/images/poetry-soul.jpg',
        stock: 40,
        tags: ['poetry', 'soul', 'spirituality', 'love'],
        textColor: '#E74C3C',
      },
    ];

    const createdPublications = [];
    for (const pubData of demoPublications) {
      const publication = new Publication(pubData);
      await publication.save();
      createdPublications.push(publication);
      logger.info(`Created demo publication: ${publication.title}`);
    }

    // Create demo blogs
    const demoBlogs = [
      {
        title: 'The Power of Daily Meditation',
        description: 'Exploring how a simple daily meditation practice can transform your life',
        content: `
# The Power of Daily Meditation

Meditation has been practiced for thousands of years, yet its benefits are more relevant today than ever before. In our fast-paced, technology-driven world, finding moments of peace and clarity has become essential for our mental and physical well-being.

## Why Meditate Daily?

Daily meditation practice offers numerous benefits:

- **Reduced Stress**: Regular meditation helps lower cortisol levels and reduces anxiety
- **Improved Focus**: Enhances concentration and mental clarity
- **Better Sleep**: Promotes relaxation and improves sleep quality
- **Emotional Balance**: Helps regulate emotions and increases self-awareness

## Getting Started

Starting a meditation practice doesn't require hours of your day. Even 5-10 minutes can make a significant difference:

1. Find a quiet space
2. Sit comfortably with your back straight
3. Focus on your breath
4. When your mind wanders, gently return to your breath
5. Start with short sessions and gradually increase

## Making It a Habit

Consistency is key to experiencing the benefits of meditation. Try to meditate at the same time each day, whether it's first thing in the morning or before bed.

Remember, meditation is a practice, not a performance. Be patient with yourself as you develop this life-changing habit.
        `.trim(),
        author: 'Dr. Sarah Johnson',
        authorId: createdUsers[0]._id,
        category: 'Meditation',
        tags: ['meditation', 'mindfulness', 'daily-practice', 'wellness'],
        isPublished: true,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        readCount: 45,
        likes: 12,
      },
      {
        title: 'Understanding Ancient Philosophy in Modern Times',
        description: 'How ancient philosophical teachings can guide us in contemporary life',
        content: `
# Understanding Ancient Philosophy in Modern Times

Ancient philosophy offers timeless wisdom that remains remarkably relevant in our modern world. The teachings of great philosophers like Aristotle, Confucius, and Buddha provide frameworks for living meaningful, ethical lives.

## Stoicism and Resilience

Stoic philosophy teaches us to focus on what we can control and accept what we cannot. This ancient wisdom is particularly valuable in today's uncertain world.

## Eastern Wisdom

Buddhist and Hindu philosophies emphasize the importance of mindfulness, compassion, and understanding the interconnectedness of all things.

## Practical Applications

- **Decision Making**: Use philosophical frameworks to make ethical choices
- **Stress Management**: Apply stoic principles to handle challenges
- **Relationships**: Practice compassion and understanding from Eastern traditions
- **Purpose**: Find meaning through philosophical inquiry

Ancient wisdom provides a foundation for navigating modern complexities with grace and wisdom.
        `.trim(),
        author: 'Prof. Michael Chen',
        authorId: createdUsers[0]._id,
        category: 'Philosophy',
        tags: ['philosophy', 'ancient-wisdom', 'stoicism', 'modern-life'],
        isPublished: true,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        readCount: 32,
        likes: 8,
      },
    ];

    const createdBlogs = [];
    for (const blogData of demoBlogs) {
      const blog = new Blog(blogData);
      await blog.save();
      createdBlogs.push(blog);
      logger.info(`Created demo blog: ${blog.title}`);
    }

    // Create demo comments
    const demoComments = [
      {
        name: 'John Doe',
        email: 'john@demo.com',
        text: 'This is a wonderful article! I\'ve been practicing meditation for a few months now and can definitely see the benefits.',
        blogId: createdBlogs[0]._id,
        userId: createdUsers[1]._id,
        isApproved: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@demo.com',
        text: 'Thank you for sharing these insights. The practical tips are very helpful for beginners.',
        blogId: createdBlogs[0]._id,
        userId: createdUsers[2]._id,
        isApproved: true,
      },
      {
        name: 'Anonymous Reader',
        email: 'reader@example.com',
        text: 'Great explanation of ancient philosophy. Looking forward to more articles like this.',
        blogId: createdBlogs[1]._id,
        isApproved: false, // Pending approval
      },
    ];

    for (const commentData of demoComments) {
      const comment = new Comment(commentData);
      await comment.save();
      
      // Add comment to blog
      const blog = await Blog.findById(comment.blogId);
      if (blog) {
        await blog.addComment(comment._id);
      }
      
      logger.info(`Created demo comment on blog: ${blog?.title}`);
    }

    logger.info('Demo seed completed successfully (--demo-only)');
    logger.info('Demo users created:');
    logger.info('  - admin@demo.com (password: admin123) - Admin');
    logger.info('  - john@demo.com (password: user123) - User');
    logger.info('  - jane@demo.com (password: user123) - User');
    logger.info(`Demo publications: ${createdPublications.length}`);
    logger.info(`Demo blogs: ${createdBlogs.length}`);
    logger.info(`Demo comments: ${demoComments.length}`);

  } catch (error) {
    logger.error('Demo seed failed:', error);
    throw error;
  }
};

// Run seed if called directly
if (require.main === module) {
  seedDemo()
    .then(() => {
      logger.info('Demo seed completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Demo seed failed:', error);
      process.exit(1);
    });
}

export { seedDemo };
