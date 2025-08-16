/**
 * CoreFlow360 - Circuit Breaker Health Monitoring API
 * Provides real-time status and statistics for all circuit breakers
 */

import { NextRequest, NextResponse } from 'next/server';
import { circuitBreakerRegistry, circuitBreakers } from '@/lib/resilience/circuit-breaker';
import { serviceHealthCheck, getServiceStats } from '@/lib/external-services/resilient-service-wrapper';
import { successResponse, errorResponse } from '@/lib/api-response';
import { handleError, ErrorContext } from '@/lib/errors/error-handler';

/**
 * GET /api/health/circuit-breakers
 * Returns comprehensive circuit breaker health information
 */
export async function GET(request: NextRequest) {
  const context: ErrorContext = {
    endpoint: '/api/health/circuit-breakers',
    method: 'GET',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  };

  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    const includeErrors = searchParams.get('errors') === 'true';
    const serviceName = searchParams.get('service');

    // Get overall service health
    const serviceHealth = await serviceHealthCheck();

    // Get all circuit breaker statistics
    const allStats = getServiceStats();

    // Filter by service if requested
    const filteredStats = serviceName && allStats[serviceName] 
      ? { [serviceName]: allStats[serviceName] }
      : allStats;

    // Build response based on requested detail level
    const response: any = {
      timestamp: new Date().toISOString(),
      overall: serviceHealth,
      summary: {
        totalBreakers: Object.keys(filteredStats).length,
        closedBreakers: Object.values(filteredStats).filter(s => s.state === 'CLOSED').length,
        openBreakers: Object.values(filteredStats).filter(s => s.state === 'OPEN').length,
        halfOpenBreakers: Object.values(filteredStats).filter(s => s.state === 'HALF_OPEN').length,
        averageErrorRate: Object.values(filteredStats)
          .reduce((sum, s) => sum + s.errorRate, 0) / Object.keys(filteredStats).length
      }
    };

    // Include detailed statistics if requested
    if (includeStats) {
      response.breakers = {};
      
      for (const [name, stats] of Object.entries(filteredStats)) {
        response.breakers[name] = {
          state: stats.state,
          health: {
            errorRate: Math.round(stats.errorRate * 100) / 100,
            totalCalls: stats.totalCalls,
            failures: stats.failures,
            successes: stats.successes,
            consecutiveFailures: stats.consecutiveFailures,
            consecutiveSuccesses: stats.consecutiveSuccesses
          },
          timing: {
            lastFailureTime: stats.lastFailureTime || null,
            lastSuccessTime: stats.lastSuccessTime || null,
            adaptiveRecoveryTimeout: stats.adaptiveRecoveryTimeout
          },
          recent: {
            windowFailures: stats.windowFailures.length,
            recentErrorCount: stats.recentErrors.length
          }
        };

        // Include recent error details if requested
        if (includeErrors) {
          response.breakers[name].recentErrors = stats.recentErrors
            .slice(-10) // Last 10 errors
            .map(error => ({
              timestamp: new Date(error.timestamp).toISOString(),
              type: error.type,
              message: error.message.substring(0, 100) // Truncate long messages
            }));
        }
      }
    }

    // Add recommendations based on current state
    response.recommendations = generateRecommendations(filteredStats);

    return successResponse(response);

  } catch (error) {
    return handleError(error, context);
  }
}

/**
 * POST /api/health/circuit-breakers/reset
 * Reset specific or all circuit breakers
 */
export async function POST(request: NextRequest) {
  const context: ErrorContext = {
    endpoint: '/api/health/circuit-breakers/reset',
    method: 'POST',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  };

  try {
    const body = await request.json();
    const { service, action } = body;

    if (action === 'reset') {
      if (service && service !== 'all') {
        // Reset specific circuit breaker
        const breaker = circuitBreakers[service as keyof typeof circuitBreakers];
        if (!breaker) {
          return errorResponse(`Circuit breaker '${service}' not found`, 404);
        }
        
        breaker.reset();
        
        return successResponse({
          message: `Circuit breaker '${service}' has been reset`,
          service,
          newState: breaker.getStats().state,
          timestamp: new Date().toISOString()
        });
      } else {
        // Reset all circuit breakers
        circuitBreakerRegistry.reset();
        
        return successResponse({
          message: 'All circuit breakers have been reset',
          resetCount: Object.keys(circuitBreakers).length,
          timestamp: new Date().toISOString()
        });
      }
    } else if (action === 'force_open') {
      if (!service || service === 'all') {
        return errorResponse('Service name required for force_open action', 400);
      }
      
      const breaker = circuitBreakers[service as keyof typeof circuitBreakers];
      if (!breaker) {
        return errorResponse(`Circuit breaker '${service}' not found`, 404);
      }
      
      breaker.forceOpen();
      
      return successResponse({
        message: `Circuit breaker '${service}' has been forced open`,
        service,
        newState: 'OPEN',
        timestamp: new Date().toISOString()
      });
    } else if (action === 'force_close') {
      if (!service || service === 'all') {
        return errorResponse('Service name required for force_close action', 400);
      }
      
      const breaker = circuitBreakers[service as keyof typeof circuitBreakers];
      if (!breaker) {
        return errorResponse(`Circuit breaker '${service}' not found`, 404);
      }
      
      breaker.forceClose();
      
      return successResponse({
        message: `Circuit breaker '${service}' has been forced closed`,
        service,
        newState: 'CLOSED',
        timestamp: new Date().toISOString()
      });
    } else {
      return errorResponse('Invalid action. Supported actions: reset, force_open, force_close', 400);
    }

  } catch (error) {
    return handleError(error, context);
  }
}

/**
 * Generate operational recommendations based on circuit breaker states
 */
function generateRecommendations(stats: Record<string, any>): string[] {
  const recommendations: string[] = [];

  for (const [serviceName, serviceStats] of Object.entries(stats)) {
    if (serviceStats.state === 'OPEN') {
      recommendations.push(
        `🚨 ${serviceName.toUpperCase()}: Circuit breaker is OPEN. Service is currently unavailable. Check service health and consider manual intervention.`
      );
    } else if (serviceStats.state === 'HALF_OPEN') {
      recommendations.push(
        `⚠️ ${serviceName.toUpperCase()}: Circuit breaker is HALF_OPEN. Service is being tested for recovery. Monitor closely.`
      );
    } else if (serviceStats.errorRate > 0.3) {
      recommendations.push(
        `⚠️ ${serviceName.toUpperCase()}: High error rate (${Math.round(serviceStats.errorRate * 100)}%). Consider investigating service health.`
      );
    } else if (serviceStats.consecutiveFailures > 2) {
      recommendations.push(
        `⚠️ ${serviceName.toUpperCase()}: ${serviceStats.consecutiveFailures} consecutive failures detected. Monitor service stability.`
      );
    }
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('✅ All circuit breakers are healthy. No immediate action required.');
  } else {
    recommendations.push(
      '💡 Consider implementing alerting for circuit breaker state changes in production.',
      '💡 Review error patterns to identify potential service improvements.',
      '💡 Ensure proper fallback mechanisms are in place for critical services.'
    );
  }

  return recommendations;
}

/**
 * PUT /api/health/circuit-breakers/configure
 * Update circuit breaker configuration (for testing/tuning)
 */
export async function PUT(request: NextRequest) {
  const context: ErrorContext = {
    endpoint: '/api/health/circuit-breakers/configure',
    method: 'PUT',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  };

  try {
    const body = await request.json();
    const { service, config } = body;

    if (!service) {
      return errorResponse('Service name is required', 400);
    }

    if (!config) {
      return errorResponse('Configuration is required', 400);
    }

    // This would typically require admin permissions
    // For now, we'll just return the configuration that would be applied
    return successResponse({
      message: `Configuration update simulation for '${service}'`,
      service,
      currentConfig: {
        failureThreshold: config.failureThreshold || 5,
        recoveryTimeout: config.recoveryTimeout || 60000,
        monitoringPeriod: config.monitoringPeriod || 300000,
        successThreshold: config.successThreshold || 3,
        volumeThreshold: config.volumeThreshold || 10,
        errorRateThreshold: config.errorRateThreshold || 0.5
      },
      note: 'Configuration changes require application restart in production',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleError(error, context);
  }
}