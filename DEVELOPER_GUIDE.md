# CoreFlow360 Developer Guide

## Architecture Overview

CoreFlow360 is built as a modular, subscription-aware ERP platform with AI-first design principles.

### Tech Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe
- **AI/ML**: OpenAI GPT-4, Anthropic Claude
- **Caching**: Redis (optional)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

### Core Architecture Principles

1. **Multi-tenant**: Every query includes tenant isolation
2. **Subscription-aware**: Features dynamically enabled based on active modules
3. **AI-first**: Every feature has AI integration points
4. **Event-driven**: Modules communicate through events
5. **Security-first**: Zero-trust architecture with comprehensive validation

## Project Structure

```
coreflow360/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Base data seeding
│   └── seed-modules.ts            # Module definitions
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── auth/              # Authentication
│   │   │   ├── ai/                # AI orchestration
│   │   │   ├── pricing/           # Subscription pricing
│   │   │   ├── stripe/            # Payment processing
│   │   │   └── health/            # Health checks
│   │   ├── demo/                  # Interactive demos
│   │   └── dashboard/             # Main application
│   ├── components/                # React components
│   │   ├── subscription/          # Module management UI
│   │   ├── dashboard/             # Dashboard widgets
│   │   └── ui/                    # Base UI components
│   ├── ai/                        # AI orchestration layer
│   │   ├── orchestration/         # Core AI coordination
│   │   └── interfaces/            # AI service interfaces
│   ├── services/                  # Business logic
│   │   ├── subscription/          # Module management
│   │   ├── events/                # Event bus system
│   │   └── workflows/             # Cross-module workflows
│   ├── middleware/                # Security middleware
│   ├── utils/                     # Performance utilities
│   └── __tests__/                 # Test suites
├── scripts/                       # Deployment scripts
└── docs/                          # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18.17.0+
- PostgreSQL 14+
- Redis (optional)

### Development Setup

1. **Clone and Install**:
   ```bash
   git clone <repository>
   cd coreflow360
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Database Setup**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run db:seed:modules
   ```

4. **Start Development**:
   ```bash
   npm run dev
   ```

### Development Commands

```bash
# Development
npm run dev                        # Start dev server
npm run build                      # Production build
npm run start                      # Start production server

# Database
npx prisma studio                  # Database GUI
npx prisma migrate dev             # Run migrations
npx prisma generate                # Generate client
npm run db:seed                    # Seed base data
npm run db:seed:modules            # Seed modules

# Testing
npm run test                       # Run tests
npm run test:watch                 # Watch mode
npm run test:coverage              # Coverage report
npm run test:subscription          # Module-specific tests

# Code Quality
npm run lint                       # ESLint
npm run typecheck                  # TypeScript check
```

## Core Concepts

### 1. Multi-Tenant Architecture

Every database query must include tenant isolation:

```typescript
// ❌ Wrong - no tenant isolation
const customers = await prisma.customer.findMany()

// ✅ Correct - tenant isolated
const customers = await prisma.customer.findMany({
  where: { tenantId }
})
```

### 2. Subscription-Aware Components

Components adapt to active modules:

```tsx
import { useModuleAccess } from '@/hooks/useModuleAccess'

function CustomerDashboard() {
  const { hasModule, hasFeature } = useModuleAccess()
  
  return (
    <div>
      {hasModule('crm') && <CustomerList />}
      {hasModule('accounting') && <InvoiceWidget />}
      {hasFeature('crm', 'ai-insights') && <CustomerIntelligence />}
    </div>
  )
}
```

### 3. AI Orchestration

AI capabilities scale with subscription level:

```typescript
import { orchestrateAI } from '@/ai/orchestration'

const result = await orchestrateAI({
  task: 'analyze customer data',
  tenantId,
  modules: ['crm', 'accounting'], // Available modules
  context: { customerId: '123' }
})
```

### 4. Event-Driven Communication

Modules communicate through events:

```typescript
import { eventBus } from '@/services/events'

// Publish event
eventBus.publish({
  type: 'deal.won',
  sourceModule: 'crm',
  data: { dealId, amount, customerId },
  tenantId
})

