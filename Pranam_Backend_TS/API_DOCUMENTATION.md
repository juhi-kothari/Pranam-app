# Pranam Backend API Documentation

## Overview

The Pranam Backend API is a RESTful service built with Node.js, TypeScript, Express.js, and MongoDB. It provides endpoints for managing publications, blogs, user authentication, shopping cart, orders, and bookmarks.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with a dual-token system:
- **Access Token**: Short-lived (7 days) for API requests
- **Refresh Token**: Long-lived (30 days) for token renewal

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data
  "pagination": { // For paginated responses
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "error": "Error message" // Only present on errors
}
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Sensitive Operations**: 10 requests per hour per IP

## Endpoints

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "environment": "production"
  }
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "1234567890", // Optional
  "address": { // Optional
    "street": "123 Main St",
    "city": "Anytown",
    "state": "State",
    "pincode": "123456",
    "country": "Country"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### POST /api/auth/login
Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### POST /api/auth/refresh-token
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### POST /api/auth/logout
Logout user and invalidate refresh token.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### GET /api/auth/profile
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

### PUT /api/auth/profile
Update user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "address": {
    "street": "456 Oak Ave",
    "city": "New City",
    "state": "New State",
    "pincode": "654321",
    "country": "Country"
  }
}
```

### PUT /api/auth/change-password
Change user password.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

---

## Publications Endpoints

### GET /api/publications
Get all publications with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12, max: 100)
- `sort` (string): Sort field (default: 'createdAt')
- `order` (string): Sort order 'asc' or 'desc' (default: 'desc')
- `category` (string): Filter by category
- `author` (string): Filter by author
- `search` (string): Search in title, author, description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `tags` (array): Filter by tags

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "publication_id",
      "title": "Book Title",
      "subtitle": "Book Subtitle",
      "author": "Author Name",
      "description": "Book description",
      "price": 299,
      "category": "Publication",
      "image": "image_url",
      "stock": 50,
      "readCount": 100,
      "tags": ["tag1", "tag2"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  }
}
```

### GET /api/publications/:id
Get publication by ID.

### GET /api/publications/categories
Get all publication categories.

### GET /api/publications/authors
Get all publication authors.

### GET /api/publications/featured
Get featured publications (most read).

### GET /api/publications/:id/related
Get related publications.

### POST /api/publications (Admin Only)
Create new publication.

**Headers:** `Authorization: Bearer <admin_access_token>`

### PUT /api/publications/:id (Admin Only)
Update publication.

### DELETE /api/publications/:id (Admin Only)
Delete publication (soft delete).

---

## Blog Endpoints

### GET /api/blogs
Get all blogs with filtering and pagination.

**Query Parameters:**
- `page`, `limit`, `sort`, `order`: Pagination options
- `author`: Filter by author
- `category`: Filter by category
- `search`: Search in title, description, content
- `tags`: Filter by tags
- `published`: Filter by published status (admin only)

### GET /api/blogs/:id
Get blog by ID.

### GET /api/blogs/categories
Get all blog categories.

### GET /api/blogs/authors
Get all blog authors.

### GET /api/blogs/featured
Get featured blogs (most read).

### GET /api/blogs/:id/related
Get related blogs.

### POST /api/blogs/:id/like
Like a blog.

**Headers:** `Authorization: Bearer <access_token>`

### POST /api/blogs (Admin Only)
Create new blog.

### PUT /api/blogs/:id (Admin Only)
Update blog.

### DELETE /api/blogs/:id (Admin Only)
Delete blog.

---

## Cart Endpoints

All cart endpoints require authentication.

### GET /api/cart
Get user's cart.

### GET /api/cart/count
Get cart item count.

### POST /api/cart/add
Add item to cart.

**Request Body:**
```json
{
  "publicationId": "publication_id",
  "quantity": 2
}
```

### PUT /api/cart/item/:publicationId
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /api/cart/item/:publicationId
Remove item from cart.

### DELETE /api/cart/clear
Clear entire cart.

---

## Order Endpoints

All order endpoints require authentication.

### POST /api/orders
Create new order.

**Request Body:**
```json
{
  "items": [
    {
      "publicationId": "publication_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "1234567890",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "State",
    "pincode": "123456",
    "country": "Country"
  },
  "paymentMethod": "cod",
  "notes": "Special instructions"
}
```

### GET /api/orders/my-orders
Get user's orders.

### GET /api/orders/:id
Get order by ID.

### PUT /api/orders/:id/cancel
Cancel order.

### GET /api/orders (Admin Only)
Get all orders.

### PUT /api/orders/:id/status (Admin Only)
Update order status.

### GET /api/orders/admin/stats (Admin Only)
Get order statistics.

---

## Bookmark Endpoints

All bookmark endpoints require authentication.

### GET /api/bookmarks
Get user's bookmarks.

### GET /api/bookmarks/count
Get bookmark count.

### POST /api/bookmarks
Add bookmark.

**Request Body:**
```json
{
  "publicationId": "publication_id"
}
```

### POST /api/bookmarks/toggle
Toggle bookmark.

### GET /api/bookmarks/check/:publicationId
Check if publication is bookmarked.

### DELETE /api/bookmarks/:publicationId
Remove bookmark.

### DELETE /api/bookmarks/clear
Clear all bookmarks.

### GET /api/bookmarks/popular
Get popular publications (most bookmarked).

---

## Comment Endpoints

### GET /api/comments/blog/:blogId
Get comments for a blog.

### POST /api/comments
Create comment.

**Request Body:**
```json
{
  "name": "Commenter Name",
  "email": "commenter@example.com", // Optional
  "text": "Comment text",
  "blogId": "blog_id",
  "parentComment": "parent_comment_id" // Optional for replies
}
```

### GET /api/comments/pending (Admin Only)
Get pending comments.

### PUT /api/comments/:id/approve (Admin Only)
Approve comment.

### DELETE /api/comments/:id (Admin Only)
Delete comment.

### GET /api/comments/stats (Admin Only)
Get comment statistics.

---

## Data Models

### User
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // Hashed
  role: 'user' | 'admin',
  phone?: string,
  address?: {
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  },
  isActive: boolean,
  refreshTokens: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### Publication
```typescript
{
  _id: ObjectId,
  title: string,
  subtitle?: string,
  author: string,
  description: string,
  price: number,
  category: string,
  image: string,
  textColor?: string,
  stock: number,
  readCount: number,
  tags: string[],
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  orderNumber: string,
  items: [{
    publicationId: ObjectId,
    title: string,
    author: string,
    price: number,
    quantity: number,
    image: string
  }],
  totalAmount: number,
  totalItems: number,
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentMethod: 'cod' | 'online',
  shippingAddress: {
    name: string,
    phone: string,
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  },
  trackingNumber?: string,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```
