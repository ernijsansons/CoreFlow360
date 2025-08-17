#!/bin/bash

# CoreFlow360 Deployment Script
# This script helps deploy the application to Vercel

set -e

echo "🚀 Starting CoreFlow360 deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Consider committing them first."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ensure we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're not on the main branch. Deployments should be from main."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests (optional)
echo "🧪 Running tests..."
npm run test || {
    echo "⚠️  Tests failed, but continuing with deployment..."
}

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Push to main branch
echo "📤 Pushing to main branch..."
git push origin main

echo "🎉 Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Check Vercel dashboard: https://vercel.com/ernijsansons-projects/core-flow360"
echo "2. Monitor the deployment progress"
echo "3. Set up environment variables in Vercel if needed:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo "   - ENCRYPTION_KEY"
echo ""
echo "🌐 Your site will be available at: https://coreflow360.com"
echo ""
echo "🔧 If deployment fails, check:"
echo "   - Vercel build logs"
echo "   - Environment variable configuration"
echo "   - Branch settings (should be 'main')"
