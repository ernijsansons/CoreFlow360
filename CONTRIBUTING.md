# Contributing to CoreFlow360

Welcome to CoreFlow360! We're excited that you're interested in contributing to the world's first Autonomous Business Operating System (ABOS). This guide will help you get started quickly and ensure your contributions align with our project standards.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17.0 or higher
- **PostgreSQL** 15+ with TimescaleDB extension
- **Redis** 6.2+ (for caching and rate limiting)
- **Git** with conventional commit knowledge

### Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/coreflow360/coreflow360.git
   cd coreflow360
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database Setup**
   ```bash
   npm run db:deploy      # Run migrations
   npm run db:seed        # Seed development data
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to see the application.

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

### 2. Make Your Changes

Follow our coding standards:

- **TypeScript**: Strict mode enabled, no `any` types
- **Components**: Max 300 lines, use composition
- **Imports**: Use absolute paths (`@/lib/...`)
- **Error Handling**: Always use error boundaries
- **Testing**: Write tests for new features

### 3. Run Quality Checks

```bash
npm run lint          # ESLint validation
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests (optional)
npx tsc --noEmit     # TypeScript validation
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add consciousness evolution metrics"
# or
git commit -m "fix: resolve tenant isolation in customer API"
# or
git commit -m "docs: update API endpoint documentation"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title following conventional commit format
- Description of changes
- Reference to any related issues
- Screenshots for UI changes

## 🏗️ Architecture Overview

### Core Principles

1. **Consciousness-Driven Architecture**: Every module contributes to business consciousness
2. **Multi-Tenant Isolation**: Strict data boundaries between tenants
3. **Performance First**: Sub-100ms response times
4. **Security by Default**: Zero-trust security model

### Directory Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   └── (authenticated)/   # Protected pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── consciousness/    # Consciousness system UI
├── lib/                   # Business logic
│   ├── ai/               # AI orchestration
│   ├── auth/             # Authentication
│   └── consciousness/    # Core consciousness engine
├── consciousness/         # Consciousness system core
└── __tests__/            # Test files
```

### Key Technologies

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with TimescaleDB
- **Authentication**: NextAuth.js
- **AI**: OpenAI, Anthropic, LangChain
- **Testing**: Vitest, Playwright

## 🧪 Testing Guidelines

### Test Types

1. **Unit Tests** (`*.test.ts`)
   ```typescript
   describe('ConsciousnessEngine', () => {
     it('should calculate intelligence multiplier correctly', () => {
       const result = calculateMultiplier(['crm', 'accounting'])
       expect(result).toBe(2.83) // 2^1.5
     })
   })
   ```

2. **Integration Tests** (`*.integration.test.ts`)
   ```typescript
   it('should enforce tenant isolation in API calls', async () => {
     const response = await fetch('/api/customers', {
       headers: { 'x-tenant-id': 'tenant-123' }
     })
     expect(response.status).toBe(200)
   })
   ```

3. **E2E Tests** (`*.e2e.test.ts`)
   ```typescript
   test('complete subscription upgrade flow', async ({ page }) => {
     await page.goto('/subscription')
     await page.click('button:has-text("Upgrade to Synaptic")')
     // ... test steps
   })
   ```

### Running Tests

```bash
npm run test              # All unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # E2E tests
```

## 🔒 Security Guidelines

### Required Security Practices

1. **Input Validation**: Always validate and sanitize user input
2. **SQL Injection Prevention**: Use Prisma's parameterized queries
3. **XSS Prevention**: Sanitize all rendered content
4. **CSRF Protection**: Use NextAuth CSRF tokens
5. **Rate Limiting**: Implement on all public endpoints
6. **Tenant Isolation**: Always filter by tenantId

### Security Checklist

- [ ] No hardcoded secrets or API keys
- [ ] All endpoints have authentication
- [ ] Tenant context validated on every request
- [ ] Input validation on all forms
- [ ] Error messages don't expose sensitive data

## 📝 Code Style Guide

### TypeScript

```typescript
// ✅ Good
interface CustomerData {
  id: string
  name: string
  tenantId: string
}

