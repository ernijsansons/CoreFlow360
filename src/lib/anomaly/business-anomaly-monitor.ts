/**
 * CoreFlow360 - Business Anomaly Monitor
 * High-level business metric monitoring with automated alerting
 */

import {
  AdvancedAnomalyDetector,
  type DataPoint,
  type AnomalyResult,
} from './advanced-anomaly-detector'
import { eventTracker } from '@/lib/events/enhanced-event-tracker'
import { paymentAnalytics } from '@/lib/billing/payment-analytics'

export interface BusinessMetric {
  name: string
  type: 'revenue' | 'users' | 'conversions' | 'engagement' | 'performance' | 'system'
  description: string
  unit: string
  criticalThreshold?: number
  alertChannels: ('email' | 'slack' | 'webhook' | 'dashboard')[]
  businessContext: {
    department: string
    owner: string
    kpi: boolean
    revenueImpact: 'high' | 'medium' | 'low'
  }
}

export interface AlertRule {
  id: string
  metricName: string
  severity: ('low' | 'medium' | 'high' | 'critical')[]
  conditions: {
    consecutiveAnomalies?: number
    anomalyScore?: number
    valueThreshold?: number
  }
  cooldownPeriod: number // minutes
  escalation: {
    immediate: string[]
    after30min: string[]
    after2hours: string[]
  }
}

export interface AnomalyAlert {
  id: string
  timestamp: Date
  metricName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  anomalyResult: AnomalyResult
  businessImpact: string
  recommendedActions: string[]
  alertsSent: string[]
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolved: boolean
  resolvedAt?: Date
  resolution?: string
}

export class BusinessAnomalyMonitor {
  private detector: AdvancedAnomalyDetector
  private metrics: Map<string, BusinessMetric> = new Map()
  private alertRules: Map<string, AlertRule> = new Map()
  private activeAlerts: Map<string, AnomalyAlert> = new Map()
  private lastAlertTime: Map<string, Date> = new Map()

  constructor() {
    this.detector = new AdvancedAnomalyDetector({
      sensitivity: 0.9,
      lookbackPeriod: 30,
      algorithms: ['ensemble'],
      businessContext: {
        industry: 'saas',
        businessModel: 'subscription',
        seasonality: ['weekly', 'monthly'],
      },
    })

    this.initializeBusinessMetrics()
    this.initializeAlertRules()
  }

  /**
   * Initialize core business metrics
   */
  private initializeBusinessMetrics() {
    const coreMetrics: BusinessMetric[] = [
      {
        name: 'daily_revenue',
        type: 'revenue',
        description: 'Daily revenue from all sources',
        unit: 'USD',
        criticalThreshold: 10000,
        alertChannels: ['email', 'slack', 'dashboard'],
        businessContext: {
          department: 'Finance',
          owner: 'CFO',
          kpi: true,
          revenueImpact: 'high',
        },
      },
      {
        name: 'new_subscriptions',
        type: 'conversions',
        description: 'Daily new subscription conversions',
        unit: 'count',
        alertChannels: ['email', 'dashboard'],
        businessContext: {
          department: 'Sales',
          owner: 'VP Sales',
          kpi: true,
          revenueImpact: 'high',
        },
      },
      {
        name: 'churn_rate',
        type: 'users',
        description: 'Daily customer churn rate',
        unit: 'percentage',
        criticalThreshold: 5,
        alertChannels: ['email', 'slack', 'dashboard'],
        businessContext: {
          department: 'Customer Success',
          owner: 'VP Customer Success',
          kpi: true,
          revenueImpact: 'high',
        },
      },
      {
        name: 'active_users',
        type: 'users',
        description: 'Daily active users',
        unit: 'count',
        alertChannels: ['dashboard'],
        businessContext: {
          department: 'Product',
          owner: 'VP Product',
          kpi: true,
          revenueImpact: 'medium',
        },
      },
      {
        name: 'api_response_time',
        type: 'performance',
        description: 'Average API response time',
        unit: 'milliseconds',
        criticalThreshold: 1000,
        alertChannels: ['slack', 'webhook'],
        businessContext: {
          department: 'Engineering',
          owner: 'CTO',
          kpi: false,
          revenueImpact: 'medium',
        },
      },
      {
        name: 'error_rate',
        type: 'system',
        description: 'Application error rate',
        unit: 'percentage',
        criticalThreshold: 1,
        alertChannels: ['slack', 'webhook'],
        businessContext: {
          department: 'Engineering',
          owner: 'CTO',
          kpi: false,
          revenueImpact: 'high',
        },
      },
    ]

    coreMetrics.forEach((metric) => {
      this.metrics.set(metric.name, metric)
    })
  }

