/**
 * CoreFlow360 - API Registry
 * Central registry for all API endpoints with automatic documentation
 */

import { openAPIGenerator, APIRouteMetadata } from './openapi-generator'

// Initialize API documentation registry
export function initializeAPIDocumentation() {
  // Authentication endpoints
  registerAuthenticationAPIs()
  
  // User management endpoints
  registerUserAPIs()
  
  // Tenant management endpoints
  registerTenantAPIs()
  
  // Dashboard and analytics endpoints
  registerDashboardAPIs()
  
  // Performance monitoring endpoints
  registerPerformanceAPIs()
  
  // Security endpoints
  registerSecurityAPIs()
  
  // CRM endpoints
  registerCRMAPIs()
  
  // Integration endpoints
  registerIntegrationAPIs()
  
  // Admin endpoints
  registerAdminAPIs()
}

function registerAuthenticationAPIs() {
  // Login endpoint
  openAPIGenerator.registerRoute({
    path: '/api/auth/signin',
    method: 'POST',
    summary: 'User Authentication',
    description: 'Authenticate user with email and password',
    tags: ['Authentication'],
    requestBody: {
      description: 'User credentials',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email', description: 'User email address' },
              password: { type: 'string', minLength: 8, description: 'User password' },
              rememberMe: { type: 'boolean', description: 'Remember user session' },
            },
            required: ['email', 'password'],
          },
          example: {
            email: 'user@example.com',
            password: 'securePassword123',
            rememberMe: true,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Authentication successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserInfo' },
                token: { type: 'string', description: 'JWT access token' },
                refreshToken: { type: 'string', description: 'Refresh token' },
                expiresAt: { type: 'string', format: 'date-time', description: 'Token expiration' },
              },
            },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
      '429': { $ref: '#/components/responses/TooManyRequests' },
    },
    security: [], // No auth required for login
  })

  // Logout endpoint
  openAPIGenerator.registerRoute({
    path: '/api/auth/signout',
    method: 'POST',
    summary: 'User Logout',
    description: 'Invalidate user session and tokens',
    tags: ['Authentication'],
    responses: {
      '200': {
        description: 'Logout successful',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SuccessResponse' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  })

  // Session endpoint
  openAPIGenerator.registerRoute({
    path: '/api/auth/session',
    method: 'GET',
    summary: 'Get Current Session',
    description: 'Retrieve current user session information',
    tags: ['Authentication'],
    responses: {
      '200': {
        description: 'Session information',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserInfo' },
                tenant: { $ref: '#/components/schemas/TenantInfo' },
                permissions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'User permissions',
                },
                expiresAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })
}

function registerUserAPIs() {
  // Get user profile
  openAPIGenerator.registerRoute({
    path: '/api/users/profile',
    method: 'GET',
    summary: 'Get User Profile',
    description: 'Retrieve current user profile information',
    tags: ['Users'],
    responses: {
      '200': {
        description: 'User profile',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserInfo' },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })

  // Update user profile
  openAPIGenerator.registerRoute({
    path: '/api/users/profile',
    method: 'PUT',
    summary: 'Update User Profile',
    description: 'Update current user profile information',
    tags: ['Users'],
    requestBody: {
      description: 'Profile update data',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Full name' },
              email: { type: 'string', format: 'email', description: 'Email address' },
              phone: { type: 'string', description: 'Phone number' },
              preferences: {
                type: 'object',
                description: 'User preferences',
                properties: {
                  theme: { type: 'string', enum: ['light', 'dark', 'auto'] },
                  language: { type: 'string', description: 'Preferred language code' },
                  timezone: { type: 'string', description: 'Timezone identifier' },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Profile updated successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserInfo' },
          },
        },
      },
      '400': { $ref: '#/components/responses/BadRequest' },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })
}

function registerTenantAPIs() {
  // Get tenant information
  openAPIGenerator.registerRoute({
    path: '/api/tenants/{tenantId}',
    method: 'GET',
    summary: 'Get Tenant Information',
    description: 'Retrieve tenant details and configuration',
    tags: ['Tenants'],
    parameters: [
      { $ref: '#/components/parameters/TenantId' },
    ],
    responses: {
      '200': {
        description: 'Tenant information',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                ...(openAPIGenerator as any).schemas.TenantInfo.properties,
                settings: {
                  type: 'object',
                  description: 'Tenant configuration settings',
                },
                subscription: {
                  type: 'object',
                  description: 'Subscription information',
                  properties: {
                    plan: { type: 'string', description: 'Subscription plan' },
                    status: { type: 'string', description: 'Subscription status' },
                    expiresAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
      '403': { $ref: '#/components/responses/Forbidden' },
      '404': { $ref: '#/components/responses/NotFound' },
    },
    security: [{ BearerAuth: [] }],
  })
}

function registerDashboardAPIs() {
  // Get dashboard stats
  openAPIGenerator.registerRoute({
    path: '/api/dashboard/stats',
    method: 'GET',
    summary: 'Get Dashboard Statistics',
    description: 'Retrieve key dashboard metrics and statistics',
    tags: ['Analytics'],
    parameters: [
      {
        name: 'period',
        in: 'query',
        description: 'Time period for statistics',
        schema: { type: 'string', enum: ['24h', '7d', '30d', '90d'] },
      },
      {
        name: 'metrics',
        in: 'query',
        description: 'Comma-separated list of metrics to include',
        schema: { type: 'string' },
      },
    ],
    responses: {
      '200': {
        description: 'Dashboard statistics',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                summary: {
                  type: 'object',
                  properties: {
                    totalUsers: { type: 'number' },
                    activeUsers: { type: 'number' },
                    totalRevenue: { type: 'number' },
                    growthRate: { type: 'number' },
                  },
                },
                metrics: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PerformanceMetric' },
                },
                period: { type: 'string' },
                generatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })
}

function registerPerformanceAPIs() {
  // Get performance dashboard
  openAPIGenerator.registerRoute({
    path: '/api/dashboard/performance',
    method: 'GET',
    summary: 'Get Performance Dashboard',
    description: 'Retrieve real-time performance metrics and system health',
    tags: ['Performance'],
    parameters: [
      {
        name: 'type',
        in: 'query',
        description: 'Type of performance data to retrieve',
        schema: { 
          type: 'string', 
          enum: ['overview', 'health', 'metrics', 'trends', 'alerts', 'ux'] 
        },
      },
      {
        name: 'period',
        in: 'query',
        description: 'Time period for metrics',
        schema: { type: 'string', enum: ['1h', '24h', '7d', '30d'] },
      },
      {
        name: 'metrics',
        in: 'query',
        description: 'Comma-separated list of metrics',
        schema: { type: 'string' },
      },
    ],
    responses: {
      '200': {
        description: 'Performance dashboard data',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                { $ref: '#/components/schemas/HealthStatus' },
                {
                  type: 'object',
                  properties: {
                    systemHealth: { $ref: '#/components/schemas/HealthStatus' },
                    recentMetrics: { type: 'object' },
                    activeAlerts: { type: 'array', items: { type: 'object' } },
                    userExperience: { type: 'object' },
                    quickStats: { type: 'object' },
                  },
                },
              ],
            },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })

  // Record performance metric
  openAPIGenerator.registerRoute({
    path: '/api/dashboard/performance',
    method: 'POST',
    summary: 'Record Performance Metric',
    description: 'Submit performance metrics and user interactions',
    tags: ['Performance'],
    requestBody: {
      description: 'Performance metric data',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              action: { 
                type: 'string', 
                enum: ['record_metric', 'record_web_vital', 'record_user_interaction'] 
              },
              name: { type: 'string', description: 'Metric name' },
              value: { type: 'number', description: 'Metric value' },
              unit: { type: 'string', description: 'Metric unit' },
              tags: { type: 'object', description: 'Additional tags' },
            },
            required: ['action'],
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Metric recorded successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SuccessResponse' },
          },
        },
      },
      '400': { $ref: '#/components/responses/BadRequest' },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })
}

function registerSecurityAPIs() {
  // CSP violation reporting
  openAPIGenerator.registerRoute({
    path: '/api/security/csp-report',
    method: 'POST',
    summary: 'Report CSP Violation',
    description: 'Submit Content Security Policy violation report',
    tags: ['Security'],
    requestBody: {
      description: 'CSP violation report',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              'blocked-uri': { type: 'string' },
              'violated-directive': { type: 'string' },
              'original-policy': { type: 'string' },
              'source-file': { type: 'string' },
              'line-number': { type: 'number' },
              'column-number': { type: 'number' },
              'sample': { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      '204': { description: 'Violation reported successfully' },
      '400': { $ref: '#/components/responses/BadRequest' },
    },
    security: [], // No auth required for CSP reports
  })
}

function registerCRMAPIs() {
  // Get customers
  openAPIGenerator.registerRoute({
    path: '/api/crm/customers',
    method: 'GET',
    summary: 'List Customers',
    description: 'Retrieve paginated list of customers',
    tags: ['CRM'],
    parameters: [
      { $ref: '#/components/parameters/Page' },
      { $ref: '#/components/parameters/Limit' },
      { $ref: '#/components/parameters/Sort' },
      { $ref: '#/components/parameters/Filter' },
    ],
    responses: {
      '200': {
        description: 'List of customers',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PaginatedResponse' },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })

  // Create customer
  openAPIGenerator.registerRoute({
    path: '/api/crm/customers',
    method: 'POST',
    summary: 'Create Customer',
    description: 'Create a new customer record',
    tags: ['CRM'],
    requestBody: {
      description: 'Customer data',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Customer name' },
              email: { type: 'string', format: 'email', description: 'Email address' },
              phone: { type: 'string', description: 'Phone number' },
              company: { type: 'string', description: 'Company name' },
              address: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zipCode: { type: 'string' },
                  country: { type: 'string' },
                },
              },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['name', 'email'],
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Customer created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      '400': { $ref: '#/components/responses/BadRequest' },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })
}

function registerIntegrationAPIs() {
  // List integrations
  openAPIGenerator.registerRoute({
    path: '/api/integrations',
    method: 'GET',
    summary: 'List Available Integrations',
    description: 'Retrieve list of available third-party integrations',
    tags: ['Integrations'],
    responses: {
      '200': {
        description: 'List of integrations',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  status: { type: 'string', enum: ['available', 'configured', 'error'] },
                  authType: { type: 'string', enum: ['oauth', 'apikey', 'basic'] },
                  capabilities: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
    security: [{ BearerAuth: [] }],
  })
}

function registerAdminAPIs() {
  // Get system health
  openAPIGenerator.registerRoute({
    path: '/api/admin/health',
    method: 'GET',
    summary: 'System Health Check',
    description: 'Comprehensive system health and status check',
    tags: ['Admin'],
    responses: {
      '200': {
        description: 'System health status',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/HealthStatus' },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
      '403': { $ref: '#/components/responses/Forbidden' },
    },
    security: [{ BearerAuth: [] }],
  })

  // Get audit logs
  openAPIGenerator.registerRoute({
    path: '/api/admin/audit-logs',
    method: 'GET',
    summary: 'Get Audit Logs',
    description: 'Retrieve system audit logs for security and compliance',
    tags: ['Admin'],
    parameters: [
      { $ref: '#/components/parameters/Page' },
      { $ref: '#/components/parameters/Limit' },
      {
        name: 'startDate',
        in: 'query',
        description: 'Start date for log filter',
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'endDate',
        in: 'query',
        description: 'End date for log filter',
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'action',
        in: 'query',
        description: 'Filter by action type',
        schema: { type: 'string' },
      },
      {
        name: 'userId',
        in: 'query',
        description: 'Filter by user ID',
        schema: { type: 'string' },
      },
    ],
    responses: {
      '200': {
        description: 'Audit logs',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                logs: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ActivityLog' },
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    pages: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
      '401': { $ref: '#/components/responses/Unauthorized' },
      '403': { $ref: '#/components/responses/Forbidden' },
    },
    security: [{ BearerAuth: [] }],
  })
}

// Export initialization function
export { initializeAPIDocumentation }