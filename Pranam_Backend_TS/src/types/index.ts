import { Document, Types } from 'mongoose';
import { Request } from 'express';

// Base interface for all documents
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User related types
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  refreshTokens: string[];
  lastLogin?: Date;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Publication related types
export interface IPublication extends BaseDocument {
  title: string;
  subtitle?: string;
  author: string;
  price: number;
  originalPrice?: number;
  description?: string;
  category: string;
  weight?: string;
  isbn?: string;
  noOfPages?: number;
  image: string;
  images?: string[];
  textColor?: string;
  isActive: boolean;
  stock: number;
  tags?: string[];
  readCount: number;
  rating?: number;
  reviews?: Types.ObjectId[];
}

// Blog/Article related types
export interface IBlog extends BaseDocument {
  title: string;
  author: string;
  authorId?: Types.ObjectId;
  date: Date;
  image: string;
  description: string;
  content: string;
  category?: string;
  tags?: string[];
  isPublished: boolean;
  readCount: number;
  likes: number;
  comments: Types.ObjectId[];
}

// Comment related types
export interface IComment extends BaseDocument {
  name: string;
  email?: string;
  text: string;
  blogId: Types.ObjectId;
  userId?: Types.ObjectId;
  isApproved: boolean;
  parentComment?: Types.ObjectId;
  replies?: Types.ObjectId[];
}

// Cart related types
export interface ICartItem {
  publicationId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends BaseDocument {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  totalItems: number;
}

// Order related types
export interface IOrderItem {
  publicationId: Types.ObjectId;
  title: string;
  author: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
}

export interface IOrder extends BaseDocument {
  userId: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  totalItems: number;
  shippingAddress: IShippingAddress;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  deliveredAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
}

// Bookmark related types
export interface IBookmark extends BaseDocument {
  userId: Types.ObjectId;
  publicationId: Types.ObjectId;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Search and filter types
export interface PublicationFilters extends PaginationQuery {
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  tags?: string[];
}

export interface BlogFilters extends PaginationQuery {
  author?: string;
  category?: string;
  search?: string;
  tags?: string[];
  published?: boolean;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string; // For frontend compatibility
  accessToken: string;
  refreshToken: string;
}

// Request types with user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
