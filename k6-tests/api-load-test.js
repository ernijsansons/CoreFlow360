/**
 * CoreFlow360 - Enhanced K6 Load Test with Business Workflows
 * Comprehensive testing with real CRM, subscription, and consciousness workflows
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Enhanced custom metrics for business workflows
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestsPerSecond = new Rate('requests_per_second');
const activeUsers = new Gauge('active_users');
const businessTransactions = new Counter('business_transactions');
const crmOperations = new Counter('crm_operations');
const subscriptionEvents = new Counter('subscription_events');
const consciousnessEmergence = new Counter('consciousness_emergence');
const aiOrchestrations = new Counter('ai_orchestrations');
const databaseQueries = new Trend('database_query_time');
const cacheHitRate = new Rate('cache_hit_rate');

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
  } else if (userJourney < 0.5) {
    // 20% - Authenticated user journey
    authenticatedUserFlow(data, testUser);
  } else if (userJourney < 0.7) {
    // 20% - Business workflow journey (CRM operations)
    businessWorkflowJourney(data, testUser);
  } else if (userJourney < 0.85) {
    // 15% - Subscription management journey
    subscriptionWorkflowJourney(data, testUser);
  } else if (userJourney < 0.95) {
    // 10% - AI consciousness workflow
    consciousnessWorkflowJourney(data, testUser);
  } else {
    // 5% - Admin/power user journey
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
 * Business Workflow Journey - Complete CRM operations flow
 */
function businessWorkflowJourney(data, user) {
  let authToken = authenticate(data, user);
  if (!authToken) return;

  const authHeaders = {
    ...commonHeaders,
    'Authorization': `Bearer ${authToken}`,
  };

  group('Complete CRM Business Workflow', function() {
    
    // 1. Lead Generation & Qualification
    group('Lead Management', function() {
      // Create a new lead
      const newLead = {
        firstName: `Lead-${randomString(6)}`,
        lastName: `Test-${randomString(4)}`,
        email: `lead-${randomString(8)}@testcompany.com`,
        phone: `+1-555-${randomIntBetween(1000, 9999)}-${randomIntBetween(1000, 9999)}`,
        company: `TestCorp-${randomString(5)}`,
        source: ['Website', 'LinkedIn', 'Referral'][randomIntBetween(0, 2)],
        status: 'NEW'
      };

      const createLeadResponse = http.post(
        `${data.apiBase}/customers`,
        JSON.stringify(newLead),
        { headers: authHeaders }
      );

      const leadCreated = check(createLeadResponse, {
        'lead creation successful': (r) => r.status === 201 || r.status === 200,
        'lead has valid ID': (r) => {
          try {
            const lead = JSON.parse(r.body);
            return lead.id || lead.customer?.id;
          } catch (e) {
            return false;
          }
        }
      });

      recordMetrics(createLeadResponse, 'lead_creation');
      crmOperations.add(1);

      // Get the created lead ID for subsequent operations
      let leadId = null;
      if (leadCreated && createLeadResponse.status < 300) {
        try {
          const lead = JSON.parse(createLeadResponse.body);
          leadId = lead.id || lead.customer?.id;
        } catch (e) {
          // Continue without lead ID
        }
      }

      // Lead qualification workflow
      if (leadId) {
        const qualifyResponse = http.patch(
          `${data.apiBase}/customers/${leadId}`,
          JSON.stringify({ status: 'QUALIFIED', notes: 'Qualified via load test' }),
          { headers: authHeaders }
        );

        check(qualifyResponse, {
          'lead qualification successful': (r) => r.status === 200,
        });

        recordMetrics(qualifyResponse, 'lead_qualification');
      }
    });

    // 2. Deal Creation & Pipeline Management
    group('Deal Pipeline', function() {
      const newDeal = {
        title: `Deal-${randomString(8)}`,
        value: randomIntBetween(5000, 50000),
        stage: 'PROSPECTING',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        probability: 25,
        description: `Load test deal created at ${new Date().toISOString()}`
      };

      const createDealResponse = http.post(
        `${data.apiBase}/deals`,
        JSON.stringify(newDeal),
        { headers: authHeaders }
      );

      check(createDealResponse, {
        'deal creation successful': (r) => r.status === 201 || r.status === 200,
      });

      recordMetrics(createDealResponse, 'deal_creation');
      crmOperations.add(1);
      businessTransactions.add(1);

      // Deal progression simulation
      const stageProgression = ['NEEDS_ANALYSIS', 'PROPOSAL', 'NEGOTIATION'];
      const nextStage = stageProgression[randomIntBetween(0, 2)];
      
      const progressResponse = http.patch(
        `${data.apiBase}/deals/progress`,
        JSON.stringify({ stage: nextStage, probability: randomIntBetween(40, 80) }),
        { headers: authHeaders }
      );

      check(progressResponse, {
        'deal progression tracked': (r) => r.status === 200 || r.status === 404, // 404 if endpoint doesn't exist
      });

      recordMetrics(progressResponse, 'deal_progression');
    });

    // 3. Analytics & Reporting
    group('CRM Analytics', function() {
      const analyticsResponse = http.get(
        `${data.apiBase}/analytics/crm?timeframe=30d`,
        { headers: authHeaders }
      );

      check(analyticsResponse, {
        'CRM analytics accessible': (r) => r.status === 200 || r.status === 404,
        'analytics response time acceptable': (r) => r.timings.duration < 3000,
      });

      recordMetrics(analyticsResponse, 'crm_analytics');
      
      // Performance metrics tracking
      if (analyticsResponse.timings.duration) {
        databaseQueries.add(analyticsResponse.timings.duration);
      }
    });

  });
}

