'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, Users, DollarSign, TrendingUp, Clock, 
  AlertCircle, Building, Target, Calendar, BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Project {
  id: string
  projectCode: string
  projectName: string
  clientName: string
  businessName: string
  projectType: 'CONSULTING' | 'LEGAL' | 'ACCOUNTING' | 'MARKETING' | 'DESIGN'
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  startDate: string
  endDate: string
  completionRate: number
  budgetAmount: number
  actualSpend: number
  billedAmount: number
  profitMargin: number
  teamSize: number
  allocatedHours: number
  actualHours: number
  sharedResources: boolean
  crossBillings: boolean
}

interface BusinessUnit {
  id: string
  name: string
  type: string
  activeProjects: number
  totalRevenue: number
  utilizationRate: number
  teamSize: number
}

export function ProjectPortfolioDashboard() {
  const [projects] = useState<Project[]>([
    {
      id: 'proj-1',
      projectCode: 'CONS-2024-001',
      projectName: 'Digital Transformation Strategy',
      clientName: 'TechCorp Industries',
      businessName: 'Strategic Consulting Group',
      projectType: 'CONSULTING',
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      completionRate: 65,
      budgetAmount: 250000,
      actualSpend: 162500,
      billedAmount: 195000,
      profitMargin: 32.5,
      teamSize: 5,
      allocatedHours: 2000,
      actualHours: 1300,
      sharedResources: true,
      crossBillings: false
    },
    {
      id: 'proj-2',
      projectCode: 'LEG-2024-045',
      projectName: 'Merger & Acquisition Support',
      clientName: 'Global Ventures LLC',
      businessName: 'Corporate Law Partners',
      projectType: 'LEGAL',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      completionRate: 45,
      budgetAmount: 450000,
      actualSpend: 202500,
      billedAmount: 270000,
      profitMargin: 40.0,
      teamSize: 8,
      allocatedHours: 1800,
      actualHours: 810,
      sharedResources: true,
      crossBillings: true
    },
    {
      id: 'proj-3',
      projectCode: 'ACC-2024-112',
      projectName: 'Annual Audit & Tax Planning',
      clientName: 'Retail Chain Co',
      businessName: 'Premier Accounting Services',
      projectType: 'ACCOUNTING',
      status: 'ACTIVE',
      priority: 'NORMAL',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      completionRate: 35,
      budgetAmount: 85000,
      actualSpend: 29750,
      billedAmount: 38250,
      profitMargin: 28.5,
      teamSize: 3,
      allocatedHours: 680,
      actualHours: 238,
      sharedResources: false,
      crossBillings: false
    },
    {
      id: 'proj-4',
      projectCode: 'MKT-2024-023',
      projectName: 'Brand Repositioning Campaign',
      clientName: 'Fashion Forward Inc',
      businessName: 'Creative Marketing Studio',
      projectType: 'MARKETING',
      status: 'PLANNING',
      priority: 'HIGH',
      startDate: '2024-04-01',
      endDate: '2024-08-31',
      completionRate: 0,
      budgetAmount: 180000,
      actualSpend: 0,
      billedAmount: 0,
      profitMargin: 0,
      teamSize: 6,
      allocatedHours: 1440,
      actualHours: 0,
      sharedResources: true,
      crossBillings: false
    }
  ])

  const [businessUnits] = useState<BusinessUnit[]>([
    {
      id: 'bu-1',
      name: 'Strategic Consulting Group',
      type: 'CONSULTING',
      activeProjects: 12,
      totalRevenue: 2850000,
      utilizationRate: 78,
      teamSize: 25
    },
    {
      id: 'bu-2',
      name: 'Corporate Law Partners',
      type: 'LEGAL',
      activeProjects: 8,
      totalRevenue: 3200000,
      utilizationRate: 92,
      teamSize: 18
    },
    {
      id: 'bu-3',
      name: 'Premier Accounting Services',
      type: 'ACCOUNTING',
      activeProjects: 15,
      totalRevenue: 1450000,
      utilizationRate: 85,
      teamSize: 12
    },
    {
      id: 'bu-4',
      name: 'Creative Marketing Studio',
      type: 'MARKETING',
      activeProjects: 6,
      totalRevenue: 980000,
      utilizationRate: 68,
      teamSize: 10
    }
  ])

  const portfolioMetrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
    totalRevenue: projects.reduce((acc, p) => acc + p.billedAmount, 0),
    totalBudget: projects.reduce((acc, p) => acc + p.budgetAmount, 0),
    avgProfitMargin: projects.reduce((acc, p) => acc + p.profitMargin, 0) / projects.length,
    totalTeamMembers: businessUnits.reduce((acc, bu) => acc + bu.teamSize, 0),
    avgUtilization: businessUnits.reduce((acc, bu) => acc + bu.utilizationRate, 0) / businessUnits.length,
    crossBusinessProjects: projects.filter(p => p.sharedResources || p.crossBillings).length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PLANNING': return 'bg-blue-100 text-blue-800'
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'NORMAL': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CONSULTING': return '🎯'
      case 'LEGAL': return '⚖️'
      case 'ACCOUNTING': return '📊'
      case 'MARKETING': return '📢'
      case 'DESIGN': return '🎨'
      default: return '💼'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Professional Services Portfolio</h1>
          <p className="text-gray-600">Cross-business project and resource management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Resource Calendar
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Briefcase className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
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
                <p className="text-2xl font-bold">${(portfolioMetrics.totalRevenue / 1000).toFixed(0)}K</p>
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
                <p className="text-2xl font-bold">{portfolioMetrics.avgUtilization.toFixed(0)}%</p>
                <p className="text-xs text-gray-500">{portfolioMetrics.totalTeamMembers} professionals</p>
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
                <p className="text-2xl font-bold">{portfolioMetrics.avgProfitMargin.toFixed(1)}%</p>
                <p className="text-xs text-green-600">Above target</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Units Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {businessUnits.map((unit, index) => (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{unit.name}</CardTitle>
                  <span className="text-lg">{getTypeIcon(unit.type)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Projects</span>
                    <span className="font-medium">{unit.activeProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-medium">${(unit.totalRevenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Team</span>
                    <span className="font-medium">{unit.teamSize} people</span>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Utilization</span>
                      <span className="text-xs font-medium">{unit.utilizationRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          unit.utilizationRate > 85 
                            ? 'bg-yellow-500' 
                            : unit.utilizationRate > 70 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${unit.utilizationRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Project List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Projects</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Building className="h-3 w-3 mr-1" />
                {portfolioMetrics.crossBusinessProjects} Cross-Business
              </Badge>
              <Button size="sm" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getTypeIcon(project.projectType)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{project.projectName}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                          {project.sharedResources && (
                            <Badge variant="outline" className="text-xs">
                              Shared Resources
                            </Badge>
                          )}
                          {project.crossBillings && (
                            <Badge variant="outline" className="text-xs">
                              Cross-Billing
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {project.projectCode} • {project.clientName} • {project.businessName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-6 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Timeline</p>
                        <p className="text-sm font-medium">
                          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="text-sm font-medium">${(project.budgetAmount / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Spent</p>
                        <p className="text-sm font-medium">${(project.actualSpend / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Billed</p>
                        <p className="text-sm font-medium text-green-600">
                          ${(project.billedAmount / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Team</p>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-sm font-medium">{project.teamSize}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hours</p>
                        <p className="text-sm font-medium">
                          {project.actualHours}/{project.allocatedHours}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Completion</span>
                        <span className="text-xs font-medium">{project.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${project.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <p className="text-xs text-gray-500">Margin</p>
                    <p className={`text-lg font-bold ${
                      project.profitMargin > 35 ? 'text-green-600' : 
                      project.profitMargin > 25 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {project.profitMargin.toFixed(1)}%
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Allocate</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Business Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Portfolio Optimization Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Resource Sharing Opportunity</p>
                <p className="text-sm text-green-700 mt-1">
                  Legal team has 15% excess capacity. Consider allocating 2 attorneys to support 
                  the M&A project for Strategic Consulting, saving $45K in external counsel fees.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Utilization Alert</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Marketing Studio at 68% utilization. Consider cross-training accounting staff 
                  on basic design tools to handle overflow during peak periods.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Cross-Sell Opportunity</p>
                <p className="text-sm text-blue-700 mt-1">
                  TechCorp Industries (Consulting client) may benefit from accounting services. 
                  87% probability based on similar client profiles. Potential value: $120K/year.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}