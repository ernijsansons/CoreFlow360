# CoreFlow360 Load Testing Guide

## Overview

CoreFlow360 includes a comprehensive load testing framework designed to ensure production readiness and optimal performance under various load conditions. This guide covers all aspects of performance testing for the platform.

## Test Types

### 1. Smoke Tests
Quick validation that basic functionality works under minimal load.
- **Duration**: 30 seconds
- **Virtual Users**: 5
- **Purpose**: Verify basic endpoints respond correctly

### 2. Load Tests
Test system behavior under expected normal load.
- **Duration**: 2-10 minutes
- **Virtual Users**: 50-300
- **Purpose**: Validate performance under typical usage

### 3. Stress Tests
Find breaking points by gradually increasing load.
- **Duration**: 10 minutes
- **Virtual Users**: Up to 1000+
- **Purpose**: Identify maximum capacity and failure modes

### 4. Spike Tests
Test system response to sudden traffic spikes.
- **Duration**: 5 minutes
- **Virtual Users**: Rapid scaling to 500
- **Purpose**: Validate auto-scaling and resilience

## Quick Start

### Prerequisites

1. **Install K6** (recommended)
   ```bash
   # macOS
   brew install k6
   
   # Windows
   winget install k6
   
   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Ensure Application is Running**
   ```bash
   npm run dev  # Development
   # OR
   npm run start  # Production build
   ```

### Running Tests

#### Using NPM Scripts (Recommended)

```bash
# Quick development test
npm run test:load:dev

# Staging environment test
npm run test:load:staging

# Production environment test (use with caution)
npm run test:load:prod

# Stress test (find breaking points)
npm run test:stress

# Spike test (traffic burst simulation)
npm run test:spike
```

#### Using K6 Directly

```bash
# Basic API load test
npm run test:k6

# Staging environment
npm run test:k6:staging

# Custom configuration
BASE_URL=https://your-app.com k6 run k6-tests/api-load-test.js
```

#### Using TypeScript Framework

```bash
# Run comprehensive test suite
npm run test:load

# Individual test environments
npm run test:load:dev
npm run test:load:staging
npm run test:load:prod
```

## Test Configuration

### Environment-Specific Settings

#### Development
- **Virtual Users**: 5-50
- **Duration**: 30s-2m
- **Thresholds**: Relaxed (p95 < 2000ms, error rate < 1%)

#### Staging
- **Virtual Users**: 50-100
- **Duration**: 2-5m
- **Thresholds**: Moderate (p95 < 1000ms, error rate < 1%)

#### Production
- **Virtual Users**: 100-300+
- **Duration**: 5-10m
- **Thresholds**: Strict (p95 < 500ms, error rate < 0.5%)

### Customizing Tests

Create custom test configurations in your scripts:

```typescript
import { loadTester, LoadTestConfig } from './src/lib/testing/load-testing'

const customConfig: LoadTestConfig = {
  name: 'custom-api-test',
  target: 'https://your-api.com',
  duration: '3m',
  virtualUsers: 75,
  scenarios: [{
    name: 'api_calls',
    weight: 100,
    executor: 'constant-vus',
  }],
  thresholds: {
    http_req_duration: 'p(95)<800',
    http_req_failed: 'rate<0.005'
  }
}

loadTester.runLoadTest(customConfig)
```

## Test Scenarios

### 1. Anonymous User Journey (30%)
- Homepage visit
- Pricing page
- Health checks
- Static content

### 2. Authenticated User Journey (40%)
- Login/Authentication
- Dashboard access
- Customer data retrieval
- Session management

### 3. Admin User Journey (30%)
- Administrative operations
- System metrics access
- Advanced features
- Management tasks

## Monitoring During Tests

### Key Metrics to Watch

1. **Response Times**
   - Average response time
   - 95th percentile (p95)
   - 99th percentile (p99)
   - Maximum response time

2. **Error Rates**
   - HTTP error rate (4xx/5xx)
   - Application error rate
   - Timeout rate

3. **Throughput**
   - Requests per second (RPS)
   - Data transfer rate
   - Concurrent users

4. **System Resources**
   - CPU usage
   - Memory consumption
   - Database connections
   - Cache hit rates

### Real-time Monitoring

Access monitoring dashboards during tests:
- **Application**: http://localhost:3000/admin/monitoring
- **Metrics**: http://localhost:3000/api/metrics
- **Health**: http://localhost:3000/api/health/detailed

## Performance Thresholds

### Response Time Targets

| Percentile | Development | Staging | Production |
|------------|-------------|---------|------------|
| Average    | < 1000ms    | < 500ms | < 300ms    |
| p(95)      | < 2000ms    | < 1000ms| < 500ms    |
| p(99)      | < 5000ms    | < 2000ms| < 1000ms   |

### Error Rate Targets

| Environment | Max Error Rate |
|-------------|----------------|
| Development | < 2%           |
| Staging     | < 1%           |
| Production  | < 0.5%         |

### Throughput Targets

| Environment | Min RPS |
|-------------|---------|
| Development | > 10    |
| Staging     | > 50    |
| Production  | > 100   |

## Troubleshooting

### Common Issues

#### High Response Times
```bash
# Check database performance
npm run db:studio

