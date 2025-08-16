/**
 * CoreFlow360 - FinGPT Service Wrapper
 * Interface to FinGPT financial AI capabilities
 */

import { z } from 'zod'
import { ExternalResource } from '@/types/bundles'
import { serviceManager } from './service-manager'

// FinGPT API Types
export interface FinancialSentimentRequest {
  text: string
  context?: string
  language?: string
  includeConfidence?: boolean
}

export interface FinancialSentimentResponse {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  aspects: {
    aspect: string
    sentiment: string
    confidence: number
  }[]
  keywords: string[]
  summary?: string
}

export interface AnomalyDetectionRequest {
  data: {
    timestamp: string
    value: number
    metadata?: Record<string, any>
  }[]
  threshold?: number
  lookbackPeriod?: number
  includeExplanation?: boolean
}

export interface AnomalyDetectionResponse {
  anomalies: {
    timestamp: string
    value: number
    severity: 'low' | 'medium' | 'high' | 'critical'
    explanation?: string
    relatedFactors?: string[]
  }[]
  confidence: number
  baselineStats: {
    mean: number
    stdDev: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
}

export interface FinancialForecastRequest {
  historicalData: {
    timestamp: string
    value: number
    category?: string
  }[]
  forecastPeriods: number
  confidenceLevel?: number
  includeSeasonality?: boolean
  externalFactors?: Record<string, any>
}

export interface FinancialForecastResponse {
  forecast: {
    timestamp: string
    predicted: number
    lower: number
    upper: number
    confidence: number
  }[]
  model: {
    type: string
    accuracy: number
    parameters: Record<string, any>
  }
  insights: string[]
}

export class FinGPTWrapper {
  private static instance: FinGPTWrapper
  
  private constructor() {}
  
  static getInstance(): FinGPTWrapper {
    if (!FinGPTWrapper.instance) {
      FinGPTWrapper.instance = new FinGPTWrapper()
    }
    return FinGPTWrapper.instance
  }
  
  /**
   * Analyze financial sentiment
   */
  async analyzeSentiment(
    request: FinancialSentimentRequest,
    tenantId: string
  ): Promise<FinancialSentimentResponse> {
    const response = await serviceManager.callService<FinancialSentimentResponse>(
      ExternalResource.FINGPT,
      '/sentiment',
      'POST',
      request,
      tenantId
    )
    
    // Validate response
    const schema = z.object({
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      confidence: z.number().min(0).max(1),
      aspects: z.array(z.object({
        aspect: z.string(),
        sentiment: z.string(),
        confidence: z.number()
      })),
      keywords: z.array(z.string()),
      summary: z.string().optional()
    })
    
    return schema.parse(response)
  }
  
  /**
   * Detect anomalies in financial data
   */
  async detectAnomalies(
    request: AnomalyDetectionRequest,
    tenantId: string
  ): Promise<AnomalyDetectionResponse> {
    // Validate input data
    if (request.data.length < 10) {
      throw new Error('Insufficient data for anomaly detection (minimum 10 points)')
    }
    
    const response = await serviceManager.callService<AnomalyDetectionResponse>(
      ExternalResource.FINGPT,
      '/anomaly',
      'POST',
      request,
      tenantId
    )
    
    // Validate response
    const schema = z.object({
      anomalies: z.array(z.object({
        timestamp: z.string(),
        value: z.number(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        explanation: z.string().optional(),
        relatedFactors: z.array(z.string()).optional()
      })),
      confidence: z.number().min(0).max(1),
      baselineStats: z.object({
        mean: z.number(),
        stdDev: z.number(),
        trend: z.enum(['increasing', 'decreasing', 'stable'])
      })
    })
    
    return schema.parse(response)
  }
  
  /**
   * Generate financial forecast
   */
  async generateForecast(
    request: FinancialForecastRequest,
    tenantId: string
  ): Promise<FinancialForecastResponse> {
    // Validate input data
    if (request.historicalData.length < 30) {
      throw new Error('Insufficient historical data for forecasting (minimum 30 points)')
    }
    
    if (request.forecastPeriods > 365) {
      throw new Error('Forecast period too long (maximum 365 periods)')
    }
    
    const response = await serviceManager.callService<FinancialForecastResponse>(
      ExternalResource.FINGPT,
      '/forecast',
      'POST',
      request,
      tenantId
    )
    
    // Validate response
    const schema = z.object({
      forecast: z.array(z.object({
        timestamp: z.string(),
        predicted: z.number(),
        lower: z.number(),
        upper: z.number(),
        confidence: z.number().min(0).max(1)
      })),
      model: z.object({
        type: z.string(),
        accuracy: z.number().min(0).max(1),
        parameters: z.record(z.any())
      }),
      insights: z.array(z.string())
    })
    
    return schema.parse(response)
  }
  
  /**
   * Batch analyze multiple documents
   */
  async batchAnalyze(
    documents: { id: string; content: string }[],
    analysisType: 'sentiment' | 'risk' | 'compliance',
    tenantId: string
  ): Promise<Record<string, any>> {
    const batchSize = 10
    const results: Record<string, any> = {}
    
    // Process in batches to avoid overwhelming the service
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      
      const batchResults = await Promise.all(
        batch.map(async (doc) => {
          try {
            let result
            
            switch (analysisType) {
              case 'sentiment':
                result = await this.analyzeSentiment({
                  text: doc.content,
                  includeConfidence: true
                }, tenantId)
                break
              
              case 'risk':
                result = await serviceManager.callService(
                  ExternalResource.FINGPT,
                  '/risk-assessment',
                  'POST',
                  { text: doc.content },
                  tenantId
                )
                break
              
              case 'compliance':
                result = await serviceManager.callService(
                  ExternalResource.FINGPT,
                  '/compliance-check',
                  'POST',
                  { text: doc.content },
                  tenantId
                )
                break
            }
            
            return { id: doc.id, result, success: true }
          } catch (error) {
            return { 
              id: doc.id, 
              error: error instanceof Error ? error.message : 'Unknown error',
              success: false 
            }
          }
        })
      )
      
      // Aggregate results
      batchResults.forEach(({ id, result, error, success }) => {
        results[id] = success ? result : { error }
      })
      
      // Rate limiting delay between batches
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return results
  }
  
  /**
   * Get real-time market insights
   */
  async getMarketInsights(
    symbols: string[],
    tenantId: string
  ): Promise<{
    symbol: string
    sentiment: string
    momentum: number
    risks: string[]
    opportunities: string[]
  }[]> {
    const response = await serviceManager.callService(
      ExternalResource.FINGPT,
      '/market-insights',
      'POST',
      { symbols, realtime: true },
      tenantId
    )
    
    return response
  }
  
  /**
   * Analyze financial document (PDF, Excel, etc.)
   */
  async analyzeDocument(
    documentUrl: string,
    documentType: 'financial_statement' | 'contract' | 'report',
    tenantId: string
  ): Promise<{
    summary: string
    keyMetrics: Record<string, number>
    risks: string[]
    recommendations: string[]
  }> {
    const response = await serviceManager.callService(
      ExternalResource.FINGPT,
      '/document-analysis',
      'POST',
      { 
        documentUrl, 
        documentType,
        extractTables: true,
        generateSummary: true
      },
      tenantId
    )
    
    return response
  }
}

export const fingptWrapper = FinGPTWrapper.getInstance()