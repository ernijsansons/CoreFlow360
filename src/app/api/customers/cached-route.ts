import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import {
  handleError,
  handleValidationError,
  handleAuthError,
  handleNotFoundError,
  ErrorContext,
} from '@/lib/error-handler'
import { sanitizeInput } from '@/middleware/security'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { withCache, cachePresets, cacheInvalidation } from '@/lib/cache-middleware'
import { redis } from '@/lib/redis'

const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  industryType: z.string().max(50, 'Industry type too long').optional(),
  industryData: z.record(z.string(), z.unknown()).optional(),
})

// Cached GET handler
export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      return withCache(
        async (req) => {
          const context: ErrorContext = {
            endpoint: '/api/customers',
            method: 'GET',
            userAgent: req.headers.get('user-agent') || undefined,
            ip: req.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
            requestId: req.headers.get('x-request-id') || undefined,
          }

          try {
            const session = await auth()
            if (!session?.user?.tenantId) {
              return handleAuthError('Authentication required', context)
            }

            context.userId = session.user.id
            context.tenantId = session.user.tenantId

            // Add query parameters for filtering and pagination
            const searchParams = req.nextUrl.searchParams
            const page = parseInt(searchParams.get('page') || '1')
            const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
            const search = searchParams.get('search') || undefined
            const sortBy = searchParams.get('sortBy') || 'createdAt'
            const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

            // Generate cache key based on query params
            const cacheKey = `customers:list:${session.user.tenantId}:${page}:${limit}:${search || 'all'}:${sortBy}:${sortOrder}`

            // Try to get from cache first
            const cached = await redis.get(cacheKey, {
              tenantId: session.user.tenantId,
              ttl: 60, // 1 minute cache for customer lists
            })

            if (cached) {
              return NextResponse.json(cached)
            }

            // Validate sort field to prevent injection
            const allowedSortFields = ['firstName', 'lastName', 'email', 'createdAt', 'updatedAt']
            const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'

            // Build where clause
            const where: {
              tenantId: string
              OR?: Array<{
                firstName?: { contains: string; mode: 'insensitive' }
                lastName?: { contains: string; mode: 'insensitive' }
                email?: { contains: string; mode: 'insensitive' }
              }>
            } = { tenantId: session.user.tenantId }

            if (search) {
              where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ]
            }

            // Execute queries in parallel for better performance
            const [totalCount, customers] = await Promise.all([
              prisma.customer.count({ where }),
              prisma.customer.findMany({
                where,
                orderBy: { [validSortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  address: true,
                  createdAt: true,
                  updatedAt: true,
                  aiScore: true,
                  aiChurnRisk: true,
                  aiLifetimeValue: true,
                  assignee: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              }),
            ])

            const response = {
              success: true,
              data: customers,
              pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1,
              },
            }

            // Cache the response
            await redis.set(cacheKey, response, {
              tenantId: session.user.tenantId,
              ttl: 60, // 1 minute cache
            })

            return NextResponse.json(response)
          } catch (error) {
            return handleError(error, context)
          }
        },
        {
          ttl: 60,
          varyBy: ['tenantId', 'query'],
          revalidate: true,
          revalidateTime: 30,
        }
      )(request)
    },
    RATE_LIMITS.api
  )
}

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const context: ErrorContext = {
        endpoint: '/api/customers',
        method: 'POST',
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
        requestId: request.headers.get('x-request-id') || undefined,
      }

      try {
        const session = await auth()
        if (!session?.user?.tenantId) {
          return handleAuthError('Authentication required', context)
        }

        context.userId = session.user.id
        context.tenantId = session.user.tenantId

        const body = await request.json()

        // Sanitize and validate input
        const sanitized = sanitizeInput(body)
        const validated = createCustomerSchema.parse(sanitized)

        // Create customer with AI analysis
        const customer = await prisma.customer.create({
          data: {
            ...validated,
            tenantId: session.user.tenantId,
            createdById: session.user.id,
            // AI analysis would be triggered here
            aiScore: Math.random() * 100, // Placeholder
            aiChurnRisk: Math.random() < 0.3 ? 'LOW' : Math.random() < 0.7 ? 'MEDIUM' : 'HIGH',
            aiLifetimeValue: Math.random() * 10000,
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })

        // Invalidate customer list caches for this tenant
        await cacheInvalidation.endpoint('/api/customers', session.user.tenantId)

        // Log activity
        await prisma.activityLog.create({
          data: {
            tenantId: session.user.tenantId,
            userId: session.user.id,
            entityType: 'customer',
            entityId: customer.id,
            action: 'created',
            metadata: JSON.stringify({
              customerName: `${customer.firstName} ${customer.lastName}`,
            }),
          },
        })

        return NextResponse.json(
          {
            success: true,
            data: customer,
          },
          { status: 201 }
        )
      } catch (error) {
        if (error instanceof z.ZodError) {
          return handleValidationError(error, context)
        }
        return handleError(error, context)
      }
    },
    RATE_LIMITS.api
  )
}
