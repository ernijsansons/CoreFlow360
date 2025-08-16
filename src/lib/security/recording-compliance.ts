/**
 * CoreFlow360 - State-by-State Call Recording Compliance
 * Comprehensive recording laws and consent requirements
 */

export enum RecordingConsentType {
  ONE_PARTY = 'one_party',      // Only one party needs to consent
  TWO_PARTY = 'two_party',      // All parties must consent
  MIXED = 'mixed'                // Different rules for different situations
}

export enum RecordingNoticeType {
  NONE = 'none',
  BEEP = 'beep',
  VERBAL = 'verbal',
  WRITTEN = 'written'
}

export interface StateRecordingLaw {
  state: string
  stateName: string
  consentType: RecordingConsentType
  noticeRequired: RecordingNoticeType
  specificRequirements: string[]
  exceptions: string[]
  penalties: string[]
  lastUpdated: Date
  sources: string[]
}

export interface RecordingComplianceCheck {
  canRecord: boolean
  consentRequired: RecordingConsentType
  noticeType: RecordingNoticeType
  requirements: string[]
  warningMessage?: string
  legalDisclaimer?: string
}

/**
 * State-by-State Recording Compliance System
 */
export class RecordingComplianceSystem {
  private readonly stateRecordingLaws: Map<string, StateRecordingLaw>

  constructor() {
    this.stateRecordingLaws = this.initializeStateLaws()
  }

