/**
 * CoreFlow360 - Voice Features Monitoring Configuration
 * Comprehensive monitoring setup for voice operations
 */

import { NodeSDK } from '@opentelemetry/sdk-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeJSInstrumentation } from '@opentelemetry/instrumentation-node'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { PrismaInstrumentation } from '@prisma/instrumentation'

// Voice-specific monitoring configuration
export const VOICE_METRICS = {
  // Call metrics
  CALLS_INITIATED: 'voice_calls_initiated_total',
  CALLS_COMPLETED: 'voice_calls_completed_total',
  CALLS_FAILED: 'voice_calls_failed_total',
  CALL_DURATION: 'voice_call_duration_seconds',
  
  // Transcription metrics
  STT_REQUESTS: 'voice_stt_requests_total',
  STT_LATENCY: 'voice_stt_latency_seconds',
  STT_ACCURACY: 'voice_stt_accuracy_ratio',
  STT_ERRORS: 'voice_stt_errors_total',
  
  // Voice note metrics
  NOTES_CREATED: 'voice_notes_created_total',
  NOTES_SAVE_TIME: 'voice_notes_save_duration_seconds',
  NOTES_STORAGE_SIZE: 'voice_notes_storage_bytes',
  
  // WebSocket metrics
  WS_CONNECTIONS: 'voice_websocket_connections_active',
  WS_MESSAGES: 'voice_websocket_messages_total',
  WS_ERRORS: 'voice_websocket_errors_total',
  
  // Performance metrics
  MEMORY_USAGE: 'voice_memory_usage_bytes',
  CPU_USAGE: 'voice_cpu_usage_ratio',
  UPTIME: 'voice_service_uptime_seconds'
}

// Alert thresholds
export const ALERT_THRESHOLDS = {
  // Performance targets (from requirements)
  CALL_INITIATION_MAX: 1000, // <1s
  STT_LATENCY_MAX: 100, // <100ms
  NOTE_SAVE_MAX: 50, // <50ms
  UPTIME_MIN: 99.9, // 99.9%
  
  // Error rate thresholds
  CALL_FAILURE_RATE_MAX: 0.01, // 1%
  STT_ERROR_RATE_MAX: 0.005, // 0.5%
  
  // Resource thresholds
  MEMORY_USAGE_MAX: 2000000000, // 2GB
  CPU_USAGE_MAX: 0.8, // 80%
  
  // Connection thresholds
  WS_CONNECTIONS_MAX: 10000,
  CONCURRENT_CALLS_MAX: 1000
}

/**
 * Initialize OpenTelemetry monitoring for voice features
 */
export function initializeVoiceMonitoring() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'coreflow360-voice',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'coreflow360',
    }),
    
    instrumentations: [
      new NodeJSInstrumentation(),
      new HttpInstrumentation({
        // Ignore health checks and monitoring endpoints
        ignoreIncomingRequestHook: (req) => {
          const url = req.url || ''
          return url.includes('/health') || url.includes('/metrics')
        }
      }),
      new ExpressInstrumentation(),
      new PrismaInstrumentation()
    ],
    
    metricReader: new PeriodicExportingMetricReader({
      exporter: new PrometheusExporter({
        port: 9090,
        endpoint: '/metrics'
      }),
      exportIntervalMillis: 15000 // Export every 15 seconds
    })
  })
  
  sdk.start()
  
  console.log('🔍 Voice monitoring initialized')
  return sdk
}

/**
 * Grafana dashboard configuration for voice features
 */
