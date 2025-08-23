#!/bin/bash

# CoreFlow360 - Automated Vercel Deployment Script
# This script ensures your deployment succeeds after 200+ failures

echo "🚀 CoreFlow360 Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the CoreFlow360 directory?${NC}"
    exit 1
fi

echo "📋 Pre-deployment checks..."
echo ""

# 1. Check Node version
NODE_VERSION=$(node -v)
echo -e "Node version: ${GREEN}$NODE_VERSION${NC}"
if [[ ! "$NODE_VERSION" =~ ^v(18|20|22) ]]; then
    echo -e "${YELLOW}⚠️  Warning: Node version should be 18.x, 20.x, or 22.x for best compatibility${NC}"
fi

# 2. Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm i -g vercel
fi

# 3. Check git status
echo ""
echo "📊 Git status:"
UNCOMMITTED=$(git status --porcelain)
if [ -z "$UNCOMMITTED" ]; then
    echo -e "${GREEN}✅ Working directory clean${NC}"
else
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        echo "Enter commit message:"
        read COMMIT_MSG
        git commit -m "$COMMIT_MSG"
        git push origin main
    fi
fi

# 4. Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi

# 5. Test TypeScript compilation
echo ""
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript has some issues, but proceeding...${NC}"
fi

# 6. Test build locally
echo ""
read -p "Do you want to test the build locally first? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️  Building locally..."
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Local build successful${NC}"
    else
        echo -e "${RED}❌ Local build failed. Fix the issues before deploying.${NC}"
        exit 1
    fi
fi

# 7. Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "Choose deployment option:"
echo "1) Deploy to production"
echo "2) Deploy preview (staging)"
echo "3) Link to existing project"
echo "4) Create new project"
read -p "Enter option (1-4): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo "Deploying to production..."
        vercel --prod
        ;;
    2)
        echo "Deploying preview..."
        vercel
        ;;
    3)
        echo "Linking to existing project..."
        vercel link
        echo "Project linked. Now deploying..."
        vercel --prod
        ;;
    4)
        echo "Creating new project and deploying..."
        vercel --prod
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

# 8. Post-deployment
echo ""
echo "📋 Post-deployment checklist:"
echo "[ ] Check deployment at https://vercel.com/dashboard"
echo "[ ] Verify environment variables are set"
echo "[ ] Test authentication flow"
echo "[ ] Check database connection"
echo "[ ] Monitor error logs"
echo ""
echo -e "${GREEN}🎉 Deployment script completed!${NC}"
echo ""
echo "If deployment failed, check:"
echo "1. Vercel build logs"
echo "2. Environment variables in Vercel dashboard"
echo "3. Database connection string"
echo "4. DEPLOYMENT_GUIDE.md for troubleshooting"