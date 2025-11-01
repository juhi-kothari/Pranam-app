import mongoose from 'mongoose';
import { config } from './config';
import { logger } from '@/utils/logger';

// MongoDB connection options
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // bufferMaxEntries: 0, // Disable mongoose buffering (deprecated in newer versions)
  bufferCommands: false, // Disable mongoose buffering
};

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = config.nodeEnv === 'test' ? config.mongoTestUri : config.mongoUri;
    
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(mongoUri, mongooseOptions);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

export default { connectDB, disconnectDB };
