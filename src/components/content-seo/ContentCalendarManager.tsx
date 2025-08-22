'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar, Plus, Filter, Building, Target, TrendingUp, 
  Clock, Edit, Eye, BarChart3, Share2, AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ContentCalendarItem {
  id: string
  title: string
  contentType: 'BLOG_POST' | 'LANDING_PAGE' | 'SERVICE_PAGE' | 'CASE_STUDY' | 'PRESS_RELEASE'
  status: 'PLANNED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED'
  plannedDate: string
  publishDate?: string
  assignedTo: string
  primaryBusiness: string
  targetBusinesses: string[]
  sharedContent: boolean
  focusKeywords: string[]
  contentPillar: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  estimatedHours: number
  actualHours?: number
  campaignTag?: string
  seasonalTheme?: string
}

interface CalendarWeek {
  weekStart: string
  weekEnd: string
  items: ContentCalendarItem[]
}

export function ContentCalendarManager() {
  const [selectedView, setSelectedView] = useState<'week' | 'month' | 'quarter'>('month')
  const [selectedBusiness, setSelectedBusiness] = useState('ALL')
  const [selectedPillar, setSelectedPillar] = useState('ALL')
  
  const [calendarItems] = useState<ContentCalendarItem[]>([
    {
      id: 'cal-1',
      title: 'Complete Guide to HVAC Maintenance for Multi-Location Businesses',
      contentType: 'BLOG_POST',
      status: 'PUBLISHED',
      plannedDate: '2024-03-10',
      publishDate: '2024-03-10',
      assignedTo: 'Sarah Johnson',
      primaryBusiness: 'Phoenix HVAC Services',
      targetBusinesses: ['Phoenix HVAC Services', 'Valley Maintenance Co', 'Desert Air Solutions'],
      sharedContent: true,
      focusKeywords: ['HVAC maintenance', 'multi-location HVAC', 'commercial HVAC service'],
      contentPillar: 'THOUGHT_LEADERSHIP',
      priority: 'HIGH',
      estimatedHours: 12,
      actualHours: 14,
      campaignTag: 'Spring Maintenance Drive',
      seasonalTheme: 'Spring Preparation'
    },
    {
      id: 'cal-2',
      title: 'Q2 Tax Planning Strategies for Multi-Entity Businesses',
      contentType: 'SERVICE_PAGE',
      status: 'SCHEDULED',
      plannedDate: '2024-03-25',
      publishDate: '2024-03-25',
      assignedTo: 'Jennifer Walsh',
      primaryBusiness: 'Premier Accounting Services',
      targetBusinesses: ['Premier Accounting Services', 'Corporate Law Partners'],
      sharedContent: true,
      focusKeywords: ['Q2 tax planning', 'multi-entity tax', 'business tax optimization'],
      contentPillar: 'PRODUCT_EDUCATION',
      priority: 'CRITICAL',
      estimatedHours: 8,
      campaignTag: 'Q2 Tax Season',
      seasonalTheme: 'Tax Season'
    },
    {
      id: 'cal-3',
      title: 'Cross-Business Resource Optimization Case Study',
      contentType: 'CASE_STUDY',
      status: 'IN_PROGRESS',
      plannedDate: '2024-03-28',
      assignedTo: 'Emily Rodriguez',
      primaryBusiness: 'Strategic Consulting Group',
      targetBusinesses: ['Strategic Consulting Group', 'Corporate Law Partners', 'Premier Accounting Services'],
      sharedContent: true,
      focusKeywords: ['resource optimization', 'multi-business efficiency', 'case study'],
      contentPillar: 'CUSTOMER_SUCCESS',
      priority: 'HIGH',
      estimatedHours: 16,
      actualHours: 8,
      campaignTag: 'Efficiency Showcase'
    },
    {
      id: 'cal-4',
      title: 'Summer HVAC Demand Forecasting Tools',
      contentType: 'LANDING_PAGE',
      status: 'PLANNED',
      plannedDate: '2024-04-15',
      assignedTo: 'Mark Thompson',
      primaryBusiness: 'Phoenix HVAC Services',
      targetBusinesses: ['Phoenix HVAC Services'],
      sharedContent: false,
      focusKeywords: ['HVAC demand forecasting', 'summer HVAC prep', 'HVAC planning tools'],
      contentPillar: 'PRODUCT_EDUCATION',
      priority: 'MEDIUM',
      estimatedHours: 10,
      seasonalTheme: 'Summer Prep'
    },
    {
      id: 'cal-5',
      title: 'Professional Services Billing Rate Benchmarking Report',
      contentType: 'PRESS_RELEASE',
      status: 'PLANNED',
      plannedDate: '2024-04-08',
      assignedTo: 'David Kim',
      primaryBusiness: 'Creative Marketing Studio',
      targetBusinesses: ['Creative Marketing Studio', 'Strategic Consulting Group'],
      sharedContent: true,
      focusKeywords: ['professional services rates', 'billing benchmarks', 'market analysis'],
      contentPillar: 'THOUGHT_LEADERSHIP',
      priority: 'MEDIUM',
      estimatedHours: 6,
      campaignTag: 'Market Insights'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_REVIEW': return 'bg-purple-100 text-purple-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'PLANNED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'BLOG_POST': return '📝'
      case 'LANDING_PAGE': return '🎯'
      case 'SERVICE_PAGE': return '🏢'
      case 'CASE_STUDY': return '📊'
      case 'PRESS_RELEASE': return '📢'
      default: return '📄'
    }
  }

  // Group items by week for calendar view
  const groupItemsByWeek = (): CalendarWeek[] => {
    const weeks: CalendarWeek[] = []
    const currentDate = new Date()
    
    // Generate next 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + (i * 7))
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      const weekItems = calendarItems.filter(item => {
        const itemDate = new Date(item.plannedDate)
        return itemDate >= weekStart && itemDate <= weekEnd
      })
      
      weeks.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        items: weekItems
      })
    }
    
    return weeks
  }

  const filteredItems = calendarItems.filter(item => {
    const matchesBusiness = selectedBusiness === 'ALL' || 
      item.primaryBusiness === selectedBusiness ||
      item.targetBusinesses.includes(selectedBusiness)
    
    const matchesPillar = selectedPillar === 'ALL' || item.contentPillar === selectedPillar
    
    return matchesBusiness && matchesPillar
  })

  const calendarMetrics = {
    totalPlanned: calendarItems.length,
    thisMonth: calendarItems.filter(item => {
      const itemDate = new Date(item.plannedDate)
      const currentDate = new Date()
      return itemDate.getMonth() === currentDate.getMonth()
    }).length,
    inProgress: calendarItems.filter(item => item.status === 'IN_PROGRESS').length,
    sharedContent: calendarItems.filter(item => item.sharedContent).length,
    avgCompletionTime: Math.round(
      calendarItems.filter(item => item.actualHours).reduce((acc, item) => acc + (item.actualHours || 0), 0) /
      calendarItems.filter(item => item.actualHours).length || 0
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Calendar</h1>
          <p className="text-gray-600">Multi-business content planning and scheduling</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Content
          </Button>
        </div>
      </div>

      {/* Calendar Metrics */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{calendarMetrics.totalPlanned}</p>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{calendarMetrics.thisMonth}</p>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{calendarMetrics.inProgress}</p>
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Shared Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{calendarMetrics.sharedContent}</p>
              <Share2 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Cross-business</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{calendarMetrics.avgCompletionTime}</p>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Per content piece</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View Controls */}
      <div className="flex gap-3 mb-6">
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((view) => (
            <Button
              key={view}
              variant={selectedView === view ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>
        <select
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Businesses</option>
          <option value="Phoenix HVAC Services">Phoenix HVAC</option>
          <option value="Corporate Law Partners">Legal Partners</option>
          <option value="Strategic Consulting Group">Consulting</option>
          <option value="Creative Marketing Studio">Marketing</option>
          <option value="Premier Accounting Services">Accounting</option>
        </select>
        <select
          value={selectedPillar}
          onChange={(e) => setSelectedPillar(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Pillars</option>
          <option value="THOUGHT_LEADERSHIP">Thought Leadership</option>
          <option value="PRODUCT_EDUCATION">Product Education</option>
          <option value="CUSTOMER_SUCCESS">Customer Success</option>
        </select>
      </div>

      {/* Calendar Grid */}
      {selectedView === 'month' && (
        <div className="space-y-6">
          {groupItemsByWeek().map((week, weekIndex) => (
            <Card key={week.weekStart}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Week of {new Date(week.weekStart).toLocaleDateString()} - {new Date(week.weekEnd).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {week.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No content scheduled for this week</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {week.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-lg">{getContentTypeIcon(item.contentType)}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                            <div className="flex gap-2 mb-2">
                              <Badge className={getStatusColor(item.status)} size="sm">
                                {item.status}
                              </Badge>
                              <Badge className={getPriorityColor(item.priority)} size="sm">
                                {item.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Due: {new Date(item.plannedDate).toLocaleDateString()}</span>
                            {item.sharedContent && (
                              <Badge variant="outline" className="text-xs">
                                <Share2 className="h-3 w-3 mr-1" />
                                Shared
                              </Badge>
                            )}
                          </div>
                          <div>Assigned: {item.assignedTo}</div>
                          <div>Primary: {item.primaryBusiness}</div>
                          {item.campaignTag && (
                            <div className="text-purple-600">Campaign: {item.campaignTag}</div>
                          )}
                          {item.seasonalTheme && (
                            <div className="text-orange-600">Theme: {item.seasonalTheme}</div>
                          )}
                        </div>

                        <div className="flex gap-1 mt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View for Week/Quarter */}
      {selectedView !== 'month' && (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getContentTypeIcon(item.contentType)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          {item.sharedContent && (
                            <Badge variant="outline" className="text-xs">
                              <Share2 className="h-3 w-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Due: {new Date(item.plannedDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Assigned: {item.assignedTo}</span>
                          <span>•</span>
                          <span>Primary: {item.primaryBusiness}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {item.estimatedHours}h estimated
                        {item.actualHours && ` / ${item.actualHours}h actual`}
                      </p>
                      {item.actualHours && item.actualHours > item.estimatedHours && (
                        <p className="text-xs text-orange-600">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Over estimate
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Target Businesses */}
                  {item.targetBusinesses.length > 1 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Target Businesses:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.targetBusinesses.map((business) => (
                          <Badge key={business} variant="outline" className="text-xs">
                            <Building className="h-3 w-3 mr-1" />
                            {business}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Focus Keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.focusKeywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Campaign & Theme */}
                  {(item.campaignTag || item.seasonalTheme) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      {item.campaignTag && (
                        <p className="text-sm">
                          <span className="font-medium text-purple-700">Campaign:</span> {item.campaignTag}
                        </p>
                      )}
                      {item.seasonalTheme && (
                        <p className="text-sm">
                          <span className="font-medium text-orange-700">Theme:</span> {item.seasonalTheme}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Keyword Research
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}