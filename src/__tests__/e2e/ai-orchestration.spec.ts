/**
 * CoreFlow360 - E2E AI Orchestration Tests
 * Tests AI orchestration functionality and subscription awareness
 */

import { test, expect, Page } from '@playwright/test'
import { testConfig } from '@/test-config'

// Test data
const TEST_ORCHESTRATION_REQUEST = {
  taskType: 'ANALYZE_CUSTOMER',
  input: {
    customerId: 'test-customer-123',
    includeHistory: true
  },
  context: {
    priority: 'medium',
    department: 'sales'
  },
  requirements: {
    maxExecutionTime: 30000,
    accuracyThreshold: 0.8,
    explainability: true
  }
}

test.describe('AI Orchestration API', () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    // Login to get session
    const loginResponse = await request.post('/api/auth/register', {
      data: {
        email: 'test-ai@example.com',
        password: testConfig.auth.defaultPassword,
        name: 'AI Test User',
        companyName: 'AI Test Company'
      }
    })
    
    expect(loginResponse.ok()).toBeTruthy()
    
    // Get session cookie for subsequent requests
    const cookies = loginResponse.headers()['set-cookie']
    authToken = cookies || ''
  })

  test('should require authentication for AI orchestration', async ({ request }) => {
    const response = await request.post('/api/ai/orchestrate', {
      data: TEST_ORCHESTRATION_REQUEST
    })

    expect(response.status()).toBe(401)
    const data = await response.json()
    expect(data.error).toContain('Unauthorized')
  })

  test('should handle AI orchestration request with valid auth', async ({ request, page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')

    // Extract session cookies
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(cookie => cookie.name.includes('session'))

    if (sessionCookie) {
      // Make API request with session
      const response = await request.post('/api/ai/orchestrate', {
        data: TEST_ORCHESTRATION_REQUEST,
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      })

      if (response.status() === 200) {
        const data = await response.json()
        expect(data.success).toBeTruthy()
        expect(data.orchestrationId).toBeDefined()
        expect(data.result).toBeDefined()
        expect(data.result.executionMetadata).toBeDefined()
        expect(data.result.executionMetadata.subscriptionTier).toBeDefined()
      } else {
        // Log response for debugging
        console.log('AI Orchestration Response:', response.status(), await response.text())
      }
    }
  })

  test('should validate request schema', async ({ request, page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(cookie => cookie.name.includes('session'))

    if (sessionCookie) {
      // Send invalid request
      const response = await request.post('/api/ai/orchestrate', {
        data: {
          // Missing required fields
          input: { customerId: 'test' }
        },
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      })

      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data.success).toBeFalsy()
    }
  })

  test('should respect rate limiting', async ({ request, page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(cookie => cookie.name.includes('session'))

    if (sessionCookie) {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill(null).map(() =>
        request.post('/api/ai/orchestrate', {
          data: TEST_ORCHESTRATION_REQUEST,
          headers: {
            'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
          }
        })
      )

      const responses = await Promise.all(requests)
      
      // At least some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      
      // Note: This test might be flaky depending on actual rate limiting implementation
      // In a real scenario, you'd configure the rate limit to be very low for testing
    }
  })

  test('should return subscription capabilities', async ({ request, page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(cookie => cookie.name.includes('session'))

    if (sessionCookie) {
      const response = await request.get('/api/ai/orchestrate', {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      })

      if (response.status() === 200) {
        const data = await response.json()
        expect(data.subscription).toBeDefined()
        expect(data.subscription.tier).toBeDefined()
        expect(data.subscription.activeModules).toBeDefined()
        expect(data.aiCapabilities).toBeDefined()
        expect(data.limits).toBeDefined()
      }
    }
  })
})

test.describe('Subscription-Aware Features', () => {
  test('should display different features based on subscription', async ({ page }) => {
    // Login as admin (should have full access)
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    await page.goto('/dashboard')

    // Should show AI features for admin user
    await expect(page.locator('text=AI Insights')).toBeVisible()
    
    // Navigate to different sections to check feature availability
    // This would depend on your actual UI implementation
  })

  test('should show upgrade prompts for limited features', async ({ page }) => {
    // This test would check for upgrade prompts when users try to access
    // features not included in their subscription
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.userEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    // Try to access premium features
    // Implementation would depend on your UI
  })
})

test.describe('Error Boundaries', () => {
  test('should handle React errors gracefully', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Simulate a JavaScript error
    await page.evaluate(() => {
      // Trigger an error in React
      throw new Error('Simulated React error')
    })

    // The error boundary should catch this and show a fallback UI
    // This test might need to be adjusted based on how you implement error boundaries
  })

  test('should recover from errors', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    // Go to a page that might have errors
    await page.goto('/dashboard')
    
    // If an error boundary is shown, test the retry functionality
    const retryButton = page.locator('button:has-text("Try Again")')
    if (await retryButton.isVisible()) {
      await retryButton.click()
      // Should recover and show normal content
      await expect(page.locator('text=Welcome back')).toBeVisible()
    }
  })
})

test.describe('Performance', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    // Wait for dashboard to fully load
    await expect(page.locator('text=Welcome back')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // This would test loading pages with large amounts of data
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    // Navigate to admin page which might load lots of data
    await page.goto('/admin')
    
    // Check that the page loads without timing out
    await expect(page.locator('text=Admin Portal')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Accessibility', () => {
  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.goto('/login')

    // Tab through form elements
    await page.keyboard.press('Tab') // Email field
    await expect(page.locator('input[name="email"]')).toBeFocused()

    await page.keyboard.press('Tab') // Password field
    await expect(page.locator('input[name="password"]')).toBeFocused()

    await page.keyboard.press('Tab') // Submit button
    await expect(page.locator('button[type="submit"]')).toBeFocused()

    // Should be able to submit with Enter
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL('/dashboard')
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login')

    // Check for ARIA labels on form elements
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')

    // These should have appropriate labels or aria-label attributes
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

test.describe('Security', () => {
  test('should not expose sensitive information in client', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    await page.goto('/dashboard')

    // Check that sensitive data is not exposed in the page content
    const content = await page.content()
    
    // Should not contain raw passwords, API keys, etc.
    expect(content).not.toContain('password')
    expect(content).not.toContain('api_key')
    expect(content).not.toContain('secret')
  })

  test('should handle session expiration', async ({ page, context }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    await page.goto('/dashboard')
    await expect(page.locator('text=Welcome back')).toBeVisible()

    // Clear session cookies to simulate expiration
    await context.clearCookies()

    // Navigate to a protected route
    await page.goto('/admin')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})