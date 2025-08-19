import { z } from 'zod'

export interface ConsentRecord {
  userId: string
  purpose: string
  lawfulBasis:
    | 'consent'
    | 'contract'
    | 'legal_obligation'
    | 'vital_interests'
    | 'public_task'
    | 'legitimate_interests'
  consentGiven: boolean
  consentDate: Date
  expiryDate?: Date
  withdrawnDate?: Date
  dataCategories: string[]
  thirdParties: string[]
  retentionPeriod: number // days
  source: 'explicit' | 'implied' | 'pre_ticked' | 'opt_out'
}

export interface ConsentMismatch {
  type:
    | 'missing_consent'
    | 'expired_consent'
    | 'withdrawn_consent'
    | 'purpose_mismatch'
    | 'data_category_mismatch'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  userId: string
  dataCategory: string
  currentUsage: string[]
  requiredConsent: string[]
  recommendedAction: string
}

export class ConsentMapper {
  private consentRecords: Map<string, ConsentRecord[]> = new Map()

  constructor(private tenantId: string) {}

  async mapConsents(): Promise<{
    totalUsers: number
    consentedUsers: number
    mismatches: ConsentMismatch[]
    complianceScore: number
    report: string
  }> {
    // 1) Map consents
    const consents = await this.loadConsentRecords()
    const currentDataUsage = await this.analyzeCurrentDataUsage()

    // 2) Flag mismatches
    const mismatches = this.detectConsentMismatches(consents, currentDataUsage)

    const totalUsers = consents.length
    const consentedUsers = consents.filter((c) => c.consentGiven && !c.withdrawnDate).length
    const complianceScore = this.calculateComplianceScore(consents, mismatches)

    return {
      totalUsers,
      consentedUsers,
      mismatches,
      complianceScore,
      report: this.generateXMLReport(consents, mismatches),
    }
  }

  private async loadConsentRecords(): Promise<ConsentRecord[]> {
    // Load from database - mock implementation
    return [
      {
        userId: 'user1',
        purpose: 'marketing',
        lawfulBasis: 'consent',
        consentGiven: true,
        consentDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-01-01'),
        dataCategories: ['email', 'name', 'preferences'],
        thirdParties: ['mailchimp'],
        retentionPeriod: 365,
        source: 'explicit',
      },
      {
        userId: 'user2',
        purpose: 'analytics',
        lawfulBasis: 'legitimate_interests',
        consentGiven: false,
        consentDate: new Date('2024-01-01'),
        withdrawnDate: new Date('2024-06-01'),
        dataCategories: ['usage_data', 'ip_address'],
        thirdParties: ['google_analytics'],
        retentionPeriod: 90,
        source: 'implied',
      },
    ]
  }

  private async analyzeCurrentDataUsage(): Promise<Map<string, string[]>> {
    // Analyze actual data usage in the system
    const usage = new Map<string, string[]>()
    usage.set('user1', ['email', 'name', 'preferences', 'location']) // Location not consented!
    usage.set('user2', ['usage_data', 'ip_address']) // Still using despite withdrawal!
    return usage
  }

  private detectConsentMismatches(
    consents: ConsentRecord[],
    currentUsage: Map<string, string[]>
  ): ConsentMismatch[] {
    const mismatches: ConsentMismatch[] = []

    for (const consent of consents) {
      const usage = currentUsage.get(consent.userId) || []

      // Check for withdrawn consent
      if (consent.withdrawnDate && usage.length > 0) {
        mismatches.push({
          type: 'withdrawn_consent',
          severity: 'critical',
          description: 'Data usage continues after consent withdrawal',
          userId: consent.userId,
          dataCategory: consent.dataCategories.join(', '),
          currentUsage: usage,
          requiredConsent: [],
          recommendedAction: 'Immediately stop data processing and delete data',
        })
      }

      // Check for expired consent
      if (consent.expiryDate && consent.expiryDate < new Date() && usage.length > 0) {
        mismatches.push({
          type: 'expired_consent',
          severity: 'high',
          description: 'Consent has expired but data usage continues',
          userId: consent.userId,
          dataCategory: consent.dataCategories.join(', '),
          currentUsage: usage,
          requiredConsent: consent.dataCategories,
          recommendedAction: 'Obtain fresh consent or cease processing',
        })
      }

      // Check for data category mismatches
      const unconsentedData = usage.filter((u) => !consent.dataCategories.includes(u))
      if (unconsentedData.length > 0) {
        mismatches.push({
          type: 'data_category_mismatch',
          severity: 'high',
          description: 'Processing data categories not covered by consent',
          userId: consent.userId,
          dataCategory: unconsentedData.join(', '),
          currentUsage: usage,
          requiredConsent: unconsentedData,
          recommendedAction: 'Obtain consent for additional data categories or stop processing',
        })
      }
    }

    return mismatches
  }

  private calculateComplianceScore(
    consents: ConsentRecord[],
    mismatches: ConsentMismatch[]
  ): number {
    if (consents.length === 0) return 100

    const criticalIssues = mismatches.filter((m) => m.severity === 'critical').length
    const highIssues = mismatches.filter((m) => m.severity === 'high').length
    const mediumIssues = mismatches.filter((m) => m.severity === 'medium').length

    const penalty = criticalIssues * 30 + highIssues * 15 + mediumIssues * 5
    return Math.max(0, 100 - penalty)
  }

  private generateXMLReport(consents: ConsentRecord[], mismatches: ConsentMismatch[]): string {
    const consentXML = consents
      .map(
        (c) => `
      <consent>
        <userId>${c.userId}</userId>
        <purpose>${c.purpose}</purpose>
        <lawfulBasis>${c.lawfulBasis}</lawfulBasis>
        <status>${c.consentGiven && !c.withdrawnDate ? 'active' : 'inactive'}</status>
        <dataCategories>${c.dataCategories.join(', ')}</dataCategories>
        <expiryDate>${c.expiryDate?.toISOString() || 'none'}</expiryDate>
      </consent>
    `
      )
      .join('')

    const riskXML = mismatches
      .map(
        (m) => `
      <risk>
        <type>${m.type}</type>
        <severity>${m.severity}</severity>
        <userId>${m.userId}</userId>
        <description>${m.description}</description>
        <action>${m.recommendedAction}</action>
      </risk>
    `
      )
      .join('')

    return `
      <privacy>
        <consents>${consentXML}</consents>
        <risks>${riskXML}</risks>
        <summary>
          <totalConsents>${consents.length}</totalConsents>
          <totalRisks>${mismatches.length}</totalRisks>
          <complianceScore>${this.calculateComplianceScore(consents, mismatches)}</complianceScore>
        </summary>
      </privacy>
    `
  }
}
