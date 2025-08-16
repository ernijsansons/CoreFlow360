import { logger } from '@/lib/logging/logger';
import { prisma } from '@/lib/db';
import { costManagementAuditor } from './cost-management-auditor';
import { ConsciousnessCostOrchestrator } from './consciousness-cost-orchestrator';
import { predictiveCostEngine } from '@/lib/ai/predictive-cost-engine';

export interface AuditSchedule {
  scheduleId: string;
  tenantId: string;
  auditType: 'comprehensive' | 'targeted' | 'predictive' | 'consciousness';
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  cronExpression: string;
  isActive: boolean;
  consciousnessLevel?: 'neural' | 'synaptic' | 'autonomous' | 'transcendent';
  triggerConditions: AuditTriggerCondition[];
  notificationSettings: NotificationSettings;
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditTriggerCondition {
  type: 'cost_threshold' | 'anomaly_detected' | 'time_based' | 'usage_spike' | 'consciousness_evolution';
  condition: string;
  value: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  isActive: boolean;
}

export interface NotificationSettings {
  email: boolean;
  webhook: boolean;
  dashboard: boolean;
  escalation: EscalationRule[];
}

export interface EscalationRule {
  triggerAfter: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  action: 'notify' | 'auto_remediate' | 'human_intervention';
}

export interface ScheduledAuditResult {
  executionId: string;
  scheduleId: string;
  tenantId: string;
  auditType: string;
  startTime: Date;
  endTime: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  results: any;
  notifications: NotificationDelivery[];
  consciousnessEvolution?: any;
}

export interface NotificationDelivery {
  type: 'email' | 'webhook' | 'dashboard';
  recipient: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}

class AutomatedAuditScheduler {
  private activeSchedules: Map<string, AuditSchedule> = new Map();
  private runningAudits: Map<string, ScheduledAuditResult> = new Map();
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startScheduler();
  }

