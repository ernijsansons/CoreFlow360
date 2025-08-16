/**
 * CoreFlow360 Performance Tracking System
 * 
 * Nuclear-grade metrics collection and analysis for voice operations
 * Tracks every millisecond, every failure, every success
 */

import { performance } from 'perf_hooks';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'count' | 'percentage' | 'bytes' | 'currency';
  timestamp: Date;
  tags: Record<string, string>;
  tenantId: string;
}

export interface CallPerformanceData {
  callId: string;
  tenantId: string;
  provider: 'vapi' | 'twilio';
  industry: string;
  
  // Timing metrics
  initiationLatency: number; // Time to start call
  firstResponseLatency: number; // Time to first AI response
  averageResponseTime: number; // Avg AI response time
  totalDuration: number; // Total call duration
  
  // Quality metrics
  transcriptionAccuracy: number; // 0-1 accuracy score
  conversationFlow: number; // 0-1 naturalness score
  aiConfidence: number; // Average AI confidence
  interruptionCount: number; // Times customer was interrupted
  
  // Business metrics
  qualificationScore: number; // 1-10 lead qualification
  appointmentBooked: boolean;
  revenue: number; // Potential/actual revenue
  cost: number; // Call cost
  
  // Technical metrics
  audioQuality: number; // 0-1 audio quality score
  networkLatency: number; // Network latency
  errorCount: number; // Errors during call
  fallbackTriggered: boolean; // If fallback was used
}

export interface SystemHealthMetrics {
  timestamp: Date;
  
  // Voice system health
  vapiAvailability: number; // 0-1 availability
  twilioAvailability: number;
  averageLatency: number;
  errorRate: number;
  
  // Resource utilization
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: number;
  
  // Business metrics
  callsPerHour: number;
  revenuePerHour: number;
  costPerCall: number;
  conversionRate: number;
  
  // Queue metrics
  pendingCalls: number;
  failedCalls: number;
  retryQueue: number;
}

