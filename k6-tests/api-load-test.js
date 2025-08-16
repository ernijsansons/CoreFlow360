/**
 * CoreFlow360 - K6 API Load Test
 * Comprehensive API endpoint testing with realistic user scenarios
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestsPerSecond = new Rate('requests_per_second');
const activeUsers = new Gauge('active_users');
const businessTransactions = new Counter('business_transactions');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp-up
    { duration: '3m', target: 50 },   // Normal load
    { duration: '2m', target: 100 },  // Peak load
    { duration: '2m', target: 50 },   // Scale back
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must be below 1s
    http_req_failed: ['rate<0.02'],     // Error rate must be below 2%
    errors: ['rate<0.02'],
    response_time: ['p(95)<1000'],
    requests_per_second: ['rate>10'],   // At least 10 RPS
  },

  // Test data
  setupTimeout: '60s',
  teardownTimeout: '60s',
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test user credentials (for authenticated endpoints)
const TEST_USERS = [
  { email: 'test1@coreflow360.com', password: 'TestPassword123!' },
  { email: 'test2@coreflow360.com', password: 'TestPassword123!' },
  { email: 'test3@coreflow360.com', password: 'TestPassword123!' },
];

// Common headers
const commonHeaders = {
  'Content-Type': 'application/json',
  'User-Agent': 'K6-CoreFlow360-LoadTest/1.0',
  'Accept': 'application/json',
};

/**
 * Test setup - runs once before all VUs
 */
