/**
 * CoreFlow360 - Secure Credential Management System
 * Encrypted storage and rotation of API keys and secrets
 */

import { fieldEncryption } from '@/lib/encryption/field-encryption'
import { prisma } from '@/lib/db'

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