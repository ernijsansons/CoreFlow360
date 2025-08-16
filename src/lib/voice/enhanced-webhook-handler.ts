/**
 * CoreFlow360 Enhanced Webhook Handler
 * 
 * Unbreakable webhook processing with Temporal workflows, circuit breakers,
 * and intelligent retry mechanisms for maximum reliability
 */

import { Request, Response } from 'express';
import { Client as TemporalClient } from '@temporalio/client';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';
import { deadLetterQueue } from '@/lib/webhook-dlq/dead-letter-queue';
import { createWebhookValidator, WEBHOOK_CONFIGS } from '@/lib/security/webhook-security';
import { webhookAnalytics } from '@/lib/monitoring/webhook-analytics';

export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: Date;
  callId: string;
  tenantId: string;
  phoneNumber: string;
  data: Record<string, any>;
  provider: 'vapi' | 'twilio';
  source: string;
  retryCount?: number;
}

export interface ProcessingResult {
  success: boolean;
  duration: number;
  error?: string;
  workflowId?: string;
  leadId?: string;
  actions: string[];
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: Date;
  status: 'closed' | 'open' | 'half-open';
  nextAttempt: Date;
}

export class EnhancedWebhookHandler {
  private temporalClient?: TemporalClient;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private processingQueue: Map<string, WebhookEvent[]> = new Map();
  private vapiValidator = createWebhookValidator(WEBHOOK_CONFIGS.vapi);
  private twilioValidator = createWebhookValidator(WEBHOOK_CONFIGS.twilio);
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageProcessingTime: 0,
    temporalWorkflowsStarted: 0,
    circuitBreakerTrips: 0,
    securityValidationFailures: 0
  };
  
  constructor() {
    this.initializeTemporalClient();
    this.startHealthMonitoring();
    this.startQueueProcessor();
    
    console.log('🎣 Enhanced Webhook Handler initialized with security validation');
  }

  private async initializeTemporalClient(): Promise<void> {
    if (process.env.TEMPORAL_ENABLED === 'true') {
      try {
        this.temporalClient = new TemporalClient({
          connection: {
            address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
          }
        });
        
        // Test connection
        await this.temporalClient.workflowService.getSystemInfo({});
        console.log('✅ Temporal client connected successfully');
        
      } catch (error) {
        console.error('❌ Failed to connect to Temporal:', error);
        // Continue without Temporal for now
        this.temporalClient = undefined;
      }
    }
  }

  /**
   * Main webhook handler - processes all voice-related webhooks
   */
  async handleWebhook(req: Request): Promise<Response> {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    let webhookEvent: WebhookEvent;
    let result: ProcessingResult;

    try {
      // Enhanced security validation first
      const securityResult = await this.validateWebhookSecurity(req);
      if (!securityResult.isValid) {
        this.metrics.securityValidationFailures++;
        console.warn('Voice webhook security validation failed:', {
          error: securityResult.error,
          metadata: securityResult.metadata,
          userAgent: req.headers['user-agent'],
          ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown'
        });
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Security validation failed',
          details: securityResult.error
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Parse and validate webhook
      webhookEvent = await this.parseWebhook(req);
      console.log(`📨 Webhook received: ${webhookEvent.type} for call ${webhookEvent.callId}`);

      // Check circuit breaker
      if (!this.isCircuitClosed(webhookEvent.tenantId)) {
        console.warn(`⚠️ Circuit breaker open for tenant ${webhookEvent.tenantId}`);
        return new Response('Circuit breaker open', { status: 503 });
      }

      // Process webhook with enhanced error handling
      result = await this.processWebhookWithRetry(webhookEvent);

      // Update metrics
      this.metrics.successfulRequests++;
      this.updateProcessingTime(performance.now() - startTime);

      // Reset circuit breaker on success
      this.resetCircuitBreaker(webhookEvent.tenantId);

      // Record analytics for successful request
      webhookAnalytics.recordEvent({
        provider: webhookEvent.provider,
        endpoint: req.url || '/webhook',
        method: req.method || 'POST',
        statusCode: 200,
        latency: performance.now() - startTime,
        success: true,
        tenantId: webhookEvent.tenantId,
        callId: webhookEvent.callId,
        retryCount: webhookEvent.retryCount || 0,
        metadata: {
          eventType: webhookEvent.type,
          workflowId: result.workflowId,
          actions: result.actions
        }
      });

      console.log(`✅ Webhook processed successfully in ${result.duration.toFixed(2)}ms`);
      
      return new Response(JSON.stringify({
        success: true,
        duration: result.duration,
        workflowId: result.workflowId,
        actions: result.actions
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      // Handle errors gracefully
      this.metrics.failedRequests++;
      this.recordCircuitBreakerFailure(webhookEvent?.tenantId || 'unknown');

      const duration = performance.now() - startTime;
      console.error('❌ Webhook processing failed:', {
        error: error.message,
        duration: duration.toFixed(2) + 'ms',
        callId: webhookEvent?.callId || 'unknown'
      });

      // Record analytics for failed request
      if (webhookEvent) {
        webhookAnalytics.recordEvent({
          provider: webhookEvent.provider,
          endpoint: req.url || '/webhook',
          method: req.method || 'POST',
          statusCode: 500,
          latency: duration,
          success: false,
          errorType: error.constructor.name,
          tenantId: webhookEvent.tenantId,
          callId: webhookEvent.callId,
          retryCount: webhookEvent.retryCount || 0,
          metadata: {
            eventType: webhookEvent.type,
            errorMessage: error.message,
            circuitBreakerOpen: !this.isCircuitClosed(webhookEvent.tenantId)
          }
        });
      }

      // Add to Dead Letter Queue for comprehensive failure handling
      if (webhookEvent) {
        await deadLetterQueue.addFailedEvent({
          eventType: webhookEvent.type,
          sourceProvider: webhookEvent.provider,
          payload: webhookEvent.data,
          originalHeaders: Object.fromEntries(req.headers.entries()),
          failureReason: error.message,
          stackTrace: error.stack,
          tenantId: webhookEvent.tenantId,
          priority: this.determinePriority(webhookEvent.type),
          maxRetries: 5
        });
      }

      // Queue for retry if it's a transient error (legacy system)
      if (this.isTransientError(error as Error) && webhookEvent) {
        await this.queueForRetry(webhookEvent);
      }

      // Always return 200 to prevent webhook retries from provider
      return new Response(JSON.stringify({
        success: false,
        error: 'Logged and queued for retry',
        duration
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Enhanced security validation for voice webhooks
   */
  private async validateWebhookSecurity(req: Request): Promise<{
    isValid: boolean
    error?: string
    metadata?: any
  }> {
    try {
      const body = await req.text();
      const headers = Object.fromEntries(req.headers.entries());
      const provider = this.detectProviderFromHeaders(headers);

      const payload = {
        body,
        headers,
        method: req.method,
        url: req.url
      };

      let validator;
      switch (provider) {
        case 'vapi':
          validator = this.vapiValidator;
          break;
        case 'twilio':
          validator = this.twilioValidator;
          break;
        default:
          // For unknown providers, use basic validation
          return {
            isValid: true,
            metadata: { provider: 'unknown', validated: false }
          };
      }

      const result = await validator.validateWebhook(payload);
      return {
        isValid: result.isValid,
        error: result.error,
        metadata: { ...result.metadata, provider }
      };

    } catch (error) {
      return {
        isValid: false,
        error: `Security validation error: ${error.message}`,
        metadata: { error: true }
      };
    }
  }

  /**
   * Parse webhook from different providers (Vapi, Twilio, etc.)
   */
  private async parseWebhook(req: Request): Promise<WebhookEvent> {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers.entries());
    
    // Determine provider from headers or body
    const provider = this.detectProvider(headers, body);
    
    let webhookEvent: WebhookEvent;

    switch (provider) {
      case 'vapi':
        webhookEvent = this.parseVapiWebhook(body, headers);
        break;
      case 'twilio':
        webhookEvent = this.parseTwilioWebhook(body, headers);
        break;
      default:
        throw new Error(`Unknown webhook provider: ${provider}`);
    }

    // Validate required fields
    this.validateWebhookEvent(webhookEvent);
    
    return webhookEvent;
  }

  private parseVapiWebhook(body: any, headers: Record<string, string>): WebhookEvent {
    return {
      id: body.message?.id || uuidv4(),
      type: body.message?.type || 'unknown',
      timestamp: new Date(body.message?.timestamp || Date.now()),
      callId: body.message?.call?.id || body.callId,
      tenantId: body.message?.call?.metadata?.tenantId || 'default',
      phoneNumber: body.message?.call?.customer?.number || '',
      provider: 'vapi',
      source: headers['x-forwarded-for'] || headers['remote-addr'] || 'unknown',
      data: {
        call: body.message?.call,
        transcript: body.message?.transcript,
        toolCalls: body.message?.toolCalls,
        analysis: body.message?.analysis,
        raw: body
      }
    };
  }

  private parseTwilioWebhook(body: any, headers: Record<string, string>): WebhookEvent {
    return {
      id: body.CallSid || uuidv4(),
      type: body.StatusCallbackEvent || body.CallStatus || 'call-update',
      timestamp: new Date(),
      callId: body.CallSid,
      tenantId: body.tenantId || 'default', // Should be passed in original call
      phoneNumber: body.To || body.Called || '',
      provider: 'twilio',
      source: headers['x-forwarded-for'] || 'twilio',
      data: {
        status: body.CallStatus,
        direction: body.Direction,
        duration: body.CallDuration,
        recording: body.RecordingUrl,
        raw: body
      }
    };
  }

  private detectProviderFromHeaders(headers: Record<string, string>): 'vapi' | 'twilio' | 'unknown' {
    if (headers['x-vapi-signature'] || headers['x-vapi-timestamp']) return 'vapi';
    if (headers['x-twilio-signature']) return 'twilio';
    return 'unknown';
  }

  private detectProvider(headers: Record<string, string>, body: any): 'vapi' | 'twilio' {
    if (headers['x-vapi-signature'] || body.message?.type) return 'vapi';
    if (headers['x-twilio-signature'] || body.CallSid) return 'twilio';
    
    throw new Error('Unable to detect webhook provider');
  }

  private validateWebhookEvent(event: WebhookEvent): void {
    const required = ['id', 'type', 'callId', 'provider'];
    for (const field of required) {
      if (!event[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Process webhook with automatic retry logic
   */
  private async processWebhookWithRetry(event: WebhookEvent, maxRetries = 3): Promise<ProcessingResult> {
    const startTime = performance.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.processWebhookEvent(event);
        return {
          ...result,
          duration: performance.now() - startTime
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Webhook processing attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries && this.isRetryableError(error as Error)) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.sleep(delay);
          continue;
        }
        break;
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Core webhook processing logic
   */
  private async processWebhookEvent(event: WebhookEvent): Promise<Omit<ProcessingResult, 'duration'>> {
    const actions: string[] = [];
    let workflowId: string | undefined;
    let leadId: string | undefined;

    try {
      // Process based on event type
      switch (event.type) {
        case 'call-start':
        case 'call_started':
          actions.push('call_tracking_started');
          workflowId = await this.startCallWorkflow(event);
          break;

        case 'transcript':
        case 'utterance':
          actions.push('transcript_processed');
          await this.processTranscript(event);
          break;

        case 'function-call':
        case 'tool-calls':
          actions.push('function_call_executed');
          await this.processFunctionCall(event);
          break;

        case 'call-end':
        case 'call_ended':
        case 'completed':
          actions.push('call_completed');
          leadId = await this.processCallEnd(event);
          await this.completeCallWorkflow(event);
          break;

        case 'call-failed':
        case 'failed':
          actions.push('call_failure_handled');
          await this.processCallFailure(event);
          break;

        default:
          actions.push('event_logged');
          console.log(`📝 Unhandled event type: ${event.type}`);
      }

      // Always store the event for analytics
      await this.storeWebhookEvent(event);
      actions.push('event_stored');

      // Update real-time metrics
      await this.updateRealtimeMetrics(event);
      actions.push('metrics_updated');

      return {
        success: true,
        workflowId,
        leadId,
        actions
      };

    } catch (error) {
      console.error(`❌ Error processing ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Start Temporal workflow for call processing
   */
  private async startCallWorkflow(event: WebhookEvent): Promise<string | undefined> {
    if (!this.temporalClient) return undefined;

    try {
      const workflowId = `voice-call-${event.callId}`;
      
      const handle = await this.temporalClient.workflow.start('enhancedVoiceCallWorkflow', {
        workflowId,
        taskQueue: 'voice-processing',
        args: [{
          callId: event.callId,
          tenantId: event.tenantId,
          phoneNumber: event.phoneNumber,
          provider: event.provider,
          startTime: event.timestamp,
          metadata: event.data
        }],
        workflowExecutionTimeout: '1 hour'
      });

      this.metrics.temporalWorkflowsStarted++;
      console.log(`🔄 Started Temporal workflow: ${workflowId}`);
      
      return workflowId;

    } catch (error) {
      console.error('❌ Failed to start Temporal workflow:', error);
      // Don't throw - continue without workflow
      return undefined;
    }
  }

  private async processTranscript(event: WebhookEvent): Promise<void> {
    const transcript = event.data.transcript || event.data.text;
    const speaker = event.data.speaker || event.data.role;
    
    if (!transcript) return;

    // Real-time analysis
    const analysis = await this.analyzeTranscript({
      text: transcript,
      speaker,
      timestamp: event.timestamp,
      callId: event.callId
    });

    // Store transcript with analysis
    await this.storeTranscript({
      callId: event.callId,
      timestamp: event.timestamp,
      speaker,
      text: transcript,
      confidence: event.data.confidence,
      analysis
    });

    // Send to real-time processing if needed
    if (analysis.needsAttention) {
      await this.triggerRealtimeAlert(event.callId, analysis);
    }
  }

  private async processFunctionCall(event: WebhookEvent): Promise<void> {
    const functionCall = event.data.toolCalls?.[0] || event.data.function;
    
    if (!functionCall) return;

    console.log(`🔧 Processing function call: ${functionCall.name}`);

    switch (functionCall.name) {
      case 'update_qualification_score':
        await this.updateQualificationScore(event.callId, functionCall.parameters);
        break;

      case 'schedule_appointment':
        await this.scheduleAppointment(event.callId, functionCall.parameters);
        break;

      case 'transfer_to_human':
        await this.initiateTransfer(event.callId, functionCall.parameters);
        break;

      case 'send_follow_up_sms':
        await this.scheduleSMS(event.callId, functionCall.parameters);
        break;

      default:
        console.log(`⚠️ Unknown function call: ${functionCall.name}`);
    }
  }

  private async processCallEnd(event: WebhookEvent): Promise<string | undefined> {
    const callDuration = event.data.duration || event.data.call?.duration;
    const callStatus = event.data.status || event.data.call?.status;

    console.log(`📞 Call ended: ${event.callId}, Duration: ${callDuration}s, Status: ${callStatus}`);

    // Create or update lead record
    const leadId = await this.createLeadFromCall({
      callId: event.callId,
      phoneNumber: event.phoneNumber,
      tenantId: event.tenantId,
      duration: callDuration,
      status: callStatus,
      provider: event.provider,
      endTime: event.timestamp
    });

    // Trigger post-call workflows
    if (this.temporalClient) {
      await this.temporalClient.workflow.start('postCallProcessingWorkflow', {
        workflowId: `post-call-${event.callId}`,
        taskQueue: 'post-call-processing',
        args: [{
          callId: event.callId,
          leadId,
          tenantId: event.tenantId
        }]
      });
    }

    return leadId;
  }

  private async processCallFailure(event: WebhookEvent): Promise<void> {
    const error = event.data.error || event.data.reason || 'Unknown error';
    
    console.error(`☎️❌ Call failed: ${event.callId}, Error: ${error}`);

    // Record failure for analysis
    await this.recordCallFailure({
      callId: event.callId,
      phoneNumber: event.phoneNumber,
      tenantId: event.tenantId,
      provider: event.provider,
      error,
      timestamp: event.timestamp
    });

    // Potentially schedule retry or escalation
    if (this.shouldRetryCall(error)) {
      await this.scheduleCallRetry(event.callId, event.tenantId);
    }
  }

  // Circuit breaker implementation
  private isCircuitClosed(tenantId: string): boolean {
    const breaker = this.circuitBreakers.get(tenantId);
    if (!breaker) return true;

    const now = new Date();
    
    switch (breaker.status) {
      case 'closed':
        return true;
        
      case 'open':
        if (now >= breaker.nextAttempt) {
          breaker.status = 'half-open';
          return true;
        }
        return false;
        
      case 'half-open':
        return true;
        
      default:
        return true;
    }
  }

  private recordCircuitBreakerFailure(tenantId: string): void {
    const breaker = this.circuitBreakers.get(tenantId) || {
      failures: 0,
      lastFailure: new Date(),
      status: 'closed' as const,
      nextAttempt: new Date()
    };

    breaker.failures++;
    breaker.lastFailure = new Date();

    // Open circuit after 5 failures in 5 minutes
    if (breaker.failures >= 5 && breaker.status === 'closed') {
      breaker.status = 'open';
      breaker.nextAttempt = new Date(Date.now() + 30000); // Try again in 30 seconds
      this.metrics.circuitBreakerTrips++;
      
      console.warn(`🚨 Circuit breaker OPEN for tenant ${tenantId}`);
    }

    this.circuitBreakers.set(tenantId, breaker);
  }

  private resetCircuitBreaker(tenantId: string): void {
    const breaker = this.circuitBreakers.get(tenantId);
    if (breaker) {
      breaker.failures = 0;
      breaker.status = 'closed';
      this.circuitBreakers.set(tenantId, breaker);
    }
  }

  // Helper methods
  private isTransientError(error: Error): boolean {
    const transientErrors = [
      'ETIMEDOUT',
      'ECONNRESET',
      'ENOTFOUND',
      'EAI_AGAIN',
      '503',
      '502',
      '504'
    ];
    
    return transientErrors.some(err => 
      error.message.includes(err) || error.name.includes(err)
    );
  }

  private isRetryableError(error: Error): boolean {
    const nonRetryableErrors = [
      'ValidationError',
      'AuthenticationError',
      'RateLimitError'
    ];
    
    return !nonRetryableErrors.some(err => 
      error.message.includes(err) || error.name.includes(err)
    );
  }

  private async queueForRetry(event: WebhookEvent): Promise<void> {
    const tenantQueue = this.processingQueue.get(event.tenantId) || [];
    event.retryCount = (event.retryCount || 0) + 1;
    
    if (event.retryCount <= 3) {
      tenantQueue.push(event);
      this.processingQueue.set(event.tenantId, tenantQueue);
      console.log(`📥 Queued event for retry: ${event.id}, attempt ${event.retryCount}`);
    }
  }

  private startQueueProcessor(): void {
    setInterval(async () => {
      for (const [tenantId, queue] of this.processingQueue.entries()) {
        if (queue.length > 0 && this.isCircuitClosed(tenantId)) {
          const event = queue.shift()!;
          try {
            await this.processWebhookEvent(event);
            console.log(`✅ Retry successful for event: ${event.id}`);
          } catch (error) {
            console.error(`❌ Retry failed for event: ${event.id}`, error);
          }
        }
      }
    }, 10000); // Process retries every 10 seconds
  }

  private updateProcessingTime(duration: number): void {
    const count = this.metrics.successfulRequests;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (count - 1) + duration) / count;
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      const successRate = this.metrics.totalRequests > 0 ? 
        (this.metrics.successfulRequests / this.metrics.totalRequests * 100) : 100;
        
      console.log('📊 Webhook Handler Metrics:', {
        totalRequests: this.metrics.totalRequests,
        successRate: `${successRate.toFixed(2)}%`,
        averageProcessingTime: `${this.metrics.averageProcessingTime.toFixed(2)}ms`,
        temporalWorkflows: this.metrics.temporalWorkflowsStarted,
        circuitBreakerTrips: this.metrics.circuitBreakerTrips,
        securityValidationFailures: this.metrics.securityValidationFailures
      });
    }, 60000); // Report every minute
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Placeholder implementations for processing functions
  private async analyzeTranscript(params: any): Promise<any> { return { needsAttention: false }; }
  private async storeTranscript(params: any): Promise<void> { }
  private async storeWebhookEvent(event: WebhookEvent): Promise<void> { }
  private async updateRealtimeMetrics(event: WebhookEvent): Promise<void> { }
  private async triggerRealtimeAlert(callId: string, analysis: any): Promise<void> { }
  private async updateQualificationScore(callId: string, params: any): Promise<void> { }
  private async scheduleAppointment(callId: string, params: any): Promise<void> { }
  private async initiateTransfer(callId: string, params: any): Promise<void> { }
  private async scheduleSMS(callId: string, params: any): Promise<void> { }
  private async createLeadFromCall(params: any): Promise<string> { return 'lead-' + Date.now(); }
  private async completeCallWorkflow(event: WebhookEvent): Promise<void> { }
  private async recordCallFailure(params: any): Promise<void> { }
  private shouldRetryCall(error: string): boolean { return false; }
  private async scheduleCallRetry(callId: string, tenantId: string): Promise<void> { }

  /**
   * Determine event priority for Dead Letter Queue processing
   * Critical events get highest priority for recovery
   */
  private determinePriority(eventType: string): 'critical' | 'high' | 'medium' | 'low' {
    const priorityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      // Critical business events - immediate attention required
      'call-start': 'critical',
      'call_started': 'critical',
      'call-end': 'critical', 
      'call_ended': 'critical',
      'completed': 'critical',
      
      // High priority - important for operations
      'call-failed': 'high',
      'failed': 'high',
      'function-call': 'high',
      'tool-calls': 'high',
      
      // Medium priority - valuable but not urgent
      'transcript': 'medium',
      'utterance': 'medium',
      
      // Low priority - informational events
      'status-update': 'low',
      'heartbeat': 'low',
      'ping': 'low'
    };

    return priorityMap[eventType] || 'medium';
  }

  // Public methods for monitoring
  public getMetrics() {
    return { ...this.metrics };
  }

  public getCircuitBreakerStatus() {
    return Object.fromEntries(this.circuitBreakers.entries());
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (this.temporalClient) {
        await this.temporalClient.workflowService.getSystemInfo({});
      }
      return true;
    } catch {
      return false;
    }
  }
}

export default EnhancedWebhookHandler;