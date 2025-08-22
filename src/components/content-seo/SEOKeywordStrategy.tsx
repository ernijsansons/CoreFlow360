'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, TrendingUp, TrendingDown, Target, AlertCircle,
  Building, Eye, MousePointer, BarChart3, Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

interface KeywordData {
  id: string
  keyword: string
  keywordGroup?: string
  targetBusinesses: string[]
  primaryBusiness: string
  competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  searchVolume: number
  difficulty: number
  costPerClick: number
  commercialIntent: 'LOW' | 'MEDIUM' | 'HIGH'
  currentRanking?: number
  previousRanking?: number
  rankingTrend: 'UP' | 'DOWN' | 'STABLE' | 'NEW'
  impressions: number
  clicks: number
  contentGaps: string[]
  targetedContent: string[]
  contentPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  topCompetitors: string[]
  opportunityScore: number
}

export function SEOKeywordStrategy() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL')
  
  const [keywords] = useState<KeywordData[]>([
    {
      id: 'kw-1',
      keyword: 'HVAC maintenance multi-location',
      keywordGroup: 'HVAC Services',
      targetBusinesses: ['Phoenix HVAC Services', 'Valley Maintenance Co', 'Desert Air Solutions'],
      primaryBusiness: 'Phoenix HVAC Services',
      competitionLevel: 'MEDIUM',
      searchVolume: 2900,
      difficulty: 45,
      costPerClick: 3.85,
      commercialIntent: 'HIGH',
      currentRanking: 8,
      previousRanking: 12,
      rankingTrend: 'UP',
      impressions: 5420,
      clicks: 186,
      contentGaps: ['Installation guide', 'Cost calculator', 'Service comparison'],
      targetedContent: ['content-1'],
      contentPriority: 'HIGH',
      topCompetitors: ['ServiceTitan', 'FieldEdge', 'JobNimbus'],
      opportunityScore: 78
    },
    {
      id: 'kw-2',
      keyword: 'business acquisition legal services',
      keywordGroup: 'Legal Services',
      targetBusinesses: ['Corporate Law Partners'],
      primaryBusiness: 'Corporate Law Partners',
      competitionLevel: 'HIGH',
      searchVolume: 1800,
      difficulty: 72,
      costPerClick: 12.50,
      commercialIntent: 'HIGH',
      currentRanking: 15,
      previousRanking: 18,
      rankingTrend: 'UP',
      impressions: 3240,
      clicks: 89,
      contentGaps: ['Due diligence checklist', 'Legal timeline', 'Cost breakdown'],
      targetedContent: ['content-2'],
      contentPriority: 'CRITICAL',
      topCompetitors: ['BigLaw Firm', 'Corporate Legal Solutions', 'M&A Legal Group'],
      opportunityScore: 85
    },
    {
      id: 'kw-3',
      keyword: 'professional services resource allocation',
      keywordGroup: 'Consulting Services',
      targetBusinesses: ['Strategic Consulting Group', 'Corporate Law Partners', 'Premier Accounting Services'],
      primaryBusiness: 'Strategic Consulting Group',
      competitionLevel: 'MEDIUM',
      searchVolume: 1200,
      difficulty: 38,
      costPerClick: 4.75,
      commercialIntent: 'MEDIUM',
      currentRanking: 6,
      previousRanking: 8,
      rankingTrend: 'UP',
      impressions: 2180,
      clicks: 145,
      contentGaps: ['Software comparison', 'Best practices guide', 'ROI calculator'],
      targetedContent: ['content-3'],
      contentPriority: 'HIGH',
      topCompetitors: ['McKinsey', 'Deloitte', 'PwC Consulting'],
      opportunityScore: 72
    },
    {
      id: 'kw-4',
      keyword: 'marketing ROI calculator professional services',
      keywordGroup: 'Marketing Tools',
      targetBusinesses: ['Creative Marketing Studio'],
      primaryBusiness: 'Creative Marketing Studio',
      competitionLevel: 'LOW',
      searchVolume: 850,
      difficulty: 28,
      costPerClick: 6.20,
      commercialIntent: 'HIGH',
      currentRanking: 3,
      previousRanking: 5,
      rankingTrend: 'UP',
      impressions: 1820,
      clicks: 248,
      contentGaps: ['Industry benchmarks', 'Case studies', 'Implementation guide'],
      targetedContent: ['content-4'],
      contentPriority: 'MEDIUM',
      topCompetitors: ['HubSpot', 'Marketo', 'Salesforce Marketing'],
      opportunityScore: 68
    },
    {
      id: 'kw-5',
      keyword: 'multi-entity tax planning strategies',
      keywordGroup: 'Tax Services',
      targetBusinesses: ['Premier Accounting Services', 'Corporate Law Partners'],
      primaryBusiness: 'Premier Accounting Services',
      competitionLevel: 'HIGH',
      searchVolume: 1600,
      difficulty: 68,
      costPerClick: 8.95,
      commercialIntent: 'HIGH',
      currentRanking: 22,
      previousRanking: 25,
      rankingTrend: 'UP',
      impressions: 2450,
      clicks: 45,
      contentGaps: ['Strategy comparison', 'Compliance guide', 'Savings calculator'],
      targetedContent: ['content-5'],
      contentPriority: 'CRITICAL',
      topCompetitors: ['Deloitte Tax', 'EY Tax Services', 'KPMG Tax'],
      opportunityScore: 82
    },
    {
      id: 'kw-6',
      keyword: 'cross-business analytics dashboard',
      keywordGroup: 'Business Intelligence',
      targetBusinesses: ['Strategic Consulting Group', 'Creative Marketing Studio'],
      primaryBusiness: 'Strategic Consulting Group',
      competitionLevel: 'MEDIUM',
      searchVolume: 950,
      difficulty: 42,
      costPerClick: 5.40,
      commercialIntent: 'MEDIUM',
      rankingTrend: 'NEW',
      impressions: 0,
      clicks: 0,
      contentGaps: ['Feature comparison', 'Implementation guide', 'Use cases'],
      targetedContent: [],
      contentPriority: 'HIGH',
      topCompetitors: ['Tableau', 'PowerBI', 'Looker'],
      opportunityScore: 75
    }
  ])

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600 bg-green-50'
    if (difficulty < 50) return 'text-yellow-600 bg-yellow-50'
    if (difficulty < 70) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'VERY_HIGH': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'DOWN': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'STABLE': return <BarChart3 className="h-4 w-4 text-gray-600" />
      case 'NEW': return <Zap className="h-4 w-4 text-blue-600" />
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />
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

  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = searchTerm === '' || 
      keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      keyword.keywordGroup?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBusiness = selectedBusiness === 'ALL' || 
      keyword.primaryBusiness === selectedBusiness ||
      keyword.targetBusinesses.includes(selectedBusiness)
    
    const matchesDifficulty = selectedDifficulty === 'ALL' || 
      keyword.competitionLevel === selectedDifficulty
    
    return matchesSearch && matchesBusiness && matchesDifficulty
  })

  const portfolioMetrics = {
    totalKeywords: keywords.length,
    avgDifficulty: Math.round(keywords.reduce((acc, kw) => acc + kw.difficulty, 0) / keywords.length),
    totalSearchVolume: keywords.reduce((acc, kw) => acc + kw.searchVolume, 0),
    avgOpportunityScore: Math.round(keywords.reduce((acc, kw) => acc + kw.opportunityScore, 0) / keywords.length),
    rankedKeywords: keywords.filter(kw => kw.currentRanking).length,
    contentGaps: keywords.reduce((acc, kw) => acc + kw.contentGaps.length, 0)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">SEO Keyword Strategy</h1>
          <p className="text-gray-600">Multi-business keyword research and optimization</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Competitor Analysis
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Search className="h-4 w-4 mr-2" />
            Research Keywords
          </Button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.totalKeywords}</p>
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.avgDifficulty}</p>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Search Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{(portfolioMetrics.totalSearchVolume / 1000).toFixed(1)}K</p>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Opportunity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.avgOpportunityScore}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Ranked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.rankedKeywords}</p>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently ranking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Content Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{portfolioMetrics.contentGaps}</p>
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search keywords or groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Difficulty</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="VERY_HIGH">Very High</option>
        </select>
      </div>

      {/* Keyword List */}
      <div className="space-y-4">
        {filteredKeywords.map((keyword, index) => (
          <motion.div
            key={keyword.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{keyword.keyword}</CardTitle>
                      {keyword.keywordGroup && (
                        <Badge variant="outline">{keyword.keywordGroup}</Badge>
                      )}
                      <Badge className={getCompetitionColor(keyword.competitionLevel)}>
                        {keyword.competitionLevel} COMP
                      </Badge>
                      <Badge className={getPriorityColor(keyword.contentPriority)}>
                        {keyword.contentPriority} PRIORITY
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Primary: {keyword.primaryBusiness}</span>
                      {keyword.targetBusinesses.length > 1 && (
                        <>
                          <span>•</span>
                          <span>{keyword.targetBusinesses.length} businesses</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {keyword.currentRanking && (
                      <div className="text-center">
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">#{keyword.currentRanking}</p>
                          {getTrendIcon(keyword.rankingTrend)}
                        </div>
                        <p className="text-xs text-gray-500">Current Rank</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-lg font-bold">{keyword.opportunityScore}%</p>
                      <p className="text-xs text-gray-500">Opportunity</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Keyword Metrics */}
                <div className="grid md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">Search Volume</p>
                    </div>
                    <p className="text-lg font-bold">{keyword.searchVolume.toLocaleString()}</p>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${getDifficultyColor(keyword.difficulty)}`}>
                    <p className="text-sm font-medium mb-1">Difficulty</p>
                    <p className="text-lg font-bold">{keyword.difficulty}/100</p>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-1">CPC</p>
                    <p className="text-lg font-bold">${keyword.costPerClick.toFixed(2)}</p>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <MousePointer className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-900">Impressions</p>
                    </div>
                    <p className="text-lg font-bold">{keyword.impressions.toLocaleString()}</p>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 mb-1">Clicks</p>
                    <p className="text-lg font-bold">{keyword.clicks}</p>
                    {keyword.impressions > 0 && (
                      <p className="text-xs text-orange-700">
                        CTR: {((keyword.clicks / keyword.impressions) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Target Businesses */}
                {keyword.targetBusinesses.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Target Businesses:</p>
                    <div className="flex flex-wrap gap-2">
                      {keyword.targetBusinesses.map((business) => (
                        <Badge key={business} variant="outline" className="text-xs">
                          <Building className="h-3 w-3 mr-1" />
                          {business}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Gaps */}
                {keyword.contentGaps.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Content Opportunities:</p>
                    <div className="flex flex-wrap gap-2">
                      {keyword.contentGaps.map((gap, gapIndex) => (
                        <Badge key={gapIndex} className="bg-yellow-100 text-yellow-800 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Competitors */}
                {keyword.topCompetitors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Top Competitors:</p>
                    <div className="flex flex-wrap gap-2">
                      {keyword.topCompetitors.map((competitor) => (
                        <Badge key={competitor} variant="outline" className="text-xs">
                          {competitor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Create Content
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Track Rankings
                  </Button>
                  <Button size="sm" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Competitor Analysis
                  </Button>
                  {keyword.contentGaps.length > 0 && (
                    <Button size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Fill Content Gaps
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}