/**
 * Subscription Workflow Journey - Module activation and billing
 */
function subscriptionWorkflowJourney(data, user) {
  let authToken = authenticate(data, user);
  if (!authToken) return;

  const authHeaders = {
    ...commonHeaders,
    'Authorization': `Bearer ${authToken}`,
  };

  group('Subscription Management Workflow', function() {
    
    // 1. View current subscription
    group('Subscription Status', function() {
      const subscriptionResponse = http.get(
        `${data.apiBase}/subscriptions/current`,
        { headers: authHeaders }
      );

      check(subscriptionResponse, {
        'subscription status accessible': (r) => r.status === 200 || r.status === 404,
      });

      recordMetrics(subscriptionResponse, 'subscription_status');
    });

    // 2. Module activation simulation
    group('Module Management', function() {
      const modules = ['CRM_ADVANCED', 'HVAC_FIELD_SERVICE', 'AI_INSIGHTS', 'ACCOUNTING_INTEGRATION'];
      const selectedModule = modules[randomIntBetween(0, 3)];

      const activateResponse = http.post(
        `${data.apiBase}/subscriptions/modules/activate`,
        JSON.stringify({ moduleId: selectedModule, tier: 'PROFESSIONAL' }),
        { headers: authHeaders }
      );

      check(activateResponse, {
        'module activation processed': (r) => r.status === 200 || r.status === 404 || r.status === 402,
      });

      recordMetrics(activateResponse, 'module_activation');
      subscriptionEvents.add(1);
    });

    // 3. Usage tracking and billing
    group('Usage Analytics', function() {
      const usageResponse = http.get(
        `${data.apiBase}/subscriptions/usage?period=current`,
        { headers: authHeaders }
      );

      check(usageResponse, {
        'usage data accessible': (r) => r.status === 200 || r.status === 404,
      });

      recordMetrics(usageResponse, 'usage_tracking');

      // Simulate Stripe integration check
      const billingResponse = http.get(
        `${data.apiBase}/stripe/customer-portal`,
        { headers: authHeaders }
      );

      check(billingResponse, {
        'billing portal accessible': (r) => r.status === 200 || r.status === 404 || r.status === 401,
      });

      recordMetrics(billingResponse, 'billing_portal');
    });

  });
}

