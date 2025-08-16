-- CoreFlow360 - SAML SSO Support Migration
-- Adds enterprise SSO authentication capabilities

-- Create SAML Configuration table
CREATE TABLE IF NOT EXISTS "SAMLConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "idpName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "entryPoint" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "certificate" TEXT NOT NULL,
    "privateKey" TEXT,
    "callbackUrl" TEXT NOT NULL,
    "signatureAlgorithm" TEXT DEFAULT 'sha256',
    "identifierFormat" TEXT,
    "acceptedClockSkewMs" INTEGER DEFAULT 180000,
    "attributeMapping" JSONB,
    "allowedDomains" TEXT[],
    "autoProvisionUsers" BOOLEAN NOT NULL DEFAULT true,
    "defaultRole" TEXT DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SAMLConfiguration_pkey" PRIMARY KEY ("id")
);

-- Create unique index on tenant + IdP name
CREATE UNIQUE INDEX "SAMLConfiguration_tenantId_idpName_key" 
ON "SAMLConfiguration"("tenantId", "idpName");

-- Create index for active configurations
CREATE INDEX "SAMLConfiguration_tenantId_isActive_idx" 
ON "SAMLConfiguration"("tenantId", "isActive");

-- Add foreign key constraint
ALTER TABLE "SAMLConfiguration" 
ADD CONSTRAINT "SAMLConfiguration_tenantId_fkey" 
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create User Session table for session management
CREATE TABLE IF NOT EXISTS "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "authProvider" TEXT NOT NULL,
    "authProviderId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loggedOutAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- Create indexes for session queries
CREATE INDEX "UserSession_userId_isActive_idx" 
ON "UserSession"("userId", "isActive");

CREATE INDEX "UserSession_token_idx" 
ON "UserSession"("token");

CREATE INDEX "UserSession_expiresAt_isActive_idx" 
ON "UserSession"("expiresAt", "isActive");

-- Add foreign key constraints
ALTER TABLE "UserSession" 
ADD CONSTRAINT "UserSession_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserSession" 
ADD CONSTRAINT "UserSession_tenantId_fkey" 
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add SAML-related columns to User table if not exists
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "authProvider" TEXT DEFAULT 'local',
ADD COLUMN IF NOT EXISTS "authProviderId" TEXT,
ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Create index for auth provider queries
CREATE INDEX IF NOT EXISTS "User_tenantId_authProvider_idx" 
ON "User"("tenantId", "authProvider");

-- Create SAML Audit Log table
CREATE TABLE IF NOT EXISTS "SAMLAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "idpName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SAMLAuditLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for audit queries
CREATE INDEX "SAMLAuditLog_tenantId_timestamp_idx" 
ON "SAMLAuditLog"("tenantId", "timestamp");

CREATE INDEX "SAMLAuditLog_userId_timestamp_idx" 
ON "SAMLAuditLog"("userId", "timestamp");

-- Add foreign key constraints
ALTER TABLE "SAMLAuditLog" 
ADD CONSTRAINT "SAMLAuditLog_tenantId_fkey" 
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for SAMLConfiguration
CREATE TRIGGER update_saml_configuration_updated_at 
BEFORE UPDATE ON "SAMLConfiguration" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE "SAMLConfiguration" IS 'Enterprise SAML SSO configurations per tenant';
COMMENT ON TABLE "UserSession" IS 'Active user sessions with multi-provider support';
COMMENT ON TABLE "SAMLAuditLog" IS 'SAML authentication event audit trail';

COMMENT ON COLUMN "SAMLConfiguration"."attributeMapping" IS 'JSON mapping of SAML attributes to user fields';
COMMENT ON COLUMN "SAMLConfiguration"."allowedDomains" IS 'List of allowed email domains for auto-provisioning';
COMMENT ON COLUMN "UserSession"."token" IS 'Hashed session token for security';