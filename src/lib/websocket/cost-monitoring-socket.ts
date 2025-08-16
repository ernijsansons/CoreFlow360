import { WebSocket } from 'ws';
import { logger } from '@/lib/logging/logger';
import { prisma } from '@/lib/db';
import { costManagementAuditor } from '@/lib/audit/cost-management-auditor';

export interface CostMonitoringEvent {
  type: 'cost_spike' | 'savings_opportunity' | 'budget_alert' | 'anomaly_detected' | 'optimization_complete';
  tenantId: string;
  timestamp: Date;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  affectedResources: string[];
  estimatedImpact: number;
}

export interface CostMetric {
  resourceId: string;
  resourceType: string;
  currentCost: number;
  projectedCost: number;
  utilizationRate: number;
  efficiency: number;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface CostThreshold {
  id: string;
  tenantId: string;
  resourceType: string;
  thresholdType: 'absolute' | 'percentage' | 'trend';
  warningValue: number;
  criticalValue: number;
  timeWindow: number; // minutes
  isActive: boolean;
}

class CostMonitoringSocket {
  private wsServer: any;
  private connectedClients: Map<string, WebSocket> = new Map();
  private costMetricsBuffer: Map<string, CostMetric[]> = new Map();
  private activeThresholds: Map<string, CostThreshold[]> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeWebSocketServer();
    this.startCostMonitoring();
  }

  private initializeWebSocketServer() {
    // Note: In production, integrate with your WebSocket server setup
    logger.info('Initializing cost monitoring WebSocket server');
  }

  public addClient(clientId: string, ws: WebSocket, tenantId: string) {
    this.connectedClients.set(clientId, ws);
    
    ws.on('message', (message) => {
      this.handleClientMessage(clientId, message, tenantId);
    });

    ws.on('close', () => {
      this.connectedClients.delete(clientId);
      logger.info('Cost monitoring client disconnected', { clientId, tenantId });
    });

    // Send initial cost state
    this.sendInitialCostState(clientId, tenantId);
    
    logger.info('Cost monitoring client connected', { clientId, tenantId });
  }

