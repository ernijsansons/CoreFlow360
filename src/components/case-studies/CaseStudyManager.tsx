'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, Plus, Edit, Eye, Trash2, Star, Calendar, 
  TrendingUp, Users, DollarSign, Target, CheckCircle,
  Clock, AlertCircle, Filter, Search, BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'

interface CaseStudy {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'FEATURED' | 'ARCHIVED'
  featured: boolean
  publishDate?: string
  
  entrepreneurName: string
  entrepreneurTitle: string
  entrepreneurLocation: string
  businessCount: number
  industries: string[]
  
  revenueGrowth: number
  profitGrowth: number
  roiPercentage: number
  timeframe: string
  
  testimonialQuote: string
  
  views: number
  downloads: number
  leads: number
  conversionRate: number
  
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedBy?: string
  legalApproval: boolean
  
  createdAt: string
  updatedAt: string
}

interface CaseStudyMetrics {
  totalCaseStudies: number
  publishedCaseStudies: number
  featuredCaseStudies: number
  draftCaseStudies: number
  totalViews: number
  totalLeads: number
  avgConversionRate: number
  topPerformingId: string
}

export function CaseStudyManager() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  
  const [caseStudies] = useState<CaseStudy[]>([
    {
      id: 'case-1',
      title: 'From 2 Struggling Businesses to $8.5M Multi-Business Empire',
      slug: 'sarah-chen-multi-business-empire',
      status: 'PUBLISHED',
      featured: true,
      publishDate: '2024-03-15',
      
      entrepreneurName: 'Sarah Chen',
      entrepreneurTitle: 'Serial Entrepreneur & Business Portfolio Owner',
      entrepreneurLocation: 'Phoenix, Arizona',
      businessCount: 4,
      industries: ['HVAC', 'Real Estate', 'Consulting', 'Retail'],
      
      revenueGrowth: 608,
      profitGrowth: 485,
      roiPercentage: 2980,
      timeframe: '18 months',
      
      testimonialQuote: 'CoreFlow360 didn\'t just help me manage my businesses - it revealed opportunities I never knew existed.',
      
      views: 12450,
      downloads: 890,
      leads: 125,
      conversionRate: 12.5,
      
      reviewStatus: 'APPROVED',
      reviewedBy: 'Marketing Team',
      legalApproval: true,
      
      createdAt: '2024-02-28',
      updatedAt: '2024-03-15'
    },
    {
      id: 'case-2',
      title: 'Professional Services Empire: From Solo Practice to $12M Portfolio',
      slug: 'michael-rodriguez-professional-services',
      status: 'PUBLISHED',
      featured: true,
      publishDate: '2024-03-08',
      
      entrepreneurName: 'Michael Rodriguez',
      entrepreneurTitle: 'Managing Partner & Founder',
      entrepreneurLocation: 'Dallas, Texas',
      businessCount: 3,
      industries: ['Legal', 'Financial Services', 'Consulting'],
      
      revenueGrowth: 329,
      profitGrowth: 275,
      roiPercentage: 5111,
      timeframe: '2 years',
      
      testimonialQuote: 'The unified client intelligence is game-changing. We now provide comprehensive solutions instead of fragmented services.',
      
      views: 8950,
      downloads: 445,
      leads: 89,
      conversionRate: 10.8,
      
      reviewStatus: 'APPROVED',
      reviewedBy: 'Legal Team',
      legalApproval: true,
      
      createdAt: '2024-02-15',
      updatedAt: '2024-03-08'
    },
    {
      id: 'case-3',
      title: 'E-commerce to Physical Retail: $15M Omnichannel Success',
      slug: 'amanda-foster-omnichannel',
      status: 'IN_REVIEW',
      featured: false,
      
      entrepreneurName: 'Amanda Foster',
      entrepreneurTitle: 'Founder & CEO',
      entrepreneurLocation: 'Seattle, Washington',
      businessCount: 5,
      industries: ['E-commerce', 'Retail', 'Logistics', 'Technology'],
      
      revenueGrowth: 450,
      profitGrowth: 380,
      roiPercentage: 1250,
      timeframe: '14 months',
      
      testimonialQuote: 'CoreFlow360 connected our online and offline worlds seamlessly. Our customers love the unified experience.',
      
      views: 0,
      downloads: 0,
      leads: 0,
      conversionRate: 0,
      
      reviewStatus: 'PENDING',
      legalApproval: false,
      
      createdAt: '2024-03-18',
      updatedAt: '2024-03-20'
    },
    {
      id: 'case-4',
      title: 'Construction Empire: From $2M to $35M in 3 Years',
      slug: 'robert-kim-construction-empire',
      status: 'DRAFT',
      featured: false,
      
      entrepreneurName: 'Robert Kim',
      entrepreneurTitle: 'Owner & General Contractor',
      entrepreneurLocation: 'Atlanta, Georgia',
      businessCount: 8,
      industries: ['Construction', 'Real Estate', 'Property Management', 'Consulting'],
      
      revenueGrowth: 1650,
      profitGrowth: 890,
      roiPercentage: 8900,
      timeframe: '3 years',
      
      testimonialQuote: 'Managing 8 construction businesses was impossible before CoreFlow360. Now we operate like a well-oiled machine.',
      
      views: 0,
      downloads: 0,
      leads: 0,
      conversionRate: 0,
      
      reviewStatus: 'PENDING',
      legalApproval: false,
      
      createdAt: '2024-03-22',
      updatedAt: '2024-03-22'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'FEATURED': return 'bg-purple-100 text-purple-800'
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'ARCHIVED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCaseStudies = caseStudies.filter(study => {
    const matchesSearch = searchTerm === '' || 
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.entrepreneurName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.industries.some(industry => industry.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'ALL' || study.status === selectedStatus
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'published' && study.status === 'PUBLISHED') ||
      (activeTab === 'featured' && study.featured) ||
      (activeTab === 'draft' && study.status === 'DRAFT') ||
      (activeTab === 'review' && study.status === 'IN_REVIEW')
    
    return matchesSearch && matchesStatus && matchesTab
  })

  const metrics: CaseStudyMetrics = {
    totalCaseStudies: caseStudies.length,
    publishedCaseStudies: caseStudies.filter(cs => cs.status === 'PUBLISHED').length,
    featuredCaseStudies: caseStudies.filter(cs => cs.featured).length,
    draftCaseStudies: caseStudies.filter(cs => cs.status === 'DRAFT').length,
    totalViews: caseStudies.reduce((acc, cs) => acc + cs.views, 0),
    totalLeads: caseStudies.reduce((acc, cs) => acc + cs.leads, 0),
    avgConversionRate: caseStudies.filter(cs => cs.conversionRate > 0)
      .reduce((acc, cs) => acc + cs.conversionRate, 0) / 
      caseStudies.filter(cs => cs.conversionRate > 0).length || 0,
    topPerformingId: caseStudies.reduce((prev, current) => 
      (prev.views > current.views) ? prev : current
    ).id
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Case Study Manager</h1>
          <p className="text-gray-600">Create, manage, and optimize entrepreneur success stories</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Case Study
          </Button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Studies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.totalCaseStudies}</p>
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
              <p className="text-2xl font-bold">{metrics.publishedCaseStudies}</p>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.featuredCaseStudies}</p>
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{(metrics.totalViews / 1000).toFixed(1)}K</p>
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
              <p className="text-2xl font-bold">{metrics.totalLeads}</p>
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
              <p className="text-2xl font-bold">{metrics.avgConversionRate.toFixed(1)}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Studies</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="review">In Review</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search case studies by title, entrepreneur, or industry..."
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
          <option value="FEATURED">Featured</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Case Studies List */}
      <div className="space-y-4">
        {filteredCaseStudies.map((study, index) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{study.title}</CardTitle>
                      <Badge className={getStatusColor(study.status)}>
                        {study.status}
                      </Badge>
                      {study.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge className={getReviewStatusColor(study.reviewStatus)}>
                        {study.reviewStatus}
                      </Badge>
                      {study.legalApproval && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Legal ✓
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{study.entrepreneurName} • {study.entrepreneurLocation}</span>
                      <span>•</span>
                      <span>{study.businessCount} businesses</span>
                      <span>•</span>
                      <span>Updated: {new Date(study.updatedAt).toLocaleDateString()}</span>
                      {study.publishDate && (
                        <>
                          <span>•</span>
                          <span>Published: {new Date(study.publishDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {study.status === 'PUBLISHED' && (
                    <div className="grid grid-cols-3 gap-4 text-center ml-4">
                      <div>
                        <p className="text-sm text-gray-600">Views</p>
                        <p className="text-lg font-bold">{study.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Leads</p>
                        <p className="text-lg font-bold text-green-600">{study.leads}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">CVR</p>
                        <p className="text-lg font-bold text-purple-600">{study.conversionRate}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Revenue Growth</p>
                    <p className="text-lg font-bold text-blue-600">{study.revenueGrowth}%</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-1">Profit Growth</p>
                    <p className="text-lg font-bold text-green-600">{study.profitGrowth}%</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-1">ROI</p>
                    <p className="text-lg font-bold text-purple-600">{study.roiPercentage}%</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 mb-1">Timeframe</p>
                    <p className="text-lg font-bold text-orange-600">{study.timeframe}</p>
                  </div>
                </div>

                {/* Industries */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Industries:</p>
                  <div className="flex flex-wrap gap-2">
                    {study.industries.map((industry) => (
                      <Badge key={industry} variant="outline" className="text-xs">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm italic text-gray-700">
                    "{study.testimonialQuote}"
                  </p>
                </div>

                {/* Review Status */}
                {study.status === 'IN_REVIEW' && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Pending Review</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        This case study is waiting for approval. 
                        {!study.legalApproval && ' Legal review required.'}
                      </p>
                    </div>
                  </div>
                )}

                {study.reviewStatus === 'APPROVED' && study.reviewedBy && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Approved</p>
                      <p className="text-sm text-green-700 mt-1">
                        Reviewed and approved by {study.reviewedBy}
                      </p>
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
                  {study.status === 'PUBLISHED' && (
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  )}
                  {study.status === 'DRAFT' && (
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit for Review
                    </Button>
                  )}
                  {!study.featured && study.status === 'PUBLISHED' && (
                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4 mr-2" />
                      Feature
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCaseStudies.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No case studies found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus !== 'ALL' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first entrepreneur case study to get started'
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Case Study
          </Button>
        </div>
      )}
    </div>
  )
}