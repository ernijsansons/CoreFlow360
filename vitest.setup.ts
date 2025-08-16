// Vitest setup for CoreFlow360 tests
// Ensure consistent test environment configuration

// Set required environment variables for tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_PROVIDER = 'sqlite'
process.env.DATABASE_URL = 'file:./prisma/test.db'
process.env.APP_URL = 'http://localhost:3000'
process.env.ENCRYPTION_KEY = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-purposes-only-32-chars'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.ENABLE_AI_FEATURES = 'false'
process.env.ENABLE_STRIPE_INTEGRATION = 'false'
process.env.ENABLE_REDIS_CACHE = 'false'
process.env.MAINTENANCE_MODE = 'false'
process.env.CORS_ORIGINS = '*'
process.env.LOG_LEVEL = 'error'
process.env.MAX_REQUEST_SIZE = '10mb'
process.env.REQUEST_TIMEOUT = '30000'
process.env.RATE_LIMIT_REQUESTS = '1000'
process.env.RATE_LIMIT_WINDOW = '60'
process.env.DATABASE_POOL_SIZE = '5'
process.env.DATABASE_TIMEOUT = '10000'
process.env.REDIS_MAX_CONNECTIONS = '10'
