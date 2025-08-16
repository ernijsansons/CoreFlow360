/**
 * CoreFlow360 - OpenTelemetry APM Integration
 * Comprehensive observability with tracing, metrics, and logging
 */

import { NodeSDK } from '@opentelemetry/sdk-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { trace, metrics, context, SpanStatusCode, SpanKind } from '@opentelemetry/api'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'

// Environment configuration
const OTEL_CONFIG = {
  serviceName: process.env.OTEL_SERVICE_NAME || 'coreflow360',
  serviceVersion: process.env.OTEL_SERVICE_VERSION || '2.0.0',
  environment: process.env.NODE_ENV || 'development',
  jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9464'),
  enableConsoleExporter: process.env.OTEL_ENABLE_CONSOLE === 'true',
  sampleRate: parseFloat(process.env.OTEL_SAMPLE_RATE || '0.1'), // 10% sampling by default
}

let sdk: NodeSDK | null = null
let isInitialized = false

/**
 * Initialize OpenTelemetry SDK
 */
export function initializeTelemetry(): NodeSDK {
  if (isInitialized) {
    return sdk!
  }

  // Create resource
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: OTEL_CONFIG.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: OTEL_CONFIG.serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: OTEL_CONFIG.environment,
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'coreflow360',
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'local',
  })

  // Configure trace exporters
  const traceExporters = []

  // Jaeger exporter
  if (OTEL_CONFIG.jaegerEndpoint) {
    traceExporters.push(
      new BatchSpanProcessor(
        new JaegerExporter({
          endpoint: OTEL_CONFIG.jaegerEndpoint,
        })
      )
    )
  }

  // OTLP exporter (for services like Datadog, New Relic)
  if (OTEL_CONFIG.otlpEndpoint) {
    traceExporters.push(
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${OTEL_CONFIG.otlpEndpoint}/v1/traces`,
        })
      )
    )
  }

  // Configure metric readers
  const metricReaders = []

  // Prometheus exporter
  metricReaders.push(
    new PrometheusExporter({
      port: OTEL_CONFIG.prometheusPort,
      preventServerStart: false, // Allow automatic server start
    })
  )

  // OTLP metric exporter
  if (OTEL_CONFIG.otlpEndpoint) {
    metricReaders.push(
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${OTEL_CONFIG.otlpEndpoint}/v1/metrics`,
        }),
        exportIntervalMillis: 30000, // Export every 30 seconds
      })
    )
  }

  // Initialize SDK
  sdk = new NodeSDK({
    resource,
    spanProcessors: traceExporters,
    metricReader: metricReaders[0], // Primary metric reader
    contextManager: new AsyncLocalStorageContextManager(),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ignoreIncomingRequestHook: (req) => {
            // Ignore health checks and metrics endpoints
            const url = req.url || ''
            return url.includes('/health') || 
                   url.includes('/metrics') || 
                   url.includes('/_next/') ||
                   url.includes('/favicon.ico')
          },
        },
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-pg': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-redis': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Can be noisy
        },
      }),
    ],
    sampler: {
      shouldSample: () => {
        return Math.random() < OTEL_CONFIG.sampleRate
          ? { decision: 1 } // Record and sample
          : { decision: 0 } // Do not record
      },
    } as any,
  })

  // Start the SDK
  try {
    sdk.start()
    isInitialized = true
    console.log('OpenTelemetry initialized successfully')
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error)
  }

  return sdk
}

/**
 * Telemetry utilities
 */
export class TelemetryService {
  private tracer = trace.getTracer(OTEL_CONFIG.serviceName, OTEL_CONFIG.serviceVersion)
  private meter = metrics.getMeter(OTEL_CONFIG.serviceName, OTEL_CONFIG.serviceVersion)

  // Metrics
  private httpRequestCounter = this.meter.createCounter('http_requests_total', {
    description: 'Total number of HTTP requests',
  })

  private httpRequestDuration = this.meter.createHistogram('http_request_duration_ms', {
    description: 'HTTP request duration in milliseconds',
  })

  private dbQueryCounter = this.meter.createCounter('db_queries_total', {
    description: 'Total number of database queries',
  })

  private dbQueryDuration = this.meter.createHistogram('db_query_duration_ms', {
    description: 'Database query duration in milliseconds',
  })

  private cacheHitCounter = this.meter.createCounter('cache_hits_total', {
    description: 'Total number of cache hits',
  })

  private cacheMissCounter = this.meter.createCounter('cache_misses_total', {
    description: 'Total number of cache misses',
  })

  private errorCounter = this.meter.createCounter('errors_total', {
    description: 'Total number of errors',
  })

  private activeUsers = this.meter.createUpDownCounter('active_users', {
    description: 'Number of active users',
  })

  /**
   * Create a new span for tracing
   */
  createSpan(name: string, options: {
    kind?: SpanKind
    attributes?: Record<string, string | number | boolean>
    parent?: any
  } = {}) {
    return this.tracer.startSpan(name, {
      kind: options.kind || SpanKind.INTERNAL,
      attributes: options.attributes,
    }, options.parent || context.active())
  }

