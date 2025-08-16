/**
 * CoreFlow360 - Real-time Webhook Analytics Engine
 * 
 * Comprehensive monitoring, metrics collection, and performance analysis
 * for webhook processing with real-time insights and alerting
 */

import { EventEmitter } from 'events';
import { prisma } from '@/lib/db';

export interface WebhookMetrics {
  // Performance metrics
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  
  // Provider metrics
  providerBreakdown: Record<string, {
    requests: number;
    success: number;
    failures: number;
    avgLatency: number;
  }>;
  
  // Error analysis
  errorTypes: Record<string, number>;
  circuitBreakerTrips: number;
  securityValidationFailures: number;
  
  // Processing insights
  dlqEvents: number;
  recoveredEvents: number;
  temporalWorkflows: number;
  
  // Time-based metrics
  hourlyStats: Array<{
    hour: string;
    requests: number;
    success: number;
    avgLatency: number;
  }>;
}

export interface WebhookEvent {
  id: string;
  timestamp: Date;
  provider: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latency: number;
  success: boolean;
  errorType?: string;
  tenantId: string;
  callId?: string;
  retryCount: number;
  metadata: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string; // e.g., "error_rate > 0.05"
  threshold: number;
  window: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[]; // email, slack, etc.
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  timestamp: Date;
  severity: string;
  message: string;
  value: number;
  threshold: number;
  resolved: boolean;
  resolvedAt?: Date;
}

export class WebhookAnalyticsEngine extends EventEmitter {
  private metrics: Map<string, any> = new Map();
  private events: WebhookEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private metricsUpdateInterval: NodeJS.Timeout;

  constructor() {
    super();
    this.initializeDefaultAlertRules();
    this.startMetricsAggregation();
  }

  /**
   * Record a webhook event
   */
  recordEvent(event: Omit<WebhookEvent, 'id' | 'timestamp'>): void {
    const webhookEvent: WebhookEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event
    };

    // Store in memory for real-time analysis
    this.events.push(webhookEvent);
    
    // Maintain rolling window
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Persist to database asynchronously
    this.persistEvent(webhookEvent);

    // Update real-time metrics
    this.updateMetrics(webhookEvent);

    // Check alert rules
    this.checkAlertRules();

