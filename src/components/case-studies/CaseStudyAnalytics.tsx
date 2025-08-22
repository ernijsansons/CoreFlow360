'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, Eye, Users, DollarSign, Target, BarChart3, 
  Calendar, Award, MousePointer, Download, Share2, Star
} from 'lucide-react'
import { motion } from 'framer-motion'

interface AnalyticsData {
  period: string
  totalViews: number
  uniqueViews: number
  totalLeads: number
  conversionRate: number
  avgTimeOnPage: number
  topPerformingStudy: string
  attributedRevenue: number
  pipelineInfluence: number
}

interface TrafficSource {
  source: string
  views: number
  percentage: number
  conversionRate: number
  leads: number
}

interface AudienceInsight {
  dimension: string
  segments: {
    label: string
    value: number
    percentage: number
    conversionRate: number
  }[]
}

interface CaseStudyPerformance {
  id: string
  title: string
  entrepreneurName: string
  views: number
  uniqueViews: number
  leads: number
  conversionRate: number
  avgTimeOnPage: number
  bounceRate: number
  downloads: number
  shares: number
  attributedRevenue: number
  monthlyGrowth: number
}

export function CaseStudyAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('views')
  
  const [analyticsData] = useState<AnalyticsData>({
    period: '30 days',
    totalViews: 37050,
    uniqueViews: 28420,
    totalLeads: 370,
    conversionRate: 10.8,
    avgTimeOnPage: 185,
    topPerformingStudy: 'Sarah Chen Multi-Business Empire',
    attributedRevenue: 485000,
    pipelineInfluence: 1250000
  })

  const [trafficSources] = useState<TrafficSource[]>([
    {
      source: 'Organic Search',
      views: 15820,
      percentage: 42.7,
      conversionRate: 12.5,
      leads: 158
    },
    {
      source: 'Direct Traffic',
      views: 8930,
      percentage: 24.1,
      conversionRate: 9.8,
      leads: 89
    },
    {
      source: 'Social Media',
      views: 6240,
      percentage: 16.8,
      conversionRate: 8.2,
      leads: 62
    },
    {
      source: 'Email Marketing',
      views: 3680,
      percentage: 9.9,
      conversionRate: 15.7,
      leads: 37
    },
    {
      source: 'Paid Search',
      views: 2380,
      percentage: 6.4,
      conversionRate: 10.1,
      leads: 24
    }
  ])

  const [audienceInsights] = useState<AudienceInsight[]>([
    {
      dimension: 'Business Size',
      segments: [
        { label: 'Startup (1-10 employees)', value: 12850, percentage: 34.7, conversionRate: 8.5 },
        { label: 'SMB (11-50 employees)', value: 11120, percentage: 30.0, conversionRate: 12.8 },
        { label: 'Mid-Market (51-200 employees)', value: 8940, percentage: 24.1, conversionRate: 14.2 },
        { label: 'Enterprise (200+ employees)', value: 4140, percentage: 11.2, conversionRate: 9.1 }
      ]
    },
    {
      dimension: 'Industry',
      segments: [
        { label: 'Professional Services', value: 9250, percentage: 25.0, conversionRate: 13.8 },
        { label: 'HVAC/Home Services', value: 8120, percentage: 21.9, conversionRate: 11.5 },
        { label: 'Construction', value: 6890, percentage: 18.6, conversionRate: 9.7 },
        { label: 'Technology', value: 5940, percentage: 16.0, conversionRate: 12.2 },
        { label: 'Retail/E-commerce', value: 4320, percentage: 11.7, conversionRate: 8.9 },
        { label: 'Other', value: 2530, percentage: 6.8, conversionRate: 7.4 }
      ]
    },
    {
      dimension: 'User Role',
      segments: [
        { label: 'CEO/Founder', value: 14820, percentage: 40.0, conversionRate: 15.2 },
        { label: 'Business Owner', value: 11120, percentage: 30.0, conversionRate: 12.8 },
        { label: 'Operations Manager', value: 5560, percentage: 15.0, conversionRate: 8.5 },
        { label: 'Marketing Manager', value: 3705, percentage: 10.0, conversionRate: 6.9 },
        { label: 'Other', value: 1845, percentage: 5.0, conversionRate: 4.2 }
      ]
    }
  ])

  const [caseStudyPerformance] = useState<CaseStudyPerformance[]>([
    {
      id: 'case-1',
      title: 'From 2 Struggling Businesses to $8.5M Multi-Business Empire',
      entrepreneurName: 'Sarah Chen',
      views: 12450,
      uniqueViews: 9870,
      leads: 125,
      conversionRate: 12.7,
      avgTimeOnPage: 225,
      bounceRate: 35.2,
      downloads: 890,
      shares: 67,
      attributedRevenue: 185000,
      monthlyGrowth: 18.5
    },
    {
      id: 'case-2',
      title: 'Professional Services Empire: From Solo Practice to $12M Portfolio',
      entrepreneurName: 'Michael Rodriguez',
      views: 8950,
      uniqueViews: 7320,
      leads: 89,
      conversionRate: 10.8,
      avgTimeOnPage: 198,
      bounceRate: 42.1,
      downloads: 445,
      shares: 34,
      attributedRevenue: 145000,
      monthlyGrowth: 12.3
    },
    {
      id: 'case-3',
      title: 'Tech-Enabled HVAC Empire: 12 Locations, $25M Revenue',
      entrepreneurName: 'Jennifer Park',
      views: 15680,
      uniqueViews: 11200,
      leads: 156,
      conversionRate: 11.2,
      avgTimeOnPage: 165,
      bounceRate: 38.9,
      downloads: 1250,
      shares: 89,
      attributedRevenue: 155000,
      monthlyGrowth: 25.1
    }
  ])

  const getPerformanceColor = (value: number, type: 'growth' | 'conversion' | 'engagement') => {
    if (type === 'growth') {
      if (value >= 20) return 'text-green-600 bg-green-50'
      if (value >= 10) return 'text-blue-600 bg-blue-50'
      if (value >= 0) return 'text-yellow-600 bg-yellow-50'
      return 'text-red-600 bg-red-50'
    }
    if (type === 'conversion') {
      if (value >= 12) return 'text-green-600 bg-green-50'
      if (value >= 9) return 'text-blue-600 bg-blue-50'
      if (value >= 6) return 'text-yellow-600 bg-yellow-50'
      return 'text-red-600 bg-red-50'
    }
    // engagement (time on page in seconds)
    if (value >= 200) return 'text-green-600 bg-green-50'
    if (value >= 150) return 'text-blue-600 bg-blue-50'
    if (value >= 100) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Case Study Analytics</h1>
          <p className="text-gray-600">Track performance, engagement, and conversion metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</p>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-green-600 mt-1">+18.5% vs last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{analyticsData.uniqueViews.toLocaleString()}</p>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-blue-600 mt-1">{((analyticsData.uniqueViews / analyticsData.totalViews) * 100).toFixed(1)}% unique rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{analyticsData.totalLeads}</p>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-green-600 mt-1">+25.3% vs last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{analyticsData.conversionRate}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">+2.1% vs last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Time on Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{Math.floor(analyticsData.avgTimeOnPage / 60)}:{(analyticsData.avgTimeOnPage % 60).toString().padStart(2, '0')}</p>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minutes:seconds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">${(analyticsData.attributedRevenue / 1000).toFixed(0)}K</p>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Attributed revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <motion.div
                  key={source.source}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{source.source}</span>
                      <span className="text-sm text-gray-600">{source.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{source.views.toLocaleString()} views</span>
                      <span>{source.leads} leads ({source.conversionRate}% CVR)</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Attribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600 mb-2">
                  ${(analyticsData.attributedRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600 mb-4">Directly attributed revenue</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Pipeline Influence</p>
                    <p className="font-bold">${(analyticsData.pipelineInfluence / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Deal Size</p>
                    <p className="font-bold">${(analyticsData.attributedRevenue / analyticsData.totalLeads * 1000).toFixed(0)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 mb-1">Conversion Rate</p>
                  <p className="text-xl font-bold text-green-600">{analyticsData.conversionRate}%</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Cost per Lead</p>
                  <p className="text-xl font-bold text-blue-600">$28</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audience Insights */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Audience Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {audienceInsights.map((insight) => (
              <div key={insight.dimension}>
                <h4 className="font-semibold mb-4">{insight.dimension}</h4>
                <div className="space-y-3">
                  {insight.segments.map((segment, index) => (
                    <div key={segment.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{segment.label}</span>
                        <span className="text-sm text-gray-600">{segment.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{segment.value.toLocaleString()} views</span>
                        <span>{segment.conversionRate}% CVR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Case Study Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Case Study Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caseStudyPerformance.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{study.title}</h4>
                    <p className="text-sm text-gray-600">by {study.entrepreneurName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPerformanceColor(study.monthlyGrowth, 'growth')}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{study.monthlyGrowth}%
                    </Badge>
                    {study.id === 'case-1' && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Top Performer
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-6 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">Views</p>
                    <p className="text-lg font-bold text-blue-600">{study.views.toLocaleString()}</p>
                    <p className="text-xs text-blue-600">{study.uniqueViews.toLocaleString()} unique</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">Leads</p>
                    <p className="text-lg font-bold text-green-600">{study.leads}</p>
                    <p className="text-xs text-green-600">{study.conversionRate}% CVR</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700 mb-1">Engagement</p>
                    <p className="text-lg font-bold text-purple-600">
                      {Math.floor(study.avgTimeOnPage / 60)}:{(study.avgTimeOnPage % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-xs text-purple-600">{study.bounceRate}% bounce</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700 mb-1">Downloads</p>
                    <p className="text-lg font-bold text-orange-600">{study.downloads}</p>
                    <p className="text-xs text-orange-600">{((study.downloads / study.views) * 100).toFixed(1)}% rate</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <p className="text-sm text-pink-700 mb-1">Shares</p>
                    <p className="text-lg font-bold text-pink-600">{study.shares}</p>
                    <p className="text-xs text-pink-600">{((study.shares / study.views) * 100).toFixed(1)}% rate</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-gray-600">${(study.attributedRevenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-600">Attributed</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}