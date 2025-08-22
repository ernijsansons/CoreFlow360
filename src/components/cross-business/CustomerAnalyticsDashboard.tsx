'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  AlertCircle,
  CheckCircle2,
  Eye,
  Filter,
  Download,
  Calendar,
  Network,
  Zap
} from 'lucide-react'

interface CustomerPortfolioMetrics {
  totalCustomers: number
  multiBusinessCustomers: number
  averagePortfolioValue: number
  totalPortfolioValue: number
  crossSellConversionRate: number
  customerRetentionRate: number
  averageLifetimeValue: number
  portfolioPenetrationRate: number
  quarterlyGrowthRate: number
  averageBusinessCount: number
}

interface BusinessPerformance {
  businessId: string
  businessName: string
  customerCount: number
  averageCustomerValue: number
  retentionRate: number
  crossSellRate: number
  growthTrend: 'up' | 'down' | 'stable'
  growthPercentage: number
  portfolioContribution: number
  satisfactionScore: number
  topServiceCategories: string[]
}

interface CustomerSegment {
  segment: string
  count: number
  percentage: number
  averageValue: number
  crossSellPotential: number
  retentionRisk: number
  preferredServices: string[]
  growthTrend: 'up' | 'down' | 'stable'
}

interface CrossSellInsight {
  type: 'opportunity' | 'trend' | 'risk' | 'success'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionRequired: boolean
  relatedBusinesses: string[]
  potentialValue: number
  timeline: string
}