# Review slow queries
grep "slow query" logs/*.log

# Check cache hit rates
curl http://localhost:3000/api/metrics | grep cache
```

#### High Error Rates
```bash
# Check application logs
tail -f logs/app.log

# Review error patterns
npm run security:scan

# Validate database connections
npm run test:db
```

#### Low Throughput
```bash
# Check system resources
htop
df -h

# Review connection limits
netstat -an | grep LISTEN

# Validate auto-scaling
kubectl get hpa  # If using Kubernetes
```

### Performance Optimization

#### Database Optimization
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;

-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email);
```

#### Cache Optimization
```typescript
// Implement caching for expensive operations
const result = await cache.wrap('expensive-operation', async () => {
  return await performExpensiveOperation()
}, { ttl: 300 }) // 5 minutes
```

#### Connection Pool Tuning
```typescript
// Optimize Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  
  // Connection pool configuration
  connection_limit = 20
  pool_timeout = 60
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Performance Tests

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main ]

jobs:
  load-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install K6
      run: |
        sudo gpg -k
        sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    
    - name: Start application
      run: |
        npm run build
        npm run start &
        sleep 30  # Wait for app to start
        
    - name: Run load tests
      run: npm run test:load:dev
      
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: load-test-results
        path: load-test-results/
```

### Performance Budgets

Set performance budgets in your CI/CD pipeline:

```json
{
  "performance-budget": {
    "response-time-p95": 1000,
    "error-rate": 0.01,
    "requests-per-second": 50
  }
}
```

## Advanced Testing

### Custom Metrics

```javascript
// k6-tests/custom-metrics.js
import { Counter, Rate, Trend } from 'k6/metrics';

const businessTransactions = new Counter('business_transactions');
const conversionRate = new Rate('conversion_rate');
const userJourneyTime = new Trend('user_journey_duration');

export default function() {
  // Track business-specific metrics
  businessTransactions.add(1);
  
  if (successfulPurchase) {
    conversionRate.add(1);
  } else {
    conversionRate.add(0);
  }
  
  userJourneyTime.add(journeyDuration);
}
```

### Load Testing with Authentication

```javascript
// k6-tests/authenticated-test.js
export function setup() {
  // Login and get auth token
  const loginResponse = http.post('/api/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  
  return { token: loginResponse.json('token') };
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json'
  };
  
  http.get('/api/dashboard', { headers });
}
```

### Database Load Testing

```typescript
// Test database performance under load
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function databaseLoadTest() {
  const concurrentQueries = 50;
  const promises = [];
  
  for (let i = 0; i < concurrentQueries; i++) {
    promises.push(
      prisma.customer.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    );
  }
  
  const startTime = Date.now();
  await Promise.all(promises);
  const duration = Date.now() - startTime;
  
  console.log(`${concurrentQueries} concurrent queries completed in ${duration}ms`);
}
```

## Best Practices

### Test Design

1. **Start Small**: Begin with smoke tests, then gradually increase load
2. **Use Realistic Data**: Test with production-like data volumes
3. **Test User Journeys**: Simulate real user behavior patterns
4. **Monitor Everything**: Track both application and system metrics
5. **Test Failure Scenarios**: Include error conditions in your tests

### Environment Management

1. **Isolated Test Environment**: Use dedicated test infrastructure
2. **Data Consistency**: Reset test data between runs
3. **Version Control**: Store test configurations in git
4. **Documentation**: Keep test scenarios and results documented

### Performance Optimization

1. **Profile First**: Use profiling tools to identify bottlenecks
2. **Optimize Hot Paths**: Focus on frequently used code paths
3. **Cache Strategically**: Implement caching for expensive operations
4. **Scale Horizontally**: Design for horizontal scaling

## Results Analysis

### Automated Reporting

Load tests generate detailed reports including:
- HTML dashboard with charts and metrics
- JSON data for programmatic analysis
- CSV exports for spreadsheet analysis
- Integration with monitoring systems

### Performance Trends

Track performance over time:
```bash
# Compare results across runs
node scripts/compare-performance.js baseline.json current.json

# Generate trend reports
node scripts/performance-trends.js --days 30
```

## Support

For load testing support:
- Review application logs in `logs/`
- Check monitoring dashboards
- Review test result files in `load-test-results/`
- Consult system metrics and alerts

Remember: Load testing is an iterative process. Start with baseline measurements, make improvements, and continuously monitor performance as your application evolves.