  private async handleClientMessage(clientId: string, message: any, tenantId: string) {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'subscribe_cost_metrics':
          await this.subscribeToCostMetrics(clientId, data.resourceTypes, tenantId);
          break;
        case 'set_cost_threshold':
          await this.setCostThreshold(data.threshold, tenantId);
          break;
        case 'request_real_time_audit':
          await this.triggerRealTimeAudit(tenantId);
          break;
        case 'acknowledge_alert':
          await this.acknowledgeAlert(data.alertId, tenantId);
          break;
      }
    } catch (error) {
      logger.error('Failed to handle cost monitoring message', { clientId, error });
    }
  }

  private startCostMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      await this.collectCostMetrics();
      await this.analyzeThresholds();
      await this.detectAnomalies();
      await this.broadcastCostUpdates();
    }, 30000); // Every 30 seconds

    logger.info('Cost monitoring started with 30-second intervals');
  }

  private async collectCostMetrics() {
    try {
      // Collect from all active tenants
      const activeTenants = await prisma.tenant.findMany({
        where: { 
          status: 'ACTIVE',
          costAudits: { some: {} }
        },
        select: { id: true }
      });

      for (const tenant of activeTenants) {
        const metrics = await this.gatherTenantCostMetrics(tenant.id);
        this.costMetricsBuffer.set(tenant.id, metrics);
      }
    } catch (error) {
      logger.error('Failed to collect cost metrics', { error });
    }
  }

  private async gatherTenantCostMetrics(tenantId: string): Promise<CostMetric[]> {
    // Mock implementation - in production, integrate with cloud provider APIs
    const mockMetrics: CostMetric[] = [
      {
        resourceId: 'compute-1',
        resourceType: 'compute',
        currentCost: 125.50,
        projectedCost: 135.75,
        utilizationRate: 0.25,
        efficiency: 0.6,
        timestamp: new Date(),
        tags: { environment: 'production', team: 'engineering' }
      },
      {
        resourceId: 'database-1',
        resourceType: 'database',
        currentCost: 89.25,
        projectedCost: 92.10,
        utilizationRate: 0.75,
        efficiency: 0.9,
        timestamp: new Date(),
        tags: { environment: 'production', team: 'data' }
      },
      {
        resourceId: 'storage-1',
        resourceType: 'storage',
        currentCost: 45.80,
        projectedCost: 48.20,
        utilizationRate: 0.45,
        efficiency: 0.7,
        timestamp: new Date(),
        tags: { environment: 'production', team: 'platform' }
      }
    ];

    // Add some randomness for realistic simulation
    return mockMetrics.map(metric => ({
      ...metric,
      currentCost: metric.currentCost * (0.9 + Math.random() * 0.2),
      utilizationRate: Math.max(0.1, Math.min(1.0, metric.utilizationRate + (Math.random() - 0.5) * 0.2))
    }));
  }

  private async analyzeThresholds() {
    for (const [tenantId, metrics] of this.costMetricsBuffer.entries()) {
      const thresholds = this.activeThresholds.get(tenantId) || [];
      
      for (const threshold of thresholds) {
        const relevantMetrics = metrics.filter(m => m.resourceType === threshold.resourceType);
        
        for (const metric of relevantMetrics) {
          const violation = this.checkThresholdViolation(metric, threshold);
          if (violation) {
            await this.emitCostEvent({
              type: 'budget_alert',
              tenantId,
              timestamp: new Date(),
              data: {
                threshold,
                metric,
                violationType: violation.type,
                severity: violation.severity
              },
              severity: violation.severity,
              source: 'threshold_monitor',
              affectedResources: [metric.resourceId],
              estimatedImpact: violation.impact
            });
          }
        }
      }
    }
  }

  private checkThresholdViolation(metric: CostMetric, threshold: CostThreshold): {
    type: string;
    severity: 'warning' | 'error' | 'critical';
    impact: number;
  } | null {
    let currentValue: number;
    let impact: number;

    switch (threshold.thresholdType) {
      case 'absolute':
        currentValue = metric.currentCost;
        impact = currentValue - threshold.criticalValue;
        break;
      case 'percentage':
        currentValue = (metric.projectedCost - metric.currentCost) / metric.currentCost * 100;
        impact = metric.projectedCost - metric.currentCost;
        break;
      case 'trend':
        currentValue = metric.projectedCost;
        impact = currentValue - threshold.criticalValue;
        break;
      default:
        return null;
    }

    if (currentValue >= threshold.criticalValue) {
      return { type: 'critical_threshold', severity: 'critical', impact };
    } else if (currentValue >= threshold.warningValue) {
      return { type: 'warning_threshold', severity: 'warning', impact };
    }

    return null;
  }

  private async detectAnomalies() {
    for (const [tenantId, metrics] of this.costMetricsBuffer.entries()) {
      const anomalies = await this.runAnomalyDetection(metrics, tenantId);
      
      for (const anomaly of anomalies) {
        await this.emitCostEvent({
          type: 'anomaly_detected',
          tenantId,
          timestamp: new Date(),
          data: anomaly,
          severity: anomaly.severity,
          source: 'anomaly_detector',
          affectedResources: anomaly.affectedResources,
          estimatedImpact: anomaly.estimatedImpact
        });
      }
    }
  }

  private async runAnomalyDetection(metrics: CostMetric[], tenantId: string): Promise<any[]> {
    const anomalies = [];

    // Detect efficiency anomalies
    const lowEfficiencyResources = metrics.filter(m => m.efficiency < 0.5 && m.currentCost > 50);
    if (lowEfficiencyResources.length > 0) {
      anomalies.push({
        type: 'efficiency_anomaly',
        severity: 'warning' as const,
        description: `${lowEfficiencyResources.length} resources showing low efficiency`,
        affectedResources: lowEfficiencyResources.map(r => r.resourceId),
        estimatedImpact: lowEfficiencyResources.reduce((sum, r) => sum + (r.currentCost * 0.3), 0),
        recommendations: ['Consider rightsizing', 'Implement auto-scaling', 'Review resource allocation']
      });
    }

    // Detect cost spikes
    const highCostResources = metrics.filter(m => m.projectedCost > m.currentCost * 1.2);
    if (highCostResources.length > 0) {
      anomalies.push({
        type: 'cost_spike',
        severity: 'error' as const,
        description: `Cost spike detected: ${highCostResources.length} resources trending 20%+ higher`,
        affectedResources: highCostResources.map(r => r.resourceId),
        estimatedImpact: highCostResources.reduce((sum, r) => sum + (r.projectedCost - r.currentCost), 0),
        recommendations: ['Immediate cost review', 'Implement cost controls', 'Consider scaling down']
      });
    }

    return anomalies;
  }

  private async broadcastCostUpdates() {
    const updatePayload = {
      type: 'cost_metrics_update',
      timestamp: new Date().toISOString(),
      data: Object.fromEntries(this.costMetricsBuffer.entries())
    };

    this.broadcast(updatePayload);
  }

  private async emitCostEvent(event: CostMonitoringEvent) {
    // Store event in database
    await this.storeCostEvent(event);

    // Broadcast to connected clients
    this.broadcast({
      type: 'cost_event',
      event
    });

    // Log for monitoring
    logger.info('Cost monitoring event emitted', {
      type: event.type,
      tenantId: event.tenantId,
      severity: event.severity,
      impact: event.estimatedImpact
    });
  }

  private async storeCostEvent(event: CostMonitoringEvent) {
    try {
      await prisma.aiActivity.create({
        data: {
          tenantId: event.tenantId,
          action: 'COST_MONITORING_EVENT',
          details: JSON.stringify({
            eventType: event.type,
            severity: event.severity,
            source: event.source,
            affectedResources: event.affectedResources,
            estimatedImpact: event.estimatedImpact,
            data: event.data,
            timestamp: event.timestamp.toISOString()
          })
        }
      });
    } catch (error) {
      logger.error('Failed to store cost event', { event, error });
    }
  }

  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    
    this.connectedClients.forEach((ws, clientId) => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        } else {
          this.connectedClients.delete(clientId);
        }
      } catch (error) {
        logger.error('Failed to broadcast to client', { clientId, error });
        this.connectedClients.delete(clientId);
      }
    });
  }

  private async sendInitialCostState(clientId: string, tenantId: string) {
    const ws = this.connectedClients.get(clientId);
    if (!ws) return;

    try {
      const recentAudits = await prisma.costAudit.findMany({
        where: { tenantId },
        orderBy: { auditStarted: 'desc' },
        take: 5
      });

      const costState = {
        type: 'initial_cost_state',
        data: {
          recentAudits: recentAudits.length,
          totalSavings: recentAudits.reduce((sum, audit) => sum + audit.potentialSavings, 0),
          activeThresholds: this.activeThresholds.get(tenantId)?.length || 0,
          lastUpdate: new Date().toISOString()
        }
      };

      ws.send(JSON.stringify(costState));
    } catch (error) {
      logger.error('Failed to send initial cost state', { clientId, tenantId, error });
    }
  }

  private async subscribeToCostMetrics(clientId: string, resourceTypes: string[], tenantId: string) {
    // Set up subscription for specific resource types
    logger.info('Client subscribed to cost metrics', { clientId, resourceTypes, tenantId });
  }

  private async setCostThreshold(threshold: CostThreshold, tenantId: string) {
    const tenantThresholds = this.activeThresholds.get(tenantId) || [];
    const existingIndex = tenantThresholds.findIndex(t => t.id === threshold.id);
    
    if (existingIndex >= 0) {
      tenantThresholds[existingIndex] = threshold;
    } else {
      tenantThresholds.push(threshold);
    }
    
    this.activeThresholds.set(tenantId, tenantThresholds);
    
    logger.info('Cost threshold set', { tenantId, thresholdId: threshold.id });
  }

  private async triggerRealTimeAudit(tenantId: string) {
    try {
      const results = await costManagementAuditor.runFullCostAudit(tenantId);
      
      await this.emitCostEvent({
        type: 'optimization_complete',
        tenantId,
        timestamp: new Date(),
        data: {
          auditResults: results,
          totalSavings: results.reduce((sum, r) => sum + r.potentialSavings, 0),
          criticalIssues: results.reduce((sum, r) => sum + r.criticalIssues.length, 0)
        },
        severity: 'info',
        source: 'real_time_audit',
        affectedResources: ['all'],
        estimatedImpact: results.reduce((sum, r) => sum + r.potentialSavings, 0)
      });
    } catch (error) {
      logger.error('Failed to trigger real-time audit', { tenantId, error });
    }
  }

  private async acknowledgeAlert(alertId: string, tenantId: string) {
    logger.info('Cost alert acknowledged', { alertId, tenantId });
  }

  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.connectedClients.clear();
    this.costMetricsBuffer.clear();
    
    logger.info('Cost monitoring stopped');
  }
}

export const costMonitoringSocket = new CostMonitoringSocket();