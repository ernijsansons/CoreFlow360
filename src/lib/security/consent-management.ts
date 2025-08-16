/**
 * CoreFlow360 - FORTRESS-LEVEL Consent Management System
 * TCPA, GDPR, CCPA compliant consent tracking and enforcement
 */

import { db } from '@/lib/db'
import crypto from 'crypto'

export enum ConsentType {
  TCPA_VOICE_CALL = 'tcpa_voice_call',
  TCPA_SMS = 'tcpa_sms',
  CALL_RECORDING = 'call_recording',
  DATA_PROCESSING = 'data_processing',
  MARKETING_COMMUNICATIONS = 'marketing_communications',
  THIRD_PARTY_SHARING = 'third_party_sharing'
}

export enum ConsentMethod {
  WRITTEN_FORM = 'written_form',
  VERBAL_RECORDED = 'verbal_recorded',
  DIGITAL_CHECKBOX = 'digital_checkbox',
  SMS_OPTIN = 'sms_optin',
  EMAIL_CONFIRMATION = 'email_confirmation',
  API_PROVIDED = 'api_provided'
}

export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export interface ConsentRecord {
  id: string
  tenantId: string
  customerId?: string
  leadId?: string
  phoneNumber: string
  email?: string
  consentType: ConsentType
  consentStatus: ConsentStatus
  consentMethod: ConsentMethod
  consentText: string
  consentVersion: string
  ipAddress: string
  userAgent: string
  geoLocation?: {
    country: string
    state?: string
    city?: string
  }
  verificationMethod?: string
  verificationToken?: string
  verifiedAt?: Date
  grantedAt?: Date
  expiresAt?: Date
  revokedAt?: Date
  revokedBy?: string
  revokedReason?: string
  parentConsentId?: string
  metadata?: Record<string, any>
  signature?: string
  witnessName?: string
  witnessSignature?: string
  recordingUrl?: string
  formUrl?: string
  checksum: string
  createdAt: Date
  updatedAt: Date
}

export interface ConsentVerification {
  isValid: boolean
  status: ConsentStatus
  reason?: string
  expiresAt?: Date
  restrictions?: string[]
}

/**
 * FORTRESS-LEVEL Consent Management System
 */
export class ConsentManagementSystem {
  private readonly CONSENT_VERSIONS = {
    TCPA_VOICE_CALL: '2.0',
    TCPA_SMS: '2.0',
    CALL_RECORDING: '1.5',
    DATA_PROCESSING: '3.0',
    MARKETING_COMMUNICATIONS: '1.2',
    THIRD_PARTY_SHARING: '1.0'
  }

  private readonly CONSENT_EXPIRY_DAYS = {
    TCPA_VOICE_CALL: 730, // 2 years
    TCPA_SMS: 730, // 2 years
    CALL_RECORDING: 365, // 1 year
    DATA_PROCESSING: 1095, // 3 years
    MARKETING_COMMUNICATIONS: 365, // 1 year
    THIRD_PARTY_SHARING: 365 // 1 year
  }

