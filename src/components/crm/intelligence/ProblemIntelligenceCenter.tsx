'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RadarIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  FireIcon,
  BoltIcon,
  CpuChipIcon,
  ChartBarIcon,
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BellIcon,
  PauseIcon,
  PlayIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface ProblemIntelligence {
  id: string
  companyId: string
  companyName: string
  industry: string
  
  // Problem Details
  title: string
  description: string
  category: string
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL' | 'EXISTENTIAL'
  status: 'DETECTED' | 'ANALYZING' | 'CONFIRMED' | 'ADDRESSED' | 'RESOLVED'
  confidence: number
  
  // Source & Detection
  detectedAt: string
  sources: string[]
  detectionMethod: 'AI' | 'PATTERN' | 'RULE' | 'HUMAN'
  
  // Business Impact
  revenueImpact: number
  affectedCustomers: number
  urgency: number
  
  // Solution Intelligence
  solutionFitScore: number
  estimatedDealSize: number
  implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'ENTERPRISE'
  
  // Stakeholders
  stakeholders: Array<{
    name: string
    title: string
    role: string
    influence: number
  }>
  
  // AI Insights
  aiInsights: Array<{
    type: 'RECOMMENDATION' | 'PREDICTION' | 'WARNING' | 'OPPORTUNITY'
    message: string
    confidence: number
    action?: string
  }>
  
  // Metadata
  tags: string[]
  lastUpdated: string
}

interface CompanyIntelligence {
  id: string
  name: string
  domain: string
  industry: string
  size: string
  
  // Monitoring Status
  monitoringStatus: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  lastAnalyzed: string
  nextAnalysis: string
  
  // Health Scores
  healthScore: number
  riskScore: number
  opportunityScore: number
  
  // Problem Summary
  totalProblems: number
  criticalProblems: number
  newProblemsToday: number
  
  // Active Agents
  activeAgents: number
  agentStatus: Array<{
    type: string
    status: 'ACTIVE' | 'PAUSED' | 'ERROR'
    lastExecution: string
  }>
}

interface IntelligenceAgent {
  id: string
  name: string
  type: string
  status: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'INITIALIZING'
  company: string
  lastExecution: string
  nextExecution: string
  successRate: number
  problemsDetected: number
}

const MOCK_PROBLEMS: ProblemIntelligence[] = [
  {
    id: 'prob_1',
    companyId: 'comp_1',
    companyName: 'TechStart Inc',
    industry: 'Technology',
    title: 'Customer Service Response Time Issues',
    description: 'Multiple social media complaints about 3+ hour wait times for customer support, causing customer frustration and potential churn.',
    category: 'Customer Service',
    severity: 'MAJOR',
    status: 'CONFIRMED',
    confidence: 87,
    detectedAt: '2024-01-10T08:30:00Z',
    sources: ['SOCIAL_MEDIA', 'CUSTOMER_FEEDBACK'],
    detectionMethod: 'AI',
    revenueImpact: 125000,
    affectedCustomers: 450,
    urgency: 85,
    solutionFitScore: 92,
    estimatedDealSize: 75000,
    implementationComplexity: 'MEDIUM',
    stakeholders: [
      { name: 'Sarah Chen', title: 'VP Customer Success', role: 'CHAMPION', influence: 85 },
      { name: 'Mike Rodriguez', title: 'CEO', role: 'DECISION_MAKER', influence: 95 }
    ],
    aiInsights: [
      {
        type: 'RECOMMENDATION',
        message: 'Implement automated ticketing system to reduce response times by 60%',
        confidence: 92,
        action: 'Schedule demo of ticketing solution'
      },
      {
        type: 'PREDICTION',
        message: 'Problem likely to escalate within 2 weeks if not addressed',
        confidence: 78
      }
    ],
    tags: ['urgent', 'customer-facing', 'scalability'],
    lastUpdated: '2024-01-10T09:15:00Z'
  },
  {
    id: 'prob_2',
    companyId: 'comp_2',
    companyName: 'FinCorp Solutions',
    industry: 'Finance',
    title: 'Regulatory Compliance Gaps',
    description: 'Recent audit revealed gaps in SOX compliance reporting, creating potential regulatory risk and audit failures.',
    category: 'Compliance',
    severity: 'CRITICAL',
    status: 'DETECTED',
    confidence: 94,
    detectedAt: '2024-01-10T07:45:00Z',
    sources: ['REGULATORY_FILING', 'INDUSTRY_REPORT'],
    detectionMethod: 'PATTERN',
    revenueImpact: 500000,
    affectedCustomers: 0,
    urgency: 95,
    solutionFitScore: 88,
    estimatedDealSize: 250000,
    implementationComplexity: 'HIGH',
    stakeholders: [
      { name: 'David Kim', title: 'Chief Compliance Officer', role: 'DECISION_MAKER', influence: 90 },
      { name: 'Lisa Wong', title: 'CFO', role: 'BUDGET_OWNER', influence: 95 }
    ],
    aiInsights: [
      {
        type: 'WARNING',
        message: 'Regulatory penalties possible within 30 days if not addressed',
        confidence: 85,
        action: 'Emergency compliance audit required'
      }
    ],
    tags: ['regulatory', 'high-risk', 'finance'],
    lastUpdated: '2024-01-10T08:00:00Z'
  }
]

