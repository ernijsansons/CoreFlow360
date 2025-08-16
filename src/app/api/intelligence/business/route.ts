import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import BusinessIntelligenceEngine from '@/lib/intelligence/BusinessIntelligenceEngine'
import AIOrchestrator from '@/lib/ai/AIOrchestrator'
import PerformanceOrchestrator from '@/lib/performance/PerformanceOrchestrator'
import ObservabilityOrchestrator from '@/lib/observability/ObservabilityOrchestrator'
import { z } from 'zod'

const metricSchema = z.object({
  name: z.string(),
  category: z.enum(['revenue', 'costs', 'efficiency', 'growth', 'risk', 'satisfaction', 'performance']),
  value: z.number(),
  unit: z.string(),
  timestamp: z.string().transform(str => new Date(str)).optional(),
  dimensions: z.record(z.string()).default({}),
  metadata: z.object({
    source: z.string(),
    calculation: z.string(),
    quality: z.enum(['high', 'medium', 'low']).default('high'),
    confidence: z.number().min(0).max(1).default(0.9)
  }),
  targets: z.object({
    current: z.number(),
    target: z.number(),
    threshold: z.number()
  }).optional()
})

const forecastRequestSchema = z.object({
  metricId: z.string(),
  horizon: z.number().min(1).max(365).default(30),
  includeScenarios: z.boolean().default(true),
  confidenceLevel: z.number().min(0.5).max(0.99).default(0.95)
})

const dashboardQuerySchema = z.object({
  tenantId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categories: z.array(z.string()).optional(),
  includeForecasts: z.boolean().default(true),
  includeInsights: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true)
})

const actionSchema = z.object({
  action: z.enum(['record', 'forecast', 'insights', 'export', 'simulate']),
  data: z.any().optional()
})

// Global business intelligence engine
let businessEngine: BusinessIntelligenceEngine | null = null

