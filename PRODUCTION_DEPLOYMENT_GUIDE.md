# 🚀 CoreFlow360 Production Deployment Guide

## Pre-Deployment Checklist

### 🔐 Security Requirements
- [ ] Environment variables configured in Vercel
- [ ] Database credentials secured
- [ ] API keys rotated for production
- [ ] SSL/TLS certificates configured
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Input sanitization validated

### 🗄️ Database Setup
- [ ] Production PostgreSQL instance provisioned
- [ ] Connection pooling configured
- [ ] Backup strategy implemented
- [ ] Migration scripts tested
- [ ] Seed data prepared

### 📊 Monitoring & Analytics
- [ ] Sentry error tracking configured
- [ ] Performance monitoring enabled
- [ ] Health check endpoints validated
- [ ] Log aggregation setup
- [ ] Alert notifications configured

## 🌐 Vercel Production Deployment

### Step 1: Environment Variables Setup

Create a `.env.production` file (DO NOT COMMIT) with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host:port/database?sslmode=require"

# Authentication
NEXTAUTH_SECRET="your-super-secure-secret-key-min-32-chars"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_live_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_live_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# AI Services
OPENAI_API_KEY="sk-your-openai-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"

# Security
API_KEY_SECRET="your-api-key-secret-32-chars-min"
ENCRYPTION_KEY="your-encryption-key-32-chars-exactly"
JWT_SECRET="your-jwt-secret-min-32-chars"

# Redis (Optional but recommended)
REDIS_URL="redis://username:password@host:port"

# Email
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn"

# Rate Limiting
RATE_LIMIT_WINDOW="900000"  # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"

# Feature Flags
ENABLE_AI_FEATURES="true"
ENABLE_ANALYTICS="true"
ENABLE_AUDIT_LOGGING="true"
```

### Step 2: Vercel CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... (continue for all variables)
```

### Step 3: Domain Configuration

1. **Custom Domain Setup**
   ```bash
   vercel domains add yourdomain.com
   vercel domains add www.yourdomain.com
   ```

2. **SSL Certificate**
   - Automatic SSL via Vercel
   - Custom certificate upload if needed

3. **DNS Configuration**
   ```
   A record: @ -> 76.76.19.19
   CNAME: www -> cname.vercel-dns.com
   ```

## 🗄️ Database Production Setup

### PostgreSQL Production Instance

**Recommended Providers:**
- **Supabase** (Recommended): Built-in connection pooling, backups
- **Neon**: Serverless PostgreSQL with branching
- **Railway**: Simple deployment with PostgreSQL
- **AWS RDS**: Enterprise-grade with full control

### Database Migration

```bash
# Run production migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed essential data
npm run db:seed
npm run db:seed:modules
```

### Connection Pooling Setup

```typescript
// lib/db/production-config.ts
export const productionDbConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  generator: {
    client: {
      provider: "prisma-client-js",
      previewFeatures: ["relationJoins"],
    },
  },
  connectionLimit: 10,
  pool: {
    timeout: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
}
```

## 🔐 Security Hardening

### 1. Environment Security

```bash
# Generate secure secrets
openssl rand -hex 32  # For NEXTAUTH_SECRET
openssl rand -hex 32  # For API_KEY_SECRET
openssl rand -hex 16  # For ENCRYPTION_KEY (32 chars)
```

### 2. Content Security Policy