async function createCustomer(data: CustomerData): Promise<Customer> {
  // Implementation
}

// ❌ Bad
async function createCustomer(data: any) {
  // No type safety
}
```

### React Components

```typescript
// ✅ Good - Clear props interface
interface DashboardProps {
  user: User
  metrics: Metrics
  onRefresh: () => void
}

export function Dashboard({ user, metrics, onRefresh }: DashboardProps) {
  // Component logic
}

// ❌ Bad - No prop types
export function Dashboard(props) {
  // Unclear interface
}
```

### Error Handling

```typescript
// ✅ Good
try {
  const result = await riskyOperation()
  return { success: true, data: result }
} catch (error) {
  logger.error('Operation failed', { error, context })
  return { success: false, error: 'Operation failed' }
}

// ❌ Bad
try {
  return await riskyOperation()
} catch (e) {
  console.log(e) // Don't use console.log
  throw e // Don't expose internal errors
}
```

## 🚀 Performance Guidelines

### Frontend Performance

- Use React Server Components by default
- Implement lazy loading for heavy components
- Optimize images with Next.js Image component
- Bundle split by route automatically

### Backend Performance

- Use database connection pooling
- Implement Redis caching for frequent queries
- Batch database operations where possible
- Monitor query performance with logging

### Monitoring

```typescript
// Use performance monitoring
const perfMonitor = PerformanceMonitor.getInstance()
const operation = perfMonitor.startOperation('createCustomer')
try {
  // ... operation logic
} finally {
  operation.end()
}
```

## 📚 Documentation Standards

### Code Documentation

```typescript
/**
 * Calculates the consciousness intelligence multiplier based on active modules
 * @param modules - Array of active module IDs
 * @param tier - Current consciousness tier
 * @returns Intelligence multiplier value
 * @example
 * const multiplier = calculateIntelligenceMultiplier(['crm', 'accounting'], 'synaptic')
 * // Returns: 2.83
 */
export function calculateIntelligenceMultiplier(
  modules: string[],
  tier: ConsciousnessTier
): number {
  // Implementation
}
```

### API Documentation

Document all API endpoints in `src/lib/api-docs/`:

```typescript
/**
 * @route GET /api/customers
 * @description Get all customers for the authenticated tenant
 * @access Private
 * @returns {Customer[]} Array of customers
 * @example
 * GET /api/customers
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "customers": [...],
 *   "total": 150,
 *   "page": 1
 * }
 */
```

## 🐛 Debugging Tips

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check PostgreSQL is running
   pg_ctl status
   # Verify connection string
   echo $DATABASE_URL
   ```

2. **TypeScript Errors**
   ```bash
   # Clear TypeScript cache
   rm -rf .next
   npm run build
   ```

3. **Test Failures**
   ```bash
   # Run specific test file
   npm run test src/__tests__/specific.test.ts
   # Debug mode
   npm run test:ui
   ```

### Debugging Tools

- **React DevTools**: For component debugging
- **Redux DevTools**: For state management
- **Network Tab**: For API debugging
- **Sentry**: For production error tracking

## 🤝 Getting Help

### Resources

- **Documentation**: `/docs` directory
- **API Reference**: `API_DOCUMENTATION.md`
- **Architecture**: `DEVELOPER_GUIDE.md`
- **Discord**: Join our developer community
- **GitHub Issues**: Report bugs or request features

### Contact

- **Technical Questions**: tech@coreflow360.com
- **Security Issues**: security@coreflow360.com (please don't create public issues)
- **General Inquiries**: hello@coreflow360.com

## 📜 License

By contributing to CoreFlow360, you agree that your contributions will be licensed under the project's license terms.

---

Thank you for contributing to CoreFlow360! Together, we're building the future of autonomous business operations. 🚀