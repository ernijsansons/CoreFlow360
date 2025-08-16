/**
 * CoreFlow360 - Advanced Anomaly Detection System
 * ML-powered anomaly detection for business metrics, user behavior, and system performance
 */

import { z } from 'zod'

// Anomaly detection schemas
export const AnomalyConfigSchema = z.object({
  sensitivity: z.number().min(0).max(1).default(0.95), // Higher = more sensitive
  lookbackPeriod: z.number().default(30), // Days to look back for training
  minimumDataPoints: z.number().default(10),
  algorithms: z.array(z.enum(['statistical', 'isolation_forest', 'lstm', 'ensemble'])).default(['ensemble']),
  businessContext: z.object({
    industry: z.string().optional(),
    businessModel: z.string().optional(),
    seasonality: z.array(z.string()).default([]), // ['weekly', 'monthly', 'yearly']
    expectedPatterns: z.array(z.string()).default([])
  }).default({})
})

export const DataPointSchema = z.object({
  timestamp: z.date(),
  value: z.number(),
  metadata: z.record(z.any()).optional(),
  dimensions: z.record(z.string()).optional() // For multi-dimensional analysis
})

export const AnomalyResultSchema = z.object({
  timestamp: z.date(),
  value: z.number(),
  isAnomaly: z.boolean(),
  anomalyScore: z.number(), // 0-1, higher = more anomalous
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z.number(),
  algorithm: z.string(),
  explanation: z.string(),
  recommendations: z.array(z.string()),
  context: z.object({
    expectedRange: z.object({
      lower: z.number(),
      upper: z.number()
    }),
    historicalAverage: z.number(),
    trend: z.enum(['increasing', 'decreasing', 'stable']),
    seasonalExpected: z.number().optional()
  })
})

export const AnomalyPatternSchema = z.object({
  type: z.enum([
    'spike', 'dip', 'trend_change', 'missing_data', 'outlier',
    'seasonal_deviation', 'correlation_break', 'distribution_shift'
  ]),
  description: z.string(),
  frequency: z.number(),
  impact: z.enum(['low', 'medium', 'high']),
  businessImplication: z.string()
})

export type AnomalyConfig = z.infer<typeof AnomalyConfigSchema>
export type DataPoint = z.infer<typeof DataPointSchema>
export type AnomalyResult = z.infer<typeof AnomalyResultSchema>
export type AnomalyPattern = z.infer<typeof AnomalyPatternSchema>

// Statistical functions for anomaly detection
class StatisticalAnalyzer {
  // Z-score based detection
  static zScoreDetection(data: number[], threshold: number = 3): boolean[] {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    const stdDev = Math.sqrt(variance)
    
    return data.map(value => Math.abs((value - mean) / stdDev) > threshold)
  }

  // Modified Z-score using median (more robust to outliers)
  static modifiedZScore(data: number[], threshold: number = 3.5): boolean[] {
    const sorted = [...data].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const medianAbsoluteDeviation = sorted.map(val => Math.abs(val - median))
      .sort((a, b) => a - b)[Math.floor(sorted.length / 2)]
    
    return data.map(value => 
      Math.abs(0.6745 * (value - median) / medianAbsoluteDeviation) > threshold
    )
  }

  // Isolation Forest approximation
  static isolationForest(data: number[], contamination: number = 0.1): boolean[] {
    // Simplified implementation - in production, use proper ML library
    const sortedData = [...data].sort((a, b) => a - b)
    const outlierCount = Math.ceil(data.length * contamination)
    const lowerThreshold = sortedData[outlierCount]
    const upperThreshold = sortedData[data.length - outlierCount - 1]
    
    return data.map(value => value < lowerThreshold || value > upperThreshold)
  }

  // Seasonal decomposition
  static seasonalDecomposition(data: number[], period: number): {
    trend: number[]
    seasonal: number[]
    residual: number[]
  } {
    const trend = this.movingAverage(data, period)
    const detrended = data.map((val, i) => val - (trend[i] || val))
    
    // Simple seasonal pattern extraction
    const seasonal = Array(data.length).fill(0)
    for (let i = 0; i < data.length; i++) {
      const seasonalIndex = i % period
      let seasonalSum = 0
      let count = 0
      
      for (let j = seasonalIndex; j < data.length; j += period) {
        seasonalSum += detrended[j] || 0
        count++
      }
      
      seasonal[i] = count > 0 ? seasonalSum / count : 0
    }
    
    const residual = data.map((val, i) => val - (trend[i] || 0) - seasonal[i])
    
    return { trend, seasonal, residual }
  }

