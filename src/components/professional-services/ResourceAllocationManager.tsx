'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, Calendar, Clock, TrendingUp, AlertTriangle, 
  Building, Target, DollarSign, BarChart3, Share2
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Resource {
  id: string
  name: string
  role: string
  businessUnit: string
  level: 'JUNIOR' | 'MID' | 'SENIOR' | 'PRINCIPAL'
  hourlyRate: number
  costRate: number
  currentUtilization: number
  targetUtilization: number
  availableHours: number
  allocations: Allocation[]
  skills: string[]
}

interface Allocation {
  projectId: string
  projectName: string
  clientName: string
  allocationPercentage: number
  hours: number
  startDate: string
  endDate: string
  billable: boolean
  crossBusiness: boolean
}

interface UtilizationMetrics {
  resourceId: string
  weeklyUtilization: number[]
  monthlyAverage: number
  quarterlyTrend: 'UP' | 'DOWN' | 'STABLE'
  billableHours: number
  nonBillableHours: number
  revenueGenerated: number
}

export function ResourceAllocationManager() {
  const [selectedPeriod, setSelectedPeriod] = useState('THIS_WEEK')
  const [resources] = useState<Resource[]>([
    {
      id: 'res-1',
      name: 'Sarah Johnson',
      role: 'Senior Consultant',
      businessUnit: 'Strategic Consulting',
      level: 'SENIOR',
      hourlyRate: 285,
      costRate: 125,
      currentUtilization: 92,
      targetUtilization: 85,
      availableHours: 40,
      allocations: [
        {
          projectId: 'proj-1',
          projectName: 'Digital Transformation',
          clientName: 'TechCorp',
          allocationPercentage: 60,
          hours: 24,
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          billable: true,
          crossBusiness: false
        },
        {
          projectId: 'proj-2',
          projectName: 'M&A Support',
          clientName: 'Global Ventures',
          allocationPercentage: 30,
          hours: 12,
          startDate: '2024-02-01',
          endDate: '2024-04-30',
          billable: true,
          crossBusiness: true
        }
      ],
      skills: ['Strategy', 'Digital Transformation', 'Change Management', 'M&A']
    },
    {
      id: 'res-2',
      name: 'Michael Chen',
      role: 'Corporate Attorney',
      businessUnit: 'Legal Partners',
      level: 'PRINCIPAL',
      hourlyRate: 425,
      costRate: 175,
      currentUtilization: 88,
      targetUtilization: 80,
      availableHours: 40,
      allocations: [
        {
          projectId: 'proj-2',
          projectName: 'M&A Support',
          clientName: 'Global Ventures',
          allocationPercentage: 70,
          hours: 28,
          startDate: '2024-02-01',
          endDate: '2024-04-30',
          billable: true,
          crossBusiness: false
        },
        {
          projectId: 'proj-5',
          projectName: 'Contract Review',
          clientName: 'StartupCo',
          allocationPercentage: 20,
          hours: 8,
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          billable: true,
          crossBusiness: false
        }
      ],
      skills: ['M&A', 'Corporate Law', 'Securities', 'Contract Negotiation']
    },
    {
      id: 'res-3',
      name: 'Emily Rodriguez',
      role: 'Senior Accountant',
      businessUnit: 'Accounting Services',
      level: 'SENIOR',
      hourlyRate: 185,
      costRate: 85,
      currentUtilization: 78,
      targetUtilization: 85,
      availableHours: 40,
      allocations: [
        {
          projectId: 'proj-3',
          projectName: 'Annual Audit',
          clientName: 'Retail Chain',
          allocationPercentage: 50,
          hours: 20,
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          billable: true,
          crossBusiness: false
        },
        {
          projectId: 'proj-6',
          projectName: 'Tax Planning',
          clientName: 'Manufacturing Inc',
          allocationPercentage: 25,
          hours: 10,
          startDate: '2024-03-15',
          endDate: '2024-04-15',
          billable: true,
          crossBusiness: false
        }
      ],
      skills: ['Audit', 'Tax Planning', 'Financial Reporting', 'Compliance']
    },
    {
      id: 'res-4',
      name: 'David Kim',
      role: 'Marketing Strategist',
      businessUnit: 'Creative Studio',
      level: 'MID',
      hourlyRate: 165,
      costRate: 75,
      currentUtilization: 65,
      targetUtilization: 80,
      availableHours: 40,
      allocations: [
        {
          projectId: 'proj-4',
          projectName: 'Brand Repositioning',
          clientName: 'Fashion Forward',
          allocationPercentage: 40,
          hours: 16,
          startDate: '2024-04-01',
          endDate: '2024-08-31',
          billable: true,
          crossBusiness: false
        },
        {
          projectId: 'proj-7',
          projectName: 'Digital Campaign',
          clientName: 'E-Commerce Plus',
          allocationPercentage: 20,
          hours: 8,
          startDate: '2024-03-20',
          endDate: '2024-05-20',
          billable: true,
          crossBusiness: false
        }
      ],
      skills: ['Brand Strategy', 'Digital Marketing', 'Campaign Management', 'Analytics']
    }
  ])

  const [utilizationMetrics] = useState<UtilizationMetrics[]>([
    {
      resourceId: 'res-1',
      weeklyUtilization: [88, 92, 90, 94, 92],
      monthlyAverage: 91,
      quarterlyTrend: 'UP',
      billableHours: 148,
      nonBillableHours: 12,
      revenueGenerated: 42180
    },
    {
      resourceId: 'res-2',
      weeklyUtilization: [85, 88, 90, 88, 87],
      monthlyAverage: 88,
      quarterlyTrend: 'STABLE',
      billableHours: 140,
      nonBillableHours: 20,
      revenueGenerated: 59500
    }
  ])

  const getUtilizationColor = (utilization: number, target: number) => {
    if (utilization > 100) return 'text-red-600 bg-red-50'
    if (utilization > target + 10) return 'text-yellow-600 bg-yellow-50'
    if (utilization >= target - 5) return 'text-green-600 bg-green-50'
    return 'text-blue-600 bg-blue-50'
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'PRINCIPAL': return 'bg-purple-100 text-purple-800'
      case 'SENIOR': return 'bg-blue-100 text-blue-800'
      case 'MID': return 'bg-green-100 text-green-800'
      case 'JUNIOR': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalMetrics = {
    totalResources: resources.length,
    avgUtilization: resources.reduce((acc, r) => acc + r.currentUtilization, 0) / resources.length,
    billableHours: resources.reduce((acc, r) => 
      acc + r.allocations.filter(a => a.billable).reduce((sum, a) => sum + a.hours, 0), 0
    ),
    crossBusinessAllocations: resources.reduce((acc, r) => 
      acc + r.allocations.filter(a => a.crossBusiness).length, 0
    ),
    totalRevenuePotential: resources.reduce((acc, r) => 
      acc + r.allocations.filter(a => a.billable).reduce((sum, a) => sum + (a.hours * r.hourlyRate), 0), 0
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resource Allocation Manager</h1>
          <p className="text-gray-600">Cross-business resource optimization and utilization tracking</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="THIS_WEEK">This Week</option>
            <option value="NEXT_WEEK">Next Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_QUARTER">This Quarter</option>
          </select>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Resources
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Users className="h-4 w-4 mr-2" />
            Allocate Resource
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalMetrics.totalResources}</p>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Across 4 businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalMetrics.avgUtilization.toFixed(0)}%</p>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-green-600 mt-1">+3% vs target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Billable Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalMetrics.billableHours}</p>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Cross-Business</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalMetrics.crossBusinessAllocations}</p>
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Shared allocations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">${(totalMetrics.totalRevenuePotential / 1000).toFixed(0)}K</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Cards */}
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-700">
                        {resource.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{resource.role}</span>
                        <Badge className={getLevelBadge(resource.level)}>
                          {resource.level}
                        </Badge>
                        <span className="text-sm text-gray-500">• {resource.businessUnit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Utilization</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-xl font-bold ${
                          resource.currentUtilization > 100 ? 'text-red-600' :
                          resource.currentUtilization > 90 ? 'text-yellow-600' :
                          resource.currentUtilization > 70 ? 'text-green-600' :
                          'text-blue-600'
                        }`}>
                          {resource.currentUtilization}%
                        </p>
                        {resource.currentUtilization > resource.targetUtilization + 10 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Target: {resource.targetUtilization}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Bill Rate</p>
                      <p className="text-lg font-bold">${resource.hourlyRate}/hr</p>
                      <p className="text-xs text-gray-500">Cost: ${resource.costRate}/hr</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Skills */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills & Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Current Allocations */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Allocations:</p>
                  <div className="space-y-2">
                    {resource.allocations.map((allocation, aIndex) => (
                      <div key={aIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-2 h-12 bg-purple-500 rounded-full" 
                               style={{ opacity: allocation.allocationPercentage / 100 }} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{allocation.projectName}</p>
                              {allocation.crossBusiness && (
                                <Badge variant="outline" className="text-xs">
                                  Cross-Business
                                </Badge>
                              )}
                              {!allocation.billable && (
                                <Badge variant="secondary" className="text-xs">
                                  Non-Billable
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{allocation.clientName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(allocation.startDate).toLocaleDateString()} - {new Date(allocation.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{allocation.allocationPercentage}%</p>
                          <p className="text-xs text-gray-600">{allocation.hours} hrs/wk</p>
                          {allocation.billable && (
                            <p className="text-xs text-green-600">
                              ${(allocation.hours * resource.hourlyRate).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Unallocated Time */}
                  {resource.currentUtilization < 100 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <p className="text-sm text-blue-900">Available Capacity</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-900">
                            {100 - resource.currentUtilization}%
                          </p>
                          <p className="text-xs text-blue-700">
                            {Math.round(resource.availableHours * (100 - resource.currentUtilization) / 100)} hrs/wk
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Utilization Trend */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Weekly Utilization Trend</p>
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Last 5 weeks
                    </Badge>
                  </div>
                  <div className="flex items-end gap-1 mt-2 h-12">
                    {[88, 92, 90, 94, resource.currentUtilization].map((util, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full rounded-t ${
                            util > 100 ? 'bg-red-500' :
                            util > 90 ? 'bg-yellow-500' :
                            util > 70 ? 'bg-green-500' :
                            'bg-blue-500'
                          }`}
                          style={{ height: `${(util / 100) * 48}px` }}
                        />
                        <span className="text-xs text-gray-500 mt-1">W{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Time Tracking
                  </Button>
                  <Button size="sm" className="flex-1">
                    Reallocate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Optimization Suggestions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>AI Resource Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Cross-Training Opportunity</p>
                <p className="text-sm text-green-700 mt-1">
                  David Kim (65% utilized) has digital marketing skills that could support 
                  Sarah Johnson&apos;s Digital Transformation project. Allocating 15% would optimize 
                  both resources and save $12K in external consultant fees.
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  Apply Suggestion
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Over-Utilization Risk</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Sarah Johnson at 92% utilization with critical project dependencies. 
                  Consider redistributing 10% of workload to prevent burnout and maintain quality.
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  Rebalance Workload
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}