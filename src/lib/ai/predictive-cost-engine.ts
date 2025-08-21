import { logger } from '@/lib/logging/logger'
import { prisma } from '@/lib/db'

export interface CostPredictionModel {
  modelId: string
  modelType: 'linear_regression' | 'time_series' | 'INTELLIGENT_network' | 'ensemble'
  accuracy: number
  lastTrained: Date
  features: string[]
  hyperparameters: Record<string, unknown>
}

export interface CostAnomalyPattern {
  patternId: string
  patternType: 'spike' | 'drift' | 'seasonal' | 'cyclical' | 'outlier'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectionAlgorithm: string
  confidenceScore: number
  historicalFrequency: number
  predictiveIndicators: string[]
}

export interface CostPrediction {
  predictionId: string
  tenantId: string
  resourceType: string
  timeHorizon: number // days
  baselineCost: number
  predictedCost: number
  confidenceInterval: {
    lower: number
    upper: number
    confidence: number
  }
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  seasonalFactors: Record<string, number>
  anomalyRisk: number // 0-1 scale
  recommendedActions: string[]
  modelUsed: string
  createdAt: Date
  validUntil: Date
}

export interface CostAnomalyAlert {
  alertId: string
  tenantId: string
  anomalyType: CostAnomalyPattern['patternType']
  severity: CostAnomalyPattern['severity']
  affectedResources: string[]
  detectedAt: Date
  costImpact: number
  probabilityScore: number
  rootCauseHypotheses: string[]
  mitigationStrategies: string[]
  autoRemediationOptions: string[]
  humanInterventionRequired: boolean
  estimatedResolutionTime: number // hours
}

class PredictiveCostEngine {
  private models: Map<string, CostPredictionModel> = new Map()
  private anomalyPatterns: Map<string, CostAnomalyPattern[]> = new Map()
  private activeAlerts: Map<string, CostAnomalyAlert[]> = new Map()

  constructor() {
    this.initializePredictionModels()
    this.loadAnomalyPatterns()
  }

  async generateCostPredictions(
    tenantId: string,
    timeHorizon: number = 30
  ): Promise<CostPrediction[]> {
    logger.info('Generating cost predictions', { tenantId, timeHorizon })

    try {
      // Get historical cost data
      const historicalData = await this.getHistoricalCostData(tenantId)

      // Generate predictions for different resource types
      const resourceTypes = [...new Set(historicalData.map((d) => d.resourceType))]
      const predictions: CostPrediction[] = []

      for (const resourceType of resourceTypes) {
        const resourceData = historicalData.filter((d) => d.resourceType === resourceType)
        const prediction = await this.predictResourceCosts(
          tenantId,
          resourceType,
          resourceData,
          timeHorizon
        )
        predictions.push(prediction)
      }

      // Store predictions
      await this.storePredictions(predictions)

      return predictions
    } catch (error) {
      logger.error('Failed to generate cost predictions', { tenantId, error })
      throw error
    }
  }

  async detectCostAnomalies(tenantId: string): Promise<CostAnomalyAlert[]> {
    logger.info('Running cost anomaly detection', { tenantId })

    try {
      const currentMetrics = await this.getCurrentCostMetrics(tenantId)
      const historicalBaseline = await this.getHistoricalBaseline(tenantId)
      const alerts: CostAnomalyAlert[] = []

      // Run multiple anomaly detection algorithms
      const spikeAnomalies = await this.detectCostSpikes(
        currentMetrics,
        historicalBaseline,
        tenantId
      )
      const driftAnomalies = await this.detectCostDrift(
        currentMetrics,
        historicalBaseline,
        tenantId
      )
      const outliersAnomalies = await this.detectStatisticalOutliers(
        currentMetrics,
        historicalBaseline,
        tenantId
      )
      const patternAnomalies = await this.detectPatternAnomalies(currentMetrics, tenantId)

      alerts.push(...spikeAnomalies, ...driftAnomalies, ...outliersAnomalies, ...patternAnomalies)

      // Filter and prioritize alerts
      const prioritizedAlerts = this.prioritizeAnomalyAlerts(alerts)

      // Store alerts
      await this.storeAnomalyAlerts(prioritizedAlerts)

      // Update active alerts
      this.activeAlerts.set(tenantId, prioritizedAlerts)

      return prioritizedAlerts
    } catch (error) {
      logger.error('Failed to detect cost anomalies', { tenantId, error })
      throw error
    }
  }

