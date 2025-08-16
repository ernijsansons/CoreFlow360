-- CreateTable for Event Sourcing
CREATE TABLE "DomainEvent" (
    "id" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "tenantId" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Event Snapshots
CREATE TABLE "EventSnapshot" (
    "id" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checksum" TEXT NOT NULL,

    CONSTRAINT "EventSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Event Projections
CREATE TABLE "EventProjection" (
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "lastProcessedEventId" TEXT,
    "lastProcessedTimestamp" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "isLive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventProjection_pkey" PRIMARY KEY ("name")
);

-- CreateTable for Customer Read Model
CREATE TABLE "CustomerReadModel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "industry" TEXT,
    "source" TEXT,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "lastInteractionDate" TIMESTAMP(3),
    "subscriptionStatus" TEXT,
    "lifetimeValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "riskScore" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CustomerReadModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Subscription Analytics
CREATE TABLE "SubscriptionAnalytics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "monthlyRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "churnRisk" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "usageMetrics" JSONB NOT NULL DEFAULT '{}',
    "expansionOpportunity" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalUpgrades" INTEGER NOT NULL DEFAULT 0,
    "totalDowngrades" INTEGER NOT NULL DEFAULT 0,
    "totalCancellations" INTEGER NOT NULL DEFAULT 0,
    "averageLifetime" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Voice Call Analytics
CREATE TABLE "VoiceCallAnalytics" (
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "inboundCalls" INTEGER NOT NULL DEFAULT 0,
    "outboundCalls" INTEGER NOT NULL DEFAULT 0,
    "averageDuration" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "connectionRate" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "qualificationRate" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "appointmentRate" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "averageQualificationScore" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "transcriptionAccuracy" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "customerSatisfaction" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costPerCall" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costPerQualifiedLead" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "VoiceCallAnalytics_pkey" PRIMARY KEY ("tenantId","date")
);

-- CreateTable for Security Dashboard
CREATE TABLE "SecurityDashboard" (
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalViolations" INTEGER NOT NULL DEFAULT 0,
    "criticalViolations" INTEGER NOT NULL DEFAULT 0,
    "highViolations" INTEGER NOT NULL DEFAULT 0,
    "authenticationFailures" INTEGER NOT NULL DEFAULT 0,
    "rateLimitExceeded" INTEGER NOT NULL DEFAULT 0,
    "suspiciousActivities" INTEGER NOT NULL DEFAULT 0,
    "dataBreachAttempts" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "automaticBlocks" INTEGER NOT NULL DEFAULT 0,
    "manualInvestigations" INTEGER NOT NULL DEFAULT 0,
    "topIpAddresses" JSONB NOT NULL DEFAULT '[]',
    "topUserAgents" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "SecurityDashboard_pkey" PRIMARY KEY ("tenantId","date")
);

-- CreateTable for Webhook Analytics
CREATE TABLE "WebhookAnalytics" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "latency" DECIMAL(10,2) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorType" TEXT,
    "tenantId" TEXT NOT NULL,
    "callId" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "WebhookAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Webhook Metrics Summary
CREATE TABLE "WebhookMetricsSummary" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRequests" INTEGER NOT NULL,
    "successfulRequests" INTEGER NOT NULL,
    "failedRequests" INTEGER NOT NULL,
    "averageLatency" DECIMAL(10,2) NOT NULL,
    "p95Latency" DECIMAL(10,2) NOT NULL,
    "p99Latency" DECIMAL(10,2) NOT NULL,
    "providerBreakdown" JSONB NOT NULL DEFAULT '{}',
    "errorTypes" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "WebhookMetricsSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes for optimal query performance
CREATE INDEX "DomainEvent_aggregateId_aggregateType_idx" ON "DomainEvent"("aggregateId", "aggregateType");
CREATE INDEX "DomainEvent_aggregateId_version_idx" ON "DomainEvent"("aggregateId", "version");
CREATE INDEX "DomainEvent_eventType_idx" ON "DomainEvent"("eventType");
CREATE INDEX "DomainEvent_tenantId_idx" ON "DomainEvent"("tenantId");
CREATE INDEX "DomainEvent_timestamp_idx" ON "DomainEvent"("timestamp");
CREATE INDEX "DomainEvent_metadata_correlationId_idx" ON "DomainEvent" USING GIN ((metadata->>'correlationId'));

CREATE INDEX "EventSnapshot_aggregateId_aggregateType_idx" ON "EventSnapshot"("aggregateId", "aggregateType");
CREATE INDEX "EventSnapshot_aggregateId_version_idx" ON "EventSnapshot"("aggregateId", "version" DESC);

CREATE INDEX "CustomerReadModel_tenantId_idx" ON "CustomerReadModel"("tenantId");
CREATE INDEX "CustomerReadModel_email_idx" ON "CustomerReadModel"("email");
CREATE INDEX "CustomerReadModel_company_idx" ON "CustomerReadModel"("company");
CREATE INDEX "CustomerReadModel_tags_idx" ON "CustomerReadModel" USING GIN ("tags");

CREATE INDEX "SubscriptionAnalytics_tenantId_idx" ON "SubscriptionAnalytics"("tenantId");
CREATE INDEX "SubscriptionAnalytics_customerId_idx" ON "SubscriptionAnalytics"("customerId");
CREATE INDEX "SubscriptionAnalytics_status_idx" ON "SubscriptionAnalytics"("status");

CREATE INDEX "WebhookAnalytics_timestamp_idx" ON "WebhookAnalytics"("timestamp");
CREATE INDEX "WebhookAnalytics_provider_idx" ON "WebhookAnalytics"("provider");
CREATE INDEX "WebhookAnalytics_tenantId_idx" ON "WebhookAnalytics"("tenantId");
CREATE INDEX "WebhookAnalytics_success_idx" ON "WebhookAnalytics"("success");

-- Add unique constraints for aggregate consistency
CREATE UNIQUE INDEX "DomainEvent_aggregateId_version_unique" ON "DomainEvent"("aggregateId", "version");
CREATE UNIQUE INDEX "EventSnapshot_aggregateId_version_unique" ON "EventSnapshot"("aggregateId", "version");

-- Add composite indexes for complex queries
CREATE INDEX "DomainEvent_tenantId_timestamp_idx" ON "DomainEvent"("tenantId", "timestamp" DESC);
CREATE INDEX "DomainEvent_aggregateType_timestamp_idx" ON "DomainEvent"("aggregateType", "timestamp" DESC);

-- Add partial indexes for active data
CREATE INDEX "CustomerReadModel_active_idx" ON "CustomerReadModel"("tenantId", "updatedAt") WHERE NOT ('deleted' = ANY(tags));
CREATE INDEX "SubscriptionAnalytics_active_idx" ON "SubscriptionAnalytics"("tenantId", "status") WHERE status IN ('active', 'trial');