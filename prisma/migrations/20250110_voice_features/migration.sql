-- CoreFlow360 Voice AI Features Migration
-- Safe deployment with backward compatibility
-- Migration: 20250110_voice_features

-- ===========================================
-- ENUMS FOR VOICE FEATURES
-- ===========================================

-- Call Direction Enum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- Call Status Enum
CREATE TYPE "CallStatus" AS ENUM (
  'INITIATED', 'RINGING', 'ANSWERED', 'IN_PROGRESS', 
  'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 
  'CANCELLED', 'QUEUED'
);

-- AMD Result Enum
CREATE TYPE "AMDResult" AS ENUM (
  'HUMAN', 'MACHINE_START', 'MACHINE_END_BEEP', 
  'MACHINE_END_SILENCE', 'FAX', 'UNKNOWN'
);

-- Transcript Status Enum
CREATE TYPE "TranscriptStatus" AS ENUM (
  'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL'
);

-- Call Outcome Enum
CREATE TYPE "CallOutcome" AS ENUM (
  'QUALIFIED', 'NOT_QUALIFIED', 'APPOINTMENT', 'CALLBACK',
  'NOT_INTERESTED', 'WRONG_NUMBER', 'NO_ANSWER', 'BUSY', 'ERROR'
);

-- Note Priority Enum
CREATE TYPE "NotePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Processing Status Enum
CREATE TYPE "ProcessingStatus" AS ENUM (
  'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRY'
);

-- Consent Type Enum
CREATE TYPE "ConsentType" AS ENUM ('EXPRESS', 'IMPLIED', 'OPT_IN', 'OPT_OUT');

-- Consent Method Enum
CREATE TYPE "ConsentMethod" AS ENUM (
  'VERBAL', 'WRITTEN', 'DIGITAL', 'INFERRED', 'SMS', 'EMAIL'
);

-- Consent Source Type Enum
CREATE TYPE "ConsentSourceType" AS ENUM (
  'VOICE_CALL', 'WEB_FORM', 'EMAIL', 'SMS', 'IN_PERSON', 'EXISTING'
);

-- Script Type Enum
CREATE TYPE "ScriptType" AS ENUM (
  'QUALIFICATION', 'APPOINTMENT', 'SUPPORT', 'SURVEY', 'SALES', 'FOLLOW_UP'
);

-- Script Usage Enum
CREATE TYPE "ScriptUsage" AS ENUM (
  'ACTIVE', 'INACTIVE', 'ARCHIVED', 'DRAFT', 'TESTING'
);

-- ===========================================
-- VOICE CALL LOGS TABLE
-- ===========================================

CREATE TABLE "call_logs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  
  -- Multi-tenant isolation
  "tenantId" TEXT NOT NULL,
  
  -- Call identification
  "twilioCallSid" TEXT NOT NULL,
  "callDirection" "CallDirection" NOT NULL DEFAULT 'OUTBOUND',
  
  -- Phone numbers (E.164 format)
  "fromNumber" TEXT NOT NULL,
  "toNumber" TEXT NOT NULL,
  
  -- Customer/Lead relationship
  "customerId" TEXT,
  "leadId" TEXT,
  
  -- Call execution details
  "status" "CallStatus" NOT NULL DEFAULT 'INITIATED',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "answeredAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "duration" INTEGER,
  
  -- AI & Script details
  "scriptId" TEXT,
  "aiAgentId" TEXT,
  
  -- Answering Machine Detection
  "amdResult" "AMDResult",
  "amdConfidence" DOUBLE PRECISION,
  
  -- Recording & Transcription
  "recordingUrl" TEXT,
  "recordingSid" TEXT,
  "recordingDuration" INTEGER,
  "transcriptStatus" "TranscriptStatus" NOT NULL DEFAULT 'PENDING',
  "transcript" TEXT,
  "transcriptConfidence" DOUBLE PRECISION,
  
  -- Call outcome & qualification
  "outcome" "CallOutcome",
  "qualificationScore" DOUBLE PRECISION,
  "appointmentBooked" BOOLEAN NOT NULL DEFAULT false,
  "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
  
  -- Costs & Analytics
  "cost" DECIMAL(10,4),
  "costCurrency" TEXT NOT NULL DEFAULT 'USD',
  
  -- Compliance & Metadata
  "consentVerified" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "tags" TEXT[],
  
  -- Audit trail
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  
  -- Foreign key constraints
  CONSTRAINT "call_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "call_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "call_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================================
