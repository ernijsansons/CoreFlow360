/**
 * CoreFlow360 - OpenAPI Documentation Generator
 * Comprehensive API documentation with automatic generation and interactive docs
 */

import { OpenAPIV3 } from 'openapi-types'
import { z } from 'zod'

// API route metadata interface
export interface APIRouteMetadata {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  summary: string
  description: string
  tags: string[]
  parameters?: APIParameter[]
  requestBody?: APIRequestBody
  responses: Record<string, APIResponse>
  security?: SecurityRequirement[]
  deprecated?: boolean
  operationId?: string
}

export interface APIParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required?: boolean
  description: string
  schema: any
  example?: any
}

export interface APIRequestBody {
  description: string
  required?: boolean
  content: Record<string, {
    schema: any
    example?: any
  }>
}

export interface APIResponse {
  description: string
  content?: Record<string, {
    schema: any
    example?: any
  }>
  headers?: Record<string, {
    description: string
    schema: any
  }>
}

export interface SecurityRequirement {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
  name: string
  in?: 'query' | 'header' | 'cookie'
  scheme?: string
  bearerFormat?: string
}

// Common schemas for reuse
export const CommonSchemas = {
  Error: z.object({
    error: z.string().describe('Error message'),
    code: z.string().optional().describe('Error code'),
    details: z.any().optional().describe('Additional error details'),
  }),

  Success: z.object({
    success: z.boolean().describe('Operation success status'),
    message: z.string().optional().describe('Success message'),
    data: z.any().optional().describe('Response data'),
  }),

  PaginatedResponse: z.object({
    data: z.array(z.any()).describe('Array of items'),
    pagination: z.object({
      page: z.number().describe('Current page number'),
      limit: z.number().describe('Items per page'),
      total: z.number().describe('Total number of items'),
      pages: z.number().describe('Total number of pages'),
    }).describe('Pagination information'),
  }),

  TenantInfo: z.object({
    id: z.string().describe('Tenant ID'),
    name: z.string().describe('Tenant name'),
    createdAt: z.string().datetime().describe('Creation timestamp'),
    updatedAt: z.string().datetime().describe('Last update timestamp'),
  }),

  UserInfo: z.object({
    id: z.string().describe('User ID'),
    email: z.string().email().describe('User email'),
    name: z.string().describe('User full name'),
    role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).describe('User role'),
    tenantId: z.string().describe('Associated tenant ID'),
    createdAt: z.string().datetime().describe('Creation timestamp'),
  }),

  ActivityLog: z.object({
    id: z.string().describe('Activity ID'),
    action: z.string().describe('Action performed'),
    entityType: z.string().describe('Type of entity affected'),
    entityId: z.string().describe('ID of entity affected'),
    userId: z.string().describe('User who performed the action'),
    tenantId: z.string().describe('Tenant context'),
    metadata: z.record(z.any()).describe('Additional action metadata'),
    timestamp: z.string().datetime().describe('When the action occurred'),
  }),

  PerformanceMetric: z.object({
    id: z.string().describe('Metric ID'),
    name: z.string().describe('Metric name'),
    value: z.number().describe('Metric value'),
    unit: z.string().describe('Metric unit'),
    timestamp: z.string().datetime().describe('Measurement timestamp'),
    tags: z.record(z.string()).describe('Metric tags'),
  }),

  HealthStatus: z.object({
    status: z.enum(['healthy', 'warning', 'critical']).describe('Health status'),
    score: z.number().min(0).max(100).describe('Health score (0-100)'),
    checks: z.array(z.object({
      name: z.string().describe('Check name'),
      status: z.enum(['pass', 'fail', 'warn']).describe('Check result'),
      message: z.string().optional().describe('Check message'),
      duration: z.number().describe('Check duration in milliseconds'),
    })).describe('Individual health checks'),
    timestamp: z.string().datetime().describe('Health check timestamp'),
  }),
}

export class OpenAPIGenerator {
  private static instance: OpenAPIGenerator
  private routes: APIRouteMetadata[] = []
  private schemas: Record<string, any> = {}
  private securitySchemes: Record<string, any> = {}

  constructor() {
    this.initializeCommonSchemas()
    this.initializeSecuritySchemes()
  }

  static getInstance(): OpenAPIGenerator {
    if (!OpenAPIGenerator.instance) {
      OpenAPIGenerator.instance = new OpenAPIGenerator()
    }
    return OpenAPIGenerator.instance
  }

  /**
   * Register API route for documentation
   */
  registerRoute(metadata: APIRouteMetadata): void {
    // Remove existing route with same path and method
    this.routes = this.routes.filter(route => 
      !(route.path === metadata.path && route.method === metadata.method)
    )
    
    this.routes.push(metadata)
  }

  /**
   * Register custom schema
   */
  registerSchema(name: string, schema: any): void {
    this.schemas[name] = this.convertZodToOpenAPI(schema)
  }

