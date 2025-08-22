'use client'

/**
 * Lead Scoring Dashboard
 * 
 * AI-powered multi-business lead scoring and qualification system for CoreFlow360.
 * Integrates progressive pricing intelligence and cross-business opportunity detection.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LeadScore {
  id: string
  leadId: string
  leadName: string
  companyName: string
  totalScore: number
  scoreGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  conversionProbability: number
  readinessLevel: 'HOT' | 'WARM' | 'COLD' | 'FROZEN'
  
  // Multi-Business Scoring Components
  businessCountScore: number
  revenueScore: number
  industryFitScore: number
  technologyScore: number
  urgencyScore: number
  
  // Progressive Pricing Indicators
  pricingSensitivity: number
  budgetAlignment: number
  paybackExpectation: string
  
  // Lead Demographics
  companySize: string
  decisionMakerLevel: string
  industryVertical: string
  businessComplexity: string
  
  // Behavioral Scoring
  engagementScore: number
  demoRequested: boolean
  
  // AI Predictions
  aiConfidenceLevel: number
  aiRecommendedAction: string
  aiPredictedTimeline: string
  aiExpectedRevenue: number
  
  // Source Attribution
  sourceChannel: string
  sourceSpecific: string
  
  isQualified: boolean
  lastScoreUpdate: Date
  scoreChange: number
}

interface ScoringRule {
  id: string
  name: string
  ruleType: 'DEMOGRAPHIC' | 'BEHAVIORAL' | 'FIRMOGRAPHIC' | 'TECHNOGRAPHIC'
  pointsAwarded: number
  isActive: boolean
  applicationsCount: number
  conversionRate: number
}

interface ScoringAnalytics {
  totalLeads: number
  scoredLeads: number
  qualifiedLeads: number
  gradeACount: number
  gradeBCount: number
  gradeCCount: number
  gradeDCount: number
  gradeFCount: number
  totalConversions: number
  averageScoreToClose: number
  totalRevenue: number
  averageDealSize: number
  aiAccuracyRate: number
}

interface LeadScoringDashboardProps {
  onLeadSelect?: (leadId: string) => void
  onRuleCreate?: () => void
  onWorkflowTrigger?: (leadId: string, workflowType: string) => void
  className?: string
}

const LeadScoringDashboard: React.FC<LeadScoringDashboardProps> = ({
  onLeadSelect,
  onRuleCreate,
  onWorkflowTrigger,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'rules' | 'analytics' | 'workflows'>('leads')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7days' | '30days' | '90days' | '1year'>('30days')
  const [filterGrade, setFilterGrade] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [leadScores, setLeadScores] = useState<LeadScore[]>([])
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([])
  const [analytics, setAnalytics] = useState<ScoringAnalytics | null>(null)

  // Load lead scoring data
  useEffect(() => {
    // Mock lead scores data - in production, fetch from API
    const mockLeadScores: LeadScore[] = [
      {
        id: 'score-001',
        leadId: 'lead-001',
        leadName: 'Sarah Martinez',
        companyName: 'TechFlow Enterprises',
        totalScore: 92,
        scoreGrade: 'A',
        conversionProbability: 87,
        readinessLevel: 'HOT',
        businessCountScore: 25,
        revenueScore: 23,
        industryFitScore: 18,
        technologyScore: 14,
        urgencyScore: 12,
        pricingSensitivity: 0.3,
        budgetAlignment: 0.9,
        paybackExpectation: '3_MONTHS',
        companySize: 'MID_MARKET',
        decisionMakerLevel: 'C_LEVEL',
        industryVertical: 'Technology',
        businessComplexity: 'COMPLEX',
        engagementScore: 85,
        demoRequested: true,
        aiConfidenceLevel: 0.92,
        aiRecommendedAction: 'IMMEDIATE_CONTACT',
        aiPredictedTimeline: 'THIS_WEEK',
        aiExpectedRevenue: 285000,
        sourceChannel: 'ORGANIC',
        sourceSpecific: 'GOOGLE',
        isQualified: true,
        lastScoreUpdate: new Date('2024-03-20'),
        scoreChange: 15
      },
      {
        id: 'score-002',
        leadId: 'lead-002',
        leadName: 'Michael Chen',
        companyName: 'Phoenix HVAC Solutions',
        totalScore: 78,
        scoreGrade: 'B',
        conversionProbability: 65,
        readinessLevel: 'WARM',
        businessCountScore: 28,
        revenueScore: 20,
        industryFitScore: 15,
        technologyScore: 8,
        urgencyScore: 7,
        pricingSensitivity: 0.5,
        budgetAlignment: 0.7,
        paybackExpectation: '6_MONTHS',
        companySize: 'SMB',
        decisionMakerLevel: 'OWNER',
        industryVertical: 'HVAC',
        businessComplexity: 'MODERATE',
        engagementScore: 62,
        demoRequested: false,
        aiConfidenceLevel: 0.78,
        aiRecommendedAction: 'NURTURE',
        aiPredictedTimeline: 'THIS_MONTH',
        aiExpectedRevenue: 145000,
        sourceChannel: 'REFERRAL',
        sourceSpecific: 'PARTNER',
        isQualified: false,
        lastScoreUpdate: new Date('2024-03-19'),
        scoreChange: 8
      },
      {
        id: 'score-003',
        leadId: 'lead-003',
        leadName: 'Jennifer Rodriguez',
        companyName: 'Elite Professional Services',
        totalScore: 85,
        scoreGrade: 'A',
        conversionProbability: 78,
        readinessLevel: 'HOT',
        businessCountScore: 30,
        revenueScore: 22,
        industryFitScore: 17,
        technologyScore: 10,
        urgencyScore: 6,
        pricingSensitivity: 0.2,
        budgetAlignment: 0.85,
        paybackExpectation: 'IMMEDIATE',
        companySize: 'ENTERPRISE',
        decisionMakerLevel: 'VP',
        industryVertical: 'Professional Services',
        businessComplexity: 'ENTERPRISE',
        engagementScore: 91,
        demoRequested: true,
        aiConfidenceLevel: 0.89,
        aiRecommendedAction: 'IMMEDIATE_CONTACT',
        aiPredictedTimeline: 'THIS_WEEK',
        aiExpectedRevenue: 450000,
        sourceChannel: 'PAID',
        sourceSpecific: 'LINKEDIN',
        isQualified: true,
        lastScoreUpdate: new Date('2024-03-21'),
        scoreChange: 22
      },
      {
        id: 'score-004',
        leadId: 'lead-004',
        leadName: 'David Park',
        companyName: 'Metro Construction Group',
        totalScore: 56,
        scoreGrade: 'C',
        conversionProbability: 42,
        readinessLevel: 'COLD',
        businessCountScore: 15,
        revenueScore: 18,
        industryFitScore: 12,
        technologyScore: 6,
        urgencyScore: 5,
        pricingSensitivity: 0.8,
        budgetAlignment: 0.4,
        paybackExpectation: '12_MONTHS',
        companySize: 'SMB',
        decisionMakerLevel: 'MANAGER',
        industryVertical: 'Construction',
        businessComplexity: 'SIMPLE',
        engagementScore: 34,
        demoRequested: false,
        aiConfidenceLevel: 0.56,
        aiRecommendedAction: 'QUALIFY',
        aiPredictedTimeline: 'THIS_QUARTER',
        aiExpectedRevenue: 89000,
        sourceChannel: 'DIRECT',
        sourceSpecific: 'WEBSITE',
        isQualified: false,
        lastScoreUpdate: new Date('2024-03-18'),
        scoreChange: -3
      },
      {
        id: 'score-005',
        leadId: 'lead-005',
        leadName: 'Lisa Wang',
        companyName: 'Innovative Healthcare Systems',
        totalScore: 94,
        scoreGrade: 'A',
        conversionProbability: 91,
        readinessLevel: 'HOT',
        businessCountScore: 30,
        revenueScore: 25,
        industryFitScore: 19,
        technologyScore: 15,
        urgencyScore: 5,
        pricingSensitivity: 0.1,
        budgetAlignment: 0.95,
        paybackExpectation: 'IMMEDIATE',
        companySize: 'ENTERPRISE',
        decisionMakerLevel: 'C_LEVEL',
        industryVertical: 'Healthcare',
        businessComplexity: 'ENTERPRISE',
        engagementScore: 96,
        demoRequested: true,
        aiConfidenceLevel: 0.94,
        aiRecommendedAction: 'IMMEDIATE_CONTACT',
        aiPredictedTimeline: 'THIS_WEEK',
        aiExpectedRevenue: 650000,
        sourceChannel: 'CONTENT',
        sourceSpecific: 'WEBINAR',
        isQualified: true,
        lastScoreUpdate: new Date('2024-03-21'),
        scoreChange: 18
      }
    ]

    const mockScoringRules: ScoringRule[] = [
      {
        id: 'rule-001',
        name: 'Multi-Business Owner',
        ruleType: 'FIRMOGRAPHIC',
        pointsAwarded: 30,
        isActive: true,
        applicationsCount: 127,
        conversionRate: 78.5
      },
      {
        id: 'rule-002',
        name: 'High Revenue Business',
        ruleType: 'FIRMOGRAPHIC',
        pointsAwarded: 25,
        isActive: true,
        applicationsCount: 89,
        conversionRate: 65.2
      },
      {
        id: 'rule-003',
        name: 'Demo Request',
        ruleType: 'BEHAVIORAL',
        pointsAwarded: 20,
        isActive: true,
        applicationsCount: 156,
        conversionRate: 82.1
      },
      {
        id: 'rule-004',
        name: 'C-Level Decision Maker',
        ruleType: 'DEMOGRAPHIC',
        pointsAwarded: 15,
        isActive: true,
        applicationsCount: 73,
        conversionRate: 71.8
      },
      {
        id: 'rule-005',
        name: 'Technology Advanced',
        ruleType: 'TECHNOGRAPHIC',
        pointsAwarded: 15,
        isActive: true,
        applicationsCount: 94,
        conversionRate: 58.3
      }
    ]

    const mockAnalytics: ScoringAnalytics = {
      totalLeads: 387,
      scoredLeads: 342,
      qualifiedLeads: 89,
      gradeACount: 23,
      gradeBCount: 34,
      gradeCCount: 67,
      gradeDCount: 89,
      gradeFCount: 129,
      totalConversions: 47,
      averageScoreToClose: 78.5,
      totalRevenue: 2850000,
      averageDealSize: 60638,
      aiAccuracyRate: 84.7
    }

    setLeadScores(mockLeadScores)
    setScoringRules(mockScoringRules)
    setAnalytics(mockAnalytics)
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20'
    if (score >= 70) return 'text-blue-400 bg-blue-500/20'
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20'
    if (score >= 50) return 'text-orange-400 bg-orange-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-400 bg-green-500/20 border-green-400/50'
      case 'B': return 'text-blue-400 bg-blue-500/20 border-blue-400/50'
      case 'C': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/50'
      case 'D': return 'text-orange-400 bg-orange-500/20 border-orange-400/50'
      case 'F': return 'text-red-400 bg-red-500/20 border-red-400/50'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/50'
    }
  }

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'HOT': return 'text-red-400 bg-red-500/20'
      case 'WARM': return 'text-orange-400 bg-orange-500/20'
      case 'COLD': return 'text-blue-400 bg-blue-500/20'
      case 'FROZEN': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const filteredLeads = leadScores.filter(lead => {
    if (filterGrade !== 'all' && lead.scoreGrade !== filterGrade) return false
    if (filterSource !== 'all' && lead.sourceChannel !== filterSource) return false
    return true
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Lead Scoring Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Lead Scoring</h2>
            <p className="text-gray-400">Multi-business lead qualification with progressive pricing intelligence</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{analytics.totalLeads}</div>
              <div className="text-sm text-gray-400">Total Leads</div>
              <div className="text-xs text-green-400 mt-1">+12% this month</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{analytics.qualifiedLeads}</div>
              <div className="text-sm text-gray-400">Qualified</div>
              <div className="text-xs text-blue-400 mt-1">{Math.round((analytics.qualifiedLeads / analytics.totalLeads) * 100)}% rate</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{analytics.averageScoreToClose.toFixed(1)}</div>
              <div className="text-sm text-gray-400">Avg Score to Close</div>
              <div className="text-xs text-purple-400 mt-1">Grade B+ range</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">${(analytics.averageDealSize / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-400">Avg Deal Size</div>
              <div className="text-xs text-cyan-400 mt-1">+18% YoY</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{analytics.aiAccuracyRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">AI Accuracy</div>
              <div className="text-xs text-green-400 mt-1">High confidence</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'leads', label: 'Scored Leads', icon: '👥', count: leadScores.length },
          { id: 'rules', label: 'Scoring Rules', icon: '⚙️', count: scoringRules.length },
          { id: 'analytics', label: 'Performance', icon: '📊', count: null },
          { id: 'workflows', label: 'Qualification', icon: '🔄', count: null }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count && <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Scored Leads Tab */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <select 
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
                <option value="D">Grade D</option>
                <option value="F">Grade F</option>
              </select>
              <select 
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Sources</option>
                <option value="ORGANIC">Organic</option>
                <option value="PAID">Paid</option>
                <option value="REFERRAL">Referral</option>
                <option value="DIRECT">Direct</option>
                <option value="CONTENT">Content</option>
              </select>
            </div>
            <button 
              onClick={() => onRuleCreate?.()}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500"
            >
              Create Rule
            </button>
          </div>

          {/* Lead Scores List */}
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <motion.div
                key={lead.id}
                className="rounded-lg border border-gray-700 bg-gray-900 p-6 cursor-pointer"
                onClick={() => onLeadSelect?.(lead.leadId)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{lead.leadName}</h4>
                      <div className={`px-3 py-1 rounded-lg border text-sm font-medium ${getGradeColor(lead.scoreGrade)}`}>
                        Grade {lead.scoreGrade}
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${getReadinessColor(lead.readinessLevel)}`}>
                        {lead.readinessLevel}
                      </div>
                      {lead.isQualified && (
                        <div className="px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                          ✓ Qualified
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 mb-2">{lead.companyName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{lead.industryVertical}</span>
                      <span>•</span>
                      <span>{lead.companySize}</span>
                      <span>•</span>
                      <span>{lead.decisionMakerLevel}</span>
                      <span>•</span>
                      <span>{lead.sourceChannel}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(lead.totalScore).split(' ')[0]}`}>
                      {lead.totalScore}
                    </div>
                    <div className="text-sm text-gray-400">Total Score</div>
                    {lead.scoreChange !== 0 && (
                      <div className={`text-xs mt-1 ${lead.scoreChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {lead.scoreChange > 0 ? '+' : ''}{lead.scoreChange} pts
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{lead.businessCountScore}</div>
                    <div className="text-xs text-gray-400">Business Count</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{lead.revenueScore}</div>
                    <div className="text-xs text-gray-400">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{lead.industryFitScore}</div>
                    <div className="text-xs text-gray-400">Industry Fit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{lead.technologyScore}</div>
                    <div className="text-xs text-gray-400">Technology</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{lead.urgencyScore}</div>
                    <div className="text-xs text-gray-400">Urgency</div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">🤖</span>
                      <span className="text-sm text-gray-400">AI Recommendation:</span>
                      <span className="text-sm font-medium text-white">{lead.aiRecommendedAction.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-400">📅</span>
                      <span className="text-sm text-gray-400">Timeline:</span>
                      <span className="text-sm font-medium text-white">{lead.aiPredictedTimeline.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">💰</span>
                      <span className="text-sm text-gray-400">Expected Revenue:</span>
                      <span className="text-sm font-medium text-white">${lead.aiExpectedRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onWorkflowTrigger?.(lead.leadId, 'QUALIFICATION')
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-500"
                    >
                      Qualify
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onWorkflowTrigger?.(lead.leadId, 'NURTURE')
                      }}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-500"
                    >
                      Nurture
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Scoring Rules Engine</h3>
            <button 
              onClick={() => onRuleCreate?.()}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500"
            >
              + New Rule
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {scoringRules.map((rule) => (
              <motion.div
                key={rule.id}
                className="rounded-lg border border-gray-700 bg-gray-900 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2">{rule.name}</h4>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        rule.ruleType === 'FIRMOGRAPHIC' ? 'bg-green-500/20 text-green-400' :
                        rule.ruleType === 'BEHAVIORAL' ? 'bg-blue-500/20 text-blue-400' :
                        rule.ruleType === 'DEMOGRAPHIC' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {rule.ruleType}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        rule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">+{rule.pointsAwarded}</div>
                    <div className="text-sm text-gray-400">Points</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Applications:</span>
                    <div className="text-white font-medium">{rule.applicationsCount}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Conversion:</span>
                    <div className="text-white font-medium">{rule.conversionRate}%</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-700 text-white py-2 px-3 rounded text-sm hover:bg-gray-600">
                    Edit Rule
                  </button>
                  <button className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-500">
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Score Distribution */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Score Distribution</h3>
            <div className="grid grid-cols-5 gap-4">
              {[
                { grade: 'A', count: analytics.gradeACount, color: 'bg-green-500' },
                { grade: 'B', count: analytics.gradeBCount, color: 'bg-blue-500' },
                { grade: 'C', count: analytics.gradeCCount, color: 'bg-yellow-500' },
                { grade: 'D', count: analytics.gradeDCount, color: 'bg-orange-500' },
                { grade: 'F', count: analytics.gradeFCount, color: 'bg-red-500' }
              ].map((item) => (
                <div key={item.grade} className="text-center">
                  <div className={`h-20 ${item.color} rounded-lg mb-2 flex items-end justify-center pb-2`}>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                  <div className="text-sm text-gray-400">Grade {item.grade}</div>
                  <div className="text-xs text-gray-500">
                    {Math.round((item.count / analytics.totalLeads) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h4 className="text-lg font-bold text-white mb-4">📈 Conversion Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Conversions:</span>
                  <span className="text-white font-medium">{analytics.totalConversions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conversion Rate:</span>
                  <span className="text-white font-medium">{Math.round((analytics.totalConversions / analytics.qualifiedLeads) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Score to Close:</span>
                  <span className="text-white font-medium">{analytics.averageScoreToClose}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h4 className="text-lg font-bold text-white mb-4">💰 Revenue Impact</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Revenue:</span>
                  <span className="text-white font-medium">${(analytics.totalRevenue / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Deal Size:</span>
                  <span className="text-white font-medium">${analytics.averageDealSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue per Lead:</span>
                  <span className="text-white font-medium">${Math.round(analytics.totalRevenue / analytics.totalLeads).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h4 className="text-lg font-bold text-white mb-4">🤖 AI Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">AI Accuracy:</span>
                  <span className="text-white font-medium">{analytics.aiAccuracyRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Model Version:</span>
                  <span className="text-white font-medium">v2.3.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Training:</span>
                  <span className="text-white font-medium">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Qualification Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Lead Qualification Workflows</h3>
            <p className="text-gray-400 mb-6">Automated BANT qualification and multi-business opportunity assessment</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  name: 'BANT Qualification',
                  description: 'Budget, Authority, Need, Timeline assessment',
                  triggers: 'Score ≥ 70 or Demo Request',
                  steps: 4,
                  completion: '87%'
                },
                {
                  name: 'Multi-Business Assessment',
                  description: 'Cross-business opportunity evaluation',
                  triggers: 'Business Count Score ≥ 20',
                  steps: 6,
                  completion: '73%'
                },
                {
                  name: 'Progressive Pricing Qualification',
                  description: 'Pricing sensitivity and discount eligibility',
                  triggers: 'Grade A or B leads',
                  steps: 3,
                  completion: '91%'
                },
                {
                  name: 'AI-Enhanced Qualification',
                  description: 'ML-powered qualification scoring',
                  triggers: 'All qualified leads',
                  steps: 5,
                  completion: '84%'
                }
              ].map((workflow, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">{workflow.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{workflow.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Triggers:</span>
                      <span className="text-white">{workflow.triggers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Steps:</span>
                      <span className="text-white">{workflow.steps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completion:</span>
                      <span className="text-green-400">{workflow.completion}</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-gray-700 text-white py-2 rounded hover:bg-gray-600">
                    Configure Workflow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadScoringDashboard