/**
 * CoreFlow360 - Webhook Analytics API
 * Real-time webhook monitoring and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { withSignatureValidation } from '@/middleware/request-signature';
import { webhookAnalytics } from '@/lib/monitoring/webhook-analytics';

async function getHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:monitoring');
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';
    const timeRange = getTimeRange(searchParams);

    switch (action) {
      case 'overview':
        return handleOverview(timeRange);
      
      case 'realtime':
        return handleRealtime();
      
      case 'provider':
        const provider = searchParams.get('provider');
        return handleProviderAnalytics(provider!, timeRange);
      
      case 'endpoints':
        return handleEndpointAnalytics();
      
      case 'alerts':
        return handleAlerts();
      
      case 'export':
        const format = searchParams.get('format') as 'json' | 'csv' | 'prometheus' || 'json';
        return handleExport(format);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to process analytics request:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process analytics request' },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:monitoring');
    
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create_alert_rule':
        return handleCreateAlertRule(data);
      
      case 'update_alert_rule':
        return handleUpdateAlertRule(data);
      
      case 'resolve_alert':
        return handleResolveAlert(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to process analytics request:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process analytics request' },
      { status: 500 }
    );
  }
}

function getTimeRange(searchParams: URLSearchParams): { start: Date; end: Date } | undefined {
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  
  if (start && end) {
    return {
      start: new Date(start),
      end: new Date(end)
    };
  }
  
  // Default to last 24 hours if no range specified
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return {
    start: yesterday,
    end: now
  };
}

async function handleOverview(timeRange?: { start: Date; end: Date }) {
  const metrics = webhookAnalytics.getMetrics(timeRange);
  const realtime = webhookAnalytics.getRealTimeMetrics();
  
  return NextResponse.json({
    success: true,
    data: {
      overview: {
        totalRequests: metrics.totalRequests,
        successRate: metrics.totalRequests > 0 
          ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2) + '%'
          : '100%',
        averageLatency: `${metrics.averageLatency.toFixed(2)}ms`,
        p95Latency: `${metrics.p95Latency.toFixed(2)}ms`,
        errorRate: metrics.totalRequests > 0 
          ? (metrics.failedRequests / metrics.totalRequests * 100).toFixed(2) + '%'
          : '0%'
      },
      realtime: {
        currentRPS: realtime.currentRPS.toFixed(2),
        successRate: (realtime.successRate * 100).toFixed(2) + '%',
        avgLatency: `${realtime.avgLatency.toFixed(2)}ms`,
        activeConnections: realtime.activeConnections,
        dlqSize: realtime.dlqSize
      },
      metrics,
      timeRange
    }
  });
}

async function handleRealtime() {
  const realtime = webhookAnalytics.getRealTimeMetrics();
  
  return NextResponse.json({
    success: true,
    data: realtime,
    timestamp: new Date().toISOString()
  });
}

async function handleProviderAnalytics(provider: string, timeRange?: { start: Date; end: Date }) {
  if (!provider) {
    return NextResponse.json(
      { error: 'Provider parameter is required' },
      { status: 400 }
    );
  }

  const analytics = webhookAnalytics.getProviderAnalytics(provider, timeRange);
  
  return NextResponse.json({
    success: true,
    provider,
    data: analytics,
    timeRange
  });
}

async function handleEndpointAnalytics() {
  const analytics = webhookAnalytics.getEndpointAnalytics();
  
  return NextResponse.json({
    success: true,
    data: analytics
  });
}

async function handleAlerts() {
  const activeAlerts = webhookAnalytics.getActiveAlerts();
  const alertHistory = await webhookAnalytics.getAlertHistory(50);
  
  return NextResponse.json({
    success: true,
    data: {
      active: activeAlerts,
      history: alertHistory,
      summary: {
        total: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length,
        medium: activeAlerts.filter(a => a.severity === 'medium').length,
        low: activeAlerts.filter(a => a.severity === 'low').length
      }
    }
  });
}

async function handleExport(format: 'json' | 'csv' | 'prometheus') {
  try {
    const exportData = webhookAnalytics.exportMetrics(format);
    
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      prometheus: 'text/plain'
    };

    const filenames = {
      json: 'webhook-metrics.json',
      csv: 'webhook-metrics.csv',
      prometheus: 'webhook-metrics.txt'
    };

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentTypes[format],
        'Content-Disposition': `attachment; filename="${filenames[format]}"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Export failed: ${error.message}` },
      { status: 400 }
    );
  }
}

async function handleCreateAlertRule(data: any) {
  try {
    const { name, condition, threshold, window, severity, channels } = data;
    
    if (!name || !condition || threshold === undefined || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields: name, condition, threshold, severity' },
        { status: 400 }
      );
    }

    const alertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      condition,
      threshold,
      window: window || 5,
      severity,
      channels: channels || ['email'],
      enabled: true
    };

    webhookAnalytics.registerAlertRule(alertRule);
    
    return NextResponse.json({
      success: true,
      message: 'Alert rule created successfully',
      rule: alertRule
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create alert rule: ${error.message}` },
      { status: 400 }
    );
  }
}

async function handleUpdateAlertRule(data: any) {
  // Implementation for updating alert rules
  return NextResponse.json({
    success: true,
    message: 'Alert rule update functionality coming soon'
  });
}

async function handleResolveAlert(data: any) {
  // Implementation for resolving alerts
  return NextResponse.json({
    success: true,
    message: 'Alert resolution functionality coming soon'
  });
}

// Apply high security signature validation to analytics endpoints
export const GET = withSignatureValidation(getHandler, { 
  highSecurity: true,
  skipInDevelopment: false
});

export const POST = withSignatureValidation(postHandler, { 
  highSecurity: true,
  skipInDevelopment: false
});