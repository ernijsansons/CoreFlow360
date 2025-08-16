#!/bin/bash

# CoreFlow360 Production Deployment Script
# This script performs pre-deployment checks and prepares the application for production

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

# Final summary
echo "=========================================="
print_status "success" "Pre-deployment checks completed!"
echo ""
echo "📌 Next steps:"
echo "1. Review the deployment checklist above"
echo "2. Set environment variables in Vercel/hosting platform"
echo "3. Deploy using: vercel --prod"
echo "4. Run database migrations: npx prisma migrate deploy"
echo "5. Verify deployment at: https://your-domain.com/api/health"
echo ""
echo "🚨 Remember to:"
echo "- Monitor error rates after deployment"
echo "- Check performance metrics"
echo "- Be ready to rollback if needed"
echo ""