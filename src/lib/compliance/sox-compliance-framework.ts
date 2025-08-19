/**
 * SOX (Sarbanes-Oxley) Compliance Framework
 * Financial reporting controls and audit trail for CoreFlow360 ABOS
 */

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging/logger'
import { AuditLogger } from '@/services/security/audit-logging'

export interface SOXControl {
  controlId: string
  controlName: string
  controlType: 'Preventive' | 'Detective' | 'Compensating'
  riskLevel: 'High' | 'Medium' | 'Low'
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual'
  owner: string
  description: string
  evidenceRequired: string[]
  lastTested?: Date
  testResult?: 'Effective' | 'Ineffective' | 'Not Tested'
  deficiencies: string[]
  remediationPlan?: string
}

export interface SOXAuditResult {
  overallRating: 'Effective' | 'Significant Deficiency' | 'Material Weakness'
  controlsEvaluated: number
  effectiveControls: number
  deficientControls: number
  materialWeaknesses: string[]
  significantDeficiencies: string[]
  managementRecommendations: string[]
  certificationReadiness: boolean
  estimatedRemediationTime: number
  complianceCosts: number
}

export interface FinancialReportingControl {
  entityLevel: EntityLevelControl[]
  processLevel: ProcessLevelControl[]
  itGeneralControls: ITGeneralControl[]
  applicationControls: ApplicationControl[]
  disclosureControls: DisclosureControl[]
}

export interface EntityLevelControl {
  area: 'Ethics' | 'Management Override' | 'Board Oversight' | 'Risk Assessment'
  control: string
  implementationStatus: 'Implemented' | 'In Progress' | 'Not Implemented'
  effectiveness: 'Effective' | 'Needs Improvement' | 'Ineffective'
}

export interface ProcessLevelControl {
  process: 'Revenue' | 'Expenses' | 'Payroll' | 'Inventory' | 'Financial Close'
  control: string
  automationLevel: 'Manual' | 'Semi-Automated' | 'Fully Automated'
  aiInvolvement: boolean
  riskOfError: 'High' | 'Medium' | 'Low'
}

export interface ITGeneralControl {
  domain: 'Access Security' | 'Change Management' | 'Operations' | 'Data Integrity'
  control: string
  systemsInScope: string[]
  cloudProviderControls: boolean
  effectiveness: 'Effective' | 'Needs Improvement' | 'Ineffective'
}

export interface ApplicationControl {
  application: string
  controlType: 'Input' | 'Processing' | 'Output' | 'Interface'
  description: string
  automatedControl: boolean
  aiDecisionMaking: boolean
  completenessAccuracy: 'Complete' | 'Incomplete' | 'Inaccurate'
}

export interface DisclosureControl {
  category: 'Financial Statements' | 'MD&A' | 'Footnotes' | 'SEC Filings'
  control: string
  reviewLevel: 'Management' | 'Board' | 'External Auditor'
  aiGeneratedContent: boolean
  effectiveness: 'Effective' | 'Needs Improvement' | 'Ineffective'
}

class SOXComplianceFramework {
  private tenantId: string
  private controls: SOXControl[] = []

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  async performSOXReadinessAssessment(): Promise<SOXAuditResult> {
    logger.info('Starting SOX compliance assessment', { tenantId: this.tenantId })

    // Initialize SOX controls framework
    await this.initializeSOXControls()

    // Test each control area
    const entityLevelResults = await this.evaluateEntityLevelControls()
    const processLevelResults = await this.evaluateProcessLevelControls()
    const itGeneralResults = await this.evaluateITGeneralControls()
    const applicationResults = await this.evaluateApplicationControls()
    const disclosureResults = await this.evaluateDisclosureControls()

    // Assess AI-specific financial risks
    const aiFinancialRisks = await this.assessAIFinancialRisks()

    // Calculate overall SOX compliance rating
    const auditResult = this.calculateSOXRating({
      entityLevel: entityLevelResults,
      processLevel: processLevelResults,
      itGeneral: itGeneralResults,
      application: applicationResults,
      disclosure: disclosureResults,
      aiRisks: aiFinancialRisks,
    })

    // Generate remediation plan
    const remediationPlan = this.generateRemediationPlan(auditResult)

    // Save audit results
    await this.saveSOXAuditResults(auditResult, remediationPlan)

    return auditResult
  }

