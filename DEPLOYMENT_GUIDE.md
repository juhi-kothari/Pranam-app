# 🚀 Complete Deployment Guide - Pranam Full Stack Application

## 📋 Overview

This guide will help you deploy both the **React frontend** and **Node.js backend** with full chat functionality.

## 🎯 Deployment Order

**IMPORTANT:** Deploy the backend first, then the frontend!

---

## 🔧 STEP 1: Deploy Backend (Pranam_Backend_TS)

### 1.1 Render Configuration
```
Service Type: Web Service
Repository: Your GitHub repo
Branch: main
Root Directory: Pranam_Backend_TS

Build Command: npm install && npm run build
Start Command: npm start
```

### 1.2 Environment Variables (REQUIRED)
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pranam_db
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-minimum-32-characters
ADMIN_EMAIL=admin@pranam.com
ADMIN_PASSWORD=your-secure-admin-password
```

### 1.3 Test Backend Deployment
Once deployed, test these endpoints:
- `https://your-backend-app.onrender.com/health`
- `https://your-backend-app.onrender.com/api/test`

---

## 🎨 STEP 2: Deploy Frontend (Pranam)

### 2.1 Update Environment Variables
In `Pranam/.env`, change:
```
VITE_API_URL=https://your-backend-app.onrender.com
```

### 2.2 Render Configuration
```
Service Type: Static Site
Repository: Your GitHub repo
Branch: main
Root Directory: Pranam

Build Command: npm install && npm run build
Publish Directory: dist
```

### 2.3 Environment Variables
```
VITE_API_URL=https://your-backend-app.onrender.com
```

---

## 🧪 STEP 3: Test Chat Functionality

### 3.1 Create Admin User
1. Go to your backend URL: `https://your-backend-app.onrender.com/api/admin/create-admin`
2. This will create an admin user with the credentials from your environment variables

### 3.2 Test Anonymous Chat
1. Go to your frontend URL
2. Click the chat widget (bottom right)
3. Send a message as anonymous user
4. Message should appear in chat

### 3.3 Test Admin Chat Response
1. Go to `https://your-frontend-app.onrender.com/auth`
2. Login with admin credentials:
   - Email: admin@pranam.com (or your ADMIN_EMAIL)
   - Password: your-secure-admin-password (or your ADMIN_PASSWORD)
3. Go to `https://your-frontend-app.onrender.com/admin`
4. Click "Chats" tab
5. You should see the anonymous conversation
6. Click on it and reply as admin

### 3.4 Test User Chat
1. Register a new user account
2. Login and use the chat widget
3. Admin should see both anonymous and user chats

---

## 🔍 Troubleshooting

### Backend Issues
- **Build fails**: Check that Root Directory is `Pranam_Backend_TS`
- **Start fails**: Verify environment variables are set
- **Database connection**: Check MONGO_URI format
- **Chat not working**: Ensure JWT secrets are set

### Frontend Issues
- **Build fails**: Check that Root Directory is `Pranam`
- **API calls fail**: Verify VITE_API_URL points to deployed backend
- **Chat widget not appearing**: Check browser console for errors
- **Admin access denied**: Ensure admin user is created

### Chat Issues
- **Messages not sending**: Check network tab for API errors
- **Admin can't see chats**: Verify admin authentication
- **Anonymous chat fails**: Check backend logs for errors

---

## 📱 Expected Functionality

### ✅ Anonymous Users Can:
- Open chat widget
- Send messages without logging in
- See their message history in the session

### ✅ Registered Users Can:
- All anonymous features
- Persistent chat history across sessions
- Profile-linked conversations

### ✅ Admin Users Can:
- Access admin dashboard at `/admin`
- View all chat conversations
- Reply to any conversation
- See user details and conversation metadata
- Manage conversation status

---

## 🔗 Quick Deploy Commands

### Backend Deploy
```bash
# Update environment variables in Render dashboard
# Deploy will happen automatically on git push
git add .
git commit -m "Deploy backend with chat functionality"
git push origin main
```

### Frontend Deploy
```bash
# Update VITE_API_URL in .env
# Deploy will happen automatically on git push
git add .
git commit -m "Deploy frontend with backend integration"
git push origin main
```

---

## 🎉 Success Checklist

- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly
- [ ] Anonymous chat works
- [ ] Admin can login and access dashboard
- [ ] Admin can see and reply to chats
- [ ] User registration and chat works
- [ ] All API endpoints responding correctly

Your full-stack chat application is now live! 🚀
