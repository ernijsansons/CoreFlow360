/**
 * CoreFlow360 - FinGPT Service Implementation
 * Financial AI service for sentiment, anomaly detection, and forecasting
 */

import { FinGPTService } from '../interfaces/ai-services'
import { SecurityContext } from '@/types/bundles'

export function createFinGPTService(): FinGPTService {
  return {
    async sentimentAnalysis(text: string, context: SecurityContext) {
      // Production implementation would call actual FinGPT API
      // This is a mock implementation for development
      
      const keywords = text.toLowerCase().split(' ')
      const positiveWords = ['growth', 'increase', 'profit', 'success', 'excellent']
      const negativeWords = ['loss', 'decrease', 'decline', 'failure', 'poor']
      
      const positiveCount = keywords.filter(w => positiveWords.includes(w)).length
      const negativeCount = keywords.filter(w => negativeWords.includes(w)).length
      
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
      let score = 0
      
      if (positiveCount > negativeCount) {
        sentiment = 'positive'
        score = Math.min(positiveCount / keywords.length, 1)
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative'
        score = -Math.min(negativeCount / keywords.length, 1)
      }
      
      return {
        sentiment,
        score,
        confidence: 0.85,
        keywords: keywords.slice(0, 5),
        reasoning: `Detected ${positiveCount} positive and ${negativeCount} negative indicators`
      }
    },
    
    async anomalyDetection(data: any[], context: SecurityContext) {
      // Mock anomaly detection
      const anomalies = []
      const mean = data.reduce((sum, val) => sum + val, 0) / data.length
      const stdDev = Math.sqrt(
        data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
      )
      
      data.forEach((value, index) => {
        const zScore = Math.abs((value - mean) / stdDev)
        if (zScore > 2) {
          anomalies.push({
            index,
            severity: zScore > 3 ? 'high' : 'medium',
            type: value > mean ? 'spike' : 'drop',
            confidence: Math.min(zScore / 4, 1),
            explanation: `Value deviates ${zScore.toFixed(1)} standard deviations from mean`
          })
        }
      })
      
      return {
        anomalies,
        overallRisk: anomalies.length / data.length,
        patterns: ['seasonal_variation', 'trend_detected']
      }
    },
    
    async predictiveForecasting(historicalData: any[], horizon: number) {
      // Simple linear regression forecast
      const n = historicalData.length
      const x = Array.from({ length: n }, (_, i) => i)
      const y = historicalData
      
      const xMean = x.reduce((a, b) => a + b) / n
      const yMean = y.reduce((a, b) => a + b) / n
      
      const slope = x.reduce((acc, xi, i) => 
        acc + (xi - xMean) * (y[i] - yMean), 0
      ) / x.reduce((acc, xi) => acc + Math.pow(xi - xMean, 2), 0)
      
      const intercept = yMean - slope * xMean
      
      const predictions = []
      for (let i = 0; i < horizon; i++) {
        const timestamp = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
        const value = intercept + slope * (n + i)
        const confidence = Math.max(0.95 - i * 0.05, 0.5)
        
        predictions.push({
          timestamp,
          value,
          confidence,
          bounds: {
            lower: value * 0.9,
            upper: value * 1.1
          }
        })
      }
      
      return {
        predictions,
        modelAccuracy: 0.85,
        seasonality: true,
        trend: slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable'
      }
    }
  }
}