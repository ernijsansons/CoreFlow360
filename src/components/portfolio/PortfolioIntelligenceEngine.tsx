'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Brain, TrendingUp, Zap, Target, BarChart3, Users,
  DollarSign, Building2, ArrowUp, ArrowDown, Activity,
  Lightbulb, AlertTriangle, CheckCircle, Clock, Star,
  RefreshCw, Eye, Filter, Download, Share2, Settings
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, AreaChart, Area
} from 'recharts'

export default function PortfolioIntelligenceEngine() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month')
  const [activeInsight, setActiveInsight] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState('all')

  // Mock portfolio data
  const portfolioOverview = {
    totalBusinesses: 5,
    totalRevenue: 8500000,
    totalEmployees: 185,
    avgGrowthRate: 28.5,
    intelligenceScore: 87,
    synergiesRealized: 2450000,
    efficiencyGain: 32.8
  }

  const businesses = [
    {
      id: 'b1',
      name: 'Phoenix HVAC Services',
      industry: 'HVAC',
      revenue: 2800000,
      growth: 35.2,
      employees: 45,
      efficiency: 89,
      healthScore: 92,
      kpis: { satisfaction: 4.8, utilization: 87, profitability: 23.5 }
    },
    {
      id: 'b2', 
      name: 'Elite Legal Group',
      industry: 'Professional Services',
      revenue: 1900000,
      growth: 18.7,
      employees: 28,
      efficiency: 85,
      healthScore: 88,
      kpis: { satisfaction: 4.6, utilization: 92, profitability: 28.2 }
    },
    {
      id: 'b3',
      name: 'TechFlow Solutions',
      industry: 'Technology',
      revenue: 2200000,
      growth: 42.1,
      employees: 35,
      efficiency: 94,
      healthScore: 95,
      kpis: { satisfaction: 4.9, utilization: 89, profitability: 31.8 }
    },
    {
      id: 'b4',
      name: 'Metro Construction',
      industry: 'Construction',
      revenue: 1100000,
      growth: 12.4,
      employees: 52,
      efficiency: 78,
      healthScore: 74,
      kpis: { satisfaction: 4.2, utilization: 76, profitability: 18.9 }
    },
    {
      id: 'b5',
      name: 'Gourmet Bistro Chain',
      industry: 'Hospitality',
      revenue: 500000,
      growth: 8.9,
      employees: 25,
      efficiency: 72,
      healthScore: 69,
      kpis: { satisfaction: 4.1, utilization: 71, profitability: 15.2 }
    }
  ]

  // AI-generated insights
  const insights = [
    {
      id: 1,
      type: 'opportunity',
      priority: 'high',
      category: 'Cross-Business Synergy',
      title: 'HVAC-Construction Partnership Opportunity',
      description: 'Phoenix HVAC and Metro Construction could cross-sell services, potentially increasing combined revenue by 15%.',
      impact: '$420K annual revenue increase',
      confidence: 94,
      timeframe: '90 days',
      actions: ['Schedule joint sales meeting', 'Create bundled service offerings', 'Train teams on cross-selling'],
      metrics: { revenue_impact: 420000, effort_score: 3, roi: 385 }
    },
    {
      id: 2,
      type: 'optimization',
      priority: 'high',
      category: 'Resource Allocation',
      title: 'Reallocate Technical Talent',
      description: 'TechFlow has 85% capacity while Metro Construction needs technology expertise. Sharing resources could boost both.',
      impact: '+$180K efficiency gains',
      confidence: 89,
      timeframe: '30 days',
      actions: ['Assess skill overlap', 'Create resource-sharing agreement', 'Implement cross-training'],
      metrics: { cost_savings: 180000, effort_score: 2, roi: 290 }
    },
    {
      id: 3,
      type: 'risk',
      priority: 'medium',
      category: 'Performance',
      title: 'Bistro Chain Underperformance',
      description: 'Gourmet Bistro Chain shows declining metrics. Requires immediate attention to prevent further deterioration.',
      impact: 'Risk of $50K quarterly loss',
      confidence: 76,
      timeframe: '14 days',
      actions: ['Conduct operational audit', 'Review menu pricing', 'Assess location performance'],
      metrics: { risk_mitigation: 200000, effort_score: 4, urgency: 8 }
    },
    {
      id: 4,
      type: 'growth',
      priority: 'medium',
      category: 'Market Expansion',
      title: 'Legal Services Digital Expansion',
      description: 'Elite Legal could leverage TechFlow\'s digital capabilities to offer legal tech services.',
      impact: '+$250K new revenue stream',
      confidence: 82,
      timeframe: '120 days',
      actions: ['Market research', 'Product development plan', 'Pilot program launch'],
      metrics: { revenue_potential: 250000, effort_score: 5, roi: 220 }
    },
    {
      id: 5,
      type: 'optimization',
      priority: 'low',
      category: 'Operational Efficiency',
      title: 'Unified Customer Database',
      description: 'Consolidating customer data across all businesses could reveal cross-selling opportunities worth $185K annually.',
      impact: '+$185K cross-selling potential',
      confidence: 71,
      timeframe: '60 days',
      actions: ['Data audit', 'CRM integration', 'Customer segmentation analysis'],
      metrics: { revenue_impact: 185000, effort_score: 3, roi: 155 }
    }
  ]

  // Performance trends
  const performanceTrends = [
    { month: 'Jan', revenue: 650000, efficiency: 78, synergies: 45000 },
    { month: 'Feb', revenue: 680000, efficiency: 80, synergies: 52000 },
    { month: 'Mar', revenue: 720000, efficiency: 82, synergies: 61000 },
    { month: 'Apr', revenue: 750000, efficiency: 84, synergies: 68000 },
    { month: 'May', revenue: 780000, efficiency: 86, synergies: 78000 },
    { month: 'Jun', revenue: 810000, efficiency: 88, synergies: 85000 }
  ]

  // Business health matrix
  const healthMatrix = businesses.map(b => ({
    name: b.name,
    growth: b.growth,
    efficiency: b.efficiency,
    health: b.healthScore,
    revenue: b.revenue / 1000000
  }))

  // Synergy opportunities
  const synergyMatrix = [
    { from: 'Phoenix HVAC', to: 'Metro Construction', type: 'Cross-selling', value: 420000, effort: 3 },
    { from: 'Elite Legal', to: 'TechFlow Solutions', type: 'Service Integration', value: 250000, effort: 5 },
    { from: 'TechFlow Solutions', to: 'Metro Construction', type: 'Resource Sharing', value: 180000, effort: 2 },
    { from: 'Phoenix HVAC', to: 'Elite Legal', type: 'B2B Services', value: 125000, effort: 4 },
    { from: 'All Businesses', to: 'Data Unification', type: 'Cross-selling', value: 185000, effort: 3 }
  ]

  // Risk assessment
  const riskFactors = [
    { category: 'Market Risk', score: 35, trend: 'stable', businesses: ['Gourmet Bistro Chain'] },
    { category: 'Operational Risk', score: 22, trend: 'improving', businesses: ['Metro Construction'] },
    { category: 'Financial Risk', score: 18, trend: 'improving', businesses: [] },
    { category: 'Competitive Risk', score: 28, trend: 'stable', businesses: ['TechFlow Solutions'] },
    { category: 'Regulatory Risk', score: 15, trend: 'stable', businesses: ['Elite Legal Group'] }
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const getInsightIcon = (type: string) => {
    switch(type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'optimization': return <Zap className="w-5 h-5 text-blue-500" />
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'growth': return <Target className="w-5 h-5 text-purple-500" />
      default: return <Brain className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Portfolio Intelligence Engine</h1>
            </div>
            <p className="text-lg opacity-90">AI-powered insights for your business portfolio</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{portfolioOverview.intelligenceScore}</div>
            <p className="text-sm opacity-90">Intelligence Score</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-2"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Analyzing...' : 'Refresh AI'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Businesses</p>
                <p className="text-2xl font-bold">{portfolioOverview.totalBusinesses}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${(portfolioOverview.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold">{portfolioOverview.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Growth</p>
                <p className="text-2xl font-bold">{portfolioOverview.avgGrowthRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Synergies</p>
                <p className="text-2xl font-bold">${(portfolioOverview.synergiesRealized / 1000000).toFixed(1)}M</p>
              </div>
              <Zap className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold">{portfolioOverview.efficiencyGain}%</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Score</p>
                <p className="text-2xl font-bold">{portfolioOverview.intelligenceScore}</p>
              </div>
              <Brain className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="synergies">Synergies</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Generated Insights
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{insights.length} insights</Badge>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, idx) => (
                  <div 
                    key={insight.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      activeInsight === idx ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveInsight(idx)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{insight.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Impact</p>
                        <p className="font-semibold text-green-600">{insight.impact}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Timeframe</p>
                        <p className="font-semibold">{insight.timeframe}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Effort</p>
                        <div className="flex justify-center">
                          {[1,2,3,4,5].map(i => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i <= insight.metrics.effort_score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {activeInsight === idx && (
                      <div className="border-t pt-3 mt-3">
                        <h5 className="font-semibold mb-2">Recommended Actions:</h5>
                        <ul className="space-y-1">
                          {insight.actions.map((action, actionIdx) => (
                            <li key={actionIdx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm">
                            Implement Action Plan
                          </Button>
                          <Button size="sm" variant="outline">
                            Schedule Review
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Insight
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={2} name="Efficiency %" />
                    <Line type="monotone" dataKey="synergies" stroke="#f59e0b" strokeWidth={2} name="Synergies" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Health Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={healthMatrix}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="growth" name="Growth %" />
                    <YAxis dataKey="efficiency" name="Efficiency %" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-semibold">{data.name}</p>
                              <p>Growth: {data.growth}%</p>
                              <p>Efficiency: {data.efficiency}%</p>
                              <p>Health: {data.health}</p>
                              <p>Revenue: ${data.revenue.toFixed(1)}M</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter dataKey="efficiency" fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Individual Business Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <div key={business.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{business.name}</h4>
                      <Badge variant="secondary">{business.industry}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Health Score</span>
                          <span>{business.healthScore}%</span>
                        </div>
                        <Progress value={business.healthScore} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-semibold">${(business.revenue / 1000000).toFixed(1)}M</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Growth</p>
                          <p className="font-semibold text-green-600">+{business.growth}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Employees</p>
                          <p className="font-semibold">{business.employees}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Efficiency</p>
                          <p className="font-semibold">{business.efficiency}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-gray-600">Satisfaction</p>
                          <p className="font-semibold">{business.kpis.satisfaction}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Utilization</p>
                          <p className="font-semibold">{business.kpis.utilization}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Profit</p>
                          <p className="font-semibold">{business.kpis.profitability}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Synergies Tab */}
        <TabsContent value="synergies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Business Synergy Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {synergyMatrix.map((synergy, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{synergy.from} → {synergy.to}</h4>
                        <p className="text-sm text-gray-600">{synergy.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${(synergy.value / 1000).toFixed(0)}K
                        </p>
                        <p className="text-sm text-gray-600">Annual potential</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Effort:</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i <= synergy.effort ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <Button size="sm">
                        Explore Synergy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="border-cyan-200 bg-cyan-50">
                <Lightbulb className="h-4 w-4 text-cyan-600" />
                <AlertDescription className="text-cyan-800">
                  <strong>AI Recommendation:</strong> Focus on the top 3 synergies which could generate 
                  $850K in additional annual value with moderate effort. Implement in order of ROI.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Risk Categories</h4>
                  <div className="space-y-3">
                    {riskFactors.map((risk, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{risk.category}</p>
                          <p className="text-sm text-gray-600">
                            {risk.businesses.length > 0 ? `Affects: ${risk.businesses.join(', ')}` : 'Portfolio-wide'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${
                              risk.score > 40 ? 'text-red-600' : 
                              risk.score > 25 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {risk.score}%
                            </span>
                            {risk.trend === 'improving' ? (
                              <ArrowDown className="w-4 h-4 text-green-500" />
                            ) : risk.trend === 'worsening' ? (
                              <ArrowUp className="w-4 h-4 text-red-500" />
                            ) : (
                              <span className="w-4 h-4 flex items-center justify-center text-gray-400">-</span>
                            )}
                          </div>
                          <Progress 
                            value={risk.score} 
                            className={`w-20 h-2 ${
                              risk.score > 40 ? '[&>div]:bg-red-500' : 
                              risk.score > 25 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Risk Mitigation Actions</h4>
                  <div className="space-y-3">
                    <div className="p-3 border border-red-200 rounded bg-red-50">
                      <h5 className="font-medium text-red-800">High Priority</h5>
                      <p className="text-sm text-red-700 mt-1">
                        Address Gourmet Bistro Chain performance issues - implement operational review within 14 days
                      </p>
                    </div>
                    <div className="p-3 border border-yellow-200 rounded bg-yellow-50">
                      <h5 className="font-medium text-yellow-800">Medium Priority</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Diversify Metro Construction client base to reduce market concentration risk
                      </p>
                    </div>
                    <div className="p-3 border border-green-200 rounded bg-green-50">
                      <h5 className="font-medium text-green-800">Monitoring</h5>
                      <p className="text-sm text-green-700 mt-1">
                        Continue tracking regulatory changes affecting Elite Legal Group
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Resource Optimization</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h5 className="font-medium">Cross-Business Staffing</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        TechFlow can share 2 developers with Metro Construction for digital transformation project
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">+$180K savings</Badge>
                        <Button size="sm" variant="outline">Implement</Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium">Unified Marketing</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        Combine marketing budgets for 20% efficiency gain across all businesses
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">+$85K savings</Badge>
                        <Button size="sm" variant="outline">Implement</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Performance Optimization</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h5 className="font-medium">Gourmet Bistro Turnaround</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        Implement TechFlow's POS and analytics solutions to improve operational efficiency
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">+15% efficiency</Badge>
                        <Button size="sm" variant="outline">Implement</Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium">HVAC-Construction Integration</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        Create joint service packages for commercial clients
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">+$420K revenue</Badge>
                        <Button size="sm" variant="outline">Implement</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50 mt-6">
                <Brain className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>AI Optimization Score:</strong> Your portfolio is operating at 87% efficiency. 
                  Implementing the top 3 recommendations could increase this to 94% within 6 months.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-semibold text-green-600">6-Month Projection</h4>
                    <p className="text-2xl font-bold mt-2">$10.2M</p>
                    <p className="text-sm text-gray-600">Total Portfolio Revenue</p>
                    <p className="text-sm text-green-600 mt-1">+20% growth</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-semibold text-blue-600">Efficiency Target</h4>
                    <p className="text-2xl font-bold mt-2">94%</p>
                    <p className="text-sm text-gray-600">Operational Efficiency</p>
                    <p className="text-sm text-blue-600 mt-1">+7% improvement</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-semibold text-purple-600">Synergy Value</h4>
                    <p className="text-2xl font-bold mt-2">$3.1M</p>
                    <p className="text-sm text-gray-600">Cross-Business Benefits</p>
                    <p className="text-sm text-purple-600 mt-1">+26% increase</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Predictive Scenarios</h4>
                  <div className="space-y-3">
                    <div className="p-4 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">Optimistic Scenario (30% probability)</h5>
                        <Badge className="bg-green-100 text-green-800">High Growth</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        All synergies implemented successfully, new market expansion, economic tailwinds
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-semibold text-green-600">$11.8M (+38%)</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Efficiency</p>
                          <p className="font-semibold text-green-600">96%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">ROI</p>
                          <p className="font-semibold text-green-600">385%</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">Base Case Scenario (50% probability)</h5>
                        <Badge className="bg-blue-100 text-blue-800">Steady Growth</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Moderate synergy capture, stable market conditions, expected growth trajectory
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-semibold text-blue-600">$10.2M (+20%)</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Efficiency</p>
                          <p className="font-semibold text-blue-600">94%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">ROI</p>
                          <p className="font-semibold text-blue-600">285%</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">Conservative Scenario (20% probability)</h5>
                        <Badge className="bg-yellow-100 text-yellow-800">Slow Growth</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Limited synergy capture, market headwinds, operational challenges
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-semibold text-yellow-600">$9.1M (+7%)</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Efficiency</p>
                          <p className="font-semibold text-yellow-600">89%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">ROI</p>
                          <p className="font-semibold text-yellow-600">195%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}