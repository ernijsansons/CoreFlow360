/**
 * CoreFlow360 - Tax Change Alert System
 * User interface for tax law changes with business impact analysis
 * 🚨 NO TAX ADVICE - SUGGESTIONS ONLY - ZERO LIABILITY 🚨
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  ExternalLink,
  CheckCircle,
  X,
  Filter,
  Download,
  Settings,
  Zap,
  Shield,
  Info,
} from 'lucide-react'
import {
  useTaxChangeTracking,
  TaxChange,
  TaxImpactCalculator,
} from '@/lib/tax-knowledge/tax-change-tracking'
import {
  AccessibleButton,
  AccessibleAlert,
  AccessibleModal,
} from '@/components/accessibility/AccessibleComponents'

interface TaxChangeAlertsProps {
  userProfile: {
    businessType: 'freelancer' | 'small_business' | 'corporation'
    industry: string
    annualRevenue: number
    currentExpenses: Record<string, number>
  }
}

export function TaxChangeAlerts({ userProfile }: TaxChangeAlertsProps) {
  const { changes, urgentChanges, relevantChanges, isMonitoring, startMonitoring } =
    useTaxChangeTracking(userProfile)
  const [selectedChange, setSelectedChange] = useState<TaxChange | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filterUrgency, setFilterUrgency] = useState<string>('all')
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Auto-start monitoring on mount
    startMonitoring()
  }, [startMonitoring])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-500/30'
      case 'high':
        return 'text-orange-400 bg-orange-900/20 border-orange-500/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      default:
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30'
    }
  }

  const getImpactIcon = (impactType: string) => {
    switch (impactType) {
      case 'cost_savings':
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case 'increased_costs':
        return <TrendingDown className="h-5 w-5 text-red-400" />
      case 'compliance_burden':
        return <FileText className="h-5 w-5 text-yellow-400" />
      case 'opportunity':
        return <Zap className="h-5 w-5 text-violet-400" />
      default:
        return <Info className="h-5 w-5 text-gray-400" />
    }
  }

  const handleViewDetails = (change: TaxChange) => {
    setSelectedChange(change)
    setShowDetailModal(true)
  }

  const handleDismissAlert = (changeId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, changeId]))
  }

  const filteredChanges = relevantChanges.filter((change) => {
    if (dismissedAlerts.has(change.id)) return false
    if (filterUrgency === 'all') return true
    return change.urgency === filterUrgency
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-red-500 to-orange-500 p-2">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Tax Law Updates</h2>
            <p className="text-gray-400">Stay informed about changes affecting your business</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
          >
            <option value="all">All Changes</option>
            <option value="critical">Critical</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <AccessibleButton
            variant="secondary"
            size="sm"
            onClick={startMonitoring}
            disabled={isMonitoring}
            loading={isMonitoring}
          >
            <Settings className="mr-2 h-4 w-4" />
            {isMonitoring ? 'Monitoring...' : 'Refresh'}
          </AccessibleButton>
        </div>
      </div>

      {/* Critical Disclaimer */}
      <AccessibleAlert type="warning" className="border-2 border-orange-500/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            <strong className="text-orange-300">IMPORTANT LEGAL DISCLAIMER</strong>
          </div>
          <p className="text-gray-300">
            🚨 <strong>NOT TAX ADVICE</strong> - All information provided is for educational
            purposes only. Tax laws are complex and change frequently. Always consult with a
            qualified tax attorney, CPA, or enrolled agent before making any tax-related decisions.
            CoreFlow360 assumes
            <strong> ZERO LIABILITY</strong> for any actions taken based on this information.
          </p>
        </div>
      </AccessibleAlert>

      {/* Urgent Changes Summary */}
      {urgentChanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/30 to-orange-900/30 p-4"
        >
          <div className="mb-3 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h3 className="text-lg font-semibold text-red-300">
              {urgentChanges.length} Urgent Tax Updates Require Attention
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {urgentChanges.slice(0, 2).map((change) => (
              <div key={change.id} className="rounded-lg bg-gray-900/50 p-3">
                <h4 className="mb-1 text-sm font-medium text-white">{change.title}</h4>
                <p className="mb-2 text-xs text-gray-400">{change.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-400">
                    Effective: {change.effectiveDate.toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleViewDetails(change)}
                    className="text-xs text-violet-400 transition-colors hover:text-violet-300"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tax Changes List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Recent Changes Affecting Your Business ({filteredChanges.length})
        </h3>

        <AnimatePresence>
          {filteredChanges.map((change) => (
            <motion.div
              key={change.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`rounded-xl border p-6 ${getUrgencyColor(change.urgency)}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        change.urgency === 'critical'
                          ? 'bg-red-500 text-white'
                          : change.urgency === 'high'
                            ? 'bg-orange-500 text-white'
                            : change.urgency === 'medium'
                              ? 'bg-yellow-500 text-black'
                              : 'bg-blue-500 text-white'
                      }`}
                    >
                      {change.urgency.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      Announced: {change.announcedDate.toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="mb-2 text-lg font-semibold text-white">{change.title}</h4>
                  <p className="mb-3 text-gray-300">{change.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Effective: {change.effectiveDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {change.affectedSections.length} IRC Sections
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AccessibleButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(change)}
                  >
                    View Impact
                  </AccessibleButton>
                  <button
                    onClick={() => handleDismissAlert(change.id)}
                    className="rounded p-1 text-gray-400 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Business Impact Preview */}
              {change.businessImpacts.length > 0 && (
                <div className="border-t border-gray-700/50 pt-4">
                  <h5 className="mb-3 text-sm font-medium text-white">
                    Potential Impact on Your Business
                  </h5>
                  <div className="grid gap-3 md:grid-cols-2">
                    {change.businessImpacts.slice(0, 2).map((impact, index) => (
                      <div key={index} className="rounded-lg bg-gray-900/30 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          {getImpactIcon(impact.impactType)}
                          <span className="text-sm font-medium text-white capitalize">
                            {impact.impactType.replace('_', ' ')}
                          </span>
                          {impact.estimatedAmount && (
                            <span className="ml-auto text-sm text-green-400">
                              ${impact.estimatedAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Confidence: {impact.confidenceLevel}%</span>
                          <span>Relevance: {impact.applicabilityScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredChanges.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
            <h3 className="mb-2 text-lg font-medium text-white">All Caught Up!</h3>
            <p className="text-gray-400">
              No new tax changes requiring your attention at this time.
            </p>
          </div>
        )}
      </div>

      {/* Detailed Change Modal */}
      <AccessibleModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Tax Change Impact Analysis"
        size="xl"
      >
        {selectedChange && (
          <TaxChangeDetailView
            change={selectedChange}
            userProfile={userProfile}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </AccessibleModal>
    </div>
  )
}

// Detailed Tax Change View Component
interface TaxChangeDetailViewProps {
  change: TaxChange
  userProfile: unknown
  onClose: () => void
}

function TaxChangeDetailView({ change, userProfile, onClose }: TaxChangeDetailViewProps) {
  const [impactCalculation, setImpactCalculation] = useState<unknown>(null)

  useEffect(() => {
    const calculation = TaxImpactCalculator.calculateFinancialImpact(change, userProfile)
    setImpactCalculation(calculation)
  }, [change, userProfile])

  return (
    <div className="space-y-6">
      {/* Change Overview */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              change.urgency === 'critical'
                ? 'bg-red-500 text-white'
                : change.urgency === 'high'
                  ? 'bg-orange-500 text-white'
                  : change.urgency === 'medium'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-blue-500 text-white'
            }`}
          >
            {change.urgency.toUpperCase()} PRIORITY
          </span>
          <span className="text-sm text-gray-400">
            Effective: {change.effectiveDate.toLocaleDateString()}
          </span>
        </div>

        <h3 className="mb-3 text-xl font-bold text-white">{change.title}</h3>
        <p className="mb-4 text-gray-300">{change.description}</p>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-800/50 p-3">
            <div className="text-sm text-gray-400">Categories</div>
            <div className="font-medium text-white">
              {change.categories.map((cat) => cat.replace('_', ' ')).join(', ')}
            </div>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <div className="text-sm text-gray-400">Affected Sections</div>
            <div className="font-medium text-white">{change.affectedSections.join(', ')}</div>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <div className="text-sm text-gray-400">Source</div>
            <div className="font-medium text-white">IRS Official</div>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {change.aiAnalysis && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-900/20 p-6">
          <h4 className="mb-4 text-lg font-semibold text-violet-300">AI Analysis Summary</h4>
          <p className="mb-4 text-gray-300">{change.aiAnalysis.summary}</p>

          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <h5 className="mb-2 font-medium text-white">Key Points</h5>
              <ul className="space-y-1">
                {change.aiAnalysis.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1 text-violet-400">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="mb-2 font-medium text-white">Implementation</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Complexity:</span>
                  <span className="text-white capitalize">{change.aiAnalysis.complexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Action Required:</span>
                  <span
                    className={
                      change.aiAnalysis.actionRequired ? 'text-orange-400' : 'text-green-400'
                    }
                  >
                    {change.aiAnalysis.actionRequired ? 'Yes' : 'No'}
                  </span>
                </div>
                {change.aiAnalysis.timeToImplement && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timeline:</span>
                    <span className="text-white">{change.aiAnalysis.timeToImplement}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Impact */}
      {impactCalculation && (
        <div className="rounded-xl border border-green-500/30 bg-green-900/20 p-6">
          <h4 className="mb-4 text-lg font-semibold text-green-300">Financial Impact Estimate</h4>

          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-800/50 p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-green-400">
                ${impactCalculation.estimatedSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Potential Savings</div>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-red-400">
                ${impactCalculation.estimatedCosts.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Implementation Costs</div>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-4 text-center">
              <div
                className={`mb-1 text-2xl font-bold ${
                  impactCalculation.netImpact >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {impactCalculation.netImpact >= 0 ? '+' : ''}$
                {impactCalculation.netImpact.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Net Impact</div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-800/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Confidence Level</span>
              <span className="text-sm font-medium text-white">
                {impactCalculation.confidenceLevel}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${impactCalculation.confidenceLevel}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-900/20 p-6">
        <h4 className="mb-4 text-lg font-semibold text-yellow-300">Recommended Actions</h4>
        <div className="space-y-3">
          {change.businessImpacts[0]?.actionItems.map((action, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
              <span className="text-gray-300">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <AccessibleAlert type="error">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <strong>LEGAL DISCLAIMER - READ CAREFULLY</strong>
          </div>
          <p className="text-sm">
            {impactCalculation?.disclaimer ||
              '🚨 NOT TAX ADVICE 🚨 All estimates and suggestions are for informational purposes only. ' +
                'Tax situations are highly individual and complex. Always consult with qualified tax professionals ' +
                'before making any decisions. CoreFlow360 assumes ZERO LIABILITY for any actions taken based on this information.'}
          </p>
        </div>
      </AccessibleAlert>

      {/* Actions */}
      <div className="flex justify-between border-t border-gray-800 pt-4">
        <AccessibleButton
          variant="secondary"
          onClick={() => window.open(change.originalUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Original Source
        </AccessibleButton>

        <AccessibleButton onClick={onClose}>Close</AccessibleButton>
      </div>
    </div>
  )
}
