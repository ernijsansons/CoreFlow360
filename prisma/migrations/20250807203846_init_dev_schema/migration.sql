-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "industryType" TEXT NOT NULL DEFAULT 'GENERAL',
    "industrySubType" TEXT,
    "industrySettings" TEXT NOT NULL DEFAULT '{}',
    "industryFeatures" TEXT NOT NULL DEFAULT '{}',
    "industryWorkflowsConfig" TEXT NOT NULL DEFAULT '{}',
    "industryTemplatesConfig" TEXT NOT NULL DEFAULT '{}',
    "industryCompliance" TEXT NOT NULL DEFAULT '{}',
    "enabledModules" TEXT NOT NULL DEFAULT '{"crm":true,"accounting":true}',
    "moduleSettings" TEXT NOT NULL DEFAULT '{}',
    "workflowConfig" TEXT NOT NULL DEFAULT '{}',
    "automationRules" TEXT NOT NULL DEFAULT '{}',
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiModels" TEXT NOT NULL DEFAULT '{"primary":"gpt-4"}',
    "aiDepartmentConfig" TEXT NOT NULL DEFAULT '{}',
    "aiInsightRetention" INTEGER NOT NULL DEFAULT 90,
    "aiCrossDepartmentSharing" BOOLEAN NOT NULL DEFAULT true,
    "aiGlobalVisibility" TEXT NOT NULL DEFAULT '{}',
    "aiFeatureFlags" TEXT NOT NULL DEFAULT '{"predictive_analytics":true}',
    "aiProcessingRules" TEXT NOT NULL DEFAULT '{}',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "subscriptionPlan" TEXT,
    "billingEmail" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "features" TEXT NOT NULL DEFAULT '{}',
    "limits" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    "emailVerified" DATETIME,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" DATETIME,
    "tenantId" TEXT NOT NULL,
    "departmentId" TEXT,
    "permissions" TEXT NOT NULL DEFAULT '[]',
    "aiAssistantEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiNotificationLevel" TEXT NOT NULL DEFAULT 'medium',
    "aiDepartmentAccess" TEXT NOT NULL DEFAULT '[]',
    "aiPreferences" TEXT,
    "aiInteractionHistory" TEXT,
    "aiProductivityScore" REAL DEFAULT 0,
    "aiLastActivity" DATETIME,
    "enabledModules" TEXT DEFAULT '{}',
    "departmentAIConfig" TEXT DEFAULT '{}',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiModels" TEXT NOT NULL DEFAULT '{}',
    "aiPermissions" TEXT NOT NULL DEFAULT '{}',
    "aiDataVisibility" TEXT NOT NULL DEFAULT '{}',
    "aiAutomationRules" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "departments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "industryData" TEXT DEFAULT '{}',
    "aiScore" REAL DEFAULT 0,
    "aiChurnRisk" REAL DEFAULT 0,
    "aiLifetimeValue" REAL DEFAULT 0,
    "aiLastAnalysisAt" DATETIME,
    "aiRecommendations" TEXT DEFAULT '{}',
    "aiPersonalization" TEXT DEFAULT '{}',
    CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customers_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" REAL,
    "status" TEXT NOT NULL DEFAULT 'LEAD',
    "probability" REAL DEFAULT 0,
    "expectedCloseDate" DATETIME,
    "actualCloseDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "aiPredictedValue" REAL DEFAULT 0,
    "aiWinProbability" REAL DEFAULT 0,
    "aiRecommendedActions" TEXT DEFAULT '{}',
    "aiLastAnalysisAt" DATETIME,
    CONSTRAINT "deals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deals_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deals_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "budget" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT,
    "assigneeId" TEXT,
    "creatorId" TEXT NOT NULL,
    "aiCompletionProbability" REAL DEFAULT 0,
    "aiRiskScore" REAL DEFAULT 0,
    "aiRecommendations" TEXT DEFAULT '{}',
    "aiLastAnalysisAt" DATETIME,
    CONSTRAINT "projects_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "paidDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT,
    "projectId" TEXT,
    "creatorId" TEXT NOT NULL,
    "lineItems" TEXT NOT NULL DEFAULT '[]',
    "taxAmount" REAL DEFAULT 0,
    "discountAmount" REAL DEFAULT 0,
    "aiPaymentProbability" REAL DEFAULT 0,
    "aiPaymentDate" DATETIME,
    "aiRiskFactors" TEXT DEFAULT '{}',
    "aiLastAnalysisAt" DATETIME,
    CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "invoices_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "hourlyRate" REAL,
    CONSTRAINT "time_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "time_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "communications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT,
    "userId" TEXT NOT NULL,
    "metadata" TEXT DEFAULT '{}',
    CONSTRAINT "communications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "communications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "communications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "tenantId" TEXT NOT NULL,
    "department" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT DEFAULT '{}',
    CONSTRAINT "ai_insights_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "result" TEXT,
    "duration" INTEGER,
    "cost" REAL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "department" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    CONSTRAINT "ai_activities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messages" TEXT NOT NULL DEFAULT '[]',
    "context" TEXT DEFAULT '{}',
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT,
    "intent" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ai_conversations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "industry_ai_agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "successRate" REAL DEFAULT 0,
    "averageResponse" INTEGER,
    "totalOperations" INTEGER DEFAULT 0,
    "lastUsedAt" DATETIME,
    CONSTRAINT "industry_ai_agents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "industry_custom_fields" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "displayOrder" INTEGER DEFAULT 0,
    "group" TEXT,
    CONSTRAINT "industry_custom_fields_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "industry_customer_intelligence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "insights" TEXT NOT NULL DEFAULT '{}',
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    CONSTRAINT "industry_customer_intelligence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "industry_customer_intelligence_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "industry_compliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "documents" TEXT DEFAULT '[]',
    "evidence" TEXT DEFAULT '{}',
    CONSTRAINT "industry_compliance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "metadata" TEXT DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_health" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "component" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    CONSTRAINT "system_health_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_stripeCustomerId_key" ON "tenants"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_stripeSubscriptionId_key" ON "tenants"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_domain_idx" ON "tenants"("domain");

