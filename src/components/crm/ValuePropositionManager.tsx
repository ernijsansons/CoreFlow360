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
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
} from '@/components/accessibility/AccessibleComponents'

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
  const [activeTab, setActiveTab] = useState<'value-props' | 'problems' | 'infographics' | 'brand'>(
    'value-props'
  )
  const [valuePropositions, setValuePropositions] = useState<ValueProposition[]>([])
  const [customerProblems, setCustomerProblems] = useState<CustomerProblem[]>([])
  const [generatedInfographics, setGeneratedInfographics] = useState<GeneratedInfographic[]>([])
  const [brandElements, setBrandElements] = useState<BrandElements>({
    companyName: '',
    primaryColor: '#2563EB',
    secondaryColor: '#64748B',
    visualStyle: 'MODERN',
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
          description:
            'Eliminate time-consuming manual data entry with AI-powered automation that learns from your existing processes.',
          category: 'EFFICIENCY_GAIN',
          problemStatement:
            'Teams waste 4-6 hours daily on repetitive data entry tasks, leading to errors and missed opportunities.',
          targetPainPoints: ['Manual data entry', 'Human errors', 'Time waste', 'Missed deadlines'],
          solutionDescription:
            'Our AI automation engine captures, validates, and processes data from multiple sources automatically.',
          keyBenefits: [
            'Save 25+ hours per week',
            '99.7% accuracy rate',
            'Real-time processing',
            'Error-free operations',
          ],
          quantifiableBenefits: [
            { metric: 'Time Savings', value: 90, unit: '%', timeframe: 'weekly', confidence: 0.95 },
            {
              metric: 'Error Reduction',
              value: 99.7,
              unit: '%',
              timeframe: 'ongoing',
              confidence: 0.92,
            },
            {
              metric: 'Cost Savings',
              value: 35000,
              unit: '$',
              timeframe: 'annually',
              confidence: 0.88,
            },
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
          updatedAt: '2024-08-09T14:00:00Z',
        },
        {
          id: '2',
          title: 'Increase Sales Conversion by 40%',
          description:
            'AI-powered lead scoring and personalized outreach that turns more prospects into paying customers.',
          category: 'REVENUE_INCREASE',
          problemStatement:
            'Sales teams struggle with low conversion rates due to poor lead qualification and generic messaging.',
          targetPainPoints: [
            'Low conversion rates',
            'Unqualified leads',
            'Generic outreach',
            'Wasted sales time',
          ],
          solutionDescription:
            'Intelligent lead scoring combined with personalized messaging based on prospect behavior and needs.',
          keyBenefits: [
            '40% higher conversion',
            'Pre-qualified hot leads',
            'Personalized messaging',
            'Shorter sales cycles',
          ],
          quantifiableBenefits: [
            {
              metric: 'Conversion Rate',
              value: 40,
              unit: '%',
              timeframe: 'quarterly',
              confidence: 0.91,
            },
            {
              metric: 'Sales Cycle',
              value: 25,
              unit: '% faster',
              timeframe: 'ongoing',
              confidence: 0.87,
            },
            {
              metric: 'Revenue Increase',
              value: 125000,
              unit: '$',
              timeframe: 'annually',
              confidence: 0.93,
            },
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
          updatedAt: '2024-08-08T16:00:00Z',
        },
      ]

      const mockProblems: CustomerProblem[] = [
        {
          id: '1',
          customerId: 'cust-1',
          customerName: 'TechCorp Solutions',
          problemTitle: 'Manual Invoice Processing Taking 2 Days',
          problemDescription:
            'Current invoice processing is completely manual, taking our accounting team 2 full days per week and causing frequent errors.',
          problemCategory: 'OPERATIONAL_INEFFICIENCY',
          severity: 'HIGH',
          urgency: 'HIGH',
          businessImpact:
            'Delays in cash flow, customer complaints about billing errors, team burnout',
          financialImpact: {
            lossAmount: 25000,
            timeWasted: 16,
          },
          matchedValueProps: ['1'],
          confidenceScore: 0.94,
          identifiedFrom: 'CALL',
          createdAt: '2024-08-07T11:00:00Z',
        },
        {
          id: '2',
          customerId: 'cust-2',
          customerName: 'Growth Industries',
          problemTitle: 'Low Sales Conversion - Only 12%',
          problemDescription:
            'Our sales team is generating leads but conversion rate is stuck at 12%, well below industry average of 25%.',
          problemCategory: 'POOR_CUSTOMER_EXPERIENCE',
          severity: 'CRITICAL',
          urgency: 'URGENT',
          businessImpact: 'Missing revenue targets, wasted marketing spend, demotivated sales team',
          financialImpact: {
            lossAmount: 75000,
            timeWasted: 40,
          },
          matchedValueProps: ['2'],
          confidenceScore: 0.91,
          identifiedFrom: 'LINKEDIN',
          createdAt: '2024-08-06T15:30:00Z',
        },
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
            { format: 'PDF', url: '/api/infographics/final/1.pdf', size: '8.5x11' },
          ],
          qualityScore: 0.92,
          viewCount: 15,
          downloadCount: 3,
          status: 'GENERATED',
          generatedAt: '2024-08-08T10:00:00Z',
        },
      ]

      setValuePropositions(mockValueProps)
      setCustomerProblems(mockProblems)
      setGeneratedInfographics(mockInfographics)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInfographic = async (
    customerId: string,
    _problemIds: string[],
    valuePropIds: string[]
  ) => {
    try {
      // This would call the infographic generation API

      // Mock generation - in real app, this would be an async API call
      const newInfographic: GeneratedInfographic = {
        id: Date.now().toString(),
        title: `Personalized Solution for Customer ${customerId}`,
        customerId,
        customerName:
          customerProblems.find((p) => p.customerId === customerId)?.customerName || 'Customer',
        templateId: 'template-1',
        templateName: 'Problem-Solution Modern',
        previewUrl: '/api/infographics/preview/new',
        finalAssets: [{ format: 'PNG', url: '/api/infographics/final/new.png', size: '800x1200' }],
        qualityScore: 0.87,
        viewCount: 0,
        downloadCount: 0,
        status: 'GENERATING',
        generatedAt: new Date().toISOString(),
      }

      setGeneratedInfographics([newInfographic, ...generatedInfographics])

      // Simulate generation completion
      setTimeout(() => {
        setGeneratedInfographics((prev) =>
          prev.map((ig) =>
            ig.id === newInfographic.id ? { ...ig, status: 'GENERATED', qualityScore: 0.91 } : ig
          )
        )
      }, 3000)

      setShowGenerateModal(false)
    } catch (error) {}
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500 text-white'
      case 'HIGH':
        return 'bg-orange-500 text-white'
      case 'MEDIUM':
        return 'bg-yellow-500 text-black'
      case 'LOW':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EFFICIENCY_GAIN':
        return ArrowTrendingUpIcon
      case 'REVENUE_INCREASE':
        return CurrencyDollarIcon
      case 'COST_REDUCTION':
        return ChartBarIcon
      case 'AUTOMATION':
        return SparklesIcon
      default:
        return LightBulbIcon
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing Materials Studio</h1>
          <p className="mt-1 text-gray-400">
            AI-powered value propositions and personalized infographics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <AccessibleButton
            onClick={() => setShowGenerateModal(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600"
          >
            <SparklesIcon className="mr-2 h-4 w-4" />
            Generate Materials
          </AccessibleButton>
          <AccessibleButton variant="secondary" onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Value Prop
          </AccessibleButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              id: 'value-props',
              name: 'Value Propositions',
              icon: TargetIcon,
              count: valuePropositions.length,
            },
            {
              id: 'problems',
              name: 'Customer Problems',
              icon: UserGroupIcon,
              count: customerProblems.length,
            },
            {
              id: 'infographics',
              name: 'Generated Materials',
              icon: PhotoIcon,
              count: generatedInfographics.length,
            },
            { id: 'brand', name: 'Brand Setup', icon: PresentationChartLineIcon },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as unknown)}
                className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
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
                  className="rounded-xl border border-gray-800 bg-gray-900/60 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center space-x-3">
                        <div className="rounded-lg bg-violet-500/20 p-2">
                          <CategoryIcon className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{valueProp.title}</h3>
                          <span className="text-sm text-violet-400 capitalize">
                            {valueProp.category.replace('_', ' ').toLowerCase()}
                          </span>
                        </div>
                      </div>

                      <p className="mb-4 text-gray-300">{valueProp.description}</p>

                      <div className="mb-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="mb-2 font-medium text-white">Problem</h4>
                          <p className="text-sm text-gray-400">{valueProp.problemStatement}</p>
                        </div>
                        <div>
                          <h4 className="mb-2 font-medium text-white">Solution</h4>
                          <p className="text-sm text-gray-400">{valueProp.solutionDescription}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="mb-2 font-medium text-white">Quantifiable Benefits</h4>
                        <div className="flex flex-wrap gap-2">
                          {valueProp.quantifiableBenefits.map((benefit, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1"
                            >
                              <span className="font-medium text-green-300">
                                {benefit.value}
                                {benefit.unit} {benefit.metric}
                              </span>
                              <span className="ml-1 text-xs text-green-400">
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
                        <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-900/20 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <BeakerIcon className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-300">
                              AI Suggestions
                            </span>
                          </div>
                          <ul className="space-y-1 text-sm text-blue-200">
                            {valueProp.aiSuggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="mt-1 text-blue-400">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <AccessibleButton variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </AccessibleButton>
                      <AccessibleButton variant="ghost" size="sm">
                        <PencilIcon className="h-4 w-4" />
                      </AccessibleButton>
                      <AccessibleButton variant="ghost" size="sm">
                        <TrashIcon className="h-4 w-4" />
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
                className="rounded-xl border border-gray-800 bg-gray-900/60 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center space-x-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${getSeverityColor(problem.severity)}`}
                      >
                        {problem.severity}
                      </span>
                      <span className="text-sm text-gray-400">from {problem.identifiedFrom}</span>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {problem.problemTitle}
                    </h3>
                    <p className="mb-3 text-gray-300">{problem.problemDescription}</p>

                    <div className="mb-4">
                      <h4 className="mb-2 font-medium text-white">Business Impact</h4>
                      <p className="text-sm text-gray-400">{problem.businessImpact}</p>
                    </div>

                    {problem.financialImpact && (
                      <div className="mb-4">
                        <h4 className="mb-2 font-medium text-white">Financial Impact</h4>
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
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {generatedInfographics.map((infographic, index) => (
              <motion.div
                key={infographic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"
              >
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-gray-800">
                  {infographic.previewUrl ? (
                    <img
                      src={infographic.previewUrl}
                      alt={infographic.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {infographic.status === 'GENERATING' ? (
                        <div className="flex flex-col items-center">
                          <ArrowPathIcon className="mb-2 h-8 w-8 animate-spin text-violet-400" />
                          <span className="text-sm text-gray-400">Generating...</span>
                        </div>
                      ) : (
                        <PhotoIcon className="h-12 w-12 text-gray-600" />
                      )}
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        infographic.status === 'GENERATED'
                          ? 'bg-green-500/20 text-green-300'
                          : infographic.status === 'GENERATING'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {infographic.status}
                    </span>
                  </div>
                </div>

                <h3 className="mb-1 truncate font-semibold text-white">{infographic.title}</h3>
                <p className="mb-3 text-sm text-gray-400">{infographic.customerName}</p>

                <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
                  <span>Quality: {Math.round(infographic.qualityScore * 100)}%</span>
                  <span>{infographic.viewCount} views</span>
                  <span>{infographic.downloadCount} downloads</span>
                </div>

                <div className="flex items-center space-x-2">
                  <AccessibleButton variant="ghost" size="sm" className="flex-1">
                    <EyeIcon className="mr-1 h-4 w-4" />
                    View
                  </AccessibleButton>
                  <AccessibleButton variant="ghost" size="sm" className="flex-1">
                    <ShareIcon className="mr-1 h-4 w-4" />
                    Share
                  </AccessibleButton>
                  <AccessibleButton variant="ghost" size="sm" className="flex-1">
                    <DownloadIcon className="mr-1 h-4 w-4" />
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
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
              <h2 className="mb-6 text-xl font-semibold text-white">Brand Setup</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Company Name</label>
                  <AccessibleInput
                    value={brandElements.companyName}
                    onChange={(value) => setBrandElements({ ...brandElements, companyName: value })}
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Tagline</label>
                  <AccessibleInput
                    value={brandElements.tagline || ''}
                    onChange={(value) => setBrandElements({ ...brandElements, tagline: value })}
                    placeholder="Enter your company tagline"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandElements.primaryColor}
                        onChange={(e) =>
                          setBrandElements({ ...brandElements, primaryColor: e.target.value })
                        }
                        className="h-12 w-12 rounded border-2 border-gray-700"
                      />
                      <AccessibleInput
                        value={brandElements.primaryColor}
                        onChange={(value) =>
                          setBrandElements({ ...brandElements, primaryColor: value })
                        }
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandElements.secondaryColor}
                        onChange={(e) =>
                          setBrandElements({ ...brandElements, secondaryColor: e.target.value })
                        }
                        className="h-12 w-12 rounded border-2 border-gray-700"
                      />
                      <AccessibleInput
                        value={brandElements.secondaryColor}
                        onChange={(value) =>
                          setBrandElements({ ...brandElements, secondaryColor: value })
                        }
                        placeholder="#64748B"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Visual Style</label>
                  <AccessibleSelect
                    value={brandElements.visualStyle}
                    onChange={(value) => setBrandElements({ ...brandElements, visualStyle: value })}
                    options={[
                      { value: 'CORPORATE', label: 'Corporate' },
                      { value: 'MODERN', label: 'Modern' },
                      { value: 'PLAYFUL', label: 'Playful' },
                      { value: 'TECHNICAL', label: 'Technical' },
                      { value: 'MINIMALIST', label: 'Minimalist' },
                    ]}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Logo Upload</label>
                  <div className="rounded-lg border-2 border-dashed border-gray-700 p-6 text-center">
                    <PhotoIcon className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-400">Upload your company logo</p>
                    <AccessibleButton variant="secondary" size="sm">
                      Choose File
                    </AccessibleButton>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <AccessibleButton variant="secondary">Cancel</AccessibleButton>
                  <AccessibleButton>Save Brand Settings</AccessibleButton>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Generate Marketing Materials</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Customer</label>
                  <AccessibleSelect
                    value={selectedCustomer || ''}
                    onChange={setSelectedCustomer}
                    options={customerProblems.map((p) => ({
                      value: p.customerId || '',
                      label: p.customerName || 'Unknown',
                    }))}
                    placeholder="Select customer"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Problems to Address
                  </label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {customerProblems
                      .filter((p) => !selectedCustomer || p.customerId === selectedCustomer)
                      .map((problem) => (
                        <label key={problem.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-600 text-violet-500"
                          />
                          <span className="text-sm text-white">{problem.problemTitle}</span>
                        </label>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Value Propositions
                  </label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {valuePropositions.map((valueProp) => (
                      <label key={valueProp.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-600 text-violet-500"
                        />
                        <span className="text-sm text-white">{valueProp.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <AccessibleButton variant="secondary" onClick={() => setShowGenerateModal(false)}>
                    Cancel
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={() =>
                      selectedCustomer && handleGenerateInfographic(selectedCustomer, [], [])
                    }
                    disabled={!selectedCustomer}
                  >
                    <SparklesIcon className="mr-2 h-4 w-4" />
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
