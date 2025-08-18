/**
 * CoreFlow360 - E2E Authentication Tests
 * Tests critical user authentication and onboarding flows
 */

import { test, expect, Page } from '@playwright/test'
import { testConfig } from '@/test-config'

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: testConfig.auth.defaultPassword,
  companyName: 'Test Company Inc'
}

test.describe('Authentication Flow', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('should complete registration flow successfully', async () => {
    // Navigate to registration page
    await page.goto('/register')
    await expect(page).toHaveTitle(/CoreFlow360.*Register/)

    // Fill registration form
    await page.fill('input[name="name"]', TEST_USER.name)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    
    // Select industry
    await page.selectOption('select[name="industryType"]', 'GENERAL')
    
    // Agree to terms
    await page.check('input[name="agreeToTerms"]')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for success page
    await expect(page.locator('text=Welcome to CoreFlow360!')).toBeVisible()
    await expect(page.locator('text=Your account has been created successfully')).toBeVisible()

    // Click sign in button
    await page.click('text=Sign In to Continue')
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login')
  })

  test('should login with valid credentials', async () => {
    // Navigate to login page
    await page.goto('/login')
    await expect(page).toHaveTitle(/CoreFlow360.*Login/)

    // Fill login form
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('should show error for invalid credentials', async () => {
    await page.goto('/login')

    // Fill with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')

    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('should validate required fields on registration', async () => {
    await page.goto('/register')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Invalid email address')).toBeVisible()
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible()
  })

  test('should validate password confirmation', async () => {
    await page.goto('/register')

    await page.fill('input[name="name"]', TEST_USER.name)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'differentpassword')
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.check('input[name="agreeToTerms"]')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=Passwords don\'t match')).toBeVisible()
  })

  test('should require terms agreement', async () => {
    await page.goto('/register')

    await page.fill('input[name="name"]', TEST_USER.name)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    
    // Don't check terms
    await page.click('button[type="submit"]')

    await expect(page.locator('text=You must agree to the terms')).toBeVisible()
  })

  test('should redirect authenticated users away from auth pages', async () => {
    // First login
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')

    // Try to access register page
    await page.goto('/register')
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Try to access login page
    await page.goto('/login')
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })
})

test.describe('Dashboard Access', () => {
  test('should protect dashboard from unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login with callback URL
    await expect(page).toHaveURL(/\/login\?callbackUrl=/)
  })

  test('should display user information in dashboard', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')
    
    // Check dashboard content
    await expect(page.locator('text=Welcome back')).toBeVisible()
    await expect(page.locator('text=ADMIN')).toBeVisible() // Role should be displayed
  })

  test('should show subscription information', async ({ page }) => {
    // Login and navigate to dashboard
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    // Check for subscription-related content
    await expect(page.locator('text=Active Users')).toBeVisible()
    await expect(page.locator('text=AI Insights')).toBeVisible()
  })
})

test.describe('Admin Interface', () => {
  test('should restrict admin access to admin users only', async ({ page }) => {
    // Try to access admin page without authentication
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)

    // Login as regular user (if available)
    await page.fill('input[name="email"]', testConfig.auth.userEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    // Try to access admin page
    await page.goto('/admin')
    // Should redirect to dashboard (not admin)
    await expect(page).toHaveURL('/dashboard')
  })

  test('should allow admin users to access admin interface', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    await page.goto('/admin')
    await expect(page.locator('text=Admin Portal')).toBeVisible()
    await expect(page.locator('text=Overview')).toBeVisible()
  })
})

test.describe('Error Handling', () => {
  test('should display network error gracefully', async ({ page }) => {
    // Intercept network requests and simulate failure
    await page.route('**/api/auth/register', route => {
      route.abort('failed')
    })

    await page.goto('/register')
    await page.fill('input[name="name"]', TEST_USER.name)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.check('input[name="agreeToTerms"]')

    await page.click('button[type="submit"]')

    // Should show network error
    await expect(page.locator('text=Network request failed')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            code: 'EMAIL_EXISTS',
            message: 'User with this email already exists'
          }
        })
      })
    })

    await page.goto('/register')
    await page.fill('input[name="name"]', TEST_USER.name)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.check('input[name="agreeToTerms"]')

    await page.click('button[type="submit"]')

    // Should show API error
    await expect(page.locator('text=User with this email already exists')).toBeVisible()
  })
})

test.describe('UI Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/login')

    // Should be responsive
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()

    // Form should be usable on mobile
    await page.fill('input[name="email"]', testConfig.auth.adminEmail)
    await page.fill('input[name="password"]', testConfig.auth.demoPassword)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
  })

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/register')

    // Check layout is appropriate for tablet
    await expect(page.locator('form')).toBeVisible()
    
    // Grid should work on tablet
    const nameInput = page.locator('input[name="name"]')
    const emailInput = page.locator('input[name="email"]')
    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()
  })
})