const MOCK_COMPANIES: CompanyIntelligence[] = [
  {
    id: 'comp_1',
    name: 'TechStart Inc',
    domain: 'techstart.com',
    industry: 'Technology',
    size: 'Medium',
    monitoringStatus: 'ACTIVE',
    lastAnalyzed: '2024-01-10T09:00:00Z',
    nextAnalysis: '2024-01-10T10:00:00Z',
    healthScore: 72,
    riskScore: 65,
    opportunityScore: 88,
    totalProblems: 5,
    criticalProblems: 1,
    newProblemsToday: 2,
    activeAgents: 6,
    agentStatus: [
      { type: 'Social Media', status: 'ACTIVE', lastExecution: '2024-01-10T09:00:00Z' },
      { type: 'News', status: 'ACTIVE', lastExecution: '2024-01-10T08:45:00Z' },
      { type: 'Financial', status: 'PAUSED', lastExecution: '2024-01-09T18:00:00Z' }
    ]
  }
]

const MOCK_AGENTS: IntelligenceAgent[] = [
  {
    id: 'agent_1',
    name: 'Social Media Monitor - TechStart',
    type: 'SOCIAL_MEDIA',
    status: 'ACTIVE',
    company: 'TechStart Inc',
    lastExecution: '2024-01-10T09:00:00Z',
    nextExecution: '2024-01-10T09:05:00Z',
    successRate: 96,
    problemsDetected: 12
  }
]

