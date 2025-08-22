/**
 * CoreFlow360 - API Documentation Hub
 * Main documentation endpoint with links to all documentation formats
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeAPIDocumentation } from '@/lib/documentation/api-registry'

// Initialize API documentation on startup
initializeAPIDocumentation()

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin
  
  const documentationHub = {
    title: 'CoreFlow360 API Documentation',
    description: 'Comprehensive API documentation for the CoreFlow360 Autonomous Business Operating System',
    version: process.env.npm_package_version || '1.0.0',
    formats: {
      interactive: {
        url: `${baseUrl}/api/documentation/swagger`,
        description: 'Interactive Swagger UI documentation with live testing capabilities',
        type: 'text/html',
      },
      openapi: {
        url: `${baseUrl}/api/documentation/openapi.json`,
        description: 'OpenAPI 3.0 specification in JSON format',
        type: 'application/json',
      },
      postman: {
        url: `${baseUrl}/api/documentation/postman`,
        description: 'Postman collection for easy API testing and exploration',
        type: 'application/json',
        requiresAuth: true,
      },
    },
    resources: {
      quickStart: {
        description: 'Getting started with the CoreFlow360 API',
        topics: [
          'Authentication and API keys',
          'Rate limiting and quotas',
          'Error handling and response codes',
          'Pagination and filtering',
          'Webhooks and real-time events',
        ],
      },
      sdks: {
        description: 'Official SDKs and client libraries',
        available: [
          { language: 'JavaScript/TypeScript', status: 'Available' },
          { language: 'Python', status: 'Coming Soon' },
          { language: 'Java', status: 'Planned' },
          { language: 'C#', status: 'Planned' },
        ],
      },
      examples: {
        description: 'Code examples and use cases',
        categories: [
          'Authentication flows',
          'CRUD operations',
          'Bulk operations',
          'Real-time subscriptions',
          'Integration patterns',
        ],
      },
    },
    support: {
      documentation: 'https://docs.coreflow360.com',
      community: 'https://community.coreflow360.com',
      support: 'https://support.coreflow360.com',
      status: 'https://status.coreflow360.com',
    },
    apiInfo: {
      baseUrl: `${baseUrl}/api`,
      version: '1.0',
      authentication: {
        types: ['API Key', 'Bearer Token', 'OAuth 2.0'],
        headers: {
          apiKey: 'x-api-key',
          bearer: 'Authorization: Bearer <token>',
        },
      },
      rateLimit: {
        default: '100 requests per minute',
        authenticated: '1000 requests per minute',
        premium: '5000 requests per minute',
      },
      environments: [
        {
          name: 'Production',
          url: 'https://coreflow360.com/api',
          description: 'Live production environment',
        },
        {
          name: 'Staging',
          url: 'https://staging.coreflow360.com/api',
          description: 'Staging environment for testing',
        },
        {
          name: 'Development',
          url: 'http://localhost:3000/api',
          description: 'Local development environment',
        },
      ],
    },
    changelog: {
      description: 'API version history and changes',
      latest: {
        version: '1.0.0',
        date: new Date().toISOString().split('T')[0],
        changes: [
          'Initial API release',
          'Authentication and user management',
          'Core CRM functionality',
          'Performance monitoring endpoints',
          'Comprehensive error handling',
        ],
      },
    },
    meta: {
      generatedAt: new Date().toISOString(),
      endpoints: await getEndpointCount(),
      schemas: await getSchemaCount(),
    },
  }

  return NextResponse.json(documentationHub, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  })
}

async function getEndpointCount(): Promise<number> {
  // This would typically query the registered routes
  // For now, return an estimated count
  return 45
}

async function getSchemaCount(): Promise<number> {
  // This would typically count the registered schemas
  // For now, return an estimated count
  return 20
}