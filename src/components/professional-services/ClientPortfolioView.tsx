'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building, TrendingUp, Users, DollarSign, Star, 
  AlertTriangle, Target, Calendar, BarChart3, Crown
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ClientPortfolio {
  id: string
  clientName: string
  relationshipTier: 'STANDARD' | 'PREMIUM' | 'STRATEGIC' | 'VIP'
  accountManagerName: string
  totalProjects: number
  activeProjects: number
  totalRevenue: number
  lifetimeValue: number
  servicesUsed: ServiceUsage[]
  businessesEngaged: string[]
  crossSellScore: number
  satisfactionScore: number
  netPromoterScore: number
  retentionRisk: number
  lastEngagement: string
  expansionOpportunities: Opportunity[]
  estimatedPipeline: number
  recentProjects: RecentProject[]
}

interface ServiceUsage {
  service: string
  count: number
  revenue: number
  lastUsed: string
}

interface Opportunity {
  service: string
  business: string
  confidence: number
  estimatedValue: number
  timeline: string
}

interface RecentProject {
  name: string
  business: string
  status: string
  value: number
  completion: number
}

export function ClientPortfolioView() {
  const [selectedTier, setSelectedTier] = useState('ALL')
  const [clients] = useState<ClientPortfolio[]>([
    {
      id: 'client-1',
      clientName: 'TechCorp Industries',
      relationshipTier: 'STRATEGIC',
      accountManagerName: 'Sarah Johnson',
      totalProjects: 15,
      activeProjects: 3,
      totalRevenue: 1850000,
      lifetimeValue: 2850000,
      servicesUsed: [
        { service: 'Consulting', count: 8, revenue: 1250000, lastUsed: '2024-03-15' },
        { service: 'Legal', count: 4, revenue: 380000, lastUsed: '2024-02-28' },
        { service: 'Accounting', count: 3, revenue: 220000, lastUsed: '2024-01-20' }
      ],
      businessesEngaged: ['Strategic Consulting', 'Legal Partners', 'Accounting Services'],
      crossSellScore: 87,
      satisfactionScore: 4.6,
      netPromoterScore: 9,
      retentionRisk: 15,
      lastEngagement: '2024-03-15',
      expansionOpportunities: [
        {
          service: 'Marketing Strategy',
          business: 'Creative Studio',
          confidence: 78,
          estimatedValue: 320000,
          timeline: 'Q2 2024'
        },
        {
          service: 'Advanced Analytics',
          business: 'Data Sciences',
          confidence: 65,
          estimatedValue: 180000,
          timeline: 'Q3 2024'
        }
      ],
      estimatedPipeline: 500000,
      recentProjects: [
        { name: 'Digital Transformation', business: 'Consulting', status: 'ACTIVE', value: 250000, completion: 65 },
        { name: 'M&A Legal Support', business: 'Legal', status: 'COMPLETED', value: 180000, completion: 100 },
        { name: 'Tax Optimization', business: 'Accounting', status: 'ACTIVE', value: 85000, completion: 40 }
      ]
    },
    {
      id: 'client-2',
      clientName: 'Global Ventures LLC',
      relationshipTier: 'VIP',
      accountManagerName: 'Michael Chen',
      totalProjects: 22,
      activeProjects: 5,
      totalRevenue: 3420000,
      lifetimeValue: 4200000,
      servicesUsed: [
        { service: 'Legal', count: 12, revenue: 1850000, lastUsed: '2024-03-10' },
        { service: 'Consulting', count: 6, revenue: 980000, lastUsed: '2024-03-05' },
        { service: 'Accounting', count: 4, revenue: 590000, lastUsed: '2024-02-15' }
      ],
      businessesEngaged: ['Legal Partners', 'Strategic Consulting', 'Accounting Services'],
      crossSellScore: 92,
      satisfactionScore: 4.8,
      netPromoterScore: 10,
      retentionRisk: 8,
      lastEngagement: '2024-03-10',
      expansionOpportunities: [
        {
          service: 'Marketing & PR',
          business: 'Creative Studio',
          confidence: 85,
          estimatedValue: 450000,
          timeline: 'Q2 2024'
        }
      ],
      estimatedPipeline: 750000,
      recentProjects: [
        { name: 'Merger Documentation', business: 'Legal', status: 'ACTIVE', value: 450000, completion: 45 },
        { name: 'Due Diligence', business: 'Consulting', status: 'ACTIVE', value: 320000, completion: 30 },
        { name: 'Financial Restructuring', business: 'Accounting', status: 'PLANNING', value: 280000, completion: 0 }
      ]
    },
    {
      id: 'client-3',
      clientName: 'Retail Chain Co',
      relationshipTier: 'PREMIUM',
      accountManagerName: 'Emily Rodriguez',
      totalProjects: 8,
      activeProjects: 2,
      totalRevenue: 780000,
      lifetimeValue: 1200000,
      servicesUsed: [
        { service: 'Accounting', count: 5, revenue: 520000, lastUsed: '2024-03-01' },
        { service: 'Consulting', count: 3, revenue: 260000, lastUsed: '2024-01-15' }
      ],
      businessesEngaged: ['Accounting Services', 'Strategic Consulting'],
      crossSellScore: 68,
      satisfactionScore: 4.2,
      netPromoterScore: 7,
      retentionRisk: 25,
      lastEngagement: '2024-03-01',
      expansionOpportunities: [
        {
          service: 'Legal Compliance',
          business: 'Legal Partners',
          confidence: 72,
          estimatedValue: 150000,
          timeline: 'Q3 2024'
        }
      ],
      estimatedPipeline: 220000,
      recentProjects: [
        { name: 'Annual Audit', business: 'Accounting', status: 'ACTIVE', value: 85000, completion: 35 },
        { name: 'Process Optimization', business: 'Consulting', status: 'COMPLETED', value: 120000, completion: 100 }
      ]
    },
    {
      id: 'client-4',
      clientName: 'Fashion Forward Inc',
      relationshipTier: 'STANDARD',
      accountManagerName: 'David Kim',
      totalProjects: 4,
      activeProjects: 2,
      totalRevenue: 350000,
      lifetimeValue: 580000,
      servicesUsed: [
        { service: 'Marketing', count: 3, revenue: 280000, lastUsed: '2024-03-12' },
        { service: 'Legal', count: 1, revenue: 70000, lastUsed: '2024-01-30' }
      ],
      businessesEngaged: ['Creative Studio', 'Legal Partners'],
      crossSellScore: 54,
      satisfactionScore: 4.1,
      netPromoterScore: 6,
      retentionRisk: 35,
      lastEngagement: '2024-03-12',
      expansionOpportunities: [
        {
          service: 'Strategic Planning',
          business: 'Strategic Consulting',
          confidence: 58,
          estimatedValue: 180000,
          timeline: 'Q4 2024'
        }
      ],
      estimatedPipeline: 180000,
      recentProjects: [
        { name: 'Brand Repositioning', business: 'Marketing', status: 'PLANNING', value: 180000, completion: 0 },
        { name: 'Trademark Protection', business: 'Legal', status: 'COMPLETED', value: 45000, completion: 100 }
      ]
    }
  ])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP': return 'bg-purple-100 text-purple-800'
      case 'STRATEGIC': return 'bg-gold-100 text-gold-800 bg-yellow-100 text-yellow-800'
      case 'PREMIUM': return 'bg-blue-100 text-blue-800'
      case 'STANDARD': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'VIP': return <Crown className="h-4 w-4" />
      case 'STRATEGIC': return <Star className="h-4 w-4" />
      case 'PREMIUM': return <Target className="h-4 w-4" />
      case 'STANDARD': return <Users className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk > 30) return 'text-red-600 bg-red-50'
    if (risk > 20) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const portfolioMetrics = {
    totalClients: clients.length,
    totalRevenue: clients.reduce((acc, c) => acc + c.totalRevenue, 0),
    avgLTV: clients.reduce((acc, c) => acc + c.lifetimeValue, 0) / clients.length,
    avgSatisfaction: clients.reduce((acc, c) => acc + c.satisfactionScore, 0) / clients.length,
    totalPipeline: clients.reduce((acc, c) => acc + c.estimatedPipeline, 0),
    highRiskClients: clients.filter(c => c.retentionRisk > 30).length
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Client Portfolio Management</h1>
          <p className="text-gray-600">Cross-business client relationships and growth opportunities</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="ALL">All Clients</option>
            <option value="VIP">VIP</option>
            <option value="STRATEGIC">Strategic</option>
            <option value="PREMIUM">Premium</option>
            <option value="STANDARD">Standard</option>
          </select>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Portfolio Report
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Building className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.totalClients}</p>
              <Building className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">${(portfolioMetrics.totalRevenue / 1000000).toFixed(1)}M</p>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">${(portfolioMetrics.avgLTV / 1000).toFixed(0)}K</p>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.avgSatisfaction.toFixed(1)}</p>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">${(portfolioMetrics.totalPipeline / 1000).toFixed(0)}K</p>
              <Target className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-red-600">{portfolioMetrics.highRiskClients}</p>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">High risk clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Client Cards */}
      <div className="space-y-6">
        {clients
          .filter(client => selectedTier === 'ALL' || client.relationshipTier === selectedTier)
          .map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{client.clientName}</CardTitle>
                          <Badge className={getTierColor(client.relationshipTier)}>
                            {getTierIcon(client.relationshipTier)}
                            <span className="ml-1">{client.relationshipTier}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Account Manager: {client.accountManagerName} • 
                          Last Engagement: {new Date(client.lastEngagement).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold">${(client.totalRevenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">LTV</p>
                        <p className="text-xl font-bold text-green-600">${(client.lifetimeValue / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Retention Risk</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-lg font-bold ${
                            client.retentionRisk > 30 ? 'text-red-600' :
                            client.retentionRisk > 20 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {client.retentionRisk}%
                          </p>
                          {client.retentionRisk > 30 && (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Key Metrics */}
                  <div className="grid md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Active Projects</p>
                      <p className="text-xl font-bold">{client.activeProjects}</p>
                      <p className="text-xs text-gray-500">of {client.totalProjects} total</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Cross-Sell Score</p>
                      <p className="text-xl font-bold text-blue-600">{client.crossSellScore}%</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">Satisfaction</p>
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-xl font-bold">{client.satisfactionScore}</p>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">NPS</p>
                      <p className="text-xl font-bold text-green-600">{client.netPromoterScore}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Pipeline</p>
                      <p className="text-xl font-bold text-purple-600">${(client.estimatedPipeline / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  {/* Services & Businesses Engaged */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Services Used:</p>
                      <div className="space-y-2">
                        {client.servicesUsed.map((service, sIndex) => (
                          <div key={sIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm font-medium">{service.service}</span>
                              <span className="text-xs text-gray-500 ml-2">({service.count} projects)</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">${(service.revenue / 1000).toFixed(0)}K</p>
                              <p className="text-xs text-gray-500">
                                Last: {new Date(service.lastUsed).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Engaged Businesses:</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {client.businessesEngaged.map((business) => (
                          <Badge key={business} variant="outline">
                            {business}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-sm font-medium text-gray-700 mb-2">Recent Projects:</p>
                      <div className="space-y-1">
                        {client.recentProjects.slice(0, 3).map((project, pIndex) => (
                          <div key={pIndex} className="text-xs">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-gray-500"> • {project.business} • </span>
                            <Badge className={
                              project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {project.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expansion Opportunities */}
                  {client.expansionOpportunities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Expansion Opportunities:</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {client.expansionOpportunities.map((opp, oIndex) => (
                          <div key={oIndex} className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-900">{opp.service}</span>
                              <Badge className="bg-green-100 text-green-800">
                                {opp.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-xs text-green-700">{opp.business} • {opp.timeline}</p>
                            <p className="text-sm font-semibold text-green-900 mt-1">
                              ${(opp.estimatedValue / 1000).toFixed(0)}K potential
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Target className="h-4 w-4 mr-2" />
                      Cross-Sell Plan
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                    <Button size="sm" className="flex-1">
                      Manage Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  )
}