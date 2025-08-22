'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Target,
  PieChart,
  BarChart3,
  Activity,
  Brain,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react'

interface ExecutiveCostDashboardProps {
  tenantId: string
}

interface ExecutiveMetrics {
  totalSpend: number
  monthlyTrend: number
  projectedSavings: number
  costOptimizationScore: number
  BUSINESS INTELLIGENCELevel: string
  activeAlerts: number
  automatedSavings: number
  roi: number
}

interface CostTrend {
  date: string
  actual: number
  predicted: number
  optimized: number
}

interface DepartmentCost {
  department: string
  current: number
  previous: number
  budget: number
  variance: number
  trend: 'up' | 'down' | 'stable'
}

interface StrategicInsight {
  id: string
  type: 'opportunity' | 'risk' | 'achievement'
  title: string
  impact: number
  urgency: 'immediate' | 'high' | 'medium' | 'low'
  recommendation: string
}

export default function ExecutiveCostDashboard({ tenantId }: ExecutiveCostDashboardProps) {
  const [metrics, setMetrics] = useState<ExecutiveMetrics>({
    totalSpend: 125000,
    monthlyTrend: -8.5,
    projectedSavings: 45000,
    costOptimizationScore: 78,
    BUSINESS INTELLIGENCELevel: 'Autonomous',
    activeAlerts: 3,
    automatedSavings: 28000,
    roi: 320,
  })

  const [costTrends, setCostTrends] = useState<CostTrend[]>([])
  const [departmentCosts, setDepartmentCosts] = useState<DepartmentCost[]>([])
  const [strategicInsights, setStrategicInsights] = useState<StrategicInsight[]>([])
  const [selectedView, setSelectedView] = useState<string>('overview')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchExecutiveData()
  }, [tenantId])

  const fetchExecutiveData = async () => {
    setLoading(true)

    // Mock data - in production, fetch from API
    setCostTrends([
      { date: 'Jan', actual: 110000, predicted: 115000, optimized: 95000 },
      { date: 'Feb', actual: 118000, predicted: 120000, optimized: 98000 },
      { date: 'Mar', actual: 125000, predicted: 128000, optimized: 102000 },
      { date: 'Apr', actual: 122000, predicted: 130000, optimized: 100000 },
      { date: 'May', actual: 119000, predicted: 125000, optimized: 95000 },
      { date: 'Jun', actual: 115000, predicted: 122000, optimized: 92000 },
    ])

    setDepartmentCosts([
      {
        department: 'Engineering',
        current: 45000,
        previous: 48000,
        budget: 50000,
        variance: -10,
        trend: 'down',
      },
      {
        department: 'Sales',
        current: 30000,
        previous: 28000,
        budget: 35000,
        variance: -14.3,
        trend: 'up',
      },
      {
        department: 'Marketing',
        current: 25000,
        previous: 26000,
        budget: 25000,
        variance: 0,
        trend: 'down',
      },
      {
        department: 'Operations',
        current: 20000,
        previous: 19000,
        budget: 22000,
        variance: -9.1,
        trend: 'up',
      },
      {
        department: 'HR',
        current: 5000,
        previous: 5200,
        budget: 6000,
        variance: -16.7,
        trend: 'down',
      },
    ])

    setStrategicInsights([
      {
        id: '1',
        type: 'opportunity',
        title: 'Cloud Resource Optimization',
        impact: 35000,
        urgency: 'immediate',
        recommendation: 'Implement AI-driven rightsizing for 40% cost reduction',
      },
      {
        id: '2',
        type: 'risk',
        title: 'Vendor Lock-in Risk Detected',
        impact: 50000,
        urgency: 'high',
        recommendation: 'Diversify cloud providers to reduce dependency',
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Autonomous Cost Optimization Success',
        impact: 28000,
        urgency: 'low',
        recommendation: 'Continue current AI optimization strategy',
      },
    ])

    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getBUSINESS INTELLIGENCEColor = (level: string) => {
    switch (level) {
      case 'INTELLIGENT':
        return 'bg-blue-500'
      case 'INTELLIGENT':
        return 'bg-purple-500'
      case 'Autonomous':
        return 'bg-green-500'
      case 'ADVANCED':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTrendIcon = (value: number) => {
    return value < 0 ? (
      <TrendingDown className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingUp className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      {/* Executive Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Executive Cost Intelligence</h1>
            <p className="mt-1 text-gray-600">Real-time financial BUSINESS INTELLIGENCE monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              className={`${getBUSINESS INTELLIGENCEColor(metrics.BUSINESS INTELLIGENCELevel)} px-4 py-2 text-white`}
            >
              <Brain className="mr-2 h-4 w-4" />
              {metrics.BUSINESS INTELLIGENCELevel} BUSINESS INTELLIGENCE
            </Badge>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Monthly Spend</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.totalSpend)}</p>
                <div className="mt-2 flex items-center">
                  {getTrendIcon(metrics.monthlyTrend)}
                  <span
                    className={`ml-1 text-sm ${metrics.monthlyTrend < 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {Math.abs(metrics.monthlyTrend)}%
                  </span>
                  <span className="ml-1 text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projected Annual Savings</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.projectedSavings)}
                </p>
                <Progress value={metrics.costOptimizationScore} className="mt-2" />
                <span className="text-xs text-gray-500">
                  Optimization Score: {metrics.costOptimizationScore}%
                </span>
              </div>
              <Target className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI-Automated Savings</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(metrics.automatedSavings)}
                </p>
                <div className="mt-2 flex items-center">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="ml-1 text-sm text-gray-600">This Month</span>
                </div>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI on Cost Management</p>
                <p className="mt-1 text-2xl font-bold">{metrics.roi}%</p>
                <div className="mt-2 flex items-center">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm text-green-600">Exceeding target</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights Panel */}
      {metrics.activeAlerts > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
              Critical Cost Intelligence Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategicInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-center justify-between rounded-lg bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        insight.type === 'opportunity'
                          ? 'bg-green-100'
                          : insight.type === 'risk'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                      }`}
                    >
                      {insight.type === 'opportunity' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : insight.type === 'risk' ? (
                        <Shield className="h-5 w-5 text-red-600" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.recommendation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(insight.impact)}</p>
                    <Badge
                      variant="outline"
                      className={
                        insight.urgency === 'immediate'
                          ? 'border-red-500 text-red-600'
                          : insight.urgency === 'high'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-gray-400'
                      }
                    >
                      {insight.urgency}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Cost Trends</TabsTrigger>
          <TabsTrigger value="departments">Department Analysis</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Cost Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center rounded-lg bg-gray-50">
                {/* In production, use a real charting library like Recharts */}
                <div className="text-center">
                  <BarChart3 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <p className="text-gray-600">Interactive cost trend chart</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Actual Costs</span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Predicted Costs</span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Optimized Costs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Cost Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentCosts.map((dept) => (
                  <div key={dept.department} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold">{dept.department}</h4>
                      <div className="flex items-center gap-2">
                        {dept.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                        )}
                        <span className={dept.variance < 0 ? 'text-green-600' : 'text-red-600'}>
                          {dept.variance}% vs budget
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current</span>
                        <p className="font-semibold">{formatCurrency(dept.current)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Previous</span>
                        <p className="font-semibold">{formatCurrency(dept.previous)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget</span>
                        <p className="font-semibold">{formatCurrency(dept.budget)}</p>
                      </div>
                    </div>
                    <Progress value={(dept.current / dept.budget) * 100} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI-Powered Cost Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Next Quarter Forecast</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-4">
                      <p className="text-sm text-gray-600">Predicted Spend</p>
                      <p className="text-2xl font-bold">{formatCurrency(380000)}</p>
                      <p className="mt-1 text-xs text-gray-500">±5% confidence interval</p>
                    </div>
                    <div className="rounded-lg bg-white p-4">
                      <p className="text-sm text-gray-600">Optimization Potential</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(65000)}</p>
                      <p className="mt-1 text-xs text-gray-500">With AI interventions</p>
                    </div>
                    <div className="rounded-lg bg-white p-4">
                      <p className="text-sm text-gray-600">Risk Exposure</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatCurrency(15000)}</p>
                      <p className="mt-1 text-xs text-gray-500">Anomaly prevention</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="mb-4 font-semibold">BUSINESS INTELLIGENCE Evolution Impact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Current Level Impact</span>
                      <span className="font-semibold">{formatCurrency(28000)} saved/month</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Next Level Potential</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(45000)} saved/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Time to Next Evolution</span>
                      <span className="font-semibold">~3 months</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Cost Optimization Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="mb-2 font-semibold">Q1 2025: Foundation Phase</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Implement cloud resource rightsizing (Est. {formatCurrency(15000)} savings)
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Deploy AI-driven anomaly detection system
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Establish automated cost governance policies
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="mb-2 font-semibold">Q2 2025: Intelligence Evolution</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Upgrade to ADVANCED BUSINESS INTELLIGENCE tier
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Enable cross-module cost optimization (Est. {formatCurrency(25000)} savings)
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Implement predictive budget management
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="mb-2 font-semibold">Q3 2025: Autonomous Operations</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Full autonomous cost management activation
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Post-human optimization algorithms (Est. {formatCurrency(50000)} savings)
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Zero-touch financial operations
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
