# Pranam Backend API

A production-ready TypeScript backend service for the Pranam publication platform, built with Node.js, Express.js, MongoDB, and comprehensive security features.

## 🚀 Features

- **Complete REST API** with authentication, publications, blogs, cart, orders, and bookmarks
- **JWT Authentication** with access/refresh token rotation
- **MongoDB Integration** with Mongoose ODM and proper indexing
- **TypeScript** with strict type checking and comprehensive interfaces
- **Security First** with rate limiting, input validation, CORS, and security headers
- **Docker Support** with multi-stage builds and docker-compose
- **Comprehensive Testing** with Jest, unit tests, and integration tests
- **Production Ready** with logging, monitoring, error handling, and graceful shutdown
- **API Documentation** with detailed endpoint specifications

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 7.0+
- Docker and Docker Compose (optional)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pranam_Backend_TS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if not using Docker)
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using MongoDB Docker container
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

### Docker Development

1. **Start all services**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **View logs**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f api
   ```

3. **Stop services**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGO_URI=mongodb://localhost:27017/pranam_db

# JWT Secrets (CHANGE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# CORS
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Logging
LOG_LEVEL=info

# File Upload (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin User (Optional)
ADMIN_EMAIL=admin@pranam.com
ADMIN_PASSWORD=admin-password-change-in-production
```

## 🏗️ Project Structure

```
Pranam_Backend_TS/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── tests/           # Test files
│   └── server.ts        # Main application file
├── scripts/             # Database and utility scripts
├── nginx/              # Nginx configuration
├── logs/               # Application logs
├── uploads/            # File uploads
├── docker-compose.yml  # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
├── Dockerfile          # Docker image definition
└── package.json        # Dependencies and scripts
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://your-domain.com/api/v1`

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <access_token>
```

### Main Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh-token` | Refresh access token | No |
| GET | `/auth/profile` | Get user profile | Yes |
| GET | `/publications` | Get publications | No |
| GET | `/blogs` | Get blogs | No |
| GET | `/cart` | Get user cart | Yes |
| POST | `/orders` | Create order | Yes |
| GET | `/bookmarks` | Get user bookmarks | Yes |

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Model and utility function tests
- **Integration Tests**: API endpoint tests
- **Test Database**: Uses MongoDB Memory Server for isolated testing

## 🚀 Deployment

### Production Docker

1. **Build and start services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f api
   ```

3. **Scale services**
   ```bash
   docker-compose up -d --scale api=3
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment Setup

1. **Set production environment variables**
2. **Configure MongoDB with authentication**
3. **Set up reverse proxy (Nginx)**
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

## 📊 Monitoring and Logging

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
- **Development**: Console output with colors
- **Production**: JSON format with file rotation
- **Location**: `./logs/` directory

### Metrics
- Request/response logging with correlation IDs
- Error tracking with stack traces
- Performance monitoring with response times

## 🔒 Security Features

- **JWT Authentication** with token rotation
- **Rate Limiting** on all endpoints
- **Input Validation** and sanitization
- **CORS** configuration
- **Security Headers** (Helmet.js)
- **Password Hashing** with bcrypt
- **SQL Injection Protection** via Mongoose
- **XSS Protection** with input sanitization

## 🛡️ Production Checklist

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Configure MongoDB with authentication
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Configure monitoring and alerting
- [ ] Test all API endpoints
- [ ] Run security audit: `npm audit`
- [ ] Set up log rotation
- [ ] Configure reverse proxy
- [ ] Test disaster recovery procedures

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server

# Testing
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier

# Database
npm run seed        # Seed production data
npm run seed:demo   # Seed demo data (development only)

# Docker
npm run docker:dev  # Start development environment
npm run docker:prod # Start production environment
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review the [Production Checklist](./PRODUCTION_CHECKLIST.md)

## 🔄 Version History

- **v1.0.0** - Initial release with complete API functionality
- **v1.1.0** - Added Docker support and enhanced security
- **v1.2.0** - Added comprehensive testing and documentation
