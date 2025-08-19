/**
 * Comprehensive Data Flow Mapping System
 * Maps all personal data flows across CoreFlow360 ABOS for compliance
 */

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging/logger'

export interface DataFlowMap {
  flowId: string
  dataCategory: DataCategory
  dataElements: string[]
  source: DataSource
  destinations: DataDestination[]
  processingPurpose: ProcessingPurpose[]
  lawfulBasis: LawfulBasis
  retentionPeriod: number // days
  crossBorderTransfers: CrossBorderTransfer[]
  automatedDecisionMaking: boolean
  aiProcessing: boolean
  encryptionLevel: 'None' | 'Basic' | 'Advanced' | 'End-to-End'
  accessControls: AccessControl[]
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  complianceRequirements: string[]
  lastUpdated: Date
}

export interface DataCategory {
  category:
    | 'Identity'
    | 'Contact'
    | 'Financial'
    | 'Behavioral'
    | 'Biometric'
    | 'Health'
    | 'Sensitive'
  subcategory: string
  sensitivityLevel: 'Public' | 'Internal' | 'Confidential' | 'Restricted'
  specialCategory: boolean // GDPR special categories
  minorData: boolean // Under 18 data
}

export interface DataSource {
  sourceType: 'User Input' | 'System Generated' | 'Third Party' | 'Public Records' | 'AI Generated'
  sourceName: string
  sourceLocation: string
  collectionMethod: 'Direct' | 'Indirect' | 'Automated' | 'Inferred'
  consentObtained: boolean
  consentDate?: Date
  dataMinimization: boolean
}

export interface DataDestination {
  destinationType:
    | 'Internal System'
    | 'Third Party Service'
    | 'Cloud Provider'
    | 'AI Service'
    | 'Archive'
  destinationName: string
  destinationLocation: string
  country: string
  adequacyDecision: boolean
  safeguards: string[]
  dataProcessorAgreement: boolean
  purposeLimitation: boolean
}

export interface ProcessingPurpose {
  purpose:
    | 'Service Provision'
    | 'AI Training'
    | 'Analytics'
    | 'Marketing'
    | 'Support'
    | 'Legal Compliance'
  specificPurpose: string
  necessaryForPurpose: boolean
  proportionate: boolean
  compatible: boolean
}

export interface LawfulBasis {
  gdprBasis:
    | 'Consent'
    | 'Contract'
    | 'Legal Obligation'
    | 'Vital Interests'
    | 'Public Task'
    | 'Legitimate Interests'
  ccpaBasis: 'Sale' | 'Business Purpose' | 'Service Provider'
  specificBasis: string
  legitInterestAssessment?: string
  balancingTest?: boolean
}

export interface CrossBorderTransfer {
  fromCountry: string
  toCountry: string
  transferMechanism:
    | 'Adequacy Decision'
    | 'Standard Contractual Clauses'
    | 'Binding Corporate Rules'
    | 'Derogation'
  safeguards: string[]
  transferImpactAssessment: boolean
  monitoringMeasures: string[]
}

export interface AccessControl {
  userRole: string
  accessLevel: 'Read' | 'Write' | 'Delete' | 'Admin'
  accessJustification: string
  accessLogged: boolean
  accessReviewed: boolean
  accessRevoked: boolean
}

export interface DataInventoryReport {
  totalDataFlows: number
  highRiskFlows: number
  crossBorderFlows: number
  aiProcessingFlows: number
  complianceGaps: ComplianceGap[]
  recommendedActions: string[]
  privacyRiskScore: number
  dataMinimizationOpportunities: string[]
  retentionOptimizations: string[]
}

export interface ComplianceGap {
  flowId: string
  gapType:
    | 'Missing Consent'
    | 'Invalid Lawful Basis'
    | 'Excessive Retention'
    | 'Inadequate Safeguards'
    | 'Missing Documentation'
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  description: string
  impact: string
  remediation: string
  timeline: number
  cost: number
}

