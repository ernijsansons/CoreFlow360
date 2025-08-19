import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import AIOrchestrator from '@/lib/ai/AIOrchestrator'
import { z } from 'zod'

const predictionSchema = z.object({
  modelId: z.string(),
  input: z.record(z.any()),
  options: z
    .object({
      confidence: z.boolean().default(true),
      explanation: z.boolean().default(false),
      alternatives: z.number().min(0).max(5).default(0),
      realtime: z.boolean().default(false),
    })
    .optional(),
})

const analysisSchema = z.object({
  type: z.enum([
    'trend_analysis',
    'anomaly_detection',
    'pattern_recognition',
    'forecasting',
    'classification',
  ]),
  data: z.array(z.any()),
  parameters: z.record(z.any()).default({}),
})

const trainingSchema = z.object({
  name: z.string(),
  architecture: z.enum([
    'neural_network',
    'random_forest',
    'gradient_boosting',
    'transformer',
    'lstm',
  ]),
  hyperparameters: z.record(z.any()).default({}),
  trainingConfig: z.object({
    batchSize: z.number().default(32),
    epochs: z.number().default(100),
    learningRate: z.number().default(0.001),
    validationSplit: z.number().default(0.2),
    earlyStopping: z.boolean().default(true),
  }),
  datasetId: z.string().optional(),
})

const actionSchema = z.object({
  action: z.enum(['predict', 'analyze', 'train', 'optimize', 'export', 'models']),
  data: z.any().optional(),
})

// Global AI orchestrator
let orchestrator: AIOrchestrator | null = null