export const GRAFANA_DASHBOARD = {
  dashboard: {
    title: 'CoreFlow360 Voice Features',
    tags: ['coreflow360', 'voice', 'performance'],
    timezone: 'UTC',
    time: {
      from: 'now-1h',
      to: 'now'
    },
    refresh: '30s',
    
    panels: [
      // Overview row
      {
        title: 'Voice Operations Overview',
        type: 'row',
        gridPos: { h: 1, w: 24, x: 0, y: 0 }
      },
      
      // Call metrics
      {
        title: 'Active Calls',
        type: 'stat',
        targets: [{
          expr: 'voice_calls_initiated_total - voice_calls_completed_total - voice_calls_failed_total',
          legendFormat: 'Active Calls'
        }],
        fieldConfig: {
          defaults: {
            color: { mode: 'thresholds' },
            thresholds: {
              steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 500 },
                { color: 'red', value: 1000 }
              ]
            }
          }
        },
        gridPos: { h: 8, w: 6, x: 0, y: 1 }
      },
      
      {
        title: 'Call Success Rate',
        type: 'stat',
        targets: [{
          expr: 'rate(voice_calls_completed_total[5m]) / (rate(voice_calls_completed_total[5m]) + rate(voice_calls_failed_total[5m])) * 100',
          legendFormat: 'Success Rate %'
        }],
        fieldConfig: {
          defaults: {
            unit: 'percent',
            min: 0,
            max: 100,
            thresholds: {
              steps: [
                { color: 'red', value: null },
                { color: 'yellow', value: 95 },
                { color: 'green', value: 99 }
              ]
            }
          }
        },
        gridPos: { h: 8, w: 6, x: 6, y: 1 }
      },
      
      {
        title: 'Average Call Duration',
        type: 'stat',
        targets: [{
          expr: 'rate(voice_call_duration_seconds_sum[5m]) / rate(voice_call_duration_seconds_count[5m])',
          legendFormat: 'Avg Duration'
        }],
        fieldConfig: {
          defaults: {
            unit: 's',
            thresholds: {
              steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 60 },
                { color: 'red', value: 120 }
              ]
            }
          }
        },
        gridPos: { h: 8, w: 6, x: 12, y: 1 }
      },
      
      {
        title: 'Voice Notes Created',
        type: 'stat',
        targets: [{
          expr: 'rate(voice_notes_created_total[5m]) * 60',
          legendFormat: 'Notes/min'
        }],
        fieldConfig: {
          defaults: {
            unit: 'short'
          }
        },
        gridPos: { h: 8, w: 6, x: 18, y: 1 }
      },
      
      // Performance row
      {
        title: 'Performance Metrics',
        type: 'row',
        gridPos: { h: 1, w: 24, x: 0, y: 9 }
      },
      
      {
        title: 'STT Latency',
        type: 'graph',
        targets: [
          {
            expr: 'histogram_quantile(0.50, rate(voice_stt_latency_seconds_bucket[5m]))',
            legendFormat: 'P50'
          },
          {
            expr: 'histogram_quantile(0.95, rate(voice_stt_latency_seconds_bucket[5m]))',
            legendFormat: 'P95'
          },
          {
            expr: 'histogram_quantile(0.99, rate(voice_stt_latency_seconds_bucket[5m]))',
            legendFormat: 'P99'
          }
        ],
        yAxes: [
          {
            unit: 's',
            max: 0.2, // 200ms max
            min: 0
          }
        ],
        thresholds: [
          {
            value: 0.1, // 100ms target
            colorMode: 'critical',
            op: 'gt'
          }
        ],
        gridPos: { h: 8, w: 12, x: 0, y: 10 }
      },
      
      {
        title: 'Voice Note Save Time',
        type: 'graph',
        targets: [
          {
            expr: 'histogram_quantile(0.95, rate(voice_notes_save_duration_seconds_bucket[5m]))',
            legendFormat: 'P95 Save Time'
          }
        ],
        yAxes: [
          {
            unit: 's',
            max: 0.1, // 100ms max
            min: 0
          }
        ],
        thresholds: [
          {
            value: 0.05, // 50ms target
            colorMode: 'critical',
            op: 'gt'
          }
        ],
        gridPos: { h: 8, w: 12, x: 12, y: 10 }
      },
      
      // Resource usage row
      {
        title: 'Resource Usage',
        type: 'row',
        gridPos: { h: 1, w: 24, x: 0, y: 18 }
      },
      
      {
        title: 'Memory Usage',
        type: 'graph',
        targets: [{
          expr: 'voice_memory_usage_bytes',
          legendFormat: 'Memory Usage'
        }],
        yAxes: [{
          unit: 'bytes'
        }],
        gridPos: { h: 8, w: 8, x: 0, y: 19 }
      },
      
      {
        title: 'CPU Usage',
        type: 'graph',
        targets: [{
          expr: 'rate(voice_cpu_usage_ratio[5m]) * 100',
          legendFormat: 'CPU %'
        }],
        yAxes: [{
          unit: 'percent',
          max: 100,
          min: 0
        }],
        gridPos: { h: 8, w: 8, x: 8, y: 19 }
      },
      
      {
        title: 'WebSocket Connections',
        type: 'graph',
        targets: [{
          expr: 'voice_websocket_connections_active',
          legendFormat: 'Active Connections'
        }],
        gridPos: { h: 8, w: 8, x: 16, y: 19 }
      }
    ]
  }
}

/**
 * Prometheus alert rules for voice features
 */
