'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TrendingUp, Users, Building2, DollarSign, Target,
  Activity, Award, Zap, AlertCircle, CheckCircle,
  Timer, Briefcase, Globe, Star, BarChart3,
  Brain, Rocket, Filter, Download, RefreshCw
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts'

export default function MultiBusinessLeadScoring() {
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [filterScore, setFilterScore] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Mock lead data with multi-business indicators
  const leads = [
    {
      id: 'L001',
      name: 'John Anderson',
      company: 'Anderson Enterprises',
      email: 'john@andersonenterprises.com',
      score: 92,
      grade: 'A+',
      status: 'hot',
      businesses: 4,
      industries: ['HVAC', 'Plumbing', 'Electrical', 'Construction'],
      annualRevenue: 8500000,
      employees: 125,
      engagement: {
        websiteVisits: 45,
        emailOpens: 12,
        contentDownloads: 8,
        demoRequests: 2
      },
      multiBusinessSignals: {
        portfolioMentions: true,
        crossBusinessNeeds: true,
        consolidationInterest: true,
        scalingChallenges: true
      },
      predictedValue: 185000,
      conversionProbability: 0.89,
      timeToClose: 21,
      nextBestAction: 'Schedule portfolio demo'
    },
    {
      id: 'L002',
      name: 'Sarah Mitchell',
      company: 'Mitchell Group Holdings',
      email: 'sarah@mitchellgroup.com',
      score: 85,
      grade: 'A',
      status: 'warm',
      businesses: 3,
      industries: ['Professional Services', 'Consulting', 'Marketing'],
      annualRevenue: 5200000,
      employees: 78,
      engagement: {
        websiteVisits: 28,
        emailOpens: 8,
        contentDownloads: 5,
        demoRequests: 1
      },
      multiBusinessSignals: {
        portfolioMentions: true,
        crossBusinessNeeds: false,
        consolidationInterest: true,
        scalingChallenges: false
      },
      predictedValue: 125000,
      conversionProbability: 0.72,
      timeToClose: 35,
      nextBestAction: 'Send progressive pricing calculator'
    },
    {
      id: 'L003',
      name: 'Michael Chen',
      company: 'Chen Ventures',
      email: 'michael@chenventures.com',
      score: 78,
      grade: 'B+',
      status: 'warm',
      businesses: 6,
      industries: ['Retail', 'E-commerce', 'Distribution', 'Manufacturing', 'Logistics', 'Wholesale'],
      annualRevenue: 12000000,
      employees: 200,
      engagement: {
        websiteVisits: 22,
        emailOpens: 6,
        contentDownloads: 3,
        demoRequests: 0
      },
      multiBusinessSignals: {
        portfolioMentions: false,
        crossBusinessNeeds: true,
        consolidationInterest: false,
        scalingChallenges: true
      },
      predictedValue: 225000,
      conversionProbability: 0.65,
      timeToClose: 45,
      nextBestAction: 'Nurture with case studies'
    },
    {
      id: 'L004',
      name: 'Emily Rodriguez',
      company: 'Rodriguez Family Businesses',
      email: 'emily@rodriguezfb.com',
      score: 95,
      grade: 'A+',
      status: 'hot',
      businesses: 5,
      industries: ['Restaurant', 'Hospitality', 'Real Estate', 'Property Management', 'Catering'],
      annualRevenue: 15000000,
      employees: 350,
      engagement: {
        websiteVisits: 67,
        emailOpens: 18,
        contentDownloads: 12,
        demoRequests: 3
      },
      multiBusinessSignals: {
        portfolioMentions: true,
        crossBusinessNeeds: true,
        consolidationInterest: true,
        scalingChallenges: true
      },
      predictedValue: 350000,
      conversionProbability: 0.94,
      timeToClose: 14,
      nextBestAction: 'Executive meeting ASAP'
    },
    {
      id: 'L005',
      name: 'David Thompson',
      company: 'Thompson Industries',
      email: 'david@thompsonind.com',
      score: 62,
      grade: 'C+',
      status: 'cold',
      businesses: 2,
      industries: ['Manufacturing', 'Distribution'],
      annualRevenue: 3200000,
      employees: 45,
      engagement: {
        websiteVisits: 8,
        emailOpens: 2,
        contentDownloads: 1,
        demoRequests: 0
      },
      multiBusinessSignals: {
        portfolioMentions: false,
        crossBusinessNeeds: false,
        consolidationInterest: false,
        scalingChallenges: false
      },
      predictedValue: 45000,
      conversionProbability: 0.35,
      timeToClose: 90,
      nextBestAction: 'Add to nurture campaign'
    }
  ]

  const scoringFactors = {
    businessCount: {
      weight: 25,
      label: 'Number of Businesses',
      description: 'More businesses = higher score'
    },
    revenue: {
      weight: 20,
      label: 'Annual Revenue',
      description: 'Combined revenue across businesses'
    },
    engagement: {
      weight: 20,
      label: 'Engagement Level',
      description: 'Website visits, content, demos'
    },
    multiBusinessSignals: {
      weight: 15,
      label: 'Multi-Business Signals',
      description: 'Portfolio mentions, consolidation interest'
    },
    companySize: {
      weight: 10,
      label: 'Company Size',
      description: 'Total employees across businesses'
    },
    industryFit: {
      weight: 10,
      label: 'Industry Fit',
      description: 'Match with our strengths'
    }
  }

  const scoreDistribution = [
    { range: '0-20', count: 2, label: 'Very Cold' },
    { range: '21-40', count: 5, label: 'Cold' },
    { range: '41-60', count: 12, label: 'Cool' },
    { range: '61-80', count: 28, label: 'Warm' },
    { range: '81-100', count: 15, label: 'Hot' }
  ]

  const engagementTrend = [
    { day: 'Mon', visits: 145, leads: 12, qualified: 5 },
    { day: 'Tue', visits: 189, leads: 18, qualified: 8 },
    { day: 'Wed', visits: 234, leads: 24, qualified: 11 },
    { day: 'Thu', visits: 198, leads: 15, qualified: 7 },
    { day: 'Fri', visits: 267, leads: 28, qualified: 14 },
    { day: 'Sat', visits: 123, leads: 8, qualified: 3 },
    { day: 'Sun', visits: 98, leads: 5, qualified: 2 }
  ]

  const industryScores = [
    { industry: 'HVAC & Field Service', avgScore: 82, leads: 45 },
    { industry: 'Professional Services', avgScore: 78, leads: 38 },
    { industry: 'Construction & Trades', avgScore: 75, leads: 32 },
    { industry: 'Retail & E-commerce', avgScore: 72, leads: 28 },
    { industry: 'Hospitality', avgScore: 70, leads: 22 },
    { industry: 'Manufacturing', avgScore: 68, leads: 18 }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'hot': return <Zap className="w-4 h-4 text-red-500" />
      case 'warm': return <Activity className="w-4 h-4 text-yellow-500" />
      case 'cold': return <Timer className="w-4 h-4 text-blue-500" />
      default: return null
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRefreshing(false)
  }

  const filteredLeads = filterScore === 'all' 
    ? leads 
    : filterScore === 'hot' 
    ? leads.filter(l => l.score >= 80)
    : filterScore === 'warm'
    ? leads.filter(l => l.score >= 60 && l.score < 80)
    : leads.filter(l => l.score < 60)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Multi-Business Lead Scoring</h1>
            <p className="opacity-90">AI-powered lead qualification for portfolio entrepreneurs</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Scores
            </Button>
            <Button variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export Leads
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <Zap className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">72.5</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Multi-Biz</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold">$2.8M</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="leads">Lead Dashboard</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Model</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        {/* Leads Dashboard Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scored Leads</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={filterScore === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterScore('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={filterScore === 'hot' ? 'default' : 'outline'}
                    onClick={() => setFilterScore('hot')}
                  >
                    Hot (80+)
                  </Button>
                  <Button
                    size="sm"
                    variant={filterScore === 'warm' ? 'default' : 'outline'}
                    onClick={() => setFilterScore('warm')}
                  >
                    Warm (60-79)
                  </Button>
                  <Button
                    size="sm"
                    variant={filterScore === 'cold' ? 'default' : 'outline'}
                    onClick={() => setFilterScore('cold')}
                  >
                    Cold (<60)
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div 
                    key={lead.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{lead.name}</h3>
                          <Badge className={getGradeColor(lead.grade)}>{lead.grade}</Badge>
                          {getStatusIcon(lead.status)}
                          {lead.businesses >= 4 && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              <Building2 className="w-3 h-3 mr-1" />
                              Portfolio
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Company</p>
                            <p className="font-medium">{lead.company}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Businesses</p>
                            <p className="font-medium">{lead.businesses} entities</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-medium">${(lead.annualRevenue / 1000000).toFixed(1)}M</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Predicted Value</p>
                            <p className="font-medium">${(lead.predictedValue / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Progress value={lead.conversionProbability * 100} className="w-24 h-2" />
                            <span className="text-xs text-gray-600">
                              {(lead.conversionProbability * 100).toFixed(0)}% conversion
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {lead.timeToClose} days to close
                          </span>
                        </div>
                      </div>
                      <div className="text-center ml-4">
                        <div className={`text-3xl font-bold ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </div>
                        <p className="text-xs text-gray-600">Lead Score</p>
                        <Button size="sm" className="mt-2">
                          {lead.nextBestAction}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Model Tab */}
        <TabsContent value="scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Business Scoring Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    Our AI model prioritizes leads with multiple businesses, using 50+ signals to predict 
                    conversion probability and lifetime value. Portfolio entrepreneurs score 2.5x higher on average.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Scoring Factors & Weights</h3>
                    <div className="space-y-3">
                      {Object.entries(scoringFactors).map(([key, factor]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="font-medium">{factor.label}</p>
                            <p className="text-sm text-gray-600">{factor.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{factor.weight}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6">
                          {scoreDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                index === 4 ? '#10b981' : 
                                index === 3 ? '#f59e0b' :
                                index === 2 ? '#3b82f6' :
                                '#6b7280'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Multi-Business Indicators</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-purple-50 rounded text-center">
                      <Building2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Portfolio Mentions</p>
                      <p className="text-xs text-gray-600">+15 points</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded text-center">
                      <Globe className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Cross-Business Needs</p>
                      <p className="text-xs text-gray-600">+12 points</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded text-center">
                      <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Consolidation Interest</p>
                      <p className="text-xs text-gray-600">+18 points</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded text-center">
                      <TrendingUp className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Scaling Challenges</p>
                      <p className="text-xs text-gray-600">+10 points</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#8b5cf6" name="Visits" />
                    <Line type="monotone" dataKey="leads" stroke="#10b981" name="Leads" />
                    <Line type="monotone" dataKey="qualified" stroke="#f59e0b" name="Qualified" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {industryScores.map((industry, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{industry.industry}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={industry.avgScore} className="flex-1 h-2" />
                          <span className="text-xs text-gray-600 w-10">{industry.avgScore}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-3">
                        {industry.leads} leads
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel - Multi-Business vs Single</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-3 text-center">Multi-Business (3+ entities)</h4>
                  <div className="space-y-2">
                    <div className="bg-purple-100 p-3 rounded text-center">
                      <p className="font-semibold">100 Leads</p>
                    </div>
                    <div className="bg-purple-200 p-3 rounded text-center" style={{width: '85%', margin: '0 auto'}}>
                      <p className="font-semibold">45 Qualified (45%)</p>
                    </div>
                    <div className="bg-purple-300 p-3 rounded text-center" style={{width: '70%', margin: '0 auto'}}>
                      <p className="font-semibold">28 Opportunities (62%)</p>
                    </div>
                    <div className="bg-purple-400 p-3 rounded text-center" style={{width: '55%', margin: '0 auto'}}>
                      <p className="font-semibold">18 Proposals (64%)</p>
                    </div>
                    <div className="bg-purple-500 text-white p-3 rounded text-center" style={{width: '40%', margin: '0 auto'}}>
                      <p className="font-semibold">12 Closed (67%)</p>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-purple-600">12%</p>
                    <p className="text-sm text-gray-600">Avg Deal: $125K</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-center">Single Business</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-100 p-3 rounded text-center">
                      <p className="font-semibold">100 Leads</p>
                    </div>
                    <div className="bg-gray-200 p-3 rounded text-center" style={{width: '70%', margin: '0 auto'}}>
                      <p className="font-semibold">25 Qualified (25%)</p>
                    </div>
                    <div className="bg-gray-300 p-3 rounded text-center" style={{width: '50%', margin: '0 auto'}}>
                      <p className="font-semibold">10 Opportunities (40%)</p>
                    </div>
                    <div className="bg-gray-400 p-3 rounded text-center" style={{width: '35%', margin: '0 auto'}}>
                      <p className="font-semibold">5 Proposals (50%)</p>
                    </div>
                    <div className="bg-gray-500 text-white p-3 rounded text-center" style={{width: '20%', margin: '0 auto'}}>
                      <p className="font-semibold">2 Closed (40%)</p>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-600">2%</p>
                    <p className="text-sm text-gray-600">Avg Deal: $35K</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Scoring Automation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <Rocket className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Automation is active. 247 leads scored, 68 actions triggered this week.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Hot Lead Alert (Score 80+)</h4>
                      <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      When a lead scores 80 or higher with 3+ businesses
                    </p>
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Notify sales team immediately</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Create high-priority task in CRM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Send portfolio demo invitation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Assign to senior account executive</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Progressive Pricing Qualifier</h4>
                      <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      When a lead has 4+ businesses and visits pricing page
                    </p>
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Send progressive pricing calculator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Show savings comparison chart</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Trigger portfolio case study email</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Engagement Nurture Track</h4>
                      <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      When a lead scores 40-79 with multi-business signals
                    </p>
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Add to multi-business nurture campaign</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Send weekly portfolio tips newsletter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Invite to entrepreneur webinars</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Re-engagement Campaign</h4>
                      <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Paused</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      When a lead score drops below 40 after 30 days
                    </p>
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-sm opacity-60">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <span>Send re-engagement email series</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <span>Offer free consultation</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Zap className="w-4 h-4 mr-2" />
                    Create New Automation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedLead.name} - Lead Intelligence</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedLead(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Lead Score</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-2xl font-bold ${getScoreColor(selectedLead.score)}`}>
                        {selectedLead.score}
                      </p>
                      <Badge className={getGradeColor(selectedLead.grade)}>{selectedLead.grade}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversion Probability</p>
                    <p className="text-2xl font-bold">{(selectedLead.conversionProbability * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Business Portfolio</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.industries.map((industry: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{industry}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Multi-Business Signals</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedLead.multiBusinessSignals).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Engagement Metrics</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-600">Website Visits</p>
                      <p className="font-semibold">{selectedLead.engagement.websiteVisits}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-600">Email Opens</p>
                      <p className="font-semibold">{selectedLead.engagement.emailOpens}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-600">Content Downloads</p>
                      <p className="font-semibold">{selectedLead.engagement.contentDownloads}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-600">Demo Requests</p>
                      <p className="font-semibold">{selectedLead.engagement.demoRequests}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Recommended Action</p>
                  <Button className="w-full">
                    {selectedLead.nextBestAction}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}