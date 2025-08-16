/**
 * CoreFlow360 - API Schema Registry
 * 
 * Centralized schema management with version control, validation, and change detection
 * Ensures API backward compatibility and smooth evolution
 */

import { z } from 'zod';
import { EventEmitter } from 'events';

export interface APISchema {
  version: string;
  endpoint: string;
  method: string;
  requestSchema?: z.ZodType<any>;
  responseSchema?: z.ZodType<any>;
  deprecated?: boolean;
  deprecationDate?: Date;
  replacementEndpoint?: string;
  breaking?: boolean;
  description?: string;
  examples?: {
    request?: any;
    response?: any;
  };
  metadata?: Record<string, any>;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors?: z.ZodError[];
  warnings?: string[];
  compatibilityIssues?: CompatibilityIssue[];
}

export interface CompatibilityIssue {
  type: 'breaking' | 'warning' | 'info';
  message: string;
  field?: string;
  severity: 'critical' | 'major' | 'minor';
  migration?: string;
}

export interface SchemaEvolution {
  fromVersion: string;
  toVersion: string;
  changes: SchemaChange[];
  migration?: string;
  breaking: boolean;
}

export interface SchemaChange {
  type: 'field_added' | 'field_removed' | 'field_modified' | 'type_changed' | 'validation_changed';
  path: string;
  oldValue?: any;
  newValue?: any;
  breaking: boolean;
  description: string;
}

export class APISchemaRegistry extends EventEmitter {
  private schemas: Map<string, Map<string, APISchema>> = new Map();
  private evolutions: Map<string, SchemaEvolution[]> = new Map();
  private validationCache: Map<string, SchemaValidationResult> = new Map();

  constructor() {
    super();
    this.loadCoreSchemas();
  }

  /**
   * Register a new API schema version
   */
  registerSchema(schema: APISchema): void {
    const key = this.getSchemaKey(schema.endpoint, schema.method);
    
    if (!this.schemas.has(key)) {
      this.schemas.set(key, new Map());
    }

    const versions = this.schemas.get(key)!;
    const existingSchema = versions.get(schema.version);

    if (existingSchema) {
      // Check for changes and create evolution record
      const evolution = this.createEvolution(existingSchema, schema);
      if (evolution.changes.length > 0) {
        this.recordEvolution(key, evolution);
      }
    }

    versions.set(schema.version, schema);
    this.invalidateCache(key);

    this.emit('schemaRegistered', {
      endpoint: schema.endpoint,
      method: schema.method,
      version: schema.version,
      breaking: schema.breaking || false
    });

    console.log(`📋 Schema registered: ${schema.method} ${schema.endpoint} v${schema.version}`);
  }

  /**
   * Get schema for specific endpoint and version
   */
  getSchema(endpoint: string, method: string, version?: string): APISchema | null {
    const key = this.getSchemaKey(endpoint, method);
    const versions = this.schemas.get(key);

    if (!versions || versions.size === 0) {
      return null;
    }

    if (version) {
      return versions.get(version) || null;
    }

    // Return latest version
    const sortedVersions = Array.from(versions.entries()).sort(([a], [b]) => 
      this.compareVersions(b, a)
    );

    return sortedVersions[0]?.[1] || null;
  }

  /**
   * Validate request/response against schema
   */
  validateData(
    endpoint: string,
    method: string,
    data: any,
    type: 'request' | 'response',
    version?: string
  ): SchemaValidationResult {
    const cacheKey = `${endpoint}:${method}:${type}:${version || 'latest'}:${JSON.stringify(data)}`;
    const cached = this.validationCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const schema = this.getSchema(endpoint, method, version);
    
    if (!schema) {
      const result: SchemaValidationResult = {
        valid: false,
        warnings: [`No schema found for ${method} ${endpoint}`]
      };
      this.validationCache.set(cacheKey, result);
      return result;
    }

    const zodSchema = type === 'request' ? schema.requestSchema : schema.responseSchema;
    
    if (!zodSchema) {
      const result: SchemaValidationResult = {
        valid: true,
        warnings: [`No ${type} schema defined for ${method} ${endpoint}`]
      };
      this.validationCache.set(cacheKey, result);
      return result;
    }

    try {
      zodSchema.parse(data);
      const result: SchemaValidationResult = { valid: true };
      this.validationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      const result: SchemaValidationResult = {
        valid: false,
        errors: [error as z.ZodError]
      };
      this.validationCache.set(cacheKey, result);
      return result;
    }
  }