  // Moving average
  static movingAverage(data: number[], window: number): number[] {
    return data.map((_, i) => {
      const start = Math.max(0, i - Math.floor(window / 2))
      const end = Math.min(data.length, i + Math.ceil(window / 2))
      const subset = data.slice(start, end)
      return subset.reduce((sum, val) => sum + val, 0) / subset.length
    })
  }

  // EWMA (Exponentially Weighted Moving Average)
  static ewma(data: number[], alpha: number = 0.3): number[] {
    const result = [data[0]]
    for (let i = 1; i < data.length; i++) {
      result[i] = alpha * data[i] + (1 - alpha) * result[i - 1]
    }
    return result
  }
}

export class AdvancedAnomalyDetector {
  private config: AnomalyConfig
  private historicalData: Map<string, DataPoint[]> = new Map()

  constructor(config: Partial<AnomalyConfig> = {}) {
    this.config = AnomalyConfigSchema.parse(config)
  }

  /**
   * Add historical data for training
   */
  addHistoricalData(metricName: string, data: DataPoint[]): void {
    this.historicalData.set(metricName, data)
  }

  /**
   * Detect anomalies in new data points
   */
  detectAnomalies(metricName: string, newData: DataPoint[]): AnomalyResult[] {
    const historical = this.historicalData.get(metricName) || []
    const allData = [...historical, ...newData]
    
    if (allData.length < this.config.minimumDataPoints) {
      return newData.map(point => this.createNormalResult(point))
    }

    const values = allData.map(d => d.value)
    const timestamps = allData.map(d => d.timestamp)
    
    // Run multiple detection algorithms
    const results: AnomalyResult[] = []
    
    for (const point of newData) {
      const pointIndex = allData.findIndex(d => d.timestamp.getTime() === point.timestamp.getTime())
      const historicalValues = values.slice(0, pointIndex)
      
      if (historicalValues.length < this.config.minimumDataPoints) {
        results.push(this.createNormalResult(point))
        continue
      }

      const anomalyResult = this.analyzeDataPoint(
        point,
        historicalValues,
        timestamps.slice(0, pointIndex)
      )
      
      results.push(anomalyResult)
    }

    return results
  }

  /**
   * Analyze a single data point for anomalies
   */
  private analyzeDataPoint(
    point: DataPoint,
    historicalValues: number[],
    historicalTimestamps: Date[]
  ): AnomalyResult {
    const algorithms = this.config.algorithms
    const scores: { algorithm: string; score: number; isAnomaly: boolean }[] = []

    // Statistical detection
    if (algorithms.includes('statistical') || algorithms.includes('ensemble')) {
      const testData = [...historicalValues, point.value]
      const zScoreAnomalies = StatisticalAnalyzer.zScoreDetection(testData)
      const modifiedZAnomalies = StatisticalAnalyzer.modifiedZScore(testData)
      
      const isZScoreAnomaly = zScoreAnomalies[zScoreAnomalies.length - 1]
      const isModifiedZAnomaly = modifiedZAnomalies[modifiedZAnomalies.length - 1]
      
      scores.push({
        algorithm: 'statistical',
        score: isZScoreAnomaly || isModifiedZAnomaly ? 0.8 : 0.2,
        isAnomaly: isZScoreAnomaly || isModifiedZAnomaly
      })
    }

    // Isolation Forest detection
    if (algorithms.includes('isolation_forest') || algorithms.includes('ensemble')) {
      const testData = [...historicalValues, point.value]
      const isolationAnomalies = StatisticalAnalyzer.isolationForest(testData, 0.1)
      const isIsolationAnomaly = isolationAnomalies[isolationAnomalies.length - 1]
      
      scores.push({
        algorithm: 'isolation_forest',
        score: isIsolationAnomaly ? 0.9 : 0.1,
        isAnomaly: isIsolationAnomaly
      })
    }

    // Seasonal pattern detection
    if (this.config.businessContext.seasonality.length > 0) {
      const period = this.getSeasonalPeriod(this.config.businessContext.seasonality[0])
      if (historicalValues.length >= period * 2) {
        const decomposition = StatisticalAnalyzer.seasonalDecomposition(historicalValues, period)
        const expectedSeasonal = decomposition.seasonal[decomposition.seasonal.length - 1]
        const expectedTrend = decomposition.trend[decomposition.trend.length - 1]
        const expected = expectedTrend + expectedSeasonal
        
        const deviation = Math.abs(point.value - expected) / Math.max(Math.abs(expected), 1)
        scores.push({
          algorithm: 'seasonal',
          score: deviation,
          isAnomaly: deviation > 0.5
        })
      }
    }

    // Ensemble scoring
    const finalScore = algorithms.includes('ensemble') && scores.length > 1
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : scores[0]?.score || 0

    const isAnomaly = finalScore > (1 - this.config.sensitivity)
    const severity = this.calculateSeverity(finalScore)
    
    // Calculate context
    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length
    const stdDev = Math.sqrt(variance)
    
    const trend = this.calculateTrend(historicalValues.slice(-Math.min(7, historicalValues.length)))
    
    return {
      timestamp: point.timestamp,
      value: point.value,
      isAnomaly,
      anomalyScore: finalScore,
      severity,
      confidence: this.calculateConfidence(scores, historicalValues.length),
      algorithm: algorithms.includes('ensemble') ? 'ensemble' : algorithms[0],
      explanation: this.generateExplanation(point.value, mean, stdDev, isAnomaly, severity),
      recommendations: this.generateRecommendations(isAnomaly, severity, point.value, mean),
      context: {
        expectedRange: {
          lower: mean - 2 * stdDev,
          upper: mean + 2 * stdDev
        },
        historicalAverage: mean,
        trend
      }
    }
  }