class DataFlowMapper {
  private tenantId: string
  private dataFlows: DataFlowMap[] = []

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  async mapAllDataFlows(): Promise<DataInventoryReport> {
    logger.info('Starting comprehensive data flow mapping', { tenantId: this.tenantId })

    // Map all data flows across the system
    await this.mapUserAuthenticationFlows()
    await this.mapCustomerDataFlows()
    await this.mapAITrainingDataFlows()
    await this.mapVoiceDataFlows()
    await this.mapAnalyticsDataFlows()
    await this.mapFinancialDataFlows()
    await this.mapEmployeeDataFlows()
    await this.mapThirdPartyIntegrationFlows()

    // Analyze compliance gaps
    const complianceGaps = await this.identifyComplianceGaps()

    // Generate recommendations
    const recommendations = this.generateRecommendations()

    // Calculate privacy risk score
    const privacyRiskScore = this.calculatePrivacyRiskScore()

    const report: DataInventoryReport = {
      totalDataFlows: this.dataFlows.length,
      highRiskFlows: this.dataFlows.filter(
        (f) => f.riskLevel === 'High' || f.riskLevel === 'Critical'
      ).length,
      crossBorderFlows: this.dataFlows.filter((f) => f.crossBorderTransfers.length > 0).length,
      aiProcessingFlows: this.dataFlows.filter((f) => f.aiProcessing).length,
      complianceGaps,
      recommendedActions: recommendations,
      privacyRiskScore,
      dataMinimizationOpportunities: this.identifyDataMinimizationOpportunities(),
      retentionOptimizations: this.identifyRetentionOptimizations(),
    }

    await this.saveDataFlowInventory(report)
    return report
  }

  private async mapUserAuthenticationFlows(): Promise<void> {
    this.dataFlows.push({
      flowId: 'UF-001',
      dataCategory: {
        category: 'Identity',
        subcategory: 'Authentication Data',
        sensitivityLevel: 'Confidential',
        specialCategory: false,
        minorData: false,
      },
      dataElements: [
        'Email address',
        'Hashed password',
        'Session tokens',
        'IP address',
        'Device fingerprint',
      ],
      source: {
        sourceType: 'User Input',
        sourceName: 'CoreFlow360 Registration Form',
        sourceLocation: 'Application Frontend',
        collectionMethod: 'Direct',
        consentObtained: true,
        consentDate: new Date(),
        dataMinimization: true,
      },
      destinations: [
        {
          destinationType: 'Cloud Provider',
          destinationName: 'Vercel PostgreSQL',
          destinationLocation: 'US East',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Standard Contractual Clauses', 'Encryption'],
          dataProcessorAgreement: true,
          purposeLimitation: true,
        },
        {
          destinationType: 'Third Party Service',
          destinationName: 'NextAuth.js',
          destinationLocation: 'Cloud Processing',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Data Processing Agreement'],
          dataProcessorAgreement: true,
          purposeLimitation: true,
        },
      ],
      processingPurpose: [
        {
          purpose: 'Service Provision',
          specificPurpose: 'User authentication and access control',
          necessaryForPurpose: true,
          proportionate: true,
          compatible: true,
        },
      ],
      lawfulBasis: {
        gdprBasis: 'Contract',
        ccpaBasis: 'Service Provider',
        specificBasis: 'Performance of contract for service provision',
      },
      retentionPeriod: 2555, // 7 years
      crossBorderTransfers: [
        {
          fromCountry: 'European Union',
          toCountry: 'United States',
          transferMechanism: 'Standard Contractual Clauses',
          safeguards: ['Encryption in transit and at rest', 'Access controls'],
          transferImpactAssessment: false,
          monitoringMeasures: ['Regular security audits', 'Breach monitoring'],
        },
      ],
      automatedDecisionMaking: false,
      aiProcessing: false,
      encryptionLevel: 'Advanced',
      accessControls: [
        {
          userRole: 'System Administrator',
          accessLevel: 'Admin',
          accessJustification: 'System maintenance and support',
          accessLogged: true,
          accessReviewed: true,
          accessRevoked: false,
        },
      ],
      riskLevel: 'Medium',
      complianceRequirements: ['GDPR', 'CCPA', 'SOX'],
      lastUpdated: new Date(),
    })
  }

