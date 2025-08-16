# CoreFlow360 Environment Setup Guide

Complete guide for setting up CoreFlow360 development, staging, and production environments.

## Table of Contents

- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [External Services](#external-services)
- [Security Configuration](#security-configuration)
- [Troubleshooting](#troubleshooting)

---

## Development Environment

### Prerequisites

#### Required Software

1. **Node.js** 18.17.0 or higher
   ```bash
   # Using nvm (recommended)
   nvm install 18.17.0
   nvm use 18.17.0
   
   # Verify installation
   node --version  # Should be v18.17.0+
   npm --version   # Should be 9.0.0+
   ```

2. **PostgreSQL** 15+ with TimescaleDB
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@15
   brew install timescaledb
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql-15 postgresql-contrib
   
   # Add TimescaleDB extension
   sudo apt install timescaledb-2-postgresql-15
   
   # Start PostgreSQL
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Redis** 6.2+ for caching and rate limiting
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt install redis-server
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   
   # Verify Redis is running
   redis-cli ping  # Should return PONG
   ```

4. **Git** with LFS support
   ```bash
   # Install Git LFS
   git lfs install
   ```

#### Optional Tools

- **Docker** (for containerized dependencies)
- **pgAdmin** (PostgreSQL GUI)
- **Redis Desktop Manager** (Redis GUI)

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/coreflow360/coreflow360.git
   cd coreflow360
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env.local
   ```

4. **Configure Database**
   ```bash
   # Create database
   createdb coreflow360_dev
   
   # Enable TimescaleDB extension
   psql coreflow360_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
   
   # Run migrations
   npm run db:deploy
   
   # Seed development data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Development Environment Variables

Create `.env.local` with the following configuration:

```bash
# Core Configuration
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-32-characters-minimum
API_KEY_SECRET=development-api-secret-32-characters-minimum

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/coreflow360_dev

# Redis
REDIS_URL=redis://localhost:6379

# Email (Development - use Ethereal or local SMTP)
EMAIL_FROM=dev@coreflow360.com
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=

# AI Services (Use test/development keys)
OPENAI_API_KEY=sk-your-development-openai-key
ANTHROPIC_API_KEY=your-development-anthropic-key

# Stripe (Test keys)
STRIPE_SECRET_KEY=sk_test_your_test_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret

# Feature Flags
CONSCIOUSNESS_FEATURES_ENABLED=true
SECURITY_HEADERS_ENABLED=false
RATE_LIMIT_ENABLED=false

# Logging
LOG_LEVEL=debug
ENABLE_QUERY_LOGGING=true
ENABLE_PERFORMANCE_LOGGING=true
```

### Development Tools Setup

1. **VSCode Extensions** (recommended)
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint
   - TypeScript Importer
   - Tailwind CSS IntelliSense
   - GitLens
   - Thunder Client (API testing)

2. **Pre-commit Hooks**
   ```bash
   # Husky should be automatically installed
   # If not, run:
   npm run prepare
   ```

3. **Database GUI** (optional)
   ```bash
   # Install pgAdmin or use web interface
   # Connection details:
   # Host: localhost
   # Port: 5432
   # Database: coreflow360_dev
   # Username: your_username
   ```

---

## Production Environment

### Infrastructure Requirements

#### Compute Resources

- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 100GB SSD minimum
- **Network**: High bandwidth, low latency

#### Database Requirements

- **PostgreSQL** 15+ with TimescaleDB
- **Connection Pooling**: PgBouncer or equivalent
- **Backup Strategy**: Daily automated backups
- **Read Replicas**: For high availability

#### Caching Layer

- **Redis Cluster**: 3+ nodes for high availability
- **Memory**: 4GB+ per node
- **Persistence**: AOF + RDB backups

### Platform-Specific Setup

#### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   Set production environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all required variables (see Production Environment Variables)

3. **Database Configuration**
   ```bash
   # Use managed PostgreSQL (Supabase, Neon, or PlanetScale)
   # Configure connection pooling
   DATABASE_URL=postgresql://user:pass@host:5432/db?pgbouncer=true
   ```

#### AWS Deployment

1. **Infrastructure as Code**
   ```bash
   # Using AWS CDK
   cd infrastructure/aws
   npm install
   cdk deploy
   ```

2. **Services Required**
   - **Compute**: ECS Fargate or EC2
   - **Database**: RDS PostgreSQL with TimescaleDB
   - **Cache**: ElastiCache Redis
   - **Storage**: S3 for file uploads
   - **CDN**: CloudFront
   - **Monitoring**: CloudWatch

#### Docker Deployment

1. **Build Image**
   ```bash
   docker build -t coreflow360:latest .
   ```

2. **Docker Compose** (development)
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/coreflow360
         - REDIS_URL=redis://redis:6379
     
     db:
       image: timescale/timescaledb:latest-pg15
       environment:
         - POSTGRES_DB=coreflow360
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
     
     redis:
       image: redis:7-alpine
       volumes:
         - redis_data:/data
   ```

### Production Environment Variables

```bash
# Core Configuration (REQUIRED)
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=production-secret-at-least-32-characters-high-entropy
API_KEY_SECRET=production-api-secret-at-least-32-characters-high-entropy

# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@prod-host:5432/coreflow360?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@prod-host:5432/coreflow360?sslmode=require

# Redis (REQUIRED)
REDIS_URL=rediss://user:password@prod-redis-host:6380

# Email (REQUIRED)
EMAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=re_your_production_resend_key

# AI Services (REQUIRED)
OPENAI_API_KEY=sk-your-production-openai-key
ANTHROPIC_API_KEY=your-production-anthropic-key

# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Security (REQUIRED)
SECURITY_HEADERS_ENABLED=true
RATE_LIMIT_ENABLED=true
CSRF_PROTECTION_ENABLED=true
SESSION_MAX_AGE=28800

# Monitoring (RECOMMENDED)
SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
NEXT_PUBLIC_SENTRY_DSN=https://your-public-sentry-dsn

# CDN & Assets (OPTIONAL)
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
CLOUDFRONT_DOMAIN=d123456789.cloudfront.net

# OAuth (OPTIONAL)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Feature Flags
CONSCIOUSNESS_FEATURES_ENABLED=true
PREFERRED_AI_PROVIDER=openai

# Logging
LOG_LEVEL=info
ENABLE_QUERY_LOGGING=false
ENABLE_PERFORMANCE_LOGGING=true
```

---

## Database Configuration

### PostgreSQL Setup

#### Development Database

```sql
-- Create database
CREATE DATABASE coreflow360_dev;

-- Create user
CREATE USER coreflow360 WITH PASSWORD 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE coreflow360_dev TO coreflow360;

-- Connect to database and enable extensions
\c coreflow360_dev;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

#### Production Database Configuration

```sql
-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertables for time-series data
SELECT create_hypertable('ai_insights', 'created_at');
SELECT create_hypertable('performance_metrics', 'timestamp');
SELECT create_hypertable('audit_logs', 'created_at');

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX CONCURRENTLY idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX CONCURRENTLY idx_ai_insights_tenant_created ON ai_insights(tenant_id, created_at DESC);

-- Set up automated vacuum
ALTER TABLE customers SET (autovacuum_vacuum_scale_factor = 0.02);
ALTER TABLE ai_insights SET (autovacuum_vacuum_scale_factor = 0.01);
```

#### Connection Pooling with PgBouncer

```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
coreflow360 = host=localhost port=5432 dbname=coreflow360

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
server_reset_query = DISCARD ALL
max_client_conn = 100
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
```

### Database Migrations

```bash
# Development migrations
npm run db:deploy

# Production migrations (with backup)
npm run backup
npm run db:deploy

# Reset database (development only)
npm run db:reset
npm run db:seed
```

---

## External Services

### Required Services

#### Stripe (Payment Processing)

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Create account and verify identity
   - Get API keys from Dashboard > Developers > API keys

2. **Configure Webhooks**
   ```bash
   # Add webhook endpoint: https://yourdomain.com/api/stripe/webhook
   # Select events:
   # - payment_intent.succeeded
   # - payment_intent.payment_failed
   # - customer.subscription.created
   # - customer.subscription.updated
   # - customer.subscription.deleted
   ```

3. **Test Webhook Locally**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

#### OpenAI (AI Services)

1. **Create OpenAI Account**
   - Go to https://platform.openai.com
   - Create API key
   - Set usage limits and monitoring

2. **Configure Models**
   ```bash
   # Recommended models for production:
   # - gpt-4-turbo-preview (for complex reasoning)
   # - gpt-3.5-turbo (for general tasks)
   # - text-embedding-ada-002 (for embeddings)
   ```

#### Resend (Email Service)

1. **Create Resend Account**
   - Go to https://resend.com
   - Verify domain for sending
   - Get API key

2. **Domain Verification**
   ```bash
   # Add DNS records:
   # TXT: v=spf1 include:_spf.resend.com ~all
   # CNAME: resend._domainkey IN CNAME resend._domainkey.resend.com
   ```

### Optional Services

#### Sentry (Error Monitoring)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard -i nextjs
```

#### Google OAuth

```bash
# Google Cloud Console setup:
# 1. Create project
# 2. Enable Google+ API
# 3. Create OAuth 2.0 credentials
# 4. Add authorized redirect URIs
```

#### GitHub OAuth

```bash
# GitHub setup:
# 1. Go to Settings > Developer settings > OAuth Apps
# 2. Create new OAuth App
# 3. Set callback URL: https://yourdomain.com/api/auth/callback/github
```

---

## Security Configuration

### SSL/TLS Setup

#### Development (Self-signed)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Start with HTTPS
npm run dev:https
```

#### Production

```bash
# Use Let's Encrypt with Certbot
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Environment Security

#### Secrets Management

```bash
# Use environment-specific secrets
# Development: .env.local
# Staging: .env.staging
# Production: Platform-specific secret management

# AWS: Systems Manager Parameter Store
# Vercel: Environment Variables in dashboard
# Azure: Key Vault
# Google Cloud: Secret Manager
```

#### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

### Database Security

```sql
-- Create read-only user for analytics
CREATE USER analytics_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE coreflow360 TO analytics_readonly;
GRANT USAGE ON SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;

-- Enable row-level security for tenant isolation
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON customers FOR ALL TO app_user USING (tenant_id = current_setting('app.current_tenant'));
```

---

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
psql -h localhost -U postgres -l

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Fix connection limit
# Edit postgresql.conf:
# max_connections = 200
# shared_buffers = 256MB
```

#### Redis Connection Issues

```bash
# Check Redis status
redis-cli ping

# Check Redis configuration
redis-cli config get "*"

# Monitor Redis
redis-cli monitor

# Check memory usage
redis-cli info memory
```

#### Node.js Performance Issues

```bash
# Check Node.js heap usage
node --inspect --max-old-space-size=4096 server.js

# Profile application
npm install -g clinic
clinic doctor -- node server.js
```

#### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in cert.pem -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443

# Verify certificate chain
curl -I https://yourdomain.com
```

### Environment Validation

```bash
# Validate environment variables
npm run validate:env

# Check all services
npm run health:check

# Test database connectivity
npm run db:test

# Verify external services
npm run services:test
```

### Performance Monitoring

```bash
# Monitor application performance
npm run monitor:start

# Check resource usage
htop
iostat -x 1
vmstat 1

# Database performance
pg_stat_statements
pg_stat_activity
```

### Debugging Tools

#### Development

```bash
# Enable debug mode
DEBUG=* npm run dev

# Chrome DevTools
node --inspect npm run dev

# Memory leak detection
node --heap-prof npm run dev
```

#### Production

```bash
# Application logs
docker logs container_name --follow

# System logs
journalctl -u coreflow360 -f

# Database logs
tail -f /var/log/postgresql/postgresql.log
```

---

## Environment-Specific Configurations

### Development

- Detailed logging enabled
- Hot reload active
- Source maps enabled
- Debug tools available
- Relaxed security (for development ease)

### Staging

- Production-like configuration
- Staging database and services
- Performance monitoring
- Security headers enabled
- Limited debug information

### Production

- Optimized builds
- Production database with backups
- Full security headers
- Error monitoring
- Performance monitoring
- Log aggregation
- Health checks

---

This guide should provide everything needed to set up CoreFlow360 in any environment. For additional help, refer to the platform-specific documentation or contact the development team.