#!/bin/bash

# CoreFlow360 Vercel Environment Setup
# This script sets up minimal environment variables for Vercel deployment

echo "Setting up CoreFlow360 environment variables in Vercel..."

# Generate a secure NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Add minimal required environment variables
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/coreflow360" | vercel env add DATABASE_URL production --force
echo "NEXTAUTH_URL=https://coreflow360.vercel.app" | vercel env add NEXTAUTH_URL production --force
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production --force
echo "your-api-key-secret-min-32-characters" | vercel env add API_KEY_SECRET production --force
echo "your-encryption-key-must-be-32-chars" | vercel env add ENCRYPTION_KEY production --force

# Add placeholder Stripe keys
echo "sk_test_placeholder" | vercel env add STRIPE_SECRET_KEY production --force
echo "pk_test_placeholder" | vercel env add STRIPE_PUBLISHABLE_KEY production --force
echo "whsec_placeholder" | vercel env add STRIPE_WEBHOOK_SECRET production --force

# Add placeholder email key
echo "SG.placeholder" | vercel env add SENDGRID_API_KEY production --force

# Set Node environment
echo "production" | vercel env add NODE_ENV production --force

echo "✅ Environment variables added to Vercel!"
echo ""
echo "⚠️  IMPORTANT: These are placeholder values!"
echo "Please update them with real values in the Vercel dashboard:"
echo "https://vercel.com/ernijsansons-projects/coreflow360/settings/environment-variables"