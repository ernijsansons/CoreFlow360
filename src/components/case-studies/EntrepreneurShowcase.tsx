'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  TrendingUp, Building, Users, DollarSign, Target, Award, 
  PlayCircle, Download, Share2, Filter, Search, ArrowRight,
  Star, Calendar, MapPin, Clock, ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'

interface EntrepreneurProfile {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'FEATURED'
  featured: boolean
  publishDate: string
  
  // Entrepreneur Details
  entrepreneurName: string
  entrepreneurTitle: string
  entrepreneurBio: string
  entrepreneurPhoto: string
  entrepreneurLocation: string
  yearsInBusiness: number
  
  // Business Portfolio
  businessCount: number
  businessTypes: string[]
  industries: string[]
  businessNames: string[]
  
  // Success Metrics
  beforeRevenue: number
  afterRevenue: number
  beforeEmployees: number
  afterEmployees: number
  revenueGrowth: number
  profitGrowth: number
  efficiencyGain: number
  timeframe: string
  
  // Core Story
  challengeStory: string
  solutionStory: string
  resultsStory: string
  testimonialQuote: string
  
  // ROI Impact
  monthlyTimeSaved: number
  costSavings: number
  revenueIncrease: number
  roiPercentage: number
  paybackPeriod: string
  
  // Content Assets
  videoUrl?: string
  downloadableAssets: string[]
  screenshots: string[]
  
  // Engagement
  views: number
  downloads: number
  leads: number
  shares: number
  conversionRate: number
  
  // Implementation
  implementationTime: string
  keyFeatures: string[]
  successFactors: string[]
  
  targetAudience: string
}

