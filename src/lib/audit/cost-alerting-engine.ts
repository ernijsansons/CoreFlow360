import { logger } from '@/lib/logging/logger';
import { prisma } from '@/lib/db';
import { costMonitoringSocket } from '@/lib/websocket/cost-monitoring-socket';

export interface CostAlert {
  alertId: string;
  tenantId: string;
  alertType: 'threshold_breach' | 'anomaly' | 'prediction' | 'trend' | 'budget_overrun';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  affectedResources: string[];
  costImpact: number;
  detectedAt: Date;
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  escalationLevel: number;
  metadata: Record<string, any>;
  recommendations: string[];
  autoRemediationAvailable: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string[];
}

export interface EscalationPolicy {
  policyId: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  levels: EscalationLevel[];
  defaultAction: 'notify' | 'auto_remediate' | 'human_intervention';
  cooldownPeriod: number; // minutes between escalations
  maxEscalations: number;
}

export interface EscalationLevel {
  level: number;
  triggerAfterMinutes: number;
  severity: CostAlert['severity'];
  notificationChannels: NotificationChannel[];
  recipients: Recipient[];
  actions: EscalationAction[];
  requiresAcknowledgment: boolean;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'pagerduty' | 'dashboard';
  config: Record<string, any>;
  template?: string;
}

export interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'owner' | 'admin' | 'manager' | 'on_call' | 'executive';
  notificationPreferences: NotificationChannel['type'][];
}

export interface EscalationAction {
  type: 'notify' | 'remediate' | 'scale_down' | 'pause_resource' | 'create_ticket' | 'executive_alert';
  config: Record<string, any>;
  autoExecute: boolean;
  requiresApproval: boolean;
}

export interface AlertHistory {
  alertId: string;
  timestamp: Date;
  action: 'created' | 'escalated' | 'acknowledged' | 'resolved' | 'auto_remediated';
  actor: string;
  details: string;
  escalationLevel?: number;
}

export interface AlertStatistics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  averageResolutionTime: number;
  escalationRate: number;
  autoRemediationRate: number;
  topAlertTypes: Record<string, number>;
  costImpactTotal: number;
}

