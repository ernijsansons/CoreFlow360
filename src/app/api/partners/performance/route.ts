import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const partnerId = searchParams.get('partnerId')
  const period = searchParams.get('period') || 'month'
  
  if (!partnerId) {
    return NextResponse.json(
      { error: 'Partner ID is required' },
      { status: 400 }
    )
  }
  
  // Generate performance data based on period
  const generatePerformanceData = (period: string) => {
    const multiplier = period === 'year' ? 12 : period === 'quarter' ? 3 : 1
    
    return {
      partnerId,
      period,
      metrics: {
        revenue: {
          current: 125000 * multiplier,
          previous: 98000 * multiplier,
          change: 27.55,
          target: 150000 * multiplier,
          commission: 25000 * multiplier,
          commissionRate: 20
        },
        deals: {
          current: 15 * multiplier,
          previous: 11 * multiplier,
          change: 36.36,
          target: 20 * multiplier,
          averageSize: 8333,
          conversionRate: 32.5
        },
        clients: {
          current: 8 * multiplier,
          previous: 6 * multiplier,
          change: 33.33,
          target: 10 * multiplier,
          retentionRate: 92.5,
          satisfactionScore: 4.8
        },
        pipeline: {
          totalValue: 750000 * multiplier,
          qualifiedLeads: 45 * multiplier,
          proposalsOut: 12 * multiplier,
          expectedClose: 8 * multiplier,
          velocity: 28 // days
        }
      },
      
      trends: generateTrendData(period),
      
      rankings: {
        overall: 3,
        totalPartners: 127,
        percentile: 97.6,
        tierRank: 2,
        tierTotal: 18,
        badges: ['top-performer', 'fast-growth', 'high-satisfaction']
      },
      
      strengths: [
        'High client satisfaction scores',
        'Excellent technical implementation',
        'Strong revenue growth trajectory',
        'Above-average deal conversion'
      ],
      
      improvements: [
        'Expand into new industries',
        'Increase marketing activities',
        'Develop more case studies',
        'Enhance solution architect skills'
      ],
      
      recommendations: [
        {
          title: 'Upgrade to Platinum Tier',
          description: 'You are 85% qualified for Platinum tier',
          action: 'Complete Solution Architect certification',
          impact: '+5% commission rate',
          priority: 'high'
        },
        {
          title: 'Expand Service Offerings',
          description: 'Add custom development services',
          action: 'Get development team certified',
          impact: '+$50K monthly revenue potential',
          priority: 'medium'
        },
        {
          title: 'Target Enterprise Clients',
          description: 'Your metrics show readiness for enterprise',
          action: 'Complete enterprise sales training',
          impact: '3x average deal size',
          priority: 'medium'
        }
      ]
    }
  }
  
  const generateTrendData = (period: string) => {
    const months = period === 'year' ? 12 : period === 'quarter' ? 3 : 6
    const data = []
    
    for (let i = 0; i < months; i++) {
      const month = new Date()
      month.setMonth(month.getMonth() - (months - i - 1))
      
      data.push({
        period: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: Math.floor(50000 + Math.random() * 75000),
        deals: Math.floor(8 + Math.random() * 12),
        clients: Math.floor(4 + Math.random() * 8),
        commission: Math.floor(10000 + Math.random() * 15000)
      })
    }
    
    return data
  }
  
  const performanceData = generatePerformanceData(period)
  
  return NextResponse.json(performanceData)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }
    
    // Process performance update (mock)
    const update = {
      partnerId: data.partnerId,
      updateType: data.type || 'manual',
      metrics: data.metrics,
      timestamp: new Date().toISOString(),
      
      calculated: {
        commissionEarned: data.metrics?.revenue ? data.metrics.revenue * 0.2 : 0,
        tierProgress: calculateTierProgress(data.metrics),
        performanceScore: calculatePerformanceScore(data.metrics),
        healthScore: calculateHealthScore(data.metrics)
      },
      
      alerts: generateAlerts(data.metrics),
      
      nextMilestones: [
        {
          type: 'revenue',
          target: 150000,
          current: data.metrics?.revenue || 0,
          reward: '$5,000 bonus'
        },
        {
          type: 'clients',
          target: 50,
          current: data.metrics?.totalClients || 0,
          reward: 'Gold tier upgrade'
        }
      ]
    }
    
    return NextResponse.json({
      success: true,
      message: 'Performance metrics updated successfully',
      update
    })
    
  } catch (error) {
    console.error('Performance update error:', error)
    return NextResponse.json(
      { error: 'Failed to update performance metrics' },
      { status: 500 }
    )
  }
}

function calculateTierProgress(metrics: any) {
  if (!metrics) return { current: 'bronze', next: 'silver', progress: 0 }
  
  const revenue = metrics.revenue || 0
  const clients = metrics.totalClients || 0
  const deals = metrics.deals || 0
  
  if (revenue >= 500000 && clients >= 50 && deals >= 50) {
    return { current: 'platinum', next: 'diamond', progress: 45 }
  } else if (revenue >= 150000 && clients >= 25 && deals >= 25) {
    return { current: 'gold', next: 'platinum', progress: 65 }
  } else if (revenue >= 50000 && clients >= 10 && deals >= 10) {
    return { current: 'silver', next: 'gold', progress: 75 }
  } else {
    return { current: 'bronze', next: 'silver', progress: 35 }
  }
}

function calculatePerformanceScore(metrics: any) {
  if (!metrics) return 0
  
  let score = 0
  
  // Revenue contribution (40%)
  if (metrics.revenue >= 100000) score += 40
  else if (metrics.revenue >= 50000) score += 30
  else if (metrics.revenue >= 25000) score += 20
  else if (metrics.revenue > 0) score += 10
  
  // Deal velocity (30%)
  if (metrics.deals >= 15) score += 30
  else if (metrics.deals >= 10) score += 20
  else if (metrics.deals >= 5) score += 15
  else if (metrics.deals > 0) score += 5
  
  // Client satisfaction (30%)
  if (metrics.satisfaction >= 4.5) score += 30
  else if (metrics.satisfaction >= 4.0) score += 20
  else if (metrics.satisfaction >= 3.5) score += 10
  
  return score
}

function calculateHealthScore(metrics: any) {
  if (!metrics) return 'unknown'
  
  const performanceScore = calculatePerformanceScore(metrics)
  
  if (performanceScore >= 80) return 'excellent'
  if (performanceScore >= 60) return 'good'
  if (performanceScore >= 40) return 'fair'
  return 'needs-attention'
}

function generateAlerts(metrics: any) {
  const alerts = []
  
  if (metrics?.revenue < metrics?.revenueTarget * 0.5) {
    alerts.push({
      type: 'warning',
      message: 'Revenue is below 50% of target',
      action: 'Schedule performance review'
    })
  }
  
  if (metrics?.deals === 0) {
    alerts.push({
      type: 'critical',
      message: 'No deals closed this period',
      action: 'Immediate support intervention needed'
    })
  }
  
  if (metrics?.satisfaction < 3.5) {
    alerts.push({
      type: 'warning',
      message: 'Client satisfaction below threshold',
      action: 'Review implementation quality'
    })
  }
  
  if (metrics?.revenue > metrics?.revenueTarget * 1.2) {
    alerts.push({
      type: 'success',
      message: 'Exceeded revenue target by 20%+',
      action: 'Eligible for performance bonus'
    })
  }
  
  return alerts
}