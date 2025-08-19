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
  className = '',
}) => {
  const pathname = usePathname()
  const { activeModules, hasModule, hasAllModules, loading } = useModuleAccess()

  // Define all navigation items
  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
    },
    {
      id: 'crm',
      label: 'CRM',
      href: '/crm',
      icon: '👥',
      module: 'crm',
    },
    {
      id: 'accounting',
      label: 'Accounting',
      href: '/accounting',
      icon: '💰',
      module: 'accounting',
    },
    {
      id: 'hr',
      label: 'Human Resources',
      href: '/hr',
      icon: '👔',
      module: 'hr',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      href: '/inventory',
      icon: '📦',
      module: 'inventory',
    },
    {
      id: 'projects',
      label: 'Projects',
      href: '/projects',
      icon: '📋',
      module: 'projects',
    },
    {
      id: 'marketing',
      label: 'Marketing',
      href: '/marketing',
      icon: '📢',
      module: 'marketing',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: '📈',
      requiresAllModules: ['crm', 'accounting'], // Cross-module feature
    },
    {
      id: 'workflows',
      label: 'Workflows',
      href: '/workflows',
      icon: '⚡',
      badge: 'AI',
      requiresAllModules: ['crm', 'hr'], // Cross-module feature
    },
  ]

  // Filter navigation items based on module access
  const visibleNavItems = allNavItems.filter((item) => {
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-200"></div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <nav className={`h-full w-64 border-r border-gray-200 bg-white ${className}`}>
        <div className="p-4">
          <h2 className="mb-6 text-xl font-bold text-gray-900">CoreFlow360</h2>

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
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-50 font-medium text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Module count indicator */}
          <div className="mt-8 rounded-lg bg-gray-50 p-3">
            <div className="text-sm text-gray-600">Active Modules</div>
            <div className="text-lg font-bold text-gray-900">{activeModules.length} / 10</div>
            <Link
              href="/pricing"
              className="mt-1 inline-block text-sm text-blue-600 hover:underline"
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
      <nav className={`border-b border-gray-200 bg-white ${className}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <h2 className="text-xl font-bold text-gray-900">CoreFlow360</h2>

              <div className="hidden items-center space-x-1 md:flex">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{activeModules.length} modules active</span>
              <Link
                href="/pricing"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
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
    <nav className={`fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white ${className}`}>
      <div className="grid grid-cols-4 gap-1 p-2">
        {visibleNavItems.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center rounded-lg py-2 transition-all ${
              isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            <span className="mb-1 text-2xl">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default DynamicNavigation