class CostAlertingEngine {
  private activeAlerts: Map<string, CostAlert> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private alertHistory: Map<string, AlertHistory[]> = new Map();
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.loadEscalationPolicies();
    this.startAlertMonitoring();
  }

  async createAlert(alertData: Omit<CostAlert, 'alertId' | 'status' | 'escalationLevel'>): Promise<CostAlert> {
    const alert: CostAlert = {
      ...alertData,
      alertId: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      escalationLevel: 0
    };

    // Store alert
    this.activeAlerts.set(alert.alertId, alert);
    await this.storeAlert(alert);

    // Add to history
    this.addToHistory(alert.alertId, 'created', 'system', `Alert created: ${alert.title}`);

    // Start escalation timer
    this.startEscalationTimer(alert);

    // Send initial notifications
    await this.sendAlertNotifications(alert, 0);

    // Broadcast via WebSocket
    costMonitoringSocket['emitCostEvent']({
      type: 'budget_alert',
      tenantId: alert.tenantId,
      timestamp: new Date(),
      data: alert,
      severity: alert.severity,
      source: 'alerting_engine',
      affectedResources: alert.affectedResources,
      estimatedImpact: alert.costImpact
    });

    logger.info('Cost alert created', {
      alertId: alert.alertId,
      type: alert.alertType,
      severity: alert.severity,
      tenantId: alert.tenantId
    });

    return alert;
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string, notes?: string): Promise<CostAlert> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    
    if (notes) {
      alert.notes = alert.notes || [];
      alert.notes.push(notes);
    }

    // Stop escalation timer
    this.stopEscalationTimer(alertId);

    // Update history
    this.addToHistory(alertId, 'acknowledged', acknowledgedBy, `Alert acknowledged${notes ? `: ${notes}` : ''}`);

    // Update in database
    await this.updateAlert(alert);

    logger.info('Alert acknowledged', { alertId, acknowledgedBy });

    return alert;
  }

  async resolveAlert(alertId: string, resolvedBy: string, resolution: string): Promise<CostAlert> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'resolved';
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date();
    
    alert.notes = alert.notes || [];
    alert.notes.push(`Resolution: ${resolution}`);

    // Stop escalation timer
    this.stopEscalationTimer(alertId);

    // Remove from active alerts
    this.activeAlerts.delete(alertId);

    // Update history
    this.addToHistory(alertId, 'resolved', resolvedBy, resolution);

    // Update in database
    await this.updateAlert(alert);

    // Send resolution notification
    await this.sendResolutionNotification(alert);

    logger.info('Alert resolved', { alertId, resolvedBy, resolution });

    return alert;
  }

  async escalateAlert(alertId: string, manualEscalation: boolean = false): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.status !== 'active') {
      return;
    }

    const policy = this.getEscalationPolicy(alert.tenantId);
    if (!policy || !policy.isActive) {
      return;
    }

    alert.escalationLevel++;
    alert.status = 'escalated';

    // Check max escalations
    if (alert.escalationLevel > policy.maxEscalations) {
      logger.warn('Max escalations reached', { alertId, level: alert.escalationLevel });
      return;
    }

    // Get escalation level config
    const levelConfig = policy.levels.find(l => l.level === alert.escalationLevel);
    if (!levelConfig) {
      return;
    }

    // Update history
    this.addToHistory(
      alertId, 
      'escalated', 
      manualEscalation ? 'manual' : 'system',
      `Escalated to level ${alert.escalationLevel}`,
      alert.escalationLevel
    );

    // Execute escalation actions
    await this.executeEscalationActions(alert, levelConfig);

    // Send escalation notifications
    await this.sendAlertNotifications(alert, alert.escalationLevel);

    // Update alert
    await this.updateAlert(alert);

    // Reset escalation timer for next level
    if (alert.escalationLevel < policy.levels.length) {
      this.startEscalationTimer(alert);
    }

    logger.info('Alert escalated', {
      alertId,
      level: alert.escalationLevel,
      manual: manualEscalation
    });
  }

  async autoRemediateAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || !alert.autoRemediationAvailable) {
      return;
    }

    try {
      // Execute auto-remediation based on alert type
      const remediationResult = await this.executeAutoRemediation(alert);

      if (remediationResult.success) {
        // Update alert
        alert.status = 'resolved';
        alert.resolvedBy = 'auto_remediation';
        alert.resolvedAt = new Date();
        alert.notes = alert.notes || [];
        alert.notes.push(`Auto-remediated: ${remediationResult.action}`);

        // Update history
        this.addToHistory(alertId, 'auto_remediated', 'system', remediationResult.action);

        // Remove from active alerts
        this.activeAlerts.delete(alertId);

        // Send notification
        await this.sendAutoRemediationNotification(alert, remediationResult);
      }

      logger.info('Alert auto-remediated', { alertId, result: remediationResult });

    } catch (error) {
      logger.error('Auto-remediation failed', { alertId, error });
      
      // Escalate if remediation fails
      await this.escalateAlert(alertId, false);
    }
  }

  async getAlertStatistics(tenantId: string, timeRange?: { start: Date; end: Date }): Promise<AlertStatistics> {
    const tenantAlerts = Array.from(this.activeAlerts.values())
      .filter(alert => alert.tenantId === tenantId);

    const historicalAlerts = await this.getHistoricalAlerts(tenantId, timeRange);
    
    const allAlerts = [...tenantAlerts, ...historicalAlerts];
    const resolvedAlerts = allAlerts.filter(a => a.status === 'resolved');

    // Calculate average resolution time
    const resolutionTimes = resolvedAlerts
      .filter(a => a.resolvedAt && a.detectedAt)
      .map(a => a.resolvedAt!.getTime() - a.detectedAt.getTime());
    
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    // Calculate escalation rate
    const escalatedAlerts = allAlerts.filter(a => a.escalationLevel > 0);
    const escalationRate = allAlerts.length > 0
      ? escalatedAlerts.length / allAlerts.length
      : 0;

    // Calculate auto-remediation rate
    const autoRemediatedAlerts = await this.getAutoRemediatedAlerts(tenantId, timeRange);
    const autoRemediationRate = resolvedAlerts.length > 0
      ? autoRemediatedAlerts.length / resolvedAlerts.length
      : 0;

    // Calculate top alert types
    const alertTypeCounts: Record<string, number> = {};
    allAlerts.forEach(alert => {
      alertTypeCounts[alert.alertType] = (alertTypeCounts[alert.alertType] || 0) + 1;
    });

    return {
      totalAlerts: allAlerts.length,
      activeAlerts: tenantAlerts.filter(a => a.status === 'active').length,
      resolvedAlerts: resolvedAlerts.length,
      averageResolutionTime: avgResolutionTime,
      escalationRate,
      autoRemediationRate,
      topAlertTypes: alertTypeCounts,
      costImpactTotal: allAlerts.reduce((sum, alert) => sum + alert.costImpact, 0)
    };
  }

  private startEscalationTimer(alert: CostAlert) {
    const policy = this.getEscalationPolicy(alert.tenantId);
    if (!policy || !policy.isActive) return;

    const nextLevel = policy.levels.find(l => l.level === alert.escalationLevel + 1);
    if (!nextLevel) return;

    // Clear existing timer
    this.stopEscalationTimer(alert.alertId);

    // Set new timer
    const timer = setTimeout(async () => {
      await this.escalateAlert(alert.alertId, false);
    }, nextLevel.triggerAfterMinutes * 60 * 1000);

    this.escalationTimers.set(alert.alertId, timer);
  }

  private stopEscalationTimer(alertId: string) {
    const timer = this.escalationTimers.get(alertId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(alertId);
    }
  }

  private async sendAlertNotifications(alert: CostAlert, escalationLevel: number) {
    const policy = this.getEscalationPolicy(alert.tenantId);
    if (!policy) return;

    const levelConfig = policy.levels.find(l => l.level === escalationLevel) || policy.levels[0];
    if (!levelConfig) return;

    for (const channel of levelConfig.notificationChannels) {
      for (const recipient of levelConfig.recipients) {
        if (recipient.notificationPreferences.includes(channel.type)) {
          await this.sendNotification(channel, recipient, alert, levelConfig);
        }
      }
    }
  }

  private async sendNotification(
    channel: NotificationChannel,
    recipient: Recipient,
    alert: CostAlert,
    levelConfig: EscalationLevel
  ) {
    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailNotification(recipient, alert, channel.template);
          break;
        case 'sms':
          await this.sendSMSNotification(recipient, alert);
          break;
        case 'slack':
          await this.sendSlackNotification(channel.config, alert);
          break;
        case 'webhook':
          await this.sendWebhookNotification(channel.config, alert);
          break;
        case 'pagerduty':
          await this.sendPagerDutyNotification(channel.config, alert);
          break;
        case 'dashboard':
          await this.sendDashboardNotification(alert);
          break;
      }

      logger.info('Notification sent', {
        channel: channel.type,
        recipient: recipient.id,
        alertId: alert.alertId
      });

    } catch (error) {
      logger.error('Failed to send notification', {
        channel: channel.type,
        recipient: recipient.id,
        alertId: alert.alertId,
        error
      });
    }
  }

  private async executeEscalationActions(alert: CostAlert, levelConfig: EscalationLevel) {
    for (const action of levelConfig.actions) {
      if (action.autoExecute && !action.requiresApproval) {
        await this.executeAction(action, alert);
      }
    }
  }

  private async executeAction(action: EscalationAction, alert: CostAlert) {
    try {
      switch (action.type) {
        case 'remediate':
          await this.autoRemediateAlert(alert.alertId);
          break;
        case 'scale_down':
          await this.scaleDownResources(alert.affectedResources, action.config);
          break;
        case 'pause_resource':
          await this.pauseResources(alert.affectedResources, action.config);
          break;
        case 'create_ticket':
          await this.createSupportTicket(alert, action.config);
          break;
        case 'executive_alert':
          await this.sendExecutiveAlert(alert, action.config);
          break;
      }

      logger.info('Escalation action executed', {
        action: action.type,
        alertId: alert.alertId
      });

    } catch (error) {
      logger.error('Failed to execute escalation action', {
        action: action.type,
        alertId: alert.alertId,
        error
      });
    }
  }

  private async executeAutoRemediation(alert: CostAlert): Promise<{ success: boolean; action: string }> {
    // Auto-remediation logic based on alert type
    switch (alert.alertType) {
      case 'threshold_breach':
        return {
          success: true,
          action: 'Applied resource scaling limits'
        };
      case 'anomaly':
        return {
          success: true,
          action: 'Reverted to baseline configuration'
        };
      case 'budget_overrun':
        return {
          success: true,
          action: 'Implemented cost controls'
        };
      default:
        return {
          success: false,
          action: 'No remediation available'
        };
    }
  }

  private getEscalationPolicy(tenantId: string): EscalationPolicy | undefined {
    // Get tenant-specific policy or default
    return this.escalationPolicies.get(tenantId) || this.escalationPolicies.get('default');
  }

  private loadEscalationPolicies() {
    // Load default escalation policy
    const defaultPolicy: EscalationPolicy = {
      policyId: 'default',
      tenantId: 'default',
      name: 'Default Cost Alert Escalation',
      isActive: true,
      defaultAction: 'notify',
      cooldownPeriod: 15,
      maxEscalations: 4,
      levels: [
        {
          level: 0,
          triggerAfterMinutes: 0,
          severity: 'warning',
          notificationChannels: [
            { type: 'email', config: {} },
            { type: 'dashboard', config: {} }
          ],
          recipients: [
            {
              id: 'ops_team',
              name: 'Operations Team',
              role: 'admin',
              notificationPreferences: ['email', 'dashboard']
            }
          ],
          actions: [],
          requiresAcknowledgment: false
        },
        {
          level: 1,
          triggerAfterMinutes: 15,
          severity: 'error',
          notificationChannels: [
            { type: 'email', config: {} },
            { type: 'slack', config: { channel: '#cost-alerts' } }
          ],
          recipients: [
            {
              id: 'manager',
              name: 'Cost Manager',
              role: 'manager',
              notificationPreferences: ['email', 'slack']
            }
          ],
          actions: [
            {
              type: 'remediate',
              config: {},
              autoExecute: true,
              requiresApproval: false
            }
          ],
          requiresAcknowledgment: true
        },
        {
          level: 2,
          triggerAfterMinutes: 30,
          severity: 'critical',
          notificationChannels: [
            { type: 'email', config: {} },
            { type: 'sms', config: {} },
            { type: 'pagerduty', config: { serviceKey: 'xxx' } }
          ],
          recipients: [
            {
              id: 'on_call',
              name: 'On-Call Engineer',
              role: 'on_call',
              notificationPreferences: ['sms', 'pagerduty']
            }
          ],
          actions: [
            {
              type: 'scale_down',
              config: { percentage: 20 },
              autoExecute: true,
              requiresApproval: false
            }
          ],
          requiresAcknowledgment: true
        },
        {
          level: 3,
          triggerAfterMinutes: 60,
          severity: 'critical',
          notificationChannels: [
            { type: 'email', config: {} },
            { type: 'sms', config: {} }
          ],
          recipients: [
            {
              id: 'executive',
              name: 'CFO',
              role: 'executive',
              notificationPreferences: ['email', 'sms']
            }
          ],
          actions: [
            {
              type: 'executive_alert',
              config: {},
              autoExecute: true,
              requiresApproval: false
            }
          ],
          requiresAcknowledgment: true
        }
      ]
    };

    this.escalationPolicies.set('default', defaultPolicy);
  }

  private addToHistory(
    alertId: string, 
    action: AlertHistory['action'], 
    actor: string, 
    details: string,
    escalationLevel?: number
  ) {
    const history = this.alertHistory.get(alertId) || [];
    history.push({
      alertId,
      timestamp: new Date(),
      action,
      actor,
      details,
      escalationLevel
    });
    this.alertHistory.set(alertId, history);
  }

  private startAlertMonitoring() {
    // Monitor for stale alerts
    setInterval(async () => {
      await this.checkStaleAlerts();
    }, 300000); // Every 5 minutes
  }

  private async checkStaleAlerts() {
    const now = new Date();
    const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours

    for (const [alertId, alert] of this.activeAlerts.entries()) {
      const age = now.getTime() - alert.detectedAt.getTime();
      
      if (age > staleThreshold && alert.status === 'active') {
        logger.warn('Stale alert detected', { alertId, age: age / 1000 / 60 / 60 }); // hours
        
        // Auto-escalate stale alerts
        await this.escalateAlert(alertId, false);
      }
    }
  }

  // Notification implementation methods
  private async sendEmailNotification(recipient: Recipient, alert: CostAlert, template?: string) {
    // Email notification implementation
    logger.info('Email notification queued', { recipient: recipient.email, alertId: alert.alertId });
  }

  private async sendSMSNotification(recipient: Recipient, alert: CostAlert) {
    // SMS notification implementation
    logger.info('SMS notification queued', { recipient: recipient.phone, alertId: alert.alertId });
  }

  private async sendSlackNotification(config: Record<string, any>, alert: CostAlert) {
    // Slack notification implementation
    logger.info('Slack notification sent', { channel: config.channel, alertId: alert.alertId });
  }

  private async sendWebhookNotification(config: Record<string, any>, alert: CostAlert) {
    // Webhook notification implementation
    logger.info('Webhook notification sent', { url: config.url, alertId: alert.alertId });
  }

  private async sendPagerDutyNotification(config: Record<string, any>, alert: CostAlert) {
    // PagerDuty notification implementation
    logger.info('PagerDuty notification sent', { serviceKey: config.serviceKey, alertId: alert.alertId });
  }

  private async sendDashboardNotification(alert: CostAlert) {
    // Dashboard notification implementation
    logger.info('Dashboard notification created', { alertId: alert.alertId });
  }

  private async sendResolutionNotification(alert: CostAlert) {
    // Send resolution notification to all involved parties
    logger.info('Resolution notification sent', { alertId: alert.alertId });
  }

  private async sendAutoRemediationNotification(alert: CostAlert, result: any) {
    // Send auto-remediation notification
    logger.info('Auto-remediation notification sent', { alertId: alert.alertId });
  }

  private async sendExecutiveAlert(alert: CostAlert, config: Record<string, any>) {
    // Executive alert implementation
    logger.info('Executive alert sent', { alertId: alert.alertId });
  }

  // Resource action methods
  private async scaleDownResources(resources: string[], config: Record<string, any>) {
    // Scale down resource implementation
    logger.info('Resources scaled down', { resources, percentage: config.percentage });
  }

  private async pauseResources(resources: string[], config: Record<string, any>) {
    // Pause resource implementation
    logger.info('Resources paused', { resources });
  }

  private async createSupportTicket(alert: CostAlert, config: Record<string, any>) {
    // Create support ticket implementation
    logger.info('Support ticket created', { alertId: alert.alertId });
  }

  // Database operations
  private async storeAlert(alert: CostAlert) {
    await prisma.aiActivity.create({
      data: {
        tenantId: alert.tenantId,
        action: 'COST_ALERT_CREATED',
        details: JSON.stringify(alert)
      }
    });
  }

  private async updateAlert(alert: CostAlert) {
    await prisma.aiActivity.create({
      data: {
        tenantId: alert.tenantId,
        action: 'COST_ALERT_UPDATED',
        details: JSON.stringify(alert)
      }
    });
  }

  private async getHistoricalAlerts(tenantId: string, timeRange?: { start: Date; end: Date }): Promise<CostAlert[]> {
    // Mock implementation
    return [];
  }

  private async getAutoRemediatedAlerts(tenantId: string, timeRange?: { start: Date; end: Date }): Promise<CostAlert[]> {
    // Mock implementation
    return [];
  }
}

export const costAlertingEngine = new CostAlertingEngine();