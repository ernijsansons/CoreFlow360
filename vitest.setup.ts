// Vitest setup for CoreFlow360 tests
// Ensure consistent test environment configuration

import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Set required environment variables for tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_PROVIDER = 'sqlite'
process.env.DATABASE_URL = 'file:./prisma/test.db'
process.env.APP_URL = 'http://localhost:3000'
process.env.ENCRYPTION_KEY = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-purposes-only-with-sufficient-entropy-1234567890'
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
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.STRIPE_SECRET_KEY = 'sk_test_1234567890'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_1234567890'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Map([['x-forwarded-for', '127.0.0.1']]),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'test-tenant',
        role: 'user',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: any) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: { 
      GET: vi.fn(),
      POST: vi.fn()
    },
    auth: vi.fn().mockResolvedValue({
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'test-tenant',
        role: 'user',
      },
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

// Mock Prisma Client
vi.mock('@/lib/db', () => ({
  prisma: {
    tenantSubscription: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    moduleDefinition: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    subscriptionEvent: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    aiActivity: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    $metrics: {
      histogram: vi.fn(),
      counter: vi.fn(),
    },
  },
}))

// Mock Redis client
vi.mock('@/lib/redis/client', () => {
  const mockPipeline = {
    get: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    setex: vi.fn().mockReturnThis(),
    del: vi.fn().mockReturnThis(),
    expire: vi.fn().mockReturnThis(),
    incr: vi.fn().mockReturnThis(),
    decr: vi.fn().mockReturnThis(),
    hset: vi.fn().mockReturnThis(),
    hget: vi.fn().mockReturnThis(),
    hdel: vi.fn().mockReturnThis(),
    sadd: vi.fn().mockReturnThis(),
    smembers: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([
      [null, 1], // incr result
      [null, 1], // expire result  
      [null, '1'] // get result
    ]),
  }
  
  const mockRedisClient = {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1),
    decr: vi.fn().mockResolvedValue(0),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(-1),
    keys: vi.fn().mockResolvedValue([]),
    hset: vi.fn().mockResolvedValue(1),
    hget: vi.fn().mockResolvedValue(null),
    hdel: vi.fn().mockResolvedValue(1),
    sadd: vi.fn().mockResolvedValue(1),
    smembers: vi.fn().mockResolvedValue([]),
    pipeline: vi.fn().mockReturnValue(mockPipeline),
    multi: vi.fn().mockReturnValue(mockPipeline),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn().mockResolvedValue('OK'),
  }
  
  return {
    getRedis: vi.fn().mockReturnValue(mockRedisClient),
  }
})

// Mock unified cache
vi.mock('@/lib/cache/unified-cache', () => ({
  UnifiedCache: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    invalidatePattern: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock performance monitor
vi.mock('@/lib/performance-monitor', () => ({
  performanceMonitor: {
    trackDuration: vi.fn((name, fn) => fn()),
    trackAsync: vi.fn((name, fn) => fn()),
    getMetrics: vi.fn().mockReturnValue([]),
    reset: vi.fn(),
  },
}))

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      del: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
      list: vi.fn(),
    },
    products: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      list: vi.fn(),
    },
    prices: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      list: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
        expire: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhookEndpoints: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      del: vi.fn(),
      list: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}))

// Mock module access service
vi.mock('@/lib/module-access', () => ({
  moduleAccessService: {
    checkAccess: vi.fn().mockResolvedValue(true),
    getEnabledModules: vi.fn().mockResolvedValue(['crm', 'accounting', 'hr']),
    isModuleEnabled: vi.fn().mockResolvedValue(true),
  },
}))

// Mock auth.ts exports
vi.mock('@/lib/auth', () => ({
  handlers: { 
    GET: vi.fn(),
    POST: vi.fn()
  },
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      tenantId: 'test-tenant',
      role: 'user',
      permissions: [],
    },
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Test AI response',
              role: 'assistant',
            },
          }],
        }),
      },
    },
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{
          embedding: Array(1536).fill(0),
        }],
      }),
    },
  })),
}))

// Mock bundle orchestrator
vi.mock('@/lib/ai/bundle-orchestrator', () => ({
  BundleOrchestrator: vi.fn().mockImplementation(() => ({
    executeAIFlow: vi.fn().mockResolvedValue({ success: true, result: {} }),
    getBundleCapabilities: vi.fn().mockResolvedValue(['capability1', 'capability2']),
    getOptimalWorkflow: vi.fn().mockReturnValue({ workflow: 'optimized', bundles: [] }),
  })),
}))

// Global test setup
beforeAll(() => {
  // Mock global fetch
  global.fetch = vi.fn()
  
  // Mock window object
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }))
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Global teardown
afterAll(() => {
  vi.restoreAllMocks()
})
