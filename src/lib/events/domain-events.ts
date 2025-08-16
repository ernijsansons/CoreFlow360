/**
 * CoreFlow360 - Domain Events
 * 
 * Predefined domain events for business operations with strong typing
 */

import { DomainEvent, EventMetadata } from './event-store';

// Base event interface for type safety
export interface BaseEvent {
  aggregateId: string;
  aggregateType: string;
  tenantId: string;
  userId?: string;
  metadata?: Partial<EventMetadata>;
}

// Customer Domain Events
export interface CustomerCreatedEvent extends BaseEvent {
  aggregateType: 'Customer';
  eventType: 'CustomerCreated';
  data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    industry?: string;
    source?: string;
    customFields?: Record<string, any>;
  };
}

export interface CustomerUpdatedEvent extends BaseEvent {
  aggregateType: 'Customer';
  eventType: 'CustomerUpdated';
  data: {
    previousValues: Record<string, any>;
    updatedValues: Record<string, any>;
    changeReason?: string;
  };
}

export interface CustomerDeletedEvent extends BaseEvent {
  aggregateType: 'Customer';
  eventType: 'CustomerDeleted';
  data: {
    deletionReason?: string;
    finalSnapshot: Record<string, any>;
  };
}

// Subscription Domain Events
export interface SubscriptionCreatedEvent extends BaseEvent {
  aggregateType: 'Subscription';
  eventType: 'SubscriptionCreated';
  data: {
    customerId: string;
    planId: string;
    modules: string[];
    billingCycle: 'monthly' | 'yearly';
    price: number;
    currency: string;
    trialPeriodDays?: number;
    stripeSubscriptionId?: string;
  };
}

export interface SubscriptionUpdatedEvent extends BaseEvent {
  aggregateType: 'Subscription';
  eventType: 'SubscriptionUpdated';
  data: {
    previousModules: string[];
    newModules: string[];
    previousPrice: number;
    newPrice: number;
    changeType: 'upgrade' | 'downgrade' | 'modification';
    effectiveDate: Date;
    prorationAmount?: number;
  };
}

export interface SubscriptionCancelledEvent extends BaseEvent {
  aggregateType: 'Subscription';
  eventType: 'SubscriptionCancelled';
  data: {
    cancellationReason: string;
    cancellationDate: Date;
    endDate: Date;
    refundAmount?: number;
    retentionOfferMade?: boolean;
  };
}

// Voice Call Domain Events
export interface CallStartedEvent extends BaseEvent {
  aggregateType: 'VoiceCall';
  eventType: 'CallStarted';
  data: {
    callSid: string;
    fromNumber: string;
    toNumber: string;
    direction: 'inbound' | 'outbound';
    provider: 'twilio' | 'vapi';
    leadId?: string;
    campaignId?: string;
    scriptId?: string;
  };
}

export interface CallEndedEvent extends BaseEvent {
  aggregateType: 'VoiceCall';
  eventType: 'CallEnded';
  data: {
    callSid: string;
    duration: number;
    status: 'completed' | 'failed' | 'busy' | 'no-answer';
    recordingUrl?: string;
    transcript?: string;
    qualificationScore?: number;
    appointmentScheduled?: boolean;
    followUpRequired?: boolean;
  };
}

// Webhook Processing Events
export interface WebhookReceivedEvent extends BaseEvent {
  aggregateType: 'Webhook';
  eventType: 'WebhookReceived';
  data: {
    webhookId: string;
    provider: string;
    endpoint: string;
    payload: Record<string, any>;
    headers: Record<string, string>;
    signature?: string;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  };
}

export interface WebhookProcessedEvent extends BaseEvent {
  aggregateType: 'Webhook';
  eventType: 'WebhookProcessed';
  data: {
    webhookId: string;
    processingTime: number;
    success: boolean;
    actionsPerformed: string[];
    errorDetails?: string;
    retryCount: number;
  };
}

