'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Share2, Building, Target, Eye, TrendingUp, Copy, 
  CheckCircle, Clock, AlertCircle, Search, Filter, Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SharedContent {
  id: string
  title: string
  contentType: 'BLOG_POST' | 'LANDING_PAGE' | 'SERVICE_PAGE' | 'CASE_STUDY' | 'PRESS_RELEASE'
  originalBusiness: string
  sharedWithBusinesses: string[]
  shareRequests: ShareRequest[]
  adaptationLevel: 'NONE' | 'MINOR' | 'MODERATE' | 'MAJOR'
  adaptationNotes?: string
  performanceData: {
    [businessName: string]: {
      views: number
      leads: number
      conversionRate: number
      adaptationScore: number
    }
  }
  sharingMetrics: {
    totalViews: number
    totalLeads: number
    avgConversionRate: number
    crossBusinessLift: number
  }
  focusKeywords: string[]
  lastUpdated: string
  nextReview: string
}

interface ShareRequest {
  id: string
  requestingBusiness: string
  requestedBy: string
  requestDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED'
  reason: string
  adaptationRequired: boolean
  estimatedAdaptationHours?: number
  approvedBy?: string
  implementationDate?: string
  notes?: string
}

interface SharingOpportunity {
  id: string
  contentId: string
  contentTitle: string
  sourceBusinesses: string[]
  targetBusiness: string
  opportunityScore: number
  estimatedLift: string
  reasoning: string
  adaptationRequired: boolean
  estimatedHours: number
  keywordMatch: number
  audienceMatch: number
}