  /**
   * Check backward compatibility between schema versions
   */
  checkCompatibility(
    endpoint: string,
    method: string,
    fromVersion: string,
    toVersion: string
  ): CompatibilityIssue[] {
    const fromSchema = this.getSchema(endpoint, method, fromVersion);
    const toSchema = this.getSchema(endpoint, method, toVersion);

    if (!fromSchema || !toSchema) {
      return [{
        type: 'breaking',
        message: 'Schema version not found',
        severity: 'critical'
      }];
    }

    const issues: CompatibilityIssue[] = [];

    // Check for breaking changes
    if (toSchema.breaking) {
      issues.push({
        type: 'breaking',
        message: 'Schema marked as breaking change',
        severity: 'critical',
        migration: this.getEvolution(endpoint, method, fromVersion, toVersion)?.migration
      });
    }

    // Check if endpoint is deprecated
    if (toSchema.deprecated) {
      issues.push({
        type: 'warning',
        message: `Endpoint deprecated${toSchema.deprecationDate ? ` on ${toSchema.deprecationDate.toISOString()}` : ''}`,
        severity: 'major',
        migration: toSchema.replacementEndpoint ? `Use ${toSchema.replacementEndpoint} instead` : undefined
      });
    }

    // Analyze schema structure changes
    if (fromSchema.requestSchema && toSchema.requestSchema) {
      const requestIssues = this.analyzeSchemaChanges(
        fromSchema.requestSchema,
        toSchema.requestSchema,
        'request'
      );
      issues.push(...requestIssues);
    }

    if (fromSchema.responseSchema && toSchema.responseSchema) {
      const responseIssues = this.analyzeSchemaChanges(
        fromSchema.responseSchema,
        toSchema.responseSchema,
        'response'
      );
      issues.push(...responseIssues);
    }

    return issues;
  }

  /**
   * Get all available versions for an endpoint
   */
  getVersions(endpoint: string, method: string): string[] {
    const key = this.getSchemaKey(endpoint, method);
    const versions = this.schemas.get(key);
    
    if (!versions) {
      return [];
    }

    return Array.from(versions.keys()).sort((a, b) => this.compareVersions(b, a));
  }

  /**
   * Get evolution history for an endpoint
   */
  getEvolutionHistory(endpoint: string, method: string): SchemaEvolution[] {
    const key = this.getSchemaKey(endpoint, method);
    return this.evolutions.get(key) || [];
  }

