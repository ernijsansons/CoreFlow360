/**
 * CoreFlow360 - Module Gated Feature Component
 * Conditionally renders features based on active module subscriptions
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiRequest, ErrorPatterns } from '@/lib/error-handling'

interface ModuleGatedFeatureProps {
  requiredModule: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  tenantId?: string
  className?: string
}

interface UpgradePromptProps {
  requiredModules: string[]
  currentModules: string[]
  onUpgrade?: () => void
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  requiredModules,
  currentModules,
  onUpgrade,
}) => {
  const missingModules = requiredModules.filter((m) => !currentModules.includes(m))
  const hasOneAgent = currentModules.length === 1

  const getAgentName = (module: string) => {
    const names: Record<string, string> = {
      sales: 'AI Sales Expert',
      crm: 'AI Customer Expert',
      finance: 'AI Money Detective',
      operations: 'AI Operations Expert',
      analytics: 'AI Crystal Ball',
      hr: 'AI People Person',
    }
    return names[module] || module.toUpperCase()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 to-cyan-950/50 p-6 backdrop-blur-sm"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        {hasOneAgent ? (
          <div>
            <h3 className="mb-2 text-2xl font-bold text-white">
              Your {getAgentName(currentModules[0])} Wants Help!
            </h3>
            <p className="mb-4 text-gray-300">
              You're getting great results with your free AI agent.
              <br />
              <span className="font-semibold text-violet-400">
                Add {missingModules.length > 1 ? 'these AI employees' : 'this AI employee'} to make
                even more money:
              </span>
            </p>
          </div>
        ) : (
          <div>
            <h3 className="mb-2 text-2xl font-bold text-white">Unlock More AI Power</h3>
            <p className="mb-4 text-gray-300">
              This feature needs additional AI agents to work properly:
            </p>
          </div>
        )}

        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {missingModules.map((module) => (
            <div
              key={module}
              className="rounded-xl border border-violet-500/30 bg-gray-900/60 px-4 py-3 text-center"
            >
              <div className="text-sm font-semibold text-white">{getAgentName(module)}</div>
              <div className="text-xs text-violet-400">+$20,000/month value</div>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
          <div className="mb-1 text-lg font-bold text-emerald-400">Upgrade for just $49/user</div>
          <div className="text-sm text-gray-300">
            Get 3 AI employees • 30-day money-back guarantee
          </div>
        </div>

        <button
          onClick={
            onUpgrade ||
            (() => {
              // Track conversion event before redirect
              fetch('/api/conversion/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventType: 'upgrade_prompt',
                  triggerType: 'module_gate',
                  actionTaken: 'upgrade_clicked',
                  currentModule: requiredModules[0],
                  triggerContext: JSON.stringify({
                    requiredModules,
                    currentModules,
                  }),
                }),
              }).catch(console.error)

              window.location.href = '/pricing'
            })
          }
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-3 text-lg font-semibold text-white transition-all duration-200 hover:from-violet-700 hover:to-cyan-700"
        >
          Add More AI Employees
          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>

        <div className="mt-3 text-xs text-gray-400">89% of free users upgrade within 30 days</div>
      </div>
    </motion.div>
  )
}

const ModuleGatedFeature: React.FC<ModuleGatedFeatureProps> = ({
  requiredModule,
  children,
  fallback,
  showUpgradePrompt = true,
  tenantId,
  className,
}) => {
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  const requiredModules = Array.isArray(requiredModule) ? requiredModule : [requiredModule]

  useEffect(() => {
    const checkModuleAccess = async () => {
      try {
        // Call freemium status API using standardized error handling
        const { data: freemiumStatus, error } = await apiRequest(
          '/api/freemium/status',
          ErrorPatterns.freemiumApi
        )

        let userModules: string[] = []

        if (freemiumStatus && !error) {
          // Successfully got data from API - map to active modules
          if (freemiumStatus.subscriptionStatus === 'FREE' && freemiumStatus.selectedAgent) {
            userModules = [freemiumStatus.selectedAgent]
          } else if (freemiumStatus.subscriptionStatus === 'STARTER') {
            userModules = freemiumStatus.activeModules || ['crm', 'sales', 'finance']
          } else if (freemiumStatus.subscriptionStatus === 'BUSINESS') {
            userModules = freemiumStatus.activeModules || [
              'crm',
              'sales',
              'finance',
              'operations',
              'analytics',
              'hr',
            ]
          } else if (freemiumStatus.subscriptionStatus === 'ENTERPRISE') {
            userModules = freemiumStatus.activeModules || [
              'crm',
              'sales',
              'finance',
              'operations',
              'analytics',
              'hr',
              'custom',
            ]
          } else {
            userModules = ['crm'] // Default fallback from API
          }
        } else {
          // Use fallback data from error handling (localStorage fallback is handled in error patterns)

          const fallbackData = ErrorPatterns.freemiumApi.fallbackData
          userModules = [fallbackData.selectedAgent]
        }

        setActiveModules(userModules)

        // Check if all required modules are active
        const hasAllModules = requiredModules.every((m) => userModules.includes(m))
        setHasAccess(hasAllModules)
      } catch (error) {
        // Ultimate fallback
        const fallbackData = ErrorPatterns.freemiumApi.fallbackData
        setActiveModules([fallbackData.selectedAgent])
        setHasAccess(requiredModules.every((m) => m === fallbackData.selectedAgent))
      } finally {
        setLoading(false)
      }
    }

    checkModuleAccess()
  }, [requiredModules])

  if (loading) {
    return (
      <div className={`animate-pulse ${className || ''}`}>
        <div className="h-32 rounded-lg bg-gray-200"></div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {hasAccess ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="fallback"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={className}
        >
          {fallback ||
            (showUpgradePrompt && (
              <UpgradePrompt requiredModules={requiredModules} currentModules={activeModules} />
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ModuleGatedFeature