-- VOICE NOTES TABLE
-- ===========================================

CREATE TABLE "voice_notes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  
  -- Multi-tenant isolation
  "tenantId" TEXT NOT NULL,
  
  -- User & context
  "userId" TEXT NOT NULL,
  
  -- Associated entities
  "customerId" TEXT,
  "leadId" TEXT,
  "callLogId" TEXT,
  
  -- Audio & transcription
  "audioUrl" TEXT,
  "audioFormat" TEXT,
  "audioDuration" INTEGER,
  "audioSize" INTEGER,
  
  -- STT Processing
  "transcriptionProvider" TEXT,
  "transcript" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "wordConfidences" JSONB,
  
  -- Content analysis
  "title" TEXT,
  "summary" TEXT,
  "keywords" TEXT[],
  "sentiment" DOUBLE PRECISION,
  "priority" "NotePriority" NOT NULL DEFAULT 'MEDIUM',
  
  -- Categorization
  "category" TEXT,
  "tags" TEXT[],
  
  -- Processing status
  "status" "ProcessingStatus" NOT NULL DEFAULT 'PROCESSING',
  "processingError" TEXT,
  
  -- Metadata
  "metadata" JSONB,
  
  -- Audit trail
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  
  -- Foreign key constraints
  CONSTRAINT "voice_notes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "voice_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "voice_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "voice_notes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "voice_notes_callLogId_fkey" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================================
-- CALL CONSENT TABLE
-- ===========================================

CREATE TABLE "call_consents" (
  "id" TEXT NOT NULL PRIMARY KEY,
  
  -- Multi-tenant isolation
  "tenantId" TEXT NOT NULL,
  
  -- Associated call
  "callLogId" TEXT NOT NULL,
  
  -- Contact information
  "phoneNumber" TEXT NOT NULL,
  "customerId" TEXT,
  "leadId" TEXT,
  
  -- Consent details
  "consentType" "ConsentType" NOT NULL,
  "consentMethod" "ConsentMethod" NOT NULL,
  "consentText" TEXT,
  "consentGiven" BOOLEAN NOT NULL,
  "consentVerified" BOOLEAN NOT NULL DEFAULT false,
  
  -- Source tracking
  "sourceType" "ConsentSourceType" NOT NULL DEFAULT 'VOICE_CALL',
  "sourceUrl" TEXT,
  "sourceMetadata" JSONB,
  
  -- Legal compliance
  "tcpaCompliant" BOOLEAN NOT NULL DEFAULT false,
  "dncCheckPassed" BOOLEAN NOT NULL DEFAULT false,
  "dncSource" TEXT,
  "legalBasis" TEXT,
  
  -- Geographic compliance
  "jurisdiction" TEXT,
  "regulatoryRules" TEXT[],
  
  -- Consent lifecycle
  "grantedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  
  -- Audit trail
  "recordedBy" TEXT,
  "verifiedBy" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  
  -- Metadata
  "metadata" JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  CONSTRAINT "call_consents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "call_consents_callLogId_fkey" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "call_consents_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "call_consents_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================================
-- INDUSTRY CALL SCRIPTS TABLE
-- ===========================================

CREATE TABLE "industry_call_scripts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  
  -- Multi-tenant isolation
  "tenantId" TEXT NOT NULL,
  
  -- Script identification
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT '1.0',
  
  -- Industry & use case
  "industry" TEXT NOT NULL,
  "useCase" TEXT NOT NULL,
  "scriptType" "ScriptType" NOT NULL DEFAULT 'QUALIFICATION',
  
  -- Script content
  "instructions" TEXT NOT NULL,
  "openingMessage" TEXT NOT NULL,
  "closingMessage" TEXT NOT NULL,
  
  -- Conversation flow
  "qualificationQuestions" JSONB NOT NULL,
  "objectionHandling" JSONB NOT NULL,
  "keywords" TEXT[],
  "triggers" JSONB,
  
  -- AI configuration
  "aiModel" TEXT NOT NULL DEFAULT 'gpt-4o-realtime-preview',
  "voice" TEXT NOT NULL DEFAULT 'alloy',
  "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
  "maxTokens" INTEGER DEFAULT 4096,
  
  -- Function tools
  "tools" JSONB,
  "integrations" JSONB,
  
  -- Performance tracking
  "usage" "ScriptUsage" NOT NULL DEFAULT 'ACTIVE',
  "successRate" DOUBLE PRECISION,
  "avgCallDuration" INTEGER,
  "conversionRate" DOUBLE PRECISION,
  
  -- Compliance settings
  "consentRequired" BOOLEAN NOT NULL DEFAULT true,
  "recordingEnabled" BOOLEAN NOT NULL DEFAULT true,
  "dncCheckRequired" BOOLEAN NOT NULL DEFAULT true,
  
  -- Customization & variants
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "parentScriptId" TEXT,
  
  -- Metadata & settings
  "metadata" JSONB,
  "settings" JSONB,
  
  -- Audit trail
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "lastModifiedBy" TEXT,
  
  -- Foreign key constraints
  CONSTRAINT "industry_call_scripts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "industry_call_scripts_parentScriptId_fkey" FOREIGN KEY ("parentScriptId") REFERENCES "industry_call_scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================================
-- EXTEND EXISTING TABLES
-- ===========================================

-- Add voice-related fields to Customer table
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "preferredCallTime" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "timezone" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "voiceOptOut" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "lastCallAt" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "tcpaConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "consentDate" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "dncStatus" BOOLEAN NOT NULL DEFAULT false;

-- Add voice-related fields to Lead table
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "voiceQualified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "qualificationCall" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "voiceScore" DOUBLE PRECISION;

-- Add voice-related fields to AIAgent table (if exists)
-- Note: Check if AIAgent table exists first
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'AIAgent') THEN
    ALTER TABLE "AIAgent" ADD COLUMN IF NOT EXISTS "voiceEnabled" BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE "AIAgent" ADD COLUMN IF NOT EXISTS "voiceModel" TEXT;
    ALTER TABLE "AIAgent" ADD COLUMN IF NOT EXISTS "voiceName" TEXT;
  END IF;