  private async mapCustomerDataFlows(): Promise<void> {
    this.dataFlows.push({
      flowId: 'CF-001',
      dataCategory: {
        category: 'Contact',
        subcategory: 'Customer Information',
        sensitivityLevel: 'Confidential',
        specialCategory: false,
        minorData: false,
      },
      dataElements: [
        'Company name',
        'Contact person',
        'Email',
        'Phone',
        'Address',
        'Business classification',
      ],
      source: {
        sourceType: 'User Input',
        sourceName: 'Customer Management Module',
        sourceLocation: 'CRM System',
        collectionMethod: 'Direct',
        consentObtained: true,
        consentDate: new Date(),
        dataMinimization: false, // Often collecting more than necessary
      },
      destinations: [
        {
          destinationType: 'Internal System',
          destinationName: 'PostgreSQL Database',
          destinationLocation: 'Primary Database',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Encryption', 'Access controls'],
          dataProcessorAgreement: false,
          purposeLimitation: true,
        },
        {
          destinationType: 'AI Service',
          destinationName: 'OpenAI GPT-4',
          destinationLocation: 'OpenAI Servers',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Data Processing Agreement', 'Purpose limitation'],
          dataProcessorAgreement: true,
          purposeLimitation: false, // AI training use
        },
      ],
      processingPurpose: [
        {
          purpose: 'Service Provision',
          specificPurpose: 'Customer relationship management',
          necessaryForPurpose: true,
          proportionate: true,
          compatible: true,
        },
        {
          purpose: 'AI Training',
          specificPurpose: 'Improving AI business insights',
          necessaryForPurpose: false,
          proportionate: false,
          compatible: false, // Purpose creep
        },
      ],
      lawfulBasis: {
        gdprBasis: 'Contract',
        ccpaBasis: 'Business Purpose',
        specificBasis: 'Performance of CRM services',
      },
      retentionPeriod: 2555, // 7 years for business records
      crossBorderTransfers: [
        {
          fromCountry: 'European Union',
          toCountry: 'United States',
          transferMechanism: 'Standard Contractual Clauses',
          safeguards: ['Encryption', 'Access controls', 'Regular audits'],
          transferImpactAssessment: false,
          monitoringMeasures: ['Quarterly reviews', 'Incident reporting'],
        },
      ],
      automatedDecisionMaking: true,
      aiProcessing: true,
      encryptionLevel: 'Advanced',
      accessControls: [
        {
          userRole: 'Sales Representative',
          accessLevel: 'Read',
          accessJustification: 'Customer relationship management',
          accessLogged: true,
          accessReviewed: true,
          accessRevoked: false,
        },
      ],
      riskLevel: 'High',
      complianceRequirements: ['GDPR', 'CCPA', 'CAN-SPAM'],
      lastUpdated: new Date(),
    })
  }

  private async mapAITrainingDataFlows(): Promise<void> {
    this.dataFlows.push({
      flowId: 'AI-001',
      dataCategory: {
        category: 'Behavioral',
        subcategory: 'AI Training Data',
        sensitivityLevel: 'Restricted',
        specialCategory: false,
        minorData: false,
      },
      dataElements: [
        'User interactions',
        'System responses',
        'Business decisions',
        'Performance metrics',
        'Error patterns',
      ],
      source: {
        sourceType: 'System Generated',
        sourceName: 'CoreFlow360 Platform',
        sourceLocation: 'Application Layer',
        collectionMethod: 'Automated',
        consentObtained: false, // No specific AI training consent
        dataMinimization: false,
      },
      destinations: [
        {
          destinationType: 'AI Service',
          destinationName: 'OpenAI API',
          destinationLocation: 'OpenAI Infrastructure',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Data Processing Agreement'],
          dataProcessorAgreement: true,
          purposeLimitation: false,
        },
        {
          destinationType: 'AI Service',
          destinationName: 'Anthropic Claude',
          destinationLocation: 'Anthropic Infrastructure',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Data Processing Agreement'],
          dataProcessorAgreement: true,
          purposeLimitation: false,
        },
      ],
      processingPurpose: [
        {
          purpose: 'AI Training',
          specificPurpose: 'Training AI models for business automation',
          necessaryForPurpose: false,
          proportionate: false,
          compatible: false,
        },
      ],
      lawfulBasis: {
        gdprBasis: 'Legitimate Interests',
        ccpaBasis: 'Business Purpose',
        specificBasis: 'Legitimate interest in AI improvement',
        legitInterestAssessment: 'Not conducted',
        balancingTest: false,
      },
      retentionPeriod: -1, // Indefinite retention
      crossBorderTransfers: [
        {
          fromCountry: 'European Union',
          toCountry: 'United States',
          transferMechanism: 'Standard Contractual Clauses',
          safeguards: ['Data minimization', 'Purpose limitation'],
          transferImpactAssessment: false,
          monitoringMeasures: ['Usage monitoring'],
        },
      ],
      automatedDecisionMaking: true,
      aiProcessing: true,
      encryptionLevel: 'Basic',
      accessControls: [
        {
          userRole: 'AI Engineer',
          accessLevel: 'Read',
          accessJustification: 'AI model development',
          accessLogged: false,
          accessReviewed: false,
          accessRevoked: false,
        },
      ],
      riskLevel: 'Critical',
      complianceRequirements: ['GDPR', 'EU AI Act', 'CCPA'],
      lastUpdated: new Date(),
    })
  }