  /**
   * Generate complete OpenAPI specification
   */
  generateOpenAPISpec(): OpenAPIV3.Document {
    const spec: OpenAPIV3.Document = {
      openapi: '3.0.3',
      info: {
        title: 'CoreFlow360 API',
        description: 'Comprehensive API for the CoreFlow360 Autonomous Business Operating System',
        version: process.env.npm_package_version || '1.0.0',
        contact: {
          name: 'CoreFlow360 Team',
          url: 'https://coreflow360.com/support',
          email: 'api-support@coreflow360.com',
        },
        license: {
          name: 'Proprietary',
          url: 'https://coreflow360.com/license',
        },
        termsOfService: 'https://coreflow360.com/terms',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://coreflow360.com',
          description: 'Production server',
        },
        {
          url: 'https://staging.coreflow360.com',
          description: 'Staging server',
        },
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      paths: this.generatePaths(),
      components: {
        schemas: {
          ...this.schemas,
          ...this.generateCommonSchemas(),
        },
        securitySchemes: this.securitySchemes,
        responses: this.generateCommonResponses(),
        parameters: this.generateCommonParameters(),
      },
      security: [
        { ApiKeyAuth: [] },
        { BearerAuth: [] },
      ],
      tags: this.generateTags(),
    }

    return spec
  }

  /**
   * Generate interactive documentation HTML
   */
  generateInteractiveDocs(): string {
    const spec = this.generateOpenAPISpec()
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoreFlow360 API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <link rel="icon" type="image/png" href="https://coreflow360.com/favicon.png" sizes="32x32" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .swagger-ui .topbar .download-url-wrapper .download-url-button {
            background: rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.3);
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/documentation/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                tryItOutEnabled: true,
                requestInterceptor: (request) => {
                    request.headers['X-API-Version'] = '1.0';
                    return request;
                },
                responseInterceptor: (response) => {
                    console.log('API Response:', response);
                    return response;
                }
            });
        };
    </script>