END $$;

-- Add voice-related fields to Tenant table
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "voiceFeaturesEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "dailyCallLimit" INTEGER DEFAULT 1000;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "monthlyBudget" DECIMAL(10,2);
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "twilioAccountSid" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "twilioPhoneNumber" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "tcpaEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "recordingEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "consentRequired" BOOLEAN NOT NULL DEFAULT true;

-- ===========================================
-- UNIQUE CONSTRAINTS
-- ===========================================

-- Call Logs unique constraints
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_twilioCallSid_key" UNIQUE ("twilioCallSid");
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_tenantId_twilioCallSid_key" UNIQUE ("tenantId", "twilioCallSid");

-- Voice Notes unique constraints
ALTER TABLE "voice_notes" ADD CONSTRAINT "voice_notes_tenantId_id_key" UNIQUE ("tenantId", "id");

-- Call Consents unique constraints
ALTER TABLE "call_consents" ADD CONSTRAINT "call_consents_tenantId_callLogId_consentType_key" UNIQUE ("tenantId", "callLogId", "consentType");

-- Industry Scripts unique constraints
ALTER TABLE "industry_call_scripts" ADD CONSTRAINT "industry_call_scripts_tenantId_slug_version_key" UNIQUE ("tenantId", "slug", "version");

-- ===========================================
-- PERFORMANCE INDEXES
-- ===========================================

-- Call Logs indexes for performance
CREATE INDEX CONCURRENTLY "idx_call_logs_tenant_status_started" ON "call_logs"("tenantId", "status", "startedAt");
CREATE INDEX CONCURRENTLY "idx_call_logs_tenant_customer_started" ON "call_logs"("tenantId", "customerId", "startedAt");
CREATE INDEX CONCURRENTLY "idx_call_logs_tenant_lead_started" ON "call_logs"("tenantId", "leadId", "startedAt");
CREATE INDEX CONCURRENTLY "idx_call_logs_tenant_outcome_started" ON "call_logs"("tenantId", "outcome", "startedAt");
CREATE INDEX CONCURRENTLY "idx_call_logs_phone_numbers" ON "call_logs"("fromNumber", "toNumber");
CREATE INDEX CONCURRENTLY "idx_call_logs_status_started" ON "call_logs"("status", "startedAt");
CREATE INDEX CONCURRENTLY "idx_call_logs_qualification_score" ON "call_logs"("qualificationScore", "startedAt");

