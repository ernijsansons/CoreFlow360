/**
 * CoreFlow360 Workflow Interceptors
 * 
 * Interceptors for monitoring, logging, and enhancing workflow execution
 */

import { 
  WorkflowInboundCallsInterceptor, 
  WorkflowOutboundCallsInterceptor,
  WorkflowInterceptorsFactory,
  WorkflowExecuteInput,
  WorkflowQueryInput,
  WorkflowSignalInput
} from '@temporalio/workflow'

/**
 * Inbound interceptor for workflow execution monitoring
 */
export class VoiceWorkflowInboundInterceptor implements WorkflowInboundCallsInterceptor {
  async execute(input: WorkflowExecuteInput, next: any): Promise<any> {
    const { workflowType } = input.info
    const startTime = Date.now()
    
    console.log(`🔄 Starting workflow: ${workflowType}`, {
      workflowId: input.info.workflowId,
      runId: input.info.runId,
      taskQueue: input.info.taskQueue
    })

    try {
      const result = await next(input)
      
      const duration = Date.now() - startTime
      console.log(`✅ Workflow completed: ${workflowType}`, {
        workflowId: input.info.workflowId,
        duration: `${duration}ms`
      })

      // In production, send metrics to monitoring system
      await this.recordWorkflowMetrics(workflowType, duration, 'completed')
      
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Workflow failed: ${workflowType}`, {
        workflowId: input.info.workflowId,
        duration: `${duration}ms`,
        error: error.message
      })

      await this.recordWorkflowMetrics(workflowType, duration, 'failed', error)
      throw error
    }
  }

  async handleQuery(input: WorkflowQueryInput, next: any): Promise<any> {
    console.log(`🔍 Query received: ${input.queryType}`, {
      workflowId: input.info.workflowId
    })
    
    try {
      const result = await next(input)
      console.log(`✅ Query completed: ${input.queryType}`)
      return result
    } catch (error) {
      console.error(`❌ Query failed: ${input.queryType}`, { error: error.message })
      throw error
    }
  }

  async handleSignal(input: WorkflowSignalInput, next: any): Promise<void> {
    console.log(`📡 Signal received: ${input.signalName}`, {
      workflowId: input.info.workflowId
    })
    
    try {
      await next(input)
      console.log(`✅ Signal processed: ${input.signalName}`)
    } catch (error) {
      console.error(`❌ Signal failed: ${input.signalName}`, { error: error.message })
      throw error
    }
  }

  private async recordWorkflowMetrics(
    workflowType: string, 
    duration: number, 
    status: 'completed' | 'failed',
    error?: any
  ): Promise<void> {
    // In production, would send to metrics system like Prometheus/DataDog
    const metrics = {
      workflow_type: workflowType,
      duration_ms: duration,
      status,
      timestamp: new Date().toISOString(),
      error_type: error?.name,
      error_message: error?.message
    }
    
    // Mock metrics recording
    console.log('📊 Workflow Metrics:', metrics)
  }
}

/**
 * Outbound interceptor for activity call monitoring
 */
export class VoiceWorkflowOutboundInterceptor implements WorkflowOutboundCallsInterceptor {
  async scheduleActivity(input: any, next: any): Promise<any> {
    const startTime = Date.now()
    
    console.log(`🎯 Scheduling activity: ${input.activityType}`, {
      workflowId: input.info?.workflowId,
      activityId: input.activityId
    })

    try {
      const result = await next(input)
      
      const duration = Date.now() - startTime
      console.log(`✅ Activity completed: ${input.activityType}`, {
        activityId: input.activityId,
        duration: `${duration}ms`
      })

      await this.recordActivityMetrics(input.activityType, duration, 'completed')
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Activity failed: ${input.activityType}`, {
        activityId: input.activityId,
        duration: `${duration}ms`,
        error: error.message
      })

      await this.recordActivityMetrics(input.activityType, duration, 'failed', error)
      throw error
    }
  }

  async startChildWorkflowExecution(input: any, next: any): Promise<any> {
    console.log(`👶 Starting child workflow: ${input.workflowType}`, {
      parentWorkflowId: input.info?.workflowId,
      childWorkflowId: input.workflowId
    })

    try {
      const result = await next(input)
      console.log(`✅ Child workflow started: ${input.workflowType}`)
      return result
    } catch (error) {
      console.error(`❌ Child workflow failed: ${input.workflowType}`, { error: error.message })
      throw error
    }
  }

  async signalWorkflow(input: any, next: any): Promise<any> {
    console.log(`📤 Sending signal: ${input.signalName}`, {
      targetWorkflowId: input.workflowExecution.workflowId
    })

    try {
      const result = await next(input)
      console.log(`✅ Signal sent: ${input.signalName}`)
      return result
    } catch (error) {
      console.error(`❌ Signal failed: ${input.signalName}`, { error: error.message })
      throw error
    }
  }

  private async recordActivityMetrics(
    activityType: string, 
    duration: number, 
    status: 'completed' | 'failed',
    error?: any
  ): Promise<void> {
    const metrics = {
      activity_type: activityType,
      duration_ms: duration,
      status,
      timestamp: new Date().toISOString(),
      error_type: error?.name,
      error_message: error?.message
    }
    
    console.log('📈 Activity Metrics:', metrics)
  }
}

