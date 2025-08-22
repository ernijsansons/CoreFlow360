'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Briefcase, Users, DollarSign, Building, BarChart3, 
  TrendingUp, Clock, Target, Settings, AlertCircle
} from 'lucide-react'
import { ProjectPortfolioDashboard } from './ProjectPortfolioDashboard'
import { ResourceAllocationManager } from './ResourceAllocationManager'
import { BillingRateManager } from './BillingRateManager'
import { ClientPortfolioView } from './ClientPortfolioView'
import { motion } from 'framer-motion'

interface PortfolioMetrics {
  totalProjects: number
  activeProjects: number
  totalRevenue: number
  avgProfitMargin: number
  totalResources: number
  avgUtilization: number
  totalClients: number
  crossBusinessProjects: number
}

export function ProfessionalServicesDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const [portfolioMetrics] = useState<PortfolioMetrics>({
    totalProjects: 47,
    activeProjects: 28,
    totalRevenue: 8450000,
    avgProfitMargin: 38.5,
    totalResources: 65,
    avgUtilization: 81,
    totalClients: 42,
    crossBusinessProjects: 15
  })

  const [businessUnits] = useState([
    {
      name: 'Strategic Consulting',
      projects: 12,
      revenue: 2850000,
      utilization: 78,
      margin: 42
    },
    {
      name: 'Corporate Law',
      projects: 8,
      revenue: 3200000,
      utilization: 92,
      margin: 48
    },
    {
      name: 'Accounting Services',
      projects: 15,
      revenue: 1450000,
      utilization: 85,
      margin: 28
    },
    {
      name: 'Creative Studio',
      projects: 6,
      revenue: 950000,
      utilization: 68,
      margin: 35
    }
  ])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Professional Services Portfolio</h1>
          <p className="text-gray-600">Integrated multi-business professional services management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Portfolio Analytics
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{portfolioMetrics.activeProjects}</p>
                    <p className="text-xs text-gray-500">of {portfolioMetrics.totalProjects} total</p>
                  </div>
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Portfolio Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">${(portfolioMetrics.totalRevenue / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-green-600">+18% vs target</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{portfolioMetrics.avgUtilization}%</p>
                    <p className="text-xs text-gray-500">{portfolioMetrics.totalResources} professionals</p>
                  </div>
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{portfolioMetrics.avgProfitMargin}%</p>
                    <p className="text-xs text-green-600">Above target</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Units Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {businessUnits.map((unit, index) => (
              <motion.div
                key={unit.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">{unit.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Projects</span>
                        <span className="font-medium">{unit.projects}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-medium">${(unit.revenue / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Margin</span>
                        <span className="font-medium">{unit.margin}%</span>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Utilization</span>
                          <span className="text-xs font-medium">{unit.utilization}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              unit.utilization > 85 
                                ? 'bg-yellow-500' 
                                : unit.utilization > 70 
                                ? 'bg-green-500' 
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${unit.utilization}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Cross-Business Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Optimization Insights</CardTitle>
                <Badge variant="outline">
                  <Building className="h-3 w-3 mr-1" />
                  {portfolioMetrics.crossBusinessProjects} Cross-Business Projects
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Resource Optimization Opportunity</p>
                    <p className="text-sm text-green-700 mt-1">
                      Legal team has 15% excess capacity while Consulting is at 78% utilization. 
                      Cross-training 2 attorneys on strategy work could increase portfolio efficiency by 12%.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm">Apply Optimization</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Cross-Sell Opportunity</p>
                    <p className="text-sm text-blue-700 mt-1">
                      TechCorp Industries (Consulting + Legal client) showing 87% probability for 
                      Marketing services. Estimated value: $320K. Account manager should schedule presentation.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">View Client</Button>
                      <Button size="sm">Schedule Meeting</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Rate Optimization Alert</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Creative Studio rates are 22% below market average. Gradual increase over 
                      next 2 quarters could improve margins by 8% without client churn risk.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">Market Analysis</Button>
                      <Button size="sm">Review Rates</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Building className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Briefcase className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Users className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="rates">
            <DollarSign className="h-4 w-4 mr-2" />
            Billing Rates
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Target className="h-4 w-4 mr-2" />
            Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Overview content is rendered above */}
        </TabsContent>

        <TabsContent value="projects">
          <ProjectPortfolioDashboard />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceAllocationManager />
        </TabsContent>

        <TabsContent value="rates">
          <BillingRateManager />
        </TabsContent>

        <TabsContent value="clients">
          <ClientPortfolioView />
        </TabsContent>
      </Tabs>
    </div>
  )
}