  private async initializeSOXControls(): Promise<void> {
    this.controls = [
      // Entity Level Controls
      {
        controlId: 'ELC-001',
        controlName: 'Code of Ethics and Conduct',
        controlType: 'Preventive',
        riskLevel: 'High',
        frequency: 'Annual',
        owner: 'Chief Executive Officer',
        description: 'Establishment and communication of ethical standards',
        evidenceRequired: [
          'Written code of conduct',
          'Employee acknowledgments',
          'Training records',
        ],
        deficiencies: [
          'Code not updated for AI decision-making',
          'Insufficient AI ethics training',
        ],
      },
      {
        controlId: 'ELC-002',
        controlName: 'Management Override Prevention',
        controlType: 'Detective',
        riskLevel: 'High',
        frequency: 'Quarterly',
        owner: 'Chief Financial Officer',
        description: 'Controls to prevent management override of internal controls',
        evidenceRequired: [
          'Journal entry testing',
          'Segregation of duties matrix',
          'Approval hierarchies',
        ],
        deficiencies: ['AI systems can bypass traditional approval workflows'],
      },

      // Process Level Controls
      {
        controlId: 'PLC-001',
        controlName: 'Revenue Recognition Automation',
        controlType: 'Preventive',
        riskLevel: 'High',
        frequency: 'Daily',
        owner: 'Revenue Operations Manager',
        description: 'Automated controls for accurate revenue recognition',
        evidenceRequired: ['System configuration', 'Exception reports', 'Reconciliations'],
        deficiencies: [
          'AI subscription pricing models not fully tested',
          'Complex revenue sharing arrangements',
        ],
      },
      {
        controlId: 'PLC-002',
        controlName: 'Expense Authorization and Approval',
        controlType: 'Preventive',
        riskLevel: 'Medium',
        frequency: 'Daily',
        owner: 'Accounts Payable Manager',
        description: 'Authorization controls for expense recognition',
        evidenceRequired: ['Approval matrices', 'System reports', 'Budget comparisons'],
        deficiencies: ['AI can approve expenses automatically', 'Machine learning cost allocation'],
      },

      // IT General Controls
      {
        controlId: 'ITGC-001',
        controlName: 'Logical Access Security',
        controlType: 'Preventive',
        riskLevel: 'High',
        frequency: 'Quarterly',
        owner: 'Chief Information Security Officer',
        description: 'Controls over system access and user privileges',
        evidenceRequired: ['Access reviews', 'Privilege escalation logs', 'Authentication logs'],
        deficiencies: [
          'AI systems have elevated privileges',
          'Service accounts not properly managed',
        ],
      },
      {
        controlId: 'ITGC-002',
        controlName: 'Change Management Process',
        controlType: 'Preventive',
        riskLevel: 'High',
        frequency: 'Weekly',
        owner: 'Development Manager',
        description: 'Controls over system and application changes',
        evidenceRequired: ['Change tickets', 'Approval records', 'Testing documentation'],
        deficiencies: [
          'AI model updates bypass change control',
          'Automated deployments not documented',
        ],
      },

      // Application Controls
      {
        controlId: 'AC-001',
        controlName: 'Data Input Validation',
        controlType: 'Preventive',
        riskLevel: 'Medium',
        frequency: 'Daily',
        owner: 'Application Owner',
        description: 'Controls to ensure data accuracy and completeness',
        evidenceRequired: ['Validation rules', 'Error logs', 'Exception reports'],
        deficiencies: ['AI training data quality not validated', 'Automated data enrichment risks'],
      },
      {
        controlId: 'AC-002',
        controlName: 'Processing Controls and Calculations',
        controlType: 'Detective',
        riskLevel: 'High',
        frequency: 'Daily',
        owner: 'Financial Systems Manager',
        description: 'Controls over financial calculations and processing',
        evidenceRequired: ['Calculation verification', 'Reconciliation reports', 'Balance checks'],
        deficiencies: ['AI algorithms not auditable', 'Black-box ML financial calculations'],
      },

      // Disclosure Controls
      {
        controlId: 'DC-001',
        controlName: 'Financial Statement Preparation',
        controlType: 'Preventive',
        riskLevel: 'High',
        frequency: 'Monthly',
        owner: 'Controller',
        description: 'Controls over financial statement compilation',
        evidenceRequired: [
          'Account reconciliations',
          'Supporting schedules',
          'Review documentation',
        ],
        deficiencies: [
          'AI-generated financial insights not reviewed',
          'Automated report generation',
        ],
      },
      {
        controlId: 'DC-002',
        controlName: 'SEC Filing Review and Approval',
        controlType: 'Detective',
        riskLevel: 'High',
        frequency: 'Quarterly',
        owner: 'Chief Financial Officer',
        description: 'Review and approval of SEC filings and disclosures',
        evidenceRequired: ['Review checklists', 'Approval signatures', 'Supporting documentation'],
        deficiencies: [
          'AI risk disclosures insufficient',
          'Technology risk not properly disclosed',
        ],
      },
    ]
  }

