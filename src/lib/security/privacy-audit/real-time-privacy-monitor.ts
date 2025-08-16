import { EventEmitter } from 'events';
import { z } from 'zod';

export interface PrivacyEvent {
  id: string;
  timestamp: Date;
  tenantId: string;
  userId?: string;
  eventType: 'consent_change' | 'data_access' | 'data_export' | 'data_deletion' | 'consent_violation' | 'policy_update' | 'breach_detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  complianceImpact: 'none' | 'minor' | 'major' | 'critical';
  autoResolved: boolean;
  requiresAction: boolean;
}

export interface PrivacyMetrics {
  consentRate: number; // 0-100%
  violationsCount: number;
  dataSubjectRequests: number;
  responseTimeAvg: number; // hours
  complianceScore: number; // 0-100%
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activeCookies: number;
  dataRetentionCompliance: number; // 0-100%
  thirdPartyDataShares: number;
  lastAuditScore: number;
}

export interface PrivacyAlert {
  id: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  eventIds: string[];
  acknowledged: boolean;
  resolvedAt?: Date;
  assignedTo?: string;
  escalationLevel: number;
  suggestedActions: string[];
}

export interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  eventPattern: string; // Regex pattern for event matching
  threshold: number;
  timeWindow: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'alert' | 'auto_resolve' | 'escalate' | 'block_operation';
  enabled: boolean;
}

export class RealTimePrivacyMonitor extends EventEmitter {
  private events: PrivacyEvent[] = [];
  private alerts: PrivacyAlert[] = [];
  private rules: MonitoringRule[] = [];
  private metrics: PrivacyMetrics;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(private tenantId: string) {
    super();
    this.metrics = this.initializeMetrics();
    this.setupDefaultRules();
    this.startRealTimeMonitoring();
  }