  private async mapVoiceDataFlows(): Promise<void> {
    this.dataFlows.push({
      flowId: 'VD-001',
      dataCategory: {
        category: 'Biometric',
        subcategory: 'Voice Recordings',
        sensitivityLevel: 'Restricted',
        specialCategory: true, // Biometric data under GDPR
        minorData: false,
      },
      dataElements: [
        'Voice recordings',
        'Speech patterns',
        'Audio metadata',
        'Transcriptions',
        'Voice signatures',
      ],
      source: {
        sourceType: 'User Input',
        sourceName: 'Voice Interface',
        sourceLocation: 'Twilio/VAPI Integration',
        collectionMethod: 'Direct',
        consentObtained: true,
        consentDate: new Date(),
        dataMinimization: true,
      },
      destinations: [
        {
          destinationType: 'Third Party Service',
          destinationName: 'Twilio Voice',
          destinationLocation: 'Twilio Infrastructure',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Data Processing Agreement', 'Encryption'],
          dataProcessorAgreement: true,
          purposeLimitation: true,
        },
        {
          destinationType: 'AI Service',
          destinationName: 'OpenAI Whisper',
          destinationLocation: 'OpenAI Infrastructure',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Data Processing Agreement'],
          dataProcessorAgreement: true,
          purposeLimitation: false,
        },
      ],
      processingPurpose: [
        {
          purpose: 'Service Provision',
          specificPurpose: 'Voice-based business interactions',
          necessaryForPurpose: true,
          proportionate: true,
          compatible: true,
        },
        {
          purpose: 'AI Training',
          specificPurpose: 'Voice recognition improvement',
          necessaryForPurpose: false,
          proportionate: false,
          compatible: false,
        },
      ],
      lawfulBasis: {
        gdprBasis: 'Consent',
        ccpaBasis: 'Service Provider',
        specificBasis: 'Explicit consent for biometric processing',
      },
      retentionPeriod: 30, // Short retention for voice data
      crossBorderTransfers: [
        {
          fromCountry: 'European Union',
          toCountry: 'United States',
          transferMechanism: 'Standard Contractual Clauses',
          safeguards: ['End-to-end encryption', 'Automatic deletion'],
          transferImpactAssessment: true,
          monitoringMeasures: ['Real-time monitoring', 'Breach detection'],
        },
      ],
      automatedDecisionMaking: true,
      aiProcessing: true,
      encryptionLevel: 'End-to-End',
      accessControls: [
        {
          userRole: 'Voice Engineer',
          accessLevel: 'Read',
          accessJustification: 'Voice system maintenance',
          accessLogged: true,
          accessReviewed: true,
          accessRevoked: false,
        },
      ],
      riskLevel: 'Critical',
      complianceRequirements: ['GDPR', 'Biometric Privacy Laws', 'CCPA'],
      lastUpdated: new Date(),
    })
  }

