-- CoreFlow360 - Database Optimization
-- Add indexes for better query performance

-- User indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_tenant ON "User"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_last_active ON "User"("lastActiveAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_role ON "User"(role);

-- Customer indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_tenant ON "Customer"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_status ON "Customer"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_email ON "Customer"(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_created ON "Customer"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_tenant_status ON "Customer"("tenantId", status);

-- Deal indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_tenant ON "Deal"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_status ON "Deal"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_customer ON "Deal"("customerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_owner ON "Deal"("ownerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_close_date ON "Deal"("expectedCloseDate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_tenant_status ON "Deal"("tenantId", status);

-- Project indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_tenant ON "Project"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_status ON "Project"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_customer ON "Project"("customerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_dates ON "Project"("startDate", "endDate");

-- Invoice indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_tenant ON "Invoice"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_customer ON "Invoice"("customerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_status ON "Invoice"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_due_date ON "Invoice"("dueDate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_tenant_status ON "Invoice"("tenantId", status);

-- Activity/Audit indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_user ON "Activity"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_tenant ON "Activity"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_entity ON "Activity"("entityType", "entityId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_created ON "Activity"("createdAt");

-- AI-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insight_tenant ON "AIInsight"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insight_user ON "AIInsight"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insight_category ON "AIInsight"(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insight_created ON "AIInsight"("createdAt");

-- Subscription indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_user ON "Subscription"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_status ON "Subscription"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_end_date ON "Subscription"("endDate");

-- Freemium user indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_freemium_user ON "FreemiumUser"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_freemium_agent ON "FreemiumUser"("selectedAgent");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_freemium_last_active ON "FreemiumUser"("lastActiveAt");

-- Conversion event indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_user ON "ConversionEvent"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_tenant ON "ConversionEvent"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_type ON "ConversionEvent"("eventType");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_created ON "ConversionEvent"("createdAt");

-- Session indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_token ON "Session"("sessionToken");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_user ON "Session"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_expires ON "Session"(expires);

-- Communication indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communication_tenant ON "Communication"("tenantId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communication_customer ON "Communication"("customerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communication_type ON "Communication"(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communication_date ON "Communication"("createdAt");

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_search ON "Customer" USING gin(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(company, ''))
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_search ON "Deal" USING gin(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_search ON "Project" USING gin(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_customers ON "Customer"("tenantId") WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_deals ON "Deal"("tenantId", "ownerId") WHERE status IN ('open', 'negotiation');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_overdue_invoices ON "Invoice"("tenantId") WHERE status = 'unpaid' AND "dueDate" < CURRENT_DATE;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recent_activities ON "Activity"("tenantId", "createdAt") WHERE "createdAt" > CURRENT_DATE - INTERVAL '30 days';

-- Composite indexes for common join queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_tenant_role ON "User"("tenantId", role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deal_customer_status ON "Deal"("customerId", status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_customer_status ON "Project"("customerId", status);

-- Update table statistics
ANALYZE "User";
ANALYZE "Customer";
ANALYZE "Deal";
ANALYZE "Project";
ANALYZE "Invoice";
ANALYZE "Activity";
ANALYZE "AIInsight";
ANALYZE "Subscription";
ANALYZE "FreemiumUser";
ANALYZE "ConversionEvent";