  /**
   * Trace an async operation
   */
  async traceAsync<T>(
    name: string,
    operation: (span: any) => Promise<T>,
    options: {
      kind?: SpanKind
      attributes?: Record<string, string | number | boolean>
    } = {}
  ): Promise<T> {
    const span = this.createSpan(name, options)
    
    try {
      const result = await context.with(trace.setSpan(context.active(), span), () => 
        operation(span)
      )
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      })
      throw error
    } finally {
      span.end()
    }
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number, tenantId?: string) {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      ...(tenantId && { tenant_id: tenantId })
    }

    this.httpRequestCounter.add(1, labels)
    this.httpRequestDuration.record(duration, labels)
  }

  /**
   * Record database query metrics
   */
  recordDbQuery(operation: string, table: string, duration: number, success: boolean, tenantId?: string) {
    const labels = {
      operation,
      table,
      status: success ? 'success' : 'error',
      ...(tenantId && { tenant_id: tenantId })
    }

    this.dbQueryCounter.add(1, labels)
    this.dbQueryDuration.record(duration, labels)
  }

  /**
   * Record cache metrics
   */
  recordCacheHit(cacheType: string, keyPattern: string, tenantId?: string) {
    this.cacheHitCounter.add(1, {
      cache_type: cacheType,
      key_pattern: keyPattern,
      ...(tenantId && { tenant_id: tenantId })
    })
  }

  recordCacheMiss(cacheType: string, keyPattern: string, tenantId?: string) {
    this.cacheMissCounter.add(1, {
      cache_type: cacheType,
      key_pattern: keyPattern,
      ...(tenantId && { tenant_id: tenantId })
    })
  }

  /**
   * Record error metrics
   */
  recordError(errorType: string, severity: string, component: string, tenantId?: string) {
    this.errorCounter.add(1, {
      error_type: errorType,
      severity,
      component,
      ...(tenantId && { tenant_id: tenantId })
    })
  }

  /**
   * Update active user count
   */
  updateActiveUsers(count: number, tenantId?: string) {
    this.activeUsers.add(count, {
      ...(tenantId && { tenant_id: tenantId })
    })
  }

  /**
   * Add custom attributes to current span
   */
  addSpanAttributes(attributes: Record<string, string | number | boolean>) {
    const span = trace.getActiveSpan()
    if (span) {
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value)
      })
    }
  }

  /**
   * Add span events
   */
  addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>) {
    const span = trace.getActiveSpan()
    if (span) {
      span.addEvent(name, attributes)
    }
  }

  /**
   * Record span exception
   */
  recordSpanException(error: Error) {
    const span = trace.getActiveSpan()
    if (span) {
      span.recordException(error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      })
    }
  }

  /**
   * Create a child span
   */
  createChildSpan(name: string, attributes?: Record<string, string | number | boolean>) {
    const parentSpan = trace.getActiveSpan()
    if (parentSpan) {
      return this.tracer.startSpan(name, {
        attributes,
        kind: SpanKind.INTERNAL,
      }, trace.setSpan(context.active(), parentSpan))
    }
    return this.createSpan(name, { attributes })
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    if (sdk) {
      try {
        await sdk.shutdown()
        console.log('OpenTelemetry shut down successfully')
      } catch (error) {
        console.error('Failed to shut down OpenTelemetry:', error)
      }
    }
  }
}

// Export singleton instance
export const telemetry = new TelemetryService()

/**
 * Middleware wrapper for automatic tracing
 */
export function withTelemetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  spanName: string,
  options: {
    attributes?: Record<string, string | number | boolean>
    extractAttributes?: (...args: T) => Record<string, string | number | boolean>
  } = {}
) {
  return async (...args: T): Promise<R> => {
    const attributes = {
      ...options.attributes,
      ...(options.extractAttributes ? options.extractAttributes(...args) : {})
    }

    return telemetry.traceAsync(
      spanName,
      async (span) => {
        // Add function arguments as attributes (be careful with sensitive data)
        if (process.env.NODE_ENV === 'development') {
          span.setAttribute('function.args_count', args.length)
        }

        return fn(...args)
      },
      { attributes }
    )
  }
}

/**
 * Database operation tracing decorator
 */
export function traceDbOperation(operation: string, table: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      return telemetry.traceAsync(
        `db.${operation}`,
        async (span) => {
          span.setAttributes({
            'db.operation': operation,
            'db.table': table,
            'db.system': 'postgresql',
          })

          const startTime = Date.now()
          try {
            const result = await originalMethod.apply(this, args)
            const duration = Date.now() - startTime
            
            telemetry.recordDbQuery(operation, table, duration, true)
            span.setAttribute('db.duration_ms', duration)
            
            return result
          } catch (error) {
            const duration = Date.now() - startTime
            telemetry.recordDbQuery(operation, table, duration, false)
            telemetry.recordSpanException(error as Error)
            throw error
          }
        },
        {
          kind: SpanKind.CLIENT,
          attributes: {
            'component': 'database'
          }
        }
      )
    }

    return descriptor
  }
}

/**
 * HTTP request tracing decorator
 */
export function traceHttpRequest(route: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const request = args[0] // Assuming first arg is request
      const method = request?.method || 'UNKNOWN'
      
      return telemetry.traceAsync(
        `http.${method} ${route}`,
        async (span) => {
          span.setAttributes({
            'http.method': method,
            'http.route': route,
            'http.scheme': request?.url?.startsWith('https') ? 'https' : 'http',
            'component': 'http'
          })

          const startTime = Date.now()
          try {
            const response = await originalMethod.apply(this, args)
            const duration = Date.now() - startTime
            const statusCode = response?.status || 200
            
            span.setAttributes({
              'http.status_code': statusCode,
              'http.response_time_ms': duration
            })
            
            telemetry.recordHttpRequest(method, route, statusCode, duration)
            
            return response
          } catch (error) {
            const duration = Date.now() - startTime
            telemetry.recordHttpRequest(method, route, 500, duration)
            telemetry.recordSpanException(error as Error)
            throw error
          }
        },
        {
          kind: SpanKind.SERVER,
          attributes: {
            'component': 'http'
          }
        }
      )
    }

    return descriptor
  }
}

// Initialize telemetry if in server environment
if (typeof window === 'undefined') {
  initializeTelemetry()
}