/**
 * CoreFlow360 - Customer Success Manager for SaaS
 * Health scoring, churn prediction, and customer journey management
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  TrendingDownIcon,
  UserGroupIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BellIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface CustomerHealth {
  subscriptionId: string
  customerEmail: string
  customerName?: string
  companyName?: string
  planName: string
  healthScore: number
  engagementScore: number
  churnRisk: number
  customerStage: 'TRIAL' | 'ONBOARDING' | 'ACTIVATION' | 'GROWTH' | 'MATURITY' | 'RENEWAL' | 'CHURN'
  daysInStage: number
  lastActivityDate?: string
  onboardingProgress: number
  featureAdoption: Record<string, number>
  usageMetrics: {
    loginsThisWeek: number
    sessionsThisMonth: number
    featuresUsedThisWeek: number
    apiCallsThisMonth: number
  }
  supportMetrics: {
    ticketsThisMonth: number
    avgResponseTime: number
    lastContactDate?: string
    satisfactionScore?: number
  }
  revenueMetrics: {
    mrr: number
    ltv?: number
    paymentStatus: 'CURRENT' | 'PAST_DUE' | 'FAILED'
    nextRenewalDate?: string
  }
  riskFactors: Array<{
    factor: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    description: string
  }>
  successOpportunities: Array<{
    opportunity: string
    impact: 'LOW' | 'MEDIUM' | 'HIGH'
    description: string
    effort: 'LOW' | 'MEDIUM' | 'HIGH'
  }>
  journey: Array<{
    stage: string
    enteredAt: string
    exitedAt?: string
    goalAchieved: boolean
    keyMetric?: number
  }>
}

interface CustomerSuccessMetrics {
  totalCustomers: number
  healthyCustomers: number
  atRiskCustomers: number
  averageHealthScore: number
  churnRate: number
  npsScore: number
  averageOnboardingTime: number
  featureAdoptionRate: number
}

interface CustomerSuccessManagerProps {
  onCustomerSelect?: (customer: CustomerHealth) => void
  onSendMessage?: (customer: CustomerHealth) => void
  onScheduleCall?: (customer: CustomerHealth) => void
  onCreateIntervention?: (customer: CustomerHealth) => void
}

const stageColors = {
  TRIAL: 'text-blue-700 bg-blue-100',
  ONBOARDING: 'text-purple-700 bg-purple-100',
  ACTIVATION: 'text-green-700 bg-green-100',
  GROWTH: 'text-emerald-700 bg-emerald-100',
  MATURITY: 'text-gray-700 bg-gray-100',
  RENEWAL: 'text-yellow-700 bg-yellow-100',
  CHURN: 'text-red-700 bg-red-100'
}

const getHealthColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getChurnRiskColor = (risk: number) => {
  if (risk <= 0.3) return 'text-green-600'
  if (risk <= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

const getRiskSeverityColor = (severity: string) => {
  switch (severity) {
    case 'LOW': return 'text-green-600 bg-green-50'
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
    case 'HIGH': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export default function CustomerSuccessManager({
  onCustomerSelect,
  onSendMessage,
  onScheduleCall,
  onCreateIntervention
}: CustomerSuccessManagerProps) {
  const [customers, setCustomers] = useState<CustomerHealth[]>([])
  const [metrics, setMetrics] = useState<CustomerSuccessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'all' | 'at-risk' | 'healthy' | 'churning'>('all')
  const [sortBy, setSortBy] = useState<string>('churnRisk')

  useEffect(() => {
    loadCustomerHealth()
  }, [selectedView, sortBy])

  const loadCustomerHealth = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockCustomers: CustomerHealth[] = [
        {
          subscriptionId: 'sub-1',
          customerEmail: 'john@acmecorp.com',
          customerName: 'John Smith',
          companyName: 'ACME Corp',
          planName: 'Professional',
          healthScore: 85,
          engagementScore: 78,
          churnRisk: 0.15,
          customerStage: 'GROWTH',
          daysInStage: 45,
          lastActivityDate: '2024-08-08',
          onboardingProgress: 1.0,
          featureAdoption: {
            dashboard: 0.95,
            reports: 0.78,
            integrations: 0.65,
            automation: 0.45,
            api: 0.25
          },
          usageMetrics: {
            loginsThisWeek: 12,
            sessionsThisMonth: 45,
            featuresUsedThisWeek: 8,
            apiCallsThisMonth: 2340
          },
          supportMetrics: {
            ticketsThisMonth: 1,
            avgResponseTime: 2.5,
            lastContactDate: '2024-07-15',
            satisfactionScore: 4.5
          },
          revenueMetrics: {
            mrr: 299,
            ltv: 3588,
            paymentStatus: 'CURRENT',
            nextRenewalDate: '2025-01-15'
          },
          riskFactors: [
            {
              factor: 'Low API Usage',
              severity: 'MEDIUM',
              description: 'API calls decreased 30% this month'
            }
          ],
          successOpportunities: [
            {
              opportunity: 'Automation Setup',
              impact: 'HIGH',
              description: 'Customer could save 10+ hours/week with workflow automation',
              effort: 'MEDIUM'
            },
            {
              opportunity: 'Integration Expansion',
              impact: 'MEDIUM',
              description: 'Multiple unused integrations available',
              effort: 'LOW'
            }
          ],
          journey: [
            { stage: 'TRIAL', enteredAt: '2023-12-15', exitedAt: '2023-12-29', goalAchieved: true },
            { stage: 'ONBOARDING', enteredAt: '2024-01-15', exitedAt: '2024-02-01', goalAchieved: true },
            { stage: 'ACTIVATION', enteredAt: '2024-02-01', exitedAt: '2024-03-15', goalAchieved: true },
            { stage: 'GROWTH', enteredAt: '2024-03-15', goalAchieved: false, keyMetric: 78 }
          ]
        },
        {
          subscriptionId: 'sub-4',
          customerEmail: 'lisa@retailstore.com',
          customerName: 'Lisa Chen',
          companyName: 'Retail Store Co',
          planName: 'Professional',
          healthScore: 35,
          engagementScore: 28,
          churnRisk: 0.85,
          customerStage: 'CHURN',
          daysInStage: 15,
          lastActivityDate: '2024-07-25',
          onboardingProgress: 1.0,
          featureAdoption: {
            dashboard: 0.45,
            reports: 0.25,
            integrations: 0.0,
            automation: 0.0,
            api: 0.0
          },
          usageMetrics: {
            loginsThisWeek: 1,
            sessionsThisMonth: 3,
            featuresUsedThisWeek: 2,
            apiCallsThisMonth: 0
          },
          supportMetrics: {
            ticketsThisMonth: 4,
            avgResponseTime: 8.2,
            lastContactDate: '2024-08-01',
            satisfactionScore: 2.1
          },
          revenueMetrics: {
            mrr: 299,
            paymentStatus: 'PAST_DUE',
            nextRenewalDate: '2024-12-01'
          },
          riskFactors: [
            {
              factor: 'Payment Past Due',
              severity: 'HIGH',
              description: 'Payment failed 3 times, account suspended'
            },
            {
              factor: 'Low Engagement',
              severity: 'HIGH',
              description: 'Only 1 login in the past 2 weeks'
            },
            {
              factor: 'Poor Support Experience',
              severity: 'HIGH',
              description: 'Multiple unresolved tickets, low satisfaction'
            }
          ],
          successOpportunities: [
            {
              opportunity: 'Executive Intervention',
              impact: 'HIGH',
              description: 'Schedule executive call to address concerns',
              effort: 'HIGH'
            }
          ],
          journey: [
            { stage: 'ONBOARDING', enteredAt: '2023-12-01', exitedAt: '2023-12-15', goalAchieved: true },
            { stage: 'ACTIVATION', enteredAt: '2023-12-15', exitedAt: '2024-02-01', goalAchieved: false },
            { stage: 'RENEWAL', enteredAt: '2024-07-01', exitedAt: '2024-07-25', goalAchieved: false },
            { stage: 'CHURN', enteredAt: '2024-07-25', goalAchieved: false, keyMetric: 35 }
          ]
        },
        {
          subscriptionId: 'sub-2',
          customerEmail: 'sarah@techstartup.io',
          customerName: 'Sarah Johnson',
          companyName: 'Tech Startup Inc',
          planName: 'Enterprise',
          healthScore: 92,
          engagementScore: 88,
          churnRisk: 0.08,
          customerStage: 'MATURITY',
          daysInStage: 120,
          lastActivityDate: '2024-08-09',
          onboardingProgress: 1.0,
          featureAdoption: {
            dashboard: 0.98,
            reports: 0.85,
            integrations: 0.92,
            automation: 0.78,
            api: 0.65,
            sso: 0.88
          },
          usageMetrics: {
            loginsThisWeek: 25,
            sessionsThisMonth: 120,
            featuresUsedThisWeek: 12,
            apiCallsThisMonth: 15600
          },
          supportMetrics: {
            ticketsThisMonth: 2,
            avgResponseTime: 1.2,
            lastContactDate: '2024-08-05',
            satisfactionScore: 4.9
          },
          revenueMetrics: {
            mrr: 999,
            ltv: 11988,
            paymentStatus: 'CURRENT',
            nextRenewalDate: '2025-03-01'
          },
          riskFactors: [],
          successOpportunities: [
            {
              opportunity: 'Expansion Opportunity',
              impact: 'HIGH',
              description: 'Ready for additional user licenses',
              effort: 'LOW'
            },
            {
              opportunity: 'Case Study',
              impact: 'MEDIUM',
              description: 'Perfect candidate for success story',
              effort: 'MEDIUM'
            }
          ],
          journey: [
            { stage: 'TRIAL', enteredAt: '2024-02-01', exitedAt: '2024-02-15', goalAchieved: true },
            { stage: 'ONBOARDING', enteredAt: '2024-03-01', exitedAt: '2024-03-10', goalAchieved: true },
            { stage: 'ACTIVATION', enteredAt: '2024-03-10', exitedAt: '2024-04-01', goalAchieved: true },
            { stage: 'GROWTH', enteredAt: '2024-04-01', exitedAt: '2024-05-01', goalAchieved: true },
            { stage: 'MATURITY', enteredAt: '2024-05-01', goalAchieved: true, keyMetric: 92 }
          ]
        }
      ]

      const mockMetrics: CustomerSuccessMetrics = {
        totalCustomers: mockCustomers.length,
        healthyCustomers: mockCustomers.filter(c => c.healthScore >= 70).length,
        atRiskCustomers: mockCustomers.filter(c => c.churnRisk > 0.6).length,
        averageHealthScore: mockCustomers.reduce((sum, c) => sum + c.healthScore, 0) / mockCustomers.length,
        churnRate: 8.5,
        npsScore: 67,
        averageOnboardingTime: 14,
        featureAdoptionRate: 68.5
      }

      setCustomers(mockCustomers)
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Failed to load customer health:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    switch (selectedView) {
      case 'at-risk':
        return customer.churnRisk > 0.6
      case 'healthy':
        return customer.healthScore >= 70
      case 'churning':
        return customer.customerStage === 'CHURN'
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
          <h1 className="text-2xl font-bold text-gray-900">Customer Success</h1>
          <p className="text-gray-600 mt-1">Health monitoring, churn prevention, and customer journey optimization</p>
        </div>
      </div>

      {/* Quick Actions for At-Risk Customers */}
      {customers.filter(c => c.churnRisk > 0.7).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Urgent Action Required</h3>
              <p className="mt-1 text-sm text-red-700">
                {customers.filter(c => c.churnRisk > 0.7).length} customer(s) at critical churn risk
              </p>
              <div className="mt-3 flex space-x-2">
                <button className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50">
                  <PhoneIcon className="h-3 w-3 mr-1" />
                  Schedule Calls
                </button>
                <button className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50">
                  <EnvelopeIcon className="h-3 w-3 mr-1" />
                  Send Retention Emails
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
            value={`${metrics.averageHealthScore.toFixed(0)}%`}
            label="Average Health Score"
            icon={HeartIcon}
            gradient="emerald"
            trend={3.2}
          />
          <MetricCard
            value={metrics.atRiskCustomers.toString()}
            label="At-Risk Customers"
            icon={ExclamationTriangleIcon}
            gradient="red"
            trend={-12.5}
          />
          <MetricCard
            value={`${metrics.npsScore}`}
            label="Net Promoter Score"
            icon={StarIcon}
            gradient="violet"
            trend={8.1}
          />
          <MetricCard
            value={`${metrics.featureAdoptionRate}%`}
            label="Feature Adoption Rate"
            icon={ChartBarIcon}
            gradient="blue"
            trend={5.7}
          />
        </div>
      )}

      {/* View Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Customers' },
              { key: 'at-risk', label: 'At Risk' },
              { key: 'healthy', label: 'Healthy' },
              { key: 'churning', label: 'Churning' }
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
            <option value="churnRisk">Churn Risk</option>
            <option value="healthScore">Health Score</option>
            <option value="engagementScore">Engagement</option>
            <option value="lastActivityDate">Last Activity</option>
          </select>
        </div>
      </div>

      {/* Customer Health List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCustomers.map((customer, index) => (
            <motion.li
              key={customer.subscriptionId}
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
                        customer.healthScore >= 80 ? 'bg-green-100 text-green-600' :
                        customer.healthScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        <HeartIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {customer.companyName || customer.customerName}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[customer.customerStage]}`}>
                          {customer.customerStage}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-purple-800 bg-purple-100">
                          {customer.planName}
                        </span>
                        {customer.churnRisk > 0.7 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-red-800 bg-red-100">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Critical Risk
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">
                          {customer.customerEmail} • {customer.daysInStage} days in stage
                        </p>
                      </div>
                      <div className="flex items-center space-x-6 mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Health:</span>
                          <span className={`text-xs font-medium ${getHealthColor(customer.healthScore)}`}>
                            {customer.healthScore}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Churn Risk:</span>
                          <span className={`text-xs font-medium ${getChurnRiskColor(customer.churnRisk)}`}>
                            {(customer.churnRisk * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Engagement:</span>
                          <span className="text-xs font-medium text-blue-600">
                            {customer.engagementScore}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Logins/week:</span>
                          <span className="text-xs font-medium text-gray-700">
                            {customer.usageMetrics.loginsThisWeek}
                          </span>
                        </div>
                        {customer.supportMetrics.satisfactionScore && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">CSAT:</span>
                            <span className="text-xs font-medium text-green-600">
                              {customer.supportMetrics.satisfactionScore}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${customer.revenueMetrics.mrr}/mo
                      </p>
                      <p className="text-sm text-gray-500">
                        {customer.revenueMetrics.ltv ? `$${customer.revenueMetrics.ltv} LTV` : 'New customer'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {customer.riskFactors.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onCreateIntervention?.(customer)
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Create Intervention"
                        >
                          <BellIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onScheduleCall?.(customer)
                        }}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Schedule Call"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSendMessage?.(customer)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                        title="Send Message"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Risk Factors (for at-risk customers) */}
                {customer.riskFactors.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Risk Factors:</p>
                    <div className="flex flex-wrap gap-2">
                      {customer.riskFactors.slice(0, 3).map((risk, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskSeverityColor(risk.severity)}`}
                        >
                          {risk.factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Opportunities (for healthy customers) */}
                {customer.healthScore >= 70 && customer.successOpportunities.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Growth Opportunities:</p>
                    <div className="flex flex-wrap gap-2">
                      {customer.successOpportunities.slice(0, 2).map((opp, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-50"
                        >
                          {opp.opportunity}
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
          <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No customers match the selected criteria
          </p>
        </div>
      )}
    </div>
  )
}