// Subscribe to events
eventBus.subscribe('deal.won', 'accounting', async (event) => {
  await createInvoiceFromDeal(event.data)
})
```

## Database Schema

### Core Models

```prisma
model Tenant {
  id          String @id @default(cuid())
  name        String
  domain      String @unique
  createdAt   DateTime @default(now())
  
  // Relations
  users       User[]
  subscription TenantSubscription?
}

model TenantSubscription {
  id              String @id @default(cuid())
  tenantId        String @unique
  activeModules   Json   @default("{\"crm\": true}")
  subscriptionTier String @default("basic")
  status          String @default("active")
  
  tenant          Tenant @relation(fields: [tenantId], references: [id])
}

model Customer {
  id          String @id @default(cuid())
  tenantId    String // Always required for isolation
  name        String
  email       String
  
  // AI fields
  aiScore     Float?
  aiChurnRisk Float?
  
  tenant      Tenant @relation(fields: [tenantId], references: [id])
}
```

### Adding New Models

1. **Always include `tenantId`**:
   ```prisma
   model NewModel {
     id       String @id @default(cuid())
     tenantId String
     // ... other fields
     
     tenant   Tenant @relation(fields: [tenantId], references: [id])
     @@index([tenantId])
   }
   ```

2. **Create migration**:
   ```bash
   npx prisma migrate dev --name add_new_model
   ```

## API Development

### Route Structure

```typescript
// src/app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const customers = await prisma.customer.findMany({
    where: { tenantId: session.user.tenantId }
  })
  
  return NextResponse.json({ customers })
}
```

### Subscription Validation

```typescript
import { hasModuleAccess } from '@/services/subscription'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  const { tenantId } = session.user
  
  // Check module access
  const hasAccess = await hasModuleAccess(tenantId, 'crm')
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Module not available in subscription' },
      { status: 403 }
    )
  }
  
  // Proceed with CRM operation
}
```

### Error Handling

```typescript
import { ApiError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    // API logic here
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    // Log unexpected errors
    console.error('Unexpected API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Component Development

### Subscription-Aware Components

```tsx
import { useModuleAccess } from '@/hooks/useModuleAccess'

function FeatureComponent() {
  const { hasModule, hasFeature, requiresUpgrade } = useModuleAccess()
  
  if (!hasModule('crm')) {
    return <ModuleUnavailable module="crm" />
  }
  
  if (requiresUpgrade('crm', 'ai-insights')) {
    return <UpgradePrompt feature="AI Insights" />
  }
  
  return (
    <div>
      {/* Feature content */}
      {hasFeature('crm', 'advanced-reports') && (
        <AdvancedReportsWidget />
      )}
    </div>
  )
}
```

### AI-Enhanced Components

```tsx
import { useAI } from '@/hooks/useAI'

function CustomerInsights({ customerId }) {
  const { analyze, loading, result } = useAI()
  
  const analyzeCustomer = async () => {
    await analyze({
      task: 'customer-intelligence',
      context: { customerId },
      modules: ['crm', 'accounting']
    })
  }
  
  return (
    <Card>
      <CardHeader>
        <h3>Customer Insights</h3>
        <Button onClick={analyzeCustomer} disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </Button>
      </CardHeader>
      {result && (
        <CardContent>
          <InsightResults data={result} />
        </CardContent>
      )}
    </Card>
  )
}
```

## AI Development

### Creating AI Agents

```typescript
// src/ai/agents/customer-intelligence.ts
import { AIAgent } from '@/ai/interfaces'

export class CustomerIntelligenceAgent implements AIAgent {
  requiredModules = ['crm']
  capabilities = ['churn-prediction', 'lifetime-value']
  
  async execute(task: string, context: any, tenantId: string) {
    // Validate module access
    const hasAccess = await this.validateAccess(tenantId)
    if (!hasAccess) throw new Error('Insufficient subscription')
    
    // Load customer data
    const customer = await this.loadCustomerData(context.customerId, tenantId)
    
    // Execute AI analysis
    const analysis = await this.analyzeCustomer(customer)
    
    return {
      predictions: analysis.churnRisk,
      recommendations: analysis.actions,
      confidence: analysis.confidence
    }
  }
}
```

### Orchestration Integration

```typescript
// Register agent in orchestrator
import { orchestrator } from '@/ai/orchestration'
import { CustomerIntelligenceAgent } from '@/ai/agents'

orchestrator.registerAgent('customer-intelligence', new CustomerIntelligenceAgent())
```

## Testing

### Unit Tests

```typescript
// src/__tests__/api/customers.test.ts
import { describe, it, expect, vi } from 'vitest'
import { GET } from '@/app/api/customers/route'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => ({
    user: { tenantId: 'tenant-123' }
  }))
}))

describe('/api/customers', () => {
  it('should return customers for tenant', async () => {
    const request = new Request('http://localhost/api/customers')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.customers).toBeDefined()
  })
})
```

### Integration Tests

```typescript
// src/__tests__/integration/subscription-flow.test.ts
import { describe, it, expect } from 'vitest'
import { testClient } from '@/lib/test-utils'

describe('Subscription Flow', () => {
  it('should activate modules and update AI capabilities', async () => {
    // Activate modules
    const activationResponse = await testClient.post('/api/subscription/activate', {
      modules: ['crm', 'accounting'],
      tenantId: 'test-tenant'
    })
    
    expect(activationResponse.status).toBe(200)
    
    // Verify AI capabilities updated
    const aiResponse = await testClient.get('/api/ai/agents')
    const { agents } = await aiResponse.json()
    
    expect(agents).toContainEqual(
      expect.objectContaining({
        id: 'financial-analyst',
        requiredModules: ['accounting', 'crm']
      })
    )
  })
})
```

## Security Guidelines

### Input Validation

```typescript
import { z } from 'zod'
import { sanitizeInput } from '@/middleware/security'

const CustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional()
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Sanitize input
  const sanitized = sanitizeInput(body)
  
  // Validate schema
  const validated = CustomerSchema.parse(sanitized)
  
  // Use validated data
  const customer = await prisma.customer.create({
    data: { ...validated, tenantId }
  })
}
```

### Tenant Isolation

```typescript
// Always validate tenant access
async function validateTenantResource(resourceId: string, tenantId: string, model: string) {
  const resource = await prisma[model].findFirst({
    where: { id: resourceId, tenantId },
    select: { id: true }
  })
  
  if (!resource) {
    throw new Error('Resource not found or access denied')
  }
  
  return true
}
```

## Performance Guidelines

### Database Optimization

```typescript
// Use proper indexes and selective queries
const customers = await prisma.customer.findMany({
  where: { 
    tenantId,
    status: 'active' // Indexed field
  },
  select: {
    id: true,
    name: true,
    email: true
    // Only select needed fields
  },
  take: 50, // Limit results
  orderBy: { createdAt: 'desc' }
})
```

### Caching Strategy

```typescript
import { CacheManager } from '@/utils/performance'

const cache = new CacheManager()

async function getCachedCustomers(tenantId: string) {
  const cacheKey = CacheManager.generateKey('customers', tenantId)
  
  let customers = await cache.get(cacheKey)
  if (!customers) {
    customers = await prisma.customer.findMany({
      where: { tenantId }
    })
    await cache.set(cacheKey, customers, 300) // 5 minutes
  }
  
  return customers
}
```

## Deployment

### Environment Configuration

```typescript
// src/lib/env.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  
  // Validate required variables
  validate() {
    const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'STRIPE_SECRET_KEY']
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`)
      }
    }
  }
}
```

### Build Process

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  typescript: {
    // Fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // Fail build on ESLint errors
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
```

## Contributing Guidelines

### Code Style

1. **TypeScript**: Use strict mode, no `any` types
2. **Components**: PascalCase, max 300 lines
3. **Functions**: camelCase, single responsibility
4. **Files**: kebab-case or PascalCase

### Git Workflow

1. **Feature Branches**: `feature/module-activation-ui`
2. **Commit Messages**: `feat: add module activation component`
3. **Pull Requests**: Include tests and documentation
4. **Code Review**: Required before merge

### Adding New Modules

1. **Define Schema**: Add to `prisma/schema.prisma`
2. **Create Services**: Business logic in `src/services/`
3. **Add Components**: UI components in `src/components/`
4. **Register Module**: Update module definitions
5. **Add Tests**: Comprehensive test coverage
6. **Update Documentation**: Include in user guides

---

**Happy Coding!** 🚀

For technical questions: dev-support@coreflow360.com