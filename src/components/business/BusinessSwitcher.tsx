/**
 * CoreFlow360 - Business Switcher Component
 * Allows entrepreneurs to switch between multiple businesses with context management
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { BusinessContext } from '@/types/auth'
import {
  Building2,
  ChevronDown,
  Plus,
  Settings,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Check,
  Star,
  Crown,
  Zap,
} from 'lucide-react'

interface BusinessSwitcherProps {
  showPortfolioOption?: boolean
  onBusinessChange?: (business: BusinessContext | null) => void
}

export function BusinessSwitcher({
  showPortfolioOption = true,
  onBusinessChange,
}: BusinessSwitcherProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessContext | null>(
    user?.currentBusiness || null
  )

  const handleBusinessSelect = (business: BusinessContext | null) => {
    setSelectedBusiness(business)
    onBusinessChange?.(business)
    setIsOpen(false)

    // In a real implementation, this would update the auth context
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getOwnershipIcon = (type: string) => {
    switch (type) {
      case 'PRIMARY':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'SECONDARY':
        return <Star className="h-4 w-4 text-blue-500" />
      case 'PARTNER':
        return <Users className="h-4 w-4 text-purple-500" />
      default:
        return <Building2 className="h-4 w-4 text-gray-500" />
    }
  }

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000) return `$${(revenue / 1000000).toFixed(1)}M`
    if (revenue >= 1000) return `$${(revenue / 1000).toFixed(0)}K`
    return `$${revenue.toFixed(0)}`
  }

  if (!user?.ownedBusinesses || user.ownedBusinesses.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex items-center space-x-2">
          {selectedBusiness ? (
            <>
              {getOwnershipIcon(selectedBusiness.ownershipType)}
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedBusiness.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedBusiness.industryType} • {formatRevenue(selectedBusiness.monthlyRevenue)}
                  /mo
                </p>
              </div>
            </>
          ) : (
            <>
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Portfolio Overview
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  All {user.ownedBusinesses.length} businesses
                </p>
              </div>
            </>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="p-2">
              {/* Portfolio Overview Option */}
              {showPortfolioOption && (
                <button
                  onClick={() => handleBusinessSelect(null)}
                  className={`flex w-full items-center space-x-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    !selectedBusiness ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                >
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Portfolio Overview
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Consolidated view of all {user.ownedBusinesses.length} businesses
                    </p>
                  </div>
                  {!selectedBusiness && <Check className="h-4 w-4 text-purple-600" />}
                </button>
              )}

              {showPortfolioOption && (
                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
              )}

              {/* Individual Businesses */}
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {user.ownedBusinesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => handleBusinessSelect(business)}
                    className={`flex w-full items-center space-x-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedBusiness?.id === business.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">{getOwnershipIcon(business.ownershipType)}</div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {business.name}
                        </p>
                        {business.billingOrder === 1 && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800">
                            Primary
                          </span>
                        )}
                        {business.discountRate > 0 && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                            -{Math.round(business.discountRate * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {business.industryType}
                        </p>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRevenue(business.monthlyRevenue)}/mo
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {business.userCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Health Score */}
                      <div
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getHealthScoreColor(business.healthScore)}`}
                      >
                        {Math.round(business.healthScore)}%
                      </div>

                      {/* Selection Indicator */}
                      {selectedBusiness?.id === business.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}

                      {/* Warning for inactive businesses */}
                      {!business.isActive && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center space-x-2 rounded-lg bg-purple-600 px-3 py-2 text-sm text-white transition-colors hover:bg-purple-700">
                    <Plus className="h-4 w-4" />
                    <span>Add Business</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Progressive Pricing Indicator */}
                {user.ownedBusinesses.length > 1 && (
                  <div className="mt-3 rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <p className="text-xs font-medium text-green-800 dark:text-green-200">
                        Portfolio Discount Active
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                      Saving{' '}
                      {Math.round(
                        user.ownedBusinesses
                          .slice(1)
                          .reduce((total, b) => total + (b.discountRate || 0), 0) * 100
                      )}
                      % on additional businesses
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