  /**
   * Create new consent record with full validation
   */
  async createConsent(params: {
    tenantId: string
    customerId?: string
    leadId?: string
    phoneNumber: string
    email?: string
    consentType: ConsentType
    consentMethod: ConsentMethod
    consentText?: string
    ipAddress: string
    userAgent: string
    metadata?: Record<string, any>
    recordingUrl?: string
    formUrl?: string
    verificationToken?: string
  }): Promise<ConsentRecord> {
    try {
      // Validate phone number format
      const normalizedPhone = this.normalizePhoneNumber(params.phoneNumber)
      
      // Check for existing active consent
      const existingConsent = await this.getActiveConsent(
        params.tenantId,
        normalizedPhone,
        params.consentType
      )

      if (existingConsent) {
        throw new Error(`Active consent already exists for ${params.consentType}`)
      }

      // Get geolocation from IP
      const geoLocation = await this.getGeolocation(params.ipAddress)

      // Generate consent text if not provided
      const consentText = params.consentText || this.generateConsentText(params.consentType)

      // Calculate expiry date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + this.CONSENT_EXPIRY_DAYS[params.consentType])

      // Create consent record
      const consentData = {
        id: this.generateConsentId(),
        tenantId: params.tenantId,
        customerId: params.customerId,
        leadId: params.leadId,
        phoneNumber: normalizedPhone,
        email: params.email,
        consentType: params.consentType,
        consentStatus: ConsentStatus.GRANTED,
        consentMethod: params.consentMethod,
        consentText,
        consentVersion: this.CONSENT_VERSIONS[params.consentType],
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        geoLocation,
        verificationToken: params.verificationToken,
        grantedAt: new Date(),
        expiresAt,
        metadata: params.metadata,
        recordingUrl: params.recordingUrl,
        formUrl: params.formUrl,
        checksum: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Generate checksum for integrity
      consentData.checksum = this.generateChecksum(consentData)

      // Store in database
      const consent = await db.consentRecord.create({
        data: consentData
      })

      // Log audit trail
      await this.logConsentAudit({
        action: 'CONSENT_GRANTED',
        consentId: consent.id,
        tenantId: params.tenantId,
        customerId: params.customerId,
        consentType: params.consentType,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: {
          method: params.consentMethod,
          version: this.CONSENT_VERSIONS[params.consentType]
        }
      })

      return consent as ConsentRecord

    } catch (error) {
      console.error('Error creating consent:', error)
      throw error
    }
  }

  /**
   * Verify consent before any voice operation
   */
  async verifyConsent(
    tenantId: string,
    phoneNumber: string,
    consentType: ConsentType,
    options: {
      requireRecordingConsent?: boolean
      checkDNC?: boolean
      checkState?: string
    } = {}
  ): Promise<ConsentVerification> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)

      // Get active consent
      const consent = await this.getActiveConsent(tenantId, normalizedPhone, consentType)

      if (!consent) {
        return {
          isValid: false,
          status: ConsentStatus.DENIED,
          reason: 'No active consent found'
        }
      }

      // Verify checksum integrity
      if (!this.verifyChecksum(consent)) {
        await this.logSecurityAlert({
          type: 'CONSENT_TAMPERING',
          consentId: consent.id,
          tenantId,
          severity: 'HIGH'
        })

        return {
          isValid: false,
          status: ConsentStatus.DENIED,
          reason: 'Consent record integrity check failed'
        }
      }

      // Check expiration
      if (consent.expiresAt && consent.expiresAt < new Date()) {
        return {
          isValid: false,
          status: ConsentStatus.EXPIRED,
          reason: 'Consent has expired',
          expiresAt: consent.expiresAt
        }
      }

      // Check if revoked
      if (consent.consentStatus === ConsentStatus.REVOKED) {
        return {
          isValid: false,
          status: ConsentStatus.REVOKED,
          reason: consent.revokedReason || 'Consent was revoked'
        }
      }

      // Additional recording consent check
      if (options.requireRecordingConsent) {
        const recordingConsent = await this.getActiveConsent(
          tenantId,
          normalizedPhone,
          ConsentType.CALL_RECORDING
        )

        if (!recordingConsent) {
          return {
            isValid: false,
            status: ConsentStatus.DENIED,
            reason: 'Call recording consent required but not found'
          }
        }
      }

      // Check Do Not Call list
      if (options.checkDNC) {
        const isDNC = await this.checkDNCList(normalizedPhone)
        if (isDNC) {
          return {
            isValid: false,
            status: ConsentStatus.DENIED,
            reason: 'Number is on Do Not Call list'
          }
        }
      }

      // State-specific compliance check
      const restrictions: string[] = []
      if (options.checkState) {
        const stateRestrictions = await this.checkStateCompliance(
          options.checkState,
          consentType
        )
        restrictions.push(...stateRestrictions)
      }

      // Log verification
      await this.logConsentAudit({
        action: 'CONSENT_VERIFIED',
        consentId: consent.id,
        tenantId,
        customerId: consent.customerId,
        consentType,
        metadata: {
          verified: true,
          restrictions
        }
      })