/**
 * Enhanced error boundary interceptor
 */
export class ErrorBoundaryInterceptor implements WorkflowInboundCallsInterceptor {
  async execute(input: WorkflowExecuteInput, next: any): Promise<any> {
    try {
      return await next(input)
    } catch (error) {
      // Enhanced error logging with context
      console.error('🚨 Workflow Error Boundary Triggered:', {
        workflowType: input.info.workflowType,
        workflowId: input.info.workflowId,
        runId: input.info.runId,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        input: input.args,
        timestamp: new Date().toISOString()
      })

      // In production, send to error tracking service
      await this.reportError(error, input.info, input.args)
      
      throw error
    }
  }

  private async reportError(error: any, workflowInfo: any, args: any): Promise<void> {
    // Mock error reporting - would integrate with Sentry, DataDog, etc.
    const errorReport = {
      service: 'voice-processing',
      workflow_type: workflowInfo.workflowType,
      workflow_id: workflowInfo.workflowId,
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      workflow_args: args,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    console.log('🔴 Error Report:', errorReport)
  }
}

/**
 * Performance monitoring interceptor
 */
export class PerformanceMonitoringInterceptor implements WorkflowInboundCallsInterceptor {
  private performanceThresholds = {
    voice_call_workflow: 300000, // 5 minutes max
    post_call_processing: 120000, // 2 minutes max
    lead_processing: 60000 // 1 minute max
  }

  async execute(input: WorkflowExecuteInput, next: any): Promise<any> {
    const { workflowType } = input.info
    const startTime = Date.now()
    
    const threshold = this.performanceThresholds[workflowType] || 300000
    
    // Set up performance monitoring
    const performanceTimer = setTimeout(() => {
      console.warn('⏰ Workflow performance warning:', {
        workflowType,
        workflowId: input.info.workflowId,
        duration: `${Date.now() - startTime}ms`,
        threshold: `${threshold}ms`,
        message: 'Workflow execution time exceeds performance threshold'
      })
    }, threshold)

    try {
      const result = await next(input)
      clearTimeout(performanceTimer)
      
      const duration = Date.now() - startTime
      if (duration > threshold * 0.8) {
        console.warn('📊 Performance Alert:', {
          workflowType,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
          message: 'Workflow approaching performance threshold'
        })
      }
      
      return result
    } catch (error) {
      clearTimeout(performanceTimer)
      throw error
    }
  }
}

/**
 * Workflow interceptors factory
 */
export const workflowInterceptors: WorkflowInterceptorsFactory = () => {
  return {
    inbound: [
      new ErrorBoundaryInterceptor(),
      new PerformanceMonitoringInterceptor(),
      new VoiceWorkflowInboundInterceptor()
    ],
    outbound: [
      new VoiceWorkflowOutboundInterceptor()
    ]
  }
}

export default workflowInterceptors