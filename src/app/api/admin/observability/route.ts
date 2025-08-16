/**
 * CoreFlow360 - Observability Dashboard API
 * 
 * Real-time telemetry data, metrics, and system health monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { withSignatureValidation } from '@/middleware/request-signature';
import { telemetry } from '@/lib/telemetry/opentelemetry';
import { otEngine } from '@/lib/ot/operational-transform';
import { conflictResolver } from '@/lib/ot/conflict-resolution';
import { deadLetterQueue } from '@/lib/webhook-dlq/dead-letter-queue';
import { webhookAnalytics } from '@/lib/monitoring/webhook-analytics';
import { apiSchemaRegistry } from '@/lib/api/schema-registry';

interface SystemMetrics {
  timestamp: string;
  telemetry: {
    status: 'healthy' | 'unhealthy';
    initialized: boolean;
    exporters: string[];
    lastTrace?: string;
  };
  operationalTransform: {
    activeDocuments: number;
    totalUsers: number;
    totalOperations: number;
    conflictStats: any;
  };
  webhooks: {
    analytics: any;
    dlqStatus: any;
  };
  apiSchema: {
    registeredSchemas: number;
    validationStats: any;
  };
  performance: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage?: any;
  };
}

async function getHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:observability');
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';
    const timeRange = searchParams.get('timeRange') || '1h';

    switch (action) {
      case 'dashboard':
        return handleGetDashboard();
      
      case 'metrics':
        return handleGetMetrics(timeRange);
      
      case 'traces':
        const limit = parseInt(searchParams.get('limit') || '50');
        return handleGetTraces(limit);
      
      case 'health':
        return handleGetHealthCheck();
      
      case 'performance':
        return handleGetPerformanceMetrics(timeRange);
      
      case 'business-insights':
        return handleGetBusinessInsights(timeRange);
      
      case 'alerts':
        return handleGetAlerts();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to process observability request:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process observability request' },
      { status: 500 }
    );
  }
}

async function handleGetDashboard() {
  const systemMetrics = await collectSystemMetrics();
  
  return NextResponse.json({
    success: true,
    data: {
      overview: {
        status: determineOverallHealth(systemMetrics),
        lastUpdated: systemMetrics.timestamp,
        uptime: systemMetrics.performance.uptime
      },
      metrics: systemMetrics,
      quickStats: {
        activeUsers: systemMetrics.operationalTransform.totalUsers,
        apiRequests: await getRecentApiRequestCount(),
        errorRate: await getErrorRate(),
        averageResponseTime: await getAverageResponseTime()
      }
    }
  });
}

async function handleGetMetrics(timeRange: string) {
  const metrics = await collectDetailedMetrics(timeRange);
  
  return NextResponse.json({
    success: true,
    data: {
      timeRange,
      metrics,
      summary: {
        dataPoints: metrics.length,
        averages: calculateAverages(metrics),
        trends: calculateTrends(metrics)
      }
    }
  });
}

async function handleGetTraces(limit: number) {
  // In a real implementation, this would query the trace store
  const traces = await getRecentTraces(limit);
  
  return NextResponse.json({
    success: true,
    data: {
      traces,
      totalCount: traces.length,
      traceStats: analyzeTraces(traces)
    }
  });
}

async function handleGetHealthCheck() {
  const healthData = {
    telemetry: telemetry.healthCheck(),
    operationalTransform: getOTHealth(),
    conflictResolution: getConflictResolutionHealth(),
    webhookProcessing: getWebhookHealth(),
    apiSchema: getSchemaRegistryHealth(),
    systemResources: getSystemResourceHealth()
  };

  const overallHealth = Object.values(healthData).every(
    (component: any) => component.status === 'healthy'
  ) ? 'healthy' : 'degraded';

  return NextResponse.json({
    success: true,
    data: {
      status: overallHealth,
      timestamp: new Date().toISOString(),
      components: healthData,
      summary: {
        healthyComponents: Object.values(healthData).filter(
          (c: any) => c.status === 'healthy'
        ).length,
        totalComponents: Object.keys(healthData).length
      }
    }
  });
}

async function handleGetPerformanceMetrics(timeRange: string) {
  const performanceData = {
    apiPerformance: await getApiPerformanceMetrics(timeRange),
    databasePerformance: await getDatabasePerformanceMetrics(timeRange),
    cachePerformance: await getCachePerformanceMetrics(timeRange),
    externalServices: await getExternalServiceMetrics(timeRange),
    resourceUtilization: getResourceUtilization()
  };

  return NextResponse.json({
    success: true,
    data: {
      timeRange,
      performance: performanceData,
      insights: generatePerformanceInsights(performanceData)
    }
  });
}

async function handleGetBusinessInsights(timeRange: string) {
  const businessData = {
    userActivity: await getUserActivityMetrics(timeRange),
    featureUsage: await getFeatureUsageMetrics(timeRange),
    tenantMetrics: await getTenantMetrics(timeRange),
    subscriptionInsights: await getSubscriptionInsights(timeRange),
    revenueImpact: await getRevenueImpactMetrics(timeRange)
  };

  return NextResponse.json({
    success: true,
    data: {
      timeRange,
      insights: businessData,
      recommendations: generateBusinessRecommendations(businessData)
    }
  });
}

async function handleGetAlerts() {
  const alerts = [
    ...getPerformanceAlerts(),
    ...getErrorAlerts(),
    ...getBusinessAlerts(),
    ...getSecurityAlerts()
  ];

  return NextResponse.json({
    success: true,
    data: {
      alerts: alerts.sort((a, b) => b.timestamp - a.timestamp),
      summary: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
      }
    }
  });
}

// Helper functions
async function collectSystemMetrics(): Promise<SystemMetrics> {
  const otStats = otEngine.getStatistics();
  const conflictStats = conflictResolver.getConflictStatistics();
  const webhookStats = webhookAnalytics.getMetrics();
  const dlqStatus = deadLetterQueue.getStatus();

  return {
    timestamp: new Date().toISOString(),
    telemetry: telemetry.healthCheck(),
    operationalTransform: {
      ...otStats,
      conflictStats
    },
    webhooks: {
      analytics: webhookStats,
      dlqStatus
    },
    apiSchema: {
      registeredSchemas: apiSchemaRegistry.getRegisteredSchemas().length,
      validationStats: apiSchemaRegistry.getValidationStats()
    },
    performance: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    }
  };
}

function determineOverallHealth(metrics: SystemMetrics): 'healthy' | 'degraded' | 'unhealthy' {
  const checks = [
    metrics.telemetry.status === 'healthy',
    metrics.performance.memoryUsage.heapUsed < 500 * 1024 * 1024, // < 500MB
    metrics.webhooks.dlqStatus.pendingEvents < 100
  ];

  const healthyChecks = checks.filter(Boolean).length;
  const healthPercentage = healthyChecks / checks.length;

  if (healthPercentage >= 0.8) return 'healthy';
  if (healthPercentage >= 0.6) return 'degraded';
  return 'unhealthy';
}

async function getRecentApiRequestCount(): Promise<number> {
  // Mock implementation - in production, query from metrics store
  return Math.floor(Math.random() * 1000) + 500;
}

async function getErrorRate(): Promise<number> {
  // Mock implementation - in production, calculate from error metrics
  return Math.random() * 5; // 0-5% error rate
}

async function getAverageResponseTime(): Promise<number> {
  // Mock implementation - in production, calculate from response time metrics
  return Math.floor(Math.random() * 200) + 50; // 50-250ms
}

async function collectDetailedMetrics(timeRange: string) {
  // Mock implementation - in production, query time-series data
  const now = Date.now();
  const points = 50;
  const interval = getTimeRangeInterval(timeRange);
  
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * interval,
    apiRequests: Math.floor(Math.random() * 100) + 50,
    responseTime: Math.floor(Math.random() * 200) + 50,
    errorCount: Math.floor(Math.random() * 10),
    activeUsers: Math.floor(Math.random() * 50) + 10,
    memoryUsage: Math.floor(Math.random() * 200) + 300 // MB
  }));
}

async function getRecentTraces(limit: number) {
  // Mock implementation - in production, query trace store
  return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
    traceId: `trace_${Date.now()}_${i}`,
    operation: `api.customers.${['create', 'update', 'delete', 'list'][i % 4]}`,
    duration: Math.floor(Math.random() * 500) + 50,
    status: Math.random() > 0.1 ? 'success' : 'error',
    timestamp: Date.now() - i * 60000,
    spans: Math.floor(Math.random() * 10) + 3
  }));
}

function analyzeTraces(traces: any[]) {
  return {
    averageDuration: traces.reduce((sum, t) => sum + t.duration, 0) / traces.length,
    successRate: traces.filter(t => t.status === 'success').length / traces.length,
    operationBreakdown: traces.reduce((acc, t) => {
      acc[t.operation] = (acc[t.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

function getOTHealth() {
  const stats = otEngine.getStatistics();
  return {
    status: stats.activeDocuments < 1000 ? 'healthy' : 'degraded',
    activeDocuments: stats.activeDocuments,
    totalUsers: stats.totalUsers,
    totalOperations: stats.totalOperations
  };
}

function getConflictResolutionHealth() {
  const stats = conflictResolver.getConflictStatistics();
  const autoResolutionRate = stats.totalConflicts > 0 
    ? stats.autoResolvedCount / stats.totalConflicts 
    : 1;
  
  return {
    status: autoResolutionRate > 0.8 ? 'healthy' : 'degraded',
    totalConflicts: stats.totalConflicts,
    autoResolutionRate: Math.round(autoResolutionRate * 100),
    manualConflicts: stats.manualResolvedCount
  };
}

function getWebhookHealth() {
  const dlqStatus = deadLetterQueue.getStatus();
  return {
    status: dlqStatus.pendingEvents < 50 ? 'healthy' : 'degraded',
    pendingEvents: dlqStatus.pendingEvents,
    processingRate: dlqStatus.processingRate,
    successRate: dlqStatus.successRate
  };
}

function getSchemaRegistryHealth() {
  const schemas = apiSchemaRegistry.getRegisteredSchemas();
  const validationStats = apiSchemaRegistry.getValidationStats();
  
  return {
    status: validationStats.successRate > 0.95 ? 'healthy' : 'degraded',
    registeredSchemas: schemas.length,
    validationSuccessRate: Math.round(validationStats.successRate * 100),
    lastValidation: validationStats.lastValidation
  };
}

function getSystemResourceHealth() {
  const memory = process.memoryUsage();
  const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
  
  return {
    status: memoryUsagePercent < 80 ? 'healthy' : 'degraded',
    memoryUsagePercent: Math.round(memoryUsagePercent),
    uptime: process.uptime(),
    nodeVersion: process.version
  };
}

function calculateAverages(metrics: any[]) {
  if (metrics.length === 0) return {};
  
  return {
    avgResponseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length,
    avgApiRequests: metrics.reduce((sum, m) => sum + m.apiRequests, 0) / metrics.length,
    avgActiveUsers: metrics.reduce((sum, m) => sum + m.activeUsers, 0) / metrics.length,
    avgMemoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length
  };
}

function calculateTrends(metrics: any[]) {
  if (metrics.length < 2) return {};
  
  const first = metrics[0];
  const last = metrics[metrics.length - 1];
  
  return {
    responseTimeTrend: ((last.responseTime - first.responseTime) / first.responseTime) * 100,
    apiRequestsTrend: ((last.apiRequests - first.apiRequests) / first.apiRequests) * 100,
    activeUsersTrend: ((last.activeUsers - first.activeUsers) / first.activeUsers) * 100,
    memoryUsageTrend: ((last.memoryUsage - first.memoryUsage) / first.memoryUsage) * 100
  };
}

function getTimeRangeInterval(timeRange: string): number {
  switch (timeRange) {
    case '1h': return 60 * 1000; // 1 minute
    case '24h': return 30 * 60 * 1000; // 30 minutes
    case '7d': return 4 * 60 * 60 * 1000; // 4 hours
    case '30d': return 24 * 60 * 60 * 1000; // 1 day
    default: return 60 * 1000;
  }
}

// Mock implementations for detailed metrics
async function getApiPerformanceMetrics(timeRange: string) {
  return {
    averageResponseTime: Math.floor(Math.random() * 100) + 50,
    p95ResponseTime: Math.floor(Math.random() * 200) + 100,
    throughput: Math.floor(Math.random() * 1000) + 500,
    errorRate: Math.random() * 5
  };
}

async function getDatabasePerformanceMetrics(timeRange: string) {
  return {
    queryCount: Math.floor(Math.random() * 5000) + 1000,
    averageQueryTime: Math.floor(Math.random() * 50) + 10,
    slowQueries: Math.floor(Math.random() * 10),
    connectionPoolUsage: Math.random() * 100
  };
}

async function getCachePerformanceMetrics(timeRange: string) {
  return {
    hitRate: Math.random() * 30 + 70, // 70-100%
    missCount: Math.floor(Math.random() * 100),
    evictionCount: Math.floor(Math.random() * 50),
    memoryUsage: Math.random() * 80 + 20 // 20-100%
  };
}

async function getExternalServiceMetrics(timeRange: string) {
  return {
    totalCalls: Math.floor(Math.random() * 1000) + 200,
    averageLatency: Math.floor(Math.random() * 200) + 100,
    failureRate: Math.random() * 10,
    timeouts: Math.floor(Math.random() * 20)
  };
}

function getResourceUtilization() {
  return {
    cpu: Math.random() * 80 + 10, // 10-90%
    memory: Math.random() * 70 + 20, // 20-90%
    disk: Math.random() * 60 + 30, // 30-90%
    network: Math.random() * 50 + 20 // 20-70%
  };
}

async function getUserActivityMetrics(timeRange: string) {
  return {
    activeUsers: Math.floor(Math.random() * 100) + 50,
    sessionDuration: Math.floor(Math.random() * 60) + 15,
    pageViews: Math.floor(Math.random() * 1000) + 500,
    bounceRate: Math.random() * 40 + 20
  };
}

async function getFeatureUsageMetrics(timeRange: string) {
  return {
    mostUsedFeatures: [
      { name: 'CRM Dashboard', usage: Math.floor(Math.random() * 500) + 200 },
      { name: 'Customer Management', usage: Math.floor(Math.random() * 400) + 150 },
      { name: 'Analytics', usage: Math.floor(Math.random() * 300) + 100 }
    ],
    newFeatureAdoption: Math.random() * 60 + 20
  };
}

async function getTenantMetrics(timeRange: string) {
  return {
    activeTenants: Math.floor(Math.random() * 50) + 20,
    averageUsersPerTenant: Math.floor(Math.random() * 10) + 5,
    resourceUsageByTenant: {
      'tenant-1': Math.random() * 100,
      'tenant-2': Math.random() * 100,
      'tenant-3': Math.random() * 100
    }
  };
}

async function getSubscriptionInsights(timeRange: string) {
  return {
    newSubscriptions: Math.floor(Math.random() * 20) + 5,
    churnRate: Math.random() * 10 + 2,
    upgradeRate: Math.random() * 15 + 5,
    revenueGrowth: Math.random() * 20 + 5
  };
}

async function getRevenueImpactMetrics(timeRange: string) {
  return {
    totalRevenue: Math.floor(Math.random() * 50000) + 10000,
    revenuePerUser: Math.floor(Math.random() * 500) + 100,
    conversionRate: Math.random() * 10 + 2,
    lifetimeValue: Math.floor(Math.random() * 2000) + 500
  };
}

function generatePerformanceInsights(data: any) {
  const insights = [];
  
  if (data.apiPerformance.errorRate > 5) {
    insights.push({
      type: 'warning',
      message: 'API error rate is above 5%. Consider investigating recent deployments.',
      metric: 'errorRate',
      value: data.apiPerformance.errorRate
    });
  }
  
  if (data.resourceUtilization.memory > 80) {
    insights.push({
      type: 'critical',
      message: 'Memory utilization is above 80%. Consider scaling up.',
      metric: 'memoryUsage',
      value: data.resourceUtilization.memory
    });
  }
  
  return insights;
}

function generateBusinessRecommendations(data: any) {
  const recommendations = [];
  
  if (data.subscriptionInsights.churnRate > 8) {
    recommendations.push({
      priority: 'high',
      category: 'retention',
      recommendation: 'Implement customer success programs to reduce churn rate.',
      impact: 'revenue'
    });
  }
  
  if (data.featureUsageMetrics.newFeatureAdoption < 30) {
    recommendations.push({
      priority: 'medium',
      category: 'adoption',
      recommendation: 'Improve onboarding flow to increase new feature adoption.',
      impact: 'engagement'
    });
  }
  
  return recommendations;
}

function getPerformanceAlerts() {
  return [
    {
      id: 'perf-001',
      type: 'performance',
      severity: 'warning',
      message: 'API response time increased by 25% in the last hour',
      timestamp: Date.now() - 300000,
      metric: 'response_time'
    }
  ];
}

function getErrorAlerts() {
  return [
    {
      id: 'error-001',
      type: 'error',
      severity: 'critical',
      message: 'Database connection pool exhausted',
      timestamp: Date.now() - 600000,
      metric: 'db_connections'
    }
  ];
}

function getBusinessAlerts() {
  return [
    {
      id: 'biz-001',
      type: 'business',
      severity: 'info',
      message: 'New user signup rate increased by 40%',
      timestamp: Date.now() - 1800000,
      metric: 'signup_rate'
    }
  ];
}

function getSecurityAlerts() {
  return [
    {
      id: 'sec-001',
      type: 'security',
      severity: 'warning',
      message: 'Unusual login pattern detected from IP 192.168.1.100',
      timestamp: Date.now() - 900000,
      metric: 'login_anomaly'
    }
  ];
}

export const GET = withSignatureValidation(getHandler, { 
  highSecurity: true,
  skipInDevelopment: false
});