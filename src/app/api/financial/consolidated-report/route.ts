import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ConsolidatedReportRequestSchema = z.object({
  reportType: z.enum(['P&L', 'BALANCE_SHEET', 'CASH_FLOW', 'CONSOLIDATED']).default('CONSOLIDATED'),
  periodStart: z.string(),
  periodEnd: z.string(),
  businessIds: z.array(z.string()).optional(),
  includeForecasts: z.boolean().default(true),
  includeComparisons: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const reportType = url.searchParams.get('reportType') || 'CONSOLIDATED'
    const periodStart = url.searchParams.get('periodStart') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const periodEnd = url.searchParams.get('periodEnd') || new Date().toISOString()

    // Generate comprehensive financial report
    const report = generateConsolidatedReport(reportType, periodStart, periodEnd)

    return NextResponse.json({
      success: true,
      report,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating consolidated report:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, periodStart, periodEnd, businessIds, includeForecasts, includeComparisons } = 
      ConsolidatedReportRequestSchema.parse(body)

    // Generate detailed financial report with all requested components
    const report = {
      reportType,
      period: { start: periodStart, end: periodEnd },
      portfolio: {
        totalRevenue: 1847500,
        totalExpenses: 1234800,
        totalProfit: 612700,
        profitMargin: 33.2,
        totalAssets: 5240000,
        totalLiabilities: 1890000,
        totalEquity: 3350000,
        cashBalance: 892000,
        revenueGrowth: 24.5,
        expenseGrowth: 18.2,
        ebitda: 742300,
        ebitdaMargin: 40.2
      },
      businesses: [
        {
          businessId: 'phoenix-hvac',
          businessName: 'Phoenix HVAC Services',
          metrics: {
            revenue: 985000,
            recurringRevenue: 720000,
            oneTimeRevenue: 265000,
            revenueGrowth: 28.3,
            operatingExpenses: 580000,
            costOfGoodsSold: 320000,
            grossProfit: 665000,
            grossMargin: 67.5,
            operatingProfit: 405000,
            operatingMargin: 41.1,
            netProfit: 342000,
            netMargin: 34.7,
            ebitda: 425000,
            portfolioContribution: 53.3,
            cashFlow: {
              operating: 195000,
              investing: -30000,
              financing: 0,
              net: 165000
            }
          }
        },
        {
          businessId: 'valley-maintenance',
          businessName: 'Valley Maintenance Co',
          metrics: {
            revenue: 542500,
            recurringRevenue: 480000,
            oneTimeRevenue: 62500,
            revenueGrowth: 22.1,
            operatingExpenses: 380000,
            costOfGoodsSold: 180000,
            grossProfit: 362500,
            grossMargin: 66.8,
            operatingProfit: 162500,
            operatingMargin: 30.0,
            netProfit: 138000,
            netMargin: 25.4,
            ebitda: 185000,
            portfolioContribution: 29.4,
            cashFlow: {
              operating: 112000,
              investing: -40000,
              financing: 0,
              net: 72000
            }
          }
        },
        {
          businessId: 'desert-air',
          businessName: 'Desert Air Solutions',
          metrics: {
            revenue: 320000,
            recurringRevenue: 210000,
            oneTimeRevenue: 110000,
            revenueGrowth: 18.7,
            operatingExpenses: 230000,
            costOfGoodsSold: 95000,
            grossProfit: 225000,
            grossMargin: 70.3,
            operatingProfit: 90000,
            operatingMargin: 28.1,
            netProfit: 76000,
            netMargin: 23.8,
            ebitda: 105000,
            portfolioContribution: 17.3,
            cashFlow: {
              operating: 78000,
              investing: -55000,
              financing: 15000,
              net: 38000
            }
          }
        }
      ],
      consolidationAdjustments: {
        intercompanyEliminations: -95000,
        consolidationEntries: [],
        adjustmentNotes: 'Eliminated intercompany transactions between businesses'
      },
      cashFlow: {
        operating: {
          receiptsFromCustomers: 1923000,
          paymentsToSuppliers: -892000,
          paymentsToEmployees: -546000,
          total: 485000
        },
        investing: {
          purchaseOfEquipment: -85000,
          purchaseOfSoftware: -40000,
          total: -125000
        },
        financing: {
          loanRepayments: -65000,
          dividendsPaid: -20000,
          newLoans: 15000,
          total: -70000
        },
        netCashFlow: 290000,
        openingBalance: 602000,
        closingBalance: 892000
      },
      workingCapital: {
        currentAssets: 1315000,
        currentLiabilities: 710000,
        workingCapital: 605000,
        currentRatio: 1.85,
        quickRatio: 1.68,
        cashConversionCycle: 19
      },
      keyRatios: {
        returnOnAssets: 11.7,
        returnOnEquity: 18.3,
        debtToEquity: 0.56,
        interestCoverage: 12.4,
        assetTurnover: 0.35,
        inventoryTurnover: 8.2
      }
    }

    if (includeForecasts) {
      report['forecasts'] = {
        nextQuarter: {
          revenue: 2180000,
          profit: 722000,
          cashFlow: 340000,
          confidence: 85
        },
        nextYear: {
          revenue: 9200000,
          profit: 3050000,
          cashFlow: 1450000,
          confidence: 72
        },
        scenarios: {
          best: { revenue: 10500000, profit: 3680000 },
          base: { revenue: 9200000, profit: 3050000 },
          worst: { revenue: 7800000, profit: 2340000 }
        }
      }
    }

    if (includeComparisons) {
      report['comparisons'] = {
        previousPeriod: {
          revenue: 1485000,
          profit: 445000,
          revenueChange: 24.5,
          profitChange: 37.7
        },
        yearOverYear: {
          revenue: 1120000,
          profit: 336000,
          revenueChange: 64.9,
          profitChange: 82.4
        },
        industryBenchmarks: {
          profitMargin: { portfolio: 33.2, industry: 28.5 },
          revenueGrowth: { portfolio: 24.5, industry: 15.2 },
          ebitdaMargin: { portfolio: 40.2, industry: 32.1 }
        }
      }
    }

    // Add AI insights
    report['aiInsights'] = [
      {
        type: 'opportunity',
        title: 'Revenue Acceleration Opportunity',
        description: 'Phoenix HVAC showing 28.3% growth - scale successful strategies to other businesses',
        impact: 'high',
        potentialValue: 285000
      },
      {
        type: 'efficiency',
        title: 'Cost Optimization Potential',
        description: 'Consolidate supplier contracts across businesses for 8-12% cost reduction',
        impact: 'medium',
        potentialSavings: 148000
      },
      {
        type: 'risk',
        title: 'Cash Flow Timing Risk',
        description: 'Desert Air showing lower cash conversion - monitor collection closely',
        impact: 'low',
        mitigationStrategy: 'Implement automated collection reminders'
      }
    ]

    return NextResponse.json({
      success: true,
      report,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in consolidated report POST:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateConsolidatedReport(reportType: string, periodStart: string, periodEnd: string) {
  // This would normally fetch from database
  return {
    reportType,
    period: { start: periodStart, end: periodEnd },
    summary: {
      totalRevenue: 1847500,
      totalExpenses: 1234800,
      netProfit: 612700,
      profitMargin: 33.2,
      cashBalance: 892000,
      workingCapital: 605000
    },
    businessBreakdown: [
      { business: 'Phoenix HVAC', revenue: 985000, profit: 342000, contribution: 53.3 },
      { business: 'Valley Maintenance', revenue: 542500, profit: 138000, contribution: 29.4 },
      { business: 'Desert Air', revenue: 320000, profit: 76000, contribution: 17.3 }
    ],
    trends: {
      revenueGrowth: 24.5,
      profitGrowth: 37.7,
      cashFlowGrowth: 42.1
    }
  }
}