  async trackPrivacyEvent(event: Omit<PrivacyEvent, 'id' | 'timestamp'>): Promise<void> {
    const privacyEvent: PrivacyEvent = {
      ...event,
      id: `pe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.events.push(privacyEvent);
    this.updateMetrics(privacyEvent);
    
    // Check monitoring rules
    await this.evaluateRules(privacyEvent);
    
    // Emit real-time event
    this.emit('privacyEvent', privacyEvent);
    
    // Auto-cleanup old events (keep last 10000)
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }
  }

  async getRealtimeMetrics(): Promise<PrivacyMetrics> {
    // Recalculate metrics from recent events
    const recentEvents = this.getRecentEvents(24); // Last 24 hours
    
    this.metrics.violationsCount = recentEvents.filter(e => 
      e.eventType === 'consent_violation' || e.complianceImpact === 'critical'
    ).length;
    
    this.metrics.dataSubjectRequests = recentEvents.filter(e =>
      ['data_access', 'data_export', 'data_deletion'].includes(e.eventType)
    ).length;

    this.metrics.responseTimeAvg = this.calculateAverageResponseTime(recentEvents);
    this.metrics.complianceScore = this.calculateComplianceScore(recentEvents);
    this.metrics.riskLevel = this.assessCurrentRiskLevel();

    return { ...this.metrics };
  }

  async getActiveAlerts(): Promise<PrivacyAlert[]> {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.assignedTo = userId;
      this.emit('alertAcknowledged', alert);
    }
  }

  async resolveAlert(alertId: string, userId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      alert.assignedTo = userId;
      this.emit('alertResolved', alert);
    }
  }

  async addMonitoringRule(rule: Omit<MonitoringRule, 'id'>): Promise<string> {
    const newRule: MonitoringRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.rules.push(newRule);
    this.emit('ruleAdded', newRule);
    return newRule.id;
  }

  async getConsentViolations(timeWindowHours: number = 24): Promise<PrivacyEvent[]> {
    const cutoff = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    return this.events.filter(event => 
      event.timestamp >= cutoff && 
      (event.eventType === 'consent_violation' || event.complianceImpact === 'critical')
    );
  }

  async getDataFlowActivity(timeWindowHours: number = 1): Promise<{
    dataAccesses: number;
    dataExports: number;
    dataDeletions: number;
    policyUpdates: number;
    suspiciousActivity: PrivacyEvent[];
  }> {
    const cutoff = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    const recentEvents = this.events.filter(event => event.timestamp >= cutoff);

    const suspiciousActivity = recentEvents.filter(event => 
      event.severity === 'critical' || 
      (event.eventType === 'data_access' && event.metadata.accessCount > 100)
    );

    return {
      dataAccesses: recentEvents.filter(e => e.eventType === 'data_access').length,
      dataExports: recentEvents.filter(e => e.eventType === 'data_export').length,
      dataDeletions: recentEvents.filter(e => e.eventType === 'data_deletion').length,
      policyUpdates: recentEvents.filter(e => e.eventType === 'policy_update').length,
      suspiciousActivity
    };
  }

  async generateRealTimeReport(): Promise<{
    summary: PrivacyMetrics;
    recentEvents: PrivacyEvent[];
    activeAlerts: PrivacyAlert[];
    trends: {
      consentTrend: 'improving' | 'declining' | 'stable';
      violationTrend: 'increasing' | 'decreasing' | 'stable';
      responseTrend: 'faster' | 'slower' | 'stable';
    };
    recommendations: string[];
  }> {
    const summary = await this.getRealtimeMetrics();
    const recentEvents = this.getRecentEvents(2); // Last 2 hours
    const activeAlerts = await this.getActiveAlerts();
    const trends = this.calculateTrends();
    const recommendations = this.generateRecommendations(summary, trends);

    return {
      summary,
      recentEvents,
      activeAlerts,
      trends,
      recommendations
    };
  }

  private initializeMetrics(): PrivacyMetrics {
    return {
      consentRate: 85.5,
      violationsCount: 0,
      dataSubjectRequests: 0,
      responseTimeAvg: 0,
      complianceScore: 90,
      riskLevel: 'low',
      activeCookies: 0,
      dataRetentionCompliance: 95,
      thirdPartyDataShares: 0,
      lastAuditScore: 85
    };
  }

  private setupDefaultRules(): void {
    this.rules = [
      {
        id: 'consent_violation_critical',
        name: 'Critical Consent Violations',
        description: 'Detect critical consent violations requiring immediate action',
        eventPattern: 'consent_violation.*critical',
        threshold: 1,
        timeWindow: 5,
        severity: 'critical',
        action: 'alert',
        enabled: true
      },
      {
        id: 'excessive_data_access',
        name: 'Excessive Data Access',
        description: 'Detect unusual data access patterns',
        eventPattern: 'data_access',
        threshold: 50,
        timeWindow: 60,
        severity: 'high',
        action: 'alert',
        enabled: true
      },
      {
        id: 'delayed_response',
        name: 'Delayed Data Subject Response',
        description: 'Alert when data subject requests exceed response time limits',
        eventPattern: 'data_.*_request',
        threshold: 1,
        timeWindow: 43200, // 30 days in minutes
        severity: 'high',
        action: 'escalate',
        enabled: true
      },
      {
        id: 'policy_violation',
        name: 'Privacy Policy Violations',
        description: 'Detect activities that violate privacy policies',
        eventPattern: 'policy_violation',
        threshold: 1,
        timeWindow: 1,
        severity: 'medium',
        action: 'alert',
        enabled: true
      },
      {
        id: 'breach_detection',
        name: 'Data Breach Detection',
        description: 'Immediate alert for potential data breaches',
        eventPattern: 'breach_detection',
        threshold: 1,
        timeWindow: 1,
        severity: 'critical',
        action: 'alert',
        enabled: true
      }
    ];
  }

  private startRealTimeMonitoring(): void {
    // Check for violations every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.performPeriodicChecks();
    }, 30000);
  }

  private async performPeriodicChecks(): Promise<void> {
    // Check for stale data subject requests
    await this.checkStaleRequests();
    
    // Check for unusual activity patterns
    await this.checkActivityPatterns();
    
    // Update compliance metrics
    await this.updateRealTimeCompliance();
  }

  private async checkStaleRequests(): Promise<void> {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const staleRequests = this.events.filter(event =>
      ['data_access', 'data_export', 'data_deletion'].includes(event.eventType) &&
      event.timestamp <= cutoff &&
      !event.autoResolved
    );

    for (const request of staleRequests) {
      await this.createAlert({
        priority: 'high',
        title: 'Stale Data Subject Request',
        message: `Data subject request from ${request.timestamp.toLocaleDateString()} has exceeded 30-day response requirement`,
        eventIds: [request.id],
        suggestedActions: [
          'Process outstanding data subject request immediately',
          'Review data subject request handling procedures',
          'Implement automated response tracking'
        ]
      });
    }
  }

  private async checkActivityPatterns(): Promise<void> {
    const recentEvents = this.getRecentEvents(1); // Last hour
    const dataAccessEvents = recentEvents.filter(e => e.eventType === 'data_access');

    // Check for excessive data access
    if (dataAccessEvents.length > 100) {
      await this.createAlert({
        priority: 'medium',
        title: 'Unusual Data Access Activity',
        message: `${dataAccessEvents.length} data access events detected in the last hour`,
        eventIds: dataAccessEvents.map(e => e.id),
        suggestedActions: [
          'Review data access logs for suspicious activity',
          'Verify legitimate business use cases',
          'Consider implementing additional access controls'
        ]
      });
    }
  }

  private async updateRealTimeCompliance(): Promise<void> {
    const violations = this.getRecentEvents(24).filter(e => 
      e.complianceImpact === 'critical' || e.eventType === 'consent_violation'
    );

    if (violations.length > 5) {
      this.metrics.riskLevel = 'critical';
      this.metrics.complianceScore = Math.max(0, this.metrics.complianceScore - 20);
    } else if (violations.length > 2) {
      this.metrics.riskLevel = 'high';
      this.metrics.complianceScore = Math.max(0, this.metrics.complianceScore - 10);
    }

    this.emit('metricsUpdated', this.metrics);
  }

  private getRecentEvents(hours: number): PrivacyEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.events.filter(event => event.timestamp >= cutoff);
  }

  private updateMetrics(event: PrivacyEvent): void {
    if (event.eventType === 'consent_violation') {
      this.metrics.violationsCount++;
    }
    
    if (['data_access', 'data_export', 'data_deletion'].includes(event.eventType)) {
      this.metrics.dataSubjectRequests++;
    }

    // Update compliance score based on event severity
    if (event.complianceImpact === 'critical') {
      this.metrics.complianceScore = Math.max(0, this.metrics.complianceScore - 5);
    } else if (event.complianceImpact === 'major') {
      this.metrics.complianceScore = Math.max(0, this.metrics.complianceScore - 2);
    }
  }

  private async evaluateRules(event: PrivacyEvent): Promise<void> {
    for (const rule of this.rules.filter(r => r.enabled)) {
      const pattern = new RegExp(rule.eventPattern);
      if (pattern.test(`${event.eventType}_${event.severity}`)) {
        const recentMatches = this.getRecentEvents(rule.timeWindow).filter(e =>
          pattern.test(`${e.eventType}_${e.severity}`)
        );

        if (recentMatches.length >= rule.threshold) {
          await this.handleRuleViolation(rule, recentMatches);
        }
      }
    }
  }

  private async handleRuleViolation(rule: MonitoringRule, events: PrivacyEvent[]): Promise<void> {
    switch (rule.action) {
      case 'alert':
        await this.createAlert({
          priority: rule.severity,
          title: `Rule Violation: ${rule.name}`,
          message: rule.description,
          eventIds: events.map(e => e.id),
          suggestedActions: this.getSuggestedActions(rule, events)
        });
        break;
      
      case 'auto_resolve':
        await this.autoResolveViolation(rule, events);
        break;
      
      case 'escalate':
        await this.escalateAlert(rule, events);
        break;
    }
  }

  private async createAlert(alertData: Omit<PrivacyAlert, 'id' | 'timestamp' | 'acknowledged' | 'escalationLevel'>): Promise<string> {
    const alert: PrivacyAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
      escalationLevel: 0
    };

    this.alerts.push(alert);
    this.emit('alertCreated', alert);
    return alert.id;
  }

  private getSuggestedActions(rule: MonitoringRule, events: PrivacyEvent[]): string[] {
    const baseActions = [
      'Review privacy policies and procedures',
      'Investigate root cause of violations',
      'Implement corrective measures'
    ];

    if (rule.name.includes('Consent')) {
      return [
        'Review consent collection mechanisms',
        'Update consent management system',
        'Retrain staff on consent requirements',
        ...baseActions
      ];
    }

    if (rule.name.includes('Data Access')) {
      return [
        'Review access control policies',
        'Audit user permissions',
        'Implement additional monitoring',
        ...baseActions
      ];
    }

    return baseActions;
  }

  private calculateAverageResponseTime(events: PrivacyEvent[]): number {
    const requestEvents = events.filter(e => 
      ['data_access', 'data_export', 'data_deletion'].includes(e.eventType)
    );

    if (requestEvents.length === 0) return 0;

    // Mock calculation - in real implementation, track request completion times
    return 48; // 48 hours average
  }

  private calculateComplianceScore(events: PrivacyEvent[]): number {
    const violations = events.filter(e => e.complianceImpact !== 'none');
    const criticalViolations = violations.filter(e => e.complianceImpact === 'critical');
    
    let score = 100;
    score -= criticalViolations.length * 10;
    score -= (violations.length - criticalViolations.length) * 3;
    
    return Math.max(0, score);
  }

  private assessCurrentRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const recentViolations = this.getRecentEvents(24).filter(e => 
      e.complianceImpact === 'critical' || e.eventType === 'consent_violation'
    );

    if (recentViolations.length >= 5) return 'critical';
    if (recentViolations.length >= 3) return 'high';
    if (recentViolations.length >= 1) return 'medium';
    return 'low';
  }

  private calculateTrends(): {
    consentTrend: 'improving' | 'declining' | 'stable';
    violationTrend: 'increasing' | 'decreasing' | 'stable';
    responseTrend: 'faster' | 'slower' | 'stable';
  } {
    // Mock trend calculation - in real implementation, compare with historical data
    return {
      consentTrend: 'improving',
      violationTrend: 'decreasing',
      responseTrend: 'faster'
    };
  }

  private generateRecommendations(metrics: PrivacyMetrics, trends: any): string[] {
    const recommendations: string[] = [];

    if (metrics.complianceScore < 80) {
      recommendations.push('URGENT: Address compliance gaps to improve score above 80%');
    }

    if (metrics.violationsCount > 5) {
      recommendations.push('Implement stricter consent controls to reduce violations');
    }

    if (metrics.responseTimeAvg > 72) {
      recommendations.push('Optimize data subject request processing to meet 30-day requirement');
    }

    if (trends.violationTrend === 'increasing') {
      recommendations.push('Review and update privacy training programs');
    }

    return recommendations;
  }

  private async autoResolveViolation(rule: MonitoringRule, events: PrivacyEvent[]): Promise<void> {
    // Mark events as auto-resolved
    events.forEach(event => {
      event.autoResolved = true;
    });

    await this.trackPrivacyEvent({
      tenantId: this.tenantId,
      eventType: 'policy_update',
      severity: 'low',
      description: `Auto-resolved violation for rule: ${rule.name}`,
      metadata: { ruleId: rule.id, resolvedEvents: events.length },
      complianceImpact: 'minor',
      autoResolved: true,
      requiresAction: false
    });
  }

  private async escalateAlert(rule: MonitoringRule, events: PrivacyEvent[]): Promise<void> {
    const alertId = await this.createAlert({
      priority: 'critical',
      title: `ESCALATED: ${rule.name}`,
      message: `Rule violation has been escalated due to severity: ${rule.description}`,
      eventIds: events.map(e => e.id),
      suggestedActions: [
        'IMMEDIATE ACTION REQUIRED',
        'Contact Data Protection Officer',
        'Review incident response procedures',
        ...this.getSuggestedActions(rule, events)
      ]
    });

    // Escalate to higher level
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.escalationLevel = 1;
      this.emit('alertEscalated', alert);
    }
  }

  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.removeAllListeners();
  }
}