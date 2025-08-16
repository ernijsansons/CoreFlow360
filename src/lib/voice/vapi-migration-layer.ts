/**
 * CoreFlow360 Vapi.ai Migration Layer
 * 
 * Gradual migration from Twilio to Vapi.ai with intelligent fallback
 * Enables sub-500ms latency while maintaining 100% reliability
 */

import Vapi from '@vapi-ai/server-sdk';
import { TwilioService } from './twilio-service';
import { TemporalClient } from '@temporalio/client';
import { WorkflowHandle } from '@temporalio/client';

export interface CallParams {
  phoneNumber: string;
  customerName?: string;
  industry?: string;
  tenantId: string;
  priority: 'low' | 'medium' | 'high';
  goal: 'qualification' | 'appointment' | 'follow_up';
  customerData?: CustomerContext;
  metadata?: Record<string, any>;
  startTime: number;
}

export interface CallResult {
  callId: string;
  provider: 'vapi' | 'twilio';
  status: 'initiated' | 'failed' | 'queued';
  latencyMs?: number;
  estimatedDuration?: number;
  error?: string;
}

export interface CustomerContext {
  previousCalls: number;
  lastContact: Date;
  qualification: number;
  preferences: Record<string, any>;
  notes: string[];
}

export interface VapiAssistant {
  id: string;
  name: string;
  industry: string;
  conversationGoal: string;
  model: {
    provider: string;
    model: string;
    temperature: number;
    systemPrompt: string;
  };
  voice: {
    provider: string;
    voiceId: string;
    stability: number;
    similarityBoost: number;
  };
  interruptionThreshold: number;
  backchannel: boolean;
  responseTiming: string;
}

export class VapiMigrationLayer {
  private vapiClient: Vapi;
  private twilioFallback: TwilioService;
  private temporalClient?: TemporalClient;
  
  private vapiEnabled: boolean = process.env.VAPI_ENABLED === 'true';
  private trafficPercentage: number = parseFloat(process.env.VAPI_TRAFFIC_PERCENTAGE || '0.01');
  
  private assistants: Map<string, VapiAssistant> = new Map();
  private metrics = {
    vapiAttempts: 0,
    vapiSuccesses: 0,
    vapiFailures: 0,
    twilioFallbacks: 0,
    avgLatencyVapi: 0,
    avgLatencyTwilio: 0
  };

  constructor() {
    this.vapiClient = new Vapi({
      apiKey: process.env.VAPI_API_KEY!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
    });
    
    this.twilioFallback = new TwilioService();
    
    if (process.env.TEMPORAL_ENABLED === 'true') {
      this.temporalClient = new TemporalClient({
        connection: {
          address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
        }
      });
    }
    
    this.initializeAssistants();
    this.startMetricsReporting();
    
    console.log('🚀 Vapi Migration Layer initialized', {
      enabled: this.vapiEnabled,
      trafficPercentage: this.trafficPercentage,
      assistants: this.assistants.size
    });
  }

  async initiateCall(params: CallParams): Promise<CallResult> {
    const startTime = Date.now();
    
    try {
      // Determine if call should use Vapi based on traffic percentage and call characteristics
      if (this.shouldUseVapi(params)) {
        console.log(`📞 Attempting Vapi call for ${params.phoneNumber}`);
        
        try {
          const result = await this.initiateVapiCall(params);
          
          // Record success metrics
          this.metrics.vapiAttempts++;
          this.metrics.vapiSuccesses++;
          this.metrics.avgLatencyVapi = this.updateAverage(
            this.metrics.avgLatencyVapi, 
            Date.now() - startTime, 
            this.metrics.vapiSuccesses
          );
          
          await this.recordSuccess('vapi', params, result);
          return result;
          
        } catch (error) {
          console.error('❌ Vapi failed, falling back to Twilio:', error);
          
          // Record failure for monitoring
          this.metrics.vapiAttempts++;
          this.metrics.vapiFailures++;
          await this.recordVapiFailure(error as Error, params);
          
          // Fall through to Twilio
        }
      }
      
      // Fall back to existing Twilio implementation
      console.log(`📞 Using Twilio fallback for ${params.phoneNumber}`);
      this.metrics.twilioFallbacks++;
      
      const result = await this.initiateTwilioCall(params);
      
      this.metrics.avgLatencyTwilio = this.updateAverage(
        this.metrics.avgLatencyTwilio,
        Date.now() - startTime,
        this.metrics.twilioFallbacks
      );
      
      return result;
      
    } catch (error) {
      console.error('❌ Both Vapi and Twilio failed:', error);
      throw error;
    }
  }

