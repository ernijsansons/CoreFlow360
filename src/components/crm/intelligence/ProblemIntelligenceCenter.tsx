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
  InformationCircleIcon,
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
    description:
      'Multiple social media complaints about 3+ hour wait times for customer support, causing customer frustration and potential churn.',
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
      { name: 'Mike Rodriguez', title: 'CEO', role: 'DECISION_MAKER', influence: 95 },
    ],
    aiInsights: [
      {
        type: 'RECOMMENDATION',
        message: 'Implement automated ticketing system to reduce response times by 60%',
        confidence: 92,
        action: 'Schedule demo of ticketing solution',
      },
      {
        type: 'PREDICTION',
        message: 'Problem likely to escalate within 2 weeks if not addressed',
        confidence: 78,
      },
    ],
    tags: ['urgent', 'customer-facing', 'scalability'],
    lastUpdated: '2024-01-10T09:15:00Z',
  },
  {
    id: 'prob_2',
    companyId: 'comp_2',
    companyName: 'FinCorp Solutions',
    industry: 'Finance',
    title: 'Regulatory Compliance Gaps',
    description:
      'Recent audit revealed gaps in SOX compliance reporting, creating potential regulatory risk and audit failures.',
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
      {
        name: 'David Kim',
        title: 'Chief Compliance Officer',
        role: 'DECISION_MAKER',
        influence: 90,
      },
      { name: 'Lisa Wong', title: 'CFO', role: 'BUDGET_OWNER', influence: 95 },
    ],
    aiInsights: [
      {
        type: 'WARNING',
        message: 'Regulatory penalties possible within 30 days if not addressed',
        confidence: 85,
        action: 'Emergency compliance audit required',
      },
    ],
    tags: ['regulatory', 'high-risk', 'finance'],
    lastUpdated: '2024-01-10T08:00:00Z',
  },
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
      { type: 'Financial', status: 'PAUSED', lastExecution: '2024-01-09T18:00:00Z' },
    ],
  },
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
    problemsDetected: 12,
  },
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
      await new Promise((resolve) => setTimeout(resolve, 1000))
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
      case 'EXISTENTIAL':
        return 'text-red-900 bg-red-100 border-red-500'
      case 'CRITICAL':
        return 'text-red-700 bg-red-50 border-red-400'
      case 'MAJOR':
        return 'text-orange-700 bg-orange-50 border-orange-400'
      case 'MODERATE':
        return 'text-yellow-700 bg-yellow-50 border-yellow-400'
      case 'MINOR':
        return 'text-blue-700 bg-blue-50 border-blue-400'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-400'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'EXISTENTIAL':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'CRITICAL':
        return <FireIcon className="h-5 w-5 text-red-500" />
      case 'MAJOR':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />
      case 'MODERATE':
        return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />
      case 'MINOR':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredProblems = problems.filter((problem) => {
    const matchesSeverity = filterSeverity === 'ALL' || problem.severity === filterSeverity
    const matchesIndustry = filterIndustry === 'ALL' || problem.industry === filterIndustry
    const matchesSearch =
      searchTerm === '' ||
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSeverity && matchesIndustry && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          <p className="text-gray-600">Loading problem intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RadarIcon className="mr-4 h-10 w-10 text-purple-600" />
              <div>
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
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
                className={`flex items-center rounded-lg px-4 py-2 transition-all ${
                  isRealTimeEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <BoltIcon className="mr-2 h-4 w-4" />
                Real-time {isRealTimeEnabled ? 'ON' : 'OFF'}
              </button>
              <button className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700">
                <AdjustmentsHorizontalIcon className="mr-2 inline h-4 w-4" />
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <span className="text-3xl font-bold text-gray-900">
                {
                  problems.filter((p) => p.severity === 'CRITICAL' || p.severity === 'EXISTENTIAL')
                    .length
                }
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Critical Problems</h3>
            <p className="text-sm text-gray-600">Requiring immediate attention</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{companies.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Monitored Companies</h3>
            <p className="text-sm text-gray-600">Active intelligence gathering</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <CpuChipIcon className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {agents.filter((a) => a.status === 'ACTIVE').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active Agents</h3>
            <p className="text-sm text-gray-600">Autonomous intelligence gathering</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
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
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {[
              { id: 'problems', name: 'Problems', icon: ExclamationTriangleIcon },
              { id: 'companies', name: 'Companies', icon: BuildingOfficeIcon },
              { id: 'agents', name: 'Agents', icon: CpuChipIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as unknown)}
                className={`flex items-center rounded-md px-4 py-2 transition-all ${
                  selectedView === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {selectedView === 'problems' && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  placeholder="Search problems..."
                />
              </div>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
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
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedView === 'problems' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Detected Problems</h3>
                <div className="space-y-4">
                  {filteredProblems.map((problem) => (
                    <motion.div
                      key={problem.id}
                      whileHover={{ scale: 1.01 }}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        selectedProblem?.id === problem.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProblem(problem)}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center">
                            {getSeverityIcon(problem.severity)}
                            <h4 className="ml-2 font-semibold text-gray-900">{problem.title}</h4>
                          </div>
                          <p className="mb-2 text-sm text-gray-600">
                            {problem.companyName} • {problem.industry}
                          </p>
                          <p className="line-clamp-2 text-sm text-gray-700">
                            {problem.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(problem.severity)}`}
                          >
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
                          <p className="font-medium">
                            ${(problem.revenueImpact / 1000).toFixed(0)}K
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Deal Size</span>
                          <p className="font-medium">
                            ${(problem.estimatedDealSize / 1000).toFixed(0)}K
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Solution Fit</span>
                          <p className="font-medium text-green-600">{problem.solutionFitScore}%</p>
                        </div>
                      </div>

                      {/* Urgency Bar */}
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-gray-500">
                          <span>Urgency</span>
                          <span>{problem.urgency}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              problem.urgency > 80
                                ? 'bg-red-500'
                                : problem.urgency > 60
                                  ? 'bg-orange-500'
                                  : problem.urgency > 40
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
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
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Monitored Companies</h3>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{company.name}</h4>
                          <p className="text-sm text-gray-600">
                            {company.industry} • {company.size}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`mr-2 h-2 w-2 rounded-full ${
                              company.monitoringStatus === 'ACTIVE'
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                            }`}
                          />
                          <span className="text-sm text-gray-600">{company.monitoringStatus}</span>
                        </div>
                      </div>

                      <div className="mb-3 grid grid-cols-3 gap-4 text-sm">
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
                        {company.totalProblems} problems detected • {company.criticalProblems}{' '}
                        critical • {company.activeAgents} agents active
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'agents' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold">Intelligence Agents</h3>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                          <p className="text-sm text-gray-600">{agent.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              agent.status === 'ACTIVE'
                                ? 'bg-green-500'
                                : agent.status === 'ERROR'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                            }`}
                          />
                          <span className="text-sm text-gray-600">{agent.status}</span>
                          <button className="text-gray-400 hover:text-gray-600">
                            {agent.status === 'ACTIVE' ? (
                              <PauseIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
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
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center">
                  <SparklesIcon className="mr-2 h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">Problem Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">AI Insights</h4>
                    {selectedProblem.aiInsights.map((insight, index) => (
                      <div key={index} className="mb-2 rounded-lg bg-purple-50 p-3">
                        <div className="flex items-start">
                          <LightBulbIcon className="mt-0.5 mr-2 h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">{insight.message}</p>
                            {insight.action && (
                              <p className="mt-1 text-xs text-purple-700">
                                Action: {insight.action}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-purple-600">
                              {insight.confidence}% confident
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Key Stakeholders</h4>
                    {selectedProblem.stakeholders.map((stakeholder, index) => (
                      <div
                        key={index}
                        className="mb-2 flex items-center justify-between rounded bg-gray-50 p-2"
                      >
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

                  <div className="border-t pt-4">
                    <button className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700">
                      Create Opportunity
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Activity Feed */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <BellIcon className="mr-2 h-5 w-5 text-green-600" />
                Real-time Activity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    action: 'New problem detected',
                    company: 'TechStart Inc',
                    time: '2 min ago',
                    type: 'problem',
                  },
                  {
                    action: 'Agent execution completed',
                    company: 'FinCorp Solutions',
                    time: '5 min ago',
                    type: 'success',
                  },
                  {
                    action: 'High urgency problem escalated',
                    company: 'MedTech Labs',
                    time: '12 min ago',
                    type: 'warning',
                  },
                  {
                    action: 'New company monitoring started',
                    company: 'DataCorp Inc',
                    time: '1 hour ago',
                    type: 'info',
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.type === 'problem'
                          ? 'bg-red-500'
                          : activity.type === 'success'
                            ? 'bg-green-500'
                            : activity.type === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                      }`}
                    />
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