  private async mapAnalyticsDataFlows(): Promise<void> {
    this.dataFlows.push({
      flowId: 'AD-001',
      dataCategory: {
        category: 'Behavioral',
        subcategory: 'Usage Analytics',
        sensitivityLevel: 'Internal',
        specialCategory: false,
        minorData: false,
      },
      dataElements: [
        'Page views',
        'Click patterns',
        'Session duration',
        'Feature usage',
        'Performance metrics',
      ],
      source: {
        sourceType: 'System Generated',
        sourceName: 'Vercel Analytics',
        sourceLocation: 'Client-side tracking',
        collectionMethod: 'Automated',
        consentObtained: true,
        consentDate: new Date(),
        dataMinimization: true,
      },
      destinations: [
        {
          destinationType: 'Third Party Service',
          destinationName: 'Vercel Analytics',
          destinationLocation: 'Vercel Infrastructure',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Data Processing Agreement', 'Anonymization'],
          dataProcessorAgreement: true,
          purposeLimitation: true,
        },
      ],
      processingPurpose: [
        {
          purpose: 'Analytics',
          specificPurpose: 'Performance monitoring and optimization',
          necessaryForPurpose: true,
          proportionate: true,
          compatible: true,
        },
      ],
      lawfulBasis: {
        gdprBasis: 'Legitimate Interests',
        ccpaBasis: 'Business Purpose',
        specificBasis: 'Legitimate interest in service improvement',
        legitInterestAssessment: 'Conducted',
        balancingTest: true,
      },
      retentionPeriod: 730, // 2 years
      crossBorderTransfers: [
        {
          fromCountry: 'European Union',
          toCountry: 'United States',
          transferMechanism: 'Standard Contractual Clauses',
          safeguards: ['Data aggregation', 'Anonymization'],
          transferImpactAssessment: false,
          monitoringMeasures: ['Regular review'],
        },
      ],
      automatedDecisionMaking: false,
      aiProcessing: false,
      encryptionLevel: 'Basic',
      accessControls: [
        {
          userRole: 'Product Manager',
          accessLevel: 'Read',
          accessJustification: 'Product optimization',
          accessLogged: true,
          accessReviewed: true,
          accessRevoked: false,
        },
      ],
      riskLevel: 'Low',
      complianceRequirements: ['GDPR', 'ePrivacy Directive'],
      lastUpdated: new Date(),
    })
  }

  private async mapFinancialDataFlows(): Promise<void> {
    this.dataFlows.push({
      flowId: 'FD-001',
      dataCategory: {
        category: 'Financial',
        subcategory: 'Payment Information',
        sensitivityLevel: 'Restricted',
        specialCategory: false,
        minorData: false,
      },
      dataElements: [
        'Credit card tokens',
        'Billing address',
        'Payment history',
        'Subscription details',
        'Invoice data',
      ],
      source: {
        sourceType: 'User Input',
        sourceName: 'Payment Forms',
        sourceLocation: 'Stripe Checkout',
        collectionMethod: 'Direct',
        consentObtained: true,
        consentDate: new Date(),
        dataMinimization: true,
      },
      destinations: [
        {
          destinationType: 'Third Party Service',
          destinationName: 'Stripe',
          destinationLocation: 'Stripe Infrastructure',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['PCI DSS Compliance', 'Encryption'],
          dataProcessorAgreement: true,
          purposeLimitation: true,
        },
      ],
      processingPurpose: [
        {
          purpose: 'Service Provision',
          specificPurpose: 'Payment processing and billing',
          necessaryForPurpose: true,
          proportionate: true,
          compatible: true,
        },
      ],
      lawfulBasis: {
        gdprBasis: 'Contract',
        ccpaBasis: 'Service Provider',
        specificBasis: 'Performance of payment contract',
      },
      retentionPeriod: 2555, // 7 years for tax/accounting
      crossBorderTransfers: [
        {
          fromCountry: 'European Union',
          toCountry: 'United States',
          transferMechanism: 'Standard Contractual Clauses',
          safeguards: ['PCI DSS', 'Tokenization', 'Encryption'],
          transferImpactAssessment: true,
          monitoringMeasures: ['Fraud detection', 'Security monitoring'],
        },
      ],
      automatedDecisionMaking: true,
      aiProcessing: false,
      encryptionLevel: 'Advanced',
      accessControls: [
        {
          userRole: 'Finance Manager',
          accessLevel: 'Read',
          accessJustification: 'Financial reporting and reconciliation',
          accessLogged: true,
          accessReviewed: true,
          accessRevoked: false,
        },
      ],
      riskLevel: 'High',
      complianceRequirements: ['PCI DSS', 'GDPR', 'SOX'],
      lastUpdated: new Date(),
    })
  }

  private async mapEmployeeDataFlows(): Promise<void> {
    this.dataFlows.push({
      flowId: 'ED-001',
      dataCategory: {
        category: 'Identity',
        subcategory: 'Employee Information',
        sensitivityLevel: 'Confidential',
        specialCategory: false,
        minorData: false,
      },
      dataElements: [
        'Name',
        'Email',
        'Role',
        'Department',
        'Access permissions',
        'Performance data',
      ],
      source: {
        sourceType: 'User Input',
        sourceName: 'HR Management System',
        sourceLocation: 'Internal System',
        collectionMethod: 'Direct',
        consentObtained: true,
        consentDate: new Date(),
        dataMinimization: true,
      },
      destinations: [
        {
          destinationType: 'Internal System',
          destinationName: 'PostgreSQL Database',
          destinationLocation: 'Primary Database',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Encryption', 'Access controls'],
          dataProcessorAgreement: false,
          purposeLimitation: true,
        },
      ],
      processingPurpose: [
        {
          purpose: 'Service Provision',
          specificPurpose: 'Employee management and system access',
          necessaryForPurpose: true,
          proportionate: true,
          compatible: true,
        },
      ],
      lawfulBasis: {
        gdprBasis: 'Contract',
        ccpaBasis: 'Business Purpose',
        specificBasis: 'Employment contract performance',
      },
      retentionPeriod: 2555, // 7 years after employment
      crossBorderTransfers: [],
      automatedDecisionMaking: false,
      aiProcessing: false,
      encryptionLevel: 'Advanced',
      accessControls: [
        {
          userRole: 'HR Manager',
          accessLevel: 'Admin',
          accessJustification: 'HR administration',
          accessLogged: true,
          accessReviewed: true,
          accessRevoked: false,
        },
      ],
      riskLevel: 'Medium',
      complianceRequirements: ['GDPR', 'Employment Law'],
      lastUpdated: new Date(),
    })
  }

  private async mapThirdPartyIntegrationFlows(): Promise<void> {
    this.dataFlows.push({
      flowId: 'TI-001',
      dataCategory: {
        category: 'Contact',
        subcategory: 'Integration Data',
        sensitivityLevel: 'Confidential',
        specialCategory: false,
        minorData: false,
      },
      dataElements: [
        'API keys',
        'Integration data',
        'Sync logs',
        'Error reports',
        'Performance metrics',
      ],
      source: {
        sourceType: 'Third Party',
        sourceName: 'External ERP Systems',
        sourceLocation: 'Various Integrations',
        collectionMethod: 'Automated',
        consentObtained: false,
        dataMinimization: false,
      },
      destinations: [
        {
          destinationType: 'Internal System',
          destinationName: 'Integration Database',
          destinationLocation: 'Integration Layer',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Encryption', 'API rate limiting'],
          dataProcessorAgreement: false,
          purposeLimitation: true,
        },
      ],
      processingPurpose: [
        {
          purpose: 'Service Provision',
          specificPurpose: 'Third-party system integration',
          necessaryForPurpose: true,
          proportionate: true,
          compatible: true,
        },
      ],
      lawfulBasis: {
        gdprBasis: 'Legitimate Interests',
        ccpaBasis: 'Business Purpose',
        specificBasis: 'Legitimate interest in system integration',
      },
      retentionPeriod: 365, // 1 year
      crossBorderTransfers: [],
      automatedDecisionMaking: false,
      aiProcessing: false,
      encryptionLevel: 'Advanced',
      accessControls: [
        {
          userRole: 'Integration Engineer',
          accessLevel: 'Admin',
          accessJustification: 'Integration maintenance',
          accessLogged: true,
          accessReviewed: false,
          accessRevoked: false,
        },
      ],
      riskLevel: 'Medium',
      complianceRequirements: ['GDPR', 'API Security Standards'],
      lastUpdated: new Date(),
    })
  }