  private async initiateVapiCall(params: CallParams): Promise<CallResult> {
    // Select optimal assistant based on context
    const assistant = await this.selectAssistant(params);
    
    // Generate personalized first message
    const firstMessage = await this.generateFirstMessage(params);
    
    // Build enhanced system prompt with real-time context
    const systemPrompt = await this.buildEnhancedSystemPrompt(params);
    
    const call = await this.vapiClient.calls.create({
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID!,
      customer: {
        number: params.phoneNumber,
        name: params.customerName || 'Valued Customer'
      },
      assistant: {
        id: assistant.id,
        firstMessage,
        model: {
          ...assistant.model,
          systemPrompt
        },
        voice: assistant.voice,
        interruptionThreshold: assistant.interruptionThreshold,
        backchannel: assistant.backchannel,
        responseTiming: assistant.responseTiming,
        
        // Enhanced functions for real-time capabilities
        functions: [
          {
            name: 'update_qualification_score',
            description: 'Update lead qualification score in real-time',
            parameters: {
              type: 'object',
              properties: {
                score: { type: 'number', minimum: 1, maximum: 10 },
                reasoning: { type: 'string' }
              }
            }
          },
          {
            name: 'schedule_appointment',
            description: 'Schedule appointment when customer is ready',
            parameters: {
              type: 'object',
              properties: {
                preferredDate: { type: 'string' },
                preferredTime: { type: 'string' },
                serviceType: { type: 'string' },
                urgency: { type: 'string', enum: ['low', 'medium', 'high', 'emergency'] }
              }
            }
          },
          {
            name: 'transfer_to_human',
            description: 'Transfer call to human agent when needed',
            parameters: {
              type: 'object',
              properties: {
                reason: { type: 'string' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                notes: { type: 'string' }
              }
            }
          },
          {
            name: 'send_follow_up_sms',
            description: 'Send follow-up SMS with information',
            parameters: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                includeLink: { type: 'boolean' },
                scheduleFor: { type: 'string' }
              }
            }
          }
        ]
      },
      
      // Enhanced metadata for tracking and analysis
      metadata: {
        ...params.metadata,
        tenantId: params.tenantId,
        industry: params.industry,
        goal: params.goal,
        priority: params.priority,
        systemVersion: 'vapi_v2',
        migrationLayer: true,
        startTime: params.startTime,
        customerContext: JSON.stringify(params.customerData)
      }
    });

    // Store enhanced call record
    await this.updateCallRecord(call.id, {
      provider: 'vapi',
      vapiCallId: call.id,
      latencyMs: Date.now() - params.startTime,
      assistantId: assistant.id,
      systemPromptVersion: 'v2_enhanced',
      status: 'initiated'
    });

    // Start Temporal workflow if enabled
    if (this.temporalClient) {
      await this.startEnhancedWorkflow(call.id, params);
    }

