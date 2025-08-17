# CoreFlow360 - Vercel Deployment Instructions

## 🚨 CRITICAL: Fix Build Cache Issue First

Vercel is currently building an old commit. You MUST add this environment variable first:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add New Variable**:
   - Name: `VERCEL_FORCE_NO_BUILD_CACHE`
   - Value: `1`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
3. **Save** the variable

## Required Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

### Core Variables (REQUIRED)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate-32-character-secret-see-below>
NODE_ENV=production
```

### Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### Optional Variables (Add as needed)
```
# V0.dev API (if using V0 features)
V0_API_KEY=your-v0-api-key

# Redis (for caching)
REDIS_URL=redis://default:password@host:6379

# Email Service
EMAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=re_your_api_key

# AI Services
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

## Deployment Steps

1. **Clear Build Cache** (Already done with VERCEL_FORCE_NO_BUILD_CACHE=1)

2. **Trigger New Deployment**:
   - Option A: Push a new commit to GitHub
   - Option B: In Vercel Dashboard → Click "Redeploy" → **Uncheck** "Use existing build cache"

3. **Monitor Build**:
   - Check that it's building the latest commit (not 72680dc)
   - Build should take longer than usual (no cache)
   - Watch for any new errors

## Troubleshooting

### If still building old commit:
1. Go to Vercel Dashboard → Settings → Git
2. Disconnect and reconnect GitHub repository
3. Trigger a new deployment

### If Tailwind CSS errors persist:
The project uses Tailwind CSS v4 (from V0.dev). Known issues:
- `@apply` directive has limited support in v4
- Some utilities may not work with `@apply`
- Consider using direct CSS properties instead

### If missing module errors:
1. Clear local node_modules: `rm -rf node_modules package-lock.json`
2. Install fresh: `npm install`
3. Commit package-lock.json
4. Push to trigger new build

## Post-Deployment Checklist

- [ ] Verify latest commit is deployed (check Vercel dashboard)
- [ ] Test authentication flow
- [ ] Check that all pages load without errors
- [ ] Verify environment variables are working (check logs)
- [ ] Test database connection
- [ ] Monitor for any runtime errors in Vercel Functions logs

## Support

If deployment continues to fail:
1. Check Vercel build logs for specific errors
2. Ensure all environment variables are set correctly
3. Verify database is accessible from Vercel's IP addresses
4. Check GitHub Actions for any CI failures