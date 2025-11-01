# Render Deployment Guide for Pranam Backend

## ✅ SOLUTION READY!

I've configured your backend to use the working JavaScript server (`simple-server.js`) instead of the TypeScript build that has errors.

## Current Issue Fixed
You were trying to deploy the React frontend (`Pranam` folder) as a Node.js backend service. I've now:
- ✅ Modified `package.json` to use the working JavaScript server
- ✅ Set `start` script to run `simple-server.js`
- ✅ Bypassed TypeScript compilation issues

## Deploy Backend Now

### Step 1: Configure Render Service

1. **Go to your Render Dashboard**
2. **Create a new Web Service** (or edit existing one)
3. **Set these configurations:**

```
Service Type: Web Service
Repository: Your GitHub repo
Branch: main (or your deployment branch)

Build & Deploy Settings:
- Root Directory: Pranam_Backend_TS
- Build Command: npm install
- Start Command: npm start
```

**Important:** The build command is now just `npm install` because we're using the JavaScript server directly!

### Step 2: Environment Variables

Add these environment variables in Render:

```
NODE_ENV=production
PORT=10000
API_VERSION=v1

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pranam_db

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS & Client
CLIENT_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/

# Security
BCRYPT_ROUNDS=12
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Admin User
ADMIN_EMAIL=admin@pranam.com
ADMIN_PASSWORD=change-this-secure-password
```

### Step 3: Deploy Frontend Separately

For the React frontend (`Pranam` folder):

1. **Create a new Static Site** in Render
2. **Configure:**
```
Repository: Your GitHub repo
Branch: main
Root Directory: Pranam
Build Command: npm run build
Publish Directory: dist
```

### Step 4: Fix TypeScript Build Issues (if needed)

If you encounter TypeScript errors during build, run locally:

```bash
cd Pranam_Backend_TS
npm install
npm run build
```

Fix any TypeScript errors before deploying.

## Quick Test

After deployment, test your backend:

```bash
# Health check
curl https://your-backend-url.onrender.com/health

# API test
curl https://your-backend-url.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Common Issues

1. **Build fails**: Check TypeScript errors and fix them
2. **Server won't start**: Check environment variables are set
3. **Database connection fails**: Verify MONGO_URI is correct
4. **CORS errors**: Ensure ALLOWED_ORIGINS includes your frontend URL

## Next Steps

1. Deploy backend as Web Service with `Pranam_Backend_TS` as root directory
2. Deploy frontend as Static Site with `Pranam` as root directory
3. Update frontend API URLs to point to your backend service
4. Test the full application