  /**
   * Detect patterns in anomalies
   */
  detectPatterns(anomalies: AnomalyResult[]): AnomalyPattern[] {
    const patterns: AnomalyPattern[] = []
    
    // Spike pattern detection
    const spikes = anomalies.filter(a => a.isAnomaly && a.value > a.context.historicalAverage * 1.5)
    if (spikes.length > 2) {
      patterns.push({
        type: 'spike',
        description: `Detected ${spikes.length} significant spikes in the data`,
        frequency: spikes.length / anomalies.length,
        impact: spikes.some(s => s.severity === 'high' || s.severity === 'critical') ? 'high' : 'medium',
        businessImplication: 'Unexpected increases may indicate system overload, viral content, or errors'
      })
    }

    // Dip pattern detection
    const dips = anomalies.filter(a => a.isAnomaly && a.value < a.context.historicalAverage * 0.5)
    if (dips.length > 2) {
      patterns.push({
        type: 'dip',
        description: `Detected ${dips.length} significant drops in the data`,
        frequency: dips.length / anomalies.length,
        impact: dips.some(d => d.severity === 'high' || d.severity === 'critical') ? 'high' : 'medium',
        businessImplication: 'Unexpected decreases may indicate system issues, market changes, or user churn'
      })
    }

    // Trend change detection
    const recentTrends = anomalies.slice(-10).map(a => a.context.trend)
    const trendChanges = recentTrends.filter((trend, i) => 
      i > 0 && trend !== recentTrends[i - 1]
    ).length
    
    if (trendChanges > 3) {
      patterns.push({
        type: 'trend_change',
        description: 'Frequent trend changes detected in recent data',
        frequency: trendChanges / recentTrends.length,
        impact: 'medium',
        businessImplication: 'Unstable trends may indicate market volatility or system instability'
      })
    }

    return patterns
  }

  /**
   * Generate business insights from anomalies
   */
  generateBusinessInsights(metricName: string, anomalies: AnomalyResult[]): {
    summary: string
    impact: 'low' | 'medium' | 'high' | 'critical'
    actionItems: string[]
    riskAssessment: string
  } {
    const highSeverityAnomalies = anomalies.filter(a => 
      a.severity === 'high' || a.severity === 'critical'
    )
    
    const impact = highSeverityAnomalies.length > anomalies.length * 0.3 ? 'high' :
                   highSeverityAnomalies.length > 0 ? 'medium' : 'low'

    const summary = `Detected ${anomalies.filter(a => a.isAnomaly).length} anomalies in ${metricName} ` +
                   `(${highSeverityAnomalies.length} high severity). ` +
                   `${impact === 'high' ? 'Immediate attention required.' : 'Monitor closely.'}`

    const actionItems = this.generateActionItems(metricName, anomalies, impact)
    const riskAssessment = this.generateRiskAssessment(anomalies, impact)

    return {
      summary,
      impact,
      actionItems,
      riskAssessment
    }
  }

