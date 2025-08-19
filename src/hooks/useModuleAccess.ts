/**
 * CoreFlow360 - Module Access Hook
 * React hook for checking module access and subscriptions
 */

import { useState, useEffect, useCallback } from 'react'

interface ModuleAccessState {
  activeModules: string[]
  loading: boolean
  error: string | null
  subscriptionTier: string | null
  hasModule: (module: string) => boolean
  hasAllModules: (modules: string[]) => boolean
  hasAnyModule: (modules: string[]) => boolean
  refreshModules: () => Promise<void>
}

export function useModuleAccess(tenantId?: string): ModuleAccessState {
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null)

  const fetchModuleAccess = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // API-first approach: Try freemium status API first
      try {
        const freemiumResponse = await fetch('/api/freemium/status')

        if (freemiumResponse.ok) {
          const freemiumData = await freemiumResponse.json()

          let apiModules: string[] = []
          let apiTier = 'free'

          // Map API response to module access
          if (freemiumData.subscriptionStatus === 'FREE' && freemiumData.selectedAgent) {
            apiModules = [freemiumData.selectedAgent]
            apiTier = 'free'
          } else if (freemiumData.subscriptionStatus === 'STARTER') {
            apiModules = freemiumData.activeModules || ['crm', 'sales', 'finance']
            apiTier = 'starter'
          } else if (freemiumData.subscriptionStatus === 'BUSINESS') {
            apiModules = freemiumData.activeModules || [
              'crm',
              'sales',
              'finance',
              'operations',
              'analytics',
              'hr',
            ]
            apiTier = 'business'
          } else if (freemiumData.subscriptionStatus === 'ENTERPRISE') {
            apiModules = freemiumData.activeModules || [
              'crm',
              'sales',
              'finance',
              'operations',
              'analytics',
              'hr',
              'custom',
            ]
            apiTier = 'enterprise'
          }

          setActiveModules(apiModules)
          setSubscriptionTier(apiTier)

          // Update localStorage for consistency (but don't depend on it)
          localStorage.setItem('activeModules', JSON.stringify(apiModules))
          localStorage.setItem('subscriptionTier', apiTier)

          return // Successfully got data from API
        }
      } catch (apiError) {}

      // If we have tenantId, try subscription API
      if (tenantId) {
        try {
          const response = await fetch(`/api/subscriptions/status?tenantId=${tenantId}`)

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.activeModules) {
              setActiveModules(data.activeModules)
              setSubscriptionTier(data.subscriptionTier || 'basic')

              // Update localStorage for consistency
              localStorage.setItem('activeModules', JSON.stringify(data.activeModules))
              localStorage.setItem('subscriptionTier', data.subscriptionTier || 'basic')

              return // Successfully got data from API
            }
          }
        } catch (tenantApiError) {}
      }

      // Fallback to localStorage only if API calls fail

      const storedModules = localStorage.getItem('activeModules')
      const storedTier = localStorage.getItem('subscriptionTier')

      if (storedModules) {
        const modules = JSON.parse(storedModules)
        setActiveModules(modules)
        setSubscriptionTier(storedTier || 'free')
      } else {
        // Ultimate fallback - default demo modules
        const defaultModules = ['crm']
        setActiveModules(defaultModules)
        setSubscriptionTier('free')

        // Store for consistency
        localStorage.setItem('activeModules', JSON.stringify(defaultModules))
        localStorage.setItem('subscriptionTier', 'free')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load module access')

      // Emergency fallback to basic CRM access
      setActiveModules(['crm'])
      setSubscriptionTier('free')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchModuleAccess()

    // Listen for subscription changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeModules' || e.key === 'subscriptionTier') {
        fetchModuleAccess()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Custom event for module updates
    const handleModuleUpdate = () => {
      fetchModuleAccess()
    }

    window.addEventListener('moduleUpdate', handleModuleUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('moduleUpdate', handleModuleUpdate)
    }
  }, [fetchModuleAccess])

  const hasModule = useCallback(
    (module: string): boolean => {
      return activeModules.includes(module)
    },
    [activeModules]
  )

  const hasAllModules = useCallback(
    (modules: string[]): boolean => {
      return modules.every((module) => activeModules.includes(module))
    },
    [activeModules]
  )

  const hasAnyModule = useCallback(
    (modules: string[]): boolean => {
      return modules.some((module) => activeModules.includes(module))
    },
    [activeModules]
  )

  const refreshModules = useCallback(async () => {
    await fetchModuleAccess()
  }, [fetchModuleAccess])

  return {
    activeModules,
    loading,
    error,
    subscriptionTier,
    hasModule,
    hasAllModules,
    hasAnyModule,
    refreshModules,
  }
}

// Helper function to update modules via API
export async function updateActiveModules(modules: string[], tier?: string, tenantId?: string) {
  try {
    // Try to update via API first
    const response = await fetch('/api/subscriptions/modules/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modules,
        tier,
        tenantId,
      }),
    })

    if (response.ok) {
      // API update successful
    } else {
      throw new Error('API update failed')
    }
  } catch (error) {
    // Fallback to localStorage
    localStorage.setItem('activeModules', JSON.stringify(modules))
    if (tier) {
      localStorage.setItem('subscriptionTier', tier)
    }
  }

  // Always dispatch custom event for immediate UI updates
  window.dispatchEvent(new Event('moduleUpdate'))
}

// Helper function to activate module via API
export async function activateModule(module: string, tenantId?: string) {
  try {
    // Try API first
    const response = await fetch('/api/subscriptions/modules/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module,
        tenantId,
      }),
    })

    if (response.ok) {
      window.dispatchEvent(new Event('moduleUpdate'))
      return
    }
  } catch (error) {}

  // Fallback to localStorage
  const current = JSON.parse(localStorage.getItem('activeModules') || '[]')
  if (!current.includes(module)) {
    await updateActiveModules([...current, module], undefined, tenantId)
  }
}

// Helper function to deactivate module via API
export async function deactivateModule(module: string, tenantId?: string) {
  try {
    // Try API first
    const response = await fetch('/api/subscriptions/modules/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module,
        tenantId,
      }),
    })

    if (response.ok) {
      window.dispatchEvent(new Event('moduleUpdate'))
      return
    }
  } catch (error) {}

  // Fallback to localStorage
  const current = JSON.parse(localStorage.getItem('activeModules') || '[]')
  await updateActiveModules(
    current.filter((m: string) => m !== module),
    undefined,
    tenantId
  )
}