export function EntrepreneurShowcase() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('ALL')
  const [selectedBusinessSize, setSelectedBusinessSize] = useState('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const [caseStudies] = useState<EntrepreneurProfile[]>([
    {
      id: 'case-1',
      title: 'From 2 Struggling Businesses to $8.5M Multi-Business Empire',
      slug: 'sarah-chen-multi-business-empire',
      status: 'FEATURED',
      featured: true,
      publishDate: '2024-03-15',
      
      entrepreneurName: 'Sarah Chen',
      entrepreneurTitle: 'Serial Entrepreneur & Business Portfolio Owner',
      entrepreneurBio: 'Started her first HVAC business in 2018, expanded into property management in 2020. Now runs 4 profitable businesses with CoreFlow360.',
      entrepreneurPhoto: '/images/entrepreneurs/sarah-chen.jpg',
      entrepreneurLocation: 'Phoenix, Arizona',
      yearsInBusiness: 6,
      
      businessCount: 4,
      businessTypes: ['Service Business', 'Property Management', 'Consulting', 'E-commerce'],
      industries: ['HVAC', 'Real Estate', 'Consulting', 'Retail'],
      businessNames: ['Desert Climate Solutions', 'Phoenix Property Partners', 'Chen Business Consulting', 'AC Parts Direct'],
      
      beforeRevenue: 1200000,
      afterRevenue: 8500000,
      beforeEmployees: 8,
      afterEmployees: 45,
      revenueGrowth: 608,
      profitGrowth: 485,
      efficiencyGain: 78,
      timeframe: '18 months',
      
      challengeStory: 'Managing 4 separate businesses with different systems was chaos. No visibility across operations, duplicate customers not being cross-sold, and constant firefighting instead of strategic growth.',
      solutionStory: 'CoreFlow360 unified everything into one intelligent platform. Cross-business insights revealed $2M in untapped opportunities, automated workflows freed up 40 hours per week, and progressive pricing saved 45% on software costs.',
      resultsStory: '608% revenue growth in 18 months. Identified and closed $2.3M in cross-business opportunities. Reduced operational overhead by 35% while scaling from 8 to 45 employees across portfolio.',
      testimonialQuote: 'CoreFlow360 didn\'t just help me manage my businesses - it revealed opportunities I never knew existed. The cross-business insights alone generated over $2M in new revenue.',
      
      monthlyTimeSaved: 160,
      costSavings: 245000,
      revenueIncrease: 7300000,
      roiPercentage: 2980,
      paybackPeriod: '6 weeks',
      
      videoUrl: '/videos/sarah-chen-story.mp4',
      downloadableAssets: ['Sarah Chen Case Study.pdf', 'ROI Calculator Template.xlsx'],
      screenshots: ['dashboard-overview.png', 'cross-business-analytics.png'],
      
      views: 12450,
      downloads: 890,
      leads: 125,
      shares: 67,
      conversionRate: 12.5,
      
      implementationTime: '3 weeks',
      keyFeatures: ['Cross-Business Analytics', 'Progressive Pricing', 'Unified Customer Database', 'Automated Workflows'],
      successFactors: ['Executive buy-in', 'Phased rollout', 'Staff training', 'Data migration'],
      
      targetAudience: 'GROWING'
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
      entrepreneurBio: 'Former Big Law attorney who left to build his own legal empire. Now owns law firm, accounting practice, and consulting group serving 200+ clients.',
      entrepreneurPhoto: '/images/entrepreneurs/michael-rodriguez.jpg',
      entrepreneurLocation: 'Dallas, Texas',
      yearsInBusiness: 12,
      
      businessCount: 3,
      businessTypes: ['Legal Services', 'Accounting', 'Business Consulting'],
      industries: ['Legal', 'Financial Services', 'Consulting'],
      businessNames: ['Rodriguez & Associates Law', 'Lone Star Accounting', 'Strategic Business Partners'],
      
      beforeRevenue: 2800000,
      afterRevenue: 12000000,
      beforeEmployees: 15,
      afterEmployees: 68,
      revenueGrowth: 329,
      profitGrowth: 275,
      efficiencyGain: 65,
      timeframe: '2 years',
      
      challengeStory: 'Three successful but siloed businesses. Clients needing legal, accounting, and consulting services were using competitors because we couldn\'t see the full picture or coordinate effectively.',
      solutionStory: 'CoreFlow360 connected all three practices. Unified client view revealed massive cross-selling opportunities. Resource sharing optimized utilization. Progressive pricing model reduced software costs by 35%.',
      resultsStory: 'Generated $4.2M in cross-business revenue in first year. Improved client retention to 94%. Reduced client acquisition costs by 60% through internal referrals. Scaled from 15 to 68 professionals.',
      testimonialQuote: 'The unified client intelligence is game-changing. We now provide comprehensive solutions instead of fragmented services. Our clients love the seamless experience.',
      
      monthlyTimeSaved: 120,
      costSavings: 180000,
      revenueIncrease: 9200000,
      roiPercentage: 5111,
      paybackPeriod: '4 weeks',
      
      downloadableAssets: ['Professional Services Case Study.pdf', 'Cross-Selling Playbook.pdf'],
      screenshots: ['unified-client-view.png', 'resource-allocation.png'],
      
      views: 8950,
      downloads: 445,
      leads: 89,
      shares: 34,
      conversionRate: 10.8,
      
      implementationTime: '5 weeks',
      keyFeatures: ['Unified Client Database', 'Resource Allocation', 'Cross-Business Billing', 'Performance Analytics'],
      successFactors: ['Partner alignment', 'Client communication', 'System integration', 'Training programs'],
      
      targetAudience: 'ENTERPRISE'
    },
    {
      id: 'case-3',
      title: 'Tech-Enabled HVAC Empire: 12 Locations, $25M Revenue',
      slug: 'jennifer-park-hvac-empire',
      status: 'PUBLISHED',
      featured: false,
      publishDate: '2024-02-28',
      
      entrepreneurName: 'Jennifer Park',
      entrepreneurTitle: 'CEO & Founder',
      entrepreneurBio: 'Former tech executive who revolutionized the HVAC industry. Built a multi-location empire using technology and data-driven operations.',
      entrepreneurPhoto: '/images/entrepreneurs/jennifer-park.jpg',
      entrepreneurLocation: 'Austin, Texas',
      yearsInBusiness: 8,
      
      businessCount: 12,
      businessTypes: ['HVAC Service', 'HVAC Installation', 'Maintenance Contracts', 'Parts Supply'],
      industries: ['HVAC', 'Home Services', 'Commercial Services', 'Supply Chain'],
      businessNames: ['Austin Climate Pro', 'Hill Country HVAC', 'Commercial Climate Solutions', 'Texas HVAC Supply'],
      
      beforeRevenue: 5200000,
      afterRevenue: 25000000,
      beforeEmployees: 32,
      afterEmployees: 185,
      revenueGrowth: 381,
      profitGrowth: 425,
      efficiencyGain: 85,
      timeframe: '3 years',
      
      challengeStory: 'Rapid expansion across 12 locations created operational chaos. Technician scheduling conflicts, inventory shortages, and inconsistent customer experience across locations.',
      solutionStory: 'CoreFlow360\'s multi-location features unified operations. Route optimization reduced drive time by 35%. Shared inventory prevented stockouts. Real-time visibility across all locations.',
      resultsStory: '381% revenue growth while maintaining 96% customer satisfaction. Reduced operational costs by $2.8M annually. Improved technician productivity by 42%. Expanded to 185 employees across portfolio.',
      testimonialQuote: 'CoreFlow360 turned our multi-location chaos into a competitive advantage. We can scale efficiently while maintaining the personal touch customers expect.',
      
      monthlyTimeSaved: 280,
      costSavings: 2800000,
      revenueIncrease: 19800000,
      roiPercentage: 706,
      paybackPeriod: '8 weeks',
      
      videoUrl: '/videos/jennifer-park-hvac-story.mp4',
      downloadableAssets: ['Multi-Location HVAC Case Study.pdf', 'Route Optimization Guide.pdf'],
      screenshots: ['multi-location-dashboard.png', 'route-optimization.png'],
      
      views: 15680,
      downloads: 1250,
      leads: 156,
      shares: 89,
      conversionRate: 8.9,
      
      implementationTime: '8 weeks',
      keyFeatures: ['Multi-Location Management', 'Route Optimization', 'Inventory Sharing', 'Performance Analytics'],
      successFactors: ['Location standardization', 'Staff training', 'Technology adoption', 'Process documentation'],
      
      targetAudience: 'SCALING'
    }
  ])

  const getGrowthColor = (growth: number) => {
    if (growth >= 300) return 'text-emerald-600 bg-emerald-50'
    if (growth >= 200) return 'text-green-600 bg-green-50'
    if (growth >= 100) return 'text-blue-600 bg-blue-50'
    return 'text-purple-600 bg-purple-50'
  }

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'STARTUP': return 'bg-blue-100 text-blue-800'
      case 'GROWING': return 'bg-green-100 text-green-800'
      case 'SCALING': return 'bg-purple-100 text-purple-800'
      case 'ENTERPRISE': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCaseStudies = caseStudies.filter(study => {
    const matchesSearch = searchTerm === '' || 
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.entrepreneurName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.industries.some(industry => industry.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesIndustry = selectedIndustry === 'ALL' || 
      study.industries.includes(selectedIndustry)
    
    const matchesBusinessSize = selectedBusinessSize === 'ALL' || 
      study.targetAudience === selectedBusinessSize
    
    return matchesSearch && matchesIndustry && matchesBusinessSize
  })

  const showcaseMetrics = {
    totalCaseStudies: caseStudies.length,
    featuredCaseStudies: caseStudies.filter(cs => cs.featured).length,
    totalViews: caseStudies.reduce((acc, cs) => acc + cs.views, 0),
    totalLeads: caseStudies.reduce((acc, cs) => acc + cs.leads, 0),
    avgConversionRate: caseStudies.reduce((acc, cs) => acc + cs.conversionRate, 0) / caseStudies.length,
    avgROI: Math.round(caseStudies.reduce((acc, cs) => acc + cs.roiPercentage, 0) / caseStudies.length),
    totalRevenueIncrease: caseStudies.reduce((acc, cs) => acc + cs.revenueIncrease, 0)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Entrepreneur Success Stories</h1>
          <p className="text-gray-600">Real entrepreneurs, real results - discover how business owners built multi-million dollar empires</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download className="h-4 w-4 mr-2" />
            Success Playbook
          </Button>
        </div>
      </div>

      {/* Showcase Metrics */}
      <div className="grid md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Case Studies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{showcaseMetrics.totalCaseStudies}</p>
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{showcaseMetrics.featuredCaseStudies} featured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{(showcaseMetrics.totalViews / 1000).toFixed(1)}K</p>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Leads Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{showcaseMetrics.totalLeads}</p>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{showcaseMetrics.avgConversionRate.toFixed(1)}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{showcaseMetrics.avgROI}%</p>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Return on investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">${(showcaseMetrics.totalRevenueIncrease / 1000000).toFixed(0)}M</p>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Combined increase</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search entrepreneurs, industries, or business types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Industries</option>
          <option value="HVAC">HVAC</option>
          <option value="Legal">Legal</option>
          <option value="Consulting">Consulting</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Financial Services">Financial Services</option>
        </select>
        <select
          value={selectedBusinessSize}
          onChange={(e) => setSelectedBusinessSize(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Stages</option>
          <option value="STARTUP">Startup</option>
          <option value="GROWING">Growing</option>
          <option value="SCALING">Scaling</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className={`grid ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {filteredCaseStudies.map((study, index) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`hover:shadow-lg transition-all duration-200 ${study.featured ? 'ring-2 ring-purple-200' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {study.entrepreneurName.split(' ').map(n => n[0]).join('')}
                    </div>
                    {study.featured && (
                      <div className="absolute -top-2 -right-2">
                        <Star className="h-6 w-6 text-yellow-500 fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{study.entrepreneurName}</h3>
                      <Badge className={getAudienceColor(study.targetAudience)}>
                        {study.targetAudience}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{study.entrepreneurTitle}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {study.entrepreneurLocation}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {study.yearsInBusiness}y experience
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold text-base mb-2">{study.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{study.challengeStory}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{study.businessCount}</p>
                    <p className="text-xs text-blue-700">Businesses</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{study.revenueGrowth}%</p>
                    <p className="text-xs text-green-700">Revenue Growth</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">${(study.afterRevenue / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-purple-700">Current Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">{study.roiPercentage}%</p>
                    <p className="text-xs text-orange-700">ROI</p>
                  </div>
                </div>

                {/* Business Types */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Business Portfolio:</p>
                  <div className="flex flex-wrap gap-1">
                    {study.businessTypes.slice(0, 3).map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {study.businessTypes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{study.businessTypes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm italic text-gray-700 line-clamp-3">
                    "{study.testimonialQuote}"
                  </p>
                </div>

                {/* Performance Metrics */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{study.views.toLocaleString()} views</span>
                  <span>{study.leads} leads</span>
                  <span>{study.conversionRate}% CVR</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Read Full Story
                  </Button>
                  {study.videoUrl && (
                    <Button size="sm" variant="outline">
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h3>
            <p className="text-gray-600 mb-6">
              Join 500+ multi-business entrepreneurs who've transformed their operations with CoreFlow360. 
              See how our progressive pricing can save you 20-50% while scaling your empire.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Target className="h-4 w-4 mr-2" />
                Calculate Your Savings
              </Button>
              <Button size="lg" variant="outline">
                <PlayCircle className="h-4 w-4 mr-2" />
                Watch Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}