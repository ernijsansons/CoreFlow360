/**
 * CoreFlow360 - Component Test Helpers
 * React Testing Library utilities and component testing patterns
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMockSession } from './api-test-helpers'
import { TestFactories } from './test-factories'

// Mock router for Next.js components
export const createMockRouter = (overrides: any = {}) => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  ...overrides
})

// Mock Next.js router
export const mockRouter = (router: any = {}) => {
  const mockRouterObj = createMockRouter(router)
  vi.doMock('next/router', () => ({
    useRouter: () => mockRouterObj,
    withRouter: (Component: any) => Component
  }))
  return mockRouterObj
}

// Mock Next.js navigation
export const mockNavigation = (navigation: any = {}) => {
  const mockNav = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    ...navigation
  }
  vi.doMock('next/navigation', () => ({
    useRouter: () => mockNav,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams()
  }))
  return mockNav
}

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode
  session?: any
  queryClient?: QueryClient
}

const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  session = createMockSession(),
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
}) => {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any
  queryClient?: QueryClient
  wrapperProps?: Partial<TestWrapperProps>
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { session, queryClient, wrapperProps = {}, ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper 
      session={session} 
      queryClient={queryClient} 
      {...wrapperProps}
    >
      {children}
    </TestWrapper>
  )

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}

// Component testing utilities
export const ComponentTestHelper = {
  // Test component rendering
  async testRender(component: ReactElement, options: CustomRenderOptions = {}) {
    const { user, ...renderResult } = renderWithProviders(component, options)
    
    // Wait for any initial renders
    await waitFor(() => {
      expect(renderResult.container).toBeInTheDocument()
    })
    
    return { user, ...renderResult }
  },

  // Test component with different user roles
  async testRoleBasedRendering(
    component: ReactElement,
    roleVariations: Record<string, any> = {}
  ) {
    const roles = ['USER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']
    const results: Record<string, any> = {}

    for (const role of roles) {
      const session = createMockSession({ user: { role } })
      const variation = roleVariations[role] || component
      
      const { user, ...renderResult } = renderWithProviders(variation, { session })
      
      results[role] = {
        role,
        session,
        user,
        ...renderResult
      }
    }

    return results
  },

  // Test form interactions
  async testFormSubmission(
    component: ReactElement,
    formData: Record<string, any>,
    options: {
      submitButtonText?: string
      expectedSubmitCalls?: number
      onSubmit?: Function
    } = {}
  ) {
    const { submitButtonText = 'Submit', expectedSubmitCalls = 1 } = options
    const mockSubmit = vi.fn()
    
    // Clone component and inject mock submit
    const componentWithMock = React.cloneElement(component, {
      onSubmit: options.onSubmit || mockSubmit
    })

    const { user, ...renderResult } = renderWithProviders(componentWithMock)

    // Fill form fields
    for (const [field, value] of Object.entries(formData)) {
      const input = screen.getByRole('textbox', { name: new RegExp(field, 'i') }) ||
                   screen.getByLabelText(new RegExp(field, 'i')) ||
                   screen.getByPlaceholderText(new RegExp(field, 'i'))
      
      await user.clear(input)
      await user.type(input, String(value))
    }

    // Submit form
    const submitButton = screen.getByRole('button', { name: new RegExp(submitButtonText, 'i') })
    await user.click(submitButton)

    // Wait for submission
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(expectedSubmitCalls)
    })

    return {
      user,
      mockSubmit,
      submitButton,
      ...renderResult
    }
  },

  // Test accessibility
  async testAccessibility(component: ReactElement) {
    const { container } = renderWithProviders(component)
    
    // Test keyboard navigation
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    // Test ARIA attributes
    const elementsWithAria = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]')
    
    return {
      focusableElements: Array.from(focusableElements),
      elementsWithAria: Array.from(elementsWithAria),
      hasProperHeadingStructure: this.checkHeadingStructure(container),
      hasSkipLinks: container.querySelector('[href="#main"], [href="#content"]') !== null
    }
  },

  // Check heading hierarchy
  checkHeadingStructure(container: Element) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const levels = Array.from(headings).map(h => parseInt(h.tagName[1]))
    
    // Should start with h1 and not skip levels
    if (levels.length === 0) return true // No headings is OK
    if (levels[0] !== 1) return false // Should start with h1
    
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        return false // Skipped a level
      }
    }
    
    return true
  },

  // Test loading states
  async testLoadingStates(
    component: ReactElement,
    loadingTrigger: () => Promise<void>,
    options: {
      loadingText?: string
      timeout?: number
    } = {}
  ) {
    const { loadingText = 'loading', timeout = 5000 } = options
    const { user, ...renderResult } = renderWithProviders(component)

    // Trigger loading state
    const loadingPromise = loadingTrigger()

    // Check loading indicator appears
    await waitFor(() => {
      expect(screen.getByText(new RegExp(loadingText, 'i'))).toBeInTheDocument()
    }, { timeout })

    // Wait for loading to complete
    await loadingPromise

    // Check loading indicator disappears
    await waitFor(() => {
      expect(screen.queryByText(new RegExp(loadingText, 'i'))).not.toBeInTheDocument()
    }, { timeout })

    return { user, ...renderResult }
  },

  // Test error states
  async testErrorHandling(
    component: ReactElement,
    errorTrigger: () => Promise<void>,
    expectedErrorMessage?: string
  ) {
    const { user, ...renderResult } = renderWithProviders(component)

    // Trigger error
    await expect(errorTrigger()).rejects.toThrow()

    // Check error message appears
    if (expectedErrorMessage) {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(expectedErrorMessage, 'i'))).toBeInTheDocument()
      })
    }

    return { user, ...renderResult }
  }
}

// Mock component dependencies
export const mockComponentDependencies = {
  // Mock Framer Motion
  framerMotion: () => {
    vi.doMock('framer-motion', () => ({
      motion: new Proxy({}, {
        get: (target, prop) => {
          return React.forwardRef<any, any>((props, ref) => 
            React.createElement(String(prop), { ...props, ref })
          )
        }
      }),
      AnimatePresence: ({ children }: any) => children,
      useAnimation: () => ({}),
      useMotionValue: () => ({ set: vi.fn(), get: vi.fn() })
    }))
  },

  // Mock Chart.js
  chartjs: () => {
    vi.doMock('react-chartjs-2', () => ({
      Line: ({ data, options }: any) => (
        <div data-testid="line-chart" data-options={JSON.stringify(options)}>
          Mock Line Chart - {data?.datasets?.length || 0} datasets
        </div>
      ),
      Bar: ({ data, options }: any) => (
        <div data-testid="bar-chart" data-options={JSON.stringify(options)}>
          Mock Bar Chart - {data?.datasets?.length || 0} datasets
        </div>
      ),
      Pie: ({ data, options }: any) => (
        <div data-testid="pie-chart" data-options={JSON.stringify(options)}>
          Mock Pie Chart - {data?.datasets?.length || 0} datasets
        </div>
      )
    }))
  },

  // Mock date picker
  datePicker: () => {
    vi.doMock('react-datepicker', () => ({
      default: ({ selected, onChange, ...props }: any) => (
        <input
          type="date"
          value={selected ? selected.toISOString().split('T')[0] : ''}
          onChange={(e) => onChange && onChange(new Date(e.target.value))}
          {...props}
        />
      )
    }))
  },

  // Mock file upload
  fileUpload: () => {
    vi.doMock('react-dropzone', () => ({
      useDropzone: ({ onDrop }: any) => ({
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false,
        acceptedFiles: []
      })
    }))
  }
}

// Test data generators for components
export const generateComponentTestData = {
  // Table data
  tableData: (rows: number = 5) => ({
    data: TestFactories.createMultiple(() => TestFactories.customer.create(), rows),
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'status', header: 'Status' }
    ]
  }),

  // Form data
  formData: {
    customer: () => ({
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '(555) 123-4567',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    }),
    
    deal: () => ({
      title: 'Test Deal',
      description: 'Test deal description',
      value: '10000',
      stage: 'PROSPECTING',
      probability: '50',
      expectedCloseDate: '2024-12-31'
    }),

    employee: () => ({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 987-6543',
      department: 'OPERATIONS',
      position: 'Technician',
      salary: '50000',
      hireDate: '2024-01-01'
    })
  },

  // Chart data
  chartData: {
    line: () => ({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: 'Revenue',
        data: [12000, 19000, 3000, 5000, 2000],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)'
      }]
    }),

    bar: () => ({
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Sales',
        data: [65, 59, 80, 81],
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }]
    })
  }
}

// Assertion helpers for components
export const assertComponent = {
  // Assert element is visible and accessible
  isAccessible: async (element: HTMLElement) => {
    expect(element).toBeVisible()
    expect(element).toHaveAccessibleName()
  },

  // Assert form validation
  hasValidation: async (form: HTMLElement, requiredFields: string[]) => {
    for (const field of requiredFields) {
      const input = screen.getByLabelText(new RegExp(field, 'i'))
      expect(input).toHaveAttribute('required')
    }
  },

  // Assert table structure
  hasTableStructure: (table: HTMLElement, expectedColumns: string[]) => {
    expect(table).toHaveRole('table')
    
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(expectedColumns.length)
    
    expectedColumns.forEach(column => {
      expect(screen.getByRole('columnheader', { name: new RegExp(column, 'i') })).toBeInTheDocument()
    })
  }
}

// Export utilities
export {
  screen,
  fireEvent,
  waitFor,
  userEvent
}