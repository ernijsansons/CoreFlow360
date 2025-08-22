'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, Eye, TrendingUp, Search, Filter, Calendar, 
  Building, Target, Share2, BarChart3, Edit, BookOpen
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ContentItem {
  id: string
  title: string
  slug: string
  contentType: 'BLOG_POST' | 'LANDING_PAGE' | 'SERVICE_PAGE' | 'CASE_STUDY' | 'PRESS_RELEASE'
  status: 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  publishDate?: string
  lastModified: string
  author: string
  primaryBusiness: string
  targetBusinesses: string[]
  sharedContent: boolean
  focusKeywords: string[]
  targetAudience: string
  contentPillar: string
  views: number
  uniqueViews: number
  organicTraffic: number
  conversionRate: number
  leadsGenerated: number
  socialShares: number
  backlinks: number
  metaTitle?: string
  metaDescription?: string
}

export function ContentHubDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedBusiness, setSelectedBusiness] = useState('ALL')
  
  const [contentItems] = useState<ContentItem[]>([
    {
      id: 'content-1',
      title: 'The Complete Guide to HVAC Maintenance for Multi-Location Businesses',
      slug: 'hvac-maintenance-multi-location-guide',
      contentType: 'BLOG_POST',
      status: 'PUBLISHED',
      publishDate: '2024-03-10',
      lastModified: '2024-03-15',
      author: 'Sarah Johnson',
      primaryBusiness: 'Phoenix HVAC Services',
      targetBusinesses: ['Phoenix HVAC Services', 'Valley Maintenance Co', 'Desert Air Solutions'],
      sharedContent: true,
      focusKeywords: ['HVAC maintenance', 'multi-location HVAC', 'commercial HVAC service'],
      targetAudience: 'SMALL_BUSINESS',
      contentPillar: 'THOUGHT_LEADERSHIP',
      views: 2450,
      uniqueViews: 1890,
      organicTraffic: 1650,
      conversionRate: 3.2,
      leadsGenerated: 12,
      socialShares: 48,
      backlinks: 15,
      metaTitle: 'Complete HVAC Maintenance Guide for Multi-Location Businesses',
      metaDescription: 'Learn how to optimize HVAC maintenance across multiple business locations. Expert tips for cost savings and efficiency.'
    },
    {
      id: 'content-2',
      title: 'Legal Considerations for Business Acquisitions in Professional Services',
      slug: 'legal-business-acquisitions-professional-services',
      contentType: 'CASE_STUDY',
      status: 'PUBLISHED',
      publishDate: '2024-03-05',
      lastModified: '2024-03-12',
      author: 'Michael Chen',
      primaryBusiness: 'Corporate Law Partners',
      targetBusinesses: ['Corporate Law Partners', 'Strategic Consulting Group'],
      sharedContent: true,
      focusKeywords: ['business acquisition law', 'professional services M&A', 'legal due diligence'],
      targetAudience: 'ENTERPRISE',
      contentPillar: 'PRODUCT_EDUCATION',
      views: 1850,
      uniqueViews: 1420,
      organicTraffic: 1250,
      conversionRate: 4.8,
      leadsGenerated: 8,
      socialShares: 32,
      backlinks: 28,
      metaTitle: 'Legal Guide to Professional Services Acquisitions | Corporate Law',
      metaDescription: 'Navigate complex legal requirements for acquiring professional services firms. Expert insights from M&A specialists.'
    },
    {
      id: 'content-3',
      title: 'Cross-Business Resource Optimization Strategies',
      slug: 'cross-business-resource-optimization',
      contentType: 'BLOG_POST',
      status: 'IN_REVIEW',
      lastModified: '2024-03-18',
      author: 'Emily Rodriguez',
      primaryBusiness: 'Strategic Consulting Group',
      targetBusinesses: ['Strategic Consulting Group', 'Corporate Law Partners', 'Premier Accounting Services'],
      sharedContent: true,
      focusKeywords: ['resource optimization', 'multi-business management', 'operational efficiency'],
      targetAudience: 'SMALL_BUSINESS',
      contentPillar: 'THOUGHT_LEADERSHIP',
      views: 0,
      uniqueViews: 0,
      organicTraffic: 0,
      conversionRate: 0,
      leadsGenerated: 0,
      socialShares: 0,
      backlinks: 0
    },
    {
      id: 'content-4',
      title: 'Marketing ROI Calculator for Professional Services',
      slug: 'marketing-roi-calculator-professional-services',
      contentType: 'LANDING_PAGE',
      status: 'PUBLISHED',
      publishDate: '2024-02-28',
      lastModified: '2024-03-08',
      author: 'David Kim',
      primaryBusiness: 'Creative Marketing Studio',
      targetBusinesses: ['Creative Marketing Studio'],
      sharedContent: false,
      focusKeywords: ['marketing ROI calculator', 'professional services marketing', 'marketing analytics'],
      targetAudience: 'SMALL_BUSINESS',
      contentPillar: 'PRODUCT_EDUCATION',
      views: 3250,
      uniqueViews: 2680,
      organicTraffic: 2180,
      conversionRate: 6.4,
      leadsGenerated: 28,
      socialShares: 85,
      backlinks: 42
    },
    {
      id: 'content-5',
      title: 'Tax Planning Strategies for Multi-Entity Businesses',
      slug: 'tax-planning-multi-entity-businesses',
      contentType: 'SERVICE_PAGE',
      status: 'SCHEDULED',
      publishDate: '2024-03-25',
      lastModified: '2024-03-20',
      author: 'Jennifer Walsh',
      primaryBusiness: 'Premier Accounting Services',
      targetBusinesses: ['Premier Accounting Services', 'Corporate Law Partners'],
      sharedContent: true,
      focusKeywords: ['multi-entity tax planning', 'business tax strategies', 'corporate tax optimization'],
      targetAudience: 'ENTERPRISE',
      contentPillar: 'PRODUCT_EDUCATION',
      views: 0,
      uniqueViews: 0,
      organicTraffic: 0,
      conversionRate: 0,
      leadsGenerated: 0,
      socialShares: 0,
      backlinks: 0
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'ARCHIVED': return 'bg-red-100 text-red-800'
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

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'THOUGHT_LEADERSHIP': return 'bg-purple-100 text-purple-800'
      case 'PRODUCT_EDUCATION': return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER_SUCCESS': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.focusKeywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus
    const matchesBusiness = selectedBusiness === 'ALL' || 
      item.primaryBusiness === selectedBusiness ||
      item.targetBusinesses.includes(selectedBusiness)
    
    return matchesSearch && matchesStatus && matchesBusiness
  })

  const portfolioMetrics = {
    totalContent: contentItems.length,
    publishedContent: contentItems.filter(c => c.status === 'PUBLISHED').length,
    totalViews: contentItems.reduce((acc, c) => acc + c.views, 0),
    totalLeads: contentItems.reduce((acc, c) => acc + c.leadsGenerated, 0),
    avgConversionRate: contentItems.filter(c => c.conversionRate > 0)
      .reduce((acc, c) => acc + c.conversionRate, 0) / 
      contentItems.filter(c => c.conversionRate > 0).length || 0,
    sharedContent: contentItems.filter(c => c.sharedContent).length
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Hub</h1>
          <p className="text-gray-600">Multi-business SEO content management and optimization</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Content Analytics
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <FileText className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.totalContent}</p>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.publishedContent}</p>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{(portfolioMetrics.totalViews / 1000).toFixed(1)}K</p>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.totalLeads}</p>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg CVR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.avgConversionRate.toFixed(1)}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Shared Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.sharedContent}</p>
              <Share2 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Cross-business</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search content by title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
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
      </div>

      {/* Content Items */}
      <div className="space-y-4">
        {filteredContent.map((item, index) => (
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
                        {item.sharedContent && (
                          <Badge variant="outline" className="text-xs">
                            <Share2 className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>By {item.author}</span>
                        <span>•</span>
                        <span>Primary: {item.primaryBusiness}</span>
                        {item.publishDate && (
                          <>
                            <span>•</span>
                            <span>Published: {new Date(item.publishDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPillarColor(item.contentPillar)}>
                          {item.contentPillar.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Target: {item.targetAudience.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.status === 'PUBLISHED' && (
                    <div className="grid grid-cols-2 gap-4 text-center ml-4">
                      <div>
                        <p className="text-sm text-gray-600">Views</p>
                        <p className="text-lg font-bold">{item.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Leads</p>
                        <p className="text-lg font-bold text-green-600">{item.leadsGenerated}</p>
                      </div>
                    </div>
                  )}
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

                {/* SEO Meta */}
                {item.metaTitle && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">Meta Title:</p>
                    <p className="text-sm">{item.metaTitle}</p>
                    {item.metaDescription && (
                      <>
                        <p className="text-xs font-medium text-gray-600 mb-1 mt-2">Meta Description:</p>
                        <p className="text-sm text-gray-700">{item.metaDescription}</p>
                      </>
                    )}
                  </div>
                )}

                {/* Performance Metrics - Published Content */}
                {item.status === 'PUBLISHED' && (
                  <div className="grid md:grid-cols-6 gap-4 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-600">Organic Traffic</p>
                      <p className="text-sm font-bold">{item.organicTraffic.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-600">CVR</p>
                      <p className="text-sm font-bold">{item.conversionRate}%</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-purple-600">Social Shares</p>
                      <p className="text-sm font-bold">{item.socialShares}</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-orange-600">Backlinks</p>
                      <p className="text-sm font-bold">{item.backlinks}</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <p className="text-xs text-yellow-600">Unique Views</p>
                      <p className="text-sm font-bold">{item.uniqueViews.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Last Modified</p>
                      <p className="text-sm font-bold">{new Date(item.lastModified).toLocaleDateString()}</p>
                    </div>
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
                  {item.status === 'PUBLISHED' && (
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  )}
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
    </div>
  )
}