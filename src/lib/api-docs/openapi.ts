/**
 * CoreFlow360 - OpenAPI Documentation
 * API specification for all endpoints
 */

import { customerEndpoints, customerSchemas } from './endpoints/customers'

export const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'CoreFlow360 API',
    version: '1.0.0',
    description: 'AI-Powered Multi-Industry CRM Platform API',
    contact: {
      name: 'CoreFlow360 Support',
      email: 'support@coreflow360.com',
      url: 'https://coreflow360.com'
    },
    license: {
      name: 'Proprietary',
      url: 'https://coreflow360.com/license'
    }
  },
  servers: [
    {
      url: 'https://api.coreflow360.com',
      description: 'Production server'
    },
    {
      url: 'https://staging-api.coreflow360.com',
      description: 'Staging server'
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Freemium',
      description: 'Free tier and subscription management'
    },
    {
      name: 'Onboarding',
      description: 'User onboarding and role selection'
    },
    {
      name: 'Dashboard',
      description: 'Dashboard and analytics endpoints'
    },
    {
      name: 'Metrics',
      description: 'Performance and business metrics'
    },
    {
      name: 'Conversion',
      description: 'Conversion tracking and analytics'
    },
    {
      name: 'Customers',
      description: 'Customer management'
    },
    {
      name: 'WebSocket',
      description: 'Real-time WebSocket endpoints'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authentication token'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for service-to-service communication'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'string',
            description: 'Error type'
          },
          message: {
            type: 'string',
            description: 'Human-readable error message'
          },
          code: {
            type: 'string',
            description: 'Error code for programmatic handling'
          },
          statusCode: {
            type: 'integer',
            description: 'HTTP status code'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        required: ['success'],
        properties: {
          success: {
            type: 'boolean'
          },
          message: {
            type: 'string'
          },
          data: {
            type: 'object'
          }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100
          },
          total: {
            type: 'integer'
          },
          totalPages: {
            type: 'integer'
          },
          hasNext: {
            type: 'boolean'
          },
          hasPrev: {
            type: 'boolean'
          }
        }
      },
      UserRole: {
        type: 'string',
        enum: ['super_admin', 'org_admin', 'department_manager', 'team_lead', 'user']
      },
      SubscriptionStatus: {
        type: 'string',
        enum: ['FREE', 'TRIAL', 'STARTER', 'BUSINESS', 'ENTERPRISE', 'CANCELLED', 'SUSPENDED']
      },
      ModuleName: {
        type: 'string',
        enum: ['crm', 'sales', 'finance', 'operations', 'analytics', 'hr', 'accounting', 'projects', 'inventory']
      },
      AgentType: {
        type: 'string',
        enum: ['crm', 'sales', 'finance', 'operations', 'analytics', 'hr']
      },
      ConversionEventType: {
        type: 'string',
        enum: ['upgrade_prompt', 'feature_usage', 'agent_selected', 'role_selected', 'onboarding_started', 'onboarding_completed', 'upgrade_completed']
      },
      ...customerSchemas,
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          name: {
            type: 'string'
          },
          role: {
            $ref: '#/components/schemas/UserRole'
          },
          tenantId: {
            type: 'string'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      FreemiumStatus: {
        type: 'object',
        properties: {
          subscriptionStatus: {
            $ref: '#/components/schemas/SubscriptionStatus'
          },
          selectedAgent: {
            $ref: '#/components/schemas/AgentType',
            nullable: true
          },
          dailyUsageCount: {
            type: 'integer'
          },
          dailyLimit: {
            type: 'integer'
          },
          canUseFeature: {
            type: 'boolean'
          },
          needsAgentSelection: {
            type: 'boolean'
          },
          activeModules: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ModuleName'
            }
          },
          daysActive: {
            type: 'integer'
          }
        }
      },
      MetricsData: {
        type: 'object',
        properties: {
          responseTime: {
            type: 'number',
            description: 'Response time in milliseconds'
          },
          activeUsers: {
            type: 'integer',
            description: 'Number of active users'
          },
          successRate: {
            type: 'number',
            description: 'Success rate percentage'
          },
          uptime: {
            type: 'number',
            description: 'Uptime percentage'
          },
          aiProcessesPerSecond: {
            type: 'integer',
            description: 'AI processes per second'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    },
    parameters: {
      TenantId: {
        name: 'X-Tenant-ID',
        in: 'header',
        description: 'Tenant identifier',
        required: false,
        schema: {
          type: 'string'
        }
      },
      UserId: {
        name: 'userId',
        in: 'query',
        description: 'User identifier',
        schema: {
          type: 'string'
        }
      },
      Timeframe: {
        name: 'timeframe',
        in: 'query',
        description: 'Time period for data',
        schema: {
          type: 'string',
          enum: ['7d', '30d', '90d', '1y'],
          default: '30d'
        }
      },
      Page: {
        name: 'page',
        in: 'query',
        description: 'Page number',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        }
      },
      Limit: {
        name: 'limit',
        in: 'query',
        description: 'Items per page',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      NotFound: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      RateLimited: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        },
        headers: {
          'Retry-After': {
            description: 'Seconds until rate limit resets',
            schema: {
              type: 'integer'
            }
          },
          'X-RateLimit-Limit': {
            description: 'Rate limit ceiling',
            schema: {
              type: 'integer'
            }
          },
          'X-RateLimit-Remaining': {
            description: 'Remaining requests',
            schema: {
              type: 'integer'
            }
          }
        }
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        description: 'Check if the API is running and healthy',
        operationId: 'healthCheck',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'healthy'
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    },
                    version: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new user',
        description: 'Create a new user account',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name', 'acceptTerms'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string',
                    minLength: 8
                  },
                  name: {
                    type: 'string',
                    minLength: 2
                  },
                  companyName: {
                    type: 'string'
                  },
                  role: {
                    $ref: '#/components/schemas/UserRole'
                  },
                  acceptTerms: {
                    type: 'boolean'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    },
                    user: {
                      $ref: '#/components/schemas/User'
                    },
                    token: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          400: {
            $ref: '#/components/responses/BadRequest'
          },
          409: {
            description: 'User already exists'
          }
        }
      }
    },
    '/api/freemium/status': {
      get: {
        tags: ['Freemium'],
        summary: 'Get freemium status',
        description: 'Get current subscription and freemium status for a user',
        operationId: 'getFreemiumStatus',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            $ref: '#/components/parameters/UserId'
          },
          {
            $ref: '#/components/parameters/TenantId'
          }
        ],
        responses: {
          200: {
            description: 'Freemium status retrieved',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FreemiumStatus'
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          }
        }
      }
    },
    '/api/freemium/select-agent': {
      post: {
        tags: ['Freemium'],
        summary: 'Select free AI agent',
        description: 'Select the free AI agent for freemium users',
        operationId: 'selectAgent',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['selectedAgent'],
                properties: {
                  userId: {
                    type: 'string'
                  },
                  tenantId: {
                    type: 'string'
                  },
                  selectedAgent: {
                    $ref: '#/components/schemas/AgentType'
                  },
                  fromOnboarding: {
                    type: 'boolean',
                    default: false
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Agent selected successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    },
                    selectedAgent: {
                      type: 'string'
                    },
                    isFirstSelection: {
                      type: 'boolean'
                    },
                    dailyLimit: {
                      type: 'integer'
                    }
                  }
                }
              }
            }
          },
          400: {
            $ref: '#/components/responses/BadRequest'
          }
        }
      }
    },
    '/api/metrics/live': {
      get: {
        tags: ['Metrics'],
        summary: 'Get live metrics',
        description: 'Get real-time performance metrics',
        operationId: 'getLiveMetrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Live metrics data',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MetricsData'
                }
              }
            }
          },
          429: {
            $ref: '#/components/responses/RateLimited'
          }
        }
      }
    },
    '/api/conversion/track': {
      post: {
        tags: ['Conversion'],
        summary: 'Track conversion event',
        description: 'Track user conversion events for analytics',
        operationId: 'trackConversion',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventType', 'triggerType', 'actionTaken'],
                properties: {
                  eventType: {
                    $ref: '#/components/schemas/ConversionEventType'
                  },
                  triggerType: {
                    type: 'string'
                  },
                  actionTaken: {
                    type: 'string',
                    enum: ['converted', 'dismissed', 'delayed']
                  },
                  currentModule: {
                    type: 'string'
                  },
                  userPlan: {
                    type: 'string'
                  },
                  conversionValue: {
                    type: 'number'
                  },
                  triggerContext: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Event tracked successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/ws': {
      get: {
        tags: ['WebSocket'],
        summary: 'WebSocket connection',
        description: 'Establish WebSocket connection for real-time updates',
        operationId: 'websocket',
        responses: {
          101: {
            description: 'Switching Protocols - WebSocket connection established'
          },
          501: {
            description: 'WebSocket not implemented in this environment'
          }
        }
      }
    },
    ...customerEndpoints
  }
}