  /**
   * Initialize alert rules
   */
  private initializeAlertRules() {
    const rules: AlertRule[] = [
      {
        id: 'revenue_critical',
        metricName: 'daily_revenue',
        severity: ['critical'],
        conditions: {
          consecutiveAnomalies: 1,
          anomalyScore: 0.8,
        },
        cooldownPeriod: 60,
        escalation: {
          immediate: ['cfo@company.com', 'exec-team@company.com'],
          after30min: ['board@company.com'],
          after2hours: [],
        },
      },
      {
        id: 'churn_high',
        metricName: 'churn_rate',
        severity: ['high', 'critical'],
        conditions: {
          consecutiveAnomalies: 2,
          valueThreshold: 5,
        },
        cooldownPeriod: 120,
        escalation: {
          immediate: ['cs-team@company.com'],
          after30min: ['vp-cs@company.com'],
          after2hours: ['exec-team@company.com'],
        },
      },
      {
        id: 'system_performance',
        metricName: 'api_response_time',
        severity: ['critical'],
        conditions: {
          valueThreshold: 1000,
          consecutiveAnomalies: 3,
        },
        cooldownPeriod: 30,
        escalation: {
          immediate: ['dev-team@company.com'],
          after30min: ['cto@company.com'],
          after2hours: [],
        },
      },
    ]

    rules.forEach((rule) => {
      this.alertRules.set(rule.id, rule)
    })
  }

  /**
   * Monitor a data point for anomalies
   */
  async monitorMetric(metricName: string, dataPoints: DataPoint[]): Promise<AnomalyResult[]> {
    const metric = this.metrics.get(metricName)
    if (!metric) {
      throw new Error(`Unknown metric: ${metricName}`)
    }

    // Detect anomalies
    const anomalies = this.detector.detectAnomalies(metricName, dataPoints)

    // Process each anomaly for alerting
    for (const anomaly of anomalies) {
      if (anomaly.isAnomaly) {
        await this.processAnomaly(metricName, anomaly)
      }
    }

    // Track monitoring activity
    await eventTracker.track({
      type: 'metric_monitored',
      category: 'anomaly_detection',
      properties: {
        metricName,
        dataPoints: dataPoints.length,
        anomaliesDetected: anomalies.filter((a) => a.isAnomaly).length,
        maxSeverity: this.getMaxSeverity(anomalies),
      },
    })

    return anomalies
  }

  /**
   * Process an anomaly and trigger alerts if necessary
   */
  private async processAnomaly(metricName: string, anomaly: AnomalyResult): Promise<void> {
    const metric = this.metrics.get(metricName)!

    // Check alert rules
    for (const [ruleId, rule] of this.alertRules) {
      if (rule.metricName !== metricName) continue
      if (!rule.severity.includes(anomaly.severity)) continue

      // Check cooldown period
      const lastAlert = this.lastAlertTime.get(ruleId)
      if (lastAlert && Date.now() - lastAlert.getTime() < rule.cooldownPeriod * 60 * 1000) {
        continue
      }

      // Check conditions
      if (await this.checkRuleConditions(rule, anomaly)) {
        await this.triggerAlert(ruleId, metric, anomaly)
      }
    }
  }

  /**
   * Check if alert rule conditions are met
   */
  private async checkRuleConditions(rule: AlertRule, anomaly: AnomalyResult): Promise<boolean> {
    const { conditions } = rule

    // Check anomaly score threshold
    if (conditions.anomalyScore && anomaly.anomalyScore < conditions.anomalyScore) {
      return false
    }

    // Check value threshold
    if (conditions.valueThreshold && anomaly.value < conditions.valueThreshold) {
      return false
    }

    // Check consecutive anomalies
    if (conditions.consecutiveAnomalies) {
      // This would require tracking historical anomalies - simplified for now
      return true
    }

    return true
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(
    ruleId: string,
    metric: BusinessMetric,
    anomaly: AnomalyResult
  ): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const alert: AnomalyAlert = {
      id: alertId,
      timestamp: new Date(),
      metricName: metric.name,
      severity: anomaly.severity,
      anomalyResult: anomaly,
      businessImpact: this.calculateBusinessImpact(metric, anomaly),
      recommendedActions: [
        ...anomaly.recommendations,
        ...this.getBusinessRecommendations(metric, anomaly),
      ],
      alertsSent: [],
      acknowledged: false,
      resolved: false,
    }

    // Store alert
    this.activeAlerts.set(alertId, alert)
    this.lastAlertTime.set(ruleId, new Date())

    // Send immediate alerts
    const rule = this.alertRules.get(ruleId)!
    await this.sendAlerts(alert, rule.escalation.immediate)

    // Schedule escalation alerts
    if (rule.escalation.after30min.length > 0) {
      setTimeout(() => this.escalateAlert(alertId, rule.escalation.after30min), 30 * 60 * 1000)
    }
    if (rule.escalation.after2hours.length > 0) {
      setTimeout(() => this.escalateAlert(alertId, rule.escalation.after2hours), 2 * 60 * 60 * 1000)
    }

    // Track alert
    await eventTracker.track({
      type: 'anomaly_alert_triggered',
      category: 'alerting',
      properties: {
        alertId,
        metricName: metric.name,
        severity: anomaly.severity,
        anomalyScore: anomaly.anomalyScore,
        businessImpact: alert.businessImpact,
      },
    })
  }

