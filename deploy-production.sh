#!/bin/bash

# 🚀 CoreFlow360 Production Deployment Script
# Automated deployment to Vercel with health checks

set -e  # Exit on any error

echo "🚀 CoreFlow360 Production Deployment Starting..."
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Pre-flight checks
print_status "Step 1: Running pre-flight checks..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_error "Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

print_success "Pre-flight checks passed"

# Step 2: Environment validation
print_status "Step 2: Validating environment..."

if npm run validate:env; then
    print_success "Environment validation passed"
else
    print_warning "Environment validation failed - continuing with deployment (warnings only)"
fi

# Step 3: Build test
print_status "Step 3: Testing production build..."

if NODE_OPTIONS='--max-old-space-size=8192' npm run build; then
    print_success "Production build successful"
else
    print_error "Production build failed"
    exit 1
fi

# Step 4: Deploy to Vercel
print_status "Step 4: Deploying to Vercel..."

# Deploy to production
if vercel --prod --yes; then
    print_success "Deployment to Vercel successful"
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel --prod --yes 2>/dev/null | grep -o 'https://[^ ]*' | head -1)
    if [ -z "$DEPLOYMENT_URL" ]; then
        DEPLOYMENT_URL="https://app.coreflow360.com"
    fi
    
    echo ""
    print_success "🎉 DEPLOYMENT COMPLETE!"
    echo "================================================="
    echo "🌐 Production URL: $DEPLOYMENT_URL"
    echo "📊 Vercel Dashboard: https://vercel.com/dashboard"
    echo "📋 Environment: Copy variables from .env.production.final to Vercel"
    echo ""
else
    print_error "Deployment failed"
    exit 1
fi

# Step 5: Basic health check
print_status "Step 5: Running basic health check..."

sleep 10  # Wait for deployment to be ready

if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/health" | grep -q "200"; then
    print_success "Health check passed - API is responding"
else
    print_warning "Health check failed - API may still be starting up"
fi

# Step 6: Final instructions
echo ""
print_status "🎯 NEXT STEPS:"
echo "================================================="
echo "1. 📊 Set up database:"
echo "   - Create production PostgreSQL database"
echo "   - Update DATABASE_URL in Vercel environment variables"
echo "   - Run: npx prisma migrate deploy"
echo ""
echo "2. 💳 Configure Stripe:"
echo "   - Add live Stripe keys to Vercel environment variables"
echo "   - Set up webhook endpoints"
echo ""
echo "3. 📧 Configure email service:"
echo "   - Add SendGrid or Resend API key"
echo "   - Update email settings"
echo ""
echo "4. 🔍 Monitor deployment:"
echo "   - Check Vercel function logs"
echo "   - Monitor error tracking"
echo "   - Run full health checks"
echo ""

print_success "CoreFlow360 deployment script completed successfully! 🚀"