export class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private callData: Map<string, Partial<CallPerformanceData>> = new Map();
  private activeTimers: Map<string, number> = new Map();
  
  // Aggregated metrics
  private hourlyMetrics: Map<string, SystemHealthMetrics> = new Map();
  private alertThresholds = {
    latencyP99: 500, // 500ms
    errorRate: 0.01, // 1%
    availability: 0.999, // 99.9%
    conversionRate: 0.15 // 15%
  };
  
  constructor() {
    this.startSystemMonitoring();
    this.startMetricsAggregation();
    console.log('📊 Performance Tracker initialized');
  }

  // Call Performance Tracking
  startCallTracking(callId: string, params: {
    tenantId: string;
    provider: 'vapi' | 'twilio';
    industry: string;
  }): void {
    const startTime = performance.now();
    
    this.callData.set(callId, {
      callId,
      ...params,
      initiationLatency: 0,
      firstResponseLatency: 0,
      averageResponseTime: 0,
      totalDuration: 0,
      transcriptionAccuracy: 0,
      conversationFlow: 0,
      aiConfidence: 0,
      interruptionCount: 0,
      qualificationScore: 0,
      appointmentBooked: false,
      revenue: 0,
      cost: 0,
      audioQuality: 0,
      networkLatency: 0,
      errorCount: 0,
      fallbackTriggered: false
    });
    
    this.activeTimers.set(`${callId}_start`, startTime);
    
    this.recordMetric({
      name: 'call_initiated',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: {
        callId,
        provider: params.provider,
        industry: params.industry
      },
      tenantId: params.tenantId
    });
  }

  recordCallInitiated(callId: string): void {
    const startTime = this.activeTimers.get(`${callId}_start`);
    if (!startTime) return;
    
    const latency = performance.now() - startTime;
    const callData = this.callData.get(callId);
    
    if (callData) {
      callData.initiationLatency = latency;
      
      this.recordMetric({
        name: 'call_initiation_latency',
        value: latency,
        unit: 'ms',
        timestamp: new Date(),
        tags: {
          callId,
          provider: callData.provider!,
          industry: callData.industry!
        },
        tenantId: callData.tenantId!
      });
    }
  }

  recordFirstResponse(callId: string): void {
    const startTime = this.activeTimers.get(`${callId}_start`);
    if (!startTime) return;
    
    const latency = performance.now() - startTime;
    const callData = this.callData.get(callId);
    
    if (callData) {
      callData.firstResponseLatency = latency;
      
      this.recordMetric({
        name: 'first_response_latency',
        value: latency,
        unit: 'ms',
        timestamp: new Date(),
        tags: {
          callId,
          provider: callData.provider!
        },
        tenantId: callData.tenantId!
      });
    }
  }

  recordResponseTime(callId: string, responseTime: number): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    // Update running average
    const currentAvg = callData.averageResponseTime || 0;
    const responseCount = this.activeTimers.get(`${callId}_responses`) || 0;
    
    callData.averageResponseTime = (currentAvg * responseCount + responseTime) / (responseCount + 1);
    this.activeTimers.set(`${callId}_responses`, responseCount + 1);
    
    this.recordMetric({
      name: 'ai_response_time',
      value: responseTime,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        callId,
        provider: callData.provider!
      },
      tenantId: callData.tenantId!
    });
  }

  recordTranscriptionAccuracy(callId: string, accuracy: number): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    callData.transcriptionAccuracy = accuracy;
    
    this.recordMetric({
      name: 'transcription_accuracy',
      value: accuracy,
      unit: 'percentage',
      timestamp: new Date(),
      tags: { callId },
      tenantId: callData.tenantId!
    });
  }

  recordAIConfidence(callId: string, confidence: number): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    // Update running average
    const currentConf = callData.aiConfidence || 0;
    const confCount = this.activeTimers.get(`${callId}_confidence`) || 0;
    
    callData.aiConfidence = (currentConf * confCount + confidence) / (confCount + 1);
    this.activeTimers.set(`${callId}_confidence`, confCount + 1);
    
    this.recordMetric({
      name: 'ai_confidence_score',
      value: confidence,
      unit: 'percentage',
      timestamp: new Date(),
      tags: { callId },
      tenantId: callData.tenantId!
    });
  }

  recordInterruption(callId: string): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    callData.interruptionCount = (callData.interruptionCount || 0) + 1;
    
    this.recordMetric({
      name: 'customer_interruption',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: { callId },
      tenantId: callData.tenantId!
    });
  }

  recordQualificationScore(callId: string, score: number): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    callData.qualificationScore = score;
    
    this.recordMetric({
      name: 'lead_qualification_score',
      value: score,
      unit: 'count',
      timestamp: new Date(),
      tags: {
        callId,
        qualified: score >= 7 ? 'true' : 'false'
      },
      tenantId: callData.tenantId!
    });
  }

  recordAppointmentBooked(callId: string, revenue: number): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    callData.appointmentBooked = true;
    callData.revenue = revenue;
    
    this.recordMetric({
      name: 'appointment_booked',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: { callId },
      tenantId: callData.tenantId!
    });
    
    this.recordMetric({
      name: 'revenue_generated',
      value: revenue,
      unit: 'currency',
      timestamp: new Date(),
      tags: { callId },
      tenantId: callData.tenantId!
    });
  }

  recordCallCost(callId: string, cost: number): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    callData.cost = cost;
    
    this.recordMetric({
      name: 'call_cost',
      value: cost,
      unit: 'currency',
      timestamp: new Date(),
      tags: {
        callId,
        provider: callData.provider!
      },
      tenantId: callData.tenantId!
    });
  }

  recordFallbackTriggered(callId: string, reason: string): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    callData.fallbackTriggered = true;
    
    this.recordMetric({
      name: 'fallback_triggered',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: {
        callId,
        reason,
        originalProvider: callData.provider!
      },
      tenantId: callData.tenantId!
    });
  }

  recordError(callId: string, error: string, severity: 'low' | 'medium' | 'high'): void {
    const callData = this.callData.get(callId);
    if (!callData) return;
    
    callData.errorCount = (callData.errorCount || 0) + 1;
    
    this.recordMetric({
      name: 'call_error',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: {
        callId,
        error,
        severity,
        provider: callData.provider!
      },
      tenantId: callData.tenantId!
    });
  }

  finishCallTracking(callId: string): CallPerformanceData | null {
    const startTime = this.activeTimers.get(`${callId}_start`);
    if (!startTime) return null;
    
    const callData = this.callData.get(callId);
    if (!callData) return null;
    
    // Calculate total duration
    callData.totalDuration = performance.now() - startTime;
    
    // Calculate ROI
    const roi = callData.revenue && callData.cost ? 
      (callData.revenue - callData.cost) / callData.cost : 0;
    
    this.recordMetric({
      name: 'call_completed',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: {
        callId,
        provider: callData.provider!,
        appointed: callData.appointmentBooked ? 'true' : 'false',
        roi: roi.toFixed(2)
      },
      tenantId: callData.tenantId!
    });
    
    // Cleanup
    this.activeTimers.delete(`${callId}_start`);
    this.activeTimers.delete(`${callId}_responses`);
    this.activeTimers.delete(`${callId}_confidence`);
    
    const finalData = callData as CallPerformanceData;
    this.callData.delete(callId);
    
    return finalData;
  }

  // System Performance Tracking
  private startSystemMonitoring(): void {
    setInterval(async () => {
      const systemMetrics = await this.collectSystemMetrics();
      this.recordSystemHealth(systemMetrics);
      
      // Check alert thresholds
      this.checkAlertThresholds(systemMetrics);
      
    }, 30000); // Every 30 seconds
  }

  private async collectSystemMetrics(): Promise<SystemHealthMetrics> {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get metrics from last hour
    const recentMetrics = this.metrics.filter(m => m.timestamp >= lastHour);
    
    // Calculate system health
    const vapiCalls = recentMetrics.filter(m => m.tags.provider === 'vapi');
    const twilioCalls = recentMetrics.filter(m => m.tags.provider === 'twilio');
    const errors = recentMetrics.filter(m => m.name === 'call_error');
    const appointments = recentMetrics.filter(m => m.name === 'appointment_booked');
    const totalCalls = recentMetrics.filter(m => m.name === 'call_completed');
    
    const vapiAvailability = vapiCalls.length > 0 ? 
      1 - (vapiCalls.filter(c => c.name === 'call_error').length / vapiCalls.length) : 1;
    
    const twilioAvailability = twilioCalls.length > 0 ? 
      1 - (twilioCalls.filter(c => c.name === 'call_error').length / twilioCalls.length) : 1;
    
    const latencyMetrics = recentMetrics.filter(m => m.name === 'ai_response_time');
    const averageLatency = latencyMetrics.length > 0 ? 
      latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length : 0;
    
    const errorRate = totalCalls.length > 0 ? 
      errors.length / totalCalls.length : 0;
    
    const conversionRate = totalCalls.length > 0 ? 
      appointments.length / totalCalls.length : 0;
    
    return {
      timestamp: now,
      vapiAvailability,
      twilioAvailability,
      averageLatency,
      errorRate,
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      diskUsage: 0, // Would need OS-specific implementation
      networkIO: 0, // Would need network monitoring
      callsPerHour: totalCalls.length,
      revenuePerHour: recentMetrics
        .filter(m => m.name === 'revenue_generated')
        .reduce((sum, m) => sum + m.value, 0),
      costPerCall: totalCalls.length > 0 ? 
        recentMetrics
          .filter(m => m.name === 'call_cost')
          .reduce((sum, m) => sum + m.value, 0) / totalCalls.length : 0,
      conversionRate,
      pendingCalls: this.callData.size,
      failedCalls: errors.length,
      retryQueue: 0 // Would connect to actual retry queue
    };
  }

  private recordSystemHealth(metrics: SystemHealthMetrics): void {
    const hour = `${metrics.timestamp.getFullYear()}-${metrics.timestamp.getMonth()}-${metrics.timestamp.getDate()}-${metrics.timestamp.getHours()}`;
    this.hourlyMetrics.set(hour, metrics);
    
    // Keep only last 24 hours
    if (this.hourlyMetrics.size > 24) {
      const oldestHour = Array.from(this.hourlyMetrics.keys()).sort()[0];
      this.hourlyMetrics.delete(oldestHour);
    }
  }

  private checkAlertThresholds(metrics: SystemHealthMetrics): void {
    const alerts: string[] = [];
    
    if (metrics.averageLatency > this.alertThresholds.latencyP99) {
      alerts.push(`High latency: ${metrics.averageLatency.toFixed(0)}ms > ${this.alertThresholds.latencyP99}ms`);
    }
    
    if (metrics.errorRate > this.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${(metrics.errorRate * 100).toFixed(2)}% > ${(this.alertThresholds.errorRate * 100).toFixed(2)}%`);
    }
    
    if (metrics.vapiAvailability < this.alertThresholds.availability) {
      alerts.push(`Low Vapi availability: ${(metrics.vapiAvailability * 100).toFixed(3)}% < ${(this.alertThresholds.availability * 100).toFixed(3)}%`);
    }
    
    if (metrics.conversionRate < this.alertThresholds.conversionRate) {
      alerts.push(`Low conversion rate: ${(metrics.conversionRate * 100).toFixed(2)}% < ${(this.alertThresholds.conversionRate * 100).toFixed(2)}%`);
    }
    
    if (alerts.length > 0) {
      console.warn('🚨 PERFORMANCE ALERTS:', alerts);
      // In production, send to alerting service
      // await this.sendAlerts(alerts);
    }
  }

  // Metrics aggregation
  private startMetricsAggregation(): void {
    setInterval(() => {
      this.aggregateMetrics();
      this.cleanupOldMetrics();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private aggregateMetrics(): void {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= fiveMinutesAgo);
    
    // Group by metric name and calculate aggregates
    const aggregates = recentMetrics.reduce((acc, metric) => {
      const key = `${metric.name}_${metric.tenantId}`;
      
      if (!acc[key]) {
        acc[key] = {
          name: metric.name,
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0,
          tenantId: metric.tenantId
        };
      }
      
      acc[key].count++;
      acc[key].sum += metric.value;
      acc[key].min = Math.min(acc[key].min, metric.value);
      acc[key].max = Math.max(acc[key].max, metric.value);
      acc[key].avg = acc[key].sum / acc[key].count;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Log aggregated metrics
    console.log('📈 5-minute aggregated metrics:', Object.values(aggregates));
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp >= oneHourAgo);
  }

  // Helper method to record metrics
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
  }

  // Public API for getting metrics
  public getMetrics(tenantId?: string, timeRange?: { start: Date; end: Date }): PerformanceMetric[] {
    let filtered = this.metrics;
    
    if (tenantId) {
      filtered = filtered.filter(m => m.tenantId === tenantId);
    }
    
    if (timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    return filtered;
  }

  public getSystemHealth(): SystemHealthMetrics | null {
    const latestHour = Array.from(this.hourlyMetrics.keys()).sort().pop();
    return latestHour ? this.hourlyMetrics.get(latestHour)! : null;
  }

  public getCallPerformance(callId: string): CallPerformanceData | null {
    return this.callData.get(callId) as CallPerformanceData || null;
  }

  public getConversionRate(tenantId?: string, timeRange?: { start: Date; end: Date }): number {
    const metrics = this.getMetrics(tenantId, timeRange);
    const totalCalls = metrics.filter(m => m.name === 'call_completed').length;
    const appointments = metrics.filter(m => m.name === 'appointment_booked').length;
    
    return totalCalls > 0 ? appointments / totalCalls : 0;
  }

  public getAverageRevenue(tenantId?: string, timeRange?: { start: Date; end: Date }): number {
    const metrics = this.getMetrics(tenantId, timeRange);
    const revenueMetrics = metrics.filter(m => m.name === 'revenue_generated');
    
    return revenueMetrics.length > 0 ? 
      revenueMetrics.reduce((sum, m) => sum + m.value, 0) / revenueMetrics.length : 0;
  }

  public getLatencyStats(tenantId?: string): { p50: number; p95: number; p99: number } {
    const metrics = this.getMetrics(tenantId).filter(m => m.name === 'ai_response_time');
    
    if (metrics.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }
    
    const sorted = metrics.map(m => m.value).sort((a, b) => a - b);
    
    return {
      p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
      p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
      p99: sorted[Math.floor(sorted.length * 0.99)] || 0
    };
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();