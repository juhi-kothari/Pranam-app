// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('pranam_db');

// Create application user with read/write permissions
db.createUser({
  user: 'pranam_user',
  pwd: 'pranam_password_change_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'pranam_db'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address and is required'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'must be a string with minimum 6 characters and is required'
        },
        role: {
          bsonType: 'string',
          enum: ['user', 'admin'],
          description: 'must be either user or admin'
        },
        isActive: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

db.createCollection('publications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'author', 'price', 'category', 'image'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        author: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        price: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a positive number and is required'
        },
        category: {
          bsonType: 'string',
          enum: ['Publication', 'Calendar', 'Poetry', 'Spiritual', 'Philosophy', 'Self-Help', 'Other'],
          description: 'must be a valid category and is required'
        },
        image: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        stock: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a non-negative number'
        },
        isActive: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ role: 1 });

db.publications.createIndex({ title: 'text', author: 'text', description: 'text' });
db.publications.createIndex({ category: 1 });
db.publications.createIndex({ author: 1 });
db.publications.createIndex({ price: 1 });
db.publications.createIndex({ isActive: 1 });
db.publications.createIndex({ stock: 1 });
db.publications.createIndex({ readCount: -1 });

db.blogs.createIndex({ title: 'text', description: 'text', content: 'text' });
db.blogs.createIndex({ author: 1 });
db.blogs.createIndex({ category: 1 });
db.blogs.createIndex({ isPublished: 1 });
db.blogs.createIndex({ date: -1 });

db.comments.createIndex({ blogId: 1 });
db.comments.createIndex({ isApproved: 1 });
db.comments.createIndex({ createdAt: -1 });

db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ orderStatus: 1 });
db.orders.createIndex({ createdAt: -1 });

db.carts.createIndex({ userId: 1 }, { unique: true });

db.bookmarks.createIndex({ userId: 1 });
db.bookmarks.createIndex({ publicationId: 1 });
db.bookmarks.createIndex({ userId: 1, publicationId: 1 }, { unique: true });

print('MongoDB initialization completed successfully!');
print('Database: pranam_db');
print('User: pranam_user created with readWrite permissions');
print('Collections and indexes created successfully');