-- CreateIndex
CREATE INDEX "tenants_subscriptionStatus_idx" ON "tenants"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "tenants_industryType_idx" ON "tenants"("industryType");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- CreateIndex
CREATE INDEX "departments_tenantId_idx" ON "departments"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenantId_code_key" ON "departments"("tenantId", "code");

-- CreateIndex
CREATE INDEX "customers_tenantId_idx" ON "customers"("tenantId");

-- CreateIndex
CREATE INDEX "customers_assigneeId_idx" ON "customers"("assigneeId");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "deals_tenantId_idx" ON "deals"("tenantId");

-- CreateIndex
CREATE INDEX "deals_customerId_idx" ON "deals"("customerId");

-- CreateIndex
CREATE INDEX "deals_assigneeId_idx" ON "deals"("assigneeId");

-- CreateIndex
CREATE INDEX "deals_status_idx" ON "deals"("status");

-- CreateIndex
CREATE INDEX "projects_tenantId_idx" ON "projects"("tenantId");

-- CreateIndex
CREATE INDEX "projects_customerId_idx" ON "projects"("customerId");

-- CreateIndex
CREATE INDEX "projects_assigneeId_idx" ON "projects"("assigneeId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_customerId_idx" ON "invoices"("customerId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenantId_invoiceNumber_key" ON "invoices"("tenantId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "time_entries_tenantId_idx" ON "time_entries"("tenantId");

-- CreateIndex
CREATE INDEX "time_entries_userId_idx" ON "time_entries"("userId");

-- CreateIndex
CREATE INDEX "time_entries_projectId_idx" ON "time_entries"("projectId");

-- CreateIndex
CREATE INDEX "communications_tenantId_idx" ON "communications"("tenantId");

-- CreateIndex
CREATE INDEX "communications_customerId_idx" ON "communications"("customerId");

-- CreateIndex
CREATE INDEX "communications_userId_idx" ON "communications"("userId");

-- CreateIndex
CREATE INDEX "communications_type_idx" ON "communications"("type");

-- CreateIndex
CREATE INDEX "ai_insights_tenantId_idx" ON "ai_insights"("tenantId");

-- CreateIndex
CREATE INDEX "ai_insights_department_idx" ON "ai_insights"("department");

-- CreateIndex
CREATE INDEX "ai_insights_entityType_idx" ON "ai_insights"("entityType");

-- CreateIndex
CREATE INDEX "ai_insights_expiresAt_idx" ON "ai_insights"("expiresAt");

-- CreateIndex
CREATE INDEX "ai_activities_tenantId_idx" ON "ai_activities"("tenantId");

-- CreateIndex
CREATE INDEX "ai_activities_userId_idx" ON "ai_activities"("userId");

-- CreateIndex
CREATE INDEX "ai_activities_action_idx" ON "ai_activities"("action");

-- CreateIndex
CREATE INDEX "ai_activities_createdAt_idx" ON "ai_activities"("createdAt");

-- CreateIndex
CREATE INDEX "ai_conversations_tenantId_idx" ON "ai_conversations"("tenantId");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_idx" ON "ai_conversations"("userId");

-- CreateIndex
CREATE INDEX "ai_conversations_department_idx" ON "ai_conversations"("department");

-- CreateIndex
CREATE INDEX "industry_ai_agents_tenantId_idx" ON "industry_ai_agents"("tenantId");

-- CreateIndex
CREATE INDEX "industry_ai_agents_industry_idx" ON "industry_ai_agents"("industry");

-- CreateIndex
CREATE INDEX "industry_ai_agents_type_idx" ON "industry_ai_agents"("type");

-- CreateIndex
CREATE INDEX "industry_custom_fields_tenantId_idx" ON "industry_custom_fields"("tenantId");

-- CreateIndex
CREATE INDEX "industry_custom_fields_industry_idx" ON "industry_custom_fields"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "industry_custom_fields_tenantId_name_entity_key" ON "industry_custom_fields"("tenantId", "name", "entity");

-- CreateIndex
CREATE INDEX "industry_customer_intelligence_tenantId_idx" ON "industry_customer_intelligence"("tenantId");

-- CreateIndex
CREATE INDEX "industry_customer_intelligence_industry_idx" ON "industry_customer_intelligence"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "industry_customer_intelligence_customerId_key" ON "industry_customer_intelligence"("customerId");

-- CreateIndex
CREATE INDEX "industry_compliance_tenantId_idx" ON "industry_compliance"("tenantId");

-- CreateIndex
CREATE INDEX "industry_compliance_industry_idx" ON "industry_compliance"("industry");

-- CreateIndex
CREATE INDEX "industry_compliance_status_idx" ON "industry_compliance"("status");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "system_health_tenantId_idx" ON "system_health"("tenantId");

-- CreateIndex
CREATE INDEX "system_health_component_idx" ON "system_health"("component");

-- CreateIndex
CREATE INDEX "system_health_status_idx" ON "system_health"("status");

-- CreateIndex
CREATE INDEX "system_health_createdAt_idx" ON "system_health"("createdAt");
