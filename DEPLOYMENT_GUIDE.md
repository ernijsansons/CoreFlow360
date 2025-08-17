# CoreFlow360 Deployment Guide

This guide will help you successfully deploy CoreFlow360 to Vercel.

## 🚀 Quick Deployment

### Option 1: Automated Script
```bash
# Make the script executable
chmod +x scripts/deploy.sh

# Run the deployment script
./scripts/deploy.sh
```

### Option 2: Manual Deployment
```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build the project
npm run build

# Push to trigger deployment
git push origin main
```

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables
Make sure these environment variables are set in Vercel:

**Required for Production:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Set to: `https://coreflow360.com`

**Optional but Recommended:**
- `ENCRYPTION_KEY` - 64-character hex string
- `STRIPE_SECRET_KEY` - For payment processing
- `OPENAI_API_KEY` - For AI features

### 2. Vercel Configuration
1. Go to [Vercel Dashboard](https://vercel.com/ernijsansons-projects/core-flow360)
2. Navigate to Settings → Git
3. Ensure **Production Branch** is set to `main`
4. Verify the repository is connected correctly

### 3. Database Setup
1. Set up a PostgreSQL database (e.g., on Supabase, Railway, or Vercel Postgres)
2. Update the `DATABASE_URL` environment variable
3. Run migrations: `npx prisma migrate deploy`

## 🛠️ Troubleshooting Common Issues

### Issue 1: Build Fails with Environment Validation
**Error:** `Environment validation failed: NEXTAUTH_SECRET: Required`

**Solution:**
- The build is now configured to use placeholders during build time
- Make sure you're using the latest code from the main branch
- Check that Vercel is building from the `main` branch, not `master`

### Issue 2: Vercel Building from Wrong Branch
**Problem:** Vercel is building from `master` instead of `main`

**Solution:**
1. Go to Vercel Project Settings → Git
2. Change "Production Branch" from `master` to `main`
3. Save and redeploy

### Issue 3: Database Connection Issues
**Error:** `Database connection failed`

**Solution:**
1. Verify `DATABASE_URL` is set correctly in Vercel
2. Ensure the database is accessible from Vercel's servers
3. Check if the database requires SSL (add `?sslmode=require` to URL)

### Issue 4: Encryption Key Issues
**Error:** `Invalid encryption key: must be 64 character hex string`

**Solution:**
- The build now uses a valid 64-character placeholder
- For production, set a proper `ENCRYPTION_KEY` in Vercel environment variables

## 📋 Deployment Steps

### Step 1: Prepare Your Code
```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Check for any uncommitted changes
git status
```

### Step 2: Test Locally
```bash
# Install dependencies
npm ci

# Run tests
npm run test

# Build locally
npm run build
```

### Step 3: Deploy
```bash
# Push to main branch (triggers Vercel deployment)
git push origin main
```

### Step 4: Monitor Deployment
1. Go to [Vercel Dashboard](https://vercel.com/ernijsansons-projects/core-flow360)
2. Check the latest deployment
3. Monitor build logs for any errors
4. Wait for deployment to complete

### Step 5: Verify Deployment
1. Visit your site: https://coreflow360.com
2. Test key functionality
3. Check for any console errors
4. Verify environment variables are working

## 🔍 Monitoring Your Deployment

### Vercel Dashboard
- **Deployments:** View all deployment history
- **Functions:** Monitor serverless function performance
- **Analytics:** Track site performance and usage

### Environment Variables
- Go to Settings → Environment Variables
- Verify all required variables are set
- Check that variables are deployed to production

### Build Logs
- Click on any deployment to view detailed logs
- Look for any error messages or warnings
- Check if all dependencies installed correctly

## 🚨 Emergency Procedures

### Rollback Deployment
1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "Redeploy" to rollback

### Fix Critical Issues
1. Make changes locally
2. Test thoroughly
3. Commit and push to main
4. Monitor the new deployment

### Database Issues
1. Check database connection
2. Verify environment variables
3. Run `npx prisma migrate deploy` if needed
4. Check database logs for errors

## 📞 Getting Help

If you encounter issues:

1. **Check the logs:** Vercel provides detailed build and runtime logs
2. **Review this guide:** Most common issues are covered here
3. **Check GitHub Issues:** Look for similar problems in the repository
4. **Contact Support:** Use Vercel's support if needed

## 🎯 Success Indicators

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Site loads at https://coreflow360.com
- ✅ No console errors in browser
- ✅ Database connections work
- ✅ Authentication functions properly
- ✅ All features are accessible

## 🔄 Continuous Deployment

Once set up, your site will automatically deploy when you:

1. Push changes to the `main` branch
2. Create a pull request (preview deployment)
3. Merge a pull request (production deployment)

---

**Need help?** Check the troubleshooting section above or review the Vercel documentation for more detailed information.
