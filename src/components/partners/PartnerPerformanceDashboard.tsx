'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp, TrendingDown, DollarSign, Users, Award,
  Target, Calendar, BarChart3, Activity, Clock,
  CheckCircle, AlertCircle, Star, Trophy, Zap,
  ArrowUp, ArrowDown, Minus, Gift, HandshakeIcon
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

export default function PartnerPerformanceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Mock data - would come from API
  const partnerInfo = {
    name: 'TechSolutions Inc.',
    tier: 'Gold',
    tierColor: 'bg-yellow-500',
    joinDate: '2024-01-15',
    certifiedStaff: 8,
    activeDeals: 12,
    totalClients: 45
  }

  const performanceMetrics = {
    revenue: {
      current: 125000,
      previous: 98000,
      change: 27.55,
      target: 150000
    },
    deals: {
      current: 15,
      previous: 11,
      change: 36.36,
      target: 20
    },
    clients: {
      current: 8,
      previous: 6,
      change: 33.33,
      target: 10
    },
    satisfaction: {
      current: 4.8,
      previous: 4.6,
      change: 4.35,
      target: 4.5
    }
  }

  const revenueData = [
    { month: 'Jan', revenue: 45000, commission: 9000, target: 50000 },
    { month: 'Feb', revenue: 52000, commission: 10400, target: 55000 },
    { month: 'Mar', revenue: 68000, commission: 13600, target: 60000 },
    { month: 'Apr', revenue: 75000, commission: 15000, target: 70000 },
    { month: 'May', revenue: 98000, commission: 19600, target: 85000 },
    { month: 'Jun', revenue: 125000, commission: 25000, target: 100000 }
  ]

  const dealPipeline = [
    { stage: 'Prospecting', count: 25, value: 375000 },
    { stage: 'Qualification', count: 18, value: 324000 },
    { stage: 'Proposal', count: 12, value: 240000 },
    { stage: 'Negotiation', count: 8, value: 176000 },
    { stage: 'Closed Won', count: 6, value: 125000 }
  ]

  const clientDistribution = [
    { name: 'HVAC', value: 35, color: '#0ea5e9' },
    { name: 'Professional Services', value: 25, color: '#8b5cf6' },
    { name: 'Construction', value: 20, color: '#10b981' },
    { name: 'Retail', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#6b7280' }
  ]

  const skillsRadar = [
    { skill: 'Sales', score: 85, benchmark: 75 },
    { skill: 'Technical', score: 92, benchmark: 80 },
    { skill: 'Implementation', score: 78, benchmark: 70 },
    { skill: 'Support', score: 88, benchmark: 85 },
    { skill: 'Marketing', score: 65, benchmark: 60 },
    { skill: 'Training', score: 95, benchmark: 90 }
  ]

  const certifications = [
    { name: 'Foundation Certification', status: 'completed', date: '2024-01-20', score: 92 },
    { name: 'Implementation Specialist', status: 'completed', date: '2024-03-15', score: 88 },
    { name: 'Solution Architect', status: 'in-progress', progress: 65, dueDate: '2024-07-30' },
    { name: 'Master Partner', status: 'locked', requirements: '10 more implementations needed' }
  ]

  const commissionHistory = [
    { period: 'June 2024', amount: 25000, status: 'paid', paidDate: '2024-07-05' },
    { period: 'May 2024', amount: 19600, status: 'paid', paidDate: '2024-06-05' },
    { period: 'April 2024', amount: 15000, status: 'paid', paidDate: '2024-05-05' },
    { period: 'March 2024', amount: 13600, status: 'paid', paidDate: '2024-04-05' },
    { period: 'February 2024', amount: 10400, status: 'paid', paidDate: '2024-03-05' },
    { period: 'January 2024', amount: 9000, status: 'paid', paidDate: '2024-02-05' }
  ]

  const achievements = [
    { title: 'First Deal Closed', icon: Trophy, date: '2024-01-25', points: 100 },
    { title: '10 Clients Milestone', icon: Users, date: '2024-03-10', points: 500 },
    { title: 'Gold Tier Achieved', icon: Award, date: '2024-05-01', points: 1000 },
    { title: 'Top Performer Q2', icon: Star, date: '2024-06-30', points: 2000 }
  ]

  const upcomingIncentives = [
    { 
      name: 'Summer Sprint Bonus',
      description: 'Close 5 deals in July for 5% bonus commission',
      deadline: '2024-07-31',
      progress: 2,
      target: 5,
      reward: '$5,000 bonus'
    },
    {
      name: 'Platinum Tier Qualification',
      description: 'Reach $500K annual revenue to unlock Platinum benefits',
      deadline: '2024-12-31',
      progress: 325000,
      target: 500000,
      reward: '30% commission rate'
    }
  ]

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />
    if (change < 0) return <ArrowDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{partnerInfo.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={`${partnerInfo.tierColor} text-white`}>
                {partnerInfo.tier} Partner
              </Badge>
              <span className="text-sm opacity-90">Member since {partnerInfo.joinDate}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">${performanceMetrics.revenue.current.toLocaleString()}</p>
            <p className="text-sm opacity-90">Revenue this month</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div className={`flex items-center gap-1 ${getChangeColor(performanceMetrics.revenue.change)}`}>
                {getChangeIcon(performanceMetrics.revenue.change)}
                <span className="text-sm font-semibold">{performanceMetrics.revenue.change}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold">${(performanceMetrics.revenue.current / 1000).toFixed(0)}K</p>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <Progress 
              value={(performanceMetrics.revenue.current / performanceMetrics.revenue.target) * 100} 
              className="mt-2 h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              ${((performanceMetrics.revenue.target - performanceMetrics.revenue.current) / 1000).toFixed(0)}K to target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <HandshakeIcon className="w-8 h-8 text-blue-500" />
              <div className={`flex items-center gap-1 ${getChangeColor(performanceMetrics.deals.change)}`}>
                {getChangeIcon(performanceMetrics.deals.change)}
                <span className="text-sm font-semibold">{performanceMetrics.deals.change}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold">{performanceMetrics.deals.current}</p>
            <p className="text-sm text-gray-600">Deals Closed</p>
            <Progress 
              value={(performanceMetrics.deals.current / performanceMetrics.deals.target) * 100} 
              className="mt-2 h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {performanceMetrics.deals.target - performanceMetrics.deals.current} to target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-500" />
              <div className={`flex items-center gap-1 ${getChangeColor(performanceMetrics.clients.change)}`}>
                {getChangeIcon(performanceMetrics.clients.change)}
                <span className="text-sm font-semibold">{performanceMetrics.clients.change}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold">{performanceMetrics.clients.current}</p>
            <p className="text-sm text-gray-600">New Clients</p>
            <Progress 
              value={(performanceMetrics.clients.current / performanceMetrics.clients.target) * 100} 
              className="mt-2 h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {performanceMetrics.clients.target - performanceMetrics.clients.current} to target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className={`flex items-center gap-1 ${getChangeColor(performanceMetrics.satisfaction.change)}`}>
                {getChangeIcon(performanceMetrics.satisfaction.change)}
                <span className="text-sm font-semibold">{performanceMetrics.satisfaction.change}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold">{performanceMetrics.satisfaction.current}</p>
            <p className="text-sm text-gray-600">Client Satisfaction</p>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(performanceMetrics.satisfaction.current)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="skills">Skills & Certs</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Commission Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commission" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Commission"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#6b7280" 
                    strokeDasharray="5 5"
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={clientDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {clientDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, idx) => {
                    const Icon = achievement.icon
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded">
                            <Icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{achievement.title}</p>
                            <p className="text-xs text-gray-600">{achievement.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">+{achievement.points} pts</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dealPipeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip formatter={(value) => typeof value === 'number' ? `$${value.toLocaleString()}` : value} />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="Deal Count" />
                  <Bar dataKey="value" fill="#10b981" name="Total Value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dealPipeline.map((stage, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-semibold">{stage.stage}</p>
                      <p className="text-sm text-gray-600">{stage.count} deals</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(stage.value / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-gray-600">Total value</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Tab */}
        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Commission History</CardTitle>
                <div className="text-right">
                  <p className="text-2xl font-bold">${commissionHistory.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total earned YTD</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commissionHistory.map((commission, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-semibold">{commission.period}</p>
                      <p className="text-sm text-gray-600">Paid on {commission.paidDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Paid
                      </Badge>
                      <p className="font-semibold">${commission.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills & Certifications Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillsRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Your Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Radar name="Benchmark" dataKey="benchmark" stroke="#6b7280" fill="#6b7280" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{cert.name}</p>
                        {cert.status === 'completed' ? (
                          <Badge variant="success" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : cert.status === 'in-progress' ? (
                          <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            In Progress
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Locked
                          </Badge>
                        )}
                      </div>
                      {cert.status === 'completed' && (
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Completed: {cert.date}</span>
                          <span>Score: {cert.score}%</span>
                        </div>
                      )}
                      {cert.status === 'in-progress' && cert.progress && (
                        <div>
                          <Progress value={cert.progress} className="h-2 mb-1" />
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{cert.progress}% complete</span>
                            <span>Due: {cert.dueDate}</span>
                          </div>
                        </div>
                      )}
                      {cert.status === 'locked' && (
                        <p className="text-sm text-gray-600">{cert.requirements}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incentives Tab */}
        <TabsContent value="incentives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Active Incentives & Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingIncentives.map((incentive, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{incentive.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{incentive.description}</p>
                      </div>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {incentive.deadline}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-semibold">
                          {typeof incentive.progress === 'number' && incentive.progress > 1000 
                            ? `$${(incentive.progress / 1000).toFixed(0)}K / $${(incentive.target / 1000).toFixed(0)}K`
                            : `${incentive.progress} / ${incentive.target}`
                          }
                        </span>
                      </div>
                      <Progress 
                        value={(incentive.progress / incentive.target) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800">
                        <Zap className="w-3 h-3 mr-1" />
                        Reward: {incentive.reward}
                      </Badge>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}