-- Voice Notes indexes
CREATE INDEX CONCURRENTLY "idx_voice_notes_tenant_user_created" ON "voice_notes"("tenantId", "userId", "createdAt");
CREATE INDEX CONCURRENTLY "idx_voice_notes_tenant_customer_created" ON "voice_notes"("tenantId", "customerId", "createdAt");
CREATE INDEX CONCURRENTLY "idx_voice_notes_tenant_lead_created" ON "voice_notes"("tenantId", "leadId", "createdAt");
CREATE INDEX CONCURRENTLY "idx_voice_notes_tenant_category_created" ON "voice_notes"("tenantId", "category", "createdAt");
CREATE INDEX CONCURRENTLY "idx_voice_notes_tenant_status_created" ON "voice_notes"("tenantId", "status", "createdAt");
CREATE INDEX CONCURRENTLY "idx_voice_notes_confidence_created" ON "voice_notes"("confidence", "createdAt");
CREATE INDEX CONCURRENTLY "idx_voice_notes_sentiment_created" ON "voice_notes"("sentiment", "createdAt");

-- Call Consents indexes
CREATE INDEX CONCURRENTLY "idx_call_consents_tenant_phone_consent" ON "call_consents"("tenantId", "phoneNumber", "consentGiven");
CREATE INDEX CONCURRENTLY "idx_call_consents_tenant_type_granted" ON "call_consents"("tenantId", "consentType", "grantedAt");
CREATE INDEX CONCURRENTLY "idx_call_consents_phone_consent_expires" ON "call_consents"("phoneNumber", "consentGiven", "expiresAt");
CREATE INDEX CONCURRENTLY "idx_call_consents_compliance_flags" ON "call_consents"("tcpaCompliant", "dncCheckPassed");
CREATE INDEX CONCURRENTLY "idx_call_consents_jurisdiction_consent" ON "call_consents"("jurisdiction", "consentGiven");

-- Industry Scripts indexes
CREATE INDEX CONCURRENTLY "idx_scripts_tenant_industry_usage" ON "industry_call_scripts"("tenantId", "industry", "usage");
CREATE INDEX CONCURRENTLY "idx_scripts_tenant_type_usage" ON "industry_call_scripts"("tenantId", "scriptType", "usage");
CREATE INDEX CONCURRENTLY "idx_scripts_industry_usecase_default" ON "industry_call_scripts"("industry", "useCase", "isDefault");
CREATE INDEX CONCURRENTLY "idx_scripts_performance" ON "industry_call_scripts"("successRate", "conversionRate");
CREATE INDEX CONCURRENTLY "idx_scripts_usage_created" ON "industry_call_scripts"("usage", "createdAt");

-- Customer voice-related indexes
CREATE INDEX CONCURRENTLY "idx_customer_voice_opt_out" ON "Customer"("voiceOptOut", "lastCallAt");
CREATE INDEX CONCURRENTLY "idx_customer_tcpa_consent" ON "Customer"("tcpaConsent", "consentDate");
CREATE INDEX CONCURRENTLY "idx_customer_dnc_status" ON "Customer"("dncStatus", "lastCallAt");

-- Lead voice qualification indexes
CREATE INDEX CONCURRENTLY "idx_lead_voice_qualified" ON "Lead"("voiceQualified", "voiceScore");
CREATE INDEX CONCURRENTLY "idx_lead_qualification_call" ON "Lead"("qualificationCall", "voiceScore");

-- ===========================================
-- FOREIGN KEY CONSTRAINTS FOR CALL LOGS
-- ===========================================

-- Add foreign key constraints to call_logs for scriptId and aiAgentId
-- (These will be added only if the referenced tables exist)