  /**
   * Send alerts through configured channels
   */
  private async sendAlerts(alert: AnomalyAlert, recipients: string[]): Promise<void> {
    const metric = this.metrics.get(alert.metricName)!

    for (const channel of metric.alertChannels) {
      switch (channel) {
        case 'email':
          await this.sendEmailAlert(
            alert,
            recipients.filter((r) => r.includes('@'))
          )
          break
        case 'slack':
          await this.sendSlackAlert(alert)
          break
        case 'webhook':
          await this.sendWebhookAlert(alert)
          break
        case 'dashboard':
          await this.updateDashboardAlert(alert)
          break
      }
    }

    alert.alertsSent = [...alert.alertsSent, ...recipients]
  }

  /**
   * Calculate business impact description
   */
  private calculateBusinessImpact(metric: BusinessMetric, anomaly: AnomalyResult): string {
    const { revenueImpact } = metric.businessContext
    const severity = anomaly.severity

    if (revenueImpact === 'high' && (severity === 'high' || severity === 'critical')) {
      return 'High revenue impact - immediate attention required'
    }

    if (metric.type === 'revenue' && anomaly.value < anomaly.context.historicalAverage * 0.7) {
      return 'Significant revenue decrease detected'
    }

    if (metric.type === 'users' && anomaly.value < anomaly.context.historicalAverage * 0.8) {
      return 'User engagement decline detected'
    }

    if (metric.type === 'system' && severity === 'critical') {
      return 'System performance issue - may affect user experience'
    }

    return `${severity} anomaly in ${metric.description.toLowerCase()}`
  }

  /**
   * Get business-specific recommendations
   */
  private getBusinessRecommendations(metric: BusinessMetric, anomaly: AnomalyResult): string[] {
    const recommendations = []

    if (metric.type === 'revenue' && anomaly.value < anomaly.context.historicalAverage) {
      recommendations.push('Review payment processing and billing systems')
      recommendations.push('Check for customer support issues or complaints')
      recommendations.push('Analyze competitor activity and market conditions')
    }

    if (metric.type === 'users' && anomaly.severity === 'high') {
      recommendations.push('Review recent product changes or deployments')
      recommendations.push('Check user onboarding and engagement flows')
      recommendations.push('Analyze customer feedback and support tickets')
    }

    if (metric.type === 'system') {
      recommendations.push('Check system logs and error rates')
      recommendations.push('Review recent infrastructure changes')
      recommendations.push('Monitor third-party service dependencies')
    }

    return recommendations
  }

  // Alert channel implementations (simplified)
  private async sendEmailAlert(alert: AnomalyAlert, recipients: string[]): Promise<void> {
    // Implementation would integrate with email service
    console.log(`Sending email alert for ${alert.type} with impact: ${alert.businessImpact}`)
  }

  private async sendSlackAlert(alert: AnomalyAlert): Promise<void> {
    // Implementation would integrate with Slack API
    
  }

  private async sendWebhookAlert(alert: AnomalyAlert): Promise<void> {
    // Implementation would send HTTP webhook
    
  }

  private async updateDashboardAlert(alert: AnomalyAlert): Promise<void> {
    // Implementation would update real-time dashboard
    
  }

  private async escalateAlert(alertId: string, recipients: string[]): Promise<void> {
    const alert = this.activeAlerts.get(alertId)
    if (alert && !alert.acknowledged) {
      await this.sendAlerts(alert, recipients)
    }
  }

  private getMaxSeverity(anomalies: AnomalyResult[]): string {
    const severities = anomalies.map((a) => a.severity)
    if (severities.includes('critical')) return 'critical'
    if (severities.includes('high')) return 'high'
    if (severities.includes('medium')) return 'medium'
    return 'low'
  }

  /**
   * Public methods for alert management
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedBy = acknowledgedBy
      alert.acknowledgedAt = new Date()
      return true
    }
    return false
  }

  resolveAlert(alertId: string, resolution: string): boolean {
    const alert = this.activeAlerts.get(alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      alert.resolution = resolution
      return true
    }
    return false
  }

  getActiveAlerts(): AnomalyAlert[] {
    return Array.from(this.activeAlerts.values()).filter((alert) => !alert.resolved)
  }

  getMetrics(): BusinessMetric[] {
    return Array.from(this.metrics.values())
  }
}

export default BusinessAnomalyMonitor
