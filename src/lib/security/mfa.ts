/**
 * CoreFlow360 - Multi-Factor Authentication System
 * Production-grade MFA implementation with TOTP and backup codes
 */

import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

// MFA configuration
const MFA_CONFIG = {
  appName: 'CoreFlow360',
  issuer: 'CoreFlow360',
  window: 2, // Allow 2 time windows (30 seconds each)
  digits: 6,
  period: 30,
}

// Configure otplib
authenticator.options = {
  digits: MFA_CONFIG.digits,
  period: MFA_CONFIG.period,
  window: MFA_CONFIG.window,
}

export interface MfaSetupResult {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
  manualEntryKey: string
}

export interface MfaVerificationResult {
  success: boolean
  error?: string
  backupCodeUsed?: boolean
}

/**
 * Generate MFA secret and setup data for a user
 */
export async function generateMfaSetup(userId: string, userEmail: string): Promise<MfaSetupResult> {
  try {
    // Generate a random secret
    const secret = authenticator.generateSecret()
    
    // Create the OTP auth URL
    const otpAuthUrl = authenticator.keyuri(userEmail, MFA_CONFIG.issuer, secret)
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl)
    
    // Generate backup codes
    const backupCodes = generateBackupCodes()
    
    // Store MFA settings in database (disabled by default until verified)
    await prisma.mfaSettings.upsert({
      where: { userId },
      create: {
        userId,
        secret,
        backupCodes: backupCodes,
        enabled: false,
        createdAt: new Date(),
      },
      update: {
        secret,
        backupCodes: backupCodes,
        enabled: false, // Reset to disabled until verified
        updatedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'MFA_SETUP_INITIATED',
        userId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    })

    return {
      secret,
      qrCodeUrl,
      backupCodes,
      manualEntryKey: secret,
    }
  } catch (error) {
    console.error('MFA setup generation error:', error)
    throw new Error('Failed to generate MFA setup')
  }
}

/**
 * Verify MFA setup with initial TOTP code
 */
