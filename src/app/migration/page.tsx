'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  AlertTriangle,
  Download,
  Upload,
  Database,
  Settings,
  Users,
  BarChart3,
  Star,
  Award,
  Target,
  RefreshCw,
} from 'lucide-react'

interface CompetitorSolution {
  id: string
  name: string
  company: string
  description: string
  commonIssues: string[]
  migrationComplexity: 'low' | 'medium' | 'high'
  avgMigrationTime: string
  costSavings: {
    licensing: number
    implementation: number
    maintenance: number
    training: number
  }
  improvementAreas: string[]
  successStories: number
  icon: string
}

interface MigrationPlan {
  currentSolution: string
  companySize: string
  timeline: string
  priority: string
  dataVolume: string
  customizations: string
  integrations: string[]
}

interface CostComparison {
  current: {
    licensing: number
    implementation: number
    maintenance: number
    training: number
    total: number
  }
  coreflow: {
    licensing: number
    implementation: number
    maintenance: number
    training: number
    total: number
  }
  savings: {
    annual: number
    threeYear: number
    percentage: number
  }
}

export default function MigrationCenter() {
  const [step, setStep] = useState<'select' | 'plan' | 'comparison' | 'wizard'>('select')
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorSolution | null>(null)
  const [migrationPlan, setMigrationPlan] = useState<Partial<MigrationPlan>>({})
  const [costComparison, setCostComparison] = useState<CostComparison | null>(null)
  const [loading, setLoading] = useState(false)

  const competitors: CompetitorSolution[] = [
    {
      id: 'sap',
      name: 'SAP ERP',
      company: 'SAP',
      description: 'Legacy enterprise resource planning system with complex licensing',
      commonIssues: [
        'Extremely expensive licensing costs',
        'Complex implementation (12-24 months)',
        'Requires specialized consultants',
        'Poor user experience',
        'Limited AI capabilities',
        'Rigid customization options',
      ],
      migrationComplexity: 'high',
      avgMigrationTime: '3-6 months',
      costSavings: {
        licensing: 65,
        implementation: 80,
        maintenance: 70,
        training: 85,
      },
      improvementAreas: [
        'Modern AI-first interface',
        '10x faster implementation',
        '70% lower total cost of ownership',
        'Built-in business intelligence',
        'Mobile-first design',
      ],
      successStories: 47,
      icon: '/migration/sap-icon.svg',
    },
    {
      id: 'netsuite',
      name: 'NetSuite',
      company: 'Oracle',
      description: 'Cloud-based ERP with expensive per-user licensing model',
      commonIssues: [
        'High per-user costs scale poorly',
        'Limited customization without development',
        'Basic reporting capabilities',
        'No built-in AI features',
        'Complex workflow builder',
        'Slow customer support',
      ],
      migrationComplexity: 'medium',
      avgMigrationTime: '2-4 months',
      costSavings: {
        licensing: 55,
        implementation: 60,
        maintenance: 45,
        training: 75,
      },
      improvementAreas: [
        'AI-powered automation',
        'Advanced analytics included',
        '50% lower licensing costs',
        'Faster implementation',
        'Intuitive user interface',
      ],
      successStories: 89,
      icon: '/migration/netsuite-icon.svg',
    },
    {
      id: 'dynamics',
      name: 'Microsoft Dynamics',
      company: 'Microsoft',
      description: "Microsoft's business applications suite with Office integration",
      commonIssues: [
        'Requires Microsoft ecosystem lock-in',
        'Limited cross-platform support',
        'Expensive Power Platform add-ons',
        'Basic AI capabilities',
        'Complex pricing tiers',
        'Integration challenges outside MS stack',
      ],
      migrationComplexity: 'medium',
      avgMigrationTime: '2-5 months',
      costSavings: {
        licensing: 40,
        implementation: 50,
        maintenance: 35,
        training: 65,
      },
      improvementAreas: [
        'Platform-agnostic solution',
        'Advanced AI included',
        'Simplified pricing model',
        'Better third-party integrations',
        'Modern user experience',
      ],
      successStories: 34,
      icon: '/migration/dynamics-icon.svg',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      company: 'Salesforce',
      description: 'CRM-focused platform with expensive add-ons for ERP functionality',
      commonIssues: [
        'Very expensive with add-ons',
        'Complex admin requirements',
        'Limited ERP capabilities',
        'High learning curve',
        'Expensive Einstein AI features',
        'Click-heavy interface',
      ],
      migrationComplexity: 'medium',
      avgMigrationTime: '1-3 months',
      costSavings: {
        licensing: 50,
        implementation: 45,
        maintenance: 40,
        training: 70,
      },
      improvementAreas: [
        'Full ERP capabilities included',
        'AI built-in, not an expensive add-on',
        'Better value for money',
        'Streamlined interface',
        'Faster user adoption',
      ],
      successStories: 156,
      icon: '/migration/salesforce-icon.svg',
    },
    {
      id: 'custom',
      name: 'Custom/Legacy System',
      company: 'Various',
      description: 'Custom-built or legacy systems that are difficult to maintain',
      commonIssues: [
        'High maintenance costs',
        'Security vulnerabilities',
        'No mobile support',
        'Limited integration capabilities',
        'Difficult to scale',
        'Knowledge dependency risks',
      ],
      migrationComplexity: 'low',
      avgMigrationTime: '1-2 months',
      costSavings: {
        licensing: 90,
        implementation: 70,
        maintenance: 85,
        training: 60,
      },
      improvementAreas: [
        'Modern cloud architecture',
        'Built-in security',
        'Mobile-first design',
        'Easy integrations',
        'Scalable infrastructure',
      ],
      successStories: 78,
      icon: '/migration/custom-icon.svg',
    },
  ]

  const handleCompetitorSelect = (competitor: CompetitorSolution) => {
    setSelectedCompetitor(competitor)
    setStep('plan')
  }

  const calculateCostComparison = (
    plan: Partial<MigrationPlan>,
    competitor: CompetitorSolution
  ) => {
    const companySize = parseInt(plan.companySize?.split('-')[0] || '100')

    // Current system costs (annual)
    const currentLicensing =
      companySize * (competitor.id === 'sap' ? 2400 : competitor.id === 'netsuite' ? 1800 : 1200)
    const currentImplementation = Math.min(500000, companySize * 1000)
    const currentMaintenance = currentLicensing * 0.22 // 22% maintenance
    const currentTraining = companySize * 200

    const currentTotal =
      currentLicensing + currentImplementation + currentMaintenance + currentTraining

    // CoreFlow360 costs
    const coreflowLicensing = companySize * (plan.companySize === '1000+' ? 99 : 49) * 12
    const coreflowImplementation = Math.min(100000, companySize * 200)
    const coreflowMaintenance = coreflowLicensing * 0.1 // 10% maintenance
    const coreflowTraining = companySize * 50 // Much less training needed

    const coreflowTotal =
      coreflowLicensing + coreflowImplementation + coreflowMaintenance + coreflowTraining

    const annualSavings = currentTotal - coreflowTotal
    const threeYearSavings = annualSavings * 3
    const savingsPercentage = (annualSavings / currentTotal) * 100

    return {
      current: {
        licensing: currentLicensing,
        implementation: currentImplementation,
        maintenance: currentMaintenance,
        training: currentTraining,
        total: currentTotal,
      },
      coreflow: {
        licensing: coreflowLicensing,
        implementation: coreflowImplementation,
        maintenance: coreflowMaintenance,
        training: coreflowTraining,
        total: coreflowTotal,
      },
      savings: {
        annual: annualSavings,
        threeYear: threeYearSavings,
        percentage: savingsPercentage,
      },
    }
  }

  const handlePlanSubmit = () => {
    if (selectedCompetitor) {
      const comparison = calculateCostComparison(migrationPlan, selectedCompetitor)
      setCostComparison(comparison)
      setStep('comparison')
    }
  }

  const startMigrationWizard = async () => {
    setLoading(true)

    // Track migration interest
    const migrationData = {
      currentSolution: selectedCompetitor?.name,
      companySize: migrationPlan.companySize,
      expectedSavings: costComparison?.savings.annual,
      timeline: migrationPlan.timeline,
      timestamp: new Date().toISOString(),
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as unknown).gtag) {
      ;(window as unknown).gtag('event', 'migration_wizard_started', {
        current_solution: selectedCompetitor?.id,
        company_size: migrationPlan.companySize,
        expected_savings: costComparison?.savings.annual,
        timeline: migrationPlan.timeline,
      })
    }

    setTimeout(() => {
      setStep('wizard')
      setLoading(false)
    }, 1500)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-4xl font-bold"
            >
              <span className="gradient-text-ai">Migration Center</span>
            </motion.h1>
            <p className="mb-6 text-xl text-gray-300">
              Switch from expensive legacy systems to AI-first business automation
            </p>

            {/* Stats */}
            <div className="mx-auto grid max-w-3xl grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">70%</div>
                <div className="text-sm text-gray-400">Avg Cost Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">3-6mo</div>
                <div className="text-sm text-gray-400">Migration Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-400">404</div>
                <div className="text-sm text-gray-400">Successful Migrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">100%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">
                  What system are you currently using?
                </h2>
                <p className="text-xl text-gray-300">
                  Select your current solution to see migration benefits and cost savings
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {competitors.map((competitor, index) => (
                  <motion.div
                    key={competitor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleCompetitorSelect(competitor)}
                    className="group cursor-pointer rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm transition-all hover:border-red-500/50"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700">
                        <Database className="h-6 w-6 text-gray-400" />
                      </div>
                      <div
                        className={`rounded px-2 py-1 text-xs ${
                          competitor.migrationComplexity === 'low'
                            ? 'bg-green-600/20 text-green-400'
                            : competitor.migrationComplexity === 'medium'
                              ? 'bg-yellow-600/20 text-yellow-400'
                              : 'bg-red-600/20 text-red-400'
                        }`}
                      >
                        {competitor.migrationComplexity} complexity
                      </div>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-red-300">
                      {competitor.name}
                    </h3>
                    <p className="mb-4 text-sm text-gray-400">{competitor.company}</p>
                    <p className="mb-6 text-sm text-gray-300">{competitor.description}</p>

                    <div className="mb-6 space-y-2">
                      <div className="mb-2 text-xs font-semibold text-gray-400">Common Issues:</div>
                      {competitor.commonIssues.slice(0, 3).map((issue, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-300">
                          <AlertTriangle className="mr-2 h-3 w-3 text-red-500" />
                          {issue}
                        </div>
                      ))}
                      {competitor.commonIssues.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{competitor.commonIssues.length - 3} more issues
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-semibold text-emerald-400">
                          {competitor.successStories} migrations
                        </div>
                        <div className="text-gray-400">completed</div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-red-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'plan' && selectedCompetitor && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">
                  Migration from {selectedCompetitor.name}
                </h2>
                <p className="text-gray-300">Help us create your personalized migration plan</p>
              </div>

              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Company Size
                    </label>
                    <select
                      value={migrationPlan.companySize || ''}
                      onChange={(e) =>
                        setMigrationPlan({ ...migrationPlan, companySize: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900/50 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="">Select Company Size</option>
                      <option value="100-500">100-500 employees</option>
                      <option value="500-1000">500-1,000 employees</option>
                      <option value="1000-5000">1,000-5,000 employees</option>
                      <option value="5000+">5,000+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Preferred Timeline
                    </label>
                    <select
                      value={migrationPlan.timeline || ''}
                      onChange={(e) =>
                        setMigrationPlan({ ...migrationPlan, timeline: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900/50 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="">Select Timeline</option>
                      <option value="immediate">Immediate (1-2 months)</option>
                      <option value="normal">Standard (3-4 months)</option>
                      <option value="gradual">Gradual (6+ months)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Migration Priority
                    </label>
                    <select
                      value={migrationPlan.priority || ''}
                      onChange={(e) =>
                        setMigrationPlan({ ...migrationPlan, priority: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900/50 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="">Select Priority</option>
                      <option value="cost-savings">Cost Savings</option>
                      <option value="feature-upgrade">Feature Upgrades</option>
                      <option value="user-experience">User Experience</option>
                      <option value="ai-capabilities">AI Capabilities</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Data Volume</label>
                    <select
                      value={migrationPlan.dataVolume || ''}
                      onChange={(e) =>
                        setMigrationPlan({ ...migrationPlan, dataVolume: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900/50 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="">Select Data Volume</option>
                      <option value="small">Small (&lt;100GB)</option>
                      <option value="medium">Medium (100GB-1TB)</option>
                      <option value="large">Large (&gt;1TB)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-semibold text-white">
                    Why are you considering migration from {selectedCompetitor.name}?
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedCompetitor.commonIssues.map((issue, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-3 h-4 w-4 rounded border-gray-600 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-300">{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep('select')}
                    className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition-all hover:border-gray-500"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlanSubmit}
                    disabled={
                      !migrationPlan.companySize ||
                      !migrationPlan.timeline ||
                      !migrationPlan.priority
                    }
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Calculate Savings →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'comparison' && costComparison && selectedCompetitor && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-6xl"
            >
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">
                  Your Migration Savings Analysis
                </h2>
                <p className="text-gray-300">
                  See how much you'll save by switching to CoreFlow360
                </p>
              </div>

              {/* Key Savings */}
              <div className="mb-12 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6 text-center">
                  <div className="mb-2 text-4xl font-bold text-green-400">
                    {formatCurrency(costComparison.savings.annual)}
                  </div>
                  <div className="text-gray-300">Annual Savings</div>
                </div>

                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-6 text-center">
                  <div className="mb-2 text-4xl font-bold text-blue-400">
                    {costComparison.savings.percentage.toFixed(0)}%
                  </div>
                  <div className="text-gray-300">Cost Reduction</div>
                </div>

                <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-6 text-center">
                  <div className="mb-2 text-4xl font-bold text-violet-400">
                    {formatCurrency(costComparison.savings.threeYear)}
                  </div>
                  <div className="text-gray-300">3-Year Savings</div>
                </div>
              </div>

              {/* Detailed Comparison */}
              <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
                <h3 className="mb-6 text-xl font-semibold text-white">Detailed Cost Comparison</h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 text-left text-gray-300">Cost Category</th>
                        <th className="py-3 text-right text-gray-300">{selectedCompetitor.name}</th>
                        <th className="py-3 text-right text-gray-300">CoreFlow360</th>
                        <th className="py-3 text-right text-gray-300">Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-4 text-gray-300">Annual Licensing</td>
                        <td className="py-4 text-right text-red-400">
                          {formatCurrency(costComparison.current.licensing)}
                        </td>
                        <td className="py-4 text-right text-green-400">
                          {formatCurrency(costComparison.coreflow.licensing)}
                        </td>
                        <td className="py-4 text-right text-emerald-400">
                          {formatCurrency(
                            costComparison.current.licensing - costComparison.coreflow.licensing
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-4 text-gray-300">Implementation</td>
                        <td className="py-4 text-right text-red-400">
                          {formatCurrency(costComparison.current.implementation)}
                        </td>
                        <td className="py-4 text-right text-green-400">
                          {formatCurrency(costComparison.coreflow.implementation)}
                        </td>
                        <td className="py-4 text-right text-emerald-400">
                          {formatCurrency(
                            costComparison.current.implementation -
                              costComparison.coreflow.implementation
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-4 text-gray-300">Annual Maintenance</td>
                        <td className="py-4 text-right text-red-400">
                          {formatCurrency(costComparison.current.maintenance)}
                        </td>
                        <td className="py-4 text-right text-green-400">
                          {formatCurrency(costComparison.coreflow.maintenance)}
                        </td>
                        <td className="py-4 text-right text-emerald-400">
                          {formatCurrency(
                            costComparison.current.maintenance - costComparison.coreflow.maintenance
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-4 text-gray-300">Training Costs</td>
                        <td className="py-4 text-right text-red-400">
                          {formatCurrency(costComparison.current.training)}
                        </td>
                        <td className="py-4 text-right text-green-400">
                          {formatCurrency(costComparison.coreflow.training)}
                        </td>
                        <td className="py-4 text-right text-emerald-400">
                          {formatCurrency(
                            costComparison.current.training - costComparison.coreflow.training
                          )}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-gray-600 font-bold">
                        <td className="py-4 text-white">Total Annual Cost</td>
                        <td className="py-4 text-right text-red-400">
                          {formatCurrency(costComparison.current.total)}
                        </td>
                        <td className="py-4 text-right text-green-400">
                          {formatCurrency(costComparison.coreflow.total)}
                        </td>
                        <td className="py-4 text-right text-xl text-emerald-400">
                          {formatCurrency(costComparison.savings.annual)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* What You'll Gain */}
              <div className="mb-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-8">
                <h3 className="mb-6 text-xl font-semibold text-white">
                  What You'll Gain Beyond Cost Savings
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {selectedCompetitor.improvementAreas.map((improvement, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="mr-3 h-5 w-5 text-emerald-400" />
                      <span className="text-gray-300">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('plan')}
                  className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition-all hover:border-gray-500"
                >
                  ← Back
                </button>
                <button
                  onClick={startMigrationWizard}
                  disabled={loading}
                  className="flex items-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Starting Wizard...
                    </>
                  ) : (
                    <>
                      Start Migration Wizard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'wizard' && (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              <h2 className="mb-4 text-3xl font-bold text-white">Migration Wizard Ready!</h2>
              <p className="mb-8 text-xl text-gray-300">
                Your personalized migration plan is ready. Our team will guide you through every
                step.
              </p>

              <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-semibold text-white">Your Migration Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-violet-600/20 p-4">
                    <div className="flex items-center">
                      <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-medium text-white">Data Assessment & Planning</div>
                        <div className="text-sm text-gray-400">Week 1-2</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-gray-800/40 p-4">
                    <div className="flex items-center">
                      <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-medium text-white">Data Migration & Setup</div>
                        <div className="text-sm text-gray-400">Week 3-6</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-gray-800/40 p-4">
                    <div className="flex items-center">
                      <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-medium text-white">Team Training & Testing</div>
                        <div className="text-sm text-gray-400">Week 7-8</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-gray-800/40 p-4">
                    <div className="flex items-center">
                      <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-bold">
                        4
                      </div>
                      <div>
                        <div className="font-medium text-white">Go-Live & Support</div>
                        <div className="text-sm text-gray-400">Week 9+</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => (window.location.href = '/enterprise/poc')}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white"
                >
                  Schedule Migration Call
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="rounded-xl border border-gray-600 px-6 py-4 text-gray-300 transition-all hover:border-gray-500"
                >
                  Learn More First
                </button>
              </div>

              <div className="mt-8 text-sm text-gray-400">
                💼 {selectedCompetitor?.successStories}+ companies have successfully migrated from{' '}
                {selectedCompetitor?.name}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
