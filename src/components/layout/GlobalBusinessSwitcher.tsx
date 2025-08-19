/**
 * CoreFlow360 - Global Business Switcher
 * Persistent business context switcher for multi-business users
 */

'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { BusinessSwitcher } from '@/components/business/BusinessSwitcher'
import { Building2, ChevronDown, Crown, Star, Users, BarChart3, Plus } from 'lucide-react'

export function GlobalBusinessSwitcher() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(true)

  // Don't show if user doesn't have multiple businesses
  if (!user?.ownedBusinesses || user.ownedBusinesses.length <= 1) {
    return null
  }

  if (!isVisible) {
    // Collapsed state - just show a small indicator
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-20 z-50 rounded-full border border-gray-200 bg-white p-2 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
        whileHover={{ scale: 1.05 }}
      >
        <Building2 className="h-5 w-5 text-purple-600" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-xs text-white">
          {user.ownedBusinesses.length}
        </span>
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Business Portfolio</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          </div>

          {/* Business Switcher */}
          <div className="mb-4">
            <BusinessSwitcher
              showPortfolioOption={true}
              onBusinessChange={(business) => {
                // In production, this would update the global business context
              }}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => (window.location.href = '/portfolio')}
              className="flex items-center justify-center space-x-2 rounded-lg bg-purple-50 p-2 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
            >
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Portfolio</span>
            </button>
            <button className="flex items-center justify-center space-x-2 rounded-lg bg-gray-50 p-2 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
              <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Add Business
              </span>
            </button>
          </div>

          {/* Progressive Discount Indicator */}
          {user.ownedBusinesses.length > 1 && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Portfolio Savings
                </span>
                <span className="text-sm font-bold text-green-600">
                  {Math.round(
                    user.ownedBusinesses
                      .slice(1)
                      .reduce((total, b) => total + (b.discountRate || 0), 0) * 100
                  )}
                  % off
                </span>
              </div>
              <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                $
                {user.ownedBusinesses
                  .reduce((total, b) => total + b.monthlyRevenue * (b.discountRate || 0), 0)
                  .toLocaleString()}
                /mo saved
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Business Context Provider for global state
 */
export function BusinessContextProvider({ children }: { children: React.ReactNode }) {
  // In production, this would manage global business context state
  // For now, we'll just render children with the switcher
  return (
    <>
      {children}
      <GlobalBusinessSwitcher />
    </>
  )
}
