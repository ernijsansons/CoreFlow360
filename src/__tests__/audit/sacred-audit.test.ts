/**
 * CoreFlow360 - SACRED Audit Framework Tests
 * Comprehensive test suite for the AI-powered audit system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  SACREDAuditEngine,
  SACREDAuditRequest,
  SACREDAuditResponse,
  EnhancedAuditFinding
} from '@/lib/audit/sacred-audit-engine'
import {
  SACREDPromptTemplates,
  TripleLayerPromptBuilder,
  PromptValidator
} from '@/lib/audit/prompt-engineering'
import { AuditOrchestrationSystem } from '@/lib/audit/audit-orchestration'
import { logger } from '@/lib/logging/logger'

// Mock logger to prevent console output during tests
vi.mock('@/lib/logging/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

describe('SACRED Audit Framework', () => {
  let sacredEngine: SACREDAuditEngine
  let orchestrator: AuditOrchestrationSystem

  beforeEach(() => {
    sacredEngine = new SACREDAuditEngine()
    orchestrator = new AuditOrchestrationSystem()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('SACRED Prompt Templates', () => {
    it('should generate valid security audit prompt', () => {
      const prompt = SACREDPromptTemplates.securityAudit()

      expect(prompt.specific.outcomes).toHaveLength(3)
      expect(prompt.specific.measurableCriteria).toContainEqual(
        expect.objectContaining({
          metric: 'Critical vulnerabilities',
          target: 0,
          priority: 'critical'
        })
      )
      expect(prompt.contextual.environment.compliance).toContain('SOC2')
      expect(prompt.reasoned.steps).toHaveLength(3)
      expect(prompt.evidenceBased.codeReferences).toBe(true)
    })

    it('should generate valid performance optimization prompt', () => {
      const prompt = SACREDPromptTemplates.performanceOptimization()

      expect(prompt.specific.measurableCriteria).toContainEqual(
        expect.objectContaining({
          metric: 'P95 response time',
          target: 200,
          unit: 'milliseconds'
        })
      )
      expect(prompt.specific.scope).toContain('database_queries')
      expect(prompt.actionable.includeCodeExamples).toBe(true)
    })

    it('should generate valid architecture review prompt', () => {
      const prompt = SACREDPromptTemplates.architectureReview()

      expect(prompt.specific.outcomes).toContain('Identify architectural anti-patterns')
      expect(prompt.contextual.businessRequirements[0].priority).toBe('should_have')
      expect(prompt.reasoned.includeAlternatives).toBe(true)
    })
  })

  describe('Prompt Validation', () => {
    it('should validate complete SACRED prompts', () => {
      const prompt = SACREDPromptTemplates.securityAudit()
      const validation = PromptValidator.validateSACREDPrompt(prompt)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
      expect(validation.completenessScore).toBeGreaterThan(90)
    })

    it('should detect incomplete prompts', () => {
      const incompletePrompt = {
        specific: {
          outcomes: [],
          measurableCriteria: [],
          successThreshold: '',
          scope: []
        },
        actionable: {
          requireImplementationSteps: false,
          stepDetailLevel: 'low',
          includeCodeExamples: false,
          timeEstimates: false,
          dependencyMapping: false
        },
        contextual: {} as any,
        reasoned: {
          steps: [],
          reasoningDepth: 'shallow',
          includeAlternatives: false,
          explainTradeoffs: false
        },
        evidenceBased: {
          codeReferences: false,
          lineNumbers: false,
          contextLines: 0,
          includeTests: false,
          performanceMetrics: false,
          securityScans: false
        },
        deliverable: {
          format: 'json',
          includeExecutiveSummary: false,
          includeTechnicalDetails: false,
          includeImplementationPlan: false,
          includeROIAnalysis: false
        }
      }

      const validation = PromptValidator.validateSACREDPrompt(incompletePrompt as any)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Missing specific outcomes')
      expect(validation.errors).toContain('Missing measurable criteria')
      expect(validation.completenessScore).toBeLessThan(50)
    })
  })

  describe('Triple-Layer Prompt Builder', () => {
    it('should build complete triple-layer prompts', () => {
      const builder = new TripleLayerPromptBuilder()
      const context = {
        codebaseContext: {
          languages: ['TypeScript'],
          frameworks: ['Next.js'],
          architecture: 'Microservices',
          dependencies: ['prisma', 'next-auth'],
          codeMetrics: {
            totalFiles: 100,
            totalLines: 10000,
            complexity: 'medium'
          }
        },
        businessRequirements: [{
          id: 'REQ-001',
          description: 'Security compliance',
          priority: 'must_have' as const,
          successCriteria: ['SOC2 compliance'],
          constraints: ['6 month timeline']
        }],
        constraints: [],
        stakeholders: [],
        environment: {
          deployment: 'cloud' as const,
          scale: 'enterprise' as const,
          industry: 'SaaS',
          compliance: ['SOC2']
        }
      }

      const task = {
        objective: 'Security audit',
        methodology: {
          approach: 'Systematic analysis',
          steps: [{
            action: 'Analyze auth',
            reasoning: 'Security first',
            expectedOutput: 'Vulnerabilities'
          }]
        },
        outputFormat: {
          structure: 'xml' as const,
          includeMetrics: true,
          includeRecommendations: true
        },
        analysisDepth: 'deep' as const,
        focusAreas: ['authentication'],
        timeBudget: '2 hours'
      }

      const prompt = builder
        .setSystemRole('Security Auditor', '10+', ['Security'])
        .setContext(context)
        .setTask(task)
        .build()

      expect(prompt).toContain('<system_role>')
      expect(prompt).toContain('Security Auditor')
      expect(prompt).toContain('<context>')
      expect(prompt).toContain('TypeScript')
      expect(prompt).toContain('<task>')
      expect(prompt).toContain('Security audit')
    })
  })

  describe('SACRED Audit Engine', () => {
    it('should execute security audits successfully', async () => {
      const request: SACREDAuditRequest = {
        auditType: 'security',
        scope: ['authentication', 'authorization'],
        context: {
          codebaseContext: {
            languages: ['TypeScript'],
            frameworks: ['Next.js'],
            architecture: 'Monolith',
            dependencies: ['next-auth'],
            codeMetrics: {
              totalFiles: 200,
              totalLines: 20000,
              complexity: 'high'
            }
          }
        },
        options: {
          includeRecommendations: true,
          generateReport: false,
          outputFormat: 'json'
        }
      }

      const response = await sacredEngine.executeAudit(request)

      expect(response.auditType).toBe('security')
      expect(response.promptValidation.isValid).toBe(true)
      expect(response.findings).toBeDefined()
      expect(response.synthesis).toBeDefined()
      expect(response.synthesis.executiveSummary).toContain('SECURITY AUDIT')
      expect(response.metadata.confidenceScore).toBeGreaterThan(0)
    })

    it('should calculate ROI analysis correctly', async () => {
      const request: SACREDAuditRequest = {
        auditType: 'performance',
        scope: ['database_queries', 'api_optimization'],
        context: {},
        options: {
          includeRecommendations: true,
          generateReport: false,
          outputFormat: 'json'
        }
      }

      const response = await sacredEngine.executeAudit(request)
      const roi = response.synthesis.roiAnalysis

      expect(roi.investmentRequired.total).toBeGreaterThan(0)
      expect(roi.expectedReturns.total).toBeGreaterThan(0)
      expect(roi.paybackPeriod).toBeGreaterThan(0)
      expect(roi.netPresentValue).toBeDefined()
    })

    it('should enhance findings with evidence chains', async () => {
      const request: SACREDAuditRequest = {
        auditType: 'security',
        scope: ['all'],
        context: {},
        options: {
          includeRecommendations: true,
          generateReport: false,
          outputFormat: 'json'
        }
      }

      const response = await sacredEngine.executeAudit(request)
      const finding = response.findings[0] as EnhancedAuditFinding

      expect(finding.evidenceChain).toBeDefined()
      expect(finding.evidenceChain.length).toBeGreaterThan(0)
      expect(finding.evidenceChain[0]).toHaveProperty('type')
      expect(finding.evidenceChain[0]).toHaveProperty('relevance')
      expect(finding.remediationSteps).toBeDefined()
      expect(finding.verificationCriteria).toBeDefined()
      expect(finding.confidenceScore).toBeGreaterThan(0)
      expect(finding.falsePositiveProbability).toBeLessThan(0.5)
    })

    it('should build implementation roadmap with phases', async () => {
      const request: SACREDAuditRequest = {
        auditType: 'architecture',
        scope: ['all'],
        context: {},
        options: {
          includeRecommendations: true,
          generateReport: false,
          outputFormat: 'json'
        }
      }

      const response = await sacredEngine.executeAudit(request)
      const roadmap = response.synthesis.implementationRoadmap

      expect(roadmap.phases).toHaveLength(3)
      expect(roadmap.phases[0].name).toBe('Critical Remediation')
      expect(roadmap.phases[0].duration).toBe('1-2 weeks')
      expect(roadmap.criticalPath).toBeDefined()
      expect(roadmap.quickWins).toBeDefined()
    })
  })

  describe('Audit Orchestration Integration', () => {
    it('should orchestrate multi-domain audits', async () => {
      const scope = {
        security: ['authentication', 'authorization'],
        performance: ['database', 'api'],
        architecture: ['patterns', 'dependencies']
      }

      const criteria = {
        priority: 'critical' as const,
        maxFindings: 100,
        includeRecommendations: true
      }

      const contextId = await orchestrator.loadContext(scope, criteria)
      expect(contextId).toBeDefined()

      const batches = orchestrator.createAuditBatches(contextId)
      expect(batches.length).toBeGreaterThan(0)
      expect(batches[0].audits.length).toBeLessThanOrEqual(20)

      const results = await orchestrator.executeAuditPipeline(contextId)
      expect(results.size).toBeGreaterThan(0)

      const synthesis = await orchestrator.synthesizeResults(contextId)
      expect(synthesis.total_findings).toBeGreaterThan(0)
      expect(synthesis.executive_summary).toBeDefined()
      expect(synthesis.roi_analysis).toBeDefined()
    })

    it('should prioritize findings by business impact', async () => {
      const scope = {
        security: ['all'],
        performance: ['all']
      }

      const criteria = {
        priority: 'all' as const,
        maxFindings: 50,
        includeRecommendations: true
      }

      const contextId = await orchestrator.loadContext(scope, criteria)
      const synthesis = await orchestrator.synthesizeResults(contextId)

      // Verify findings are sorted by priority score
      let previousScore = Infinity
      synthesis.prioritized_findings.forEach(finding => {
        const currentScore = finding.severity === 'critical' ? 100 :
                           finding.severity === 'high' ? 75 :
                           finding.severity === 'medium' ? 50 : 25
        expect(currentScore).toBeLessThanOrEqual(previousScore)
        previousScore = currentScore
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid audit requests gracefully', async () => {
      const invalidRequest: SACREDAuditRequest = {
        auditType: 'invalid' as any,
        scope: [],
        context: {},
        options: {
          includeRecommendations: false,
          generateReport: false,
          outputFormat: 'json'
        }
      }

      const response = await sacredEngine.executeAudit(invalidRequest)
      expect(response.findings).toBeDefined()
      expect(response.promptValidation.isValid).toBe(true) // Should fallback to valid template
    })

    it('should handle context loading failures', async () => {
      const scope = {
        security: ['authentication']
      }

      const criteria = {
        priority: 'critical' as const,
        maxFindings: 10,
        includeRecommendations: true
      }

      // Force an error by mocking file system access
      vi.spyOn(orchestrator as any, 'analyzeCodebase').mockRejectedValue(
        new Error('File system error')
      )

      await expect(orchestrator.loadContext(scope, criteria)).rejects.toThrow()
    })
  })

  describe('Performance', () => {
    it('should complete audits within reasonable time', async () => {
      const request: SACREDAuditRequest = {
        auditType: 'security',
        scope: ['authentication'],
        context: {},
        options: {
          includeRecommendations: true,
          generateReport: false,
          outputFormat: 'json'
        }
      }

      const startTime = Date.now()
      const response = await sacredEngine.executeAudit(request)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
      expect(response.executionTime).toBeLessThan(5000)
    })

    it('should handle large-scale audits efficiently', async () => {
      const scope = {
        security: ['all'],
        performance: ['all'],
        architecture: ['all'],
        business_logic: ['all']
      }

      const criteria = {
        priority: 'all' as const,
        maxFindings: 1000,
        includeRecommendations: true
      }

      const contextId = await orchestrator.loadContext(scope, criteria)
      const batches = orchestrator.createAuditBatches(contextId)

      // Should batch efficiently
      expect(batches.length).toBeGreaterThan(1)
      expect(batches.every(batch => batch.audits.length <= 20)).toBe(true)
    })
  })
})