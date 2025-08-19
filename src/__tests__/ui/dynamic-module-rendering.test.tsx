/**
 * CoreFlow360 - Dynamic Module UI Rendering Test Suite
 * Tests UI components adapt correctly based on active modules
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach, vi } from '@jest/globals'
import ModuleGatedFeature from '@/components/ui/ModuleGatedFeature'
import DynamicModuleDashboard from '@/components/dashboard/DynamicModuleDashboard'
import DynamicNavigation from '@/components/navigation/DynamicNavigation'
import { useModuleAccess } from '@/lib/hooks/useModuleAccess'

// Mock the module access hook
vi.mock('@/hooks/useModuleAccess')

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div
        {...props}
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
        tabindex="0"
      >
        {children}
      </div>
    ),
    button: ({ children, ...props }: any) => (
      <button
        {...props}
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
        aria-label="Button"
      >
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Dynamic Module UI Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ModuleGatedFeature Component', () => {
    it('should show content when required module is active', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: ['crm'],
        loading: false,
        error: null,
        subscriptionTier: 'professional',
        hasModule: (module: string) => module === 'crm',
        hasAllModules: (modules: string[]) => modules.every((m) => m === 'crm'),
        hasAnyModule: (modules: string[]) => modules.some((m) => m === 'crm'),
        refreshModules: vi.fn(),
      })

      render(
        <ModuleGatedFeature requiredModule="crm">
          <div
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
          >
            CRM Feature Content
          </div>
        </ModuleGatedFeature>
      )

      expect(screen.getByText('CRM Feature Content')).toBeInTheDocument()
    })

    it('should show upgrade prompt when module is not active', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: [],
        loading: false,
        error: null,
        subscriptionTier: 'basic',
        hasModule: () => false,
        hasAllModules: () => false,
        hasAnyModule: () => false,
        refreshModules: vi.fn(),
      })

      render(
        <ModuleGatedFeature requiredModule="accounting">
          <div
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
          >
            Accounting Feature
          </div>
        </ModuleGatedFeature>
      )

      expect(screen.queryByText('Accounting Feature')).not.toBeInTheDocument()
      expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
      expect(screen.getByText('ACCOUNTING')).toBeInTheDocument()
    })

    it('should show custom fallback when provided', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: [],
        loading: false,
        error: null,
        subscriptionTier: 'basic',
        hasModule: () => false,
        hasAllModules: () => false,
        hasAnyModule: () => false,
        refreshModules: vi.fn(),
      })

      render(
        <ModuleGatedFeature
          requiredModule="hr"
          fallback={
            <div
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
              tabindex="0"
            >
              Custom HR Upgrade Message
            </div>
          }
        >
          <div
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
          >
            HR Feature
          </div>
        </ModuleGatedFeature>
      )

      expect(screen.getByText('Custom HR Upgrade Message')).toBeInTheDocument()
    })

    it('should handle multiple required modules', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: ['crm'],
        loading: false,
        error: null,
        subscriptionTier: 'professional',
        hasModule: (module: string) => module === 'crm',
        hasAllModules: (modules: string[]) => modules.every((m) => m === 'crm'),
        hasAnyModule: (modules: string[]) => modules.some((m) => m === 'crm'),
        refreshModules: vi.fn(),
      })

      render(
        <ModuleGatedFeature requiredModule={['crm', 'accounting']}>
          <div
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
            tabindex="0"
          >
            Cross-Module Feature
          </div>
        </ModuleGatedFeature>
      )

      expect(screen.queryByText('Cross-Module Feature')).not.toBeInTheDocument()
      expect(screen.getByText('ACCOUNTING')).toBeInTheDocument()
    })
  })

  describe('DynamicModuleDashboard Component', () => {
    it('should render widgets for active modules only', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: ['crm', 'accounting'],
        loading: false,
        error: null,
        subscriptionTier: 'professional',
        hasModule: (module: string) => ['crm', 'accounting'].includes(module),
        hasAllModules: (modules: string[]) =>
          modules.every((m) => ['crm', 'accounting'].includes(m)),
        hasAnyModule: (modules: string[]) => modules.some((m) => ['crm', 'accounting'].includes(m)),
        refreshModules: vi.fn(),
      })

      render(<DynamicModuleDashboard />)

      expect(screen.getByText('CRM Overview')).toBeInTheDocument()
      expect(screen.getByText('Financial Summary')).toBeInTheDocument()
      expect(screen.queryByText('Team Overview')).not.toBeInTheDocument() // HR not active
    })

    it('should show cross-module insights when multiple modules active', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: ['crm', 'accounting'],
        loading: false,
        error: null,
        subscriptionTier: 'professional',
        hasModule: (module: string) => ['crm', 'accounting'].includes(module),
        hasAllModules: (modules: string[]) =>
          modules.every((m) => ['crm', 'accounting'].includes(m)),
        hasAnyModule: (modules: string[]) => modules.some((m) => ['crm', 'accounting'].includes(m)),
        refreshModules: vi.fn(),
      })

      render(<DynamicModuleDashboard />)

      expect(screen.getByText('🤖 AI Cross-Module Insights')).toBeInTheDocument()
      expect(screen.getByText('Revenue Forecast')).toBeInTheDocument()
    })

    it('should show empty state when no modules active', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: [],
        loading: false,
        error: null,
        subscriptionTier: 'basic',
        hasModule: () => false,
        hasAllModules: () => false,
        hasAnyModule: () => false,
        refreshModules: vi.fn(),
      })

      render(<DynamicModuleDashboard />)

      expect(screen.getByText('No Active Modules')).toBeInTheDocument()
      expect(
        screen.getByText('Subscribe to modules to see your personalized dashboard')
      ).toBeInTheDocument()
    })

    it('should handle loading state', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: [],
        loading: true,
        error: null,
        subscriptionTier: null,
        hasModule: () => false,
        hasAllModules: () => false,
        hasAnyModule: () => false,
        refreshModules: vi.fn(),
      })

      render(<DynamicModuleDashboard />)

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })
  })

  describe('DynamicNavigation Component', () => {
    it('should show navigation items for active modules only', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: ['crm', 'hr'],
        loading: false,
        error: null,
        subscriptionTier: 'professional',
        hasModule: (module: string) => ['crm', 'hr'].includes(module),
        hasAllModules: (modules: string[]) => modules.every((m) => ['crm', 'hr'].includes(m)),
        hasAnyModule: (modules: string[]) => modules.some((m) => ['crm', 'hr'].includes(m)),
        refreshModules: vi.fn(),
      })

      render(<DynamicNavigation variant="sidebar" />)

      expect(screen.getByText('CRM')).toBeInTheDocument()
      expect(screen.getByText('Human Resources')).toBeInTheDocument()
      expect(screen.queryByText('Accounting')).not.toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument() // Always visible
    })

    it('should show cross-module features when required modules active', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: ['crm', 'accounting'],
        loading: false,
        error: null,
        subscriptionTier: 'professional',
        hasModule: (module: string) => ['crm', 'accounting'].includes(module),
        hasAllModules: (modules: string[]) =>
          modules.every((m) => ['crm', 'accounting'].includes(m)),
        hasAnyModule: (modules: string[]) => modules.some((m) => ['crm', 'accounting'].includes(m)),
        refreshModules: vi.fn(),
      })

      render(<DynamicNavigation variant="sidebar" />)

      expect(screen.getByText('Analytics')).toBeInTheDocument() // Requires CRM + Accounting
    })

    it('should show module count indicator', () => {
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: ['crm', 'accounting', 'hr'],
        loading: false,
        error: null,
        subscriptionTier: 'professional',
        hasModule: () => true,
        hasAllModules: () => true,
        hasAnyModule: () => true,
        refreshModules: vi.fn(),
      })

      render(<DynamicNavigation variant="sidebar" />)

      expect(screen.getByText('3 / 10')).toBeInTheDocument()
    })

    it('should render different variants correctly', () => {
      const mockAccess = {
        activeModules: ['crm'],
        loading: false,
        error: null,
        subscriptionTier: 'basic',
        hasModule: (module: string) => module === 'crm',
        hasAllModules: (modules: string[]) => modules.every((m) => m === 'crm'),
        hasAnyModule: (modules: string[]) => modules.some((m) => m === 'crm'),
        refreshModules: vi.fn(),
      }

      // Test top variant
      const { rerender } = render(<DynamicNavigation variant="top" />)
      expect(screen.getByText('1 modules active')).toBeInTheDocument()

      // Test mobile variant
      rerender(<DynamicNavigation variant="mobile" />)
      expect(screen.getByText('CRM')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('should update UI when modules are activated', async () => {
      const refreshModules = vi.fn()

      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: [],
        loading: false,
        error: null,
        subscriptionTier: 'basic',
        hasModule: () => false,
        hasAllModules: () => false,
        hasAnyModule: () => false,
        refreshModules,
      })

      const { rerender } = render(<DynamicModuleDashboard />)

      expect(screen.getByText('No Active Modules')).toBeInTheDocument()

      // Simulate module activation
      vi.mocked(useModuleAccess).mockReturnValue({
        activeModules: ['crm'],
        loading: false,
        error: null,
        subscriptionTier: 'basic',
        hasModule: (module: string) => module === 'crm',
        hasAllModules: (modules: string[]) => modules.every((m) => m === 'crm'),
        hasAnyModule: (modules: string[]) => modules.some((m) => m === 'crm'),
        refreshModules,
      })

      rerender(<DynamicModuleDashboard />)

      await waitFor(() => {
        expect(screen.getByText('CRM Overview')).toBeInTheDocument()
      })
    })
  })
})