  private async evaluateEntityLevelControls(): Promise<EntityLevelControl[]> {
    return [
      {
        area: 'Ethics',
        control: 'Code of Conduct includes AI ethics and autonomous decision-making standards',
        implementationStatus: 'In Progress',
        effectiveness: 'Needs Improvement',
      },
      {
        area: 'Management Override',
        control: 'AI systems cannot override established financial controls without human approval',
        implementationStatus: 'Not Implemented',
        effectiveness: 'Ineffective',
      },
      {
        area: 'Board Oversight',
        control: 'Board receives regular reports on AI financial decision-making',
        implementationStatus: 'Not Implemented',
        effectiveness: 'Ineffective',
      },
      {
        area: 'Risk Assessment',
        control: 'Annual risk assessment includes AI and technology risks',
        implementationStatus: 'In Progress',
        effectiveness: 'Needs Improvement',
      },
    ]
  }

  private async evaluateProcessLevelControls(): Promise<ProcessLevelControl[]> {
    return [
      {
        process: 'Revenue',
        control: 'Automated revenue recognition with AI subscription billing',
        automationLevel: 'Fully Automated',
        aiInvolvement: true,
        riskOfError: 'High',
      },
      {
        process: 'Expenses',
        control: 'AI-driven expense categorization and approval workflows',
        automationLevel: 'Semi-Automated',
        aiInvolvement: true,
        riskOfError: 'Medium',
      },
      {
        process: 'Financial Close',
        control: 'Automated journal entries and account reconciliations',
        automationLevel: 'Fully Automated',
        aiInvolvement: true,
        riskOfError: 'High',
      },
    ]
  }

  private async evaluateITGeneralControls(): Promise<ITGeneralControl[]> {
    return [
      {
        domain: 'Access Security',
        control: 'Role-based access controls for financial systems',
        systemsInScope: ['CoreFlow360', 'Stripe', 'PostgreSQL', 'AI Services'],
        cloudProviderControls: true,
        effectiveness: 'Effective',
      },
      {
        domain: 'Change Management',
        control: 'Controlled deployment process for AI model updates',
        systemsInScope: ['AI Models', 'Application Code', 'Database Schema'],
        cloudProviderControls: false,
        effectiveness: 'Needs Improvement',
      },
      {
        domain: 'Data Integrity',
        control: 'Backup and recovery procedures for financial data',
        systemsInScope: ['Financial Database', 'AI Training Data', 'Transaction Logs'],
        cloudProviderControls: true,
        effectiveness: 'Effective',
      },
    ]
  }

  private async evaluateApplicationControls(): Promise<ApplicationControl[]> {
    return [
      {
        application: 'CoreFlow360 Revenue Module',
        controlType: 'Processing',
        description: 'AI-driven subscription billing and revenue recognition',
        automatedControl: true,
        aiDecisionMaking: true,
        completenessAccuracy: 'Incomplete',
      },
      {
        application: 'Financial Reporting System',
        controlType: 'Output',
        description: 'Automated generation of financial reports',
        automatedControl: true,
        aiDecisionMaking: true,
        completenessAccuracy: 'Complete',
      },
      {
        application: 'Expense Management',
        controlType: 'Input',
        description: 'AI categorization and approval of expenses',
        automatedControl: true,
        aiDecisionMaking: true,
        completenessAccuracy: 'Incomplete',
      },
    ]
  }

  private async evaluateDisclosureControls(): Promise<DisclosureControl[]> {
    return [
      {
        category: 'Financial Statements',
        control: 'Review of AI-generated financial statement components',
        reviewLevel: 'Management',
        aiGeneratedContent: true,
        effectiveness: 'Needs Improvement',
      },
      {
        category: 'SEC Filings',
        control: 'Disclosure of AI risks and technology dependencies',
        reviewLevel: 'Board',
        aiGeneratedContent: false,
        effectiveness: 'Ineffective',
      },
      {
        category: 'MD&A',
        control: 'Management discussion of AI impact on business operations',
        reviewLevel: 'Management',
        aiGeneratedContent: true,
        effectiveness: 'Needs Improvement',
      },
    ]
  }