  private async identifyComplianceGaps(): Promise<ComplianceGap[]> {
    const gaps: ComplianceGap[] = []

    for (const flow of this.dataFlows) {
      // Check for missing consent for AI training
      if (flow.aiProcessing && !flow.source.consentObtained) {
        gaps.push({
          flowId: flow.flowId,
          gapType: 'Missing Consent',
          severity: 'Critical',
          description: 'AI processing without explicit consent',
          impact: 'GDPR violation, potential fines up to 4% of global revenue',
          remediation: 'Obtain explicit consent for AI processing or change lawful basis',
          timeline: 30,
          cost: 25000,
        })
      }

      // Check for inadequate lawful basis
      if (
        flow.lawfulBasis.gdprBasis === 'Legitimate Interests' &&
        !flow.lawfulBasis.balancingTest
      ) {
        gaps.push({
          flowId: flow.flowId,
          gapType: 'Invalid Lawful Basis',
          severity: 'High',
          description: 'Legitimate interests without balancing test',
          impact: 'Invalid processing under GDPR',
          remediation: 'Conduct proper balancing test or change lawful basis',
          timeline: 60,
          cost: 15000,
        })
      }

      // Check for excessive retention
      if (flow.retentionPeriod > 2555 || flow.retentionPeriod === -1) {
        gaps.push({
          flowId: flow.flowId,
          gapType: 'Excessive Retention',
          severity: 'Medium',
          description: 'Data retained longer than necessary',
          impact: 'GDPR storage limitation principle violation',
          remediation: 'Implement data retention policy and automated deletion',
          timeline: 90,
          cost: 10000,
        })
      }

      // Check for cross-border transfers without TIA
      for (const transfer of flow.crossBorderTransfers) {
        if (!transfer.transferImpactAssessment && !transfer.fromCountry.includes('adequacy')) {
          gaps.push({
            flowId: flow.flowId,
            gapType: 'Inadequate Safeguards',
            severity: 'High',
            description: 'Cross-border transfer without Transfer Impact Assessment',
            impact: 'Unlawful international data transfer',
            remediation: 'Conduct Transfer Impact Assessment and implement additional safeguards',
            timeline: 45,
            cost: 20000,
          })
        }
      }

      // Check for special category data
      if (flow.dataCategory.specialCategory && flow.lawfulBasis.gdprBasis !== 'Consent') {
        gaps.push({
          flowId: flow.flowId,
          gapType: 'Invalid Lawful Basis',
          severity: 'Critical',
          description: 'Special category data without proper lawful basis',
          impact: 'GDPR Article 9 violation',
          remediation: 'Obtain explicit consent or establish alternative lawful basis',
          timeline: 30,
          cost: 30000,
        })
      }
    }

    return gaps
  }

  private generateRecommendations(): string[] {
    return [
      'IMMEDIATE: Obtain explicit consent for AI training data processing',
      'IMMEDIATE: Conduct balancing tests for legitimate interests processing',
      'IMMEDIATE: Perform Transfer Impact Assessments for US data transfers',
      'HIGH PRIORITY: Implement automated data retention and deletion',
      'HIGH PRIORITY: Document all data processing activities in ROPA',
      'HIGH PRIORITY: Establish data subject rights response procedures',
      'MEDIUM PRIORITY: Implement data minimization across all flows',
      'MEDIUM PRIORITY: Enhance encryption for high-risk data flows',
      'MEDIUM PRIORITY: Regular privacy impact assessments for new features',
      'ONGOING: Quarterly data flow mapping updates',
      'ONGOING: Staff training on data protection requirements',
      'ONGOING: Monitor regulatory changes affecting data flows',
    ]
  }

  private calculatePrivacyRiskScore(): number {
    let totalRisk = 0
    let weightedRisks = 0

    for (const flow of this.dataFlows) {
      const riskWeight =
        {
          Low: 1,
          Medium: 2,
          High: 3,
          Critical: 4,
        }[flow.riskLevel] || 1

      const specialCategoryMultiplier = flow.dataCategory.specialCategory ? 1.5 : 1
      const aiProcessingMultiplier = flow.aiProcessing ? 1.3 : 1
      const crossBorderMultiplier = flow.crossBorderTransfers.length > 0 ? 1.2 : 1

      const flowRisk =
        riskWeight * specialCategoryMultiplier * aiProcessingMultiplier * crossBorderMultiplier
      totalRisk += flowRisk
      weightedRisks++
    }

    return Math.round((totalRisk / (weightedRisks * 4)) * 100) // Normalize to 0-100 scale
  }