  private async predictResourceCosts(
    tenantId: string,
    resourceType: string,
    historicalData: unknown[],
    timeHorizon: number
  ): Promise<CostPrediction> {
    // Select best model for this resource type
    const model = this.selectBestModel(resourceType, historicalData)

    // Prepare features
    const features = this.extractFeatures(historicalData)

    // Generate baseline prediction using time series analysis
    const { baseline, trend, seasonality } = this.analyzeTimeSeries(historicalData)

    // Apply model-specific prediction logic
    const rawPrediction = await this.applyPredictionModel(model, features, timeHorizon)

    // Calculate confidence intervals
    const confidenceInterval = this.calculateConfidenceInterval(rawPrediction, historicalData)

    // Detect trend direction
    const trendDirection = this.determineTrendDirection(trend)

    // Calculate anomaly risk
    const anomalyRisk = this.calculateAnomalyRisk(resourceType, rawPrediction, baseline)

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      rawPrediction,
      baseline,
      trendDirection,
      anomalyRisk
    )

    return {
      predictionId: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      resourceType,
      timeHorizon,
      baselineCost: baseline,
      predictedCost: rawPrediction,
      confidenceInterval,
      trendDirection,
      seasonalFactors: seasonality,
      anomalyRisk,
      recommendedActions: recommendations,
      modelUsed: model.modelId,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + timeHorizon * 24 * 60 * 60 * 1000),
    }
  }

  private async detectCostSpikes(
    currentMetrics: unknown[],
    baseline: unknown[],
    tenantId: string
  ): Promise<CostAnomalyAlert[]> {
    const alerts: CostAnomalyAlert[] = []

    for (const metric of currentMetrics) {
      const baselineMetric = baseline.find((b) => b.resourceType === metric.resourceType)
      if (!baselineMetric) continue

      const spikeThreshold = baselineMetric.average * 2 // 100% increase
      const criticalThreshold = baselineMetric.average * 3 // 200% increase

      if (metric.currentCost > criticalThreshold) {
        alerts.push({
          alertId: `spike_critical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          anomalyType: 'spike',
          severity: 'critical',
          affectedResources: [metric.resourceId],
          detectedAt: new Date(),
          costImpact: metric.currentCost - baselineMetric.average,
          probabilityScore: 0.95,
          rootCauseHypotheses: [
            'Unexpected traffic surge',
            'Resource misconfiguration',
            'Scaling policy malfunction',
            'External service dependency spike',
          ],
          mitigationStrategies: [
            'Immediate resource scaling review',
            'Implement emergency cost controls',
            'Review recent configuration changes',
            'Activate cost capping mechanisms',
          ],
          autoRemediationOptions: [
            'Auto-scale down non-critical resources',
            'Implement temporary cost limits',
            'Redirect traffic to cost-optimized endpoints',
          ],
          humanInterventionRequired: true,
          estimatedResolutionTime: 2,
        })
      } else if (metric.currentCost > spikeThreshold) {
        alerts.push({
          alertId: `spike_high_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          anomalyType: 'spike',
          severity: 'high',
          affectedResources: [metric.resourceId],
          detectedAt: new Date(),
          costImpact: metric.currentCost - baselineMetric.average,
          probabilityScore: 0.85,
          rootCauseHypotheses: [
            'Increased usage patterns',
            'Seasonal demand variation',
            'New feature rollout impact',
          ],
          mitigationStrategies: [
            'Monitor cost trends closely',
            'Review scaling policies',
            'Implement cost alerting',
          ],
          autoRemediationOptions: ['Optimize resource allocation', 'Implement usage-based scaling'],
          humanInterventionRequired: false,
          estimatedResolutionTime: 4,
        })
      }
    }

    return alerts
  }

  private async detectCostDrift(
    currentMetrics: unknown[],
    baseline: unknown[],
    tenantId: string
  ): Promise<CostAnomalyAlert[]> {
    const alerts: CostAnomalyAlert[] = []

    // Analyze gradual cost increases over time
    for (const metric of currentMetrics) {
      const driftRate = this.calculateDriftRate(metric, baseline)

      if (driftRate > 0.05) {
        // 5% monthly drift
        const severity = driftRate > 0.15 ? 'high' : driftRate > 0.1 ? 'medium' : 'low'

        alerts.push({
          alertId: `drift_${severity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          anomalyType: 'drift',
          severity: severity as unknown,
          affectedResources: [metric.resourceId],
          detectedAt: new Date(),
          costImpact: metric.currentCost * driftRate * 12, // Annual impact
          probabilityScore: 0.75,
          rootCauseHypotheses: [
            'Gradual usage growth',
            'Inefficient resource utilization',
            'Lack of cost optimization',
            'Price inflation from providers',
          ],
          mitigationStrategies: [
            'Implement regular cost reviews',
            'Optimize resource efficiency',
            'Negotiate better pricing',
            'Implement cost governance',
          ],
          autoRemediationOptions: [
            'Schedule efficiency reviews',
            'Implement automated optimization',
          ],
          humanInterventionRequired: severity === 'high',
          estimatedResolutionTime: severity === 'high' ? 8 : 24,
        })
      }
    }

    return alerts
  }

  private async detectStatisticalOutliers(
    currentMetrics: unknown[],
    baseline: unknown[],
    tenantId: string
  ): Promise<CostAnomalyAlert[]> {
    const alerts: CostAnomalyAlert[] = []

    for (const metric of currentMetrics) {
      const baselineStats = this.calculateStatistics(baseline, metric.resourceType)
      const zScore = Math.abs((metric.currentCost - baselineStats.mean) / baselineStats.stdDev)

      if (zScore > 3) {
        // 3 standard deviations
        alerts.push({
          alertId: `outlier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          anomalyType: 'outlier',
          severity: zScore > 5 ? 'critical' : 'high',
          affectedResources: [metric.resourceId],
          detectedAt: new Date(),
          costImpact: metric.currentCost - baselineStats.mean,
          probabilityScore: Math.min(0.95, zScore / 5),
          rootCauseHypotheses: [
            'Unusual usage pattern',
            'Data processing anomaly',
            'Configuration error',
            'External system impact',
          ],
          mitigationStrategies: [
            'Investigate root cause',
            'Review recent changes',
            'Validate configurations',
            'Monitor trends',
          ],
          autoRemediationOptions: ['Revert recent changes', 'Apply standard configurations'],
          humanInterventionRequired: true,
          estimatedResolutionTime: 6,
        })
      }
    }

    return alerts
  }

  private async detectPatternAnomalies(
    currentMetrics: unknown[],
    tenantId: string
  ): Promise<CostAnomalyAlert[]> {
    const alerts: CostAnomalyAlert[] = []
    const patterns = this.anomalyPatterns.get(tenantId) || []

    for (const pattern of patterns) {
      const matchingMetrics = currentMetrics.filter((m) => this.matchesPattern(m, pattern))

      if (matchingMetrics.length > 0) {
        alerts.push({
          alertId: `pattern_${pattern.patternId}_${Date.now()}`,
          tenantId,
          anomalyType: pattern.patternType,
          severity: pattern.severity,
          affectedResources: matchingMetrics.map((m) => m.resourceId),
          detectedAt: new Date(),
          costImpact: matchingMetrics.reduce((sum, m) => sum + m.currentCost, 0) * 0.1,
          probabilityScore: pattern.confidenceScore,
          rootCauseHypotheses: [pattern.description],
          mitigationStrategies: pattern.predictiveIndicators,
          autoRemediationOptions: ['Apply pattern-specific optimization'],
          humanInterventionRequired: pattern.severity === 'critical',
          estimatedResolutionTime: pattern.severity === 'critical' ? 4 : 12,
        })
      }
    }

    return alerts
  }

  private initializePredictionModels() {
    this.models.set('linear_regression', {
      modelId: 'linear_regression',
      modelType: 'linear_regression',
      accuracy: 0.78,
      lastTrained: new Date(),
      features: ['historical_cost', 'trend', 'seasonality', 'usage_metrics'],
      hyperparameters: { regularization: 0.01 },
    })

    this.models.set('time_series', {
      modelId: 'time_series',
      modelType: 'time_series',
      accuracy: 0.82,
      lastTrained: new Date(),
      features: ['seasonal_decomposition', 'trend_analysis', 'cyclic_patterns'],
      hyperparameters: { lookback_window: 30, forecast_horizon: 7 },
    })

    this.models.set('ensemble', {
      modelId: 'ensemble',
      modelType: 'ensemble',
      accuracy: 0.86,
      lastTrained: new Date(),
      features: ['combined_features'],
      hyperparameters: { models: ['linear_regression', 'time_series'], weights: [0.4, 0.6] },
    })
  }

  private loadAnomalyPatterns() {
    // Load known anomaly patterns
    const commonPatterns: CostAnomalyPattern[] = [
      {
        patternId: 'weekend_spike',
        patternType: 'spike',
        severity: 'medium',
        description: 'Unusual cost spike during weekend hours',
        detectionAlgorithm: 'time_based_threshold',
        confidenceScore: 0.8,
        historicalFrequency: 0.02,
        predictiveIndicators: ['weekend_hours', 'batch_processing', 'scheduled_tasks'],
      },
      {
        patternId: 'month_end_surge',
        patternType: 'cyclical',
        severity: 'low',
        description: 'Month-end processing cost surge',
        detectionAlgorithm: 'calendar_pattern',
        confidenceScore: 0.9,
        historicalFrequency: 0.95,
        predictiveIndicators: ['last_week_of_month', 'reporting_workloads'],
      },
    ]

    this.anomalyPatterns.set('default', commonPatterns)
  }

  private selectBestModel(resourceType: string, historicalData: unknown[]): CostPredictionModel {
    // Select model based on data characteristics and historical accuracy
    if (historicalData.length > 90) {
      return this.models.get('ensemble')!
    } else if (historicalData.length > 30) {
      return this.models.get('time_series')!
    }
    return this.models.get('linear_regression')!
  }

  private extractFeatures(historicalData: unknown[]): unknown {
    return {
      averageCost: historicalData.reduce((sum, d) => sum + d.cost, 0) / historicalData.length,
      trendSlope: this.calculateTrendSlope(historicalData),
      volatility: this.calculateVolatility(historicalData),
      seasonalityStrength: this.calculateSeasonality(historicalData),
    }
  }

  private analyzeTimeSeries(historicalData: unknown[]): {
    baseline: number
    trend: number
    seasonality: Record<string, number>
  } {
    const costs = historicalData.map((d) => d.cost)
    const baseline = costs.reduce((sum, cost) => sum + cost, 0) / costs.length
    const trend = this.calculateTrendSlope(historicalData)
    const seasonality = this.extractSeasonalFactors(historicalData)

    return { baseline, trend, seasonality }
  }

  private async applyPredictionModel(
    model: CostPredictionModel,
    features: unknown,
    timeHorizon: number
  ): Promise<number> {
    // Apply the selected model's prediction logic
    switch (model.modelType) {
      case 'linear_regression':
        return features.averageCost * (1 + (features.trendSlope * timeHorizon) / 30)
      case 'time_series':
        return (
          features.averageCost *
          (1 + (features.trendSlope * timeHorizon) / 30) *
          (1 + features.seasonalityStrength)
        )
      case 'ensemble':
        const linear = features.averageCost * (1 + (features.trendSlope * timeHorizon) / 30)
        const timeSeries =
          features.averageCost *
          (1 + (features.trendSlope * timeHorizon) / 30) *
          (1 + features.seasonalityStrength)
        return linear * 0.4 + timeSeries * 0.6
      default:
        return features.averageCost
    }
  }

  private calculateConfidenceInterval(
    prediction: number,
    historicalData: unknown[]
  ): {
    lower: number
    upper: number
    confidence: number
  } {
    const variance = this.calculateVolatility(historicalData)
    const margin = prediction * variance * 1.96 // 95% confidence interval

    return {
      lower: Math.max(0, prediction - margin),
      upper: prediction + margin,
      confidence: 0.95,
    }
  }

  private determineTrendDirection(
    trend: number
  ): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (Math.abs(trend) < 0.02) return 'stable'
    if (trend > 0.1) return 'volatile'
    return trend > 0 ? 'increasing' : 'decreasing'
  }

  private calculateAnomalyRisk(resourceType: string, prediction: number, baseline: number): number {
    const deviation = Math.abs(prediction - baseline) / baseline
    return Math.min(1, deviation * 2)
  }

  private generateRecommendations(
    prediction: number,
    baseline: number,
    trend: string,
    anomalyRisk: number
  ): string[] {
    const recommendations: string[] = []

    if (prediction > baseline * 1.2) {
      recommendations.push('Consider implementing cost controls')
      recommendations.push('Review resource scaling policies')
    }

    if (trend === 'increasing') {
      recommendations.push('Monitor cost trends closely')
      recommendations.push('Optimize resource utilization')
    }

    if (anomalyRisk > 0.7) {
      recommendations.push('Implement anomaly detection alerts')
      recommendations.push('Review recent configuration changes')
    }

    return recommendations
  }

  private prioritizeAnomalyAlerts(alerts: CostAnomalyAlert[]): CostAnomalyAlert[] {
    return alerts.sort((a, b) => {
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 }
      const aScore = severityWeight[a.severity] * a.probabilityScore * a.costImpact
      const bScore = severityWeight[b.severity] * b.probabilityScore * b.costImpact
      return bScore - aScore
    })
  }

  // Helper methods for statistical calculations
  private calculateTrendSlope(data: unknown[]): number {
    if (data.length < 2) return 0
    const n = data.length
    const sumX = data.reduce((sum, _, i) => sum + i, 0)
    const sumY = data.reduce((sum, d) => sum + d.cost, 0)
    const sumXY = data.reduce((sum, d, i) => sum + i * d.cost, 0)
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0)

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  }

  private calculateVolatility(data: unknown[]): number {
    const costs = data.map((d) => d.cost)
    const mean = costs.reduce((sum, cost) => sum + cost, 0) / costs.length
    const variance = costs.reduce((sum, cost) => sum + Math.pow(cost - mean, 2), 0) / costs.length
    return Math.sqrt(variance) / mean
  }

  private calculateSeasonality(_data: unknown[]): number {
    // Simplified seasonality calculation
    return Math.random() * 0.1 // Mock implementation
  }

  private extractSeasonalFactors(_data: unknown[]): Record<string, number> {
    // Extract seasonal patterns by day of week, month, etc.
    return {
      monday: 1.05,
      friday: 0.95,
      weekend: 0.8,
    }
  }

  private calculateDriftRate(metric: unknown, baseline: unknown[]): number {
    const baselineMetric = baseline.find((b) => b.resourceType === metric.resourceType)
    if (!baselineMetric) return 0

    return (metric.currentCost - baselineMetric.average) / baselineMetric.average
  }

  private calculateStatistics(
    data: unknown[],
    resourceType: string
  ): { mean: number; stdDev: number } {
    const values = data.filter((d) => d.resourceType === resourceType).map((d) => d.cost)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length

    return { mean, stdDev: Math.sqrt(variance) }
  }

  private matchesPattern(metric: unknown, pattern: CostAnomalyPattern): boolean {
    // Simplified pattern matching logic
    return Math.random() < pattern.confidenceScore
  }

  private async getHistoricalCostData(_tenantId: string): Promise<unknown[]> {
    // Mock historical data - in production, query actual cost data
    return Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      resourceType: ['compute', 'storage', 'database'][i % 3],
      cost: 100 + Math.sin(i / 7) * 20 + Math.random() * 10,
    }))
  }

  private async getCurrentCostMetrics(_tenantId: string): Promise<unknown[]> {
    // Mock current metrics
    return [
      { resourceId: 'compute-1', resourceType: 'compute', currentCost: 125 },
      { resourceId: 'storage-1', resourceType: 'storage', currentCost: 85 },
      { resourceId: 'database-1', resourceType: 'database', currentCost: 200 },
    ]
  }

  private async getHistoricalBaseline(_tenantId: string): Promise<unknown[]> {
    // Mock baseline data
    return [
      { resourceType: 'compute', average: 100, min: 80, max: 120 },
      { resourceType: 'storage', average: 75, min: 60, max: 90 },
      { resourceType: 'database', average: 150, min: 130, max: 170 },
    ]
  }

  private async storePredictions(predictions: CostPrediction[]): Promise<void> {
    // Store predictions in database
    for (const prediction of predictions) {
      await prisma.aiActivity.create({
        data: {
          tenantId: prediction.tenantId,
          action: 'COST_PREDICTION_GENERATED',
          details: JSON.stringify(prediction),
        },
      })
    }
  }

  private async storeAnomalyAlerts(alerts: CostAnomalyAlert[]): Promise<void> {
    // Store alerts in database
    for (const alert of alerts) {
      await prisma.aiActivity.create({
        data: {
          tenantId: alert.tenantId,
          action: 'COST_ANOMALY_DETECTED',
          details: JSON.stringify(alert),
        },
      })
    }
  }
}

export const predictiveCostEngine = new PredictiveCostEngine()
