'use client'

/**
 * Partner Revenue Tracker
 * 
 * Comprehensive revenue tracking and commission management system for CoreFlow360 partners
 * with real-time analytics, commission calculations, and payment processing.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RevenueRecord {
  id: string
  clientId: string
  clientName: string
  dealId: string
  dealTitle: string
  businessUnits: string[]
  contractValue: number
  subscriptionValue: number
  oneTimeValue: number
  commissionRate: number
  commissionAmount: number
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'DISPUTED'
  signedDate: Date
  paymentDate: Date | null
  recurringPeriod: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
  nextPaymentDate: Date | null
  category: 'NEW_BUSINESS' | 'UPSELL' | 'RENEWAL' | 'CROSS_SELL'
  referralSource?: string
  notes?: string
}

interface CommissionTier {
  id: string
  name: string
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
  minRevenue: number
  maxRevenue: number | null
  baseRate: number
  bonusRate: number
  qualificationPeriod: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
  benefits: string[]
  requirements: string[]
}

interface PaymentRecord {
  id: string
  period: string
  totalRevenue: number
  totalCommission: number
  baseCommission: number
  bonusCommission: number
  adjustments: number
  netPayment: number
  paymentDate: Date
  paymentMethod: string
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED'
  invoiceUrl?: string
  detailsUrl?: string
}

interface PartnerRevenueTrackerProps {
  partnerId?: string
  onPaymentRequest?: (amount: number) => void
  onDisputeSubmit?: (recordId: string, reason: string) => void
  className?: string
}

const PartnerRevenueTracker: React.FC<PartnerRevenueTrackerProps> = ({
  partnerId = 'demo-partner',
  onPaymentRequest,
  onDisputeSubmit,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'commissions' | 'payments'>('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<'30days' | '90days' | '12months' | 'all'>('90days')
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([])
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [revenueMetrics, setRevenueMetrics] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    pendingCommission: 0,
    averageDealSize: 0,
    conversionRate: 0,
    currentTier: 'BRONZE' as const,
    nextTierThreshold: 0,
    monthlyRecurring: 0,
    growthRate: 0
  })

  // Load revenue data
  useEffect(() => {
    // Mock revenue records - in production, fetch from API
    const mockRevenueRecords: RevenueRecord[] = [
      {
        id: 'rev-001',
        clientId: 'client-001',
        clientName: 'TechFlow Industries',
        dealId: 'deal-001',
        dealTitle: 'Multi-Business Platform Implementation',
        businessUnits: ['Manufacturing', 'Distribution', 'Service'],
        contractValue: 145000,
        subscriptionValue: 8500,
        oneTimeValue: 15000,
        commissionRate: 15,
        commissionAmount: 21750,
        status: 'PAID',
        signedDate: new Date('2024-02-15'),
        paymentDate: new Date('2024-03-15'),
        recurringPeriod: 'MONTHLY',
        nextPaymentDate: new Date('2024-04-15'),
        category: 'NEW_BUSINESS',
        referralSource: 'Direct Outreach',
        notes: 'Complex multi-business implementation with custom integrations'
      },
      {
        id: 'rev-002',
        clientId: 'client-002',
        clientName: 'Quantum Dynamics Corp',
        dealId: 'deal-002',
        dealTitle: 'HVAC Portfolio Expansion',
        businessUnits: ['HVAC Service', 'Parts Distribution'],
        contractValue: 89000,
        subscriptionValue: 5200,
        oneTimeValue: 8500,
        commissionRate: 15,
        commissionAmount: 13350,
        status: 'APPROVED',
        signedDate: new Date('2024-03-01'),
        paymentDate: null,
        recurringPeriod: 'MONTHLY',
        nextPaymentDate: new Date('2024-04-01'),
        category: 'UPSELL',
        referralSource: 'Existing Client'
      },
      {
        id: 'rev-003',
        clientId: 'client-003',
        clientName: 'Phoenix Property Partners',
        dealId: 'deal-003',
        dealTitle: 'Professional Services Integration',
        businessUnits: ['Property Management', 'Legal Services'],
        contractValue: 67000,
        subscriptionValue: 3800,
        oneTimeValue: 5500,
        commissionRate: 12,
        commissionAmount: 8040,
        status: 'PENDING',
        signedDate: new Date('2024-03-18'),
        paymentDate: null,
        recurringPeriod: 'MONTHLY',
        nextPaymentDate: new Date('2024-04-18'),
        category: 'CROSS_SELL'
      },
      {
        id: 'rev-004',
        clientId: 'client-004',
        clientName: 'Desert Climate Solutions',
        dealId: 'deal-004',
        dealTitle: 'Annual Renewal - Enterprise',
        businessUnits: ['HVAC Service', 'Maintenance', 'Emergency'],
        contractValue: 125000,
        subscriptionValue: 7200,
        oneTimeValue: 0,
        commissionRate: 10,
        commissionAmount: 12500,
        status: 'PAID',
        signedDate: new Date('2024-01-10'),
        paymentDate: new Date('2024-02-10'),
        recurringPeriod: 'ANNUALLY',
        nextPaymentDate: new Date('2025-01-10'),
        category: 'RENEWAL'
      }
    ]

    const mockCommissionTiers: CommissionTier[] = [
      {
        id: 'tier-bronze',
        name: 'Bronze Partner',
        level: 'BRONZE',
        minRevenue: 0,
        maxRevenue: 100000,
        baseRate: 10,
        bonusRate: 0,
        qualificationPeriod: 'QUARTERLY',
        benefits: ['10% commission rate', 'Basic support', 'Marketing materials'],
        requirements: ['Complete foundation training', 'Maintain client satisfaction >80%']
      },
      {
        id: 'tier-silver',
        name: 'Silver Partner',
        level: 'SILVER',
        minRevenue: 100000,
        maxRevenue: 250000,
        baseRate: 15,
        bonusRate: 2,
        qualificationPeriod: 'QUARTERLY',
        benefits: ['15% commission rate', '2% bonus tier', 'Priority support', 'Co-marketing opportunities'],
        requirements: ['Complete intermediate training', 'Generate $100K+ quarterly revenue', 'Client satisfaction >85%']
      },
      {
        id: 'tier-gold',
        name: 'Gold Partner',
        level: 'GOLD',
        minRevenue: 250000,
        maxRevenue: 500000,
        baseRate: 20,
        bonusRate: 5,
        qualificationPeriod: 'QUARTERLY',
        benefits: ['20% commission rate', '5% bonus tier', 'Dedicated partner manager', 'Early feature access'],
        requirements: ['Complete advanced training', 'Generate $250K+ quarterly revenue', 'Client satisfaction >90%']
      },
      {
        id: 'tier-platinum',
        name: 'Platinum Partner',
        level: 'PLATINUM',
        minRevenue: 500000,
        maxRevenue: 1000000,
        baseRate: 25,
        bonusRate: 8,
        qualificationPeriod: 'QUARTERLY',
        benefits: ['25% commission rate', '8% bonus tier', 'Strategic partnership', 'Product roadmap input'],
        requirements: ['Complete expert training', 'Generate $500K+ quarterly revenue', 'Client satisfaction >92%']
      },
      {
        id: 'tier-diamond',
        name: 'Diamond Partner',
        level: 'DIAMOND',
        minRevenue: 1000000,
        maxRevenue: null,
        baseRate: 30,
        bonusRate: 12,
        qualificationPeriod: 'QUARTERLY',
        benefits: ['30% commission rate', '12% bonus tier', 'White-label options', 'Revenue sharing'],
        requirements: ['Complete all certifications', 'Generate $1M+ quarterly revenue', 'Client satisfaction >95%']
      }
    ]

    const mockPaymentHistory: PaymentRecord[] = [
      {
        id: 'payment-001',
        period: 'March 2024',
        totalRevenue: 285000,
        totalCommission: 42750,
        baseCommission: 39500,
        bonusCommission: 3250,
        adjustments: 0,
        netPayment: 42750,
        paymentDate: new Date('2024-04-01'),
        paymentMethod: 'Direct Deposit',
        status: 'PAID',
        invoiceUrl: '/invoices/march-2024.pdf'
      },
      {
        id: 'payment-002',
        period: 'February 2024',
        totalRevenue: 195000,
        totalCommission: 28750,
        baseCommission: 27100,
        bonusCommission: 1650,
        adjustments: 0,
        netPayment: 28750,
        paymentDate: new Date('2024-03-01'),
        paymentMethod: 'Direct Deposit',
        status: 'PAID'
      },
      {
        id: 'payment-003',
        period: 'April 2024',
        totalRevenue: 156000,
        totalCommission: 22890,
        baseCommission: 21200,
        bonusCommission: 1690,
        adjustments: 0,
        netPayment: 22890,
        paymentDate: new Date('2024-05-01'),
        paymentMethod: 'Direct Deposit',
        status: 'PROCESSING'
      }
    ]

    setRevenueRecords(mockRevenueRecords)
    setCommissionTiers(mockCommissionTiers)
    setPaymentHistory(mockPaymentHistory)

    // Calculate metrics
    const totalRevenue = mockRevenueRecords.reduce((acc, record) => acc + record.contractValue, 0)
    const totalCommission = mockRevenueRecords.reduce((acc, record) => acc + record.commissionAmount, 0)
    const pendingCommission = mockRevenueRecords
      .filter(record => record.status === 'PENDING' || record.status === 'APPROVED')
      .reduce((acc, record) => acc + record.commissionAmount, 0)
    const avgDealSize = totalRevenue / mockRevenueRecords.length
    const monthlyRecurring = mockRevenueRecords
      .filter(record => record.recurringPeriod === 'MONTHLY')
      .reduce((acc, record) => acc + record.subscriptionValue, 0)

    // Determine current tier
    const currentQuarterlyRevenue = 285000 // This would be calculated from actual data
    const currentTier = mockCommissionTiers.find(tier => 
      currentQuarterlyRevenue >= tier.minRevenue && 
      (tier.maxRevenue === null || currentQuarterlyRevenue < tier.maxRevenue)
    ) || mockCommissionTiers[0]

    const nextTier = mockCommissionTiers.find(tier => 
      tier.minRevenue > currentQuarterlyRevenue
    )

    setRevenueMetrics({
      totalRevenue,
      totalCommission,
      pendingCommission,
      averageDealSize: avgDealSize,
      conversionRate: 78.5,
      currentTier: currentTier.level,
      nextTierThreshold: nextTier?.minRevenue || 0,
      monthlyRecurring,
      growthRate: 24.3
    })
  }, [partnerId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-400 bg-green-500/20'
      case 'APPROVED': return 'text-blue-400 bg-blue-500/20'
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20'
      case 'DISPUTED': return 'text-red-400 bg-red-500/20'
      case 'PROCESSING': return 'text-purple-400 bg-purple-500/20'
      case 'FAILED': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'NEW_BUSINESS': return 'text-green-400 bg-green-500/20'
      case 'UPSELL': return 'text-blue-400 bg-blue-500/20'
      case 'RENEWAL': return 'text-purple-400 bg-purple-500/20'
      case 'CROSS_SELL': return 'text-cyan-400 bg-cyan-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'from-amber-600 to-orange-600'
      case 'SILVER': return 'from-gray-400 to-gray-600'
      case 'GOLD': return 'from-yellow-400 to-amber-500'
      case 'PLATINUM': return 'from-blue-400 to-indigo-500'
      case 'DIAMOND': return 'from-purple-400 to-pink-500'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  const currentTierInfo = commissionTiers.find(tier => tier.level === revenueMetrics.currentTier)
  const nextTierInfo = commissionTiers.find(tier => tier.minRevenue > (currentTierInfo?.minRevenue || 0))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Revenue Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Partner Revenue Dashboard</h2>
            <p className="text-gray-400">Track your earnings, commissions, and tier progression</p>
          </div>
          <div className="flex items-center space-x-4">
            {currentTierInfo && (
              <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getTierColor(currentTierInfo.level)} text-white font-bold`}>
                {currentTierInfo.name}
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              ${revenueMetrics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Revenue</div>
            <div className="text-xs text-green-400 mt-1">+{revenueMetrics.growthRate}% growth</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              ${revenueMetrics.totalCommission.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Commissions</div>
            <div className="text-xs text-blue-400 mt-1">{currentTierInfo?.baseRate}% rate</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              ${revenueMetrics.pendingCommission.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Pending Payment</div>
            <div className="text-xs text-yellow-400 mt-1">Next payout in 5 days</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              ${revenueMetrics.monthlyRecurring.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Monthly Recurring</div>
            <div className="text-xs text-purple-400 mt-1">Predictable income</div>
          </div>
        </div>

        {/* Tier Progress */}
        {nextTierInfo && (
          <div className="mt-6 bg-black/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Progress to {nextTierInfo.name}</h3>
              <span className="text-sm text-gray-400">
                ${revenueMetrics.nextTierThreshold.toLocaleString()} goal
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full">
              <div 
                className="h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                style={{ 
                  width: `${Math.min(((currentTierInfo?.minRevenue || 0) / revenueMetrics.nextTierThreshold) * 100, 100)}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>${(currentTierInfo?.minRevenue || 0).toLocaleString()} current</span>
              <span>+{nextTierInfo.bonusRate}% bonus rate</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'revenue', label: 'Revenue Records', icon: '💰' },
          { id: 'commissions', label: 'Commission Tiers', icon: '🏆' },
          { id: 'payments', label: 'Payment History', icon: '💳' }
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
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">📈 Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Deal Size:</span>
                  <span className="text-white font-medium">${revenueMetrics.averageDealSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Conversion Rate:</span>
                  <span className="text-white font-medium">{revenueMetrics.conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Deals:</span>
                  <span className="text-white font-medium">{revenueRecords.filter(r => r.status !== 'PAID').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Quarter Progress:</span>
                  <span className="text-green-400 font-medium">85% to goal</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🎯 Next Milestones</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-400">Close 2 pending deals ($156K)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-400">Reach Silver tier (15% commission)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-400">Generate $250K quarterly revenue</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-400">Complete advanced training</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">⚡ Recent Revenue Activity</h3>
            <div className="space-y-3">
              {revenueRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      record.status === 'PAID' ? 'bg-green-400' :
                      record.status === 'APPROVED' ? 'bg-blue-400' :
                      record.status === 'PENDING' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="text-white font-medium">{record.clientName}</div>
                      <div className="text-xs text-gray-400">{record.dealTitle}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">${record.commissionAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{record.signedDate.toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Records Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Revenue Records</h3>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="12months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="space-y-3">
            {revenueRecords.map((record) => (
              <motion.div
                key={record.id}
                className="rounded-lg border border-gray-700 bg-gray-900 p-4"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{record.clientName}</h4>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(record.category)}`}>
                        {record.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-2">{record.dealTitle}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>🏢 {record.businessUnits.length} business units</span>
                      <span>📅 {record.signedDate.toLocaleDateString()}</span>
                      <span>🔄 {record.recurringPeriod}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ${record.commissionAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {record.commissionRate}% of ${record.contractValue.toLocaleString()}
                    </div>
                    {record.paymentDate && (
                      <div className="text-xs text-green-400 mt-1">
                        Paid {record.paymentDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-400">Contract Value:</span>
                    <div className="text-white font-medium">${record.contractValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Monthly Recurring:</span>
                    <div className="text-white font-medium">${record.subscriptionValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">One-time:</span>
                    <div className="text-white font-medium">${record.oneTimeValue.toLocaleString()}</div>
                  </div>
                </div>

                {record.businessUnits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {record.businessUnits.map((unit, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {unit}
                      </span>
                    ))}
                  </div>
                )}

                {record.notes && (
                  <div className="text-sm text-gray-400 bg-black/30 rounded p-2 mb-3">
                    📝 {record.notes}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {record.referralSource && (
                      <span>🔗 {record.referralSource}</span>
                    )}
                    {record.nextPaymentDate && (
                      <span>💰 Next: {record.nextPaymentDate.toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {record.status === 'PENDING' && (
                      <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                        📋 Follow Up
                      </button>
                    )}
                    {record.status === 'APPROVED' && (
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        💳 Request Payment
                      </button>
                    )}
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                      📊 View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Tiers Tab */}
      {activeTab === 'commissions' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {commissionTiers.map((tier) => {
            const isCurrentTier = tier.level === revenueMetrics.currentTier
            return (
              <motion.div
                key={tier.id}
                className={`rounded-xl border p-6 ${
                  isCurrentTier 
                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-900/20 to-purple-900/20' 
                    : 'border-gray-700 bg-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getTierColor(tier.level)} text-white font-bold text-sm`}>
                    {tier.level}
                  </div>
                  {isCurrentTier && (
                    <div className="text-cyan-400 text-sm font-medium">CURRENT</div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Rate:</span>
                    <span className="text-white font-medium">{tier.baseRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bonus Rate:</span>
                    <span className="text-white font-medium">+{tier.bonusRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Revenue:</span>
                    <span className="text-white font-medium">
                      ${tier.minRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Period:</span>
                    <span className="text-white font-medium">{tier.qualificationPeriod}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-white">Benefits:</h4>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-center space-x-2">
                        <span className="text-cyan-400">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Requirements:</h4>
                  <ul className="space-y-1">
                    {tier.requirements.map((requirement, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-center space-x-2">
                        <span className="text-purple-400">•</span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Payment History</h3>
            <button className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500">
              Request Payment
            </button>
          </div>

          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <motion.div
                key={payment.id}
                className="rounded-lg border border-gray-700 bg-gray-900 p-4"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{payment.period}</h4>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {payment.paymentMethod} • {payment.paymentDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ${payment.netPayment.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Net Payment</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Revenue:</span>
                    <div className="text-white font-medium">${payment.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Base Commission:</span>
                    <div className="text-white font-medium">${payment.baseCommission.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Bonus:</span>
                    <div className="text-white font-medium">${payment.bonusCommission.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Adjustments:</span>
                    <div className="text-white font-medium">${payment.adjustments.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Total Commission: ${payment.totalCommission.toLocaleString()}
                  </div>
                  <div className="flex space-x-2">
                    {payment.invoiceUrl && (
                      <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                        📄 Invoice
                      </button>
                    )}
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                      📊 Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">💰 Payment Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${paymentHistory.reduce((acc, p) => acc + p.totalCommission, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${paymentHistory.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.netPayment, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${paymentHistory.reduce((acc, p) => acc + p.bonusCommission, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Bonus Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(paymentHistory.reduce((acc, p) => acc + p.totalCommission, 0) / paymentHistory.reduce((acc, p) => acc + p.totalRevenue, 0) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Avg Commission Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartnerRevenueTracker