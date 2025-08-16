/**
 * CoreFlow360 - Onboarding Manager for SaaS
 * Customer onboarding workflows and progress tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  CalendarIcon,
  StarIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface OnboardingStep {
  id: string
  title: string
  description: string
  category: 'SETUP' | 'INTEGRATION' | 'TRAINING' | 'ACTIVATION'
  estimatedTime: number
  required: boolean
  dependencies?: string[]
  resources: Array<{
    type: 'ARTICLE' | 'VIDEO' | 'DEMO' | 'TEMPLATE'
    title: string
    url: string
    duration?: number
  }>
}

interface CustomerOnboarding {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  companyName: string
  planName: string
  startDate: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'STALLED'
  overallProgress: number
  currentStep?: string
  completedSteps: string[]
  skippedSteps: string[]
  timeSpent: number
  estimatedCompletion: string
  assignedCSM?: string
  milestones: Array<{
    id: string
    title: string
    description: string
    targetDate: string
    completedDate?: string
    status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
  }>
  touchpoints: Array<{
    type: 'EMAIL' | 'CALL' | 'MEETING' | 'CHAT'
    date: string
    description: string
    outcome?: string
  }>
  healthScore: number
  riskFactors: Array<{
    factor: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    description: string
  }>
  successMetrics: {
    timeToFirstValue: number
    featureAdoption: Record<string, boolean>
    engagementScore: number
    satisfactionScore?: number
  }
}

interface OnboardingMetrics {
  totalCustomers: number
  activeOnboarding: number
  completionRate: number
  averageTimeToComplete: number
  averageTimeToFirstValue: number
  stalledOnboarding: number
  successScore: number
  csmEfficiency: number
}

interface OnboardingTemplate {
  id: string
  name: string
  description: string
  planTypes: string[]
  steps: OnboardingStep[]
  estimatedDuration: number
}

interface OnboardingManagerProps {
  onCustomerSelect?: (customer: CustomerOnboarding) => void
  onStepComplete?: (customerId: string, stepId: string) => void
  onScheduleCall?: (customer: CustomerOnboarding) => void
  onSendResource?: (customer: CustomerOnboarding, resource: any) => void
}

const statusColors = {
  NOT_STARTED: 'text-gray-700 bg-gray-100',
  IN_PROGRESS: 'text-blue-700 bg-blue-100',
  COMPLETED: 'text-green-700 bg-green-100',
  STALLED: 'text-red-700 bg-red-100'
}

const categoryColors = {
  SETUP: 'text-blue-600 bg-blue-50',
  INTEGRATION: 'text-purple-600 bg-purple-50',
  TRAINING: 'text-orange-600 bg-orange-50',
  ACTIVATION: 'text-green-600 bg-green-50'
}

const getHealthColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export default function OnboardingManager({
  onCustomerSelect,
  onStepComplete,
  onScheduleCall,
  onSendResource
}: OnboardingManagerProps) {
  const [customers, setCustomers] = useState<CustomerOnboarding[]>([])
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null)
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'all' | 'active' | 'stalled' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<string>('overallProgress')

  useEffect(() => {
    loadOnboardingData()
  }, [selectedView, sortBy])

  const loadOnboardingData = async () => {
    try {
      setLoading(true)
      
      // Mock onboarding steps
      const mockSteps: OnboardingStep[] = [
        {
          id: 'profile-setup',
          title: 'Complete Profile Setup',
          description: 'Add company details and user preferences',
          category: 'SETUP',
          estimatedTime: 10,
          required: true,
          resources: [
            { type: 'ARTICLE', title: 'Getting Started Guide', url: '/guide/setup' }
          ]
        },
        {
          id: 'data-import',
          title: 'Import Your Data',
          description: 'Connect and import data from existing systems',
          category: 'INTEGRATION',
          estimatedTime: 30,
          required: true,
          dependencies: ['profile-setup'],
          resources: [
            { type: 'VIDEO', title: 'Data Import Tutorial', url: '/videos/import', duration: 5 },
            { type: 'TEMPLATE', title: 'CSV Import Template', url: '/templates/csv' }
          ]
        },
        {
          id: 'team-invite',
          title: 'Invite Team Members',
          description: 'Add your team and set up permissions',
          category: 'SETUP',
          estimatedTime: 15,
          required: false,
          dependencies: ['profile-setup'],
          resources: [
            { type: 'ARTICLE', title: 'User Management Guide', url: '/guide/users' }
          ]
        },
        {
          id: 'first-report',
          title: 'Create Your First Report',
          description: 'Build a basic report to see your data in action',
          category: 'ACTIVATION',
          estimatedTime: 20,
          required: true,
          dependencies: ['data-import'],
          resources: [
            { type: 'VIDEO', title: 'Report Builder Tutorial', url: '/videos/reports', duration: 8 },
            { type: 'DEMO', title: 'Live Demo Session', url: '/demo/reports' }
          ]
        },
        {
          id: 'automation-setup',
          title: 'Set Up Automation',
          description: 'Configure automated workflows for your processes',
          category: 'ACTIVATION',
          estimatedTime: 45,
          required: false,
          dependencies: ['first-report'],
          resources: [
            { type: 'VIDEO', title: 'Automation Masterclass', url: '/videos/automation', duration: 15 },
            { type: 'TEMPLATE', title: 'Common Automation Templates', url: '/templates/automation' }
          ]
        }
      ]

      // Mock customer onboarding data
      const mockCustomers: CustomerOnboarding[] = [
        {
          id: 'onb-1',
          customerId: 'cust-1',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@techstartup.io',
          companyName: 'Tech Startup Inc',
          planName: 'Professional',
          startDate: '2024-08-05',
          status: 'IN_PROGRESS',
          overallProgress: 0.8,
          currentStep: 'automation-setup',
          completedSteps: ['profile-setup', 'data-import', 'team-invite', 'first-report'],
          skippedSteps: [],
          timeSpent: 125,
          estimatedCompletion: '2024-08-12',
          assignedCSM: 'Jennifer Lee',
          milestones: [
            {
              id: 'm1',
              title: 'Account Setup Complete',
              description: 'Profile and basic configuration finished',
              targetDate: '2024-08-06',
              completedDate: '2024-08-05',
              status: 'COMPLETED'
            },
            {
              id: 'm2',
              title: 'Data Integration Live',
              description: 'Successfully imported and validated data',
              targetDate: '2024-08-08',
              completedDate: '2024-08-07',
              status: 'COMPLETED'
            },
            {
              id: 'm3',
              title: 'First Value Achieved',
              description: 'Generated first meaningful report/insight',
              targetDate: '2024-08-10',
              completedDate: '2024-08-08',
              status: 'COMPLETED'
            },
            {
              id: 'm4',
              title: 'Full Platform Adoption',
              description: 'Using advanced features and automation',
              targetDate: '2024-08-12',
              status: 'PENDING'
            }
          ],
          touchpoints: [
            {
              type: 'EMAIL',
              date: '2024-08-05',
              description: 'Welcome and onboarding kickoff email',
              outcome: 'Opened and engaged'
            },
            {
              type: 'CALL',
              date: '2024-08-06',
              description: 'Onboarding kickoff call with CSM',
              outcome: 'Excellent - very motivated customer'
            },
            {
              type: 'EMAIL',
              date: '2024-08-07',
              description: 'Data import success confirmation',
              outcome: 'Customer replied with questions'
            }
          ],
          healthScore: 92,
          riskFactors: [],
          successMetrics: {
            timeToFirstValue: 3,
            featureAdoption: {
              dashboard: true,
              reports: true,
              integrations: true,
              automation: false,
              api: false
            },
            engagementScore: 88,
            satisfactionScore: 4.8
          }
        },
        {
          id: 'onb-2',
          customerId: 'cust-2',
          customerName: 'Mark Wilson',
          customerEmail: 'mark@smallbiz.com',
          companyName: 'Small Business Co',
          planName: 'Starter',
          startDate: '2024-08-01',
          status: 'STALLED',
          overallProgress: 0.2,
          currentStep: 'data-import',
          completedSteps: ['profile-setup'],
          skippedSteps: [],
          timeSpent: 15,
          estimatedCompletion: '2024-08-20',
          assignedCSM: 'Michael Chen',
          milestones: [
            {
              id: 'm1',
              title: 'Account Setup Complete',
              description: 'Profile and basic configuration finished',
              targetDate: '2024-08-02',
              completedDate: '2024-08-01',
              status: 'COMPLETED'
            },
            {
              id: 'm2',
              title: 'Data Integration Live',
              description: 'Successfully imported and validated data',
              targetDate: '2024-08-05',
              status: 'OVERDUE'
            },
            {
              id: 'm3',
              title: 'First Value Achieved',
              description: 'Generated first meaningful report/insight',
              targetDate: '2024-08-08',
              status: 'PENDING'
            }
          ],
          touchpoints: [
            {
              type: 'EMAIL',
              date: '2024-08-01',
              description: 'Welcome email sent',
              outcome: 'Not opened'
            },
            {
              type: 'EMAIL',
              date: '2024-08-04',
              description: 'Follow-up reminder email',
              outcome: 'Opened but no action'
            },
            {
              type: 'EMAIL',
              date: '2024-08-07',
              description: 'CSM personal outreach',
              outcome: 'Reply: "Will get to it this week"'
            }
          ],
          healthScore: 35,
          riskFactors: [
            {
              factor: 'Delayed progress',
              severity: 'HIGH',
              description: 'Customer is 4 days behind schedule'
            },
            {
              factor: 'Low engagement',
              severity: 'MEDIUM',
              description: 'Minimal platform usage after signup'
            }
          ],
          successMetrics: {
            timeToFirstValue: 0,
            featureAdoption: {
              dashboard: true,
              reports: false,
              integrations: false,
              automation: false,
              api: false
            },
            engagementScore: 25
          }
        }
      ]

      const mockMetrics: OnboardingMetrics = {
        totalCustomers: mockCustomers.length,
        activeOnboarding: mockCustomers.filter(c => c.status === 'IN_PROGRESS').length,
        completionRate: 85.5,
        averageTimeToComplete: 12.5,
        averageTimeToFirstValue: 4.2,
        stalledOnboarding: mockCustomers.filter(c => c.status === 'STALLED').length,
        successScore: 87.3,
        csmEfficiency: 92.1
      }

      const mockTemplates: OnboardingTemplate[] = [
        {
          id: 'template-starter',
          name: 'Starter Plan Onboarding',
          description: 'Streamlined onboarding for small teams',
          planTypes: ['Starter'],
          steps: mockSteps.filter(s => s.required || ['team-invite'].includes(s.id)),
          estimatedDuration: 5
        },
        {
          id: 'template-professional',
          name: 'Professional Plan Onboarding',
          description: 'Comprehensive onboarding with advanced features',
          planTypes: ['Professional'],
          steps: mockSteps,
          estimatedDuration: 10
        }
      ]

      setCustomers(mockCustomers)
      setMetrics(mockMetrics)
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Failed to load onboarding data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    switch (selectedView) {
      case 'active':
        return customer.status === 'IN_PROGRESS'
      case 'stalled':
        return customer.status === 'STALLED'
      case 'completed':
        return customer.status === 'COMPLETED'
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Onboarding</h1>
          <p className="text-gray-600 mt-1">Track onboarding progress and optimize customer success</p>
        </div>
      </div>

      {/* Stalled Customers Alert */}
      {customers.filter(c => c.status === 'STALLED').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-orange-800">Onboarding Attention Needed</h3>
              <p className="mt-1 text-sm text-orange-700">
                {customers.filter(c => c.status === 'STALLED').length} customer(s) have stalled onboarding and need intervention
              </p>
              <div className="mt-3 flex space-x-2">
                <button className="inline-flex items-center px-3 py-1 border border-orange-300 rounded-md text-xs font-medium text-orange-700 bg-white hover:bg-orange-50">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Schedule Check-ins
                </button>
                <button className="inline-flex items-center px-3 py-1 border border-orange-300 rounded-md text-xs font-medium text-orange-700 bg-white hover:bg-orange-50">
                  <VideoCameraIcon className="h-3 w-3 mr-1" />
                  Offer Demo Sessions
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={`${metrics.completionRate}%`}
            label="Completion Rate"
            icon={TrophyIcon}
            gradient="emerald"
            trend={2.5}
          />
          <MetricCard
            value={metrics.activeOnboarding.toString()}
            label="Active Onboarding"
            icon={RocketLaunchIcon}
            gradient="blue"
            trend={15.8}
          />
          <MetricCard
            value={`${metrics.averageTimeToComplete}d`}
            label="Avg Time to Complete"
            icon={ClockIcon}
            gradient="violet"
            trend={-8.3}
          />
          <MetricCard
            value={`${metrics.averageTimeToFirstValue}d`}
            label="Time to First Value"
            icon={StarIcon}
            gradient="orange"
            trend={-12.1}
          />
        </div>
      )}

      {/* View Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Customers' },
              { key: 'active', label: 'In Progress' },
              { key: 'stalled', label: 'Stalled' },
              { key: 'completed', label: 'Completed' }
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => setSelectedView(view.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedView === view.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="overallProgress">Progress</option>
            <option value="healthScore">Health Score</option>
            <option value="startDate">Start Date</option>
            <option value="estimatedCompletion">Est. Completion</option>
          </select>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCustomers.map((customer, index) => (
            <motion.li
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onCustomerSelect?.(customer)}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        customer.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                        customer.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                        customer.status === 'STALLED' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <RocketLaunchIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {customer.companyName}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[customer.status]}`}>
                          {customer.status.replace('_', ' ')}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-purple-800 bg-purple-100">
                          {customer.planName}
                        </span>
                        {customer.assignedCSM && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-700 bg-gray-100">
                            CSM: {customer.assignedCSM}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">
                          {customer.customerEmail} • Started {new Date(customer.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6 mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Progress:</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${customer.overallProgress * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-blue-600">
                            {Math.round(customer.overallProgress * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Health:</span>
                          <span className={`text-xs font-medium ${getHealthColor(customer.healthScore)}`}>
                            {customer.healthScore}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Time Spent:</span>
                          <span className="text-xs font-medium text-gray-700">
                            {customer.timeSpent}min
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Steps:</span>
                          <span className="text-xs font-medium text-gray-700">
                            {customer.completedSteps.length}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Est. Complete: {new Date(customer.estimatedCompletion).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {customer.touchpoints.length} touchpoint(s)
                      </p>
                      {customer.successMetrics.timeToFirstValue > 0 && (
                        <p className="text-sm text-green-600">
                          First value in {customer.successMetrics.timeToFirstValue}d
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {customer.status === 'STALLED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onScheduleCall?.(customer)
                          }}
                          className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-md"
                          title="Schedule Call"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSendResource?.(customer, null)
                        }}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Send Resources"
                      >
                        <AcademicCapIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Send message
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                        title="Send Message"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Step & Next Actions */}
                {customer.currentStep && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-700">
                        Current Step: <span className="text-blue-600">{customer.currentStep.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </p>
                      {customer.currentStep && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStepComplete?.(customer.customerId, customer.currentStep!)
                          }}
                          className="inline-flex items-center px-2 py-1 border border-green-300 rounded text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100"
                        >
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {customer.riskFactors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Risk Factors:</p>
                    <div className="flex flex-wrap gap-2">
                      {customer.riskFactors.map((risk, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            risk.severity === 'HIGH' ? 'text-red-700 bg-red-50' :
                            risk.severity === 'MEDIUM' ? 'text-yellow-700 bg-yellow-50' :
                            'text-gray-700 bg-gray-50'
                          }`}
                        >
                          {risk.factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No onboarding customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No customers match the selected criteria
          </p>
        </div>
      )}
    </div>
  )
}