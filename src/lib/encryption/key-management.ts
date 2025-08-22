/**
 * CoreFlow360 - Encryption Key Management System
 * Handles key rotation, backup, and recovery
 */

import crypto from 'crypto'
import { prisma } from '@/lib/db'

export interface KeyMetadata {
  keyId: string
  version: number
  createdAt: Date
  rotatedAt?: Date
  algorithm: string
  status: 'active' | 'rotating' | 'retired'
}

export class KeyManagement {
  private static instance: KeyManagement
  
  static getInstance(): KeyManagement {
    if (!KeyManagement.instance) {
      KeyManagement.instance = new KeyManagement()
    }
    return KeyManagement.instance
  }

  /**
   * Generate a new encryption key
   */
  generateKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Validate an encryption key
   */
  validateKey(key: string): boolean {
    // Must be 64 hex characters (32 bytes)
    if (!key || key.length !== 64) return false
    
    // Must be valid hex
    const hexRegex = /^[0-9a-f]+$/i
    return hexRegex.test(key)
  }

  /**
   * Rotate encryption keys
   * Creates a new key while maintaining old key for decryption
   */
  async rotateKeys(): Promise<{
    newKey: string
    oldKey: string
    rotationId: string
  }> {
    const oldKey = process.env.ENCRYPTION_KEY!
    const newKey = this.generateKey()
    const rotationId = crypto.randomUUID()

    // In production, this would:
    // 1. Store rotation metadata in database
    // 2. Update key management service (AWS KMS, HashiCorp Vault, etc.)
    // 3. Trigger re-encryption of sensitive data
    // 4. Notify administrators

    try {
      // Store key rotation record
      await prisma.auditLog.create({
        data: {
          action: 'SECURITY_EVENT',
          entityType: 'encryption_key',
          entityId: rotationId,
          metadata: {
            event: 'key_rotation',
            timestamp: new Date().toISOString(),
            keyVersion: await this.getCurrentKeyVersion() + 1,
          },
          userId: 'system',
          tenantId: 'system',
        },
      })

      return {
        newKey,
        oldKey,
        rotationId,
      }
    } catch (error) {
      console.error('Key rotation failed:', error)
      throw new Error('Failed to rotate encryption keys')
    }
  }

  /**
   * Get current key version from database
   */
  async getCurrentKeyVersion(): Promise<number> {
    try {
      const lastRotation = await prisma.auditLog.findFirst({
        where: {
          action: 'SECURITY_EVENT',
          entityType: 'encryption_key',
          metadata: {
            path: ['event'],
            equals: 'key_rotation',
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (lastRotation && lastRotation.metadata) {
        const metadata = lastRotation.metadata as any
        return metadata.keyVersion || 1
      }

      return 1
    } catch {
      return 1
    }
  }

  /**
   * Backup encryption keys securely
   * In production, this would use a secure key management service
   */
  async backupKeys(): Promise<{
    backupId: string
    timestamp: Date
    checksum: string
  }> {
    const key = process.env.ENCRYPTION_KEY!
    const backupId = crypto.randomUUID()
    const timestamp = new Date()
    
    // Create checksum for integrity verification
    const checksum = crypto
      .createHash('sha256')
      .update(key + backupId + timestamp.toISOString())
      .digest('hex')

    // In production, this would:
    // 1. Encrypt the key with a master key
    // 2. Store in secure backup location (AWS S3 with encryption, Azure Key Vault, etc.)
    // 3. Maintain multiple backup copies
    // 4. Test restore capability

    await prisma.auditLog.create({
      data: {
        action: 'SECURITY_EVENT',
        entityType: 'encryption_key',
        entityId: backupId,
        metadata: {
          event: 'key_backup',
          timestamp: timestamp.toISOString(),
          checksum,
        },
        userId: 'system',
        tenantId: 'system',
      },
    })

    return {
      backupId,
      timestamp,
      checksum,
    }
  }

  /**
   * Verify key integrity
   */
  async verifyKeyIntegrity(): Promise<boolean> {
    const key = process.env.ENCRYPTION_KEY
    
    if (!key) {
      console.error('❌ No encryption key found')
      return false
    }

    if (!this.validateKey(key)) {
      console.error('❌ Invalid encryption key format')
      return false
    }

    // Test encryption/decryption
    try {
      const testData = 'test_data_' + Date.now()
      const { FieldEncryption } = await import('./field-encryption')
      const encryption = new FieldEncryption()
      
      const encrypted = await encryption.encrypt(testData)
      const decrypted = await encryption.decrypt(encrypted)
      
      if (decrypted !== testData) {
        console.error('❌ Encryption/decryption test failed')
        return false
      }

      console.log('✅ Encryption key verified successfully')
      return true
    } catch (error) {
      console.error('❌ Key verification failed:', error)
      return false
    }
  }

  /**
   * Initialize key management system
   */
  async initialize(): Promise<void> {
    // Verify key on startup
    const isValid = await this.verifyKeyIntegrity()
    
    if (!isValid && process.env.NODE_ENV === 'production') {
      throw new Error('Critical: Invalid encryption key configuration')
    }

    // Schedule periodic key rotation (every 90 days in production)
    if (process.env.NODE_ENV === 'production') {
      setInterval(async () => {
        await this.checkKeyRotationSchedule()
      }, 24 * 60 * 60 * 1000) // Daily check
    }
  }

  /**
   * Check if key rotation is needed
   */
  private async checkKeyRotationSchedule(): Promise<void> {
    const lastRotation = await prisma.auditLog.findFirst({
      where: {
        action: 'SECURITY_EVENT',
        entityType: 'encryption_key',
        metadata: {
          path: ['event'],
          equals: 'key_rotation',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const rotationIntervalDays = 90
    const now = new Date()
    
    if (!lastRotation) {
      // No rotation history, consider rotating
      console.log('⚠️ No key rotation history found. Consider rotating keys.')
      return
    }

    const daysSinceRotation = Math.floor(
      (now.getTime() - lastRotation.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceRotation >= rotationIntervalDays) {
      console.log(`⚠️ Keys haven't been rotated in ${daysSinceRotation} days. Rotation recommended.`)
      // In production, this would trigger automatic rotation or alert administrators
    }
  }
}

// Export singleton instance
export const keyManagement = KeyManagement.getInstance()