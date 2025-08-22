'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Filter, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Target,
  DollarSign,
  Calendar,
  Users,
  Building,
  Brain,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  Star,
  Clock,
  MapPin,
  Globe,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react'

interface AcquisitionOpportunity {
  id: string
  businessName: string
  businessType: string
  industry: string
  location?: string
  website?: string
  employees?: number
  yearFounded?: number
  annualRevenue?: number
  grossProfit?: number
  netIncome?: number
  askingPrice?: number
  estimatedValuation?: number
  status: string
  acquisitionType: string
  strategicFit?: string
  aiScore?: number
  aiRecommendation?: string
  dueDiligenceStatus?: string
  expectedSynergies?: number
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  discoveredAt: Date
  targetCloseDate?: Date
}

interface AcquisitionDashboardProps {
  className?: string
}

const AcquisitionDashboard: React.FC<AcquisitionDashboardProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'OPPORTUNITIES' | 'PIPELINE' | 'ANALYTICS' | 'MARKET'>('OVERVIEW')
  const [opportunities, setOpportunities] = useState<AcquisitionOpportunity[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<AcquisitionOpportunity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterIndustry, setFilterIndustry] = useState<string>('ALL')
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    loadOpportunities()
  }, [])

  useEffect(() => {
    filterOpportunities()
  }, [opportunities, searchTerm, filterStatus, filterIndustry])

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/acquisition/opportunities')
      const data = await response.json()
      
      if (data.success) {
        setOpportunities(data.data.opportunities)
        setAnalytics(data.data.analytics)
      }
    } catch (error) {
      console.error('Failed to load opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOpportunities = () => {
    let filtered = opportunities

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(opp => 
        opp.businessName.toLowerCase().includes(term) ||
        opp.industry.toLowerCase().includes(term) ||
        opp.location?.toLowerCase().includes(term)
      )
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(opp => opp.status === filterStatus)
    }

    if (filterIndustry !== 'ALL') {
      filtered = filtered.filter(opp => opp.industry === filterIndustry)
    }

    setFilteredOpportunities(filtered)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'IDENTIFIED': 'bg-blue-100 text-blue-800',
      'EVALUATING': 'bg-yellow-100 text-yellow-800',
      'DUE_DILIGENCE': 'bg-orange-100 text-orange-800',
      'NEGOTIATING': 'bg-purple-100 text-purple-800',
      'CLOSED_WON': 'bg-green-100 text-green-800',
      'CLOSED_LOST': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getAIScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount)
  }

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalOpportunities || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.activeOpportunities || 0}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-600">Avg 8 weeks to close</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics?.totalEstimatedValue)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{formatCurrency(analytics?.totalExpectedSynergies)} synergies</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Potential</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.highPotentialOpportunities || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Brain className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600">AI Score 80+</span>
          </div>
        </div>
      </div>

      {/* Pipeline Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Status</h3>
          <div className="space-y-3">
            {analytics?.statusDistribution && Object.entries(analytics.statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(status).split(' ')[0]}`}></div>
                  <span className="text-sm font-medium text-gray-700">{status.replace('_', ' ')}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Distribution</h3>
          <div className="space-y-3">
            {analytics?.industryDistribution && Object.entries(analytics.industryDistribution).slice(0, 5).map(([industry, count]) => (
              <div key={industry} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{industry}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${((count as number) / analytics.totalOpportunities) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Opportunities */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Opportunities</h3>
          <button
            onClick={() => setActiveTab('OPPORTUNITIES')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="space-y-4">
          {filteredOpportunities.slice(0, 3).map((opportunity) => (
            <div key={opportunity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 mr-3">{opportunity.businessName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Industry:</span> {opportunity.industry}
                    </div>
                    <div>
                      <span className="font-medium">Revenue:</span> {formatCurrency(opportunity.annualRevenue)}
                    </div>
                    <div>
                      <span className="font-medium">Asking:</span> {formatCurrency(opportunity.askingPrice)}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">AI Score:</span>
                      <span className={`font-bold ${getAIScoreColor(opportunity.aiScore)}`}>
                        {opportunity.aiScore || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const renderOpportunities = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="IDENTIFIED">Identified</option>
            <option value="EVALUATING">Evaluating</option>
            <option value="DUE_DILIGENCE">Due Diligence</option>
            <option value="NEGOTIATING">Negotiating</option>
            <option value="CLOSED_WON">Closed Won</option>
            <option value="CLOSED_LOST">Closed Lost</option>
          </select>
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Renewable Energy">Renewable Energy</option>
            <option value="Professional Services">Professional Services</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Opportunity
          </button>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 mr-3">{opportunity.businessName}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(opportunity.status)}`}>
                    {opportunity.status.replace('_', ' ')}
                  </span>
                  {opportunity.aiScore && opportunity.aiScore >= 80 && (
                    <Star className="w-5 h-5 text-yellow-500 ml-2" />
                  )}
                </div>
                <p className="text-gray-600 mb-3">{opportunity.businessType} • {opportunity.industry}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  {opportunity.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {opportunity.location}
                    </div>
                  )}
                  {opportunity.employees && (
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {opportunity.employees} employees
                    </div>
                  )}
                  {opportunity.annualRevenue && (
                    <div className="flex items-center text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {formatCurrency(opportunity.annualRevenue)} revenue
                    </div>
                  )}
                  {opportunity.askingPrice && (
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatCurrency(opportunity.askingPrice)} asking
                    </div>
                  )}
                  {opportunity.aiScore && (
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-1 text-purple-500" />
                      <span className={`font-semibold ${getAIScoreColor(opportunity.aiScore)}`}>
                        {opportunity.aiScore} AI Score
                      </span>
                    </div>
                  )}
                  {opportunity.targetCloseDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      Target: {new Date(opportunity.targetCloseDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                {opportunity.aiRecommendation && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">AI Recommendation</p>
                    <p className={`text-sm font-medium ${
                      opportunity.aiRecommendation.includes('STRONG_BUY') ? 'text-green-600' :
                      opportunity.aiRecommendation.includes('BUY') ? 'text-blue-600' :
                      opportunity.aiRecommendation.includes('CONDITIONAL') ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {opportunity.aiRecommendation.split(':')[0]}
                    </p>
                  </div>
                )}
                <div className="flex space-x-2">
                  {opportunity.contactEmail && (
                    <a
                      href={`mailto:${opportunity.contactEmail}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {opportunity.contactPhone && (
                    <a
                      href={`tel:${opportunity.contactPhone}`}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {opportunity.website && (
                    <a
                      href={opportunity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {opportunity.dueDiligenceStatus && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-1" />
                  Due Diligence: {opportunity.dueDiligenceStatus.replace('_', ' ')}
                </div>
                {opportunity.expectedSynergies && (
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {formatCurrency(opportunity.expectedSynergies)} synergies
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderPipeline = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Pipeline</h3>
        <div className="space-y-4">
          {['IDENTIFIED', 'EVALUATING', 'DUE_DILIGENCE', 'NEGOTIATING'].map((stage) => {
            const stageOpportunities = filteredOpportunities.filter(opp => opp.status === stage)
            return (
              <div key={stage} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{stage.replace('_', ' ')}</h4>
                  <span className="text-sm text-gray-500">{stageOpportunities.length} opportunities</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stageOpportunities.map((opp) => (
                    <div key={opp.id} className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900">{opp.businessName}</h5>
                      <p className="text-sm text-gray-600">{opp.industry}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">{formatCurrency(opp.askingPrice)}</span>
                        {opp.aiScore && (
                          <span className={`text-sm font-medium ${getAIScoreColor(opp.aiScore)}`}>
                            {opp.aiScore}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )

  const renderAnalytics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Deal Size</span>
              <span className="font-semibold">{formatCurrency(analytics?.averageAskingPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average AI Score</span>
              <span className="font-semibold">{analytics?.averageAiScore || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Pipeline Value</span>
              <span className="font-semibold">{formatCurrency(analytics?.totalAskingPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expected Synergies</span>
              <span className="font-semibold text-green-600">{formatCurrency(analytics?.totalExpectedSynergies)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Types</h3>
          <div className="space-y-3">
            {analytics?.typeDistribution && Object.entries(analytics.typeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-600">{type.replace('_', ' ')}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${((count as number) / analytics.totalOpportunities) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderMarketIntelligence = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Intelligence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">3.2x</div>
            <div className="text-sm text-gray-600">Average Revenue Multiple</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12%</div>
            <div className="text-sm text-gray-600">Market Growth Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">$2.4B</div>
            <div className="text-sm text-gray-600">Total Market Size</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Trends</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-green-800">Technology Sector</h4>
              <p className="text-sm text-green-600">High demand, increasing valuations</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-800">Healthcare</h4>
              <p className="text-sm text-blue-600">Stable growth, regulatory considerations</p>
            </div>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div>
              <h4 className="font-medium text-yellow-800">Manufacturing</h4>
              <p className="text-sm text-yellow-600">Consolidation opportunities, automation focus</p>
            </div>
            <Building className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </motion.div>
  )

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: BarChart3 },
    { id: 'OPPORTUNITIES', label: 'Opportunities', icon: Target },
    { id: 'PIPELINE', label: 'Pipeline', icon: Activity },
    { id: 'ANALYTICS', label: 'Analytics', icon: PieChart },
    { id: 'MARKET', label: 'Market Intel', icon: Globe }
  ]

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Acquisition Intelligence</h1>
          <p className="text-gray-600 mt-2">AI-powered acquisition opportunities and due diligence management</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'OVERVIEW' && renderOverview()}
          {activeTab === 'OPPORTUNITIES' && renderOpportunities()}
          {activeTab === 'PIPELINE' && renderPipeline()}
          {activeTab === 'ANALYTICS' && renderAnalytics()}
          {activeTab === 'MARKET' && renderMarketIntelligence()}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AcquisitionDashboard