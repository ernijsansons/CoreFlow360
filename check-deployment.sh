#!/bin/bash

# CoreFlow360 - Deployment Status Checker
# This script monitors the deployment status and provides helpful information

echo "🔍 CoreFlow360 - Deployment Status Check"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check latest commit
echo "📝 Latest commit:"
git log -1 --oneline
echo ""

# Check branch
echo "🌿 Current branch:"
git branch --show-current
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    git status -s
    echo ""
fi

# Check if we're ahead of origin
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null)
if [ $? -eq 0 ]; then
    if [ $LOCAL != $REMOTE ]; then
        echo -e "${YELLOW}⚠️  Local branch differs from remote${NC}"
        echo "   Run: git push origin main"
        echo ""
    else
        echo -e "${GREEN}✅ Local and remote branches are in sync${NC}"
        echo ""
    fi
fi

# Check deployment URLs
echo "🌐 Checking deployment endpoints..."
echo ""

# Check main domain
echo -n "Checking https://coreflow360.com... "
if curl -s -o /dev/null -w "%{http_code}" https://coreflow360.com | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Accessible${NC}"
else
    echo -e "${RED}❌ Not accessible${NC}"
fi

# Check Vercel deployment
echo -n "Checking Vercel deployment... "
if curl -s -o /dev/null -w "%{http_code}" https://core-flow360.vercel.app | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Accessible${NC}"
else
    echo -e "${RED}❌ Not accessible${NC}"
fi

echo ""
echo "📋 Deployment Commands:"
echo "   - Force rebuild: curl -X POST 'https://api.vercel.com/v1/integrations/deploy/prj_A09SK4Bp6C6TYcJXedNtZA2UvCs9/Emwdczu7Uz' -H 'Content-Type: application/json' -d '{\"force\": true}'"
echo "   - Push changes: git push origin main"
echo "   - Check logs: Visit https://vercel.com/ernijsansons-projects/core-flow360"
echo ""

# Check package.json for build script
echo "🏗️  Build configuration:"
grep -E '"build":|"build:production":' package.json | sed 's/^/   /'
echo ""

# Check for vercel.json
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json found${NC}"
else
    echo -e "${YELLOW}⚠️  vercel.json not found${NC}"
fi

# Check for .vercelignore
if [ -f ".vercelignore" ]; then
    echo -e "${GREEN}✅ .vercelignore found${NC}"
else
    echo -e "${YELLOW}⚠️  .vercelignore not found${NC}"
fi

echo ""
echo "💡 Next steps:"
echo "   1. Check Vercel dashboard for build logs"
echo "   2. Update environment variables if build succeeds"
echo "   3. Test authentication and API endpoints"
echo ""
echo "📚 Documentation: VERCEL_DEPLOYMENT_CHECKLIST.md"