The CSP is configured in `vercel.json`:
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.anthropic.com wss://; frame-ancestors 'none';"
}
```

### 3. Rate Limiting Configuration

```typescript
// lib/rate-limiting/production-limits.ts
export const productionRateLimits = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5, // login attempts
  },
  ai: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // AI requests
  },
}
```

## 📊 Monitoring & Observability

### 1. Sentry Error Tracking

```typescript
// lib/monitoring/sentry-production.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.headers?.authorization
    }
    return event
  },
})
```

### 2. Health Check Monitoring

```typescript
// pages/api/health/detailed.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const healthChecks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    ai_services: await checkAIServices(),
    stripe: await checkStripe(),
    timestamp: new Date().toISOString(),
  }
  
  const isHealthy = Object.values(healthChecks).every(check => 
    typeof check === 'object' ? check.status === 'healthy' : true
  )
  
  res.status(isHealthy ? 200 : 503).json(healthChecks)
}
```

### 3. Performance Monitoring

```typescript
// lib/monitoring/performance-production.ts
export class ProductionPerformanceMonitor {
  static trackAPIPerformance(endpoint: string, duration: number) {
    // Send to monitoring service
    if (duration > 1000) {
      console.warn(`Slow API endpoint: ${endpoint} took ${duration}ms`)
    }
  }
  
  static trackDatabaseQuery(query: string, duration: number) {
    if (duration > 500) {
      console.warn(`Slow database query: ${query} took ${duration}ms`)
    }
  }
}
```

## 🚀 Deployment Automation

### GitHub Actions Workflow

```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security scan
        run: npm audit --audit-level high
        
  deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔄 Backup & Recovery

### 1. Database Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backup_${DATE}.sql"
aws s3 cp "backup_${DATE}.sql" s3://your-backup-bucket/
```

### 2. Disaster Recovery Plan

1. **Database Recovery**
   - Restore from latest backup
   - Verify data integrity
   - Update connection strings

2. **Application Recovery**
   - Redeploy from Git
   - Verify environment variables
   - Run health checks

3. **DNS Failover**
   - Update DNS to backup instance
   - Monitor performance
   - Gradual traffic migration

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX CONCURRENTLY idx_modules_active ON modules WHERE active = true;
```

### 2. Caching Strategy

```typescript
// lib/cache/production-cache.ts
export const productionCacheConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    keyPrefix: 'coreflow360:',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  },
  memory: {
    max: 1000,
    ttl: 60 * 1000, // 1 minute
  },
}
```

### 3. CDN Configuration

```typescript
// next.config.js production optimizations
module.exports = {
  images: {
    domains: ['cdn.yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
}
```

## 🧪 Production Testing

### 1. Smoke Tests

```bash
# Run production smoke tests
npm run test:production

# Test critical endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/auth/session
```

### 2. Load Testing

```bash
# Install k6
npm install -g k6

# Run load tests
k6 run k6-tests/production-load-test.js
```

### 3. Security Testing

```bash
# Run security audit
npm audit --audit-level high
npm run test:security
```

## 🚨 Incident Response

### 1. Monitoring Alerts

- **High Error Rate**: >5% 5xx responses
- **Slow Response**: >2s average response time
- **Database Issues**: Connection failures
- **AI Service Failures**: API timeouts

### 2. Escalation Process

1. **Level 1**: Automated alerts to Slack
2. **Level 2**: Email notifications to on-call team
3. **Level 3**: SMS alerts for critical issues

### 3. Rollback Procedure

```bash
# Quick rollback to previous deployment
vercel rollback https://coreflow360-abc123.vercel.app
```

## ✅ Production Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Security scan passed
- [ ] Performance tests passed
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Launch Day
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor error rates
- [ ] Test critical user flows
- [ ] Confirm payment processing

### Post-Launch
- [ ] Monitor performance metrics
- [ ] Review error logs
- [ ] Customer feedback collection
- [ ] Performance optimization
- [ ] Scale planning

---

## 🎯 Success Metrics

### Technical Metrics
- **Uptime**: >99.9%
- **Response Time**: <200ms median
- **Error Rate**: <0.1%
- **Page Load**: <3s first contentful paint

### Business Metrics
- **Conversion Rate**: >5% trial to paid
- **User Retention**: >80% monthly
- **Customer Satisfaction**: >4.5/5
- **Revenue Growth**: >20% MoM

**Ready for production deployment! 🚀**