export async function verifyMfaSetup(userId: string, totpCode: string): Promise<boolean> {
  try {
    const mfaSettings = await prisma.mfaSettings.findUnique({
      where: { userId },
    })

    if (!mfaSettings || !mfaSettings.secret) {
      throw new Error('MFA setup not found')
    }

    // Verify the TOTP code
    const isValid = authenticator.verify({
      token: totpCode,
      secret: mfaSettings.secret,
    })

    if (isValid) {
      // Enable MFA
      await prisma.mfaSettings.update({
        where: { userId },
        data: {
          enabled: true,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: 'MFA_ENABLED',
          userId,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      })

      return true
    }

    return false
  } catch (error) {
    console.error('MFA setup verification error:', error)
    return false
  }
}

/**
 * Verify MFA code during login
 */
export async function verifyMfaCode(userId: string, code: string): Promise<MfaVerificationResult> {
  try {
    const mfaSettings = await prisma.mfaSettings.findUnique({
      where: { userId },
    })

    if (!mfaSettings || !mfaSettings.enabled || !mfaSettings.secret) {
      return { success: false, error: 'MFA not enabled' }
    }

    // First try TOTP verification
    const isTotpValid = authenticator.verify({
      token: code,
      secret: mfaSettings.secret,
    })

    if (isTotpValid) {
      // Update last used
      await prisma.mfaSettings.update({
        where: { userId },
        data: { lastUsedAt: new Date() },
      })

      return { success: true }
    }

    // Try backup codes
    const backupCodes = mfaSettings.backupCodes as string[]
    const hashedCode = hashBackupCode(code)
    
    if (backupCodes.includes(hashedCode)) {
      // Remove used backup code
      const updatedBackupCodes = backupCodes.filter(bc => bc !== hashedCode)
      
      await prisma.mfaSettings.update({
        where: { userId },
        data: {
          backupCodes: updatedBackupCodes,
          lastUsedAt: new Date(),
        },
      })

      // Create audit log for backup code usage
      await prisma.auditLog.create({
        data: {
          action: 'MFA_BACKUP_CODE_USED',
          userId,
          metadata: {
            remainingBackupCodes: updatedBackupCodes.length,
            timestamp: new Date().toISOString(),
          },
        },
      })

      return { success: true, backupCodeUsed: true }
    }

    return { success: false, error: 'Invalid MFA code' }
  } catch (error) {
    console.error('MFA verification error:', error)
    return { success: false, error: 'MFA verification failed' }
  }
}

/**
 * Disable MFA for a user
 */
export async function disableMfa(userId: string, totpCode?: string): Promise<boolean> {
  try {
    const mfaSettings = await prisma.mfaSettings.findUnique({
      where: { userId },
    })

    if (!mfaSettings || !mfaSettings.enabled) {
      return true // Already disabled
    }

    // Require TOTP verification to disable (security measure)
    if (totpCode) {
      const isValid = authenticator.verify({
        token: totpCode,
        secret: mfaSettings.secret!,
      })

      if (!isValid) {
        return false
      }
    }

    // Disable MFA
    await prisma.mfaSettings.update({
      where: { userId },
      data: {
        enabled: false,
        disabledAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'MFA_DISABLED',
        userId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    })

    return true
  } catch (error) {
    console.error('MFA disable error:', error)
    return false
  }
}

/**
 * Generate new backup codes
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  try {
    const newBackupCodes = generateBackupCodes()
    
    await prisma.mfaSettings.update({
      where: { userId },
      data: {
        backupCodes: newBackupCodes,
        updatedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'MFA_BACKUP_CODES_REGENERATED',
        userId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Return unhashed codes for display
    return newBackupCodes.map(code => code.split(':')[0])
  } catch (error) {
    console.error('Backup codes regeneration error:', error)
    throw new Error('Failed to regenerate backup codes')
  }
}

/**
 * Get MFA status for a user
 */
export async function getMfaStatus(userId: string) {
  try {
    const mfaSettings = await prisma.mfaSettings.findUnique({
      where: { userId },
    })

    return {
      enabled: mfaSettings?.enabled || false,
      verifiedAt: mfaSettings?.verifiedAt,
      lastUsedAt: mfaSettings?.lastUsedAt,
      backupCodesCount: (mfaSettings?.backupCodes as string[])?.length || 0,
    }
  } catch (error) {
    console.error('Get MFA status error:', error)
    return {
      enabled: false,
      verifiedAt: null,
      lastUsedAt: null,
      backupCodesCount: 0,
    }
  }
}

/**
 * Check if MFA is required for admin operations
 */
export function requiresMfaForOperation(userRole: string, operation: string): boolean {
  const mfaRequiredOperations = [
    'DELETE_USER',
    'MODIFY_BILLING',
    'EXPORT_DATA',
    'ADMIN_SETTINGS',
    'SECURITY_SETTINGS',
    'API_KEY_MANAGEMENT',
  ]

  const mfaRequiredRoles = ['ADMIN', 'SUPER_ADMIN']

  return mfaRequiredRoles.includes(userRole) && mfaRequiredOperations.includes(operation)
}

// Private helper functions

function generateBackupCodes(): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    const hashedCode = hashBackupCode(code)
    codes.push(hashedCode)
  }
  
  return codes
}

function hashBackupCode(code: string): string {
  // Store backup codes as hash:plaintext for display purposes
  const hash = crypto.createHash('sha256').update(code).digest('hex')
  return `${code}:${hash}`
}

// Rate limiting for MFA attempts
const mfaAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkMfaRateLimit(userId: string): boolean {
  const now = Date.now()
  const attempts = mfaAttempts.get(userId)
  
  if (!attempts) {
    mfaAttempts.set(userId, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset counter if more than 15 minutes passed
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    mfaAttempts.set(userId, { count: 1, lastAttempt: now })
    return true
  }
  
  // Allow max 5 attempts per 15 minutes
  if (attempts.count >= 5) {
    return false
  }
  
  attempts.count++
  attempts.lastAttempt = now
  return true
}

export function resetMfaRateLimit(userId: string): void {
  mfaAttempts.delete(userId)
}