  private identifyDataMinimizationOpportunities(): string[] {
    const opportunities: string[] = []

    for (const flow of this.dataFlows) {
      if (!flow.source.dataMinimization) {
        opportunities.push(
          `${flow.flowId}: Review data collection to minimize unnecessary elements`
        )
      }

      if (flow.processingPurpose.some((p) => !p.necessaryForPurpose)) {
        opportunities.push(`${flow.flowId}: Remove processing purposes that are not necessary`)
      }

      if (flow.dataElements.length > 10) {
        opportunities.push(`${flow.flowId}: Large number of data elements - consider reducing`)
      }
    }

    return opportunities
  }

  private identifyRetentionOptimizations(): string[] {
    const optimizations: string[] = []

    for (const flow of this.dataFlows) {
      if (flow.retentionPeriod > 1095) {
        // More than 3 years
        optimizations.push(
          `${flow.flowId}: Consider reducing retention period from ${flow.retentionPeriod} days`
        )
      }

      if (flow.retentionPeriod === -1) {
        optimizations.push(
          `${flow.flowId}: Implement defined retention period instead of indefinite retention`
        )
      }

      if (flow.aiProcessing && flow.retentionPeriod > 365) {
        optimizations.push(`${flow.flowId}: AI training data should have shorter retention period`)
      }
    }

    return optimizations
  }

  private async saveDataFlowInventory(report: DataInventoryReport): Promise<void> {
    try {
      await prisma.aiActivity.create({
        data: {
          tenantId: this.tenantId,
          action: 'DATA_FLOW_MAPPING',
          details: JSON.stringify({
            totalDataFlows: report.totalDataFlows,
            highRiskFlows: report.highRiskFlows,
            crossBorderFlows: report.crossBorderFlows,
            aiProcessingFlows: report.aiProcessingFlows,
            privacyRiskScore: report.privacyRiskScore,
            complianceGaps: report.complianceGaps.length,
            timestamp: new Date().toISOString(),
            dataFlows: this.dataFlows,
          }),
        },
      })

      logger.info('Data flow inventory saved', {
        tenantId: this.tenantId,
        totalFlows: report.totalDataFlows,
        riskScore: report.privacyRiskScore,
      })
    } catch (error) {
      logger.error('Failed to save data flow inventory', {
        tenantId: this.tenantId,
        error,
      })
    }
  }

  // Public methods for accessing data flows
  async getDataFlowById(flowId: string): Promise<DataFlowMap | null> {
    return this.dataFlows.find((flow) => flow.flowId === flowId) || null
  }

  async getDataFlowsByCategory(category: string): Promise<DataFlowMap[]> {
    return this.dataFlows.filter((flow) => flow.dataCategory.category === category)
  }

  async getHighRiskDataFlows(): Promise<DataFlowMap[]> {
    return this.dataFlows.filter(
      (flow) => flow.riskLevel === 'High' || flow.riskLevel === 'Critical'
    )
  }

  async generateDataFlowReport(): Promise<string> {
    const report = await this.mapAllDataFlows()

    return `
# Data Flow Mapping Report

## Executive Summary
- Total Data Flows: ${report.totalDataFlows}
- High Risk Flows: ${report.highRiskFlows}
- Cross-Border Transfers: ${report.crossBorderFlows}
- AI Processing Flows: ${report.aiProcessingFlows}
- Privacy Risk Score: ${report.privacyRiskScore}/100

## Compliance Gaps
${report.complianceGaps.map((gap) => `- ${gap.description} (${gap.severity})`).join('\n')}

## Recommended Actions
${report.recommendedActions.map((action) => `- ${action}`).join('\n')}

## Data Minimization Opportunities
${report.dataMinimizationOpportunities.map((opp) => `- ${opp}`).join('\n')}

## Retention Optimizations
${report.retentionOptimizations.map((opt) => `- ${opt}`).join('\n')}

Generated: ${new Date().toISOString()}
    `
  }
}

export { DataFlowMapper }
export type { DataFlowMap, DataInventoryReport, ComplianceGap }