  private async assessAIFinancialRisks(): Promise<{
    revenueRecognitionRisk: 'High' | 'Medium' | 'Low'
    expenseClassificationRisk: 'High' | 'Medium' | 'Low'
    fraudDetectionRisk: 'High' | 'Medium' | 'Low'
    auditabilityRisk: 'High' | 'Medium' | 'Low'
    systemReliabilityRisk: 'High' | 'Medium' | 'Low'
  }> {
    return {
      revenueRecognitionRisk: 'High', // AI subscription models complex
      expenseClassificationRisk: 'Medium', // AI categorization needs oversight
      fraudDetectionRisk: 'High', // AI may miss sophisticated fraud
      auditabilityRisk: 'High', // Black-box AI not auditable
      systemReliabilityRisk: 'Medium', // Cloud infrastructure dependencies
    }
  }

  private calculateSOXRating(_evaluationResults: unknown): SOXAuditResult {
    const materialWeaknesses = [
      'AI systems can override financial controls without human approval',
      'AI algorithm decisions are not auditable or explainable',
      'Insufficient disclosure of AI risks in SEC filings',
      'AI training data quality not validated for financial accuracy',
      'Automated AI model updates bypass change control procedures',
    ]

    const significantDeficiencies = [
      'Code of conduct not updated for AI decision-making',
      'Board oversight of AI financial decisions insufficient',
      'AI-generated financial reports lack adequate review',
      'Complex AI subscription revenue models not fully tested',
      'AI expense categorization requires manual validation',
    ]

    const totalControls = this.controls.length
    const effectiveControls = this.controls.filter(
      (c) => c.testResult === 'Effective' || (c.deficiencies.length === 0 && !c.testResult)
    ).length

    const overallRating =
      materialWeaknesses.length > 0
        ? 'Material Weakness'
        : significantDeficiencies.length > 3
          ? 'Significant Deficiency'
          : 'Effective'

    return {
      overallRating,
      controlsEvaluated: totalControls,
      effectiveControls,
      deficientControls: totalControls - effectiveControls,
      materialWeaknesses,
      significantDeficiencies,
      managementRecommendations: this.generateManagementRecommendations(),
      certificationReadiness: materialWeaknesses.length === 0,
      estimatedRemediationTime:
        materialWeaknesses.length * 90 + significantDeficiencies.length * 30, // days
      complianceCosts: this.estimateComplianceCosts(materialWeaknesses, significantDeficiencies),
    }
  }

  private generateManagementRecommendations(): string[] {
    return [
      'IMMEDIATE: Implement human oversight controls for AI financial decisions',
      'IMMEDIATE: Develop AI algorithm auditability and explainability features',
      'IMMEDIATE: Update Code of Conduct to include AI ethics for financial reporting',
      'HIGH PRIORITY: Establish Board-level oversight of AI financial risks',
      'HIGH PRIORITY: Enhance disclosure controls for AI technology risks',
      'HIGH PRIORITY: Implement change control procedures for AI model updates',
      'MEDIUM PRIORITY: Develop AI training data validation procedures',
      'MEDIUM PRIORITY: Create specialized AI financial control testing procedures',
      'ONGOING: Regular SOX compliance training for AI-enabled processes',
      'ONGOING: Quarterly AI financial risk assessments',
    ]
  }

  private estimateComplianceCosts(
    materialWeaknesses: string[],
    significantDeficiencies: string[]
  ): number {
    // Base costs for SOX compliance
    const baseCosts = {
      externalAuditor: 150000, // Annual external audit fees
      internalControls: 100000, // Internal control documentation and testing
      systemImplementation: 200000, // IT systems and process improvements
      training: 25000, // Staff training and education
      ongoing: 75000, // Ongoing compliance monitoring
    }

    // Additional costs for AI-specific controls
    const aiSpecificCosts = {
      algorithmAuditability: 150000, // Implementing explainable AI
      humanOversight: 100000, // Additional oversight processes
      specializedTesting: 75000, // AI control testing procedures
      regulatoryConsulting: 50000, // AI compliance expertise
      systemEnhancements: 125000, // Enhanced monitoring and controls
    }

    const remediationCosts =
      materialWeaknesses.length * 50000 + // $50k per material weakness
      significantDeficiencies.length * 25000 // $25k per significant deficiency

    return (
      Object.values(baseCosts).reduce((a, b) => a + b, 0) +
      Object.values(aiSpecificCosts).reduce((a, b) => a + b, 0) +
      remediationCosts
    )
  }

