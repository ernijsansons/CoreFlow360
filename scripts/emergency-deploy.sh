#!/bin/bash

echo "🚨 EMERGENCY DEPLOYMENT SCRIPT - CoreFlow360"
echo "============================================"

# Step 1: Clean and verify
echo "🧹 Step 1: Cleaning and verifying..."
rm -rf node_modules package-lock.json .next
npm cache clean --force

# Step 2: Fresh install
echo "📦 Step 2: Fresh dependency installation..."
npm install --legacy-peer-deps

# Step 3: Build verification
echo "🔨 Step 3: Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Exiting."
    exit 1
fi
echo "✅ Build successful!"

# Step 4: Deploy to multiple platforms
echo "🚀 Step 4: Deploying to multiple platforms..."

# Try Vercel first
echo "📤 Attempting Vercel deployment..."
npx vercel --prod --yes || echo "⚠️ Vercel failed, trying alternatives..."

# Try Netlify if Vercel fails
echo "📤 Attempting Netlify deployment..."
npx netlify deploy --prod --dir=.next || echo "⚠️ Netlify failed..."

echo "🎯 Deployment attempts completed!"
echo "📊 Check status at:"
echo "   - Vercel: https://vercel.com/ernijsansons-projects/coreflow360"
echo "   - Netlify: https://app.netlify.com"