export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`);
  
  // Health check
  const healthResponse = http.get(`${API_BASE}/health`);
  if (healthResponse.status !== 200) {
    throw new Error(`Health check failed: ${healthResponse.status}`);
  }
  
  console.log('Health check passed. Starting test...');
  return { baseUrl: BASE_URL, apiBase: API_BASE };
}

/**
 * Main test function - runs for each VU
 */
export default function(data) {
  const testUser = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  activeUsers.add(1);

  // Simulate different user journeys
  const userJourney = Math.random();
  
  if (userJourney < 0.3) {
    // 30% - Anonymous user journey
    anonymousUserFlow(data);
  } else if (userJourney < 0.7) {
    // 40% - Authenticated user journey
    authenticatedUserFlow(data, testUser);
  } else {
    // 30% - Admin/power user journey
    adminUserFlow(data, testUser);
  }
  
  activeUsers.add(-1);
  
  // Random sleep between requests (1-3 seconds)
  sleep(randomIntBetween(1, 3));
}

/**
 * Anonymous user flow - public endpoints
 */
function anonymousUserFlow(data) {
  group('Anonymous User Journey', function() {
    
    // 1. Visit homepage
    group('Homepage', function() {
      const response = http.get(data.baseUrl, { headers: commonHeaders });
      
      check(response, {
        'homepage loads': (r) => r.status === 200,
        'homepage has content': (r) => r.body.length > 1000,
        'homepage loads quickly': (r) => r.timings.duration < 2000,
      });
      
      recordMetrics(response, 'homepage');
    });
    
    // 2. Check pricing page
    group('Pricing Page', function() {
      const response = http.get(`${data.baseUrl}/pricing`, { headers: commonHeaders });
      
      check(response, {
        'pricing page loads': (r) => r.status === 200,
        'pricing has content': (r) => r.body.includes('pricing') || r.body.includes('$'),
      });
      
      recordMetrics(response, 'pricing');
    });
    
    // 3. API health check
    group('Health Check', function() {
      const response = http.get(`${data.apiBase}/health`, { headers: commonHeaders });
      
      check(response, {
        'health check responds': (r) => r.status === 200,
        'health check is fast': (r) => r.timings.duration < 500,
      });
      
      recordMetrics(response, 'health');
    });

  });
}

/**
 * Authenticated user flow - dashboard and data access
 */
function authenticatedUserFlow(data, user) {
  let authToken = null;

  group('Authenticated User Journey', function() {
    
    // 1. Login
    group('Authentication', function() {
      const loginPayload = {
        email: user.email,
        password: user.password,
        remember: false
      };
      
      const loginResponse = http.post(
        `${data.apiBase}/auth/login`,
        JSON.stringify(loginPayload),
        { headers: commonHeaders }
      );
      
      const loginSuccess = check(loginResponse, {
        'login succeeds': (r) => r.status === 200,
        'login returns token': (r) => {
          try {
            const body = JSON.parse(r.body);
            authToken = body.token || body.accessToken;
            return !!authToken;
          } catch (e) {
            return false;
          }
        },
      });
      
      recordMetrics(loginResponse, 'auth_login');
      
      if (!loginSuccess || !authToken) {
        console.warn('Login failed, skipping authenticated flow');
        return;
      }
    });

    if (!authToken) return;

    const authHeaders = {
      ...commonHeaders,
      'Authorization': `Bearer ${authToken}`,
    };

    // 2. Dashboard data
    group('Dashboard', function() {
      const dashboardResponse = http.get(
        `${data.apiBase}/dashboard/stats`,
        { headers: authHeaders }
      );
      
      check(dashboardResponse, {
        'dashboard loads': (r) => r.status === 200,
        'dashboard has data': (r) => {
          try {
            const data = JSON.parse(r.body);
            return typeof data === 'object';
          } catch (e) {
            return false;
          }
        },
      });
      
      recordMetrics(dashboardResponse, 'dashboard');
      businessTransactions.add(1);
    });

    // 3. Customer data
    group('Customer Management', function() {
      // List customers
      const customersResponse = http.get(
        `${data.apiBase}/customers?page=1&limit=10`,
        { headers: authHeaders }
      );
      
      check(customersResponse, {
        'customers list loads': (r) => r.status === 200,
        'customers data is valid': (r) => {
          try {
            const data = JSON.parse(r.body);
            return Array.isArray(data.customers) || Array.isArray(data);
          } catch (e) {
            return false;
          }
        },
      });
      
      recordMetrics(customersResponse, 'customers_list');
      
      // Create a test customer (10% chance)
      if (Math.random() < 0.1) {
        const newCustomer = {
          name: `Test Customer ${randomString(8)}`,
          email: `test-${randomString(5)}@example.com`,
          phone: '+1-555-' + randomIntBetween(1000000, 9999999),
          company: `Test Company ${randomString(6)}`,
        };
        
        const createResponse = http.post(
          `${data.apiBase}/customers`,
          JSON.stringify(newCustomer),
          { headers: authHeaders }
        );
        
        check(createResponse, {
          'customer creation succeeds': (r) => r.status === 201 || r.status === 200,
        });
        
        recordMetrics(createResponse, 'customer_create');
        businessTransactions.add(1);
      }
    });

    // 4. Session check
    group('Session Management', function() {
      const sessionResponse = http.get(
        `${data.apiBase}/auth/session`,
        { headers: authHeaders }
      );
      
      check(sessionResponse, {
        'session is valid': (r) => r.status === 200,
      });
      
      recordMetrics(sessionResponse, 'session_check');
    });

  });
}

/**
 * Admin user flow - administrative operations
 */
function adminUserFlow(data, user) {
  let authToken = null;

  group('Admin User Journey', function() {
    
    // Login as admin (reuse auth flow)
    const loginPayload = {
      email: user.email,
      password: user.password,
      remember: false
    };
    
    const loginResponse = http.post(
      `${data.apiBase}/auth/login`,
      JSON.stringify(loginPayload),
      { headers: commonHeaders }
    );
    
    if (loginResponse.status === 200) {
      try {
        const body = JSON.parse(loginResponse.body);
        authToken = body.token || body.accessToken;
      } catch (e) {
        // Continue without auth
      }
    }

    if (!authToken) {
      console.warn('Admin login failed, performing reduced admin flow');
      return;
    }

    const authHeaders = {
      ...commonHeaders,
      'Authorization': `Bearer ${authToken}`,
    };

    // Admin-specific operations
    group('Admin Operations', function() {
      
      // System metrics
      const metricsResponse = http.get(
        `${data.apiBase}/metrics`,
        { headers: authHeaders }
      );
      
      check(metricsResponse, {
        'metrics accessible': (r) => r.status === 200 || r.status === 401, // May require special perms
      });
      
      recordMetrics(metricsResponse, 'admin_metrics');

      // Health detailed
      const healthDetailedResponse = http.get(
        `${data.apiBase}/health/detailed`,
        { headers: authHeaders }
      );
      
      check(healthDetailedResponse, {
        'detailed health check': (r) => r.status === 200 || r.status === 404,
      });
      
      recordMetrics(healthDetailedResponse, 'admin_health');
      
    });

  });
}

/**
 * Record metrics for requests
 */
function recordMetrics(response, endpoint) {
  const duration = response.timings.duration;
  const failed = response.status >= 400;
  
  responseTime.add(duration);
  errorRate.add(failed);
  requestsPerSecond.add(1);
  
  // Log slow requests
  if (duration > 2000) {
    console.warn(`Slow request: ${endpoint} took ${duration}ms`);
  }
  
  // Log errors
  if (failed) {
    console.error(`Request failed: ${endpoint} returned ${response.status}`);
  }
}

/**
 * Test teardown - runs once after all VUs finish
 */
export function teardown(data) {
  console.log('Load test completed');
  
  // Optional: cleanup test data
  // This would require admin credentials and cleanup endpoints
}

/**
 * Handle summary - custom reporting
 */
export function handleSummary(data) {
  const summary = {
    'summary.json': JSON.stringify(data, null, 2),
    'summary.txt': createTextSummary(data),
  };

  // In CI/CD, you might want to send results to monitoring systems
  if (__ENV.MONITORING_WEBHOOK) {
    const webhook_data = {
      test_run_id: __ENV.TEST_RUN_ID || 'unknown',
      timestamp: new Date().toISOString(),
      environment: __ENV.ENVIRONMENT || 'development',
      summary: {
        total_requests: data.metrics.http_reqs.count,
        failed_requests: data.metrics.http_req_failed.count,
        avg_duration: data.metrics.http_req_duration.avg,
        p95_duration: data.metrics.http_req_duration['p(95)'],
        error_rate: data.metrics.http_req_failed.rate * 100,
      }
    };

    const webhookResponse = http.post(
      __ENV.MONITORING_WEBHOOK,
      JSON.stringify(webhook_data),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (webhookResponse.status !== 200) {
      console.warn(`Failed to send results to monitoring webhook: ${webhookResponse.status}`);
    }
  }

  return summary;
}

/**
 * Create human-readable text summary
 */
function createTextSummary(data) {
  const summary = [
    '='.repeat(60),
    '           COREFLOW360 LOAD TEST RESULTS',
    '='.repeat(60),
    '',
    `Test Duration: ${data.state.testRunDurationMs / 1000}s`,
    `VUs: ${data.options.stages ? 'Variable (see stages)' : data.options.vus}`,
    '',
    'HTTP Metrics:',
    `  Total Requests: ${data.metrics.http_reqs.count}`,
    `  Failed Requests: ${data.metrics.http_req_failed.count} (${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%)`,
    `  Requests/sec: ${data.metrics.http_reqs.rate.toFixed(2)}`,
    '',
    'Response Times:',
    `  Average: ${data.metrics.http_req_duration.avg.toFixed(2)}ms`,
    `  Median (p50): ${data.metrics.http_req_duration.med.toFixed(2)}ms`,
    `  p(95): ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms`,
    `  p(99): ${data.metrics.http_req_duration['p(99)'].toFixed(2)}ms`,
    `  Max: ${data.metrics.http_req_duration.max.toFixed(2)}ms`,
    '',
    'Custom Metrics:',
    `  Business Transactions: ${data.metrics.business_transactions ? data.metrics.business_transactions.count : 'N/A'}`,
    `  Error Rate: ${data.metrics.errors ? (data.metrics.errors.rate * 100).toFixed(2) + '%' : 'N/A'}`,
    '',
    'Thresholds:',
  ];

  // Add threshold results
  Object.entries(data.thresholds || {}).forEach(([name, threshold]) => {
    const passed = threshold.ok ? '✅' : '❌';
    summary.push(`  ${passed} ${name}: ${threshold.ok ? 'PASSED' : 'FAILED'}`);
  });

  summary.push('', '='.repeat(60));
  return summary.join('\n');
}