-- Add new fields to customers table
ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'LEAD',
ADD COLUMN IF NOT EXISTS "source" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "assigneeId" TEXT,
ADD COLUMN IF NOT EXISTS "aiScore" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "aiChurnRisk" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "aiLifetimeValue" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalRevenue" DOUBLE PRECISION DEFAULT 0;

-- Add check constraint for status enum
ALTER TABLE "customers" 
ADD CONSTRAINT "customers_status_check" 
CHECK ("status" IN ('LEAD', 'PROSPECT', 'CUSTOMER', 'CHAMPION', 'AT_RISK', 'CHURNED'));

-- Add foreign key for assignee
ALTER TABLE "customers"
ADD CONSTRAINT "customers_assigneeId_fkey" 
FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new indexes
CREATE INDEX IF NOT EXISTS "customers_tenantId_status_idx" ON "customers"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "customers_assigneeId_idx" ON "customers"("assigneeId");

-- Migrate existing name data to firstName and lastName
UPDATE "customers" 
SET 
  "firstName" = SPLIT_PART(TRIM("name"), ' ', 1),
  "lastName" = CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(TRIM("name"), ' '), 1) > 1 
    THEN SUBSTRING(TRIM("name") FROM POSITION(' ' IN TRIM("name")) + 1)
    ELSE ''
  END
WHERE "name" IS NOT NULL AND "name" != '';

-- Note: The "name" column is kept for backward compatibility
-- It can be removed in a future migration after verification