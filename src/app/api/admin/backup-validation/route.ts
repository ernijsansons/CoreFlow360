/**
 * CoreFlow360 - Backup Validation and Disaster Recovery API
 * Administrative endpoint for backup testing and DR scenarios
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { BackupValidator, DisasterRecoveryTester, BackupMonitor } from '@/lib/monitoring/backup-validation'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { handleError, handleAuthError, handleValidationError, ErrorContext } from '@/lib/error-handler'
import { z } from 'zod'

const backupValidationSchema = z.object({
  backupId: z.string(),
  validationType: z.enum(['integrity', 'consistency', 'schema', 'referential', 'performance', 'comprehensive']).default('comprehensive'),
  timeoutMs: z.number().min(1000).max(600000).default(300000)
})

const drTestSchema = z.object({
  scenario: z.string(),
  rto: z.number().min(1000), // milliseconds
  rpo: z.number().min(1000), // milliseconds
  customSteps: z.array(z.object({
    name: z.string(),
    description: z.string(),
    dependencies: z.array(z.string()).default([]),
    validationChecks: z.array(z.string()).default([])
  })).optional()
})

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: '/api/admin/backup-validation',
      method: 'GET',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
        return handleAuthError('Super admin access required', context)
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      const url = new URL(request.url)
      const action = url.searchParams.get('action')
      const testId = url.searchParams.get('testId')
      const backupId = url.searchParams.get('backupId')

      switch (action) {
        case 'backup_validation_history':
          if (!backupId) {
            return NextResponse.json({
              success: false,
              error: 'Backup ID required for validation history'
            }, { status: 400 })
          }

          const validationHistory = BackupValidator.getValidationHistory(backupId)
          return NextResponse.json({
            success: true,
            data: {
              backupId,
              history: validationHistory,
              totalValidations: validationHistory.length,
              lastValidation: validationHistory[validationHistory.length - 1] || null
            }
          })

        case 'dr_test_status':
          if (testId) {
            const test = DisasterRecoveryTester.getTest(testId)
            if (!test) {
              return NextResponse.json({
                success: false,
                error: 'Test not found'
              }, { status: 404 })
            }

            return NextResponse.json({
              success: true,
              data: test
            })
          } else {
            return NextResponse.json({
              success: true,
              data: {
                activeTests: DisasterRecoveryTester.getActiveTests(),
                testHistory: DisasterRecoveryTester.getTestHistory().slice(-10) // Last 10 tests
              }
            })
          }

        case 'dr_scenarios':
          return NextResponse.json({
            success: true,
            data: {
              standardScenarios: DisasterRecoveryTester.getStandardScenarios(),
              customScenarios: [] // Would come from database
            }
          })

        case 'backup_monitoring_status':
          return NextResponse.json({
            success: true,
            data: BackupMonitor.getMonitoringStatus()
          })

        default:
          return NextResponse.json({
            success: true,
            data: {
              backupValidation: {
                endpoint: '/api/admin/backup-validation',
                methods: ['POST'],
                actions: ['validate_backup', 'run_dr_test', 'monitoring_control']
              },
              availableActions: [
                'backup_validation_history',
                'dr_test_status',
                'dr_scenarios',
                'backup_monitoring_status'
              ]
            }
          })
      }
    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.admin)
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: '/api/admin/backup-validation',
      method: 'POST',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
        return handleAuthError('Super admin access required', context)
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      const body = await request.json()
      const { action } = body

      switch (action) {
        case 'validate_backup':
          const validationData = backupValidationSchema.parse(body)
          
          // Mock backup metadata (would come from backup system)
          const mockBackup = {
            id: validationData.backupId,
            type: 'full' as const,
            timestamp: Date.now() - (24 * 60 * 60 * 1000), // 24 hours ago
            size: 1024 * 1024 * 500, // 500MB
            checksum: 'mock_checksum_' + validationData.backupId,
            location: `/backups/${validationData.backupId}.sql`,
            retention: 30,
            encrypted: true,
            compression: 'gzip',
            version: '2.0.0'
          }

          const validationOptions = {
            performIntegrityCheck: ['integrity', 'comprehensive'].includes(validationData.validationType),
            performDataConsistency: ['consistency', 'comprehensive'].includes(validationData.validationType),
            performSchemaValidation: ['schema', 'comprehensive'].includes(validationData.validationType),
            performReferentialIntegrity: ['referential', 'comprehensive'].includes(validationData.validationType),
            performPerformanceTest: ['performance', 'comprehensive'].includes(validationData.validationType),
            timeoutMs: validationData.timeoutMs
          }

          const validationResult = await BackupValidator.validateBackup(mockBackup, validationOptions)

          return NextResponse.json({
            success: true,
            data: {
              backup: mockBackup,
              validation: validationResult,
              message: `Backup validation ${validationResult.result}`
            }
          })

        case 'run_dr_test':
          const drData = drTestSchema.parse(body)
          
          let steps
          if (drData.customSteps) {
            steps = drData.customSteps
          } else {
            const standardScenarios = DisasterRecoveryTester.getStandardScenarios()
            steps = standardScenarios[drData.scenario]
            
            if (!steps) {
              return NextResponse.json({
                success: false,
                error: `Unknown scenario: ${drData.scenario}. Available scenarios: ${Object.keys(standardScenarios).join(', ')}`
              }, { status: 400 })
            }
          }

          const drTest = await DisasterRecoveryTester.executeRecoveryTest(
            drData.scenario,
            drData.rto,
            drData.rpo,
            steps
          )

          return NextResponse.json({
            success: true,
            data: {
              test: drTest,
              message: `Disaster recovery test ${drTest.status}`,
              rtoMet: drTest.metrics.actualRTO <= drData.rto,
              rpoMet: drTest.metrics.actualRPO <= drData.rpo
            }
          })

        case 'monitoring_control':
          const { operation, intervalMs } = body
          
          switch (operation) {
            case 'start':
              BackupMonitor.startMonitoring(intervalMs || 3600000) // Default 1 hour
              return NextResponse.json({
                success: true,
                message: 'Backup monitoring started',
                data: BackupMonitor.getMonitoringStatus()
              })

            case 'stop':
              BackupMonitor.stopMonitoring()
              return NextResponse.json({
                success: true,
                message: 'Backup monitoring stopped',
                data: BackupMonitor.getMonitoringStatus()
              })

            case 'status':
              return NextResponse.json({
                success: true,
                data: BackupMonitor.getMonitoringStatus()
              })

            default:
              return NextResponse.json({
                success: false,
                error: 'Invalid monitoring operation. Use: start, stop, status'
              }, { status: 400 })
          }

        case 'clear_history':
          const { type, targetId } = body
          
          switch (type) {
            case 'validation':
              BackupValidator.clearValidationHistory(targetId)
              return NextResponse.json({
                success: true,
                message: 'Validation history cleared'
              })

            case 'dr_tests':
              DisasterRecoveryTester.clearTestHistory()
              return NextResponse.json({
                success: true,
                message: 'DR test history cleared'
              })

            default:
              return NextResponse.json({
                success: false,
                error: 'Invalid clear type. Use: validation, dr_tests'
              }, { status: 400 })
          }

        default:
          return NextResponse.json({
            success: false,
            error: 'Invalid action'
          }, { status: 400 })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return handleValidationError(error, context)
      }
      return handleError(error, context)
    }
  }, RATE_LIMITS.admin)
}