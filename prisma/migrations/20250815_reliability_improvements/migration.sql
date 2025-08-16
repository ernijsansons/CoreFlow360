-- CoreFlow360 Reliability Improvements Migration
-- Add idempotency tables, transaction logs, and optimistic locking

-- Create IdempotencyKey table for request deduplication
CREATE TABLE "idempotency_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tenant_id" TEXT,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "user_id" TEXT,
    "response_status" INTEGER,
    "response_body" TEXT,
    "response_headers" TEXT DEFAULT '{}',
    "is_processing" BOOLEAN NOT NULL DEFAULT true,
    "processed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- Create TransactionLog table for saga pattern support
CREATE TABLE "transaction_logs" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "tenant_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'started',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "transaction_data" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "rollback_reason" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_logs_pkey" PRIMARY KEY ("id")
);

-- Add version fields for optimistic locking
ALTER TABLE "customers" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "tenant_subscriptions" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- Create indexes for performance
CREATE UNIQUE INDEX "idempotency_keys_key_key" ON "idempotency_keys"("key");
CREATE INDEX "idempotency_keys_tenant_id_idx" ON "idempotency_keys"("tenant_id");
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");
CREATE INDEX "idempotency_keys_is_processing_idx" ON "idempotency_keys"("is_processing");

CREATE UNIQUE INDEX "transaction_logs_transaction_id_key" ON "transaction_logs"("transaction_id");
CREATE INDEX "transaction_logs_tenant_id_idx" ON "transaction_logs"("tenant_id");
CREATE INDEX "transaction_logs_status_idx" ON "transaction_logs"("status");
CREATE INDEX "transaction_logs_entity_type_entity_id_idx" ON "transaction_logs"("entity_type", "entity_id");
CREATE INDEX "transaction_logs_started_at_idx" ON "transaction_logs"("started_at");

-- Add version indexes for optimistic locking
CREATE INDEX "customers_version_idx" ON "customers"("version");
CREATE INDEX "tenant_subscriptions_version_idx" ON "tenant_subscriptions"("version");

-- Add foreign key constraints where applicable
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transaction_logs" ADD CONSTRAINT "transaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;