</body>
</html>
    `
  }

  /**
   * Export API documentation as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.generateOpenAPISpec(), null, 2)
  }

  /**
   * Export API documentation as YAML
   */
  exportAsYAML(): string {
    // Simple YAML conversion (in production, use a proper YAML library)
    const spec = this.generateOpenAPISpec()
    return JSON.stringify(spec, null, 2) // Placeholder - use yaml library
  }

  /**
   * Generate Postman collection
   */
  generatePostmanCollection(): any {
    const spec = this.generateOpenAPISpec()
    
    return {
      info: {
        name: spec.info.title,
        description: spec.info.description,
        version: spec.info.version,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      auth: {
        type: 'apikey',
        apikey: [
          {
            key: 'key',
            value: 'x-api-key',
            type: 'string',
          },
          {
            key: 'value',
            value: '{{api_key}}',
            type: 'string',
          },
          {
            key: 'in',
            value: 'header',
            type: 'string',
          },
        ],
      },
      item: this.convertPathsToPostmanItems(spec.paths),
      variable: [
        {
          key: 'base_url',
          value: spec.servers?.[0]?.url || 'https://api.coreflow360.com',
        },
        {
          key: 'api_key',
          value: 'your-api-key-here',
        },
      ],
    }
  }

  // Private methods

  private initializeCommonSchemas(): void {
    Object.entries(CommonSchemas).forEach(([name, schema]) => {
      this.registerSchema(name, schema)
    })
  }

  private initializeSecuritySchemes(): void {
    this.securitySchemes = {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for authentication',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token authentication',
      },
      OAuth2: {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: '/api/auth/authorize',
            tokenUrl: '/api/auth/token',
            scopes: {
              'read': 'Read access',
              'write': 'Write access',
              'admin': 'Administrative access',
            },
          },
        },
      },
    }
  }

  private generatePaths(): OpenAPIV3.PathsObject {
    const paths: OpenAPIV3.PathsObject = {}

    for (const route of this.routes) {
      if (!paths[route.path]) {
        paths[route.path] = {}
      }

      const operation: OpenAPIV3.OperationObject = {
        summary: route.summary,
        description: route.description,
        tags: route.tags,
        operationId: route.operationId || `${route.method.toLowerCase()}${route.path.replace(/[^a-zA-Z0-9]/g, '')}`,
        parameters: route.parameters?.map(param => ({
          name: param.name,
          in: param.in,
          required: param.required,
          description: param.description,
          schema: param.schema,
          example: param.example,
        })),
        requestBody: route.requestBody ? {
          description: route.requestBody.description,
          required: route.requestBody.required,
          content: route.requestBody.content,
        } : undefined,
        responses: route.responses,
        security: route.security?.map(sec => ({ [sec.name]: [] })),
        deprecated: route.deprecated,
      }

      paths[route.path][route.method.toLowerCase() as keyof OpenAPIV3.PathItemObject] = operation
    }

    return paths
  }

  private generateCommonSchemas(): Record<string, OpenAPIV3.SchemaObject> {
    return {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Error message' },
          code: { type: 'string', description: 'Error code' },
          details: { type: 'object', description: 'Additional error details' },
        },
        required: ['error'],
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', description: 'Operation success status' },
          message: { type: 'string', description: 'Success message' },
          data: { type: 'object', description: 'Response data' },
        },
        required: ['success'],
      },
    }
  }

  private generateCommonResponses(): Record<string, OpenAPIV3.ResponseObject> {
    return {
      BadRequest: {
        description: 'Bad Request - Invalid input parameters',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized - Authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFound: {
        description: 'Not Found - Resource does not exist',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      TooManyRequests: {
        description: 'Too Many Requests - Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
        headers: {
          'Retry-After': {
            description: 'Number of seconds to wait before retrying',
            schema: { type: 'integer' },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error - Server encountered an error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    }
  }

  private generateCommonParameters(): Record<string, OpenAPIV3.ParameterObject> {
    return {
      TenantId: {
        name: 'tenantId',
        in: 'path',
        required: true,
        description: 'Tenant identifier',
        schema: { type: 'string', pattern: '^[a-zA-Z0-9-_]{3,50}$' },
      },
      Page: {
        name: 'page',
        in: 'query',
        required: false,
        description: 'Page number for pagination',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      Limit: {
        name: 'limit',
        in: 'query',
        required: false,
        description: 'Number of items per page',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
      Sort: {
        name: 'sort',
        in: 'query',
        required: false,
        description: 'Sort field and direction (e.g., "name:asc")',
        schema: { type: 'string', pattern: '^[a-zA-Z0-9_]+(:(asc|desc))?$' },
      },
      Filter: {
        name: 'filter',
        in: 'query',
        required: false,
        description: 'Filter criteria in JSON format',
        schema: { type: 'string' },
      },
    }
  }

  private generateTags(): OpenAPIV3.TagObject[] {
    const tagMap = new Map<string, { description: string; count: number }>()

    // Count tag usage and collect descriptions
    this.routes.forEach(route => {
      route.tags.forEach(tag => {
        if (tagMap.has(tag)) {
          tagMap.get(tag)!.count++
        } else {
          tagMap.set(tag, { description: this.getTagDescription(tag), count: 1 })
        }
      })
    })

    return Array.from(tagMap.entries()).map(([name, { description }]) => ({
      name,
      description,
    }))
  }

  private getTagDescription(tag: string): string {
    const descriptions: Record<string, string> = {
      'Authentication': 'User authentication and session management',
      'Users': 'User management and profile operations',
      'Tenants': 'Multi-tenant organization management',
      'CRM': 'Customer relationship management',
      'Accounting': 'Financial and accounting operations',
      'HR': 'Human resources management',
      'Projects': 'Project management and tracking',
      'Inventory': 'Inventory and asset management',
      'Analytics': 'Business analytics and reporting',
      'AI': 'AI-powered features and insights',
      'Integrations': 'Third-party integrations',
      'Webhooks': 'Webhook management and events',
      'Security': 'Security and audit operations',
      'Performance': 'Performance monitoring and metrics',
      'Admin': 'Administrative operations',
    }

    return descriptions[tag] || `${tag} related operations`
  }

  private convertZodToOpenAPI(schema: z.ZodType): any {
    // Basic Zod to OpenAPI conversion
    // In production, use a library like zod-to-openapi
    if (schema instanceof z.ZodString) {
      return { type: 'string' }
    }
    if (schema instanceof z.ZodNumber) {
      return { type: 'number' }
    }
    if (schema instanceof z.ZodBoolean) {
      return { type: 'boolean' }
    }
    if (schema instanceof z.ZodArray) {
      return { type: 'array', items: this.convertZodToOpenAPI(schema.element) }
    }
    if (schema instanceof z.ZodObject) {
      const properties: Record<string, any> = {}
      const shape = schema.shape
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = this.convertZodToOpenAPI(value as z.ZodType)
      }
      return { type: 'object', properties }
    }
    return { type: 'object' }
  }

  private convertPathsToPostmanItems(paths: OpenAPIV3.PathsObject): any[] {
    const items: any[] = []

    Object.entries(paths).forEach(([path, pathItem]) => {
      if (!pathItem) return

      Object.entries(pathItem).forEach(([method, operation]) => {
        if (!operation || typeof operation !== 'object') return

        items.push({
          name: operation.summary || `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            header: [
              {
                key: 'Content-Type',
                value: 'application/json',
              },
            ],
            url: {
              raw: '{{base_url}}' + path,
              host: ['{{base_url}}'],
              path: path.split('/').filter(Boolean),
            },
            description: operation.description,
          },
        })
      })
    })

    return items
  }
}

// Singleton instance
export const openAPIGenerator = OpenAPIGenerator.getInstance()

// Decorator for automatic API documentation
export function DocumentAPI(metadata: Omit<APIRouteMetadata, 'path' | 'method'>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    // Extract path and method from context (would need more sophisticated implementation)
    const path = target.constructor.path || '/unknown'
    const method = propertyName.toUpperCase() as APIRouteMetadata['method']

    // Register route with OpenAPI generator
    openAPIGenerator.registerRoute({
      path,
      method,
      ...metadata,
    })

    return descriptor
  }
}