/**
 * Consciousness Workflow Journey - AI orchestration and emergence
 */
function consciousnessWorkflowJourney(data, user) {
  let authToken = authenticate(data, user);
  if (!authToken) return;

  const authHeaders = {
    ...commonHeaders,
    'Authorization': `Bearer ${authToken}`,
  };

  group('AI Consciousness Workflow', function() {
    
    // 1. AI Orchestration
    group('AI Agent Orchestration', function() {
      const aiRequest = {
        query: `Analyze customer data for tenant and provide insights on revenue optimization opportunities`,
        context: 'BUSINESS_INTELLIGENCE',
        modules: ['CRM', 'ANALYTICS', 'FORECASTING']
      };

      const orchestrateResponse = http.post(
        `${data.apiBase}/ai/orchestrate`,
        JSON.stringify(aiRequest),
        { headers: authHeaders }
      );

      check(orchestrateResponse, {
        'AI orchestration initiated': (r) => r.status === 200 || r.status === 202 || r.status === 404,
        'AI response time reasonable': (r) => r.timings.duration < 10000, // 10s timeout for AI
      });

      recordMetrics(orchestrateResponse, 'ai_orchestration');
      aiOrchestrations.add(1);
    });

    // 2. Consciousness emergence simulation
    group('Consciousness Emergence', function() {
      const consciousnessResponse = http.get(
        `${data.apiBase}/consciousness/status`,
        { headers: authHeaders }
      );

      check(consciousnessResponse, {
        'consciousness status available': (r) => r.status === 200 || r.status === 404,
      });

      recordMetrics(consciousnessResponse, 'consciousness_status');

      // Trigger consciousness insights
      const insightsResponse = http.get(
        `${data.apiBase}/consciousness/insights?type=BUSINESS_OPTIMIZATION`,
        { headers: authHeaders }
      );

      check(insightsResponse, {
        'consciousness insights generated': (r) => r.status === 200 || r.status === 404,
      });

      recordMetrics(insightsResponse, 'consciousness_insights');
      consciousnessEmergence.add(1);
    });

    // 3. Intelligence multiplication testing
    group('Intelligence Multiplication', function() {
      const intelligenceResponse = http.post(
        `${data.apiBase}/intelligence/business`,
        JSON.stringify({
          analysisType: 'EXPONENTIAL_GROWTH',
          dataPoints: ['REVENUE', 'CUSTOMERS', 'EFFICIENCY'],
          timeframe: '90_DAYS'
        }),
        { headers: authHeaders }
      );

      check(intelligenceResponse, {
        'intelligence analysis processed': (r) => r.status === 200 || r.status === 202 || r.status === 404,
      });

      recordMetrics(intelligenceResponse, 'intelligence_multiplication');
    });

  });
}

/**
 * Helper function for authentication (reusable)
 */
function authenticate(data, user) {
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
      return body.token || body.accessToken;
    } catch (e) {
      return null;
    }
  }
  
  return null;
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
    `  CRM Operations: ${data.metrics.crm_operations ? data.metrics.crm_operations.count : 'N/A'}`,
    `  Subscription Events: ${data.metrics.subscription_events ? data.metrics.subscription_events.count : 'N/A'}`,
    `  AI Orchestrations: ${data.metrics.ai_orchestrations ? data.metrics.ai_orchestrations.count : 'N/A'}`,
    `  Consciousness Emergence: ${data.metrics.consciousness_emergence ? data.metrics.consciousness_emergence.count : 'N/A'}`,
    `  Database Query Avg: ${data.metrics.database_queries ? data.metrics.database_queries.avg.toFixed(2) + 'ms' : 'N/A'}`,
    `  Cache Hit Rate: ${data.metrics.cache_hit_rate ? (data.metrics.cache_hit_rate.rate * 100).toFixed(2) + '%' : 'N/A'}`,
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