  private generateRemediationPlan(_auditResult: SOXAuditResult): unknown {
    return {
      phase1: {
        timeline: '0-90 days',
        priority: 'Critical',
        actions: [
          'Implement human approval gates for AI financial decisions over $10,000',
          'Develop AI decision audit log with explanations',
          'Update Code of Conduct and employee training materials',
          'Establish AI Financial Control Committee',
        ],
      },
      phase2: {
        timeline: '90-180 days',
        priority: 'High',
        actions: [
          'Implement explainable AI features for financial calculations',
          'Develop AI model change control procedures',
          'Create Board reporting on AI financial risks',
          'Enhance disclosure controls for AI technology',
        ],
      },
      phase3: {
        timeline: '180-365 days',
        priority: 'Medium',
        actions: [
          'Complete external SOX readiness assessment',
          'Implement continuous AI control monitoring',
          'Develop AI-specific internal audit procedures',
          'Obtain SOX compliance certification',
        ],
      },
    }
  }

  private async saveSOXAuditResults(
    auditResult: SOXAuditResult,
    remediationPlan: unknown
  ): Promise<void> {
    try {
      await AuditLogger.log({
        action: 'CREATE',
        entityType: 'sox_compliance_audit',
        entityId: `sox_audit_${Date.now()}`,
        tenantId: this.tenantId,
        userId: 'system',
        newValues: {
          overallRating: auditResult.overallRating,
          controlsEvaluated: auditResult.controlsEvaluated,
          effectiveControls: auditResult.effectiveControls,
          materialWeaknesses: auditResult.materialWeaknesses.length,
          significantDeficiencies: auditResult.significantDeficiencies.length,
          certificationReadiness: auditResult.certificationReadiness,
          estimatedCosts: auditResult.complianceCosts,
        },
        metadata: {
          auditDate: new Date().toISOString(),
          remediationPlan,
          controlDetails: this.controls,
        },
      })

      logger.info('SOX compliance audit results saved', {
        tenantId: this.tenantId,
        rating: auditResult.overallRating,
        materialWeaknesses: auditResult.materialWeaknesses.length,
      })
    } catch (error) {
      logger.error('Failed to save SOX audit results', {
        tenantId: this.tenantId,
        error,
      })
    }
  }

  // Public methods for ongoing compliance monitoring
  async testControl(controlId: string): Promise<{
    result: 'Effective' | 'Ineffective'
    evidence: string[]
    deficiencies: string[]
  }> {
    const control = this.controls.find((c) => c.controlId === controlId)
    if (!control) {
      throw new Error(`Control ${controlId} not found`)
    }

    // Simulate control testing
    return {
      result: control.deficiencies.length === 0 ? 'Effective' : 'Ineffective',
      evidence: control.evidenceRequired,
      deficiencies: control.deficiencies,
    }
  }

  async generateCertificationReport(): Promise<string> {
    const assessment = await this.performSOXReadinessAssessment()

    return `
# SOX Compliance Certification Report

## Management Assessment
Overall Rating: ${assessment.overallRating}
Certification Ready: ${assessment.certificationReadiness ? 'Yes' : 'No'}

## Control Effectiveness
- Total Controls Evaluated: ${assessment.controlsEvaluated}
- Effective Controls: ${assessment.effectiveControls}
- Deficient Controls: ${assessment.deficientControls}

## Material Weaknesses
${assessment.materialWeaknesses.map((w) => `- ${w}`).join('\n')}

## Significant Deficiencies  
${assessment.significantDeficiencies.map((d) => `- ${d}`).join('\n')}

## Management Recommendations
${assessment.managementRecommendations.map((r) => `- ${r}`).join('\n')}

## Estimated Compliance Investment
Total Cost: $${assessment.complianceCosts.toLocaleString()}
Remediation Timeline: ${assessment.estimatedRemediationTime} days

Generated: ${new Date().toISOString()}
    `
  }
}

export { SOXComplianceFramework }
export type { SOXControl, SOXAuditResult, FinancialReportingControl }