function getBusinessEngine(): BusinessIntelligenceEngine {
  if (!businessEngine) {
    // Get or create orchestrators
    const aiOrchestrator = new AIOrchestrator({
      models: {
        primary: 'gpt-4',
        reasoning: 'gpt-4',
        analysis: 'gpt-4',
        prediction: 'gpt-4',
        classification: 'gpt-4'
      },
      providers: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY || '',
          organization: process.env.OPENAI_ORGANIZATION
        }
      },
      capabilities: {
        enablePredictiveAnalytics: true,
        enableCustomModels: true,
        enableMultiModalProcessing: true,
        enableRealtimeInference: true,
        enableModelFinetuning: true
      },
      performance: {
        maxConcurrentRequests: 10,
        requestTimeout: 30000,
        cacheEnabled: true,
        cacheTTL: 3600,
        enableGPUAcceleration: false
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    })

    const performanceOrchestrator = new PerformanceOrchestrator({
      enableQueryOptimization: true,
      enableConnectionPooling: true,
      enableCaching: true,
      enableMetricsCollection: true,
      enableAutoScaling: true,
      enablePerformanceAlerts: true,
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    })

    const observabilityOrchestrator = new ObservabilityOrchestrator({
      metrics: {
        enabled: true,
        collectionInterval: 30000,
        retentionPeriod: 86400000,
        batchSize: 100
      },
      logging: {
        enabled: true,
        logLevel: 'info',
        structuredLogging: true,
        logAggregation: true
      },
      tracing: {
        enabled: true,
        samplingRate: 0.1,
        enableDistributedTracing: true,
        traceRetention: 7200000
      },
      alerting: {
        enabled: true,
        enableMLAnomalyDetection: true,
        alertChannels: ['webhook', 'email'],
        escalationRules: []
      },
      analytics: {
        enabled: true,
        enablePredictiveAnalytics: true,
        enableBusinessIntelligence: true,
        analysisInterval: 300000
      }
    })

    businessEngine = new BusinessIntelligenceEngine({
      ai: {
        orchestrator: aiOrchestrator,
        enablePredictiveAnalytics: true,
        enableRealtimeInsights: true,
        enableAutoReporting: true
      },
      performance: {
        orchestrator: performanceOrchestrator,
        enablePerformanceCorrelation: true,
        enableResourceOptimization: true
      },
      observability: {
        orchestrator: observabilityOrchestrator,
        enableBehaviorAnalysis: true,
        enableAnomalyCorrelation: true
      },
      analytics: {
        retentionPeriod: 90,
        aggregationIntervals: [5, 15, 60, 240, 1440],
        enableRealTimeProcessing: true,
        enableDataMining: true,
        enablePatternRecognition: true
      },
      forecasting: {
        horizons: [7, 14, 30, 90, 180, 365],
        confidenceThresholds: [0.7, 0.8, 0.9, 0.95],
        enableSeasonalAdjustments: true,
        enableTrendAnalysis: true,
        enableScenarioPlanning: true
      },
      alerts: {
        enableIntelligentAlerting: true,
        anomalyThreshold: 0.95,
        trendChangeThreshold: 0.15,
        businessRuleEngine: true
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    })
  }
  return businessEngine
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = dashboardQuerySchema.parse({
      tenantId: searchParams.get('tenantId') || session.user.tenantId,
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      categories: searchParams.get('categories')?.split(','),
      includeForecasts: searchParams.get('includeForecasts') !== 'false',
      includeInsights: searchParams.get('includeInsights') !== 'false',
      includeRecommendations: searchParams.get('includeRecommendations') !== 'false'
    })

    console.log('📊 Fetching business intelligence dashboard for tenant:', query.tenantId)

    const engine = getBusinessEngine()
    const dashboard = await engine.getDashboard(query.tenantId)

    // Build response based on requested data
    const response: any = {
      success: true,
      tenantId: query.tenantId,
      timestamp: new Date().toISOString(),
      overview: dashboard.overview,
      analytics: dashboard.analytics
    }

    if (query.includeForecasts) {
      response.forecasts = dashboard.forecasts
    }

    if (query.includeInsights) {
      response.insights = dashboard.insights
    }

    if (query.includeRecommendations) {
      response.recommendations = dashboard.recommendations
    }

    response.alerts = dashboard.alerts

    // Add summary statistics
    response.summary = {
      healthScore: dashboard.overview.healthScore,
      totalKPIs: dashboard.overview.kpis.length,
      criticalInsights: dashboard.overview.criticalInsights.length,
      activeForecast: dashboard.forecasts.filter(f => f.validUntil > new Date()).length,
      pendingRecommendations: dashboard.recommendations.filter(r => r.priority === 1).length
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Failed to fetch business intelligence data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch business intelligence data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = actionSchema.parse(body)
    const tenantId = session.user.tenantId

    const engine = getBusinessEngine()

    switch (action) {
      case 'record':
        console.log('📈 Recording business metric')
        
        const metricData = metricSchema.parse(data)
        const metric = await engine.recordMetric({
          ...metricData,
          tenantId
        })
        
        return NextResponse.json({
          success: true,
          action: 'record',
          result: {
            metricId: metric.id,
            name: metric.name,
            category: metric.category,
            trends: metric.trends,
            message: `Metric "${metric.name}" recorded successfully`
          },
          timestamp: new Date().toISOString()
        })

      case 'forecast':
        console.log('🔮 Generating business forecast')
        
        const forecastRequest = forecastRequestSchema.parse(data)
        const forecast = await engine.generateForecast(
          forecastRequest.metricId,
          forecastRequest.horizon,
          tenantId
        )
        
        return NextResponse.json({
          success: true,
          action: 'forecast',
          result: {
            forecastId: forecast.id,
            metricId: forecast.metricId,
            horizon: forecast.horizon,
            accuracy: forecast.accuracy,
            predictionsCount: forecast.predictions.length,
            scenariosCount: forecast.scenarios.length,
            validUntil: forecast.validUntil,
            summary: {
              trendDirection: forecast.predictions.length > 1 
                ? forecast.predictions[forecast.predictions.length - 1].predictedValue > forecast.predictions[0].predictedValue 
                  ? 'increasing' 
                  : 'decreasing'
                : 'stable',
              averageConfidence: forecast.predictions.reduce((sum, p) => sum + p.confidence, 0) / forecast.predictions.length
            }
          },
          forecast: forecast,
          timestamp: new Date().toISOString()
        })

      case 'insights':
        console.log('💡 Generating business insights')
        
        const insights = await engine.generateInsights(tenantId)
        
        return NextResponse.json({
          success: true,
          action: 'insights',
          result: {
            totalInsights: insights.length,
            byType: insights.reduce((acc, insight) => {
              acc[insight.type] = (acc[insight.type] || 0) + 1
              return acc
            }, {} as Record<string, number>),
            byImpact: insights.reduce((acc, insight) => {
              acc[insight.impact] = (acc[insight.impact] || 0) + 1
              return acc
            }, {} as Record<string, number>),
            criticalCount: insights.filter(i => i.impact === 'critical').length,
            averageConfidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length || 0
          },
          insights: insights.slice(0, 10), // Return top 10 insights
          timestamp: new Date().toISOString()
        })

      case 'export':
        console.log('📤 Exporting business intelligence data')
        
        const exportOptions = {
          tenantId,
          format: data?.format || 'json',
          includeForecasts: data?.includeForecasts !== false,
          includeInsights: data?.includeInsights !== false
        }
        
        const exportData = await engine.exportData(exportOptions)
        
        return NextResponse.json({
          success: true,
          action: 'export',
          result: {
            format: exportOptions.format,
            data: exportOptions.format === 'json' ? JSON.parse(exportData) : exportData,
            size: exportData.length,
            generatedAt: new Date().toISOString()
          }
        })

      case 'simulate':
        console.log('🎮 Running business simulation')
        
        // Simulate business metrics for demo purposes
        const simulationData = await runBusinessSimulation(engine, tenantId, data?.scenario || 'growth')
        
        return NextResponse.json({
          success: true,
          action: 'simulate',
          result: {
            scenario: data?.scenario || 'growth',
            metricsGenerated: simulationData.metrics.length,
            forecastsGenerated: simulationData.forecasts.length,
            insightsGenerated: simulationData.insights.length,
            message: `Business simulation completed: ${data?.scenario || 'growth'} scenario`
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Failed to process business intelligence action:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process business intelligence action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Business simulation for demo/testing
async function runBusinessSimulation(
  engine: BusinessIntelligenceEngine,
  tenantId: string,
  scenario: string
): Promise<{
  metrics: any[]
  forecasts: any[]
  insights: any[]
}> {
  console.log(`🎮 Running business simulation: ${scenario}`)
  
  const metrics = []
  const forecasts = []
  
  // Generate sample metrics based on scenario
  const scenarios = {
    growth: {
      revenueGrowth: 0.15,
      costGrowth: 0.08,
      efficiencyGain: 0.12,
      riskLevel: 0.2
    },
    stable: {
      revenueGrowth: 0.05,
      costGrowth: 0.04,
      efficiencyGain: 0.03,
      riskLevel: 0.15
    },
    decline: {
      revenueGrowth: -0.1,
      costGrowth: 0.02,
      efficiencyGain: -0.05,
      riskLevel: 0.35
    },
    volatile: {
      revenueGrowth: 0.25,
      costGrowth: 0.20,
      efficiencyGain: 0.08,
      riskLevel: 0.45
    }
  }
  
  const params = scenarios[scenario as keyof typeof scenarios] || scenarios.stable
  
  // Generate revenue metrics
  const baseRevenue = 1000000
  for (let i = 0; i < 30; i++) {
    const dailyVariation = (Math.random() - 0.5) * 0.1
    const value = baseRevenue * (1 + params.revenueGrowth * (i / 30)) * (1 + dailyVariation)
    
    const metric = await engine.recordMetric({
      name: 'Daily Revenue',
      category: 'revenue',
      value: Math.round(value),
      unit: 'USD',
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      dimensions: {
        channel: 'all',
        region: 'global'
      },
      metadata: {
        source: 'simulation',
        calculation: 'synthetic',
        quality: 'high',
        confidence: 0.9
      },
      targets: {
        current: value,
        target: baseRevenue * 1.2,
        threshold: baseRevenue * 0.8
      },
      tenantId
    })
    
    metrics.push(metric)
  }
  
  // Generate cost metrics
  const baseCost = 600000
  for (let i = 0; i < 30; i++) {
    const dailyVariation = (Math.random() - 0.5) * 0.08
    const value = baseCost * (1 + params.costGrowth * (i / 30)) * (1 + dailyVariation)
    
    const metric = await engine.recordMetric({
      name: 'Operating Costs',
      category: 'costs',
      value: Math.round(value),
      unit: 'USD',
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      dimensions: {
        type: 'operational',
        department: 'all'
      },
      metadata: {
        source: 'simulation',
        calculation: 'synthetic',
        quality: 'high',
        confidence: 0.85
      },
      tenantId
    })
    
    metrics.push(metric)
  }
  
  // Generate efficiency metrics
  const baseEfficiency = 0.75
  for (let i = 0; i < 30; i++) {
    const dailyVariation = (Math.random() - 0.5) * 0.05
    const value = Math.min(1, baseEfficiency * (1 + params.efficiencyGain * (i / 30)) * (1 + dailyVariation))
    
    const metric = await engine.recordMetric({
      name: 'Operational Efficiency',
      category: 'efficiency',
      value: value,
      unit: 'percentage',
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      dimensions: {
        area: 'operations'
      },
      metadata: {
        source: 'simulation',
        calculation: 'synthetic',
        quality: 'medium',
        confidence: 0.8
      },
      tenantId
    })
    
    metrics.push(metric)
  }
  
  // Generate forecasts for key metrics
  try {
    const revenueForecast = await engine.generateForecast(metrics[0].id, 30, tenantId)
    forecasts.push(revenueForecast)
    
    const costForecast = await engine.generateForecast(metrics[30].id, 30, tenantId)
    forecasts.push(costForecast)
  } catch (error) {
    console.error('Failed to generate forecasts:', error)
  }
  
  // Generate insights
  const insights = await engine.generateInsights(tenantId)
  
  console.log(`✅ Business simulation completed: ${metrics.length} metrics, ${forecasts.length} forecasts, ${insights.length} insights`)
  
  return { metrics, forecasts, insights }
}

// Example metric recording formats
export const METRIC_EXAMPLES = {
  revenue: {
    name: 'Monthly Recurring Revenue',
    category: 'revenue' as const,
    value: 125000,
    unit: 'USD',
    dimensions: {
      product: 'SaaS',
      region: 'North America',
      segment: 'Enterprise'
    },
    metadata: {
      source: 'billing_system',
      calculation: 'sum_of_active_subscriptions',
      quality: 'high' as const,
      confidence: 0.95
    },
    targets: {
      current: 125000,
      target: 150000,
      threshold: 100000
    }
  },
  costs: {
    name: 'Cloud Infrastructure Costs',
    category: 'costs' as const,
    value: 45000,
    unit: 'USD',
    dimensions: {
      provider: 'AWS',
      service: 'compute',
      environment: 'production'
    },
    metadata: {
      source: 'aws_billing',
      calculation: 'monthly_usage_cost',
      quality: 'high' as const,
      confidence: 1.0
    }
  },
  efficiency: {
    name: 'System Uptime',
    category: 'efficiency' as const,
    value: 99.95,
    unit: 'percentage',
    dimensions: {
      service: 'api',
      region: 'global'
    },
    metadata: {
      source: 'monitoring_system',
      calculation: 'uptime_percentage',
      quality: 'high' as const,
      confidence: 1.0
    }
  },
  growth: {
    name: 'New Customer Acquisition',
    category: 'growth' as const,
    value: 150,
    unit: 'customers',
    dimensions: {
      channel: 'organic',
      segment: 'SMB'
    },
    metadata: {
      source: 'crm_system',
      calculation: 'new_customers_count',
      quality: 'high' as const,
      confidence: 0.9
    }
  },
  satisfaction: {
    name: 'Net Promoter Score',
    category: 'satisfaction' as const,
    value: 72,
    unit: 'nps',
    dimensions: {
      survey: 'quarterly',
      segment: 'all'
    },
    metadata: {
      source: 'survey_tool',
      calculation: 'nps_calculation',
      quality: 'medium' as const,
      confidence: 0.85
    }
  }
}