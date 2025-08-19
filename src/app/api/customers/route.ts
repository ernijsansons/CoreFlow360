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
import { withSanitization, validators } from '@/middleware/sanitization'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import {
  successResponse,
  paginatedResponse,
  createdResponse,
  authErrorResponse,
  validationErrorResponse,
} from '@/lib/api-response'
import { createCustomerSchema, customerQuerySchema } from '@/lib/schemas'
import { redis } from '@/lib/redis'
import { invalidateCustomerCache } from '@/lib/cache/cache-invalidation'
import { withAPIVersioning, responseTransformers } from '@/lib/api/with-versioning'
import { withIdempotency } from '@/middleware/idempotency'
import { createCustomerTransaction } from '@/lib/db/transaction-manager'
import { eventStore } from '@/lib/events/event-store'
import { EVENT_TYPES } from '@/lib/events/domain-events'
import {
  traceDatabaseOperation,
  traceBusinessOperation,
  trackUserActivity,
  trackError,
  apiTelemetryMiddleware,
} from '@/middleware/telemetry'

async function getHandler(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const context: ErrorContext = {
        endpoint: '/api/customers',
        method: 'GET',
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
        requestId: request.headers.get('x-request-id') || undefined,
      }

      try {
        const session = await auth()
        if (!session?.user?.tenantId) {
          return authErrorResponse('Authentication required')
        }

        context.userId = session.user.id
        context.tenantId = session.user.tenantId

        // Add query parameters for filtering and pagination
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 per page
        const search = searchParams.get('search') || undefined
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
        const status = searchParams.get('status') || undefined

        // Validate sort field to prevent injection
        const allowedSortFields = ['firstName', 'lastName', 'email', 'createdAt', 'updatedAt']
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'

        // Build where clause
        const where: {
          tenantId: string
          status?: string
          OR?: Array<{
            firstName?: { contains: string; mode: 'insensitive' }
            lastName?: { contains: string; mode: 'insensitive' }
            email?: { contains: string; mode: 'insensitive' }
          }>
        } = { tenantId: session.user.tenantId }

        // Add status filter if provided
        if (status && status !== 'ALL') {
          where.status = status
        }

        if (search) {
          where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        }

        // Get total count for pagination with tracing
        const totalCount = await traceDatabaseOperation(
          'customers.count',
          () => prisma.customer.count({ where }),
          {
            table: 'customer',
            operation_type: 'select',
            tenantId: session.user.tenantId,
          }
        )

        // Get customers with pagination with tracing
        const customers = await traceDatabaseOperation(
          'customers.findMany',
          () =>
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
                company: true,
                industry: true,
                status: true,
                source: true,
                totalRevenue: true,
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
          {
            table: 'customer',
            operation_type: 'select',
            tenantId: session.user.tenantId,
          }
        )

        // Track user activity
        trackUserActivity('customers_listed', session.user.id, session.user.tenantId, {
          page,
          limit,
          search: search || null,
          resultsCount: customers.length,
        })

        return paginatedResponse(customers, { page, limit, totalCount })
      } catch (error) {
        // Track error with telemetry
        trackError(error, {
          operation: 'customers_list',
          entityType: 'customer',
          userId: context.userId,
          tenantId: context.tenantId,
          endpoint: '/api/customers',
        })

        return handleError(error, context)
      }
    },
    RATE_LIMITS.api
  )
}

async function postHandler(request: NextRequest) {
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
          return authErrorResponse('Authentication required')
        }

        context.userId = session.user.id
        context.tenantId = session.user.tenantId

        const body = await request.json()

        // Validate input (sanitization is done by middleware)
        const validationResult = createCustomerSchema.safeParse(body)
        if (!validationResult.success) {
          return validationErrorResponse(validationResult.error.errors, 'Invalid customer data')
        }

        const customerData = validationResult.data

        // Use transactional customer creation with tracing
        const customer = await traceBusinessOperation(
          'customer.create',
          () => createCustomerTransaction(customerData, session.user.tenantId, session.user.id),
          {
            entityType: 'customer',
            operationType: 'create',
            tenantId: session.user.tenantId,
            userId: session.user.id,
          }
        )

        // Invalidate cache for customer lists
        await invalidateCustomerCache(customer.id, {
          tenantId: session.user.tenantId,
          userId: session.user.id,
        })

        // Track successful customer creation
        trackUserActivity('customer_created', session.user.id, session.user.tenantId, {
          customerId: customer.id,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          customerEmail: customerData.email,
        })

        return createdResponse(customer, 'Customer created successfully')
      } catch (error) {
        // Track error with telemetry
        trackError(error, {
          operation: 'customer_create',
          entityType: 'customer',
          userId: context.userId,
          tenantId: context.tenantId,
          endpoint: '/api/customers',
        })

        return handleError(error, context)
      }
    },
    RATE_LIMITS.api
  )
}

// Export versioned handlers with telemetry
export const GET = apiTelemetryMiddleware(
  withAPIVersioning(getHandler, {
    supportedVersions: ['v1', 'v2'],
    currentVersion: 'v2',
    transformResponse: (data, fromVersion, toVersion) => {
      // Transform v2 responses to v1 format for backward compatibility
      if (fromVersion === 'v2' && toVersion === 'v1') {
        if (data.data && Array.isArray(data.data)) {
          return {
            ...data,
            data: responseTransformers.customerV2ToV1(data.data),
            pagination: data.meta
              ? responseTransformers.paginationV2ToV1(data).pagination
              : undefined,
            meta: undefined,
          }
        }
        return responseTransformers.customerV2ToV1(data)
      }
      return data
    },
  }),
  {
    traceRequests: true,
    collectMetrics: true,
  }
)

export const POST = apiTelemetryMiddleware(
  withAPIVersioning(
    withIdempotency(postHandler, {
      ttlMinutes: 60,
      methods: ['POST'],
    }),
    {
      supportedVersions: ['v1', 'v2'],
      currentVersion: 'v2',
      transformResponse: (data, fromVersion, toVersion) => {
        if (fromVersion === 'v2' && toVersion === 'v1') {
          return responseTransformers.customerV2ToV1(data)
        }
        return data
      },
    }
  ),
  {
    traceRequests: true,
    collectMetrics: true,
  }
)
