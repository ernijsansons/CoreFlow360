/**
 * CoreFlow360 - Secure Credential Management System
 * Encrypted storage and rotation of API keys and secrets
 */

import { fieldEncryption } from '@/lib/encryption/field-encryption'
import { prisma } from '@/lib/db'
import { 
  APIKey, 
  CreateAPIKeyRequest, 
  UpdateAPIKeyRequest, 
  RotateAPIKeyRequest,
  APIKeyStatus,
  APIKeyListResponse,
  APIKeyResponse,
  APIKeyOperationResponse,
  APIKeyFilter,
  APIKeyMetrics,
  SecurityLevel,
  APIKeyAuditEvent,
  AISecurityAssessment
} from '@/types/api-keys'
import { 
  validateAPIKeyFormat, 
  calculateSecurityScore, 
  generateSecurityRecommendations,
  validateAPIKeyPermissions 
} from '@/lib/api-keys/validation'

interface CredentialConfig {
  service: string
  key: string
  encrypted: boolean
  rotationDays?: number
  lastRotated?: Date
}

interface DecryptedCredential {
  service: string
  key: string
  lastRotated: Date
  expiresAt?: Date
}

export class SecureCredentialManager {
  private cache = new Map<string, { credential: string; cachedAt: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  
  /**
   * Store encrypted credential in database
   */
  async storeCredential(
    service: string, 
    credential: string, 
    tenantId?: string,
    rotationDays: number = 90
  ): Promise<void> {
    const encryptedCredential = fieldEncryption.encrypt(credential)
    
    // Store in database (create table if doesn't exist)
    await this.ensureCredentialTable()
    
    await prisma.$executeRaw`
      INSERT INTO secure_credentials (service, encrypted_credential, tenant_id, rotation_days, created_at, updated_at)
      VALUES (${service}, ${encryptedCredential}, ${tenantId || null}, ${rotationDays}, NOW(), NOW())
      ON CONFLICT (service, tenant_id) 
      DO UPDATE SET 
        encrypted_credential = ${encryptedCredential},
        rotation_days = ${rotationDays},
        updated_at = NOW()
    `
    
    // Clear cache for this service
    this.clearCache(service, tenantId)
  }
  
  /**
   * Retrieve and decrypt credential
   */
  async getCredential(service: string, tenantId?: string): Promise<string | null> {
    const cacheKey = `${service}:${tenantId || 'global'}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
      return cached.credential
    }
    
    try {
      await this.ensureCredentialTable()
      
      const result = await prisma.$queryRaw<Array<{ encrypted_credential: string }>>`
        SELECT encrypted_credential 
        FROM secure_credentials 
        WHERE service = ${service} 
        AND (tenant_id = ${tenantId || null} OR tenant_id IS NULL)
        ORDER BY tenant_id DESC NULLS LAST
        LIMIT 1
      `
      
      if (result.length === 0) {
        return null
      }
      
      const decryptedCredential = fieldEncryption.decrypt(result[0].encrypted_credential)
      
      // Cache the decrypted credential
      this.cache.set(cacheKey, {
        credential: decryptedCredential,
        cachedAt: Date.now()
      })
      
      return decryptedCredential
    } catch (error) {
      console.error('Failed to retrieve credential:', error)
      return null
    }
  }
  
  /**
   * Get OpenAI API key with fallback to environment variable
   */
  async getOpenAIKey(tenantId?: string): Promise<string> {
    const storedKey = await this.getCredential('openai_api_key', tenantId)
    
    if (storedKey) {
      return storedKey
    }
    
    // Fallback to environment variable
    const envKey = process.env.OPENAI_API_KEY
    if (envKey) {
      // Store in secure storage for future use
      await this.storeCredential('openai_api_key', envKey, tenantId)
      return envKey
    }
    
    throw new Error('OpenAI API key not found in secure storage or environment variables')
  }
  
  /**
   * Rotate credential (generate new one if possible)
   */
  async rotateCredential(service: string, newCredential: string, tenantId?: string): Promise<void> {
    // Archive old credential first
    await this.archiveCredential(service, tenantId)
    
    // Store new credential
    await this.storeCredential(service, newCredential, tenantId)
    
    // Log rotation event
    console.info(`Credential rotated for service: ${service}`)
  }
  
  /**
   * Check if credential needs rotation
   */
  async needsRotation(service: string, tenantId?: string): Promise<boolean> {
    try {
      await this.ensureCredentialTable()
      
      const result = await prisma.$queryRaw<Array<{ 
        rotation_days: number; 
        updated_at: Date 
      }>>`
        SELECT rotation_days, updated_at 
        FROM secure_credentials 
        WHERE service = ${service} 
        AND (tenant_id = ${tenantId || null} OR tenant_id IS NULL)
        ORDER BY tenant_id DESC NULLS LAST
        LIMIT 1
      `
      
      if (result.length === 0) {
        return false
      }
      
      const { rotation_days, updated_at } = result[0]
      const daysSinceUpdate = Math.floor(
        (Date.now() - updated_at.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      return daysSinceUpdate >= rotation_days
    } catch (error) {
      console.error('Failed to check rotation status:', error)
      return false
    }
  }
  
  /**
   * List all credentials that need rotation
   */
  async getCredentialsNeedingRotation(): Promise<CredentialConfig[]> {
    try {
      await this.ensureCredentialTable()
      
      const result = await prisma.$queryRaw<Array<{
        service: string;
        tenant_id: string | null;
        rotation_days: number;
        updated_at: Date;
      }>>`
        SELECT service, tenant_id, rotation_days, updated_at
        FROM secure_credentials
        WHERE updated_at + INTERVAL rotation_days || ' days' < NOW()
      `
      
      return result.map(row => ({
        service: row.service,
        key: `${row.service}:${row.tenant_id || 'global'}`,
        encrypted: true,
        rotationDays: row.rotation_days,
        lastRotated: row.updated_at
      }))
    } catch (error) {
      console.error('Failed to get credentials needing rotation:', error)
      return []
    }
  }
  
  /**
   * Archive old credential
   */
  private async archiveCredential(service: string, tenantId?: string): Promise<void> {
    try {
      await this.ensureCredentialArchiveTable()
      
      await prisma.$executeRaw`
        INSERT INTO secure_credentials_archive (service, encrypted_credential, tenant_id, archived_at)
        SELECT service, encrypted_credential, tenant_id, NOW()
        FROM secure_credentials
        WHERE service = ${service} AND (tenant_id = ${tenantId || null} OR tenant_id IS NULL)
      `
    } catch (error) {
      console.error('Failed to archive credential:', error)
    }
  }
  
  /**
   * Clear cache for service
   */
  private clearCache(service: string, tenantId?: string): void {
    const cacheKey = `${service}:${tenantId || 'global'}`
    this.cache.delete(cacheKey)
  }
  
  /**
   * Create credentials table if it doesn't exist
   */
  private async ensureCredentialTable(): Promise<void> {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS secure_credentials (
        id SERIAL PRIMARY KEY,
        service VARCHAR(255) NOT NULL,
        encrypted_credential TEXT NOT NULL,
        tenant_id VARCHAR(255),
        rotation_days INTEGER DEFAULT 90,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(service, tenant_id)
      )
    `
    
    // Create indexes for performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_secure_credentials_service 
      ON secure_credentials(service)
    `
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_secure_credentials_tenant 
      ON secure_credentials(tenant_id)
    `
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_secure_credentials_rotation 
      ON secure_credentials(updated_at, rotation_days)
    `
  }
  
  /**
   * Create credentials archive table if it doesn't exist
   */
  private async ensureCredentialArchiveTable(): Promise<void> {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS secure_credentials_archive (
        id SERIAL PRIMARY KEY,
        service VARCHAR(255) NOT NULL,
        encrypted_credential TEXT NOT NULL,
        tenant_id VARCHAR(255),
        archived_at TIMESTAMP DEFAULT NOW()
      )
    `
  }

  /**
   * API KEY MANAGEMENT METHODS
   */

  /**
   * Create API key tables if they don't exist
   */
  private async ensureAPIKeyTables(): Promise<void> {
    // API Keys table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        encrypted_key TEXT NOT NULL,
        key_preview VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        tenant_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        vendor_id VARCHAR(255),
        rotation_days INTEGER DEFAULT 90,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        security_score INTEGER DEFAULT 100,
        security_level VARCHAR(20) DEFAULT 'MEDIUM',
        UNIQUE(service, tenant_id, name)
      )
    `

    // API Key Usage table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS api_key_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT NOW(),
        request_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        response_time_ms INTEGER,
        status_code INTEGER,
        endpoint VARCHAR(255),
        metadata JSONB
      )
    `

    // API Key Audit table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS api_key_audit (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        tenant_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT
      )
    `

    // Vendors table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS api_vendors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        logo_url VARCHAR(500),
        category VARCHAR(50) NOT NULL,
        documentation_url VARCHAR(500),
        supported_key_formats TEXT[],
        required_permissions TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_id ON api_key_usage(api_key_id)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_api_key_audit_key_id ON api_key_audit(api_key_id)
    `
  }

  /**
   * List API keys with filtering and pagination
   */
  async listAPIKeys(
    tenantId: string,
    filter: APIKeyFilter = {},
    userRole: string,
    userPermissions: string[]
  ): Promise<APIKeyListResponse> {
    // Check permissions
    const permissionCheck = validateAPIKeyPermissions(userRole, userPermissions, 'read')
    if (!permissionCheck.allowed) {
      throw new Error(permissionCheck.reason || 'Insufficient permissions')
    }

    await this.ensureAPIKeyTables()

    // Build WHERE clause
    let whereConditions = [`tenant_id = '${tenantId}'`]
    
    if (filter.status && filter.status.length > 0) {
      const statusList = filter.status.map(s => `'${s}'`).join(',')
      whereConditions.push(`status IN (${statusList})`)
    }
    
    if (filter.vendor && filter.vendor.length > 0) {
      const vendorList = filter.vendor.map(v => `'${v}'`).join(',')
      whereConditions.push(`vendor_id IN (${vendorList})`)
    }
    
    if (filter.searchTerm) {
      whereConditions.push(`(name ILIKE '%${filter.searchTerm}%' OR service ILIKE '%${filter.searchTerm}%')`)
    }
    
    if (filter.lastUsedSince) {
      whereConditions.push(`last_used_at >= '${filter.lastUsedSince.toISOString()}'`)
    }

    const whereClause = whereConditions.join(' AND ')
    const orderBy = filter.sortBy || 'updated_at'
    const orderDirection = filter.sortOrder || 'desc'
    const limit = filter.limit || 50
    const offset = filter.offset || 0

    // Get total count
    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM api_keys WHERE ${prisma.$queryRaw([whereClause])}
    `
    const total = Number(countResult[0].count)

    // Get keys
    const keys = await prisma.$queryRaw<any[]>`
      SELECT 
        id, service, name, description, key_preview, status,
        last_used_at, created_at, updated_at, expires_at,
        rotation_days, usage_count, error_count, security_score,
        security_level, vendor_id
      FROM api_keys 
      WHERE ${prisma.$queryRaw([whereClause])}
      ORDER BY ${prisma.$queryRaw([orderBy])} ${prisma.$queryRaw([orderDirection])}
      LIMIT ${limit} OFFSET ${offset}
    `

    // Calculate metrics
    const metrics = await this.calculateAPIKeyMetrics(tenantId)

    return {
      keys: keys.map(key => this.mapDatabaseRowToAPIKey(key)),
      total,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      metrics
    }
  }

  /**
   * Get single API key with details
   */
  async getAPIKey(keyId: string, tenantId: string, userRole: string, userPermissions: string[]): Promise<APIKeyResponse> {
    // Check permissions
    const permissionCheck = validateAPIKeyPermissions(userRole, userPermissions, 'read')
    if (!permissionCheck.allowed) {
      throw new Error(permissionCheck.reason || 'Insufficient permissions')
    }

    await this.ensureAPIKeyTables()

    const keyResult = await prisma.$queryRaw<any[]>`
      SELECT 
        id, service, name, description, key_preview, status,
        last_used_at, created_at, updated_at, expires_at,
        rotation_days, usage_count, error_count, security_score,
        security_level, vendor_id
      FROM api_keys 
      WHERE id = ${keyId} AND tenant_id = ${tenantId}
    `

    if (keyResult.length === 0) {
      throw new Error('API key not found')
    }

    const key = this.mapDatabaseRowToAPIKey(keyResult[0])

    // Get audit log
    const auditLog = await this.getAPIKeyAuditLog(keyId)

    return {
      key,
      auditLog
    }
  }

  /**
   * Create new API key
   */
  async createAPIKey(
    request: CreateAPIKeyRequest, 
    tenantId: string, 
    userId: string,
    userRole: string,
    userPermissions: string[]
  ): Promise<APIKeyOperationResponse> {
    // Check permissions
    const permissionCheck = validateAPIKeyPermissions(userRole, userPermissions, 'create', request.service)
    if (!permissionCheck.allowed) {
      throw new Error(permissionCheck.reason || 'Insufficient permissions')
    }

    await this.ensureAPIKeyTables()

    // Validate API key format
    const validation = validateAPIKeyFormat(request.service, request.key)
    if (!validation.isValid) {
      return {
        success: false,
        message: 'API key validation failed',
        errors: validation.errors
      }
    }

    // Encrypt the API key
    const encryptedKey = fieldEncryption.encrypt(request.key)
    const keyPreview = `${request.key.substring(0, 8)}...${request.key.substring(request.key.length - 4)}`

    // Calculate initial security score
    const securityScore = calculateSecurityScore({
      service: request.service,
      key: request.key,
      daysSinceCreated: 0,
      daysSinceLastRotation: 0,
      errorRate: 0,
      rotationDays: request.rotationDays || 90
    })

    const securityLevel = this.getSecurityLevel(securityScore)

    try {
      const result = await prisma.$queryRaw<[{ id: string }]>`
        INSERT INTO api_keys (
          service, name, description, encrypted_key, key_preview,
          tenant_id, user_id, vendor_id, rotation_days, expires_at,
          security_score, security_level
        ) VALUES (
          ${request.service}, ${request.name}, ${request.description || null},
          ${encryptedKey}, ${keyPreview}, ${tenantId}, ${userId},
          ${request.vendorId}, ${request.rotationDays || 90}, 
          ${request.expiresAt?.toISOString() || null},
          ${securityScore}, ${securityLevel}
        ) RETURNING id
      `

      const keyId = result[0].id

      // Log creation
      await this.logAPIKeyAudit(keyId, 'CREATED', userId, tenantId, {
        service: request.service,
        name: request.name
      })

      return {
        success: true,
        message: 'API key created successfully',
        data: { keyId }
      }
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        return {
          success: false,
          message: 'API key with this name already exists for this service'
        }
      }
      throw error
    }
  }

  /**
   * Update API key
   */
  async updateAPIKey(
    keyId: string,
    request: UpdateAPIKeyRequest,
    tenantId: string,
    userId: string,
    userRole: string,
    userPermissions: string[]
  ): Promise<APIKeyOperationResponse> {
    // Check permissions
    const permissionCheck = validateAPIKeyPermissions(userRole, userPermissions, 'update')
    if (!permissionCheck.allowed) {
      throw new Error(permissionCheck.reason || 'Insufficient permissions')
    }

    await this.ensureAPIKeyTables()

    // Get current key data
    const currentKey = await prisma.$queryRaw<any[]>`
      SELECT service, encrypted_key FROM api_keys 
      WHERE id = ${keyId} AND tenant_id = ${tenantId}
    `

    if (currentKey.length === 0) {
      throw new Error('API key not found')
    }

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (request.name !== undefined) {
      updates.push(`name = $${paramIndex}`)
      values.push(request.name)
      paramIndex++
    }

    if (request.description !== undefined) {
      updates.push(`description = $${paramIndex}`)
      values.push(request.description)
      paramIndex++
    }

    if (request.key !== undefined) {
      // Validate new key format
      const validation = validateAPIKeyFormat(currentKey[0].service, request.key)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'API key validation failed',
          errors: validation.errors
        }
      }

      const encryptedKey = fieldEncryption.encrypt(request.key)
      const keyPreview = `${request.key.substring(0, 8)}...${request.key.substring(request.key.length - 4)}`

      updates.push(`encrypted_key = $${paramIndex}`)
      values.push(encryptedKey)
      paramIndex++

      updates.push(`key_preview = $${paramIndex}`)
      values.push(keyPreview)
      paramIndex++
    }

    if (request.rotationDays !== undefined) {
      updates.push(`rotation_days = $${paramIndex}`)
      values.push(request.rotationDays)
      paramIndex++
    }

    if (request.expiresAt !== undefined) {
      updates.push(`expires_at = $${paramIndex}`)
      values.push(request.expiresAt?.toISOString() || null)
      paramIndex++
    }

    if (request.status !== undefined) {
      updates.push(`status = $${paramIndex}`)
      values.push(request.status)
      paramIndex++
    }

    if (updates.length === 0) {
      return {
        success: false,
        message: 'No updates provided'
      }
    }

    updates.push(`updated_at = NOW()`)

    const updateQuery = `
      UPDATE api_keys 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
    `
    values.push(keyId, tenantId)

    await prisma.$executeRawUnsafe(updateQuery, ...values)

    // Log update
    await this.logAPIKeyAudit(keyId, 'UPDATED', userId, tenantId, request)

    return {
      success: true,
      message: 'API key updated successfully'
    }
  }

  /**
   * Rotate API key
   */
  async rotateAPIKey(
    keyId: string,
    request: RotateAPIKeyRequest,
    tenantId: string,
    userId: string,
    userRole: string,
    userPermissions: string[]
  ): Promise<APIKeyOperationResponse> {
    // Check permissions
    const permissionCheck = validateAPIKeyPermissions(userRole, userPermissions, 'rotate')
    if (!permissionCheck.allowed) {
      throw new Error(permissionCheck.reason || 'Insufficient permissions')
    }

    await this.ensureAPIKeyTables()

    // Get current key data
    const currentKey = await prisma.$queryRaw<any[]>`
      SELECT service, encrypted_key FROM api_keys 
      WHERE id = ${keyId} AND tenant_id = ${tenantId}
    `

    if (currentKey.length === 0) {
      throw new Error('API key not found')
    }

    // Validate new key format
    const validation = validateAPIKeyFormat(currentKey[0].service, request.newKey)
    if (!validation.isValid) {
      return {
        success: false,
        message: 'New API key validation failed',
        errors: validation.errors
      }
    }

    // Archive old key
    const oldEncryptedKey = currentKey[0].encrypted_key
    await prisma.$executeRaw`
      INSERT INTO secure_credentials_archive (service, encrypted_credential, tenant_id, archived_at)
      VALUES (${`api_key_${keyId}`}, ${oldEncryptedKey}, ${tenantId}, NOW())
    `

    // Update with new key
    const encryptedKey = fieldEncryption.encrypt(request.newKey)
    const keyPreview = `${request.newKey.substring(0, 8)}...${request.newKey.substring(request.newKey.length - 4)}`

    await prisma.$executeRaw`
      UPDATE api_keys 
      SET encrypted_key = ${encryptedKey}, 
          key_preview = ${keyPreview},
          updated_at = NOW(),
          status = 'ACTIVE'
      WHERE id = ${keyId} AND tenant_id = ${tenantId}
    `

    // Log rotation
    await this.logAPIKeyAudit(keyId, 'ROTATED', userId, tenantId, {
      reason: request.reason,
      scheduled: request.scheduleRotation
    })

    return {
      success: true,
      message: 'API key rotated successfully'
    }
  }

  /**
   * Delete API key
   */
  async deleteAPIKey(
    keyId: string,
    tenantId: string,
    userId: string,
    userRole: string,
    userPermissions: string[]
  ): Promise<APIKeyOperationResponse> {
    // Check permissions
    const permissionCheck = validateAPIKeyPermissions(userRole, userPermissions, 'delete')
    if (!permissionCheck.allowed) {
      throw new Error(permissionCheck.reason || 'Insufficient permissions')
    }

    await this.ensureAPIKeyTables()

    // Archive the key before deletion
    const keyData = await prisma.$queryRaw<any[]>`
      SELECT service, encrypted_key FROM api_keys 
      WHERE id = ${keyId} AND tenant_id = ${tenantId}
    `

    if (keyData.length === 0) {
      throw new Error('API key not found')
    }

    await prisma.$executeRaw`
      INSERT INTO secure_credentials_archive (service, encrypted_credential, tenant_id, archived_at)
      VALUES (${`api_key_${keyId}`}, ${keyData[0].encrypted_key}, ${tenantId}, NOW())
    `

    // Delete the key
    await prisma.$executeRaw`
      DELETE FROM api_keys WHERE id = ${keyId} AND tenant_id = ${tenantId}
    `

    // Log deletion
    await this.logAPIKeyAudit(keyId, 'DELETED', userId, tenantId, {})

    return {
      success: true,
      message: 'API key deleted successfully'
    }
  }

  /**
   * Get decrypted API key for service use
   */
  async getDecryptedAPIKey(keyId: string, tenantId: string): Promise<string | null> {
    await this.ensureAPIKeyTables()

    const result = await prisma.$queryRaw<any[]>`
      SELECT encrypted_key, status FROM api_keys 
      WHERE id = ${keyId} AND tenant_id = ${tenantId}
    `

    if (result.length === 0 || result[0].status !== 'ACTIVE') {
      return null
    }

    // Update last used
    await prisma.$executeRaw`
      UPDATE api_keys 
      SET last_used_at = NOW(), usage_count = usage_count + 1
      WHERE id = ${keyId}
    `

    return fieldEncryption.decrypt(result[0].encrypted_key)
  }

  /**
   * Calculate API key metrics
   */
  private async calculateAPIKeyMetrics(tenantId: string): Promise<APIKeyMetrics> {
    await this.ensureAPIKeyTables()

    const results = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) as expired,
        COUNT(CASE WHEN status = 'ROTATION_REQUIRED' THEN 1 END) as rotation_required,
        COUNT(CASE WHEN status = 'COMPROMISED' THEN 1 END) as compromised,
        COUNT(CASE WHEN last_used_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_keys,
        COALESCE(SUM(usage_count), 0) as total_requests,
        COALESCE(SUM(error_count), 0) as total_errors,
        COALESCE(AVG(security_score), 0) as avg_security_score
      FROM api_keys 
      WHERE tenant_id = ${tenantId}
    `

    const data = results[0] || {}

    return {
      total: Number(data.total || 0),
      byStatus: {
        ACTIVE: Number(data.active || 0),
        INACTIVE: Number(data.inactive || 0),
        EXPIRED: Number(data.expired || 0),
        ROTATION_REQUIRED: Number(data.rotation_required || 0),
        COMPROMISED: Number(data.compromised || 0),
        PENDING_VALIDATION: 0
      },
      byVendor: {}, // TODO: Implement vendor grouping
      securityDistribution: {
        CRITICAL: 0,
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        EXCELLENT: 0
      }, // TODO: Implement security level grouping
      rotationHealth: {
        onSchedule: 0,
        overdue: 0,
        critical: 0
      }, // TODO: Implement rotation health calculation
      usageMetrics: {
        activeKeys: Number(data.active_keys || 0),
        totalRequests: Number(data.total_requests || 0),
        errorRate: Number(data.total_requests || 0) > 0 ? Number(data.total_errors || 0) / Number(data.total_requests || 0) : 0,
        avgSecurityScore: Number(data.avg_security_score || 0)
      }
    }
  }

  /**
   * Get API key audit log
   */
  private async getAPIKeyAuditLog(keyId: string): Promise<APIKeyAuditEvent[]> {
    await this.ensureAPIKeyTables()

    const results = await prisma.$queryRaw<any[]>`
      SELECT id, api_key_id, action, user_id, timestamp, metadata, ip_address, user_agent
      FROM api_key_audit 
      WHERE api_key_id = ${keyId}
      ORDER BY timestamp DESC
      LIMIT 50
    `

    return results.map(row => ({
      id: row.id,
      keyId: row.api_key_id,
      action: row.action,
      userId: row.user_id,
      timestamp: row.timestamp,
      metadata: row.metadata || {},
      ipAddress: row.ip_address,
      userAgent: row.user_agent
    }))
  }

  /**
   * Log API key audit event
   */
  private async logAPIKeyAudit(
    keyId: string, 
    action: string, 
    userId: string, 
    tenantId: string, 
    metadata: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.ensureAPIKeyTables()

    await prisma.$executeRaw`
      INSERT INTO api_key_audit (api_key_id, action, user_id, tenant_id, metadata, ip_address, user_agent)
      VALUES (${keyId}, ${action}, ${userId}, ${tenantId}, ${JSON.stringify(metadata)}, ${ipAddress || null}, ${userAgent || null})
    `
  }

  /**
   * Map database row to API key object
   */
  private mapDatabaseRowToAPIKey(row: any): APIKey {
    return {
      id: row.id,
      service: row.service,
      name: row.name,
      description: row.description,
      keyPreview: row.key_preview,
      status: row.status,
      lastUsed: row.last_used_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at,
      rotationDays: row.rotation_days,
      usage: {
        totalRequests: row.usage_count || 0,
        successfulRequests: (row.usage_count || 0) - (row.error_count || 0),
        failedRequests: row.error_count || 0,
        lastRequestAt: row.last_used_at
      },
      securityScore: {
        score: row.security_score || 0,
        level: row.security_level as SecurityLevel || 'MEDIUM',
        factors: [], // TODO: Implement factor calculation
        lastAssessment: row.updated_at,
        recommendations: [] // TODO: Implement recommendations
      },
      vendor: {
        id: row.vendor_id || '',
        name: '', // TODO: Join with vendor table
        category: 'OTHER' as any, // TODO: Get from vendor table
        supportedKeyFormats: [],
        requiredPermissions: []
      }
    }
  }

  /**
   * Get security level from score
   */
  private getSecurityLevel(score: number): SecurityLevel {
    if (score >= 90) return 'EXCELLENT'
    if (score >= 75) return 'HIGH'
    if (score >= 50) return 'MEDIUM'
    if (score >= 25) return 'LOW'
    return 'CRITICAL'
  }
}

// Export singleton instance
export const credentialManager = new SecureCredentialManager()

// Utility functions for common use cases
export const getOpenAIKey = async (tenantId?: string): Promise<string> => {
  return credentialManager.getOpenAIKey(tenantId)
}

export const rotateOpenAIKey = async (newKey: string, tenantId?: string): Promise<void> => {
  return credentialManager.rotateCredential('openai_api_key', newKey, tenantId)
}

export const checkCredentialRotations = async (): Promise<CredentialConfig[]> => {
  return credentialManager.getCredentialsNeedingRotation()
}