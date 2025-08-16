-- CreateTable
CREATE TABLE "webhook_failures" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "source_provider" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "original_headers" JSONB NOT NULL,
    "failure_reason" TEXT NOT NULL,
    "stack_trace" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "max_retries" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "tenant_id" TEXT NOT NULL,
    "impact_level" TEXT NOT NULL DEFAULT 'low',
    "business_impact" TEXT NOT NULL,
    "technical_notes" TEXT,
    "last_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_retry_at" TIMESTAMP(3),
    "recovered_at" TIMESTAMP(3),
    "abandoned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_failures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_failures_status_idx" ON "webhook_failures"("status");

-- CreateIndex
CREATE INDEX "webhook_failures_tenant_id_idx" ON "webhook_failures"("tenant_id");

-- CreateIndex
CREATE INDEX "webhook_failures_source_provider_idx" ON "webhook_failures"("source_provider");

-- CreateIndex
CREATE INDEX "webhook_failures_priority_idx" ON "webhook_failures"("priority");

-- CreateIndex
CREATE INDEX "webhook_failures_created_at_idx" ON "webhook_failures"("created_at");

-- CreateIndex
CREATE INDEX "webhook_failures_scheduled_retry_at_idx" ON "webhook_failures"("scheduled_retry_at");

-- CreateIndex
CREATE INDEX "webhook_failures_status_priority_scheduled_idx" ON "webhook_failures"("status", "priority", "scheduled_retry_at");

-- Add constraint checks
ALTER TABLE "webhook_failures" ADD CONSTRAINT "webhook_failures_status_check" 
CHECK ("status" IN ('pending', 'processing', 'recovered', 'abandoned'));

ALTER TABLE "webhook_failures" ADD CONSTRAINT "webhook_failures_priority_check" 
CHECK ("priority" IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE "webhook_failures" ADD CONSTRAINT "webhook_failures_impact_level_check" 
CHECK ("impact_level" IN ('low', 'medium', 'high', 'critical'));