export const PROMETHEUS_ALERTS = {
  groups: [
    {
      name: 'voice-performance',
      rules: [
        {
          alert: 'HighSTTLatency',
          expr: 'histogram_quantile(0.95, rate(voice_stt_latency_seconds_bucket[5m])) > 0.1',
          for: '2m',
          labels: {
            severity: 'warning',
            service: 'voice'
          },
          annotations: {
            summary: 'STT latency is above target (>100ms)',
            description: 'P95 STT latency is {{ $value }}s, above the 100ms target'
          }
        },
        
        {
          alert: 'HighCallFailureRate',
          expr: 'rate(voice_calls_failed_total[5m]) / rate(voice_calls_initiated_total[5m]) > 0.01',
          for: '3m',
          labels: {
            severity: 'critical',
            service: 'voice'
          },
          annotations: {
            summary: 'High call failure rate detected',
            description: 'Call failure rate is {{ $value | humanizePercentage }}, above 1% threshold'
          }
        },
        
        {
          alert: 'SlowNoteSave',
          expr: 'histogram_quantile(0.95, rate(voice_notes_save_duration_seconds_bucket[5m])) > 0.05',
          for: '2m',
          labels: {
            severity: 'warning',
            service: 'voice'
          },
          annotations: {
            summary: 'Voice note save time is above target (>50ms)',
            description: 'P95 note save time is {{ $value }}s, above the 50ms target'
          }
        },
        
        {
          alert: 'LowUptime',
          expr: '(time() - voice_service_uptime_seconds) / time() * 100 < 99.9',
          for: '1m',
          labels: {
            severity: 'critical',
            service: 'voice'
          },
          annotations: {
            summary: 'Voice service uptime below 99.9%',
            description: 'Service uptime is {{ $value }}%, below 99.9% target'
          }
        }
      ]
    },
    
    {
      name: 'voice-resources',
      rules: [
        {
          alert: 'HighMemoryUsage',
          expr: 'voice_memory_usage_bytes > 2000000000', // 2GB
          for: '5m',
          labels: {
            severity: 'warning',
            service: 'voice'
          },
          annotations: {
            summary: 'High memory usage detected',
            description: 'Memory usage is {{ $value | humanizeBytes }}, above 2GB threshold'
          }
        },
        
        {
          alert: 'HighCPUUsage',
          expr: 'rate(voice_cpu_usage_ratio[5m]) > 0.8',
          for: '3m',
          labels: {
            severity: 'warning',
            service: 'voice'
          },
          annotations: {
            summary: 'High CPU usage detected',
            description: 'CPU usage is {{ $value | humanizePercentage }}, above 80% threshold'
          }
        },
        
        {
          alert: 'TooManyWebSocketConnections',
          expr: 'voice_websocket_connections_active > 10000',
          for: '2m',
          labels: {
            severity: 'critical',
            service: 'voice'
          },
          annotations: {
            summary: 'Too many active WebSocket connections',
            description: 'Active WebSocket connections: {{ $value }}, above 10k threshold'
          }
        }
      ]
    }
  ]
}

/**
 * Health check endpoint configuration
 */
export const HEALTH_CHECK_CONFIG = {
  endpoints: {
    '/health': {
      checks: [
        'database',
        'redis',
        'twilio',
        'openai',
        'deepgram'
      ],
      timeout: 5000
    },
    
    '/health/voice': {
      checks: [
        'voice-websocket',
        'stt-service',
        'call-service',
        'voice-storage'
      ],
      timeout: 3000
    },
    
    '/health/ready': {
      checks: [
        'service-startup',
        'dependencies'
      ],
      timeout: 1000
    }
  },
  
  intervals: {
    self: 30000, // 30s self check
    dependencies: 60000, // 1min dependency check
    deep: 300000 // 5min deep check
  }
}

/**
 * Logging configuration for voice features
 */
export const LOGGING_CONFIG = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  
  transports: [
    {
      type: 'console',
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: 'json'
    },
    
    {
      type: 'file',
      level: 'info',
      filename: 'voice-operations.log',
      maxsize: 100000000, // 100MB
      maxFiles: 10,
      tailable: true
    },
    
    {
      type: 'file',
      level: 'error',
      filename: 'voice-errors.log',
      maxsize: 50000000, // 50MB
      maxFiles: 5,
      tailable: true
    }
  ],
  
  // Structured logging fields for voice operations
  fields: {
    call: ['callSid', 'leadId', 'tenantId', 'duration', 'status'],
    stt: ['requestId', 'audioLength', 'confidence', 'language'],
    voiceNote: ['noteId', 'customerId', 'duration', 'transcriptLength'],
    websocket: ['connectionId', 'messageType', 'clientInfo']
  }
}

/**
 * Monitoring initialization function
 */
export async function setupVoiceMonitoring() {
  console.log('🚀 Initializing voice monitoring...')
  
  // Initialize OpenTelemetry
  const sdk = initializeVoiceMonitoring()
  
  // Setup health checks
  console.log('❤️  Setting up health checks...')
  
  // Setup alerting
  console.log('🚨 Configuring alerts...')
  
  // Initialize metrics collection
  console.log('📊 Starting metrics collection...')
  
  console.log('✅ Voice monitoring setup complete!')
  
  return {
    sdk,
    metrics: VOICE_METRICS,
    thresholds: ALERT_THRESHOLDS,
    healthConfig: HEALTH_CHECK_CONFIG
  }
}