export default function ProblemIntelligenceCenter() {
  const [problems, setProblems] = useState<ProblemIntelligence[]>([])
  const [companies, setCompanies] = useState<CompanyIntelligence[]>([])
  const [agents, setAgents] = useState<IntelligenceAgent[]>([])
  const [selectedView, setSelectedView] = useState<'problems' | 'companies' | 'agents'>('problems')
  const [selectedProblem, setSelectedProblem] = useState<ProblemIntelligence | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL')
  const [filterIndustry, setFilterIndustry] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntelligenceData()
    
    if (isRealTimeEnabled) {
      const interval = setInterval(loadIntelligenceData, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isRealTimeEnabled])

  const loadIntelligenceData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProblems(MOCK_PROBLEMS)
      setCompanies(MOCK_COMPANIES)
      setAgents(MOCK_AGENTS)
    } catch (error) {
      toast.error('Failed to load intelligence data')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'EXISTENTIAL': return 'text-red-900 bg-red-100 border-red-500'
      case 'CRITICAL': return 'text-red-700 bg-red-50 border-red-400'
      case 'MAJOR': return 'text-orange-700 bg-orange-50 border-orange-400'
      case 'MODERATE': return 'text-yellow-700 bg-yellow-50 border-yellow-400'
      case 'MINOR': return 'text-blue-700 bg-blue-50 border-blue-400'
      default: return 'text-gray-700 bg-gray-50 border-gray-400'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'EXISTENTIAL': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      case 'CRITICAL': return <FireIcon className="w-5 h-5 text-red-500" />
      case 'MAJOR': return <ExclamationCircleIcon className="w-5 h-5 text-orange-500" />
      case 'MODERATE': return <InformationCircleIcon className="w-5 h-5 text-yellow-500" />
      case 'MINOR': return <CheckCircleIcon className="w-5 h-5 text-blue-500" />
      default: return <InformationCircleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const filteredProblems = problems.filter(problem => {
    const matchesSeverity = filterSeverity === 'ALL' || problem.severity === filterSeverity
    const matchesIndustry = filterIndustry === 'ALL' || problem.industry === filterIndustry
    const matchesSearch = searchTerm === '' || 
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSeverity && matchesIndustry && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading problem intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RadarIcon className="w-10 h-10 text-purple-600 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Problem Intelligence Mission Control
                </h1>
                <p className="text-lg text-gray-600">
                  Real-time autonomous problem discovery and analysis across all monitored companies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center ${
                  isRealTimeEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <BoltIcon className="w-4 h-4 mr-2" />
                Real-time {isRealTimeEnabled ? 'ON' : 'OFF'}
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2 inline" />
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-gray-900">
                {problems.filter(p => p.severity === 'CRITICAL' || p.severity === 'EXISTENTIAL').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Critical Problems</h3>
            <p className="text-sm text-gray-600">Requiring immediate attention</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{companies.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Monitored Companies</h3>
            <p className="text-sm text-gray-600">Active intelligence gathering</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <CpuChipIcon className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {agents.filter(a => a.status === 'ACTIVE').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active Agents</h3>
            <p className="text-sm text-gray-600">Autonomous intelligence gathering</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">
                ${(problems.reduce((sum, p) => sum + p.estimatedDealSize, 0) / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Value</h3>
            <p className="text-sm text-gray-600">From detected opportunities</p>
          </motion.div>
        </div>

        {/* View Selector */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'problems', name: 'Problems', icon: ExclamationTriangleIcon },
              { id: 'companies', name: 'Companies', icon: BuildingOfficeIcon },
              { id: 'agents', name: 'Agents', icon: CpuChipIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  selectedView === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {selectedView === 'problems' && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Search problems..."
                />
              </div>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="ALL">All Severities</option>
                <option value="EXISTENTIAL">Existential</option>
                <option value="CRITICAL">Critical</option>
                <option value="MAJOR">Major</option>
                <option value="MODERATE">Moderate</option>
                <option value="MINOR">Minor</option>
              </select>

              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="ALL">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Manufacturing">Manufacturing</option>
              </select>

              <div className="text-sm text-gray-600">
                {filteredProblems.length} of {problems.length} problems
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedView === 'problems' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Detected Problems</h3>
                <div className="space-y-4">
                  {filteredProblems.map((problem) => (
                    <motion.div
                      key={problem.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProblem?.id === problem.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProblem(problem)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getSeverityIcon(problem.severity)}
                            <h4 className="font-semibold text-gray-900 ml-2">{problem.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {problem.companyName} • {problem.industry}
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {problem.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(problem.severity)}`}>
                            {problem.severity}
                          </span>
                          <div className="text-xs text-gray-500">
                            {problem.confidence}% confident
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Revenue Impact</span>
                          <p className="font-medium">${(problem.revenueImpact / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Deal Size</span>
                          <p className="font-medium">${(problem.estimatedDealSize / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Solution Fit</span>
                          <p className="font-medium text-green-600">{problem.solutionFitScore}%</p>
                        </div>
                      </div>

                      {/* Urgency Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Urgency</span>
                          <span>{problem.urgency}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              problem.urgency > 80 ? 'bg-red-500' :
                              problem.urgency > 60 ? 'bg-orange-500' :
                              problem.urgency > 40 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${problem.urgency}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'companies' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Monitored Companies</h3>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{company.name}</h4>
                          <p className="text-sm text-gray-600">{company.industry} • {company.size}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            company.monitoringStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-sm text-gray-600">{company.monitoringStatus}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Health Score</span>
                          <p className="font-medium">{company.healthScore}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Risk Score</span>
                          <p className="font-medium text-red-600">{company.riskScore}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Opportunity Score</span>
                          <p className="font-medium text-green-600">{company.opportunityScore}%</p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        {company.totalProblems} problems detected • {company.criticalProblems} critical • {company.activeAgents} agents active
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'agents' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Intelligence Agents</h3>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                          <p className="text-sm text-gray-600">{agent.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            agent.status === 'ACTIVE' ? 'bg-green-500' : 
                            agent.status === 'ERROR' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-sm text-gray-600">{agent.status}</span>
                          <button className="text-gray-400 hover:text-gray-600">
                            {agent.status === 'ACTIVE' ? 
                              <PauseIcon className="w-4 h-4" /> : 
                              <PlayIcon className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Success Rate</span>
                          <p className="font-medium">{agent.successRate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Problems Found</span>
                          <p className="font-medium">{agent.problemsDetected}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Next Run</span>
                          <p className="font-medium">
                            {new Date(agent.nextExecution).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Problem Details */}
            {selectedProblem && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <SparklesIcon className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-purple-900">Problem Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">AI Insights</h4>
                    {selectedProblem.aiInsights.map((insight, index) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-3 mb-2">
                        <div className="flex items-start">
                          <LightBulbIcon className="w-4 h-4 text-purple-600 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">{insight.message}</p>
                            {insight.action && (
                              <p className="text-xs text-purple-700 mt-1">Action: {insight.action}</p>
                            )}
                            <p className="text-xs text-purple-600 mt-1">{insight.confidence}% confident</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Stakeholders</h4>
                    {selectedProblem.stakeholders.map((stakeholder, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{stakeholder.name}</p>
                          <p className="text-xs text-gray-600">{stakeholder.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{stakeholder.role}</p>
                          <p className="text-xs font-medium">{stakeholder.influence}% influence</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                      Create Opportunity
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Activity Feed */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BellIcon className="w-5 h-5 mr-2 text-green-600" />
                Real-time Activity
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'New problem detected', company: 'TechStart Inc', time: '2 min ago', type: 'problem' },
                  { action: 'Agent execution completed', company: 'FinCorp Solutions', time: '5 min ago', type: 'success' },
                  { action: 'High urgency problem escalated', company: 'MedTech Labs', time: '12 min ago', type: 'warning' },
                  { action: 'New company monitoring started', company: 'DataCorp Inc', time: '1 hour ago', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'problem' ? 'bg-red-500' :
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.company}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}