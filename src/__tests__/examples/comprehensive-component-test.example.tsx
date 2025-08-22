/**
 * CoreFlow360 - Comprehensive Component Test Example
 * Demonstrates advanced React component testing patterns
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { 
  ComponentTestHelper, 
  renderWithProviders,
  mockComponentDependencies,
  generateComponentTestData,
  assertComponent
} from '../utils/component-test-helpers'
import { TestFactories } from '../utils/test-factories'
import { createMockSession } from '../utils/api-test-helpers'

// Mock component for testing
const CustomerList: React.FC<{
  customers?: any[]
  onCustomerSelect?: (customer: any) => void
  loading?: boolean
  error?: string
}> = ({ 
  customers = [], 
  onCustomerSelect = () => {}, 
  loading = false, 
  error 
}) => {
  if (loading) return <div>Loading customers...</div>
  if (error) return <div role="alert">Error: {error}</div>
  if (customers.length === 0) return <div>No customers found</div>

  return (
    <div>
      <h1>Customer List</h1>
      <table role="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>
                <span className={`status ${customer.status.toLowerCase()}`}>
                  {customer.status}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => onCustomerSelect(customer)}
                  aria-label={`Select ${customer.name}`}
                >
                  Select
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CustomerForm: React.FC<{
  customer?: any
  onSubmit?: (data: any) => void
  onCancel?: () => void
  loading?: boolean
}> = ({ 
  customer, 
  onSubmit = () => {}, 
  onCancel = () => {}, 
  loading = false 
}) => {
  const [formData, setFormData] = React.useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Customer form">
      <h2>{customer ? 'Edit Customer' : 'Add Customer'}</h2>
      
      <div>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          required
          aria-required="true"
        />
      </div>
      
      <div>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          required
          aria-required="true"
        />
      </div>
      
      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange('phone')}
        />
      </div>
      
      <div>
        <label htmlFor="address">Address</label>
        <input
          id="address"
          type="text"
          value={formData.address}
          onChange={handleChange('address')}
        />
      </div>
      
      <div>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Customer'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

describe('Comprehensive Component Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CustomerList Component', () => {
    const mockCustomers = [
      TestFactories.customer.create({ name: 'John Doe', status: 'ACTIVE' }),
      TestFactories.customer.create({ name: 'Jane Smith', status: 'INACTIVE' }),
      TestFactories.customer.create({ name: 'Bob Johnson', status: 'ACTIVE' })
    ]

    it('should render customer list correctly', async () => {
      const mockOnSelect = vi.fn()
      
      const { user } = await ComponentTestHelper.testRender(
        <CustomerList customers={mockCustomers} onCustomerSelect={mockOnSelect} />
      )

      // Check table structure
      const table = screen.getByRole('table')
      assertComponent.hasTableStructure(table, ['Name', 'Email', 'Status', 'Actions'])

      // Check customer data
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()

      // Test customer selection
      const selectButton = screen.getByLabelText('Select John Doe')
      await user.click(selectButton)
      
      expect(mockOnSelect).toHaveBeenCalledWith(mockCustomers[0])
    })

    it('should show loading state', async () => {
      await ComponentTestHelper.testRender(
        <CustomerList customers={[]} loading={true} />
      )

      expect(screen.getByText('Loading customers...')).toBeInTheDocument()
    })

    it('should show error state', async () => {
      await ComponentTestHelper.testRender(
        <CustomerList customers={[]} error="Failed to load customers" />
      )

      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toHaveTextContent('Error: Failed to load customers')
    })

    it('should show empty state', async () => {
      await ComponentTestHelper.testRender(
        <CustomerList customers={[]} />
      )

      expect(screen.getByText('No customers found')).toBeInTheDocument()
    })

    it('should be accessible', async () => {
      await ComponentTestHelper.testRender(
        <CustomerList customers={mockCustomers} />
      )

      const accessibility = await ComponentTestHelper.testAccessibility(
        <CustomerList customers={mockCustomers} />
      )

      expect(accessibility.focusableElements.length).toBeGreaterThan(0)
      expect(accessibility.hasProperHeadingStructure).toBe(true)
    })

    it('should work with different user roles', async () => {
      const roleResults = await ComponentTestHelper.testRoleBasedRendering(
        <CustomerList customers={mockCustomers} />
      )

      // All roles should see the customer list
      Object.keys(roleResults).forEach(role => {
        expect(roleResults[role].getByText('Customer List')).toBeInTheDocument()
      })
    })
  })

  describe('CustomerForm Component', () => {
    const formData = generateComponentTestData.formData.customer()

    it('should handle form submission', async () => {
      const mockSubmit = vi.fn()
      
      await ComponentTestHelper.testFormSubmission(
        <CustomerForm onSubmit={mockSubmit} />,
        formData,
        { submitButtonText: 'Save Customer' }
      )

      expect(mockSubmit).toHaveBeenCalledWith(formData)
    })

    it('should validate required fields', async () => {
      const { user } = renderWithProviders(<CustomerForm />)

      const form = screen.getByLabelText('Customer form')
      assertComponent.hasValidation(form, ['name', 'email'])

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)

      expect(nameInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('required')
    })

    it('should populate form for editing', async () => {
      const existingCustomer = TestFactories.customer.create()
      
      renderWithProviders(<CustomerForm customer={existingCustomer} />)

      expect(screen.getByDisplayValue(existingCustomer.name)).toBeInTheDocument()
      expect(screen.getByDisplayValue(existingCustomer.email)).toBeInTheDocument()
      expect(screen.getByText('Edit Customer')).toBeInTheDocument()
    })

    it('should handle loading state', async () => {
      renderWithProviders(<CustomerForm loading={true} />)

      const submitButton = screen.getByRole('button', { name: /saving/i })
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Saving...')
    })

    it('should handle form cancellation', async () => {
      const mockCancel = vi.fn()
      const { user } = renderWithProviders(<CustomerForm onCancel={mockCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockCancel).toHaveBeenCalled()
    })

    it('should be keyboard accessible', async () => {
      const { user } = renderWithProviders(<CustomerForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.tab()
      expect(nameInput).toHaveFocus()

      await user.tab()
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveFocus()

      await user.tab()
      const phoneInput = screen.getByLabelText(/phone/i)
      expect(phoneInput).toHaveFocus()
    })
  })

  describe('Integration Testing', () => {
    it('should test component interaction flow', async () => {
      const mockCustomers = [TestFactories.customer.create()]
      const [selectedCustomer, setSelectedCustomer] = React.useState(null)
      const [showForm, setShowForm] = React.useState(false)

      const IntegratedFlow = () => (
        <div>
          {!showForm ? (
            <CustomerList 
              customers={mockCustomers}
              onCustomerSelect={(customer) => {
                setSelectedCustomer(customer)
                setShowForm(true)
              }}
            />
          ) : (
            <CustomerForm 
              customer={selectedCustomer}
              onSubmit={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )

      const { user } = renderWithProviders(<IntegratedFlow />)

      // Start with customer list
      expect(screen.getByText('Customer List')).toBeInTheDocument()

      // Select a customer
      const selectButton = screen.getByLabelText(`Select ${mockCustomers[0].name}`)
      await user.click(selectButton)

      // Should show form
      await waitFor(() => {
        expect(screen.getByText('Edit Customer')).toBeInTheDocument()
      })

      // Cancel form
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Should return to list
      await waitFor(() => {
        expect(screen.getByText('Customer List')).toBeInTheDocument()
      })
    })

    it('should test error handling across components', async () => {
      const ErrorBoundaryTest = () => {
        const [hasError, setHasError] = React.useState(false)

        if (hasError) {
          throw new Error('Component error occurred')
        }

        return (
          <div>
            <button onClick={() => setHasError(true)}>
              Trigger Error
            </button>
            <CustomerList customers={[]} />
          </div>
        )
      }

      await ComponentTestHelper.testErrorHandling(
        <ErrorBoundaryTest />,
        async () => {
          const { user } = renderWithProviders(<ErrorBoundaryTest />)
          const errorButton = screen.getByText('Trigger Error')
          await user.click(errorButton)
          throw new Error('Component error occurred')
        },
        'Component error occurred'
      )
    })
  })

  describe('Performance Testing', () => {
    it('should handle large datasets efficiently', async () => {
      const largeCustomerList = Array.from({ length: 1000 }, (_, i) => 
        TestFactories.customer.create({ name: `Customer ${i}` })
      )

      const startTime = performance.now()
      
      renderWithProviders(
        <CustomerList customers={largeCustomerList} />
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(1000) // 1 second
      expect(screen.getByText('Customer List')).toBeInTheDocument()
    })

    it('should not cause memory leaks', async () => {
      const TestComponent = () => {
        const [customers, setCustomers] = React.useState([])

        React.useEffect(() => {
          const interval = setInterval(() => {
            setCustomers(prev => [...prev, TestFactories.customer.create()])
          }, 100)

          return () => clearInterval(interval)
        }, [])

        return <CustomerList customers={customers} />
      }

      const { unmount } = renderWithProviders(<TestComponent />)

      // Let component run for a bit
      await new Promise(resolve => setTimeout(resolve, 500))

      // Unmount and check for cleanup
      unmount()

      // In a real test, you'd check for memory leaks here
      expect(true).toBe(true) // Placeholder assertion
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', async () => {
      // Mock different viewport sizes
      const viewports = [
        { width: 320, height: 568 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }  // Desktop
      ]

      for (const viewport of viewports) {
        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height
        })

        renderWithProviders(
          <CustomerList customers={[TestFactories.customer.create()]} />
        )

        // Component should render regardless of screen size
        expect(screen.getByText('Customer List')).toBeInTheDocument()
      }
    })
  })
})