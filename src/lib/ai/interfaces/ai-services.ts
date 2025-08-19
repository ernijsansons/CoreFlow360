/**
 * CoreFlow360 - AI Service Interfaces
 * Defines interfaces for external AI services
 */

import { SecurityContext } from '@/types/bundles'

// ============================================================================
// FINGPT SERVICE INTERFACE
// ============================================================================

export interface FinGPTService {
  sentimentAnalysis(
    text: string,
    context: SecurityContext
  ): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    score: number
    confidence: number
    keywords: string[]
    reasoning: string
  }>

  anomalyDetection(
    data: unknown[],
    context: SecurityContext
  ): Promise<{
    anomalies: Array<{
      index: number
      severity: 'low' | 'medium' | 'high'
      type: string
      confidence: number
      explanation: string
    }>
    overallRisk: number
    patterns: string[]
  }>

  predictiveForecasting(
    historicalData: unknown[],
    horizon: number
  ): Promise<{
    predictions: Array<{
      timestamp: Date
      value: number
      confidence: number
      bounds: { lower: number; upper: number }
    }>
    modelAccuracy: number
    seasonality: boolean
    trend: 'up' | 'down' | 'stable'
  }>
}

// ============================================================================
// FINROBOT SERVICE INTERFACE
// ============================================================================

export interface FinRobotService {
  portfolioOptimization(
    assets: unknown[],
    constraints: unknown
  ): Promise<{
    optimalWeights: Record<string, number>
    expectedReturn: number
    risk: number
    sharpeRatio: number
    diversificationScore: number
  }>

  marketAnalysis(
    ticker: string,
    timeframe: string
  ): Promise<{
    technicalIndicators: Record<string, number>
    signals: Array<{ type: string; strength: number; reason: string }>
    recommendation: 'buy' | 'sell' | 'hold'
    confidence: number
  }>

  tradingStrategy(
    portfolio: unknown,
    marketData: unknown
  ): Promise<{
    actions: Array<{
      type: 'buy' | 'sell' | 'hold'
      ticker: string
      quantity: number
      reason: string
      expectedImpact: number
    }>
    riskAssessment: number
  }>
}

// ============================================================================
// IDURAR SERVICE INTERFACE
// ============================================================================

export interface IDURARService {
  customerIntelligence(customerId: string): Promise<{
    profile: {
      segment: string
      lifetime_value: number
      churn_risk: number
      engagement_score: number
    }
    recommendations: string[]
    nextBestActions: Array<{ action: string; priority: number; expectedValue: number }>
  }>

  inventoryPrediction(
    productId: string,
    horizon: number
  ): Promise<{
    demandForecast: Array<{ date: Date; quantity: number; confidence: number }>
    optimalStockLevel: number
    reorderPoint: number
    safetyStock: number
  }>

  supplyChainOptimization(network: unknown): Promise<{
    optimizedRoutes: unknown[]
    costSavings: number
    timeReduction: number
    bottlenecks: Array<{ location: string; severity: number; solution: string }>
  }>
}

// ============================================================================
// ERPNEXT SERVICE INTERFACE
// ============================================================================

export interface ERPNextService {
  processAutomation(
    workflow: string,
    data: unknown
  ): Promise<{
    automatedSteps: string[]
    manualInterventions: string[]
    estimatedTimeSaved: number
    confidence: number
  }>

  documentAnalysis(document: unknown): Promise<{
    extractedData: Record<string, unknown>
    documentType: string
    confidence: number
    validationIssues: string[]
  }>

  complianceCheck(
    entity: string,
    regulations: string[]
  ): Promise<{
    complianceStatus: 'compliant' | 'non_compliant' | 'partial'
    violations: Array<{ regulation: string; issue: string; severity: number }>
    recommendations: string[]
    requiredActions: Array<{ action: string; deadline: Date }>
  }>
}

// ============================================================================
// DOLIBARR SERVICE INTERFACE
// ============================================================================

export interface DolibarrService {
  contractAnalysis(contract: unknown): Promise<{
    keyTerms: Record<string, unknown>
    risks: Array<{ type: string; severity: number; mitigation: string }>
    opportunities: string[]
    renewalProbability: number
  }>

  priceOptimization(
    product: unknown,
    market: unknown
  ): Promise<{
    optimalPrice: number
    elasticity: number
    competitorComparison: Record<string, number>
    expectedRevenue: number
  }>

  leadScoring(lead: unknown): Promise<{
    score: number
    conversionProbability: number
    recommendedActions: string[]
    estimatedValue: number
  }>
}

// ============================================================================
// UNIFIED AI SERVICE INTERFACE
// ============================================================================

export interface UnifiedAIService {
  fingpt: FinGPTService
  finrobot: FinRobotService
  idurar: IDURARService
  erpnext: ERPNextService
  dolibarr: DolibarrService
}
