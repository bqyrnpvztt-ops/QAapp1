# Railway Deployment Guide

## Prerequisites
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login to Railway: `railway login`
3. Link your project: `railway link`

## Step-by-Step Deployment

### 1. Initialize Railway Project
```bash
# Login to Railway
railway login

# Link to your GitHub repository
railway link

# Add the project to Railway
railway add
```

### 2. Configure Environment Variables
```bash
# Set production environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-super-secret-jwt-key-change-this
railway variables set PORT=3000
railway variables set DB_FILE=/data/qa_testing.db
railway variables set UPLOAD_DIR=/data/uploads
```

### 3. Add Persistent Volume
```bash
# Add persistent volume for database and uploads
railway volume add --name data --mount /data --size 1GB
```

### 4. Deploy Application
```bash
# Deploy to Railway
railway up
```

### 5. Seed Database
After deployment, run the database initialization:
```bash
# Connect to Railway shell
railway shell

# Initialize database with all test queries
node init-db.js
```

## Access Your Application
- **PWA**: `https://your-app-name.railway.app`
- **Dashboard**: `https://your-app-name.railway.app/admin`

## Default Login Credentials
- **Tester**: `tester@qa-testing.com` / `tester123`
- **Admin**: `admin@qa-testing.com` / `admin123`

## Features Included
✅ **1,060 Test Queries** across all categories
✅ **Persistent Database** - SQLite with volume storage
✅ **File Upload Storage** - Screenshots saved to persistent volume
✅ **PWA** - Mobile-friendly testing interface
✅ **Admin Dashboard** - Developer management interface
✅ **JWT Authentication** - Secure user sessions
✅ **Rate Limiting** - API protection
✅ **CORS Configuration** - Cross-origin support

## Troubleshooting
- If deployment fails, check Railway logs: `railway logs`
- If database issues occur, verify volume is mounted: `railway shell` then `ls -la /data`
- If uploads fail, check upload directory permissions: `ls -la /data/uploads`
