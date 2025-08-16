-- CoreFlow360 Performance Optimization Indexes
-- This migration adds critical indexes for query performance

-- Customer indexes for common queries
CREATE INDEX IF NOT EXISTS idx_customer_tenant_email ON "Customer" ("tenantId", "email");
CREATE INDEX IF NOT EXISTS idx_customer_tenant_created ON "Customer" ("tenantId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_customer_tenant_name ON "Customer" ("tenantId", "firstName", "lastName");
CREATE INDEX IF NOT EXISTS idx_customer_search ON "Customer" USING gin (to_tsvector('english', "firstName" || ' ' || "lastName" || ' ' || COALESCE("email", '')));

-- Deal indexes for pipeline queries
CREATE INDEX IF NOT EXISTS idx_deal_tenant_customer_status ON "Deal" ("tenantId", "customerId", "status");
CREATE INDEX IF NOT EXISTS idx_deal_tenant_stage_value ON "Deal" ("tenantId", "stage", "value" DESC);
CREATE INDEX IF NOT EXISTS idx_deal_tenant_closed ON "Deal" ("tenantId", "closedAt" DESC) WHERE "closedAt" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deal_owner_status ON "Deal" ("ownerId", "status") WHERE "status" != 'CLOSED';

-- User indexes for authentication and queries
CREATE INDEX IF NOT EXISTS idx_user_email_tenant ON "User" ("email", "tenantId");
CREATE INDEX IF NOT EXISTS idx_user_tenant_status ON "User" ("tenantId", "status") WHERE "status" = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_user_last_login ON "User" ("lastLoginAt" DESC NULLS LAST);

-- ConsciousnessInsight indexes for AI queries
CREATE INDEX IF NOT EXISTS idx_consciousness_tenant_status_generated ON "ConsciousnessInsight" ("tenantId", "status", "generatedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_consciousness_tenant_type ON "ConsciousnessInsight" ("tenantId", "insightType", "generatedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_consciousness_confidence ON "ConsciousnessInsight" ("confidenceScore" DESC) WHERE "confidenceScore" > 0.8;

-- TenantSubscription indexes for subscription queries
CREATE INDEX IF NOT EXISTS idx_subscription_stripe ON "TenantSubscription" ("stripeSubscriptionId") WHERE "stripeSubscriptionId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_tenant_status ON "TenantSubscription" ("tenantId", "status");
CREATE INDEX IF NOT EXISTS idx_subscription_renewal ON "TenantSubscription" ("nextBillingDate") WHERE "status" = 'ACTIVE';

-- AuditLog indexes for compliance queries
CREATE INDEX IF NOT EXISTS idx_audit_tenant_entity ON "AuditLog" ("tenantId", "entityType", "entityId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_user_action ON "AuditLog" ("tenantId", "userId", "action", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_audit_date_range ON "AuditLog" ("createdAt" DESC);

-- ActivityLog indexes for recent activity queries
CREATE INDEX IF NOT EXISTS idx_activity_tenant_recent ON "ActivityLog" ("tenantId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON "ActivityLog" ("entityType", "entityId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_recent ON "ActivityLog" ("userId", "createdAt" DESC);

-- AIActivity indexes for AI usage tracking
CREATE INDEX IF NOT EXISTS idx_ai_activity_tenant_model ON "AIActivity" ("tenantId", "modelType", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_ai_activity_cost ON "AIActivity" ("tenantId", "cost" DESC) WHERE "cost" > 0;
CREATE INDEX IF NOT EXISTS idx_ai_activity_latency ON "AIActivity" ("latency" DESC) WHERE "latency" > 1000;

-- ConsciousnessEvent indexes for event tracking
CREATE INDEX IF NOT EXISTS idx_consciousness_event_tenant_type ON "ConsciousnessEvent" ("tenantId", "eventType", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_consciousness_event_module ON "ConsciousnessEvent" ("sourceModule", "timestamp" DESC);

-- Composite indexes for join queries
CREATE INDEX IF NOT EXISTS idx_deal_customer_composite ON "Deal" ("customerId", "tenantId", "status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_user_department_composite ON "User" ("departmentId", "tenantId", "status") WHERE "departmentId" IS NOT NULL;

-- Partial indexes for common filters
CREATE INDEX IF NOT EXISTS idx_customer_active_assignee ON "Customer" ("assigneeId", "tenantId") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_deal_open_high_value ON "Deal" ("tenantId", "value" DESC) WHERE "status" IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL');
CREATE INDEX IF NOT EXISTS idx_user_active_with_permissions ON "User" ("tenantId", "role") WHERE "status" = 'ACTIVE' AND "permissions" IS NOT NULL;

-- Text search indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_customer_fulltext ON "Customer" USING gin (
  to_tsvector('english', 
    COALESCE("firstName", '') || ' ' || 
    COALESCE("lastName", '') || ' ' || 
    COALESCE("email", '') || ' ' || 
    COALESCE("phone", '') || ' ' || 
    COALESCE("address", '')
  )
);

-- BRIN indexes for time-series data (very efficient for large tables)
CREATE INDEX IF NOT EXISTS idx_audit_log_created_brin ON "AuditLog" USING brin ("createdAt");
CREATE INDEX IF NOT EXISTS idx_activity_log_created_brin ON "ActivityLog" USING brin ("createdAt");
CREATE INDEX IF NOT EXISTS idx_ai_activity_created_brin ON "AIActivity" USING brin ("createdAt");

-- Analyze tables to update statistics after creating indexes
ANALYZE "Customer";
ANALYZE "Deal";
ANALYZE "User";
ANALYZE "ConsciousnessInsight";
ANALYZE "TenantSubscription";
ANALYZE "AuditLog";
ANALYZE "ActivityLog";
ANALYZE "AIActivity";
ANALYZE "ConsciousnessEvent";