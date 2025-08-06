# CoreFlow360 - Multi-Industry AI-Powered CRM

## Project Context
- **Framework**: Next.js 15.4.5 (App Router) + TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM (multi-tenant architecture)
- **UI**: Tailwind CSS only - no heavy UI libraries
- **Auth**: NextAuth.js (not yet implemented)
- **State**: React built-ins only (useState/useContext)

## Critical Architecture Rules
- Multi-tenant with industry-specific configurations
- Zero-trust security model - every request must be validated
- Industry logic must be data-driven, NOT hardcoded
- AI-first design - every feature should have AI integration points
- Performance target: sub-millisecond response times

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client

## Code Standards
- Max 300 lines per file - split large components
- TypeScript strict mode - no `any` types
- Components: PascalCase (`IndustryToggle.tsx`)
- Files: kebab-case or PascalCase
- Imports: Absolute from `src/` (`import { Component } from 'src/components'`)

## Database Models
- **Core**: Tenant, User, Department, Customer, Deal, Project, Invoice
- **AI**: AIInsight, AIActivity, AIConversation, IndustryAIAgent
- **Industry**: IndustryCustomField, IndustryCustomerIntelligence, IndustryCompliance
- **System**: Communication, TimeEntry, AuditLog, SystemHealth

## Security Requirements
- Validate tenant isolation on EVERY query
- Use Prisma's row-level security
- Sanitize all user inputs
- Implement rate limiting
- Audit log all data modifications

## Performance Optimization
- Use React Server Components by default
- Implement proper caching strategies
- Lazy load heavy components
- Optimize database queries with proper indexes
- Use streaming for large data sets

## AI Integration Points
- Industry-specific AI agents for each vertical
- AI-powered insights generation
- Conversational AI for customer interactions
- Predictive analytics for deals/projects
- Automated compliance checking

## Error Handling
- Never expose internal errors to users
- Log errors with full context
- Implement proper error boundaries
- Use typed error responses
- Graceful degradation for AI features

## Testing Approach
- Unit tests for business logic
- Integration tests for API routes
- E2E tests for critical user flows
- Performance benchmarks for all endpoints
- Security testing for multi-tenant isolation

## Deployment
- Target: Vercel
- Environment: Separate dev/staging/prod
- Database: Use connection pooling
- Monitoring: Implement health checks
- Scaling: Design for 10x growth

## Current State
- ✅ Basic setup complete
- ❌ Database connection needed
- ❌ Authentication not implemented
- ❌ API routes need implementation
- ❌ Business logic pending

## Development Priorities
1. Set up database connection and run migrations
2. Implement authentication with tenant isolation
3. Create base API routes with security middleware
4. Build industry configuration system
5. Implement AI integration layer

## Common Pitfalls to Avoid
- Don't create separate codebases per industry
- Don't skip performance optimization
- Don't ignore TypeScript warnings
- Don't implement without tests
- Don't forget audit logging 