export function CustomerAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedView, setSelectedView] = useState<'overview' | 'segments' | 'businesses' | 'insights'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  const [portfolioMetrics] = useState<CustomerPortfolioMetrics>({
    totalCustomers: 247,
    multiBusinessCustomers: 89,
    averagePortfolioValue: 28500,
    totalPortfolioValue: 7047500,
    crossSellConversionRate: 34.2,
    customerRetentionRate: 92.1,
    averageLifetimeValue: 45200,
    portfolioPenetrationRate: 36.0,
    quarterlyGrowthRate: 18.5,
    averageBusinessCount: 2.3
  })

  const [businessPerformance] = useState<BusinessPerformance[]>([
    {
      businessId: 'phoenix-hvac',
      businessName: 'Phoenix HVAC Services',
      customerCount: 145,
      averageCustomerValue: 32000,
      retentionRate: 94.5,
      crossSellRate: 42.1,
      growthTrend: 'up',
      growthPercentage: 22.3,
      portfolioContribution: 58.7,
      satisfactionScore: 4.7,
      topServiceCategories: ['Commercial HVAC', 'Maintenance', 'Emergency Service']
    },
    {
      businessId: 'valley-maintenance',
      businessName: 'Valley Maintenance Co',
      customerCount: 78,
      averageCustomerValue: 18500,
      retentionRate: 88.2,
      crossSellRate: 28.4,
      growthTrend: 'up',
      growthPercentage: 15.8,
      portfolioContribution: 20.7,
      satisfactionScore: 4.4,
      topServiceCategories: ['Facility Maintenance', 'General Repairs', 'Preventive Care']
    },
    {
      businessId: 'desert-air',
      businessName: 'Desert Air Solutions',
      customerCount: 64,
      averageCustomerValue: 22800,
      retentionRate: 91.8,
      crossSellRate: 31.7,
      growthTrend: 'stable',
      growthPercentage: 8.2,
      portfolioContribution: 20.6,
      satisfactionScore: 4.6,
      topServiceCategories: ['Residential HVAC', 'Air Quality', 'Smart Systems']
    }
  ])

  const [customerSegments] = useState<CustomerSegment[]>([
    {
      segment: 'Enterprise Portfolio Champions',
      count: 23,
      percentage: 9.3,
      averageValue: 125000,
      crossSellPotential: 89,
      retentionRisk: 8,
      preferredServices: ['Enterprise HVAC', 'Multi-Location', 'Contract Maintenance'],
      growthTrend: 'up'
    },
    {
      segment: 'Growing Business Network',
      count: 66,
      percentage: 26.7,
      averageValue: 45000,
      crossSellPotential: 76,
      retentionRisk: 12,
      preferredServices: ['Commercial HVAC', 'Facility Maintenance', 'Energy Solutions'],
      growthTrend: 'up'
    },
    {
      segment: 'Cross-Business Loyalists',
      count: 89,
      percentage: 36.0,
      averageValue: 28500,
      crossSellPotential: 65,
      retentionRisk: 15,
      preferredServices: ['Maintenance', 'Repair Services', 'Consultation'],
      growthTrend: 'stable'
    },
    {
      segment: 'Single Business Focused',
      count: 69,
      percentage: 28.0,
      averageValue: 15200,
      crossSellPotential: 42,
      retentionRisk: 22,
      preferredServices: ['Basic Service', 'Emergency Response', 'Residential'],
      growthTrend: 'down'
    }
  ])

  const [insights] = useState<CrossSellInsight[]>([
    {
      type: 'opportunity',
      title: 'High-Value Enterprise Cross-Sell Window',
      description: '23 enterprise customers show 89% cross-sell readiness with projected $2.8M revenue potential',
      impact: 'high',
      actionRequired: true,
      relatedBusinesses: ['Phoenix HVAC', 'Valley Maintenance'],
      potentialValue: 2800000,
      timeline: '30-60 days'
    },
    {
      type: 'trend',
      title: 'Facility Maintenance Demand Surge',
      description: '42% increase in maintenance service requests across business network, indicating expansion opportunity',
      impact: 'high',
      actionRequired: true,
      relatedBusinesses: ['Valley Maintenance', 'Desert Air'],
      potentialValue: 850000,
      timeline: '45 days'
    },
    {
      type: 'risk',
      title: 'Single-Business Customer Retention Alert',
      description: '28% of customers remain single-business focused with 22% retention risk requiring engagement strategy',
      impact: 'medium',
      actionRequired: true,
      relatedBusinesses: ['Phoenix HVAC', 'Desert Air'],
      potentialValue: 1050000,
      timeline: 'Immediate'
    },
    {
      type: 'success',
      title: 'Multi-Business Customer Satisfaction Peak',
      description: 'Cross-business customers show 94.5% satisfaction vs 87.2% single-business, validating portfolio strategy',
      impact: 'medium',
      actionRequired: false,
      relatedBusinesses: ['All Businesses'],
      potentialValue: 0,
      timeline: 'Ongoing'
    }
  ])

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Portfolio Analytics</h1>
          <p className="text-gray-600">Cross-business customer insights and optimization opportunities</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            {['week', 'month', 'quarter', 'year'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Portfolio Value</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${(portfolioMetrics.totalPortfolioValue / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-green-600">+{portfolioMetrics.quarterlyGrowthRate}% this quarter</p>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Portfolio Penetration</p>
                <p className="text-2xl font-bold text-purple-900">{portfolioMetrics.portfolioPenetrationRate}%</p>
                <p className="text-xs text-purple-600 mt-1">
                  {portfolioMetrics.multiBusinessCustomers} multi-business customers
                </p>
              </div>
              <Network className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Cross-Sell Success</p>
                <p className="text-2xl font-bold text-green-900">{portfolioMetrics.crossSellConversionRate}%</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-green-600">+8.2% vs last quarter</p>
                </div>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Retention Rate</p>
                <p className="text-2xl font-bold text-orange-900">{portfolioMetrics.customerRetentionRate}%</p>
                <p className="text-xs text-orange-600 mt-1">
                  Avg LTV: ${(portfolioMetrics.averageLifetimeValue / 1000).toFixed(0)}k
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'segments', label: 'Customer Segments', icon: Users },
          { id: 'businesses', label: 'Business Performance', icon: Building },
          { id: 'insights', label: 'AI Insights', icon: Zap }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessPerformance.map((business) => (
                  <div key={business.businessId} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{business.businessName}</span>
                      <span>{business.portfolioContribution.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${business.portfolioContribution}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{business.customerCount} customers</span>
                      <span>${(business.averageCustomerValue / 1000).toFixed(0)}k avg value</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Multi-Business Growth</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="font-bold">+22.3%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Portfolio customers growing 2.8x faster than single-business
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cross-Sell Velocity</span>
                    <div className="flex items-center text-blue-600">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="font-bold">34.2%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Conversion rate for cross-business opportunities
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Customer Satisfaction</span>
                    <div className="flex items-center text-purple-600">
                      <Star className="h-4 w-4 mr-1" />
                      <span className="font-bold">4.6/5</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Multi-business customers rate 12% higher satisfaction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Customer Segments Tab */}
      {selectedView === 'segments' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerSegments.map((segment, index) => (
              <motion.div
                key={segment.segment}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="text-sm">{segment.segment}</span>
                      {segment.growthTrend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : segment.growthTrend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{segment.count}</span>
                      <Badge variant="outline">{segment.percentage}%</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Avg Value:</span>
                        <span className="font-medium">${(segment.averageValue / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cross-Sell:</span>
                        <span className="font-medium text-blue-600">{segment.crossSellPotential}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retention Risk:</span>
                        <span className={`font-medium ${
                          segment.retentionRisk > 20 ? 'text-red-600' : 
                          segment.retentionRisk > 15 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {segment.retentionRisk}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2">Top Services:</p>
                      <div className="space-y-1">
                        {segment.preferredServices.slice(0, 2).map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs mr-1">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Business Performance Tab */}
      {selectedView === 'businesses' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {businessPerformance.map((business, index) => (
            <motion.div
              key={business.businessId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      {business.businessName}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        business.growthTrend === 'up' ? 'bg-green-100 text-green-800' :
                        business.growthTrend === 'down' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {business.growthTrend === 'up' ? '↗' : business.growthTrend === 'down' ? '↘' : '→'} 
                        {business.growthPercentage.toFixed(1)}%
                      </Badge>
                      <Badge variant="outline">
                        ★ {business.satisfactionScore}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Customer Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Customers:</span>
                          <span className="font-medium">{business.customerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Customer Value:</span>
                          <span className="font-medium">${(business.averageCustomerValue / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Portfolio Share:</span>
                          <span className="font-medium">{business.portfolioContribution.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Retention Rate:</span>
                          <span className="font-medium text-green-600">{business.retentionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cross-Sell Rate:</span>
                          <span className="font-medium text-blue-600">{business.crossSellRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Growth:</span>
                          <span className={`font-medium ${
                            business.growthTrend === 'up' ? 'text-green-600' :
                            business.growthTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {business.growthPercentage > 0 ? '+' : ''}{business.growthPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Top Services</h4>
                      <div className="space-y-1">
                        {business.topServiceCategories.map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs mr-1 mb-1">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          <Target className="h-4 w-4 mr-1" />
                          Optimize
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* AI Insights Tab */}
      {selectedView === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={`hover:shadow-lg transition-shadow ${
                insight.type === 'opportunity' ? 'border-l-4 border-l-green-500' :
                insight.type === 'risk' ? 'border-l-4 border-l-red-500' :
                insight.type === 'trend' ? 'border-l-4 border-l-blue-500' :
                'border-l-4 border-l-gray-500'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {insight.type === 'opportunity' && <Target className="h-5 w-5 text-green-500" />}
                      {insight.type === 'risk' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      {insight.type === 'trend' && <TrendingUp className="h-5 w-5 text-blue-500" />}
                      {insight.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </Badge>
                      {insight.actionRequired && (
                        <Badge variant="destructive">ACTION REQUIRED</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Timeline:</span>
                      <div className="font-medium">{insight.timeline}</div>
                    </div>
                    {insight.potentialValue > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Potential Value:</span>
                        <div className="font-medium text-green-600">
                          ${(insight.potentialValue / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Related Businesses:</span>
                      <div className="space-y-1 mt-1">
                        {insight.relatedBusinesses.slice(0, 2).map((business, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs mr-1">
                            {business}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {insight.actionRequired && (
                    <div className="flex items-center space-x-3 pt-3 border-t">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Take Action
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Schedule Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}