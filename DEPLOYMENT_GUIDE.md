# CoreFlow360 Deployment Guide

## Overview

CoreFlow360 is a modular AI-powered ERP platform with subscription-based module activation. This guide covers production deployment on Vercel with PostgreSQL and optional Redis caching.

## Architecture Summary

- **Framework**: Next.js 15.4.5 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payment Processing**: Stripe
- **AI/ML**: OpenAI GPT-4, Anthropic Claude
- **Caching**: Redis (optional)
- **Monitoring**: Built-in health checks and performance monitoring

## Prerequisites

### Required Services

1. **Vercel Account** - For hosting
2. **PostgreSQL Database** - Vercel Postgres, Supabase, or self-hosted
3. **Stripe Account** - For subscription billing
4. **OpenAI API Key** - For AI features
5. **Anthropic API Key** - For AI features (optional)

### Optional Services

1. **Redis** - For enhanced caching (Upstash recommended)
2. **Sentry** - For error monitoring
3. **SendGrid** - For email notifications

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Stripe
STRIPE_SECRET_KEY="sk_live_or_test_key"
STRIPE_PUBLISHABLE_KEY="pk_live_or_test_key"
STRIPE_WEBHOOK_SECRET="whsec_webhook_secret"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Security
API_KEY_SECRET="your-api-key-signing-secret"

# Optional: Redis
REDIS_URL="redis://username:password@host:port"

# Optional: Email
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# Optional: Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## Deployment Steps

### 1. Database Setup

#### Option A: Vercel Postgres
```bash
# Install Vercel CLI
npm i -g vercel

# Create Vercel Postgres database
vercel postgres create coreflow360-db

# Get connection string
vercel env pull .env.local
```

#### Option B: External PostgreSQL
```bash
# Set up your PostgreSQL database
# Update DATABASE_URL in environment variables
```

### 2. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database with modules and bundles
npm run db:seed:modules
```

### 3. Stripe Configuration

1. **Create Products and Prices**:
   ```bash
   # Use the included script to create Stripe products
   node scripts/stripe-setup.js
   ```

2. **Set up Webhooks**:
   - Endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `invoice.payment_succeeded`, `subscription.updated`, `subscription.deleted`, `customer.subscription.created`

### 4. Deploy to Vercel

```bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repository for automatic deployments
```

### 5. Post-Deployment Setup

1. **Verify Health Check**:
   ```bash
   curl https://yourdomain.com/api/health?detailed=true
   ```

2. **Test Stripe Integration**:
   ```bash
   curl -X POST https://yourdomain.com/api/pricing/calculate \
     -H "Content-Type: application/json" \
     -d '{"modules":["crm","accounting"],"users":5}'
   ```

3. **Test AI Integration**:
   ```bash
   curl -X POST https://yourdomain.com/api/ai/orchestrate \
     -H "Content-Type: application/json" \
     -d '{"task":"analyze customer data","tenantId":"demo","modules":["crm"]}'
   ```

## Configuration

### Vercel Settings

Update your `vercel.json`:

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://yourdomain.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

### Security Configuration

1. **CSP Headers**: Already configured in middleware
2. **Rate Limiting**: Built-in protection active
3. **CSRF Protection**: Automatic for mutations
4. **API Key Validation**: For external integrations

### Performance Configuration

1. **Caching Strategy**:
   - Static assets: Vercel CDN
   - API responses: Redis (if configured)
   - Database queries: Prisma query caching

2. **Monitoring**:
   - Health checks: `/api/health`
   - Performance metrics: Built-in monitoring
   - Error tracking: Sentry integration

## Monitoring and Maintenance

### Health Checks

- **Liveness**: `GET /api/health`
- **Readiness**: `POST /api/health`
- **Detailed**: `GET /api/health?detailed=true&metrics=true`

### Performance Monitoring

```bash
# View performance metrics
curl https://yourdomain.com/api/health?metrics=true
```

### Log Monitoring

1. **Vercel Logs**: Available in Vercel dashboard
2. **Application Logs**: Structured logging with winston
3. **Error Tracking**: Sentry integration

### Database Maintenance

```bash
# Check database connection
npx prisma studio

# Run migrations
npx prisma migrate deploy

# Generate client after schema changes
npx prisma generate
```

## Scaling Considerations

### Horizontal Scaling

- **Vercel Functions**: Auto-scaling serverless functions
- **Database**: Connection pooling configured
- **Caching**: Redis for session storage and caching

### Performance Optimization

1. **Database Indexing**: Critical indexes already defined
2. **Query Optimization**: Prisma includes and batching
3. **Caching Layers**: Multi-level caching strategy
4. **CDN**: Vercel Edge Network for static assets

### Resource Limits

- **Function Memory**: 1024MB default (configurable)
- **Function Timeout**: 30 seconds for API routes
- **Database Connections**: Pooled connections
- **Rate Limits**: Configured per endpoint type

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   ```bash
   # Check connection string
   npx prisma studio
   
   # Verify migrations
   npx prisma migrate status
   ```

2. **Stripe Webhook Failures**:
   ```bash
   # Check webhook secret
   echo $STRIPE_WEBHOOK_SECRET
   
   # Verify endpoint is accessible
   curl https://yourdomain.com/api/stripe/webhook
   ```

3. **AI Integration Issues**:
   ```bash
   # Test API keys
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
   ```

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=coreflow360:*
```

### Performance Issues

1. **Check Health Endpoint**:
   ```bash
   curl https://yourdomain.com/api/health?detailed=true
   ```

2. **Monitor Function Duration**: Check Vercel dashboard

3. **Database Performance**: Use Prisma Studio for query analysis

## Security Checklist

- [ ] All environment variables set
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] CSRF protection enabled
- [ ] API key validation implemented
- [ ] Database queries parameterized
- [ ] Input sanitization active
- [ ] Webhook signatures verified

## Backup and Recovery

### Database Backups

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### Environment Backup

```bash
# Export environment variables
vercel env pull .env.backup
```

## Support

For deployment issues:

1. Check this deployment guide
2. Review Vercel logs
3. Test health endpoints
4. Verify environment variables
5. Check database connectivity

## Next Steps

After successful deployment:

1. Set up monitoring dashboards
2. Configure backup schedules
3. Test subscription workflows
4. Train users on module activation
5. Monitor performance metrics
6. Set up alerting for critical issues

---

**CoreFlow360 v2.0.0** - AI-First Modular ERP Platform
Deployment completed successfully! 🚀