    // Emit event for real-time subscribers
    this.emit('webhookEvent', webhookEvent);
  }

  /**
   * Get current metrics
   */
  getMetrics(timeRange?: { start: Date; end: Date }): WebhookMetrics {
    const events = timeRange 
      ? this.events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
      : this.events;

    return this.calculateMetrics(events);
  }

  /**
   * Get real-time performance data
   */
  getRealTimeMetrics(): {
    currentRPS: number; // requests per second
    successRate: number;
    avgLatency: number;
    activeConnections: number;
    dlqSize: number;
  } {
    const lastMinute = new Date(Date.now() - 60000);
    const recentEvents = this.events.filter(e => e.timestamp >= lastMinute);

    const currentRPS = recentEvents.length / 60;
    const successRate = recentEvents.length > 0 
      ? recentEvents.filter(e => e.success).length / recentEvents.length 
      : 1;
    
    const avgLatency = recentEvents.length > 0
      ? recentEvents.reduce((sum, e) => sum + e.latency, 0) / recentEvents.length
      : 0;

    return {
      currentRPS,
      successRate,
      avgLatency,
      activeConnections: this.getActiveConnections(),
      dlqSize: this.getDLQSize()
    };
  }

  /**
   * Get provider-specific analytics
   */
  getProviderAnalytics(provider: string, timeRange?: { start: Date; end: Date }): {
    metrics: WebhookMetrics;
    topErrors: Array<{ error: string; count: number; percentage: number }>;
    latencyTrend: Array<{ timestamp: Date; latency: number }>;
    throughputTrend: Array<{ timestamp: Date; rps: number }>;
  } {
    const events = this.events.filter(e => 
      e.provider === provider &&
      (!timeRange || (e.timestamp >= timeRange.start && e.timestamp <= timeRange.end))
    );

    const metrics = this.calculateMetrics(events);
    
    // Calculate top errors
    const errorCounts = new Map<string, number>();
    events.filter(e => !e.success && e.errorType).forEach(e => {
      const count = errorCounts.get(e.errorType!) || 0;
      errorCounts.set(e.errorType!, count + 1);
    });

    const totalErrors = Array.from(errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const topErrors = Array.from(errorCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({
        error,
        count,
        percentage: (count / totalErrors) * 100
      }));

    // Calculate trends (simplified - in production, you'd use proper time series)
    const latencyTrend = events
      .filter(e => e.success)
      .slice(-100) // Last 100 successful requests
      .map(e => ({ timestamp: e.timestamp, latency: e.latency }));

    const throughputTrend = this.calculateThroughputTrend(events);

    return {
      metrics,
      topErrors,
      latencyTrend,
      throughputTrend
    };
  }

  /**
   * Get endpoint performance breakdown
   */
  getEndpointAnalytics(): Array<{
    endpoint: string;
    method: string;
    requests: number;
    successRate: number;
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
  }> {
    const endpointMap = new Map<string, WebhookEvent[]>();
    
    this.events.forEach(event => {
      const key = `${event.method} ${event.endpoint}`;
      if (!endpointMap.has(key)) {
        endpointMap.set(key, []);
      }
      endpointMap.get(key)!.push(event);
    });

    return Array.from(endpointMap.entries()).map(([key, events]) => {
      const [method, endpoint] = key.split(' ', 2);
      const successful = events.filter(e => e.success);
      const latencies = successful.map(e => e.latency).sort((a, b) => a - b);
      
      return {
        endpoint,
        method,
        requests: events.length,
        successRate: successful.length / events.length,
        avgLatency: latencies.length > 0 
          ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length 
          : 0,
        p95Latency: latencies.length > 0 
          ? latencies[Math.floor(latencies.length * 0.95)] 
          : 0,
        errorRate: (events.length - successful.length) / events.length
      };
    });
  }

  /**
   * Register alert rule
   */
  registerAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.emit('alertRuleRegistered', rule);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get alert history
   */
  async getAlertHistory(limit = 100): Promise<Alert[]> {
    // In production, this would query the database
    return Array.from(this.activeAlerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Export metrics data
   */
  exportMetrics(format: 'json' | 'csv' | 'prometheus'): string {
    const metrics = this.getMetrics();
    
    switch (format) {
      case 'json':
        return JSON.stringify(metrics, null, 2);
      
      case 'csv':
        return this.convertToCSV(metrics);
      
      case 'prometheus':
        return this.convertToPrometheus(metrics);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private calculateMetrics(events: WebhookEvent[]): WebhookMetrics {
    if (events.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        providerBreakdown: {},
        errorTypes: {},
        circuitBreakerTrips: 0,
        securityValidationFailures: 0,
        dlqEvents: 0,
        recoveredEvents: 0,
        temporalWorkflows: 0,
        hourlyStats: []
      };
    }

    const successful = events.filter(e => e.success);
    const failed = events.filter(e => !e.success);
    const latencies = successful.map(e => e.latency).sort((a, b) => a - b);

    // Provider breakdown
    const providerBreakdown: Record<string, any> = {};
    events.forEach(event => {
      if (!providerBreakdown[event.provider]) {
        providerBreakdown[event.provider] = {
          requests: 0,
          success: 0,
          failures: 0,
          latencies: []
        };
      }
      
      const provider = providerBreakdown[event.provider];
      provider.requests++;
      if (event.success) {
        provider.success++;
        provider.latencies.push(event.latency);
      } else {
        provider.failures++;
      }
    });

    // Calculate average latency for each provider
    Object.values(providerBreakdown).forEach((provider: any) => {
      provider.avgLatency = provider.latencies.length > 0
        ? provider.latencies.reduce((sum: number, l: number) => sum + l, 0) / provider.latencies.length
        : 0;
      delete provider.latencies; // Clean up
    });

    // Error types
    const errorTypes: Record<string, number> = {};
    failed.forEach(event => {
      if (event.errorType) {
        errorTypes[event.errorType] = (errorTypes[event.errorType] || 0) + 1;
      }
    });

    // Hourly stats (simplified)
    const hourlyStats = this.calculateHourlyStats(events);

    return {
      totalRequests: events.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageLatency: latencies.length > 0 
        ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length 
        : 0,
      p95Latency: latencies.length > 0 
        ? latencies[Math.floor(latencies.length * 0.95)] 
        : 0,
      p99Latency: latencies.length > 0 
        ? latencies[Math.floor(latencies.length * 0.99)] 
        : 0,
      providerBreakdown,
      errorTypes,
      circuitBreakerTrips: this.getCircuitBreakerTrips(),
      securityValidationFailures: this.getSecurityValidationFailures(),
      dlqEvents: this.getDLQSize(),
      recoveredEvents: this.getRecoveredEvents(),
      temporalWorkflows: this.getTemporalWorkflows(),
      hourlyStats
    };
  }

  private calculateHourlyStats(events: WebhookEvent[]): Array<{
    hour: string;
    requests: number;
    success: number;
    avgLatency: number;
  }> {
    const hourlyMap = new Map<string, WebhookEvent[]>();
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).toISOString().slice(0, 13) + ':00:00Z';
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, []);
      }
      hourlyMap.get(hour)!.push(event);
    });

    return Array.from(hourlyMap.entries()).map(([hour, hourEvents]) => {
      const successful = hourEvents.filter(e => e.success);
      const avgLatency = successful.length > 0
        ? successful.reduce((sum, e) => sum + e.latency, 0) / successful.length
        : 0;

      return {
        hour,
        requests: hourEvents.length,
        success: successful.length,
        avgLatency
      };
    }).sort((a, b) => a.hour.localeCompare(b.hour));
  }

  private calculateThroughputTrend(events: WebhookEvent[]): Array<{ timestamp: Date; rps: number }> {
    // Simplified throughput calculation - in production, use proper time windows
    const windows = new Map<string, number>();
    
    events.forEach(event => {
      const minute = new Date(event.timestamp);
      minute.setSeconds(0, 0);
      const key = minute.toISOString();
      windows.set(key, (windows.get(key) || 0) + 1);
    });

    return Array.from(windows.entries()).map(([timestamp, count]) => ({
      timestamp: new Date(timestamp),
      rps: count / 60 // Convert to requests per second
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private updateMetrics(event: WebhookEvent): void {
    // Update rolling metrics
    const current = this.metrics.get('current') || {
      requests: 0,
      successes: 0,
      totalLatency: 0,
      lastUpdated: new Date()
    };

    current.requests++;
    if (event.success) {
      current.successes++;
      current.totalLatency += event.latency;
    }
    current.lastUpdated = new Date();

    this.metrics.set('current', current);
  }

  private checkAlertRules(): void {
    const currentMetrics = this.getRealTimeMetrics();
    
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      const shouldAlert = this.evaluateAlertCondition(rule, currentMetrics);
      const existingAlert = this.activeAlerts.get(rule.id);

      if (shouldAlert && !existingAlert) {
        // Create new alert
        const alert: Alert = {
          id: this.generateEventId(),
          ruleId: rule.id,
          timestamp: new Date(),
          severity: rule.severity,
          message: `${rule.name}: ${rule.condition}`,
          value: this.getConditionValue(rule.condition, currentMetrics),
          threshold: rule.threshold,
          resolved: false
        };

        this.activeAlerts.set(rule.id, alert);
        this.emit('alert', alert);
        this.sendAlert(alert, rule);

      } else if (!shouldAlert && existingAlert && !existingAlert.resolved) {
        // Resolve existing alert
        existingAlert.resolved = true;
        existingAlert.resolvedAt = new Date();
        this.emit('alertResolved', existingAlert);
      }
    }
  }

  private evaluateAlertCondition(rule: AlertRule, metrics: any): boolean {
    // Simplified condition evaluation - in production, use a proper expression parser
    const value = this.getConditionValue(rule.condition, metrics);
    return value > rule.threshold;
  }

  private getConditionValue(condition: string, metrics: any): number {
    // Extract metric value based on condition
    if (condition.includes('error_rate')) {
      return 1 - metrics.successRate;
    } else if (condition.includes('latency')) {
      return metrics.avgLatency;
    } else if (condition.includes('rps')) {
      return metrics.currentRPS;
    }
    return 0;
  }

  private sendAlert(alert: Alert, rule: AlertRule): void {
    // In production, integrate with notification services
    console.warn(`🚨 ALERT: ${alert.message}`, {
      severity: alert.severity,
      value: alert.value,
      threshold: alert.threshold,
      channels: rule.channels
    });
  }

  private initializeDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: 'error_rate > 0.05',
        threshold: 0.05,
        window: 5,
        severity: 'critical',
        channels: ['email', 'slack'],
        enabled: true
      },
      {
        id: 'high-latency',
        name: 'High Latency',
        condition: 'avg_latency > 5000',
        threshold: 5000,
        window: 5,
        severity: 'high',
        channels: ['slack'],
        enabled: true
      },
      {
        id: 'low-throughput',
        name: 'Low Throughput',
        condition: 'rps < 0.1',
        threshold: 0.1,
        window: 10,
        severity: 'medium',
        channels: ['email'],
        enabled: true
      }
    ];

    defaultRules.forEach(rule => this.registerAlertRule(rule));
  }

  private startMetricsAggregation(): void {
    // Aggregate and persist metrics every minute
    this.metricsUpdateInterval = setInterval(() => {
      this.aggregateMetrics();
    }, 60000);
  }

  private async aggregateMetrics(): Promise<void> {
    try {
      const metrics = this.getMetrics();
      
      // Persist aggregated metrics
      await this.persistMetrics(metrics);
      
      // Clean up old events from memory
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
      this.events = this.events.filter(e => e.timestamp > cutoff);
      
    } catch (error) {
      console.error('Metrics aggregation error:', error);
    }
  }

  private async persistEvent(event: WebhookEvent): Promise<void> {
    try {
      // In production, batch these writes for better performance
      await prisma.webhookAnalytics.create({
        data: {
          eventId: event.id,
          timestamp: event.timestamp,
          provider: event.provider,
          endpoint: event.endpoint,
          method: event.method,
          statusCode: event.statusCode,
          latency: event.latency,
          success: event.success,
          errorType: event.errorType,
          tenantId: event.tenantId,
          callId: event.callId,
          retryCount: event.retryCount,
          metadata: event.metadata
        }
      });
    } catch (error) {
      // Don't let persistence errors break the analytics
      console.error('Event persistence error:', error);
    }
  }

  private async persistMetrics(metrics: WebhookMetrics): Promise<void> {
    try {
      await prisma.webhookMetricsSummary.create({
        data: {
          timestamp: new Date(),
          totalRequests: metrics.totalRequests,
          successfulRequests: metrics.successfulRequests,
          failedRequests: metrics.failedRequests,
          averageLatency: metrics.averageLatency,
          p95Latency: metrics.p95Latency,
          p99Latency: metrics.p99Latency,
          providerBreakdown: metrics.providerBreakdown,
          errorTypes: metrics.errorTypes
        }
      });
    } catch (error) {
      console.error('Metrics persistence error:', error);
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private convertToCSV(metrics: WebhookMetrics): string {
    // Simplified CSV export
    const rows = [
      ['Metric', 'Value'],
      ['Total Requests', metrics.totalRequests.toString()],
      ['Successful Requests', metrics.successfulRequests.toString()],
      ['Failed Requests', metrics.failedRequests.toString()],
      ['Average Latency', metrics.averageLatency.toString()],
      ['P95 Latency', metrics.p95Latency.toString()],
      ['P99 Latency', metrics.p99Latency.toString()]
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  private convertToPrometheus(metrics: WebhookMetrics): string {
    // Convert to Prometheus format
    return [
      `# HELP webhook_requests_total Total number of webhook requests`,
      `# TYPE webhook_requests_total counter`,
      `webhook_requests_total ${metrics.totalRequests}`,
      ``,
      `# HELP webhook_requests_successful Total number of successful webhook requests`,
      `# TYPE webhook_requests_successful counter`,
      `webhook_requests_successful ${metrics.successfulRequests}`,
      ``,
      `# HELP webhook_latency_avg Average webhook latency in milliseconds`,
      `# TYPE webhook_latency_avg gauge`,
      `webhook_latency_avg ${metrics.averageLatency}`
    ].join('\n');
  }

  // Helper methods for external metrics
  private getActiveConnections(): number {
    // In production, get from connection pool or load balancer
    return Math.floor(Math.random() * 100);
  }

  private getDLQSize(): number {
    // In production, query the actual DLQ
    return Math.floor(Math.random() * 10);
  }

  private getCircuitBreakerTrips(): number {
    return this.metrics.get('circuitBreakerTrips') || 0;
  }

  private getSecurityValidationFailures(): number {
    return this.metrics.get('securityValidationFailures') || 0;
  }

  private getRecoveredEvents(): number {
    return this.metrics.get('recoveredEvents') || 0;
  }

  private getTemporalWorkflows(): number {
    return this.metrics.get('temporalWorkflows') || 0;
  }

  destroy(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }
    this.removeAllListeners();
  }
}

// Global analytics engine instance
export const webhookAnalytics = new WebhookAnalyticsEngine();