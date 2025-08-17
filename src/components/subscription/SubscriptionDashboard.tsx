/**
 * CoreFlow360 - Subscription Management Dashboard
 * Mathematical perfection for subscription lifecycle management
 * FORTRESS-LEVEL SECURITY: Tenant-isolated subscription data
 * HYPERSCALE PERFORMANCE: Real-time usage tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BundleSelector } from './BundleSelector'
import {
  Users,
  Building2,
  CreditCard,
  Calendar,
  TrendingUp,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit3,
  Download
} from 'lucide-react'

interface SubscriptionData {
  tenantId: string
  subscriptions: BundleSubscription[]
  usage: UsageMetrics
  billing: BillingInfo
  recommendations: string[]
}

interface BundleSubscription {
  bundleId: string
  bundleName: string
  status: 'active' | 'pending' | 'cancelled'
  monthlyPrice: number
  usersIncluded: number
  usageQuota: any
  startDate: string
  nextBillingDate: string
}

interface UsageMetrics {
  totalUsers: number
  activeUsers: number
  apiCalls: number
  storageUsed: number
  aiTokensUsed: number
  monthlySpend: number
}

interface BillingInfo {
  method: string
  nextPayment: string
  amount: number
  currency: string
  discounts: number
}

export function SubscriptionDashboard() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [selectedBundles, setSelectedBundles] = useState<string[]>([])
  const [userCount, setUserCount] = useState(5)
  const [businessCount, setBusinessCount] = useState(1)
  const [currentPricing, setCurrentPricing] = useState<any>(null)
  const [showUpgradeFlow, setShowUpgradeFlow] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load current subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        // Mock data - in production this would be an API call
        const mockData: SubscriptionData = {
          tenantId: 'tenant_123',
          subscriptions: [
            {
              bundleId: 'finance_ai_fingpt',
              bundleName: 'AI Finance Intelligence (FinGPT)',
              status: 'active',
              monthlyPrice: 75,
              usersIncluded: 5,
              usageQuota: { apiCalls: 10000, aiTokens: 50000 },
              startDate: '2024-01-01',
              nextBillingDate: '2024-02-01'
            },
            {
              bundleId: 'erp_advanced_idurar',
              bundleName: 'Advanced ERP Suite (IDURAR)',
              status: 'active',
              monthlyPrice: 65,
              usersIncluded: 5,
              usageQuota: { storage: 10 },
              startDate: '2024-01-01',
              nextBillingDate: '2024-02-01'
            }
          ],
          usage: {
            totalUsers: 5,
            activeUsers: 4,
            apiCalls: 8450,
            storageUsed: 7.2,
            aiTokensUsed: 42300,
            monthlySpend: 140
          },
          billing: {
            method: 'Credit Card ****1234',
            nextPayment: '2024-02-01',
            amount: 140,
            currency: 'USD',
            discounts: 15
          },
          recommendations: [
            'Add FinRobot bundle for 20% multi-bundle discount',
            'Upgrade to annual billing to save 15%',
            'Consider volume discount at 10+ users'
          ]
        }
        
        setSubscriptionData(mockData)
        setSelectedBundles(mockData.subscriptions.map(s => s.bundleId))
      } catch (error) {
        console.error('Failed to load subscription data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptionData()
  }, [])

  const handleBundleToggle = (bundleId: string) => {
    setSelectedBundles(prev => 
      prev.includes(bundleId)
        ? prev.filter(id => id !== bundleId)
        : [...prev, bundleId]
    )
  }

  const handlePricingUpdate = (pricing: any) => {
    setCurrentPricing(pricing)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!subscriptionData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to Load Subscription Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please try refreshing the page or contact support.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your CoreFlow360 bundles and billing
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export Usage
          </button>
          <button 
            onClick={() => setShowUpgradeFlow(!showUpgradeFlow)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Manage Bundles
          </button>
        </div>
      </div>

      {/* Current Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Spend</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${subscriptionData.usage.monthlySpend}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">
            ${subscriptionData.billing.discounts} saved this month
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {subscriptionData.usage.activeUsers}/{subscriptionData.usage.totalUsers}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {Math.round((subscriptionData.usage.activeUsers / subscriptionData.usage.totalUsers) * 100)}% utilization
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Tokens Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(subscriptionData.usage.aiTokensUsed / 1000).toFixed(1)}K
              </p>
            </div>
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            85% of monthly quota
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Bundles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {subscriptionData.subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Next billing: {new Date(subscriptionData.billing.nextPayment).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Active Subscriptions
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {subscriptionData.subscriptions.map((subscription) => (
              <div
                key={subscription.bundleId}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(subscription.status)}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {subscription.bundleName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subscription.usersIncluded} users included
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${subscription.monthlyPrice}/month
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Optimization Recommendations
        </h2>
        <div className="space-y-3">
          {subscriptionData.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bundle Management */}
      {showUpgradeFlow && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Your Bundles
            </h2>
            <button
              onClick={() => setShowUpgradeFlow(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          {/* User Count Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Users
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={userCount}
                onChange={(e) => setUserCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Businesses
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={businessCount}
                onChange={(e) => setBusinessCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Bundle Selector */}
          <BundleSelector
            selectedBundles={selectedBundles}
            onBundleToggle={handleBundleToggle}
            userCount={userCount}
            businessCount={businessCount}
            onPricingUpdate={handlePricingUpdate}
          />

          {/* Action Buttons */}
          {currentPricing && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowUpgradeFlow(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Update Subscription (${currentPricing?.pricing?.monthlyTotal || '0'}/mo)
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}