function getOrchestrator(): AIOrchestrator {
  if (!orchestrator) {
    // Delay environment variable access until runtime
    const getConfig = () => ({
      models: {
        primary: 'gpt-4',
        reasoning: 'gpt-4',
        analysis: 'gpt-4',
        prediction: 'gpt-4',
        classification: 'gpt-4',
      },
      providers: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY || '',
          organization: process.env.OPENAI_ORGANIZATION,
        },
      },
      capabilities: {
        enablePredictiveAnalytics: true,
        enableCustomModels: true,
        enableMultiModalProcessing: true,
        enableRealtimeInference: true,
        enableModelFinetuning: true,
      },
      performance: {
        maxConcurrentRequests: 10,
        requestTimeout: 30000,
        cacheEnabled: true,
        cacheTTL: 3600,
        enableGPUAcceleration: false,
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    })

    orchestrator = new AIOrchestrator(getConfig())
  }
  return orchestrator
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'analytics'
    const tenantId = searchParams.get('tenantId') || session.user.tenantId

    const orchestrator = getOrchestrator()

    switch (action) {
      case 'analytics':
        const analytics = await orchestrator.getAIAnalytics(tenantId)

        return NextResponse.json({
          success: true,
          tenantId,
          timestamp: new Date().toISOString(),
          ...analytics,
        })

      case 'models':
        const analytics_models = await orchestrator.getAIAnalytics(tenantId)

        return NextResponse.json({
          success: true,
          models: analytics_models.models,
          customModels: analytics_models.customModels,
          totalModels: analytics_models.models.length + analytics_models.customModels.length,
          readyModels: analytics_models.models.filter((m) => m.status === 'ready').length,
          timestamp: new Date().toISOString(),
        })

      case 'health':
        const healthData = await orchestrator.getAIAnalytics(tenantId)

        return NextResponse.json({
          success: true,
          systemHealth: healthData.systemHealth,
          modelPerformance: healthData.modelPerformance,
          insights: healthData.insights,
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch AI intelligence data',
        details: error instanceof Error ? error.message : 'Unknown error',
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

    const orchestrator = getOrchestrator()

    switch (action) {
      case 'predict':
        const predictionRequest = predictionSchema.parse(data)
        const prediction = await orchestrator.predict(predictionRequest)

        return NextResponse.json({
          success: true,
          action: 'predict',
          result: prediction,
          timestamp: new Date().toISOString(),
        })

      case 'analyze':
        const analysisRequest = analysisSchema.parse(data)
        const analysisTask = await orchestrator.analyze(
          analysisRequest.type,
          analysisRequest.data,
          analysisRequest.parameters,
          tenantId
        )

        return NextResponse.json({
          success: true,
          action: 'analyze',
          result: {
            taskId: analysisTask.id,
            status: analysisTask.status,
            type: analysisTask.type,
            message: `Analysis task created: ${analysisTask.id}`,
          },
          timestamp: new Date().toISOString(),
        })

      case 'train':
        const trainingRequest = trainingSchema.parse(data)
        const customModel = await orchestrator.trainCustomModel(trainingRequest)

        return NextResponse.json({
          success: true,
          action: 'train',
          result: {
            modelId: customModel.id,
            name: customModel.name,
            status: customModel.status,
            architecture: customModel.architecture,
            message: `Custom model training started: ${customModel.id}`,
          },
          timestamp: new Date().toISOString(),
        })

      case 'optimize':
        const optimizationResult = await orchestrator.optimizeModels()

        return NextResponse.json({
          success: true,
          action: 'optimize',
          result: {
            optimizationsApplied: optimizationResult.optimizationsApplied,
            improvements: optimizationResult.improvements,
            summary: `Applied ${optimizationResult.optimizationsApplied} AI optimizations`,
            averageImprovement:
              optimizationResult.improvements.reduce((sum, imp) => sum + imp.impactScore, 0) /
              optimizationResult.improvements.length,
          },
          timestamp: new Date().toISOString(),
        })

      case 'export':
        const analytics = await orchestrator.getAIAnalytics(tenantId)
        const exportFormat = data?.format || 'json'

        let exportData: string
        if (exportFormat === 'csv') {
          exportData = convertAnalyticsToCSV(analytics)
        } else {
          exportData = JSON.stringify(analytics, null, 2)
        }

        return NextResponse.json({
          success: true,
          action: 'export',
          result: {
            format: exportFormat,
            data: exportFormat === 'json' ? analytics : exportData,
            size: exportData.length,
            generatedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process AI intelligence action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper functions
function convertAnalyticsToCSV(analytics: unknown): string {
  let csv = 'timestamp,type,name,status,accuracy,inference_time\n'

  // Add models
  analytics.models.forEach((model: unknown) => {
    csv += `${model.lastTrained},model,${model.name},${model.status},${model.accuracy || 0},${model.performance.inferenceTime}\n`
  })

  // Add custom models
  analytics.customModels.forEach((model: unknown) => {
    csv += `${new Date().toISOString()},custom_model,${model.name},${model.status},${model.metrics.accuracy},0\n`
  })

  return csv
}

// Business Intelligence Prediction Examples
export const PREDICTION_EXAMPLES = {
  business_forecast: {
    modelId: 'demand_forecaster',
    input: {
      historical_sales: [100, 120, 110, 130, 125],
      seasonality: 'Q4',
      economic_indicators: {
        gdp_growth: 2.3,
        inflation: 3.1,
        unemployment: 3.8,
      },
      marketing_spend: 50000,
      external_factors: {
        competition_activity: 'moderate',
        market_sentiment: 'positive',
      },
    },
    options: {
      confidence: true,
      explanation: true,
      alternatives: 2,
    },
  },
  customer_analysis: {
    modelId: 'customer_analyzer',
    input: {
      engagement_metrics: {
        email_open_rate: 0.24,
        click_through_rate: 0.03,
        session_duration: 180,
        page_views: 8,
      },
      purchase_history: {
        total_orders: 12,
        avg_order_value: 85.5,
        last_purchase_days: 45,
        preferred_category: 'electronics',
      },
      demographics: {
        age_group: '25-34',
        location: 'urban',
        income_bracket: 'medium',
      },
    },
    options: {
      confidence: true,
      explanation: true,
    },
  },
  risk_assessment: {
    modelId: 'risk_assessor',
    input: {
      financial_ratios: {
        current_ratio: 1.8,
        debt_to_equity: 0.4,
        return_on_equity: 0.15,
        gross_margin: 0.35,
      },
      cash_flow: {
        operating_cf: 250000,
        free_cf: 180000,
        cf_ratio: 1.2,
      },
      debt_levels: {
        total_debt: 500000,
        debt_service_coverage: 2.1,
        interest_coverage: 5.8,
      },
      market_volatility: 0.18,
      industry_factors: {
        growth_rate: 0.08,
        competition_level: 'moderate',
        regulatory_risk: 'low',
      },
    },
    options: {
      confidence: true,
      explanation: true,
      alternatives: 1,
    },
  },
  content_generation: {
    modelId: 'content_generator',
    input: {
      content_type: 'business_proposal',
      context: {
        client: 'Tech Startup',
        industry: 'SaaS',
        objective: 'CRM Implementation',
        budget_range: '$50k-100k',
        timeline: '6 months',
      },
      tone: 'professional',
      audience: 'C-level executives',
      constraints: {
        word_limit: 1500,
        include_pricing: true,
        include_timeline: true,
      },
    },
    options: {
      confidence: true,
      explanation: false,
    },
  },
}

// Analysis Examples
export const ANALYSIS_EXAMPLES = {
  trend_analysis: {
    type: 'trend_analysis' as const,
    data: [
      { date: '2024-01-01', value: 1000, category: 'sales' },
      { date: '2024-01-02', value: 1100, category: 'sales' },
      { date: '2024-01-03', value: 1050, category: 'sales' },
      { date: '2024-01-04', value: 1200, category: 'sales' },
      { date: '2024-01-05', value: 1300, category: 'sales' },
    ],
    parameters: {
      trend_period: 30,
      confidence_level: 0.95,
      include_seasonality: true,
    },
  },
  anomaly_detection: {
    type: 'anomaly_detection' as const,
    data: [
      { timestamp: '2024-01-01T10:00:00Z', metric: 'cpu_usage', value: 45 },
      { timestamp: '2024-01-01T10:05:00Z', metric: 'cpu_usage', value: 48 },
      { timestamp: '2024-01-01T10:10:00Z', metric: 'cpu_usage', value: 92 }, // Anomaly
      { timestamp: '2024-01-01T10:15:00Z', metric: 'cpu_usage', value: 46 },
    ],
    parameters: {
      sensitivity: 0.8,
      window_size: 24,
      method: 'statistical',
    },
  },
  pattern_recognition: {
    type: 'pattern_recognition' as const,
    data: [
      { user_id: '1', action: 'login', timestamp: '2024-01-01T09:00:00Z' },
      { user_id: '1', action: 'browse', timestamp: '2024-01-01T09:05:00Z' },
      { user_id: '1', action: 'purchase', timestamp: '2024-01-01T09:20:00Z' },
      { user_id: '2', action: 'login', timestamp: '2024-01-01T10:00:00Z' },
      { user_id: '2', action: 'browse', timestamp: '2024-01-01T10:03:00Z' },
      { user_id: '2', action: 'purchase', timestamp: '2024-01-01T10:25:00Z' },
    ],
    parameters: {
      pattern_length: 3,
      min_support: 0.6,
      algorithm: 'sequence_mining',
    },
  },
}