// AI Processing Events
export interface AIInsightGeneratedEvent extends BaseEvent {
  aggregateType: 'AIInsight';
  eventType: 'AIInsightGenerated';
  data: {
    insightType: string;
    confidence: number;
    input: Record<string, any>;
    output: Record<string, any>;
    modelUsed: string;
    processingTime: number;
    correlatedEntityId?: string;
    correlatedEntityType?: string;
  };
}

// Security Events
export interface SecurityViolationDetectedEvent extends BaseEvent {
  aggregateType: 'Security';
  eventType: 'SecurityViolationDetected';
  data: {
    violationType: 'authentication_failure' | 'rate_limit_exceeded' | 'suspicious_activity' | 'data_breach_attempt';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    actionTaken: string;
    requiresInvestigation: boolean;
  };
}

// Business Intelligence Events
export interface MetricCalculatedEvent extends BaseEvent {
  aggregateType: 'Metric';
  eventType: 'MetricCalculated';
  data: {
    metricName: string;
    metricType: 'kpi' | 'gauge' | 'counter' | 'histogram';
    value: number;
    previousValue?: number;
    changePercentage?: number;
    dimensions: Record<string, any>;
    calculationMethod: string;
    timeWindow: string;
  };
}

// Payment Events
export interface PaymentProcessedEvent extends BaseEvent {
  aggregateType: 'Payment';
  eventType: 'PaymentProcessed';
  data: {
    paymentId: string;
    subscriptionId?: string;
    customerId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: 'succeeded' | 'failed' | 'pending' | 'cancelled';
    stripePaymentIntentId?: string;
    failureReason?: string;
    receiptUrl?: string;
  };
}

// Integration Events
export interface ExternalServiceIntegratedEvent extends BaseEvent {
  aggregateType: 'Integration';
  eventType: 'ExternalServiceIntegrated';
  data: {
    serviceName: string;
    serviceType: 'crm' | 'erp' | 'analytics' | 'communication' | 'storage';
    configurationId: string;
    authenticationMethod: 'oauth' | 'api_key' | 'jwt';
    permissions: string[];
    initialSyncCompleted: boolean;
    recordsSynced?: number;
  };
}

// Event Factory Functions for Type Safety
export const createCustomerCreatedEvent = (
  aggregateId: string,
  data: CustomerCreatedEvent['data'],
  metadata: CustomerCreatedEvent['metadata'] & { tenantId: string }
): Omit<CustomerCreatedEvent, 'aggregateType' | 'eventType'> => ({
  aggregateId,
  aggregateType: 'Customer',
  tenantId: metadata.tenantId,
  userId: metadata.userId,
  metadata,
  data
});

export const createSubscriptionCreatedEvent = (
  aggregateId: string,
  data: SubscriptionCreatedEvent['data'],
  metadata: SubscriptionCreatedEvent['metadata'] & { tenantId: string }
): Omit<SubscriptionCreatedEvent, 'aggregateType' | 'eventType'> => ({
  aggregateId,
  aggregateType: 'Subscription',
  tenantId: metadata.tenantId,
  userId: metadata.userId,
  metadata,
  data
});

export const createCallStartedEvent = (
  aggregateId: string,
  data: CallStartedEvent['data'],
  metadata: CallStartedEvent['metadata'] & { tenantId: string }
): Omit<CallStartedEvent, 'aggregateType' | 'eventType'> => ({
  aggregateId,
  aggregateType: 'VoiceCall',
  tenantId: metadata.tenantId,
  userId: metadata.userId,
  metadata,
  data
});

export const createWebhookReceivedEvent = (
  aggregateId: string,
  data: WebhookReceivedEvent['data'],
  metadata: WebhookReceivedEvent['metadata'] & { tenantId: string }
): Omit<WebhookReceivedEvent, 'aggregateType' | 'eventType'> => ({
  aggregateId,
  aggregateType: 'Webhook',
  tenantId: metadata.tenantId,
  userId: metadata.userId,
  metadata,
  data
});

