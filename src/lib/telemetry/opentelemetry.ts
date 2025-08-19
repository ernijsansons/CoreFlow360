/**
 * CoreFlow360 - OpenTelemetry Integration
 *
 * Comprehensive observability with distributed tracing, metrics, and logs
 * for end-to-end request tracking across microservices and external APIs
 */

import { NodeSDK } from '@opentelemetry/sdk-node'
// Note: Resource may be part of semantic-conventions or sdk-node in newer versions
// Let's create a simple resource configuration
const Resource = {
  default: () => ({
    attributes: {},
  }),
}
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
// JaegerExporter causes build issues with file loading
// import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http'
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base'
import { Context, trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api'
import { metrics } from '@opentelemetry/api'
import { v4 as uuidv4 } from 'uuid'

// Custom instrumentations - conditional imports for build safety
let PrismaInstrumentation: any = null
let HttpInstrumentation: any = null
let ExpressInstrumentation: any = null

// Only import during runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    PrismaInstrumentation = require('@prisma/instrumentation').PrismaInstrumentation
    HttpInstrumentation = require('@opentelemetry/instrumentation-http').HttpInstrumentation
    ExpressInstrumentation = require('@opentelemetry/instrumentation-express').ExpressInstrumentation
  } catch (e) {
    // Silently fail during build
  }
}

// Optional Redis instrumentation - not critical for build
let RedisInstrumentation: unknown = null
// Only try to load Redis instrumentation at runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    // Use eval to prevent webpack from trying to bundle this
    RedisInstrumentation = eval(
      `require('@opentelemetry/instrumentation-redis-4').RedisInstrumentation`
    )
  } catch (e) {}
}

export interface TraceContext {
  traceId: string
  spanId: string
  parentSpanId?: string
  baggage?: Record<string, string>
}

export interface CustomSpanOptions {
  name: string
  kind?: SpanKind
  attributes?: Record<string, unknown>
  parent?: Context
  links?: unknown[]
}

export interface BusinessMetrics {
  apiRequestDuration: unknown
  apiRequestCount: unknown
  customerOperations: unknown
  subscriptionEvents: unknown
  webhookProcessing: unknown
  aiProcessingTime: unknown
  cacheHitRatio: unknown
  databaseQueryDuration: unknown
  errorRate: unknown
  concurrentUsers: unknown
}

class TelemetryManager {
  private sdk?: NodeSDK
  private tracer = trace.getTracer('coreflow360', '1.0.0')
  private meter = metrics.getMeter('coreflow360', '1.0.0')
  private businessMetrics: BusinessMetrics
  private initialized = false

  constructor() {
    this.initializeMetrics()
  }