  /**
   * Generate OpenAPI specification
   */
  generateOpenAPISpec(): any {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'CoreFlow360 API',
        version: '1.0.0',
        description: 'Autonomous Business Operating System API'
      },
      paths: {} as any
    };

    for (const [key, versions] of this.schemas.entries()) {
      const [endpoint, method] = key.split(':');
      const latestSchema = this.getSchema(endpoint, method);
      
      if (!latestSchema) continue;

      if (!spec.paths[endpoint]) {
        spec.paths[endpoint] = {};
      }

      spec.paths[endpoint][method.toLowerCase()] = {
        summary: latestSchema.description || `${method} ${endpoint}`,
        deprecated: latestSchema.deprecated,
        requestBody: latestSchema.requestSchema ? {
          content: {
            'application/json': {
              schema: this.zodToOpenAPI(latestSchema.requestSchema)
            }
          }
        } : undefined,
        responses: {
          '200': {
            description: 'Success',
            content: latestSchema.responseSchema ? {
              'application/json': {
                schema: this.zodToOpenAPI(latestSchema.responseSchema)
              }
            } : undefined
          }
        }
      };
    }

    return spec;
  }

  /**
   * Get schema statistics
   */
  getStatistics(): {
    totalEndpoints: number;
    totalVersions: number;
    deprecatedEndpoints: number;
    breakingChanges: number;
    recentChanges: SchemaEvolution[];
  } {
    let totalVersions = 0;
    let deprecatedEndpoints = 0;
    let breakingChanges = 0;

    for (const versions of this.schemas.values()) {
      totalVersions += versions.size;
      
      const latestSchema = Array.from(versions.values())
        .sort((a, b) => this.compareVersions(b.version, a.version))[0];
      
      if (latestSchema?.deprecated) {
        deprecatedEndpoints++;
      }
    }

    for (const evolutions of this.evolutions.values()) {
      breakingChanges += evolutions.filter(e => e.breaking).length;
    }

    const recentChanges = Array.from(this.evolutions.values())
      .flat()
      .sort((a, b) => this.compareVersions(b.toVersion, a.toVersion))
      .slice(0, 10);

    return {
      totalEndpoints: this.schemas.size,
      totalVersions,
      deprecatedEndpoints,
      breakingChanges,
      recentChanges
    };
  }

  private getSchemaKey(endpoint: string, method: string): string {
    return `${endpoint}:${method.toUpperCase()}`;
  }

  private createEvolution(oldSchema: APISchema, newSchema: APISchema): SchemaEvolution {
    const changes: SchemaChange[] = [];
    let breaking = false;

    // Compare schemas and detect changes
    // This is a simplified implementation - in production, you'd want more sophisticated diffing
    if (newSchema.breaking || oldSchema.breaking !== newSchema.breaking) {
      changes.push({
        type: 'field_modified',
        path: 'breaking',
        oldValue: oldSchema.breaking,
        newValue: newSchema.breaking,
        breaking: true,
        description: 'Schema breaking status changed'
      });
      breaking = true;
    }

    if (oldSchema.deprecated !== newSchema.deprecated) {
      changes.push({
        type: 'field_modified',
        path: 'deprecated',
        oldValue: oldSchema.deprecated,
        newValue: newSchema.deprecated,
        breaking: false,
        description: 'Schema deprecation status changed'
      });
    }

    return {
      fromVersion: oldSchema.version,
      toVersion: newSchema.version,
      changes,
      breaking
    };
  }

  private recordEvolution(key: string, evolution: SchemaEvolution): void {
    if (!this.evolutions.has(key)) {
      this.evolutions.set(key, []);
    }
    
    this.evolutions.get(key)!.push(evolution);
    
    this.emit('schemaEvolution', {
      endpoint: key,
      evolution
    });
  }

  private getEvolution(
    endpoint: string,
    method: string,
    fromVersion: string,
    toVersion: string
  ): SchemaEvolution | null {
    const key = this.getSchemaKey(endpoint, method);
    const evolutions = this.evolutions.get(key);
    
    if (!evolutions) return null;

    return evolutions.find(e => 
      e.fromVersion === fromVersion && e.toVersion === toVersion
    ) || null;
  }

  private analyzeSchemaChanges(
    fromSchema: z.ZodType<any>,
    toSchema: z.ZodType<any>,
    type: string
  ): CompatibilityIssue[] {
    // Simplified schema analysis - in production, you'd want more sophisticated comparison
    const issues: CompatibilityIssue[] = [];

    try {
      // Basic type comparison
      if (fromSchema.constructor !== toSchema.constructor) {
        issues.push({
          type: 'breaking',
          message: `${type} schema type changed`,
          severity: 'critical'
        });
      }
    } catch (error) {
      issues.push({
        type: 'warning',
        message: `Could not analyze ${type} schema changes`,
        severity: 'minor'
      });
    }

    return issues;
  }

  private compareVersions(a: string, b: string): number {
    // Simplified version comparison - handles semantic versioning
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart !== bPart) {
        return aPart - bPart;
      }
    }
    
    return 0;
  }

  private zodToOpenAPI(schema: z.ZodType<any>): any {
    // Simplified Zod to OpenAPI conversion
    // In production, you'd use a library like @anatine/zod-openapi
    return {
      type: 'object',
      description: 'Generated from Zod schema'
    };
  }

  private invalidateCache(key: string): void {
    const keysToDelete = Array.from(this.validationCache.keys())
      .filter(cacheKey => cacheKey.startsWith(key));
    
    for (const keyToDelete of keysToDelete) {
      this.validationCache.delete(keyToDelete);
    }
  }

  private loadCoreSchemas(): void {
    // Register core API schemas
    this.registerCoreCustomerSchemas();
    this.registerCoreAdminSchemas();
    this.registerCoreSubscriptionSchemas();
  }

  private registerCoreCustomerSchemas(): void {
    const customerSchema = z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      industry: z.string().optional()
    });

    const customerListResponse = z.object({
      customers: z.array(customerSchema),
      total: z.number(),
      page: z.number(),
      limit: z.number()
    });

    this.registerSchema({
      version: '1.0.0',
      endpoint: '/api/customers',
      method: 'GET',
      responseSchema: customerListResponse,
      description: 'List customers with pagination'
    });

    this.registerSchema({
      version: '1.0.0',
      endpoint: '/api/customers',
      method: 'POST',
      requestSchema: customerSchema.omit({ id: true }),
      responseSchema: customerSchema,
      description: 'Create a new customer'
    });

    this.registerSchema({
      version: '1.0.0',
      endpoint: '/api/customers/{id}',
      method: 'GET',
      responseSchema: customerSchema,
      description: 'Get customer by ID'
    });
  }

  private registerCoreAdminSchemas(): void {
    const webhookDLQMetrics = z.object({
      pending: z.number(),
      recovered: z.number(),
      abandoned: z.number(),
      totalFailures: z.number(),
      recoveryRate: z.number(),
      averageRecoveryTime: z.number()
    });

    this.registerSchema({
      version: '1.0.0',
      endpoint: '/api/admin/webhook-dlq/metrics',
      method: 'GET',
      responseSchema: webhookDLQMetrics,
      description: 'Get Dead Letter Queue metrics'
    });
  }

  private registerCoreSubscriptionSchemas(): void {
    const subscriptionSchema = z.object({
      id: z.string(),
      status: z.enum(['active', 'canceled', 'past_due']),
      currentPeriodStart: z.string().datetime(),
      currentPeriodEnd: z.string().datetime(),
      modules: z.array(z.string())
    });

    this.registerSchema({
      version: '1.0.0',
      endpoint: '/api/subscriptions/current',
      method: 'GET',
      responseSchema: subscriptionSchema,
      description: 'Get current subscription'
    });
  }
}

// Global schema registry instance
export const schemaRegistry = new APISchemaRegistry();

// Middleware for automatic schema validation
export function withSchemaValidation(endpoint: string, method: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [request] = args;
      
      // Validate request if schema exists
      if (request.body || request.query) {
        const data = request.body || request.query;
        const result = schemaRegistry.validateData(endpoint, method, data, 'request');
        
        if (!result.valid && result.errors) {
          return new Response(JSON.stringify({
            error: 'Request validation failed',
            details: result.errors.map(e => e.message)
          }), { status: 400 });
        }
      }

      // Execute original method
      const response = await originalMethod.apply(this, args);

      // Validate response if schema exists
      if (response.ok) {
        try {
          const responseData = await response.clone().json();
          const result = schemaRegistry.validateData(endpoint, method, responseData, 'response');
          
          if (!result.valid) {
            console.warn('Response validation failed:', result.errors);
          }
        } catch {
          // Response is not JSON, skip validation
        }
      }

      return response;
    };

    return descriptor;
  };
}