export const createAIInsightGeneratedEvent = (
  aggregateId: string,
  data: AIInsightGeneratedEvent['data'],
  metadata: AIInsightGeneratedEvent['metadata'] & { tenantId: string }
): Omit<AIInsightGeneratedEvent, 'aggregateType' | 'eventType'> => ({
  aggregateId,
  aggregateType: 'AIInsight',
  tenantId: metadata.tenantId,
  userId: metadata.userId,
  metadata,
  data
});

export const createSecurityViolationEvent = (
  aggregateId: string,
  data: SecurityViolationDetectedEvent['data'],
  metadata: SecurityViolationDetectedEvent['metadata'] & { tenantId: string }
): Omit<SecurityViolationDetectedEvent, 'aggregateType' | 'eventType'> => ({
  aggregateId,
  aggregateType: 'Security',
  tenantId: metadata.tenantId,
  userId: metadata.userId,
  metadata,
  data
});

export const createPaymentProcessedEvent = (
  aggregateId: string,
  data: PaymentProcessedEvent['data'],
  metadata: PaymentProcessedEvent['metadata'] & { tenantId: string }
): Omit<PaymentProcessedEvent, 'aggregateType' | 'eventType'> => ({
  aggregateId,
  aggregateType: 'Payment',
  tenantId: metadata.tenantId,
  userId: metadata.userId,
  metadata,
  data
});

// Event Type Registry for Runtime Validation
export const EVENT_TYPES = {
  // Customer Events
  CUSTOMER_CREATED: 'CustomerCreated',
  CUSTOMER_UPDATED: 'CustomerUpdated',
  CUSTOMER_DELETED: 'CustomerDeleted',
  
  // Subscription Events
  SUBSCRIPTION_CREATED: 'SubscriptionCreated',
  SUBSCRIPTION_UPDATED: 'SubscriptionUpdated',
  SUBSCRIPTION_CANCELLED: 'SubscriptionCancelled',
  
  // Voice Call Events
  CALL_STARTED: 'CallStarted',
  CALL_ENDED: 'CallEnded',
  
  // Webhook Events
  WEBHOOK_RECEIVED: 'WebhookReceived',
  WEBHOOK_PROCESSED: 'WebhookProcessed',
  
  // AI Events
  AI_INSIGHT_GENERATED: 'AIInsightGenerated',
  
  // Security Events
  SECURITY_VIOLATION_DETECTED: 'SecurityViolationDetected',
  
  // Business Intelligence Events
  METRIC_CALCULATED: 'MetricCalculated',
  
  // Payment Events
  PAYMENT_PROCESSED: 'PaymentProcessed',
  
  // Integration Events
  EXTERNAL_SERVICE_INTEGRATED: 'ExternalServiceIntegrated'
} as const;

export const AGGREGATE_TYPES = {
  CUSTOMER: 'Customer',
  SUBSCRIPTION: 'Subscription',
  VOICE_CALL: 'VoiceCall',
  WEBHOOK: 'Webhook',
  AI_INSIGHT: 'AIInsight',
  SECURITY: 'Security',
  METRIC: 'Metric',
  PAYMENT: 'Payment',
  INTEGRATION: 'Integration'
} as const;

// Type guards for runtime type checking
export const isCustomerEvent = (event: DomainEvent): event is DomainEvent & { aggregateType: 'Customer' } =>
  event.aggregateType === AGGREGATE_TYPES.CUSTOMER;

export const isSubscriptionEvent = (event: DomainEvent): event is DomainEvent & { aggregateType: 'Subscription' } =>
  event.aggregateType === AGGREGATE_TYPES.SUBSCRIPTION;

export const isVoiceCallEvent = (event: DomainEvent): event is DomainEvent & { aggregateType: 'VoiceCall' } =>
  event.aggregateType === AGGREGATE_TYPES.VOICE_CALL;

export const isWebhookEvent = (event: DomainEvent): event is DomainEvent & { aggregateType: 'Webhook' } =>
  event.aggregateType === AGGREGATE_TYPES.WEBHOOK;

export const isSecurityEvent = (event: DomainEvent): event is DomainEvent & { aggregateType: 'Security' } =>
  event.aggregateType === AGGREGATE_TYPES.SECURITY;