  /**
   * Initialize comprehensive state recording laws
   */
  private initializeStateLaws(): Map<string, StateRecordingLaw> {
    const laws = new Map<string, StateRecordingLaw>()

    // TWO-PARTY CONSENT STATES (All parties must consent)
    
    laws.set('CA', {
      state: 'CA',
      stateName: 'California',
      consentType: RecordingConsentType.TWO_PARTY,
      noticeRequired: RecordingNoticeType.VERBAL,
      specificRequirements: [
        'All parties must consent before recording',
        'Consent must be obtained at the beginning of the call',
        'Clear disclosure that the call is being recorded',
        'Purpose of recording must be stated',
        'Consent can be verbal but must be clear and unambiguous'
      ],
      exceptions: [
        'Law enforcement with proper authorization',
        'Emergency situations involving immediate danger'
      ],
      penalties: [
        'Criminal: Up to 1 year in jail and/or $2,500 fine per violation',
        'Civil: $5,000 per violation or 3x actual damages',
        'Evidence inadmissible in court'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['Cal. Penal Code § 632', 'Cal. Penal Code § 637.2']
    })

    laws.set('FL', {
      state: 'FL',
      stateName: 'Florida',
      consentType: RecordingConsentType.TWO_PARTY,
      noticeRequired: RecordingNoticeType.VERBAL,
      specificRequirements: [
        'All parties must consent to recording',
        'Consent must be clear and voluntary',
        'Recording notice must be given at outset',
        'Applies to both in-person and electronic communications'
      ],
      exceptions: [
        'Law enforcement with warrant',
        'Public meetings or gatherings',
        'Emergency communications to law enforcement'
      ],
      penalties: [
        'Criminal: 3rd degree felony - up to 5 years prison',
        'Civil: $100/day or $1,000 minimum damages',
        'Punitive damages available'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['Fla. Stat. § 934.03', 'Fla. Stat. § 934.10']
    })

    laws.set('IL', {
      state: 'IL',
      stateName: 'Illinois',
      consentType: RecordingConsentType.TWO_PARTY,
      noticeRequired: RecordingNoticeType.VERBAL,
      specificRequirements: [
        'All parties must consent',
        'Consent required for each recording',
        'Notice must be clear and conspicuous',
        'Applies to electronic communications',
        'Eavesdropping devices prohibited'
      ],
      exceptions: [
        'Law enforcement with court order',
        'Emergency situations'
      ],
      penalties: [
        'Criminal: Class 4 felony - 1-3 years prison',
        'Civil: Actual and punitive damages',
        'Injunctive relief available'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['720 ILCS 5/14-2', '720 ILCS 5/14-6']
    })

    laws.set('WA', {
      state: 'WA',
      stateName: 'Washington',
      consentType: RecordingConsentType.TWO_PARTY,
      noticeRequired: RecordingNoticeType.VERBAL,
      specificRequirements: [
        'All parties must consent',
        'Announcement required at beginning',
        'Consent can be implied by continuing conversation',
        'Applies to private conversations'
      ],
      exceptions: [
        'Emergency response situations',
        'Law enforcement with authorization'
      ],
      penalties: [
        'Criminal: Gross misdemeanor - up to 1 year jail',
        'Civil: Greater of $100/day or $1,000',
        'Evidence exclusion'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['RCW 9.73.030', 'RCW 9.73.060']
    })

    laws.set('PA', {
      state: 'PA',
      stateName: 'Pennsylvania',
      consentType: RecordingConsentType.TWO_PARTY,
      noticeRequired: RecordingNoticeType.VERBAL,
      specificRequirements: [
        'All parties must consent',
        'Prior consent required',
        'Clear notice of recording',
        'Applies to oral, wire, and electronic communications'
      ],
      exceptions: [
        'Law enforcement with court order',
        'Emergency situations'
      ],
      penalties: [
        'Criminal: 3rd degree felony - up to 7 years',
        'Civil: $100/day minimum',
        'Punitive damages possible'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['18 Pa.C.S. § 5703', '18 Pa.C.S. § 5725']
    })

    laws.set('MD', {
      state: 'MD',
      stateName: 'Maryland',
      consentType: RecordingConsentType.TWO_PARTY,
      noticeRequired: RecordingNoticeType.VERBAL,
      specificRequirements: [
        'All parties must consent',
        'Consent required before recording',
        'Clear disclosure required',
        'Applies to private conversations'
      ],
      exceptions: [
        'Law enforcement with warrant',
        'Emergency 911 calls'
      ],
      penalties: [
        'Criminal: Felony - up to 5 years and $10,000',
        'Civil: Damages and attorney fees',
        'Evidence inadmissible'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['Md. Code, Cts. & Jud. Proc. § 10-402']
    })

    laws.set('MA', {
      state: 'MA',
      stateName: 'Massachusetts',
      consentType: RecordingConsentType.TWO_PARTY,
      noticeRequired: RecordingNoticeType.VERBAL,
      specificRequirements: [
        'All parties must consent',
        'Secret recording prohibited',
        'Consent must be express or implied',
        'Applies to wire and oral communications'
      ],
      exceptions: [
        'Law enforcement with warrant'
      ],
      penalties: [
        'Criminal: Up to 5 years state prison',
        'Civil: Triple damages or $100/day',
        'Evidence exclusion'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['Mass. Gen. Laws ch. 272, § 99']
    })

    // ONE-PARTY CONSENT STATES (Only one party needs consent)
    
    laws.set('NY', {
      state: 'NY',
      stateName: 'New York',
      consentType: RecordingConsentType.ONE_PARTY,
      noticeRequired: RecordingNoticeType.NONE,
      specificRequirements: [
        'At least one party must consent',
        'Recording party can be the consenting party',
        'No notice required for one-party consent'
      ],
      exceptions: [
        'Cannot record for criminal or tortious purpose',
        'Cannot record where no party consents'
      ],
      penalties: [
        'Criminal: Class E felony if no consent',
        'Civil: Damages for illegal recording'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['N.Y. Penal Law § 250.00', 'N.Y. Penal Law § 250.05']
    })

    laws.set('TX', {
      state: 'TX',
      stateName: 'Texas',
      consentType: RecordingConsentType.ONE_PARTY,
      noticeRequired: RecordingNoticeType.NONE,
      specificRequirements: [
        'One party consent sufficient',
        'Party to conversation can record',
        'No notice required',
        'Applies to wire, oral, and electronic communications'
      ],
      exceptions: [
        'Cannot record for criminal purpose',
        'Cannot intercept without being party'
      ],
      penalties: [
        'Criminal: State jail felony - 180 days to 2 years',
        'Civil: $10,000 per violation',
        'Injunctive relief'
      ],
      lastUpdated: new Date('2024-01-01'),
      sources: ['Tex. Penal Code § 16.02', 'Tex. Civ. Prac. & Rem. Code § 123.002']
    })

    // Add more states...
    // This is a subset - would include all 50 states + DC in production

    return laws
  }

  /**
   * Check recording compliance for specific state(s)
   */
  async checkRecordingCompliance(params: {
    callerState: string
    recipientState: string
    isBusinessCall: boolean
    hasExistingRelationship: boolean
    callPurpose?: string
  }): Promise<RecordingComplianceCheck> {
    try {
      const callerLaw = this.stateRecordingLaws.get(params.callerState)
      const recipientLaw = this.stateRecordingLaws.get(params.recipientState)

      if (!callerLaw || !recipientLaw) {
        // Default to most restrictive if state not found
        return {
          canRecord: true,
          consentRequired: RecordingConsentType.TWO_PARTY,
          noticeType: RecordingNoticeType.VERBAL,
          requirements: ['Obtain consent from all parties before recording'],
          warningMessage: 'State recording laws not found - defaulting to most restrictive requirements'
        }
      }

      // Use most restrictive law between the two states
      const isTwoPartyRequired = 
        callerLaw.consentType === RecordingConsentType.TWO_PARTY ||
        recipientLaw.consentType === RecordingConsentType.TWO_PARTY

      const consentRequired = isTwoPartyRequired 
        ? RecordingConsentType.TWO_PARTY 
        : RecordingConsentType.ONE_PARTY

      // Determine notice requirements
      const noticeType = this.getMostRestrictiveNotice(
        callerLaw.noticeRequired,
        recipientLaw.noticeRequired
      )

      // Combine requirements from both states
      const requirements = new Set<string>()
      
      if (isTwoPartyRequired) {
        requirements.add('All parties must consent to recording')
        requirements.add('Clear verbal notice must be given at start of call')
        requirements.add('Consent must be obtained before recording begins')
      } else {
        requirements.add('At least one party must consent to recording')
      }

      // Add specific state requirements
      callerLaw.specificRequirements.forEach(req => requirements.add(req))
      recipientLaw.specificRequirements.forEach(req => requirements.add(req))

      // Business call considerations
      if (params.isBusinessCall) {
        requirements.add('Business purpose must be disclosed')
        if (params.hasExistingRelationship) {
          requirements.add('Existing business relationship should be acknowledged')
        }
      }

      // Generate legal disclaimer
      const legalDisclaimer = this.generateLegalDisclaimer({
        consentType: consentRequired,
        states: [params.callerState, params.recipientState],
        isBusinessCall: params.isBusinessCall
      })

      return {
        canRecord: true,
        consentRequired,
        noticeType,
        requirements: Array.from(requirements),
        legalDisclaimer,
        warningMessage: isTwoPartyRequired 
          ? 'This call requires consent from all parties before recording'
          : undefined
      }

    } catch (error) {
      console.error('Error checking recording compliance:', error)
      
      // Fail safe - require full consent
      return {
        canRecord: false,
        consentRequired: RecordingConsentType.TWO_PARTY,
        noticeType: RecordingNoticeType.VERBAL,
        requirements: ['Unable to verify compliance - recording not recommended'],
        warningMessage: 'Compliance check failed - please verify manually'
      }
    }
  }

  /**
   * Generate compliant recording notice script
   */
  generateRecordingNotice(params: {
    companyName: string
    purpose: string
    consentType: RecordingConsentType
    includeOptOut?: boolean
  }): string {
    const notices = {
      [RecordingConsentType.TWO_PARTY]: `
This call is being recorded by ${params.companyName} for ${params.purpose}. 
By continuing this conversation, you consent to this recording. 
${params.includeOptOut ? 'If you do not wish to be recorded, please let us know now and we will continue without recording.' : ''}
Do you agree to this recording?
      `.trim(),

      [RecordingConsentType.ONE_PARTY]: `
Please be advised that this call may be recorded by ${params.companyName} for ${params.purpose}.
      `.trim(),

      [RecordingConsentType.MIXED]: `
This call is being recorded by ${params.companyName} for ${params.purpose}. 
Your continued participation constitutes consent to this recording.
      `.trim()
    }

    return notices[params.consentType]
  }

  /**
   * Get state-specific penalties for violations
   */
  getViolationPenalties(state: string): {
    criminal: string[]
    civil: string[]
    other: string[]
  } {
    const law = this.stateRecordingLaws.get(state)
    
    if (!law) {
      return {
        criminal: ['Potential criminal charges under state law'],
        civil: ['Civil liability for damages'],
        other: ['Evidence may be inadmissible']
      }
    }

    return {
      criminal: law.penalties.filter(p => p.toLowerCase().includes('criminal')),
      civil: law.penalties.filter(p => p.toLowerCase().includes('civil')),
      other: law.penalties.filter(p => 
        !p.toLowerCase().includes('criminal') && 
        !p.toLowerCase().includes('civil')
      )
    }
  }

  /**
   * Check if interstate call requires special handling
   */
  checkInterstateCompliance(states: string[]): {
    mostRestrictiveState: string
    consentRequired: RecordingConsentType
    specialRequirements: string[]
  } {
    let mostRestrictiveState = states[0]
    let mostRestrictiveType = RecordingConsentType.ONE_PARTY

    for (const state of states) {
      const law = this.stateRecordingLaws.get(state)
      if (law && law.consentType === RecordingConsentType.TWO_PARTY) {
        mostRestrictiveState = state
        mostRestrictiveType = RecordingConsentType.TWO_PARTY
      }
    }

    const specialRequirements: string[] = []

    // Interstate call special requirements
    if (states.length > 1) {
      specialRequirements.push('Interstate call - most restrictive state law applies')
      
      if (mostRestrictiveType === RecordingConsentType.TWO_PARTY) {
        specialRequirements.push('All parties must consent due to two-party consent state involvement')
      }
    }

    // Federal requirements
    specialRequirements.push('Federal law requires one-party consent minimum')
    specialRequirements.push('FCC regulations may apply to interstate calls')

    return {
      mostRestrictiveState,
      consentRequired: mostRestrictiveType,
      specialRequirements
    }
  }

  /**
   * Generate legal disclaimer for recording
   */
  private generateLegalDisclaimer(params: {
    consentType: RecordingConsentType
    states: string[]
    isBusinessCall: boolean
  }): string {
    const stateNames = params.states
      .map(s => this.stateRecordingLaws.get(s)?.stateName || s)
      .join(' and ')

    return `
LEGAL NOTICE: This recording is subject to the laws of ${stateNames}. 
${params.consentType === RecordingConsentType.TWO_PARTY 
  ? 'All parties must consent to this recording.' 
  : 'This recording is made with the consent of at least one party.'} 
${params.isBusinessCall 
  ? 'This recording is for business purposes including quality assurance and training.' 
  : ''} 
Any unauthorized use, distribution, or disclosure of this recording may result in civil and criminal penalties.
    `.trim()
  }

  /**
   * Get most restrictive notice requirement
   */
  private getMostRestrictiveNotice(
    notice1: RecordingNoticeType,
    notice2: RecordingNoticeType
  ): RecordingNoticeType {
    const priority = {
      [RecordingNoticeType.WRITTEN]: 4,
      [RecordingNoticeType.VERBAL]: 3,
      [RecordingNoticeType.BEEP]: 2,
      [RecordingNoticeType.NONE]: 1
    }

    return priority[notice1] > priority[notice2] ? notice1 : notice2
  }

  /**
   * Validate recording consent
   */
  async validateRecordingConsent(params: {
    callId: string
    consentObtained: boolean
    consentMethod: 'verbal' | 'written' | 'implied'
    consentTimestamp: Date
    states: string[]
    recordingUrl?: string
  }): Promise<{
    isValid: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check consent requirements for all states
    const compliance = this.checkInterstateCompliance(params.states)

    // Validate consent obtained
    if (!params.consentObtained) {
      issues.push('No consent obtained for recording')
      return { isValid: false, issues, recommendations }
    }

    // Check consent method
    if (compliance.consentRequired === RecordingConsentType.TWO_PARTY) {
      if (params.consentMethod === 'implied') {
        issues.push('Two-party consent states require explicit consent, not implied')
      }
      
      if (!params.recordingUrl) {
        recommendations.push('Maintain recording of consent for compliance proof')
      }
    }

    // Validate timing
    const callStartBuffer = 30000 // 30 seconds
    if (params.consentTimestamp.getTime() > Date.now() + callStartBuffer) {
      issues.push('Consent must be obtained at the beginning of the call')
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    }
  }
}

// Export singleton instance
export const recordingCompliance = new RecordingComplianceSystem()