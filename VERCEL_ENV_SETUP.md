# Vercel Environment Variables Setup Guide

## 🚨 CRITICAL: Set These in Vercel Dashboard NOW

Go to: https://vercel.com/ernijsansons-projects/core-flow360/settings/environment-variables

### 1. Required for Build Success (MUST SET THESE!)

```bash
# Database (use placeholder for build, real value for runtime)
DATABASE_URL=postgresql://user:password@host:5432/coreflow360?sslmode=require

# Authentication (MUST be set!)
NEXTAUTH_URL=https://coreflow360.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Security Keys (MUST be exactly 64 hex chars for ENCRYPTION_KEY)
API_KEY_SECRET=<generate with: openssl rand -hex 32>
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Build Configuration
NODE_ENV=production
NEXT_PHASE=phase-production-build
BUILDING_FOR_VERCEL=1
```

### 2. Required Services (use placeholders if not ready)

```bash
# AI Services
OPENAI_API_KEY=sk-placeholder-key-for-build
ANTHROPIC_API_KEY=sk-ant-placeholder-key-for-build

# Payment Processing
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Email Service
SENDGRID_API_KEY=placeholder-sendgrid-key
```

### 3. Optional Services

```bash
# Redis (optional)
REDIS_URL=redis://default:password@localhost:6379

# Monitoring (optional)
SENTRY_DSN=https://placeholder@sentry.io/project
```

## 📋 Quick Setup Commands

### Generate Secrets:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate API_KEY_SECRET  
openssl rand -hex 32

# ENCRYPTION_KEY must be EXACTLY 64 hex characters
# Use the default or generate with:
openssl rand -hex 32
```

### Example Real Values:
```bash
DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/coreflow360?sslmode=require
NEXTAUTH_SECRET=abcdef1234567890abcdef1234567890abcdef12
API_KEY_SECRET=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## ⚠️ Common Issues & Solutions

### 1. "NEXTAUTH_SECRET is not defined"
- **Solution**: MUST set NEXTAUTH_SECRET in Vercel environment variables
- Generate with: `openssl rand -base64 32`

### 2. "Invalid encryption key"
- **Solution**: ENCRYPTION_KEY must be EXACTLY 64 hex characters
- Use the default provided above

### 3. "Database connection failed"
- **Solution**: Use placeholder for build, real connection for runtime
- Ensure SSL is enabled with `?sslmode=require`

### 4. Build runs out of memory
- **Solution**: Already configured with 8GB in vercel.json
- If still failing, contact Vercel support

## 🚀 Step-by-Step Deployment

### Step 1: Set Environment Variables
1. Go to https://vercel.com/ernijsansons-projects/core-flow360/settings/environment-variables
2. Add each variable listed above
3. Select "Production", "Preview", and "Development" for all
4. Click "Save"

### Step 2: Trigger Fresh Deployment
```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_A09SK4Bp6C6TYcJXedNtZA2UvCs9/Emwdczu7Uz" \
  -H "Content-Type: application/json" \
  -d '{"force": true, "target": "production", "gitBranch": "main"}'
```

### Step 3: Monitor Deployment
- Watch logs at: https://vercel.com/ernijsansons-projects/core-flow360
- Check for any error messages
- Verify all environment variables are loaded

### Step 4: Test Live Site
- Visit: https://coreflow360.com
- Check console for any errors
- Test authentication flow

## 📊 Deployment Status

- **Last Deployment Triggered**: Just now
- **Deploy Job ID**: EdhP86ajlDXWZjIGQvRV
- **Expected Duration**: 5-10 minutes
- **Success Criteria**: Build completes without errors

## 🔍 Troubleshooting Commands

```bash
# Check deployment status
./check-deployment.sh

# View latest commit
git log -1 --oneline

# Force new deployment
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_A09SK4Bp6C6TYcJXedNtZA2UvCs9/Emwdczu7Uz" -H "Content-Type: application/json" -d '{"force": true}'
```

---

**URGENT**: Set the environment variables listed above in Vercel dashboard immediately for the deployment to succeed!

**Last Updated**: 2025-08-17