/**
 * CoreFlow360 - Dynamic Navigation Component
 * Navigation that adapts based on active module subscriptions
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useModuleAccess } from '@/hooks/useModuleAccess'

interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  module?: string
  requiresAllModules?: string[]
  badge?: string
}

interface DynamicNavigationProps {
  variant?: 'sidebar' | 'top' | 'mobile'
  className?: string
}

const DynamicNavigation: React.FC<DynamicNavigationProps> = ({
  variant = 'sidebar',
  className = ''
}) => {
  const pathname = usePathname()
  const { activeModules, hasModule, hasAllModules, loading } = useModuleAccess()

  // Define all navigation items
  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊'
    },
    {
      id: 'crm',
      label: 'CRM',
      href: '/crm',
      icon: '👥',
      module: 'crm'
    },
    {
      id: 'accounting',
      label: 'Accounting',
      href: '/accounting',
      icon: '💰',
      module: 'accounting'
    },
    {
      id: 'hr',
      label: 'Human Resources',
      href: '/hr',
      icon: '👔',
      module: 'hr'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      href: '/inventory',
      icon: '📦',
      module: 'inventory'
    },
    {
      id: 'projects',
      label: 'Projects',
      href: '/projects',
      icon: '📋',
      module: 'projects'
    },
    {
      id: 'marketing',
      label: 'Marketing',
      href: '/marketing',
      icon: '📢',
      module: 'marketing'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: '📈',
      requiresAllModules: ['crm', 'accounting'] // Cross-module feature
    },
    {
      id: 'workflows',
      label: 'Workflows',
      href: '/workflows',
      icon: '⚡',
      badge: 'AI',
      requiresAllModules: ['crm', 'hr'] // Cross-module feature
    }
  ]

  // Filter navigation items based on module access
  const visibleNavItems = allNavItems.filter(item => {
    if (!item.module && !item.requiresAllModules) return true
    if (item.module) return hasModule(item.module)
    if (item.requiresAllModules) return hasAllModules(item.requiresAllModules)
    return false
  })

  const isActive = (href: string) => pathname === href

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {variant === 'sidebar' && (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <nav className={`w-64 bg-white border-r border-gray-200 h-full ${className}`}>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">CoreFlow360</h2>
          
          <div className="space-y-1">
            <AnimatePresence>
              {visibleNavItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Module count indicator */}
          <div className="mt-8 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Active Modules</div>
            <div className="text-lg font-bold text-gray-900">
              {activeModules.length} / 10
            </div>
            <Link
              href="/pricing"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              Upgrade →
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  if (variant === 'top') {
    return (
      <nav className={`bg-white border-b border-gray-200 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h2 className="text-xl font-bold text-gray-900">CoreFlow360</h2>
              
              <div className="hidden md:flex items-center space-x-1">
                {visibleNavItems.map(item => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {activeModules.length} modules active
              </span>
              <Link
                href="/pricing"
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Modules
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Mobile variant
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 ${className}`}>
      <div className="grid grid-cols-4 gap-1 p-2">
        {visibleNavItems.slice(0, 4).map(item => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${
              isActive(item.href)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default DynamicNavigation