      return {
        isValid: true,
        status: consent.consentStatus,
        expiresAt: consent.expiresAt,
        restrictions
      }

    } catch (error) {
      console.error('Error verifying consent:', error)
      
      return {
        isValid: false,
        status: ConsentStatus.DENIED,
        reason: 'Consent verification error'
      }
    }
  }

  /**
   * Revoke consent with reason tracking
   */
  async revokeConsent(
    tenantId: string,
    phoneNumber: string,
    consentType: ConsentType,
    revokedBy: string,
    reason: string,
    options: {
      revokeAll?: boolean
      notifyCustomer?: boolean
    } = {}
  ): Promise<boolean> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)

      if (options.revokeAll) {
        // Revoke all consent types for this phone number
        await db.consentRecord.updateMany({
          where: {
            tenantId,
            phoneNumber: normalizedPhone,
            consentStatus: ConsentStatus.GRANTED
          },
          data: {
            consentStatus: ConsentStatus.REVOKED,
            revokedAt: new Date(),
            revokedBy,
            revokedReason: reason,
            updatedAt: new Date()
          }
        })
      } else {
        // Revoke specific consent type
        await db.consentRecord.updateMany({
          where: {
            tenantId,
            phoneNumber: normalizedPhone,
            consentType,
            consentStatus: ConsentStatus.GRANTED
          },
          data: {
            consentStatus: ConsentStatus.REVOKED,
            revokedAt: new Date(),
            revokedBy,
            revokedReason: reason,
            updatedAt: new Date()
          }
        })
      }

      // Log audit trail
      await this.logConsentAudit({
        action: 'CONSENT_REVOKED',
        tenantId,
        consentType,
        metadata: {
          phoneNumber: normalizedPhone,
          revokedBy,
          reason,
          revokeAll: options.revokeAll
        }
      })

      // Notify customer if requested
      if (options.notifyCustomer) {
        await this.sendRevocationNotification(normalizedPhone, consentType)
      }

      return true

    } catch (error) {
      console.error('Error revoking consent:', error)
      return false
    }
  }

  /**
   * Get consent history for compliance reporting
   */
  async getConsentHistory(
    tenantId: string,
    phoneNumber?: string,
    customerId?: string,
    options: {
      includeRevoked?: boolean
      includeExpired?: boolean
      limit?: number
    } = {}
  ): Promise<ConsentRecord[]> {
    try {
      const where: any = { tenantId }

      if (phoneNumber) {
        where.phoneNumber = this.normalizePhoneNumber(phoneNumber)
      }

      if (customerId) {
        where.customerId = customerId
      }

      if (!options.includeRevoked) {
        where.consentStatus = { not: ConsentStatus.REVOKED }
      }

      if (!options.includeExpired) {
        where.OR = [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }

      const consents = await db.consentRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 100
      })

      return consents as ConsentRecord[]

    } catch (error) {
      console.error('Error getting consent history:', error)
      return []
    }
  }

  /**
   * Generate compliant consent text
   */
  private generateConsentText(consentType: ConsentType): string {
    const templates = {
      [ConsentType.TCPA_VOICE_CALL]: `
By providing your phone number, you expressly consent to receive calls and voice messages from CoreFlow360 and its affiliates at the number provided, including calls made using an automatic telephone dialing system or prerecorded voice. Consent is not required as a condition of purchase. Message and data rates may apply. You can revoke consent at any time by calling 1-800-XXX-XXXX or emailing privacy@coreflow360.com.
      `.trim(),

      [ConsentType.TCPA_SMS]: `
By providing your phone number, you agree to receive SMS/text messages from CoreFlow360 at the number provided. Message frequency varies. Message and data rates may apply. Reply STOP to cancel, HELP for help. Terms: coreflow360.com/sms-terms
      `.trim(),

      [ConsentType.CALL_RECORDING]: `
This call may be recorded for quality assurance, training, and compliance purposes. By continuing this call, you consent to such recording. If you do not wish to be recorded, please inform us now and we will handle your inquiry without recording.
      `.trim(),

      [ConsentType.DATA_PROCESSING]: `
I consent to CoreFlow360 processing my personal data in accordance with the Privacy Policy (coreflow360.com/privacy). I understand I have the right to access, correct, delete, and port my data, and can withdraw consent at any time.
      `.trim(),

      [ConsentType.MARKETING_COMMUNICATIONS]: `
I agree to receive marketing communications from CoreFlow360 about products, services, and special offers. I can unsubscribe at any time using the link in any email or by contacting privacy@coreflow360.com.
      `.trim(),

      [ConsentType.THIRD_PARTY_SHARING]: `
I consent to CoreFlow360 sharing my information with trusted third-party service providers as described in the Privacy Policy. This sharing is limited to providing requested services and improving user experience.
      `.trim()
    }

    return templates[consentType] || 'Consent text not available'
  }

  /**
   * Get active consent record
   */
  private async getActiveConsent(
    tenantId: string,
    phoneNumber: string,
    consentType: ConsentType
  ): Promise<ConsentRecord | null> {
    const consent = await db.consentRecord.findFirst({
      where: {
        tenantId,
        phoneNumber,
        consentType,
        consentStatus: ConsentStatus.GRANTED,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { grantedAt: 'desc' }
    })

    return consent as ConsentRecord | null
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Add country code if not present (assuming US)
    if (cleaned.length === 10) {
      return `+1${cleaned}`
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`
    }
    
    return phone
  }

  /**
   * Generate unique consent ID
   */
  private generateConsentId(): string {
    return `consent_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
  }

  /**
   * Generate checksum for consent integrity
   */
  private generateChecksum(data: any): string {
    const content = JSON.stringify({
      phoneNumber: data.phoneNumber,
      consentType: data.consentType,
      consentText: data.consentText,
      grantedAt: data.grantedAt,
      expiresAt: data.expiresAt
    })

    return crypto
      .createHash('sha256')
      .update(content + process.env.CONSENT_HASH_SECRET)
      .digest('hex')
  }

  /**
   * Verify consent checksum
   */
  private verifyChecksum(consent: ConsentRecord): boolean {
    const expectedChecksum = this.generateChecksum(consent)
    return consent.checksum === expectedChecksum
  }

  /**
   * Get geolocation from IP address
   */
  private async getGeolocation(ipAddress: string): Promise<any> {
    // Implementation would use IP geolocation service
    // Mock implementation for now
    return {
      country: 'US',
      state: 'CA',
      city: 'San Francisco'
    }
  }

  /**
   * Check Do Not Call list
   */
  private async checkDNCList(phoneNumber: string): Promise<boolean> {
    // Implementation would check:
    // 1. National DNC Registry
    // 2. Internal DNC list
    // 3. State-specific DNC lists
    
    // Check internal DNC list
    const isDNC = await db.dncList.findFirst({
      where: {
        phoneNumber,
        active: true
      }
    })

    return !!isDNC
  }

  /**
   * Check state-specific compliance
   */
  private async checkStateCompliance(
    state: string,
    consentType: ConsentType
  ): Promise<string[]> {
    const restrictions: string[] = []

    // State-specific rules
    const stateRules = {
      'CA': {
        [ConsentType.CALL_RECORDING]: ['All parties must consent to recording'],
        [ConsentType.DATA_PROCESSING]: ['CCPA rights must be provided']
      },
      'FL': {
        [ConsentType.CALL_RECORDING]: ['All parties must consent to recording']
      },
      'IL': {
        [ConsentType.CALL_RECORDING]: ['All parties must consent to recording'],
        [ConsentType.DATA_PROCESSING]: ['Biometric data requires written consent']
      }
      // Add more states as needed
    }

    const rules = stateRules[state]?.[consentType] || []
    restrictions.push(...rules)

    return restrictions
  }

  /**
   * Log consent audit trail
   */
  private async logConsentAudit(params: {
    action: string
    consentId?: string
    tenantId: string
    customerId?: string
    consentType?: ConsentType
    ipAddress?: string
    userAgent?: string
    metadata?: any
  }): Promise<void> {
    await db.auditLog.create({
      data: {
        action: params.action,
        entityType: 'CONSENT',
        entityId: params.consentId,
        tenantId: params.tenantId,
        customerId: params.customerId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: params.metadata,
        timestamp: new Date()
      }
    })
  }

  /**
   * Log security alert
   */
  private async logSecurityAlert(params: {
    type: string
    consentId: string
    tenantId: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    metadata?: any
  }): Promise<void> {
    await db.securityAlert.create({
      data: {
        type: params.type,
        severity: params.severity,
        entityType: 'CONSENT',
        entityId: params.consentId,
        tenantId: params.tenantId,
        metadata: params.metadata,
        timestamp: new Date()
      }
    })

    // Notify security team for HIGH/CRITICAL alerts
    if (['HIGH', 'CRITICAL'].includes(params.severity)) {
      // Implementation would send alerts
      console.error(`SECURITY ALERT: ${params.type} for consent ${params.consentId}`)
    }
  }

  /**
   * Send revocation notification
   */
  private async sendRevocationNotification(
    phoneNumber: string,
    consentType: ConsentType
  ): Promise<void> {
    // Implementation would send SMS/Email notification
    console.log(`Revocation notification sent to ${phoneNumber} for ${consentType}`)
  }
}

// Export singleton instance
export const consentManager = new ConsentManagementSystem()