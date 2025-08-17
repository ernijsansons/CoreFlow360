#!/bin/bash

# Vercel Environment Setup Script
# This script helps set up environment variables for Vercel deployment

echo "🚀 CoreFlow360 - Vercel Environment Setup"
echo "========================================"
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it with: npm install -g vercel"
    exit 1
fi

# Use npx if global vercel is not available
VERCEL_CMD="vercel"
if ! command -v vercel &> /dev/null; then
    VERCEL_CMD="npx vercel"
fi

echo "📋 Setting up environment variables for production..."
echo ""

# Required environment variables
echo "Setting build-time variables..."
$VERCEL_CMD env add NODE_ENV production --force
$VERCEL_CMD env add NEXT_PHASE phase-production-build --force
$VERCEL_CMD env add BUILDING_FOR_VERCEL 1 --force

# Placeholder values for build
echo ""
echo "Setting placeholder values for build..."
$VERCEL_CMD env add DATABASE_URL "postgresql://user:pass@localhost:5432/db" --force
$VERCEL_CMD env add NEXTAUTH_URL "https://coreflow360.com" --force
$VERCEL_CMD env add NEXTAUTH_SECRET "build-time-placeholder-secret-32-chars-for-nextauth" --force
$VERCEL_CMD env add API_KEY_SECRET "build-time-placeholder-secret-32-chars-for-api-key" --force
$VERCEL_CMD env add ENCRYPTION_KEY "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" --force

# AI placeholders
$VERCEL_CMD env add OPENAI_API_KEY "sk-placeholder" --force
$VERCEL_CMD env add ANTHROPIC_API_KEY "sk-ant-placeholder" --force

# Payment placeholders
$VERCEL_CMD env add STRIPE_SECRET_KEY "sk_test_placeholder" --force
$VERCEL_CMD env add STRIPE_PUBLISHABLE_KEY "pk_test_placeholder" --force
$VERCEL_CMD env add STRIPE_WEBHOOK_SECRET "whsec_placeholder" --force

# Email placeholder
$VERCEL_CMD env add SENDGRID_API_KEY "placeholder" --force

# Build configuration
$VERCEL_CMD env add NODE_OPTIONS "--max-old-space-size=8192" --force
$VERCEL_CMD env add NEXT_TELEMETRY_DISABLED "1" --force

echo ""
echo "✅ Environment variables set up successfully!"
echo ""
echo "⚠️  IMPORTANT: After successful build, update these with real values:"
echo "   - DATABASE_URL (real PostgreSQL connection)"
echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   - API_KEY_SECRET (generate with: openssl rand -hex 32)"
echo "   - ENCRYPTION_KEY (must be exactly 64 hex characters)"
echo "   - Service API keys (OpenAI, Stripe, etc.)"
echo ""
echo "📝 Reference: .env.vercel file contains all required variables"