DO $$ 
BEGIN
  -- Add scriptId foreign key if industry_call_scripts exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'industry_call_scripts') THEN
    ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_scriptId_fkey" 
    FOREIGN KEY ("scriptId") REFERENCES "industry_call_scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  -- Add aiAgentId foreign key if AIAgent exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'AIAgent') THEN
    ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_aiAgentId_fkey" 
    FOREIGN KEY ("aiAgentId") REFERENCES "AIAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ===========================================
-- TRIGGER FOR UPDATED_AT COLUMNS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updatedAt
CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON "call_logs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voice_notes_updated_at BEFORE UPDATE ON "voice_notes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_call_consents_updated_at BEFORE UPDATE ON "call_consents" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_industry_call_scripts_updated_at BEFORE UPDATE ON "industry_call_scripts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- DATA VALIDATION CONSTRAINTS
-- ===========================================

-- Call duration must be positive
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_duration_positive" CHECK ("duration" IS NULL OR "duration" >= 0);
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_recording_duration_positive" CHECK ("recordingDuration" IS NULL OR "recordingDuration" >= 0);

-- Qualification score between 0-100
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_qualification_score_range" CHECK ("qualificationScore" IS NULL OR ("qualificationScore" >= 0 AND "qualificationScore" <= 100));

-- Cost must be positive
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_cost_positive" CHECK ("cost" IS NULL OR "cost" >= 0);

-- Voice note confidence between 0-1
ALTER TABLE "voice_notes" ADD CONSTRAINT "voice_notes_confidence_range" CHECK ("confidence" >= 0 AND "confidence" <= 1);

-- Voice note sentiment between -1 and 1
ALTER TABLE "voice_notes" ADD CONSTRAINT "voice_notes_sentiment_range" CHECK ("sentiment" IS NULL OR ("sentiment" >= -1 AND "sentiment" <= 1));

-- Phone numbers must be in E.164 format
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_phone_format" CHECK ("fromNumber" ~ '^\+[1-9]\d{1,14}$' AND "toNumber" ~ '^\+[1-9]\d{1,14}$');
ALTER TABLE "call_consents" ADD CONSTRAINT "call_consents_phone_format" CHECK ("phoneNumber" ~ '^\+[1-9]\d{1,14}$');

-- Script performance metrics between 0-100
ALTER TABLE "industry_call_scripts" ADD CONSTRAINT "scripts_success_rate_range" CHECK ("successRate" IS NULL OR ("successRate" >= 0 AND "successRate" <= 100));
ALTER TABLE "industry_call_scripts" ADD CONSTRAINT "scripts_conversion_rate_range" CHECK ("conversionRate" IS NULL OR ("conversionRate" >= 0 AND "conversionRate" <= 100));

-- AI temperature between 0-2
ALTER TABLE "industry_call_scripts" ADD CONSTRAINT "scripts_temperature_range" CHECK ("temperature" >= 0 AND "temperature" <= 2);

-- ===========================================
-- SAMPLE DATA FOR TESTING
-- ===========================================

-- Insert default HVAC script (only if tenant exists)
INSERT INTO "industry_call_scripts" (
  "id", "tenantId", "name", "slug", "industry", "useCase",
  "instructions", "openingMessage", "closingMessage",
  "qualificationQuestions", "objectionHandling",
  "isDefault", "createdAt", "updatedAt"
) 
SELECT 
  'hvac_default_' || "id",
  "id",
  'HVAC Service Lead Qualification',
  'hvac-service',
  'HVAC',
  'Lead Qualification',
  'You are Sarah, a professional HVAC service coordinator. Be empathetic about comfort issues.',
  'Hi, this is Sarah from CoreFlow360 HVAC Services. I''m calling because you recently inquired about HVAC services.',
  'Perfect! I''ve scheduled your appointment. You''ll receive a confirmation shortly.',
  '["What type of HVAC issue are you experiencing?", "How old is your current system?", "Is this an urgent situation?"]'::jsonb,
  '{"too_expensive": "I understand budget is important. We offer flexible financing options.", "need_to_think": "How about I schedule a free estimate?"}'::jsonb,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Tenant" 
WHERE "voiceFeaturesEnabled" = true
ON CONFLICT DO NOTHING;

COMMIT;