  // Helper methods
  private createNormalResult(point: DataPoint): AnomalyResult {
    return {
      timestamp: point.timestamp,
      value: point.value,
      isAnomaly: false,
      anomalyScore: 0.1,
      severity: 'low',
      confidence: 0.5,
      algorithm: 'insufficient_data',
      explanation: 'Insufficient historical data for anomaly detection',
      recommendations: ['Collect more data for better anomaly detection'],
      context: {
        expectedRange: { lower: point.value * 0.8, upper: point.value * 1.2 },
        historicalAverage: point.value,
        trend: 'stable'
      }
    }
  }

  private calculateSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score > 0.9) return 'critical'
    if (score > 0.7) return 'high'
    if (score > 0.5) return 'medium'
    return 'low'
  }

  private calculateConfidence(scores: any[], dataPoints: number): number {
    const algorithmCount = scores.length
    const dataQuality = Math.min(1, dataPoints / 100) // More data = higher confidence
    const algorithmAgreement = algorithmCount > 1 
      ? 1 - (Math.max(...scores.map(s => s.score)) - Math.min(...scores.map(s => s.score)))
      : 0.7
    
    return (dataQuality + algorithmAgreement) / 2
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 3) return 'stable'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    
    const change = (secondAvg - firstAvg) / firstAvg
    
    if (change > 0.1) return 'increasing'
    if (change < -0.1) return 'decreasing'
    return 'stable'
  }

  private getSeasonalPeriod(seasonality: string): number {
    switch (seasonality) {
      case 'hourly': return 24
      case 'daily': return 7
      case 'weekly': return 4
      case 'monthly': return 12
      default: return 7
    }
  }

  private generateExplanation(
    value: number,
    mean: number,
    stdDev: number,
    isAnomaly: boolean,
    severity: string
  ): string {
    if (!isAnomaly) {
      return `Value ${value.toFixed(2)} is within normal range (mean: ${mean.toFixed(2)})`
    }
    
    const deviations = Math.abs(value - mean) / stdDev
    const direction = value > mean ? 'above' : 'below'
    
    return `Value ${value.toFixed(2)} is ${deviations.toFixed(1)} standard deviations ${direction} ` +
           `the historical average (${mean.toFixed(2)}). Severity: ${severity}.`
  }

  private generateRecommendations(
    isAnomaly: boolean,
    severity: string,
    value: number,
    mean: number
  ): string[] {
    if (!isAnomaly) {
      return ['Continue monitoring normal patterns']
    }

    const recommendations = ['Investigate the root cause of this anomaly']
    
    if (severity === 'critical' || severity === 'high') {
      recommendations.push('Alert relevant stakeholders immediately')
      recommendations.push('Consider implementing emergency response protocols')
    }
    
    if (value > mean * 2) {
      recommendations.push('Check for system overload or unusual traffic patterns')
      recommendations.push('Verify data collection accuracy')
    } else if (value < mean * 0.5) {
      recommendations.push('Check for system downtime or integration failures')
      recommendations.push('Review user engagement and retention metrics')
    }
    
    recommendations.push('Update anomaly detection thresholds if this becomes a new normal')
    
    return recommendations
  }

  private generateActionItems(metricName: string, anomalies: AnomalyResult[], impact: string): string[] {
    const items = []
    
    if (impact === 'high' || impact === 'critical') {
      items.push(`Immediate review of ${metricName} required`)
      items.push('Escalate to relevant team leads')
    }
    
    const patterns = this.detectPatterns(anomalies)
    for (const pattern of patterns) {
      items.push(`Address ${pattern.type} pattern: ${pattern.businessImplication}`)
    }
    
    items.push('Schedule regular review of anomaly detection parameters')
    
    return items
  }

  private generateRiskAssessment(anomalies: AnomalyResult[], impact: string): string {
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length
    const highCount = anomalies.filter(a => a.severity === 'high').length
    
    if (impact === 'critical' || criticalCount > 0) {
      return 'HIGH RISK: Critical anomalies detected. Immediate action required to prevent business impact.'
    }
    
    if (impact === 'high' || highCount > anomalies.length * 0.2) {
      return 'MEDIUM RISK: Significant anomalies present. Monitor closely and prepare contingency plans.'
    }
    
    return 'LOW RISK: Anomalies within acceptable range. Continue standard monitoring procedures.'
  }
}

export default AdvancedAnomalyDetector