export function CrossBusinessContentSharing() {
  const [activeTab, setActiveTab] = useState<'shared' | 'requests' | 'opportunities'>('shared')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState('ALL')
  
  const [sharedContent] = useState<SharedContent[]>([
    {
      id: 'shared-1',
      title: 'Complete Guide to HVAC Maintenance for Multi-Location Businesses',
      contentType: 'BLOG_POST',
      originalBusiness: 'Phoenix HVAC Services',
      sharedWithBusinesses: ['Valley Maintenance Co', 'Desert Air Solutions'],
      shareRequests: [
        {
          id: 'req-1',
          requestingBusiness: 'Valley Maintenance Co',
          requestedBy: 'Mike Rodriguez',
          requestDate: '2024-03-05',
          status: 'APPROVED',
          reason: 'Excellent content that matches our service offerings',
          adaptationRequired: true,
          estimatedAdaptationHours: 3,
          approvedBy: 'Sarah Johnson',
          implementationDate: '2024-03-08',
          notes: 'Updated location references and pricing structure'
        }
      ],
      adaptationLevel: 'MINOR',
      adaptationNotes: 'Updated location-specific information and contact details',
      performanceData: {
        'Phoenix HVAC Services': {
          views: 2450,
          leads: 12,
          conversionRate: 3.2,
          adaptationScore: 100
        },
        'Valley Maintenance Co': {
          views: 1890,
          leads: 9,
          conversionRate: 3.8,
          adaptationScore: 95
        },
        'Desert Air Solutions': {
          views: 1650,
          leads: 7,
          conversionRate: 2.9,
          adaptationScore: 92
        }
      },
      sharingMetrics: {
        totalViews: 5990,
        totalLeads: 28,
        avgConversionRate: 3.3,
        crossBusinessLift: 18.5
      },
      focusKeywords: ['HVAC maintenance', 'multi-location HVAC', 'commercial HVAC service'],
      lastUpdated: '2024-03-15',
      nextReview: '2024-06-15'
    },
    {
      id: 'shared-2',
      title: 'Tax Planning Strategies for Multi-Entity Businesses',
      contentType: 'SERVICE_PAGE',
      originalBusiness: 'Premier Accounting Services',
      sharedWithBusinesses: ['Corporate Law Partners'],
      shareRequests: [
        {
          id: 'req-2',
          requestingBusiness: 'Corporate Law Partners',
          requestedBy: 'Jennifer Walsh',
          requestDate: '2024-03-12',
          status: 'APPROVED',
          reason: 'Complements our legal services for multi-entity clients',
          adaptationRequired: true,
          estimatedAdaptationHours: 5,
          approvedBy: 'Mark Stevens',
          implementationDate: '2024-03-18',
          notes: 'Added legal perspective and compliance considerations'
        }
      ],
      adaptationLevel: 'MODERATE',
      adaptationNotes: 'Added legal compliance section and attorney review notes',
      performanceData: {
        'Premier Accounting Services': {
          views: 1850,
          leads: 8,
          conversionRate: 4.8,
          adaptationScore: 100
        },
        'Corporate Law Partners': {
          views: 1420,
          leads: 6,
          conversionRate: 5.2,
          adaptationScore: 88
        }
      },
      sharingMetrics: {
        totalViews: 3270,
        totalLeads: 14,
        avgConversionRate: 5.0,
        crossBusinessLift: 22.3
      },
      focusKeywords: ['multi-entity tax planning', 'business tax strategies', 'corporate tax optimization'],
      lastUpdated: '2024-03-18',
      nextReview: '2024-06-18'
    }
  ])

  const [shareRequests] = useState<ShareRequest[]>([
    {
      id: 'req-3',
      requestingBusiness: 'Creative Marketing Studio',
      requestedBy: 'Emma Thompson',
      requestDate: '2024-03-20',
      status: 'PENDING',
      reason: 'Want to adapt the resource optimization content for marketing agency use case',
      adaptationRequired: true,
      estimatedAdaptationHours: 8,
      notes: 'Need to update examples to marketing-specific scenarios'
    },
    {
      id: 'req-4',
      requestingBusiness: 'Desert Air Solutions',
      requestedBy: 'Carlos Martinez',
      requestDate: '2024-03-19',
      status: 'PENDING',
      reason: 'Professional services billing content could be adapted for service contracts',
      adaptationRequired: true,
      estimatedAdaptationHours: 4
    }
  ])

  const [sharingOpportunities] = useState<SharingOpportunity[]>([
    {
      id: 'opp-1',
      contentId: 'content-3',
      contentTitle: 'Cross-Business Resource Optimization Strategies',
      sourceBusinesses: ['Strategic Consulting Group'],
      targetBusiness: 'Corporate Law Partners',
      opportunityScore: 87,
      estimatedLift: '15-25% increase in relevant traffic',
      reasoning: 'High keyword overlap (78%) with law firm resource management needs. Content addresses efficiency optimization which is relevant for legal operations.',
      adaptationRequired: true,
      estimatedHours: 6,
      keywordMatch: 78,
      audienceMatch: 82
    },
    {
      id: 'opp-2',
      contentId: 'content-4',
      contentTitle: 'Marketing ROI Calculator for Professional Services',
      sourceBusinesses: ['Creative Marketing Studio'],
      targetBusiness: 'Strategic Consulting Group',
      opportunityScore: 92,
      estimatedLift: '25-35% increase in tool engagement',
      reasoning: 'Perfect audience match (94%) - consulting firms need ROI measurement tools. Minimal adaptation required for consulting use case.',
      adaptationRequired: false,
      estimatedHours: 2,
      keywordMatch: 86,
      audienceMatch: 94
    },
    {
      id: 'opp-3',
      contentId: 'content-2',
      contentTitle: 'Legal Considerations for Business Acquisitions',
      sourceBusinesses: ['Corporate Law Partners'],
      targetBusiness: 'Premier Accounting Services',
      opportunityScore: 84,
      estimatedLift: '20-30% increase in M&A inquiries',
      reasoning: 'Strong keyword match (85%) for accounting firms involved in M&A due diligence. Content complements financial due diligence services.',
      adaptationRequired: true,
      estimatedHours: 5,
      keywordMatch: 85,
      audienceMatch: 79
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'IMPLEMENTED': return 'bg-blue-100 text-blue-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAdaptationColor = (level: string) => {
    switch (level) {
      case 'NONE': return 'bg-green-100 text-green-800'
      case 'MINOR': return 'bg-blue-100 text-blue-800'
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800'
      case 'MAJOR': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOpportunityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const portfolioMetrics = {
    totalSharedContent: sharedContent.length,
    activeRequests: shareRequests.filter(r => r.status === 'PENDING').length,
    totalOpportunities: sharingOpportunities.length,
    avgCrossBusinessLift: Math.round(
      sharedContent.reduce((acc, content) => acc + content.sharingMetrics.crossBusinessLift, 0) / 
      sharedContent.length
    ),
    totalSharedViews: sharedContent.reduce((acc, content) => acc + content.sharingMetrics.totalViews, 0),
    totalSharedLeads: sharedContent.reduce((acc, content) => acc + content.sharingMetrics.totalLeads, 0)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cross-Business Content Sharing</h1>
          <p className="text-gray-600">Maximize content ROI across business portfolio</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Share2 className="h-4 w-4 mr-2" />
            Share Content
          </Button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Shared Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.totalSharedContent}</p>
              <Share2 className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.activeRequests}</p>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.totalOpportunities}</p>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Lift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.avgCrossBusinessLift}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Cross-business</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Shared Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{(portfolioMetrics.totalSharedViews / 1000).toFixed(1)}K</p>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Shared Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.totalSharedLeads}</p>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b">
        {[
          { id: 'shared', label: 'Shared Content', icon: Share2 },
          { id: 'requests', label: 'Share Requests', icon: Clock },
          { id: 'opportunities', label: 'Opportunities', icon: Zap }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id as any)}
            className="border-b-2 border-transparent data-[state=active]:border-purple-500"
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Shared Content Tab */}
      {activeTab === 'shared' && (
        <div className="space-y-4">
          {sharedContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{content.title}</CardTitle>
                        <Badge className={getAdaptationColor(content.adaptationLevel)}>
                          {content.adaptationLevel} ADAPTATION
                        </Badge>
                        <Badge variant="outline">
                          <Building className="h-3 w-3 mr-1" />
                          {content.sharedWithBusinesses.length + 1} businesses
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Original: {content.originalBusiness}</span>
                        <span>•</span>
                        <span>Last Updated: {new Date(content.lastUpdated).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Next Review: {new Date(content.nextReview).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          +{content.sharingMetrics.crossBusinessLift}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Cross-business lift</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Sharing Performance Metrics */}
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Total Views</p>
                      <p className="text-lg font-bold">{content.sharingMetrics.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-1">Total Leads</p>
                      <p className="text-lg font-bold">{content.sharingMetrics.totalLeads}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-900 mb-1">Avg CVR</p>
                      <p className="text-lg font-bold">{content.sharingMetrics.avgConversionRate.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-900 mb-1">Businesses</p>
                      <p className="text-lg font-bold">{content.sharedWithBusinesses.length + 1}</p>
                    </div>
                  </div>

                  {/* Business Performance Breakdown */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Performance by Business:</p>
                    <div className="space-y-2">
                      {Object.entries(content.performanceData).map(([business, data]) => (
                        <div key={business} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{business}</span>
                            {business === content.originalBusiness && (
                              <Badge variant="outline" className="text-xs">Original</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="text-gray-600">Views</p>
                              <p className="font-bold">{data.views.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Leads</p>
                              <p className="font-bold">{data.leads}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">CVR</p>
                              <p className="font-bold">{data.conversionRate}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Score</p>
                              <p className={`font-bold ${data.adaptationScore >= 95 ? 'text-green-600' : 
                                data.adaptationScore >= 90 ? 'text-blue-600' : 'text-yellow-600'}`}>
                                {data.adaptationScore}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Focus Keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {content.focusKeywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Adaptation Notes */}
                  {content.adaptationNotes && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900 mb-1">Adaptation Notes:</p>
                      <p className="text-sm text-yellow-800">{content.adaptationNotes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Performance
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Share to New Business
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Update Adaptations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Share Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {shareRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">Share Request from {request.requestingBusiness}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.adaptationRequired && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Adaptation Required
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Requested by: {request.requestedBy}</span>
                        <span>•</span>
                        <span>Date: {new Date(request.requestDate).toLocaleDateString()}</span>
                        {request.estimatedAdaptationHours && (
                          <>
                            <span>•</span>
                            <span>Est. {request.estimatedAdaptationHours}h adaptation</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Reason for Request:</p>
                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{request.reason}</p>
                  </div>

                  {request.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Additional Notes:</p>
                      <p className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">{request.notes}</p>
                    </div>
                  )}

                  {request.status === 'APPROVED' && request.implementationDate && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-900">Approved & Implemented</p>
                      </div>
                      <p className="text-sm text-green-700">
                        Approved by {request.approvedBy} • Implemented on {new Date(request.implementationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {request.status === 'PENDING' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Request
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Request Changes
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Content
                    </Button>
                    <Button size="sm" variant="outline">
                      <Building className="h-4 w-4 mr-2" />
                      Business Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sharing Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          {sharingOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{opportunity.contentTitle}</CardTitle>
                        <Badge className={getOpportunityColor(opportunity.opportunityScore)}>
                          {opportunity.opportunityScore}% Match
                        </Badge>
                        {!opportunity.adaptationRequired && (
                          <Badge className="bg-green-100 text-green-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Ready to Share
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>For: {opportunity.targetBusiness}</span>
                        <span>•</span>
                        <span>From: {opportunity.sourceBusinesses.join(', ')}</span>
                        <span>•</span>
                        <span>Est. {opportunity.estimatedHours}h {opportunity.adaptationRequired ? 'adaptation' : 'setup'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{opportunity.estimatedLift}</p>
                      <p className="text-xs text-gray-500">Estimated lift</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Match Scores */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-900 mb-1">Overall Score</p>
                      <p className="text-2xl font-bold text-purple-600">{opportunity.opportunityScore}%</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Keyword Match</p>
                      <p className="text-2xl font-bold text-blue-600">{opportunity.keywordMatch}%</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-1">Audience Match</p>
                      <p className="text-2xl font-bold text-green-600">{opportunity.audienceMatch}%</p>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">AI Analysis:</p>
                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{opportunity.reasoning}</p>
                  </div>

                  {/* Adaptation Status */}
                  {opportunity.adaptationRequired ? (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Adaptation Required</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Estimated {opportunity.estimatedHours} hours to customize content for {opportunity.targetBusiness}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Ready to Share</p>
                        <p className="text-sm text-green-700 mt-1">
                          Content can be shared with minimal setup time
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Content
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Content
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Analyze Match
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