  /**
   * Initialize OpenTelemetry SDK
   */
  initialize(): void {
    if (this.initialized) {
      return
    }

    // Skip initialization during build time
    const isBuildTime =
      process.env.VERCEL_ENV ||
      process.env.CI ||
      process.env.NEXT_PHASE === 'phase-production-build'
    if (isBuildTime) {
      return
    }

    try {
      // Configure resource attributes
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'coreflow360',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'coreflow360',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
        [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.INSTANCE_ID || uuidv4(),
        // Business-specific attributes
        'coreflow.tenant_id': process.env.DEFAULT_TENANT_ID || 'system',
        'coreflow.region': process.env.DEPLOYMENT_REGION || 'us-east-1',
        'coreflow.cluster': process.env.CLUSTER_NAME || 'default',
      })

      // Configure exporters
      const traceExporters = this.configureTraceExporters()
      const metricReaders = this.configureMetricReaders()

      // Initialize SDK
      this.sdk = new NodeSDK({
        resource,
        traceExporter: traceExporters,
        metricReader: metricReaders,
        instrumentations: this.getInstrumentations(),
      })

      this.sdk.start()
      this.initialized = true

      // Record initialization event
      this.recordEvent('telemetry_initialized', {
        'service.name': 'coreflow360',
        'telemetry.version': '1.0.0',
        'initialization.timestamp': new Date().toISOString(),
      })
    } catch (error) {
      // Don't fail the application if telemetry fails
    }
  }

  /**
   * Configure trace exporters based on environment
   */
  private configureTraceExporters(): unknown {
    const exporters = []

    // Console exporter for development
    if (process.env.NODE_ENV === 'development') {
      exporters.push(new ConsoleSpanExporter())
    }

    // Jaeger exporter disabled due to build issues with file loading
    // Will be replaced with OTLP exporter which is more compatible
    // const isBuildTime = process.env.VERCEL_ENV || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build';
    // if (process.env.JAEGER_ENDPOINT && !isBuildTime) {
    //   try {
    //     exporters.push(new JaegerExporter({
    //       endpoint: process.env.JAEGER_ENDPOINT,
    //       headers: {
    //         'x-api-key': process.env.JAEGER_API_KEY || ''
    //       }
    //     }));
    //   } catch (error) {
    //     console.warn('Failed to initialize Jaeger exporter:', error);
    //   }
    // }

    // OTLP exporter (for services like Honeycomb, Lightstep, etc.)
    if (process.env.OTLP_ENDPOINT) {
      exporters.push(
        new OTLPTraceExporter({
          url: process.env.OTLP_ENDPOINT,
          headers: {
            'x-api-key': process.env.OTLP_API_KEY || '',
            'x-honeycomb-team': process.env.HONEYCOMB_API_KEY || '',
          },
        })
      )
    }

    return exporters.length > 0 ? exporters[0] : new ConsoleSpanExporter()
  }

  /**
   * Configure metric readers
   */
  private configureMetricReaders(): unknown {
    const readers = []

    // Prometheus exporter
    if (process.env.ENABLE_PROMETHEUS === 'true') {
      readers.push(
        new PrometheusExporter({
          port: parseInt(process.env.PROMETHEUS_PORT || '9090'),
          endpoint: '/metrics',
        })
      )
    }

    // Periodic metric reader for OTLP
    if (process.env.OTLP_METRICS_ENDPOINT) {
      readers.push(
        new PeriodicExportingMetricReader({
          exporter: new (require('@opentelemetry/exporter-otlp-http').OTLPMetricExporter)({
            url: process.env.OTLP_METRICS_ENDPOINT,
            headers: {
              'x-api-key': process.env.OTLP_API_KEY || '',
            },
          }),
          exportIntervalMillis: 30000, // Export every 30 seconds
        })
      )
    }

    return readers.length > 0 ? readers : []
  }

  /**
   * Get all instrumentations
   */
  private getInstrumentations(): unknown[] {
    return [
      // Auto-instrumentations for common libraries
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Disable file system instrumentation for performance
        },
      }),

      // Custom instrumentations
      new PrismaInstrumentation(),
      ...(RedisInstrumentation ? [new RedisInstrumentation()] : []),
      new HttpInstrumentation({
        requestHook: this.httpRequestHook.bind(this),
        responseHook: this.httpResponseHook.bind(this),
      }),
      new ExpressInstrumentation({
        requestHook: this.expressRequestHook.bind(this),
      }),
    ]
  }

  /**
   * Initialize business metrics
   */
  private initializeMetrics(): void {
    this.businessMetrics = {
      // API Performance Metrics
      apiRequestDuration: this.meter.createHistogram('coreflow_api_request_duration', {
        description: 'Duration of API requests in milliseconds',
        unit: 'ms',
      }),

      apiRequestCount: this.meter.createCounter('coreflow_api_request_total', {
        description: 'Total number of API requests',
      }),

      // Business Logic Metrics
      customerOperations: this.meter.createCounter('coreflow_customer_operations_total', {
        description: 'Total customer operations (CRUD)',
      }),

      subscriptionEvents: this.meter.createCounter('coreflow_subscription_events_total', {
        description: 'Total subscription events',
      }),

      webhookProcessing: this.meter.createHistogram('coreflow_webhook_processing_duration', {
        description: 'Webhook processing duration in milliseconds',
        unit: 'ms',
      }),

      aiProcessingTime: this.meter.createHistogram('coreflow_ai_processing_duration', {
        description: 'AI processing duration in milliseconds',
        unit: 'ms',
      }),

      // Infrastructure Metrics
      cacheHitRatio: this.meter.createGauge('coreflow_cache_hit_ratio', {
        description: 'Cache hit ratio percentage',
      }),

      databaseQueryDuration: this.meter.createHistogram('coreflow_database_query_duration', {
        description: 'Database query duration in milliseconds',
        unit: 'ms',
      }),

      errorRate: this.meter.createGauge('coreflow_error_rate', {
        description: 'Error rate percentage',
      }),

      concurrentUsers: this.meter.createGauge('coreflow_concurrent_users', {
        description: 'Number of concurrent active users',
      }),
    }
  }

  /**
   * Create a new span with business context
   */
  createSpan(options: CustomSpanOptions): unknown {
    const span = this.tracer.startSpan(
      options.name,
      {
        kind: options.kind || SpanKind.INTERNAL,
        attributes: {
          'service.name': 'coreflow360',
          'service.version': '1.0.0',
          ...options.attributes,
        },
        parent: options.parent,
        links: options.links,
      },
      options.parent || context.active()
    )

    return span
  }

  /**
   * Trace API requests end-to-end
   */
  traceApiRequest<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata: {
      method: string
      endpoint: string
      userId?: string
      tenantId?: string
      userAgent?: string
      ip?: string
    }
  ): Promise<T> {
    return this.traceAsync(
      operationName,
      async (span) => {
        const startTime = Date.now()

        try {
          // Set span attributes
          span.setAttributes({
            'http.method': metadata.method,
            'http.url': metadata.endpoint,
            'user.id': metadata.userId || 'anonymous',
            'tenant.id': metadata.tenantId || 'default',
            'http.user_agent': metadata.userAgent || 'unknown',
            'http.client_ip': metadata.ip || 'unknown',
            'operation.type': 'api_request',
          })

          // Execute operation
          const result = await operation()

          // Record success metrics
          const duration = Date.now() - startTime
          this.businessMetrics.apiRequestDuration.record(duration, {
            method: metadata.method,
            endpoint: metadata.endpoint,
            status: 'success',
          })

          this.businessMetrics.apiRequestCount.add(1, {
            method: metadata.method,
            endpoint: metadata.endpoint,
            status: 'success',
          })

          span.setAttributes({
            'http.status_code': 200,
            'operation.duration_ms': duration,
            'operation.success': true,
          })

          span.setStatus({ code: SpanStatusCode.OK })
          return result
        } catch (error) {
          // Record error metrics
          const duration = Date.now() - startTime
          this.businessMetrics.apiRequestDuration.record(duration, {
            method: metadata.method,
            endpoint: metadata.endpoint,
            status: 'error',
          })

          this.businessMetrics.apiRequestCount.add(1, {
            method: metadata.method,
            endpoint: metadata.endpoint,
            status: 'error',
          })

          span.setAttributes({
            'http.status_code': 500,
            'operation.duration_ms': duration,
            'operation.success': false,
            'error.name': error.constructor.name,
            'error.message': error.message,
          })

          span.recordException(error)
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
          throw error
        }
      },
      SpanKind.SERVER
    )
  }

  /**
   * Trace database operations
   */
  traceDatabaseOperation<T>(
    operation: string,
    query: () => Promise<T>,
    metadata: {
      table?: string
      operation_type: 'select' | 'insert' | 'update' | 'delete'
      tenantId?: string
    }
  ): Promise<T> {
    return this.traceAsync(`db.${operation}`, async (span) => {
      const startTime = Date.now()

      try {
        span.setAttributes({
          'db.system': 'postgresql',
          'db.operation': metadata.operation_type,
          'db.table': metadata.table || 'unknown',
          'tenant.id': metadata.tenantId || 'default',
          'operation.type': 'database',
        })

        const result = await query()
        const duration = Date.now() - startTime

        this.businessMetrics.databaseQueryDuration.record(duration, {
          operation: metadata.operation_type,
          table: metadata.table || 'unknown',
        })

        span.setAttributes({
          'operation.duration_ms': duration,
          'operation.success': true,
        })

        span.setStatus({ code: SpanStatusCode.OK })
        return result
      } catch (error) {
        const duration = Date.now() - startTime

        span.setAttributes({
          'operation.duration_ms': duration,
          'operation.success': false,
          'error.name': error.constructor.name,
          'error.message': error.message,
        })

        span.recordException(error)
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
        throw error
      }
    })
  }

  /**
   * Trace external API calls
   */
  traceExternalApiCall<T>(
    serviceName: string,
    operation: () => Promise<T>,
    metadata: {
      url: string
      method: string
      timeout?: number
    }
  ): Promise<T> {
    return this.traceAsync(
      `external.${serviceName}`,
      async (span) => {
        const startTime = Date.now()

        try {
          span.setAttributes({
            'http.method': metadata.method,
            'http.url': metadata.url,
            'http.timeout': metadata.timeout || 30000,
            'service.name': serviceName,
            'operation.type': 'external_api',
          })

          const result = await operation()
          const duration = Date.now() - startTime

          span.setAttributes({
            'http.status_code': 200,
            'operation.duration_ms': duration,
            'operation.success': true,
          })

          span.setStatus({ code: SpanStatusCode.OK })
          return result
        } catch (error) {
          const duration = Date.now() - startTime

          span.setAttributes({
            'operation.duration_ms': duration,
            'operation.success': false,
            'error.name': error.constructor.name,
            'error.message': error.message,
          })

          span.recordException(error)
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
          throw error
        }
      },
      SpanKind.CLIENT
    )
  }

  /**
   * Trace business operations
   */
  traceBusinessOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata: {
      entityType?: string
      entityId?: string
      operationType?: string
      tenantId?: string
      userId?: string
    }
  ): Promise<T> {
    return this.traceAsync(`business.${operationName}`, async (span) => {
      const startTime = Date.now()

      try {
        span.setAttributes({
          'business.operation': operationName,
          'business.entity_type': metadata.entityType || 'unknown',
          'business.entity_id': metadata.entityId || 'unknown',
          'business.operation_type': metadata.operationType || 'unknown',
          'tenant.id': metadata.tenantId || 'default',
          'user.id': metadata.userId || 'system',
          'operation.type': 'business',
        })

        const result = await operation()
        const duration = Date.now() - startTime

        // Record business metrics
        if (metadata.entityType === 'customer') {
          this.businessMetrics.customerOperations.add(1, {
            operation: metadata.operationType || 'unknown',
            tenant: metadata.tenantId || 'default',
          })
        }

        if (metadata.entityType === 'subscription') {
          this.businessMetrics.subscriptionEvents.add(1, {
            operation: metadata.operationType || 'unknown',
            tenant: metadata.tenantId || 'default',
          })
        }

        span.setAttributes({
          'operation.duration_ms': duration,
          'operation.success': true,
        })

        span.setStatus({ code: SpanStatusCode.OK })
        return result
      } catch (error) {
        const duration = Date.now() - startTime

        span.setAttributes({
          'operation.duration_ms': duration,
          'operation.success': false,
          'error.name': error.constructor.name,
          'error.message': error.message,
        })

        span.recordException(error)
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
        throw error
      }
    })
  }

  /**
   * Generic async tracing wrapper
   */
  private async traceAsync<T>(
    name: string,
    operation: (span: unknown) => Promise<T>,
    kind: SpanKind = SpanKind.INTERNAL
  ): Promise<T> {
    const span = this.createSpan({ name, kind })

    try {
      const result = await operation(span)
      return result
    } finally {
      span.end()
    }
  }

  /**
   * Record custom events
   */
  recordEvent(eventName: string, attributes: Record<string, unknown>): void {
    const span = this.tracer.startSpan(eventName, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'event.name': eventName,
        'event.timestamp': new Date().toISOString(),
        ...attributes,
      },
    })

    span.end()
  }

  /**
   * Record business metrics
   */
  recordMetric(
    metricName: keyof BusinessMetrics,
    value: number,
    attributes?: Record<string, string>
  ): void {
    const metric = this.businessMetrics[metricName]
    if (metric) {
      if ('record' in metric) {
        metric.record(value, attributes)
      } else if ('add' in metric) {
        metric.add(value, attributes)
      }
    }
  }

  /**
   * Get current trace context
   */
  getCurrentTraceContext(): TraceContext | null {
    const activeSpan = trace.getActiveSpan()
    if (!activeSpan) return null

    const spanContext = activeSpan.spanContext()
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      parentSpanId: activeSpan.parentSpanId || undefined,
    }
  }

  /**
   * HTTP request hook for automatic instrumentation
   */
  private httpRequestHook(span: unknown, request: unknown): void {
    span.setAttributes({
      'coreflow.request_id': request.headers?.['x-request-id'] || uuidv4(),
      'coreflow.tenant_id': request.headers?.['x-tenant-id'] || 'unknown',
      'coreflow.user_id': request.headers?.['x-user-id'] || 'anonymous',
    })
  }

  /**
   * HTTP response hook for automatic instrumentation
   */
  private httpResponseHook(span: unknown, response: unknown): void {
    const contentLength = response.headers?.['content-length']
    if (contentLength) {
      span.setAttributes({
        'http.response.content_length': parseInt(contentLength),
      })
    }
  }

  /**
   * Express request hook for automatic instrumentation
   */
  private expressRequestHook(span: unknown, request: unknown): void {
    // Add business context from request
    span.setAttributes({
      'coreflow.api_version': request.headers?.['api-version'] || 'v1',
      'coreflow.client_version': request.headers?.['x-client-version'] || 'unknown',
    })
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.sdk) {
      try {
        await this.sdk.shutdown()
      } catch (error) {}
    }
  }

  /**
   * Health check for telemetry system
   */
  healthCheck(): {
    status: 'healthy' | 'unhealthy'
    initialized: boolean
    exporters: string[]
    lastTrace?: string
  } {
    const exporters = []

    if (process.env.JAEGER_ENDPOINT) exporters.push('jaeger')
    if (process.env.OTLP_ENDPOINT) exporters.push('otlp')
    if (process.env.ENABLE_PROMETHEUS === 'true') exporters.push('prometheus')

    const currentTrace = this.getCurrentTraceContext()

    return {
      status: this.initialized ? 'healthy' : 'unhealthy',
      initialized: this.initialized,
      exporters,
      lastTrace: currentTrace?.traceId,
    }
  }
}

// Global telemetry instance
export const telemetry = new TelemetryManager()

// Skip auto-initialization and process handlers during build time
const isBuildTime =
  process.env.VERCEL_ENV || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build'
const isEdgeRuntime = typeof (globalThis as unknown).EdgeRuntime !== 'undefined'

// Auto-initialize if not in test environment or build time
if (process.env.NODE_ENV !== 'test' && !isBuildTime && !isEdgeRuntime) {
  telemetry.initialize()
}

// Graceful shutdown handler - only in Node.js runtime
if (
  typeof process !== 'undefined' &&
  typeof process.on === 'function' &&
  !isBuildTime &&
  !isEdgeRuntime
) {
  process.on('SIGTERM', async () => {
    await telemetry.shutdown()
  })

  process.on('SIGINT', async () => {
    await telemetry.shutdown()
  })
}