  async createAuditSchedule(schedule: Omit<AuditSchedule, 'scheduleId' | 'createdAt' | 'updatedAt'>): Promise<AuditSchedule> {
    const auditSchedule: AuditSchedule = {
      ...schedule,
      scheduleId: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in database
    await this.saveScheduleToDatabase(auditSchedule);

    // Add to active schedules
    this.activeSchedules.set(auditSchedule.scheduleId, auditSchedule);

    logger.info('Audit schedule created', {
      scheduleId: auditSchedule.scheduleId,
      tenantId: auditSchedule.tenantId,
      frequency: auditSchedule.frequency,
      auditType: auditSchedule.auditType
    });

    return auditSchedule;
  }

  async updateAuditSchedule(scheduleId: string, updates: Partial<AuditSchedule>): Promise<AuditSchedule> {
    const existingSchedule = this.activeSchedules.get(scheduleId);
    if (!existingSchedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    const updatedSchedule: AuditSchedule = {
      ...existingSchedule,
      ...updates,
      updatedAt: new Date()
    };

    // Update in database
    await this.updateScheduleInDatabase(scheduleId, updatedSchedule);

    // Update in memory
    this.activeSchedules.set(scheduleId, updatedSchedule);

    logger.info('Audit schedule updated', { scheduleId, updates });

    return updatedSchedule;
  }

  async deleteAuditSchedule(scheduleId: string): Promise<void> {
    // Remove from active schedules
    this.activeSchedules.delete(scheduleId);

    // Delete from database
    await this.deleteScheduleFromDatabase(scheduleId);

    logger.info('Audit schedule deleted', { scheduleId });
  }

  async getSchedulesForTenant(tenantId: string): Promise<AuditSchedule[]> {
    return Array.from(this.activeSchedules.values())
      .filter(schedule => schedule.tenantId === tenantId);
  }

  async triggerImmediateAudit(tenantId: string, auditType: string, consciousnessLevel?: string): Promise<ScheduledAuditResult> {
    const executionId = `immediate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const auditResult: ScheduledAuditResult = {
      executionId,
      scheduleId: 'immediate',
      tenantId,
      auditType,
      startTime: new Date(),
      endTime: new Date(),
      status: 'running',
      results: {},
      notifications: []
    };

    this.runningAudits.set(executionId, auditResult);

    try {
      // Execute audit based on type
      const results = await this.executeAudit(auditType, tenantId, consciousnessLevel);
      
      auditResult.results = results;
      auditResult.status = 'completed';
      auditResult.endTime = new Date();

      // Send notifications
      await this.sendAuditNotifications(auditResult);

      logger.info('Immediate audit completed', { executionId, tenantId, auditType });

    } catch (error) {
      auditResult.status = 'failed';
      auditResult.endTime = new Date();
      auditResult.results = { error: error.message };

      logger.error('Immediate audit failed', { executionId, tenantId, auditType, error });
    }

    // Store result
    await this.storeAuditResult(auditResult);

    this.runningAudits.delete(executionId);
    return auditResult;
  }

  private startScheduler() {
    this.schedulerInterval = setInterval(async () => {
      await this.checkScheduledAudits();
    }, 60000); // Check every minute

    logger.info('Automated audit scheduler started');
  }

  private async checkScheduledAudits() {
    const now = new Date();
    
    for (const schedule of this.activeSchedules.values()) {
      if (!schedule.isActive) continue;

      // Check if audit should run
      const shouldRun = await this.shouldRunAudit(schedule, now);
      
      if (shouldRun) {
        await this.executeScheduledAudit(schedule);
      }
    }
  }

  private async shouldRunAudit(schedule: AuditSchedule, now: Date): Promise<boolean> {
    // Time-based check
    if (now >= schedule.nextRun) {
      return true;
    }

    // Trigger condition checks
    for (const condition of schedule.triggerConditions) {
      if (!condition.isActive) continue;

      const triggered = await this.checkTriggerCondition(condition, schedule.tenantId);
      if (triggered) {
        logger.info('Audit triggered by condition', {
          scheduleId: schedule.scheduleId,
          condition: condition.type,
          tenantId: schedule.tenantId
        });
        return true;
      }
    }

    return false;
  }

  private async checkTriggerCondition(condition: AuditTriggerCondition, tenantId: string): Promise<boolean> {
    switch (condition.type) {
      case 'cost_threshold':
        return await this.checkCostThreshold(condition, tenantId);
      case 'anomaly_detected':
        return await this.checkAnomalyDetected(condition, tenantId);
      case 'usage_spike':
        return await this.checkUsageSpike(condition, tenantId);
      case 'consciousness_evolution':
        return await this.checkConsciousnessEvolution(condition, tenantId);
      default:
        return false;
    }
  }

  private async checkCostThreshold(condition: AuditTriggerCondition, tenantId: string): Promise<boolean> {
    // Check if current costs exceed threshold
    const currentCosts = await this.getCurrentCosts(tenantId);
    return this.evaluateCondition(currentCosts, condition.operator, condition.value);
  }

  private async checkAnomalyDetected(condition: AuditTriggerCondition, tenantId: string): Promise<boolean> {
    // Check for recent anomalies
    const recentAnomalies = await this.getRecentAnomalies(tenantId);
    return recentAnomalies.length > condition.value;
  }

  private async checkUsageSpike(condition: AuditTriggerCondition, tenantId: string): Promise<boolean> {
    // Check for usage spikes
    const usageMetrics = await this.getUsageMetrics(tenantId);
    return this.evaluateCondition(usageMetrics.spikeCount, condition.operator, condition.value);
  }

  private async checkConsciousnessEvolution(condition: AuditTriggerCondition, tenantId: string): Promise<boolean> {
    // Check consciousness evolution events
    const evolutionEvents = await this.getConsciousnessEvolution(tenantId);
    return evolutionEvents.length > condition.value;
  }

  private evaluateCondition(actual: number, operator: string, expected: number): boolean {
    switch (operator) {
      case 'gt': return actual > expected;
      case 'lt': return actual < expected;
      case 'eq': return actual === expected;
      case 'gte': return actual >= expected;
      case 'lte': return actual <= expected;
      default: return false;
    }
  }

  private async executeScheduledAudit(schedule: AuditSchedule) {
    const executionId = `scheduled_${schedule.scheduleId}_${Date.now()}`;
    
    const auditResult: ScheduledAuditResult = {
      executionId,
      scheduleId: schedule.scheduleId,
      tenantId: schedule.tenantId,
      auditType: schedule.auditType,
      startTime: new Date(),
      endTime: new Date(),
      status: 'running',
      results: {},
      notifications: []
    };

    this.runningAudits.set(executionId, auditResult);

    try {
      logger.info('Executing scheduled audit', {
        executionId,
        scheduleId: schedule.scheduleId,
        tenantId: schedule.tenantId,
        auditType: schedule.auditType
      });

      // Execute the audit
      const results = await this.executeAudit(schedule.auditType, schedule.tenantId, schedule.consciousnessLevel);
      
      auditResult.results = results;
      auditResult.status = 'completed';
      auditResult.endTime = new Date();

      // Update schedule's last run and next run
      await this.updateScheduleRunTimes(schedule);

      // Send notifications
      await this.sendAuditNotifications(auditResult);

      logger.info('Scheduled audit completed', { executionId, scheduleId: schedule.scheduleId });

    } catch (error) {
      auditResult.status = 'failed';
      auditResult.endTime = new Date();
      auditResult.results = { error: error.message };

      logger.error('Scheduled audit failed', {
        executionId,
        scheduleId: schedule.scheduleId,
        error
      });
    }

    // Store result
    await this.storeAuditResult(auditResult);

    this.runningAudits.delete(executionId);
  }

  private async executeAudit(auditType: string, tenantId: string, consciousnessLevel?: string): Promise<any> {
    switch (auditType) {
      case 'comprehensive':
        return await costManagementAuditor.runFullCostAudit(tenantId);
      
      case 'consciousness':
        if (!consciousnessLevel) {
          throw new Error('Consciousness level required for consciousness audit');
        }
        const orchestrator = new ConsciousnessCostOrchestrator({
          level: consciousnessLevel as any,
          optimizationStrategy: 'balanced',
          autonomousDecisionThreshold: 0.8,
          intelligenceMultiplier: 1.5,
          synapticConnections: ['CRM', 'ACCOUNTING', 'INVENTORY'],
          transcendentCapabilities: ['post_human_optimization']
        });
        return await orchestrator.executeConsciousnessCostAnalysis(tenantId);
      
      case 'predictive':
        const predictions = await predictiveCostEngine.generateCostPredictions(tenantId);
        const anomalies = await predictiveCostEngine.detectCostAnomalies(tenantId);
        return { predictions, anomalies };
      
      case 'targeted':
        // Targeted audit focusing on specific areas
        return await costManagementAuditor.runFullCostAudit(tenantId);
      
      default:
        throw new Error(`Unknown audit type: ${auditType}`);
    }
  }

  private async updateScheduleRunTimes(schedule: AuditSchedule) {
    const now = new Date();
    const nextRun = this.calculateNextRun(schedule.frequency, now);
    
    schedule.lastRun = now;
    schedule.nextRun = nextRun;
    schedule.updatedAt = now;

    // Update in memory and database
    this.activeSchedules.set(schedule.scheduleId, schedule);
    await this.updateScheduleInDatabase(schedule.scheduleId, schedule);
  }

  private calculateNextRun(frequency: string, lastRun: Date): Date {
    const next = new Date(lastRun);
    
    switch (frequency) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
    }
    
    return next;
  }

  private async sendAuditNotifications(auditResult: ScheduledAuditResult) {
    const schedule = this.activeSchedules.get(auditResult.scheduleId);
    if (!schedule) return;

    const notifications = schedule.notificationSettings;

    // Email notifications
    if (notifications.email) {
      await this.sendEmailNotification(auditResult);
    }

    // Webhook notifications
    if (notifications.webhook) {
      await this.sendWebhookNotification(auditResult);
    }

    // Dashboard notifications
    if (notifications.dashboard) {
      await this.sendDashboardNotification(auditResult);
    }
  }

  private async sendEmailNotification(auditResult: ScheduledAuditResult) {
    // Email notification implementation
    const notification: NotificationDelivery = {
      type: 'email',
      recipient: 'admin@tenant.com', // Get from tenant settings
      status: 'sent',
      sentAt: new Date()
    };

    auditResult.notifications.push(notification);
    logger.info('Email notification sent', { executionId: auditResult.executionId });
  }

  private async sendWebhookNotification(auditResult: ScheduledAuditResult) {
    // Webhook notification implementation
    const notification: NotificationDelivery = {
      type: 'webhook',
      recipient: 'https://webhook.url', // Get from tenant settings
      status: 'sent',
      sentAt: new Date()
    };

    auditResult.notifications.push(notification);
    logger.info('Webhook notification sent', { executionId: auditResult.executionId });
  }

  private async sendDashboardNotification(auditResult: ScheduledAuditResult) {
    // Dashboard notification implementation
    const notification: NotificationDelivery = {
      type: 'dashboard',
      recipient: 'dashboard',
      status: 'sent',
      sentAt: new Date()
    };

    auditResult.notifications.push(notification);
    logger.info('Dashboard notification sent', { executionId: auditResult.executionId });
  }

  // Database operations
  private async saveScheduleToDatabase(schedule: AuditSchedule) {
    await prisma.aiActivity.create({
      data: {
        tenantId: schedule.tenantId,
        action: 'AUDIT_SCHEDULE_CREATED',
        details: JSON.stringify(schedule)
      }
    });
  }

  private async updateScheduleInDatabase(scheduleId: string, schedule: AuditSchedule) {
    await prisma.aiActivity.create({
      data: {
        tenantId: schedule.tenantId,
        action: 'AUDIT_SCHEDULE_UPDATED',
        details: JSON.stringify({ scheduleId, schedule })
      }
    });
  }

  private async deleteScheduleFromDatabase(scheduleId: string) {
    await prisma.aiActivity.create({
      data: {
        tenantId: 'system',
        action: 'AUDIT_SCHEDULE_DELETED',
        details: JSON.stringify({ scheduleId })
      }
    });
  }

  private async storeAuditResult(result: ScheduledAuditResult) {
    await prisma.aiActivity.create({
      data: {
        tenantId: result.tenantId,
        action: 'SCHEDULED_AUDIT_COMPLETED',
        details: JSON.stringify(result)
      }
    });
  }

  // Helper methods for condition checking
  private async getCurrentCosts(tenantId: string): Promise<number> {
    // Mock implementation
    return 15000;
  }

  private async getRecentAnomalies(tenantId: string): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async getUsageMetrics(tenantId: string): Promise<{ spikeCount: number }> {
    // Mock implementation
    return { spikeCount: 0 };
  }

  private async getConsciousnessEvolution(tenantId: string): Promise<any[]> {
    // Mock implementation
    return [];
  }

  public stopScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    
    this.activeSchedules.clear();
    this.runningAudits.clear();
    
    logger.info('Automated audit scheduler stopped');
  }
}

export const automatedAuditScheduler = new AutomatedAuditScheduler();