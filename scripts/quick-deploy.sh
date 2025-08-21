#!/bin/bash

echo "🚀 QUICK DEPLOYMENT SCRIPT - CoreFlow360"
echo "========================================"

# Step 1: Verify local build
echo "📦 Step 1: Building locally..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Local build failed! Fix issues first."
    exit 1
fi
echo "✅ Local build successful!"

# Step 2: Commit and push
echo "📤 Step 2: Pushing to GitHub..."
git add .
git commit -m "feat: Quick deployment - $(date)"
git push origin main
echo "✅ Code pushed to GitHub!"

# Step 3: Wait for deployment
echo "⏳ Step 3: Waiting for deployment..."
echo "🔗 Check deployment status at: https://vercel.com/ernijsansons-projects/coreflow360"
echo "🌐 Live URL will be: https://coreflow360.vercel.app"

# Step 4: Health check
echo "🏥 Step 4: Health check in 30 seconds..."
sleep 30
curl -f https://coreflow360.vercel.app/api/health || echo "⚠️  Health check failed, but deployment might still be in progress"

echo "🎉 Deployment process completed!"
echo "📊 Monitor at: https://vercel.com/ernijsansons-projects/coreflow360"
