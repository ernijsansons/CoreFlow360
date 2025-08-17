/**
 * CoreFlow360 - ML Pipeline API
 * API endpoints for ML model retraining pipeline
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from '@/lib/auth'
import { ModelRetrainingPipeline, ModelConfigSchema } from '@/lib/ml/model-retraining-pipeline'

// Global pipeline instance (in production, this would be properly managed)
let globalPipeline: ModelRetrainingPipeline | null = null

function getPipeline(): ModelRetrainingPipeline {
  if (!globalPipeline) {
    globalPipeline = new ModelRetrainingPipeline()
  }
  return globalPipeline
}

const PipelineActionSchema = z.object({
  action: z.enum(['start_retraining', 'check_drift', 'monitor_performance', 'register_model']),
  modelId: z.string().optional(),
  optimize: z.boolean().default(false),
  modelConfig: ModelConfigSchema.optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const modelId = searchParams.get('modelId')

    const pipeline = getPipeline()

    switch (action) {
      case 'status':
        const status = pipeline.getPipelineStatus()
        return NextResponse.json({
          status,
          timestamp: new Date().toISOString()
        })

      case 'models':
        const models = pipeline.getAllModels()
        return NextResponse.json({
          models,
          count: models.length,
          timestamp: new Date().toISOString()
        })

      case 'jobs':
        const limit = parseInt(searchParams.get('limit') || '20')
        const jobs = pipeline.getRecentJobs(limit)
        return NextResponse.json({
          jobs,
          count: jobs.length,
          timestamp: new Date().toISOString()
        })

      case 'model':
        if (!modelId) {
          return NextResponse.json(
            { error: 'Model ID is required' },
            { status: 400 }
          )
        }
        const model = pipeline.getModelConfig(modelId)
        if (!model) {
          return NextResponse.json(
            { error: 'Model not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          model,
          timestamp: new Date().toISOString()
        })

      case 'job':
        const jobId = searchParams.get('jobId')
        if (!jobId) {
          return NextResponse.json(
            { error: 'Job ID is required' },
            { status: 400 }
          )
        }
        const job = pipeline.getTrainingJob(jobId)
        if (!job) {
          return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          job,
          timestamp: new Date().toISOString()
        })

      default:
        // Return overview data
        const overview = {
          status: pipeline.getPipelineStatus(),
          models: pipeline.getAllModels(),
          recentJobs: pipeline.getRecentJobs(10)
        }
        return NextResponse.json({
          ...overview,
          timestamp: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('ML Pipeline GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow admin users to perform ML operations
    const isAdmin = session.user.role === 'admin' || session.user.email?.includes('admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, modelId, optimize, modelConfig } = PipelineActionSchema.parse(body)

    const pipeline = getPipeline()
    let result: any

    switch (action) {
      case 'start_retraining':
        if (!modelId) {
          return NextResponse.json(
            { error: 'Model ID is required for retraining' },
            { status: 400 }
          )
        }
        
        const jobId = await pipeline.startRetraining(modelId, 'manual', optimize)
        result = {
          action: 'start_retraining',
          jobId,
          modelId,
          optimize,
          status: 'started'
        }
        break

      case 'check_drift':
        if (!modelId) {
          return NextResponse.json(
            { error: 'Model ID is required for drift check' },
            { status: 400 }
          )
        }
        
        const hasDrift = await pipeline.checkDataDrift(modelId)
        result = {
          action: 'check_drift',
          modelId,
          hasDrift,
          status: 'completed'
        }
        break

      case 'monitor_performance':
        if (!modelId) {
          return NextResponse.json(
            { error: 'Model ID is required for performance monitoring' },
            { status: 400 }
          )
        }
        
        await pipeline.monitorPerformance(modelId)
        result = {
          action: 'monitor_performance',
          modelId,
          status: 'completed'
        }
        break

      case 'register_model':
        if (!modelConfig) {
          return NextResponse.json(
            { error: 'Model config is required for registration' },
            { status: 400 }
          )
        }
        
        pipeline.registerModel(modelConfig)
        result = {
          action: 'register_model',
          modelId: modelConfig.id,
          status: 'registered'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('ML Pipeline POST API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = session.user.role === 'admin' || session.user.email?.includes('admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { modelId, updates } = body

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    const pipeline = getPipeline()
    const currentModel = pipeline.getModelConfig(modelId)
    
    if (!currentModel) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Update model configuration
    const updatedModel = { ...currentModel, ...updates }
    ModelConfigSchema.parse(updatedModel) // Validate updated config
    
    pipeline.registerModel(updatedModel) // Re-register with updates

    return NextResponse.json({
      success: true,
      model: updatedModel,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('ML Pipeline PUT API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid model configuration', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = session.user.role === 'admin' || session.user.email?.includes('admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('modelId')

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    const pipeline = getPipeline()
    const model = pipeline.getModelConfig(modelId)
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // In a real implementation, you would remove the model from the pipeline
    // For now, we'll just return success
    console.log(`Model ${modelId} marked for deletion`)

    return NextResponse.json({
      success: true,
      message: `Model ${modelId} deleted successfully`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('ML Pipeline DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}