/**
 * CoreFlow360 - Value Proposition & Infographic Manager
 * AI-powered marketing material generation and management
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  PlusIcon,
  PresentationChartLineIcon,
  PhotoIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  DownloadIcon,
  BeakerIcon,
  LightBulbIcon,
  TargetIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { AccessibleButton, AccessibleInput, AccessibleSelect } from '@/components/accessibility/AccessibleComponents'

interface ValueProposition {
  id: string
  title: string
  description: string
  category: string
  problemStatement: string
  targetPainPoints: string[]
  solutionDescription: string
  keyBenefits: string[]
  quantifiableBenefits: Array<{
    metric: string
    value: number
    unit: string
    timeframe: string
    confidence: number
  }>
  useCase: string
  targetPersona: string[]
  industry: string[]
  aiOptimizationScore: number
  aiSuggestions: string[]
  usageCount: number
  successRate: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CustomerProblem {
  id: string
  customerId?: string
  customerName?: string
  problemTitle: string
  problemDescription: string
  problemCategory: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  businessImpact: string
  financialImpact?: {
    lossAmount?: number
    timeWasted?: number
  }
  matchedValueProps: string[]
  confidenceScore: number
  identifiedFrom: string
  createdAt: string
}

interface GeneratedInfographic {
  id: string
  title: string
  customerId?: string
  customerName?: string
  templateId: string
  templateName: string
  previewUrl: string
  finalAssets: Array<{
    format: string
    url: string
    size: string
  }>
  qualityScore: number
  viewCount: number
  downloadCount: number
  status: string
  generatedAt: string
}

interface BrandElements {
  companyName: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  visualStyle: string
  tagline?: string
}

export default function ValuePropositionManager() {
  const [activeTab, setActiveTab] = useState<'value-props' | 'problems' | 'infographics' | 'brand'>('value-props')
  const [valuePropositions, setValuePropositions] = useState<ValueProposition[]>([])
  const [customerProblems, setCustomerProblems] = useState<CustomerProblem[]>([])
  const [generatedInfographics, setGeneratedInfographics] = useState<GeneratedInfographic[]>([])
  const [brandElements, setBrandElements] = useState<BrandElements>({
    companyName: '',
    primaryColor: '#2563EB',
    secondaryColor: '#64748B',
    visualStyle: 'MODERN'
  })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Mock data - in real app, fetch from APIs
      const mockValueProps: ValueProposition[] = [
        {
          id: '1',
          title: 'Reduce Manual Data Entry by 90%',
          description: 'Eliminate time-consuming manual data entry with AI-powered automation that learns from your existing processes.',
          category: 'EFFICIENCY_GAIN',
          problemStatement: 'Teams waste 4-6 hours daily on repetitive data entry tasks, leading to errors and missed opportunities.',
          targetPainPoints: ['Manual data entry', 'Human errors', 'Time waste', 'Missed deadlines'],
          solutionDescription: 'Our AI automation engine captures, validates, and processes data from multiple sources automatically.',
          keyBenefits: ['Save 25+ hours per week', '99.7% accuracy rate', 'Real-time processing', 'Error-free operations'],
          quantifiableBenefits: [
            { metric: 'Time Savings', value: 90, unit: '%', timeframe: 'weekly', confidence: 0.95 },
            { metric: 'Error Reduction', value: 99.7, unit: '%', timeframe: 'ongoing', confidence: 0.92 },
            { metric: 'Cost Savings', value: 35000, unit: '$', timeframe: 'annually', confidence: 0.88 }
          ],
          useCase: 'Perfect for companies processing 500+ records daily across multiple systems.',
          targetPersona: ['Operations Manager', 'Data Analyst', 'Business Owner'],
          industry: ['Technology', 'Healthcare', 'Finance', 'Manufacturing'],
          aiOptimizationScore: 0.89,
          aiSuggestions: ['Add more specific industry metrics', 'Include customer testimonial'],
          usageCount: 45,
          successRate: 78.5,
          isActive: true,
          createdAt: '2024-08-01T10:00:00Z',
          updatedAt: '2024-08-09T14:00:00Z'
        },
        {
          id: '2',
          title: 'Increase Sales Conversion by 40%',
          description: 'AI-powered lead scoring and personalized outreach that turns more prospects into paying customers.',
          category: 'REVENUE_INCREASE',
          problemStatement: 'Sales teams struggle with low conversion rates due to poor lead qualification and generic messaging.',
          targetPainPoints: ['Low conversion rates', 'Unqualified leads', 'Generic outreach', 'Wasted sales time'],
          solutionDescription: 'Intelligent lead scoring combined with personalized messaging based on prospect behavior and needs.',
          keyBenefits: ['40% higher conversion', 'Pre-qualified hot leads', 'Personalized messaging', 'Shorter sales cycles'],
          quantifiableBenefits: [
            { metric: 'Conversion Rate', value: 40, unit: '%', timeframe: 'quarterly', confidence: 0.91 },
            { metric: 'Sales Cycle', value: 25, unit: '% faster', timeframe: 'ongoing', confidence: 0.87 },
            { metric: 'Revenue Increase', value: 125000, unit: '$', timeframe: 'annually', confidence: 0.93 }
          ],
          useCase: 'Ideal for B2B companies with complex sales processes and long sales cycles.',
          targetPersona: ['Sales Director', 'VP of Sales', 'Business Development'],
          industry: ['SaaS', 'Consulting', 'Real Estate', 'Finance'],
          aiOptimizationScore: 0.93,
          aiSuggestions: ['Add case study reference', 'Mention specific industry results'],
          usageCount: 67,
          successRate: 85.2,
          isActive: true,
          createdAt: '2024-07-15T09:00:00Z',
          updatedAt: '2024-08-08T16:00:00Z'
        }
      ]

      const mockProblems: CustomerProblem[] = [
        {
          id: '1',
          customerId: 'cust-1',
          customerName: 'TechCorp Solutions',
          problemTitle: 'Manual Invoice Processing Taking 2 Days',
          problemDescription: 'Current invoice processing is completely manual, taking our accounting team 2 full days per week and causing frequent errors.',
          problemCategory: 'OPERATIONAL_INEFFICIENCY',
          severity: 'HIGH',
          urgency: 'HIGH',
          businessImpact: 'Delays in cash flow, customer complaints about billing errors, team burnout',
          financialImpact: {
            lossAmount: 25000,
            timeWasted: 16
          },
          matchedValueProps: ['1'],
          confidenceScore: 0.94,
          identifiedFrom: 'CALL',
          createdAt: '2024-08-07T11:00:00Z'
        },
        {
          id: '2',
          customerId: 'cust-2',
          customerName: 'Growth Industries',
          problemTitle: 'Low Sales Conversion - Only 12%',
          problemDescription: 'Our sales team is generating leads but conversion rate is stuck at 12%, well below industry average of 25%.',
          problemCategory: 'POOR_CUSTOMER_EXPERIENCE',
          severity: 'CRITICAL',
          urgency: 'URGENT',
          businessImpact: 'Missing revenue targets, wasted marketing spend, demotivated sales team',
          financialImpact: {
            lossAmount: 75000,
            timeWasted: 40
          },
          matchedValueProps: ['2'],
          confidenceScore: 0.91,
          identifiedFrom: 'LINKEDIN',
          createdAt: '2024-08-06T15:30:00Z'
        }
      ]

      const mockInfographics: GeneratedInfographic[] = [
        {
          id: '1',
          title: 'TechCorp Invoice Automation Solution',
          customerId: 'cust-1',
          customerName: 'TechCorp Solutions',
          templateId: 'template-1',
          templateName: 'Problem-Solution Modern',
          previewUrl: '/api/infographics/preview/1',
          finalAssets: [
            { format: 'PNG', url: '/api/infographics/final/1.png', size: '800x1200' },
            { format: 'PDF', url: '/api/infographics/final/1.pdf', size: '8.5x11' }
          ],
          qualityScore: 0.92,
          viewCount: 15,
          downloadCount: 3,
          status: 'GENERATED',
          generatedAt: '2024-08-08T10:00:00Z'
        }
      ]

      setValuePropositions(mockValueProps)
      setCustomerProblems(mockProblems)
      setGeneratedInfographics(mockInfographics)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInfographic = async (customerId: string, problemIds: string[], valuePropIds: string[]) => {
    try {
      // This would call the infographic generation API
      console.log('Generating infographic for:', { customerId, problemIds, valuePropIds })
      
      // Mock generation - in real app, this would be an async API call
      const newInfographic: GeneratedInfographic = {
        id: Date.now().toString(),
        title: `Personalized Solution for Customer ${customerId}`,
        customerId,
        customerName: customerProblems.find(p => p.customerId === customerId)?.customerName || 'Customer',
        templateId: 'template-1',
        templateName: 'Problem-Solution Modern',
        previewUrl: '/api/infographics/preview/new',
        finalAssets: [
          { format: 'PNG', url: '/api/infographics/final/new.png', size: '800x1200' }
        ],
        qualityScore: 0.87,
        viewCount: 0,
        downloadCount: 0,
        status: 'GENERATING',
        generatedAt: new Date().toISOString()
      }

      setGeneratedInfographics([newInfographic, ...generatedInfographics])
      
      // Simulate generation completion
      setTimeout(() => {
        setGeneratedInfographics(prev => 
          prev.map(ig => 
            ig.id === newInfographic.id 
              ? { ...ig, status: 'GENERATED', qualityScore: 0.91 }
              : ig
          )
        )
      }, 3000)

      setShowGenerateModal(false)
    } catch (error) {
      console.error('Failed to generate infographic:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-black'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EFFICIENCY_GAIN': return ArrowTrendingUpIcon
      case 'REVENUE_INCREASE': return CurrencyDollarIcon
      case 'COST_REDUCTION': return ChartBarIcon
      case 'AUTOMATION': return SparklesIcon
      default: return LightBulbIcon
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing Materials Studio</h1>
          <p className="text-gray-400 mt-1">AI-powered value propositions and personalized infographics</p>
        </div>
        <div className="flex items-center space-x-3">
          <AccessibleButton
            onClick={() => setShowGenerateModal(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            Generate Materials
          </AccessibleButton>
          <AccessibleButton
            variant="secondary"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Value Prop
          </AccessibleButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'value-props', name: 'Value Propositions', icon: TargetIcon, count: valuePropositions.length },
            { id: 'problems', name: 'Customer Problems', icon: UserGroupIcon, count: customerProblems.length },
            { id: 'infographics', name: 'Generated Materials', icon: PhotoIcon, count: generatedInfographics.length },
            { id: 'brand', name: 'Brand Setup', icon: PresentationChartLineIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-800 text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'value-props' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {valuePropositions.map((valueProp, index) => {
              const CategoryIcon = getCategoryIcon(valueProp.category)
              return (
                <motion.div
                  key={valueProp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-violet-500/20 rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{valueProp.title}</h3>
                          <span className="text-sm text-violet-400 capitalize">
                            {valueProp.category.replace('_', ' ').toLowerCase()}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4">{valueProp.description}</p>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-white mb-2">Problem</h4>
                          <p className="text-sm text-gray-400">{valueProp.problemStatement}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-2">Solution</h4>
                          <p className="text-sm text-gray-400">{valueProp.solutionDescription}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-white mb-2">Quantifiable Benefits</h4>
                        <div className="flex flex-wrap gap-2">
                          {valueProp.quantifiableBenefits.map((benefit, idx) => (
                            <div key={idx} className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                              <span className="text-green-300 font-medium">
                                {benefit.value}{benefit.unit} {benefit.metric}
                              </span>
                              <span className="text-green-400 text-xs ml-1">
                                ({benefit.timeframe})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Used {valueProp.usageCount} times</span>
                        <span>{valueProp.successRate}% success rate</span>
                        <span>AI Score: {Math.round(valueProp.aiOptimizationScore * 100)}/100</span>
                      </div>

                      {valueProp.aiSuggestions.length > 0 && (
                        <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <BeakerIcon className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-300">AI Suggestions</span>
                          </div>
                          <ul className="text-sm text-blue-200 space-y-1">
                            {valueProp.aiSuggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <AccessibleButton variant="ghost" size="sm">
                        <EyeIcon className="w-4 h-4" />
                      </AccessibleButton>
                      <AccessibleButton variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </AccessibleButton>
                      <AccessibleButton variant="ghost" size="sm">
                        <TrashIcon className="w-4 h-4" />
                      </AccessibleButton>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'problems' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {customerProblems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(problem.severity)}`}>
                        {problem.severity}
                      </span>
                      <span className="text-sm text-gray-400">
                        from {problem.identifiedFrom}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{problem.problemTitle}</h3>
                    <p className="text-gray-300 mb-3">{problem.problemDescription}</p>

                    <div className="mb-4">
                      <h4 className="font-medium text-white mb-2">Business Impact</h4>
                      <p className="text-sm text-gray-400">{problem.businessImpact}</p>
                    </div>

                    {problem.financialImpact && (
                      <div className="mb-4">
                        <h4 className="font-medium text-white mb-2">Financial Impact</h4>
                        <div className="flex space-x-4 text-sm">
                          {problem.financialImpact.lossAmount && (
                            <span className="text-red-400">
                              Loss: ${problem.financialImpact.lossAmount.toLocaleString()}
                            </span>
                          )}
                          {problem.financialImpact.timeWasted && (
                            <span className="text-yellow-400">
                              Time: {problem.financialImpact.timeWasted}hrs/week
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{problem.customerName}</span>
                        <span>Match: {Math.round(problem.confidenceScore * 100)}%</span>
                        <span>{problem.matchedValueProps.length} solutions matched</span>
                      </div>

                      <AccessibleButton
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(problem.customerId || null)
                          setShowGenerateModal(true)
                        }}
                      >
                        Generate Solution
                      </AccessibleButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'infographics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {generatedInfographics.map((infographic, index) => (
              <motion.div
                key={infographic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
              >
                <div className="aspect-[4/5] bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
                  {infographic.previewUrl ? (
                    <img
                      src={infographic.previewUrl}
                      alt={infographic.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {infographic.status === 'GENERATING' ? (
                        <div className="flex flex-col items-center">
                          <ArrowPathIcon className="w-8 h-8 text-violet-400 animate-spin mb-2" />
                          <span className="text-sm text-gray-400">Generating...</span>
                        </div>
                      ) : (
                        <PhotoIcon className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      infographic.status === 'GENERATED' ? 'bg-green-500/20 text-green-300' : 
                      infographic.status === 'GENERATING' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {infographic.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-1 truncate">{infographic.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{infographic.customerName}</p>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span>Quality: {Math.round(infographic.qualityScore * 100)}%</span>
                  <span>{infographic.viewCount} views</span>
                  <span>{infographic.downloadCount} downloads</span>
                </div>

                <div className="flex items-center space-x-2">
                  <AccessibleButton variant="ghost" size="sm" className="flex-1">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </AccessibleButton>
                  <AccessibleButton variant="ghost" size="sm" className="flex-1">
                    <ShareIcon className="w-4 h-4 mr-1" />
                    Share
                  </AccessibleButton>
                  <AccessibleButton variant="ghost" size="sm" className="flex-1">
                    <DownloadIcon className="w-4 h-4 mr-1" />
                    Download
                  </AccessibleButton>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'brand' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl"
          >
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Brand Setup</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Company Name</label>
                  <AccessibleInput
                    value={brandElements.companyName}
                    onChange={(value) => setBrandElements({...brandElements, companyName: value})}
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tagline</label>
                  <AccessibleInput
                    value={brandElements.tagline || ''}
                    onChange={(value) => setBrandElements({...brandElements, tagline: value})}
                    placeholder="Enter your company tagline"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandElements.primaryColor}
                        onChange={(e) => setBrandElements({...brandElements, primaryColor: e.target.value})}
                        className="w-12 h-12 rounded border-2 border-gray-700"
                      />
                      <AccessibleInput
                        value={brandElements.primaryColor}
                        onChange={(value) => setBrandElements({...brandElements, primaryColor: value})}
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandElements.secondaryColor}
                        onChange={(e) => setBrandElements({...brandElements, secondaryColor: e.target.value})}
                        className="w-12 h-12 rounded border-2 border-gray-700"
                      />
                      <AccessibleInput
                        value={brandElements.secondaryColor}
                        onChange={(value) => setBrandElements({...brandElements, secondaryColor: value})}
                        placeholder="#64748B"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Visual Style</label>
                  <AccessibleSelect
                    value={brandElements.visualStyle}
                    onChange={(value) => setBrandElements({...brandElements, visualStyle: value})}
                    options={[
                      { value: 'CORPORATE', label: 'Corporate' },
                      { value: 'MODERN', label: 'Modern' },
                      { value: 'PLAYFUL', label: 'Playful' },
                      { value: 'TECHNICAL', label: 'Technical' },
                      { value: 'MINIMALIST', label: 'Minimalist' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Logo Upload</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                    <PhotoIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 mb-2">Upload your company logo</p>
                    <AccessibleButton variant="secondary" size="sm">
                      Choose File
                    </AccessibleButton>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <AccessibleButton variant="secondary">
                    Cancel
                  </AccessibleButton>
                  <AccessibleButton>
                    Save Brand Settings
                  </AccessibleButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Materials Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Generate Marketing Materials</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Customer</label>
                  <AccessibleSelect
                    value={selectedCustomer || ''}
                    onChange={setSelectedCustomer}
                    options={customerProblems.map(p => ({
                      value: p.customerId || '',
                      label: p.customerName || 'Unknown'
                    }))}
                    placeholder="Select customer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Problems to Address</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {customerProblems
                      .filter(p => !selectedCustomer || p.customerId === selectedCustomer)
                      .map(problem => (
                        <label key={problem.id} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-600 text-violet-500" />
                          <span className="text-sm text-white">{problem.problemTitle}</span>
                        </label>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Value Propositions</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {valuePropositions.map(valueProp => (
                      <label key={valueProp.id} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-600 text-violet-500" />
                        <span className="text-sm text-white">{valueProp.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <AccessibleButton
                    variant="secondary"
                    onClick={() => setShowGenerateModal(false)}
                  >
                    Cancel
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={() => selectedCustomer && handleGenerateInfographic(selectedCustomer, [], [])}
                    disabled={!selectedCustomer}
                  >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generate Materials
                  </AccessibleButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}