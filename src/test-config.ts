// Test configuration file - loads test environment variables
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') })

export const testConfig = {
  auth: {
    defaultPassword: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    demoPassword: process.env.TEST_DEMO_PASSWORD || 'demo123456',
    testPassword: process.env.TEST_DEFAULT_PASSWORD || 'testpassword123',
    adminEmail: process.env.TEST_ADMIN_EMAIL || 'admin@coreflow360.com',
    userEmail: process.env.TEST_USER_EMAIL || 'user@coreflow360.com',
    testEmail: process.env.TEST_EMAIL || 'test@coreflow360.com',
  },
  security: {
    mfaSecret: process.env.TEST_MFA_SECRET || 'JBSWY3DPEHPK3PXP',
    webhookSecret: process.env.TEST_WEBHOOK_SECRET || 'test-webhook-secret-key-for-testing',
  },
  api: {
    testApiKey: process.env.TEST_API_KEY || 'test-api-key-development-only',
    testSecretKey: process.env.TEST_SECRET_KEY || 'test-secret-key-development-only',
  },
}
