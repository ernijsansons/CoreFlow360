-- CoreFlow360 Performance Optimization Indexes Migration
-- This migration adds critical composite indexes for 10x scalability

-- Critical tenant-scoped indexes for filtering and sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_customers_tenant_status_created" 
ON "customers" ("tenantId", "status", "createdAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_customers_tenant_email" 
ON "customers" ("tenantId", "email");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deals_tenant_status_created" 
ON "deals" ("tenantId", "status", "createdAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_projects_tenant_status_created" 
ON "projects" ("tenantId", "status", "createdAt");

-- User assignment and filtering indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_customers_assignee_status" 
ON "customers" ("assigneeId", "status") WHERE "assigneeId" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deals_assignee_status" 
ON "deals" ("assigneeId", "status") WHERE "assigneeId" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_projects_assignee_status" 
ON "projects" ("assigneeId", "status") WHERE "assigneeId" IS NOT NULL;

-- User authentication and session indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_tenant_email_status" 
ON "users" ("tenantId", "email", "status");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_tenant_role_status" 
ON "users" ("tenantId", "role", "status");

-- Audit log performance indexes (high volume table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_audit_logs_tenant_created" 
ON "audit_logs" ("tenantId", "createdAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_audit_logs_user_action_created" 
ON "audit_logs" ("userId", "action", "createdAt") WHERE "userId" IS NOT NULL;

-- Subscription and billing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tenant_subscriptions_status_end" 
ON "tenant_subscriptions" ("status", "endDate");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_usage_metrics_subscription_type_recorded" 
ON "usage_metrics" ("subscriptionId", "metricType", "recordedAt");

-- Performance metrics and monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_performance_metrics_type_recorded" 
ON "performance_metrics" ("metricType", "recordedAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_performance_metrics_tenant_recorded" 
ON "performance_metrics" ("tenantId", "recordedAt") WHERE "tenantId" IS NOT NULL;

-- Lead and territory management indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_leads_tenant_status_created" 
ON "leads" ("tenantId", "status", "createdAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_leads_territory_assigned_score" 
ON "leads" ("territoryId", "assignedUserId", "aiScore") WHERE "territoryId" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_territory_visits_territory_date" 
ON "territory_visits" ("territoryId", "visitDate");

-- Customer problem and intelligence indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_customer_problems_tenant_severity_detected" 
ON "customer_problems" ("tenantId", "severity", "detectedAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_customer_problems_company_status" 
ON "customer_problems" ("companyIntelligenceId", "status");

-- Cost audit indexes (new model from schema update)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_cost_audits_tenant_type_started" 
ON "cost_audits" ("tenantId", "auditType", "auditStarted");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_cost_audits_status_savings" 
ON "cost_audits" ("status", "potentialSavings");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_cost_audit_details_audit_category" 
ON "cost_audit_details" ("costAuditId", "category");

-- Voice note and communication indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_voice_notes_tenant_created" 
ON "voice_notes" ("tenantId", "createdAt") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voice_notes');

-- Freemium and conversion tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_freemium_users_tenant_agent" 
ON "freemium_users" ("tenantId", "selectedAgent");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_conversion_events_tenant_type_created" 
ON "conversion_events" ("tenantId", "eventType", "createdAt");

-- Session activity tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_session_activity_user_started" 
ON "user_session_activity" ("userId", "startedAt") WHERE "userId" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_session_activity_tenant_started" 
ON "user_session_activity" ("tenantId", "startedAt");

-- Consciousness system indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_consciousness_states_tenant_tier_level" 
ON "consciousness_states" ("tenantId", "tier", "consciousnessLevel");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_consciousness_insights_state_type_generated" 
ON "consciousness_insights" ("consciousnessStateId", "insightType", "generatedAt");

-- Equipment and maintenance indexes (HVAC)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_work_orders_tenant_status_scheduled" 
ON "work_orders" ("tenantId", "status", "scheduledDate");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_maintenance_logs_equipment_date" 
ON "maintenance_logs" ("equipmentId", "maintenanceDate");

-- Customer location and mapping indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_customer_locations_customer_type" 
ON "customer_locations" ("customerId", "locationType");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_visit_schedules_user_date" 
ON "visit_schedules" ("userId", "scheduledDate");

-- Analytics and reporting partitioning preparation
-- Create function for future partitioning by date
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Add comments for performance monitoring
COMMENT ON INDEX "idx_customers_tenant_status_created" IS 'Performance index for customer listing with tenant isolation';
COMMENT ON INDEX "idx_deals_tenant_status_created" IS 'Performance index for deal pipeline queries';
COMMENT ON INDEX "idx_audit_logs_tenant_created" IS 'Performance index for audit log queries - high volume table';
COMMENT ON INDEX "idx_performance_metrics_type_recorded" IS 'Performance index for metrics dashboard queries';

-- Update table statistics for query planner optimization
ANALYZE "customers";
ANALYZE "deals"; 
ANALYZE "projects";
ANALYZE "users";
ANALYZE "audit_logs";
ANALYZE "tenant_subscriptions";
ANALYZE "performance_metrics";
ANALYZE "leads";
ANALYZE "customer_problems";
ANALYZE "cost_audits";