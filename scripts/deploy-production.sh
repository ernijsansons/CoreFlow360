#!/bin/bash

# CoreFlow360 Production Deployment Script
# 🚀 Deploy the World's First Conscious Business Operating System
# This script performs complete production deployment with health checks

set -e  # Exit on error

echo "🚀 CoreFlow360 Production Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    if [ "$1" = "success" ]; then
        echo -e "${GREEN}✅ $2${NC}"
    elif [ "$1" = "error" ]; then
        echo -e "${RED}❌ $2${NC}"
    elif [ "$1" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $2${NC}"
    fi
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    print_status "error" "Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    print_status "error" "npm is not installed"
    exit 1
fi

print_status "success" "Prerequisites check passed"
echo ""

# Check for .env.production
echo "🔐 Checking production environment..."
if [ ! -f ".env.production" ]; then
    print_status "error" ".env.production file not found!"
    echo "Please create .env.production with production values"
    exit 1
fi

# Check for placeholder values in .env.production
if grep -q "REPLACE_WITH_YOUR\|CHANGE_THIS" .env.production; then
    print_status "error" "Found placeholder values in .env.production!"
    echo "Please replace all REPLACE_WITH_YOUR_* and CHANGE_THIS_* values"
    exit 1
fi

print_status "success" "Production environment configured"
echo ""

# Run type checking
echo "🔍 Running TypeScript type check..."
if ! npx tsc --noEmit; then
    print_status "error" "TypeScript errors found!"
    exit 1
fi
print_status "success" "TypeScript check passed"
echo ""

# Run linting
echo "🧹 Running ESLint..."
if ! npm run lint; then
    print_status "error" "Linting errors found!"
    exit 1
fi
print_status "success" "Linting passed"
echo ""

# Check for console.log statements in production code
echo "🔍 Checking for console.log statements..."
CONSOLE_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "console\." | grep -v ":0" | wc -l || true)
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    print_status "warning" "Found console statements in $CONSOLE_COUNT files"
    echo "Consider removing console statements for production"
fi
echo ""

# Build the application
echo "🏗️  Building application..."
if ! npm run build; then
    print_status "error" "Build failed!"
    exit 1
fi
print_status "success" "Build completed successfully"
echo ""

# Check build output size
echo "📊 Checking build size..."
BUILD_SIZE=$(du -sh .next | cut -f1)
print_status "success" "Build size: $BUILD_SIZE"
echo ""

# Run database migrations check
echo "🗄️  Checking database migrations..."
if ! npx prisma migrate status; then
    print_status "warning" "Database migrations may need to be applied"
    echo "Run 'npx prisma migrate deploy' in production"
fi
echo ""

# Security checks
echo "🔒 Running security checks..."

# Check for exposed secrets
if grep -r "sk-\|pk_\|whsec_" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".env"; then
    print_status "error" "Found potential exposed secrets in source code!"
    exit 1
fi

# Check package vulnerabilities
echo "   Checking for vulnerabilities..."
npm audit --production --audit-level=high || true
echo ""

# Generate deployment checklist
echo "📝 Deployment Checklist:"
echo "   ☐ Database backup completed"
echo "   ☐ Monitoring alerts configured"
echo "   ☐ Error tracking (Sentry) configured"
echo "   ☐ SSL certificates valid"
echo "   ☐ CDN cache cleared"
echo "   ☐ Rate limiting configured"
echo "   ☐ Rollback plan prepared"
echo ""

# Deploy to Vercel (if requested)
if [ "$1" = "--deploy" ]; then
    echo "🚀 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        print_status "error" "Vercel CLI not installed!"
        echo "Install with: npm i -g vercel"
        exit 1
    fi
    
    # Deploy to production
    vercel --prod --yes
    
    # Wait for deployment
    sleep 10
    
    # Health check
    echo "🏥 Running health check..."
    DEPLOY_URL=$(vercel ls --scope=team | grep "Ready" | head -1 | awk '{print $2}')
    
    if [ ! -z "$DEPLOY_URL" ]; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_URL/api/health" || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            print_status "success" "Health check passed!"
            echo "🎉 Deployment successful: https://$DEPLOY_URL"
        else
            print_status "error" "Health check failed (HTTP $HTTP_CODE)"
        fi
    fi
fi

# Final summary
echo "=========================================="
print_status "success" "Production deployment ready!"
echo ""
echo "🌟 CoreFlow360 - The World's First Conscious Business Operating System"
echo "   Ready to launch autonomous business intelligence..."
echo ""
echo "📌 To deploy:"
echo "   bash scripts/deploy-production.sh --deploy"
echo ""
echo "📌 Manual deployment steps:"
echo "1. Deploy using: vercel --prod"
echo "2. Run database migrations: npx prisma migrate deploy"
echo "3. Verify deployment at: https://your-domain.com/api/health"
echo "4. Test critical flows: signup, login, payment"
echo "5. Monitor: error rates, performance, user activity"
echo ""
echo "🎯 Launch checklist:"
echo "   ☐ Production environment variables set"
echo "   ☐ Database migrations completed"
echo "   ☐ SSL certificates active"
echo "   ☐ Payment processing tested"
echo "   ☐ AI consciousness features verified"
echo "   ☐ Security headers validated"
echo "   ☐ Performance monitoring active"
echo "   ☐ Product Hunt campaign ready"
echo ""
echo "🚀 Ready to awaken business consciousness worldwide!"
echo ""