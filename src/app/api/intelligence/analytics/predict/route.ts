import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import PredictiveProblemAnalytics from '@/lib/analytics/PredictiveProblemAnalytics'
import { z } from 'zod'

const predictProblemSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  includeRecommendations: z.boolean().default(true),
  predictionTypes: z
    .array(z.enum(['ESCALATION', 'BUSINESS_IMPACT', 'SOLUTION_OUTCOME', 'TIMELINE']))
    .optional(),
})

const trendAnalysisSchema = z.object({
  category: z.string().optional(),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).default('MONTHLY'),
  industryType: z.string().optional(),
})

// Global analytics instance
let analytics: PredictiveProblemAnalytics | null = null

function getAnalytics(): PredictiveProblemAnalytics {
  if (!analytics) {
    analytics = new PredictiveProblemAnalytics()
  }
  return analytics
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = predictProblemSchema.parse(body)

    const analytics = getAnalytics()

    // Generate comprehensive predictions
    const predictions = await analytics.generateProblemPredictions({
      tenantId: session.user.tenantId,
      problemId: validatedData.problemId,
    })

    const response = {
      success: true,
      problemId: validatedData.problemId,
      predictions: {
        escalationRisk: {
          probability: predictions.predictions.escalationRisk.probability,
          riskLevel:
            predictions.predictions.escalationRisk.probability > 70
              ? 'HIGH'
              : predictions.predictions.escalationRisk.probability > 40
                ? 'MEDIUM'
                : 'LOW',
          expectedTimeframe: predictions.predictions.escalationRisk.timeframe,
          confidence: predictions.predictions.escalationRisk.confidence,
          riskFactors: predictions.predictions.escalationRisk.factors,

          // Risk mitigation suggestions
          mitigationActions:
            predictions.predictions.escalationRisk.probability > 70
              ? [
                  'Immediate stakeholder engagement',
                  'Expedited solution demonstration',
                  'Executive escalation if necessary',
                ]
              : predictions.predictions.escalationRisk.probability > 40
                ? [
                    'Proactive communication plan',
                    'Regular status updates',
                    'Prepare contingency solutions',
                  ]
                : ['Standard monitoring', 'Scheduled check-ins'],
        },

        businessImpact: {
          financial: {
            revenueAtRisk: predictions.predictions.businessImpact.revenueAtRisk,
            estimatedLoss: Math.round(predictions.predictions.businessImpact.revenueAtRisk * 0.3),
            opportunityCost: Math.round(
              predictions.predictions.businessImpact.revenueAtRisk * 0.15
            ),
            impactTimeframe: '3-6 months',
          },
          operational: {
            customerChurnRisk: predictions.predictions.businessImpact.customerChurnRisk,
            complianceRisk: predictions.predictions.businessImpact.complianceRisk,
            operationalImpact: predictions.predictions.businessImpact.operationalImpact,
            productivityLoss: Math.round(
              predictions.predictions.businessImpact.operationalImpact * 1000
            ), // hours
          },
          strategic: {
            reputationRisk:
              predictions.predictions.businessImpact.customerChurnRisk > 60 ? 'HIGH' : 'MEDIUM',
            competitiveDisadvantage: predictions.predictions.businessImpact.complianceRisk > 50,
            marketPositionImpact:
              predictions.predictions.businessImpact.revenueAtRisk > 100000
                ? 'SIGNIFICANT'
                : 'MODERATE',
          },
        },

        solutionOutcome: {
          successMetrics: {
            successProbability: predictions.predictions.solutionOutcome.successProbability,
            confidenceLevel:
              predictions.predictions.solutionOutcome.successProbability > 80
                ? 'HIGH'
                : predictions.predictions.solutionOutcome.successProbability > 60
                  ? 'MEDIUM'
                  : 'LOW',
            expectedROI: predictions.predictions.solutionOutcome.expectedROI,
            implementationTime: predictions.predictions.solutionOutcome.implementationTime,
          },
          risks: {
            implementationRisks: predictions.predictions.solutionOutcome.riskFactors,
            technicalRisks: predictions.predictions.solutionOutcome.riskFactors.filter(
              (r) => r.toLowerCase().includes('technical') || r.toLowerCase().includes('complexity')
            ),
            businessRisks: predictions.predictions.solutionOutcome.riskFactors.filter(
              (r) => r.toLowerCase().includes('business') || r.toLowerCase().includes('competitor')
            ),
          },
          alternatives: {
            hasAlternatives: predictions.predictions.solutionOutcome.riskFactors.some((r) =>
              r.toLowerCase().includes('competitor')
            ),
            competitorThreat: predictions.predictions.solutionOutcome.successProbability < 70,
            recommendedApproach:
              predictions.predictions.solutionOutcome.successProbability > 80
                ? 'AGGRESSIVE'
                : predictions.predictions.solutionOutcome.successProbability > 60
                  ? 'BALANCED'
                  : 'CONSERVATIVE',
          },
        },

        timelineForecasting: {
          decisionPhase: {
            expectedDays: predictions.predictions.timelineForecasting.daysToDecision,
            urgencyLevel:
              predictions.predictions.timelineForecasting.daysToDecision < 7
                ? 'CRITICAL'
                : predictions.predictions.timelineForecasting.daysToDecision < 21
                  ? 'HIGH'
                  : 'MEDIUM',
            keyMilestones: [
              'Stakeholder alignment',
              'Budget approval',
              'Technical evaluation',
              'Contract negotiation',
            ],
          },
          implementationPhase: {
            duration: predictions.predictions.timelineForecasting.implementationDuration,
            complexity:
              predictions.predictions.timelineForecasting.implementationDuration > 180
                ? 'HIGH'
                : predictions.predictions.timelineForecasting.implementationDuration > 60
                  ? 'MEDIUM'
                  : 'LOW',
            resourceRequirements:
              predictions.predictions.timelineForecasting.implementationDuration > 120
                ? [
                    'Dedicated project manager',
                    'Technical specialists',
                    'Change management support',
                  ]
                : ['Implementation team', 'Customer success manager'],
          },
          returnOnInvestment: {
            paybackPeriod: `${predictions.predictions.timelineForecasting.paybackPeriod} months`,
            breakEvenPoint: new Date(
              Date.now() +
                predictions.predictions.timelineForecasting.paybackPeriod * 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0],
            longTermValue:
              predictions.predictions.solutionOutcome.expectedROI > 200 ? 'HIGH' : 'MEDIUM',
          },
        },
      },

      // Intelligence summary
      intelligence: {
        overallRisk: Math.max(
          predictions.predictions.escalationRisk.probability,
          predictions.predictions.businessImpact.customerChurnRisk,
          100 - predictions.predictions.solutionOutcome.successProbability
        ),
        actionUrgency:
          predictions.predictions.timelineForecasting.daysToDecision < 14 ? 'IMMEDIATE' : 'PLANNED',
        strategicValue:
          predictions.predictions.businessImpact.revenueAtRisk > 100000 ? 'HIGH' : 'MEDIUM',
        competitiveThreat: predictions.predictions.solutionOutcome.riskFactors.length > 2,
      },

      // Actionable recommendations
      recommendations: validatedData.includeRecommendations
        ? {
            immediate: predictions.recommendations
              .filter((r) => r.type === 'IMMEDIATE')
              .map((r) => ({
                action: r.action,
                priority: r.priority,
                reasoning: r.reasoning,
                expectedOutcome: r.expectedOutcome,
                confidence: r.confidence,
                timeline: '1-3 days',
                owner: r.resources[0] || 'Sales team',
              })),
            shortTerm: predictions.recommendations
              .filter((r) => r.type === 'SHORT_TERM')
              .map((r) => ({
                action: r.action,
                priority: r.priority,
                reasoning: r.reasoning,
                expectedOutcome: r.expectedOutcome,
                confidence: r.confidence,
                timeline: '1-4 weeks',
                owner: r.resources[0] || 'Account team',
              })),
            longTerm: predictions.recommendations
              .filter((r) => r.type === 'LONG_TERM')
              .map((r) => ({
                action: r.action,
                priority: r.priority,
                reasoning: r.reasoning,
                expectedOutcome: r.expectedOutcome,
                confidence: r.confidence,
                timeline: '1-6 months',
                owner: r.resources[0] || 'Strategic team',
              })),
          }
        : undefined,

      // Metadata
      metadata: {
        analyzedAt: predictions.analyzedAt,
        validUntil: predictions.validUntil,
        modelsUsed: predictions.modelUsed,
        dataQuality: 'HIGH',
        analysisVersion: '1.0',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate problem predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const analysisType = searchParams.get('type')

    const analytics = getAnalytics()

    if (analysisType === 'trends') {
      // Generate trend analysis
      const category = searchParams.get('category')
      const period = (searchParams.get('period') as unknown) || 'MONTHLY'
      const industryType = searchParams.get('industry') as unknown

      const trendAnalysis = await analytics.generateTrendAnalysis({
        tenantId: session.user.tenantId,
        category: category || undefined,
        period,
        industryType: industryType || undefined,
      })

      return NextResponse.json({
        success: true,
        analysisType: 'trends',
        data: {
          category: trendAnalysis.category,
          period: trendAnalysis.period,

          // Current patterns
          currentPatterns: {
            volumeTrend: trendAnalysis.patterns.volume.trend,
            volumeChange: `${trendAnalysis.patterns.volume.changeRate}%`,
            severityTrend: trendAnalysis.patterns.severity.severityTrend,
            averageSeverity: trendAnalysis.patterns.severity.averageSeverity,
            resolutionRate: `${trendAnalysis.patterns.resolution.resolutionRate}%`,
            avgResolutionTime: `${trendAnalysis.patterns.resolution.averageResolutionTime} hours`,
          },

          // Forecasts
          forecasts: {
            next30Days: {
              expectedVolume: trendAnalysis.forecast.next30Days.expectedProblems,
              severityBreakdown: trendAnalysis.forecast.next30Days.severityDistribution,
              resourceNeeds: trendAnalysis.forecast.next30Days.resourceNeeds,
              riskLevel:
                trendAnalysis.forecast.next30Days.expectedProblems > 30 ? 'HIGH' : 'MEDIUM',
            },
            next90Days: {
              trendInsights: trendAnalysis.forecast.next90Days.majorTrends,
              riskFactors: trendAnalysis.forecast.next90Days.riskFactors,
              strategicConsiderations: trendAnalysis.forecast.next90Days.majorTrends.length > 2,
            },
            longTerm: {
              strategicInsights: trendAnalysis.forecast.next365Days.strategicInsights,
              investmentRecommendations:
                trendAnalysis.forecast.next365Days.investmentRecommendations,
            },
          },
        },
      })
    } else if (analysisType === 'insights') {
      // Generate predictive insights
      const companyId = searchParams.get('companyId')
      const industryType = searchParams.get('industry') as unknown

      const insights = await analytics.generatePredictiveInsights({
        tenantId: session.user.tenantId,
        companyId: companyId || undefined,
        industryType: industryType || undefined,
      })

      return NextResponse.json({
        success: true,
        analysisType: 'insights',
        data: {
          totalInsights: insights.length,
          insights: insights.map((insight) => ({
            id: insight.id,
            type: insight.type,
            category: insight.category,
            severity: insight.severity,
            insight: insight.insight,
            description: insight.description,

            // Predictions
            shortTermPrediction: insight.predictions.shortTerm,
            mediumTermPrediction: insight.predictions.mediumTerm,
            longTermPrediction: insight.predictions.longTerm,

            // Actionability
            canInfluence: insight.actionability.canInfluence,
            timeWindow: insight.actionability.timeWindow,
            requiredActions: insight.actionability.requiredActions,
            stakeholders: insight.actionability.stakeholders,

            // Business impact
            revenueImpact: insight.businessImpact.revenue,
            costImpact: insight.businessImpact.costs,
            efficiencyImpact: insight.businessImpact.efficiency,
            riskImpact: insight.businessImpact.risk,

            confidence: insight.confidence,
            generatedAt: insight.generatedAt,
          })),

          // Summary statistics
          summary: {
            highSeverityInsights: insights.filter(
              (i) => i.severity === 'HIGH' || i.severity === 'CRITICAL'
            ).length,
            actionableInsights: insights.filter((i) => i.actionability.canInfluence).length,
            averageConfidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length,
            totalBusinessImpact: insights.reduce((sum, i) => sum + i.businessImpact.revenue, 0),
          },
        },
      })
    } else {
      // Return overview of available analytics
      return NextResponse.json({
        success: true,
        availableAnalytics: {
          problemPredictions: {
            endpoint: 'POST /api/intelligence/analytics/predict',
            description: 'Generate comprehensive predictions for specific problems',
            capabilities: [
              'Escalation risk',
              'Business impact',
              'Solution outcome',
              'Timeline forecasting',
            ],
          },
          trendAnalysis: {
            endpoint: 'GET /api/intelligence/analytics/predict?type=trends',
            description: 'Analyze patterns and forecast future trends',
            parameters: ['category', 'period', 'industry'],
          },
          predictiveInsights: {
            endpoint: 'GET /api/intelligence/analytics/predict?type=insights',
            description: 'Generate actionable insights from data patterns',
            parameters: ['companyId', 'industry'],
          },
        },

        supportedPredictionTypes: ['ESCALATION', 'BUSINESS_IMPACT', 'SOLUTION_OUTCOME', 'TIMELINE'],
        supportedTrendPeriods: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'],
        supportedInsightTypes: ['TREND', 'ANOMALY', 'OPPORTUNITY', 'RISK'],
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process analytics request' }, { status: 500 })
  }
}