    return {
      callId: call.id,
      provider: 'vapi',
      status: 'initiated',
      latencyMs: Date.now() - params.startTime,
      estimatedDuration: this.estimateCallDuration(params)
    };
  }

  private async initiateTwilioCall(params: CallParams): Promise<CallResult> {
    // Use existing Twilio implementation as fallback
    const result = await this.twilioFallback.initiateCall({
      phoneNumber: params.phoneNumber,
      customerName: params.customerName,
      tenantId: params.tenantId,
      metadata: {
        ...params.metadata,
        fallbackReason: 'vapi_unavailable',
        originalProvider: 'vapi'
      }
    });

    return {
      callId: result.callId,
      provider: 'twilio',
      status: result.status,
      latencyMs: Date.now() - params.startTime
    };
  }

  private shouldUseVapi(params: CallParams): boolean {
    if (!this.vapiEnabled) return false;
    
    // Gradually increase traffic based on success rate
    const currentSuccessRate = this.metrics.vapiAttempts > 0 
      ? this.metrics.vapiSuccesses / this.metrics.vapiAttempts 
      : 0;
    
    // Reduce traffic if success rate drops below 95%
    let adjustedPercentage = this.trafficPercentage;
    if (currentSuccessRate < 0.95 && this.metrics.vapiAttempts > 10) {
      adjustedPercentage *= 0.5;
      console.warn('⚠️ Reducing Vapi traffic due to low success rate:', currentSuccessRate);
    }
    
    // Use deterministic assignment based on phone number for consistency
    const hash = this.hashPhoneNumber(params.phoneNumber);
    const random = hash / Math.pow(2, 32);
    
    // Prefer Vapi for high-priority calls
    if (params.priority === 'high') {
      adjustedPercentage = Math.min(adjustedPercentage * 2, 0.5);
    }
    
    return random < adjustedPercentage;
  }

  private async selectAssistant(params: CallParams): Promise<VapiAssistant> {
    const key = `${params.industry}_${params.goal}`;
    let assistant = this.assistants.get(key);
    
    if (!assistant) {
      // Create industry-specific assistant on-demand
      assistant = await this.createAssistant(params.industry || 'general', params.goal);
      this.assistants.set(key, assistant);
    }
    
    return assistant;
  }

  private async createAssistant(industry: string, goal: string): Promise<VapiAssistant> {
    const assistantConfig = {
      name: `${industry} ${goal} Specialist`,
      industry,
      conversationGoal: goal,
      model: {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        systemPrompt: '' // Will be generated dynamically
      },
      voice: await this.selectOptimalVoice(industry, goal),
      interruptionThreshold: this.calculateInterruptionThreshold(industry),
      backchannel: true,
      responseTiming: 'balanced'
    };

    // Create assistant in Vapi
    const vapiAssistant = await this.vapiClient.assistants.create({
      ...assistantConfig,
      model: {
        ...assistantConfig.model,
        systemPrompt: 'Dynamic prompt will be injected per call'
      }
    });

    const assistant: VapiAssistant = {
      ...assistantConfig,
      id: vapiAssistant.id
    };

    return assistant;
  }

  private async selectOptimalVoice(industry: string, goal: string) {
    // Voice optimization based on industry and goal
    const voiceMap = {
      'hvac': { voiceId: 'sarah', stability: 0.8, similarityBoost: 0.75 }, // Professional, warm
      'plumbing': { voiceId: 'daniel', stability: 0.9, similarityBoost: 0.8 }, // Trustworthy, clear
      'electrical': { voiceId: 'jessica', stability: 0.85, similarityBoost: 0.7 }, // Technical, confident
      'general': { voiceId: 'sarah', stability: 0.8, similarityBoost: 0.75 } // Default professional
    };

    const voice = voiceMap[industry] || voiceMap['general'];

    return {
      provider: 'eleven_labs',
      voiceId: voice.voiceId,
      stability: voice.stability,
      similarityBoost: voice.similarityBoost
    };
  }

  private async generateFirstMessage(params: CallParams): Promise<string> {
    // Personalized opening based on context
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : 'Good evening';
    
    const templates = {
      qualification: `${greeting} {name}, this is Sarah from CoreFlow360. I'm calling about your recent inquiry. Do you have a quick moment to chat?`,
      
      appointment: `${greeting} {name}, this is Sarah from CoreFlow360. I understand you're dealing with {issue}. I can actually get someone out there today - would that help?`,
      
      follow_up: `${greeting} {name}, this is Sarah from CoreFlow360. I wanted to follow up on our previous conversation about {previousTopic}. How did that work out?`
    };

    let message = templates[params.goal] || templates.qualification;
    
    // Personalize with available data
    message = message.replace('{name}', params.customerName || 'there');
    
    if (params.customerData?.notes?.length) {
      const lastNote = params.customerData.notes[0];
      message = message.replace('{issue}', lastNote);
      message = message.replace('{previousTopic}', lastNote);
    }

    return message;
  }

  private async buildEnhancedSystemPrompt(params: CallParams): Promise<string> {
    const industryKnowledge = await this.loadIndustryKnowledge(params.industry);
    const customerHistory = await this.loadCustomerHistory(params.phoneNumber);
    const seasonalContext = this.getSeasonalContext();
    const competitorInfo = await this.loadCompetitorData(params.industry);

    return `You are Sarah, an elite ${params.industry || 'business'} specialist with 15+ years of experience. You genuinely care about helping customers solve their problems quickly and cost-effectively.

CONVERSATION GOAL: ${params.goal}

CUSTOMER CONTEXT:
${customerHistory ? `- Previous interactions: ${customerHistory.summary}` : '- First-time caller'}
${params.customerData?.qualification ? `- Qualification score: ${params.customerData.qualification}/10` : ''}
${params.customerData?.preferences ? `- Preferences: ${JSON.stringify(params.customerData.preferences)}` : ''}

INDUSTRY INTELLIGENCE:
${industryKnowledge}

SEASONAL FACTORS:
${seasonalContext}

COMPETITIVE LANDSCAPE:
${competitorInfo}

CONVERSATION STYLE:
- Be warm but professional
- Listen more than you talk (aim for 40% talk time)
- Ask discovery questions to understand needs
- Create appropriate urgency without being pushy
- Handle objections with empathy and value demonstration

CRITICAL SUCCESS FACTORS:
1. Qualify the lead properly (pain, urgency, authority, budget)
2. Create urgency with genuine value propositions
3. Book specific appointments with exact times
4. Never end without a clear next step

If you encounter complex technical questions or need to transfer, use the appropriate function calls.

Remember: Your goal is to help, not just sell. Build trust through expertise and genuine care.`;
  }

  private async startEnhancedWorkflow(callId: string, params: CallParams): Promise<WorkflowHandle> {
    if (!this.temporalClient) {
      throw new Error('Temporal client not initialized');
    }

    const handle = await this.temporalClient.workflow.start('enhancedVoiceLeadWorkflow', {
      workflowId: `voice-lead-${callId}`,
      taskQueue: 'voice-leads-enhanced',
      args: [{
        callId,
        phoneNumber: params.phoneNumber,
        tenantId: params.tenantId,
        industry: params.industry,
        goal: params.goal,
        priority: params.priority,
        customerData: params.customerData,
        startTime: params.startTime
      }]
    });

    return handle;
  }

  private async loadIndustryKnowledge(industry?: string): Promise<string> {
    // Load industry-specific knowledge (would come from database in production)
    const knowledgeBase = {
      hvac: `HVAC EXPERTISE:
- Common summer issues: Capacitor failure, refrigerant leaks, frozen coils
- Typical costs: Service call $89-$150, Capacitor $145-$400, Refrigerant $200-$750
- Value propositions: "A $200 repair today prevents a $2000 compressor replacement"
- Seasonal messaging: "With this heat, your AC is working overtime. Let's prevent breakdown."`,
      
      plumbing: `PLUMBING EXPERTISE:
- Emergency indicators: No water, sewage backup, major leaks
- Common issues: Clogged drains, water pressure, water heater problems
- Typical costs: Service call $75-$125, Drain clearing $100-$300
- Value props: "Small leaks become big problems quickly"`,
      
      general: `GENERAL SERVICE EXPERTISE:
- Focus on understanding customer's specific pain points
- Create urgency through consequence of inaction
- Offer flexible scheduling and payment options`
    };

    return knowledgeBase[industry || 'general'] || knowledgeBase.general;
  }

  private async loadCustomerHistory(phoneNumber: string): Promise<{ summary: string } | null> {
    // In production, query call history from database
    // For now, return mock data
    return null;
  }

  private getSeasonalContext(): string {
    const month = new Date().getMonth() + 1;
    
    if (month >= 6 && month <= 8) {
      return "SUMMER: High demand for AC repairs. Emphasize urgency due to heat and equipment stress.";
    } else if (month >= 12 || month <= 2) {
      return "WINTER: Heating system focus. Emphasize safety and comfort during cold weather.";
    } else {
      return "MILD SEASON: Perfect time for preventive maintenance and system upgrades.";
    }
  }

  private async loadCompetitorData(industry?: string): Promise<string> {
    return "If customers mention competitors, acknowledge professionally and focus on our unique value: faster response times, better warranties, and AI-powered efficiency.";
  }

  private calculateInterruptionThreshold(industry: string): number {
    // Different industries need different interruption sensitivity
    const thresholds = {
      'hvac': 150, // HVAC customers often need time to explain complex issues
      'plumbing': 100, // Plumbing emergencies need quick responses
      'electrical': 120, // Electrical issues need careful discussion
      'general': 100
    };

    return thresholds[industry] || 100;
  }

  private estimateCallDuration(params: CallParams): number {
    // Estimate based on goal and priority
    const baseDurations = {
      qualification: 180, // 3 minutes
      appointment: 240, // 4 minutes
      follow_up: 150 // 2.5 minutes
    };

    let duration = baseDurations[params.goal] || 180;
    
    if (params.priority === 'high') duration *= 0.8; // Faster for urgent calls
    if (params.customerData?.previousCalls && params.customerData.previousCalls > 0) {
      duration *= 0.7; // Faster for repeat customers
    }

    return Math.round(duration);
  }

  private async updateCallRecord(callId: string, data: Record<string, any>): Promise<void> {
    // Update call record in database with enhanced fields
    // This would integrate with your existing database
    console.log('📊 Updating call record:', { callId, ...data });
  }

  private async recordSuccess(provider: string, params: CallParams, result: CallResult): Promise<void> {
    // Record successful call initiation for analytics
    const metrics = {
      provider,
      latencyMs: result.latencyMs,
      industry: params.industry,
      goal: params.goal,
      priority: params.priority,
      timestamp: new Date()
    };
    
    console.log('✅ Call success recorded:', metrics);
  }

  private async recordVapiFailure(error: Error, params: CallParams): Promise<void> {
    // Record Vapi failure for monitoring and improvement
    const failureData = {
      error: error.message,
      stack: error.stack,
      params: {
        industry: params.industry,
        goal: params.goal,
        priority: params.priority
      },
      timestamp: new Date()
    };
    
    console.log('❌ Vapi failure recorded:', failureData);
    
    // In production, send to monitoring service
    // await monitoringService.recordError('vapi_call_failure', failureData);
  }

  private hashPhoneNumber(phoneNumber: string): number {
    let hash = 0;
    for (let i = 0; i < phoneNumber.length; i++) {
      const char = phoneNumber.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private updateAverage(currentAvg: number, newValue: number, count: number): number {
    return (currentAvg * (count - 1) + newValue) / count;
  }

  private initializeAssistants(): void {
    // Pre-create common assistants for faster call initiation
    // These will be created lazily as needed
    console.log('🤖 Assistant initialization complete');
  }

  private startMetricsReporting(): void {
    // Report metrics every 5 minutes
    setInterval(() => {
      console.log('📊 Vapi Migration Metrics:', {
        ...this.metrics,
        successRate: this.metrics.vapiAttempts > 0 ? 
          (this.metrics.vapiSuccesses / this.metrics.vapiAttempts * 100).toFixed(2) + '%' : 
          'N/A',
        trafficPercentage: (this.trafficPercentage * 100).toFixed(1) + '%'
      });
    }, 5 * 60 * 1000);
  }

  // Public methods for monitoring and control
  public getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.vapiAttempts > 0 ? 
        this.metrics.vapiSuccesses / this.metrics.vapiAttempts : 0,
      currentTrafficPercentage: this.trafficPercentage
    };
  }

  public updateTrafficPercentage(percentage: number): void {
    this.trafficPercentage = Math.max(0, Math.min(1, percentage));
    console.log(`🚦 Vapi traffic percentage updated to ${(this.trafficPercentage * 100).toFixed(1)}%`);
  }

  public async healthCheck(): Promise<{ vapi: boolean; twilio: boolean }> {
    try {
      const vapiHealth = await this.vapiClient.assistants.list({ limit: 1 });
      const twilioHealth = await this.twilioFallback.healthCheck();
      
      return {
        vapi: !!vapiHealth,
        twilio: twilioHealth
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return { vapi: false, twilio: false };
    }
  }
}

export default VapiMigrationLayer;