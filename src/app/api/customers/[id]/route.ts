import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { invalidateCustomerCache } from "@/lib/cache/cache-invalidation"
import { handleError, ErrorContext } from "@/lib/error-handler"
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { successResponse, notFoundResponse, authErrorResponse, validationErrorResponse } from "@/lib/api-response"
import { updateCustomerSchema } from "@/lib/schemas"
import { withAPIVersioning, responseTransformers } from "@/lib/api/with-versioning"
import { TenantSecureDatabase } from "@/lib/security/tenant-isolation"

async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: `/api/customers/${id}`,
      method: 'GET',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user?.tenantId) {
        return authErrorResponse("Authentication required")
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      const customer = await prisma.customer.findFirst({
        where: { 
          id: id,
          tenantId: session.user.tenantId 
        },
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
              email: true
            }
          }
        }
      })

      if (!customer) {
        return notFoundResponse("Customer not found")
      }

      return successResponse(customer)
    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.api)
}

async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: `/api/customers/${id}`,
      method: 'PUT',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user?.tenantId) {
        return authErrorResponse("Authentication required")
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      const body = await request.json()
      
      // Validate input
      const validationResult = updateCustomerSchema.safeParse(body)
      if (!validationResult.success) {
        return validationErrorResponse(validationResult.error.errors, "Invalid customer data")
      }

      const updateData = validationResult.data

      // Check if customer exists
      const existingCustomer = await prisma.customer.findFirst({
        where: { 
          id: id,
          tenantId: session.user.tenantId 
        }
      })

      if (!existingCustomer) {
        return notFoundResponse("Customer not found")
      }

      // Update customer using secure tenant-isolated operation
      const updateResult = await TenantSecureDatabase.update(
        prisma.customer,
        { 
          where: { id: id },
          data: updateData,
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
                email: true
              }
            }
          }
        },
        {
          tenantId: session.user.tenantId,
          userId: session.user.id,
          operation: 'UPDATE',
          entityType: 'customer',
          entityId: id
        }
      )

      if (!updateResult.success) {
        if (updateResult.securityViolation) {
          return authErrorResponse(updateResult.error || "Access denied")
        }
        throw new Error(updateResult.error || "Failed to update customer")
      }

      const customer = updateResult.data

      // Log the update
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'CUSTOMER',
          entityId: customer.id,
          oldValues: JSON.stringify(existingCustomer),
          newValues: JSON.stringify(customer),
          metadata: JSON.stringify({
            updatedBy: session.user.id,
            customerName: `${customer.firstName} ${customer.lastName}`
          }),
          tenantId: session.user.tenantId,
          userId: session.user.id
        }
      })

      // Invalidate cache
      await invalidateCustomerCache(customer.id, {
        tenantId: session.user.tenantId,
        userId: session.user.id
      })

      return successResponse(customer, "Customer updated successfully")
    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.api)
}

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: `/api/customers/${id}`,
      method: 'DELETE',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      const session = await auth()
      if (!session?.user?.tenantId) {
        return authErrorResponse("Authentication required")
      }

      context.userId = session.user.id
      context.tenantId = session.user.tenantId

      // Check if customer exists
      const existingCustomer = await prisma.customer.findFirst({
        where: { 
          id: id,
          tenantId: session.user.tenantId 
        }
      })

      if (!existingCustomer) {
        return notFoundResponse("Customer not found")
      }

      // Delete customer using secure tenant-isolated operation
      const deleteResult = await TenantSecureDatabase.delete(
        prisma.customer,
        { where: { id: id } },
        {
          tenantId: session.user.tenantId,
          userId: session.user.id,
          operation: 'DELETE',
          entityType: 'customer',
          entityId: id
        }
      )

      if (!deleteResult.success) {
        if (deleteResult.securityViolation) {
          return authErrorResponse(deleteResult.error || "Access denied")
        }
        throw new Error(deleteResult.error || "Failed to delete customer")
      }

      // Log the deletion
      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          entityType: 'CUSTOMER',
          entityId: id,
          oldValues: JSON.stringify(existingCustomer),
          newValues: null,
          metadata: JSON.stringify({
            deletedBy: session.user.id,
            customerName: `${existingCustomer.firstName} ${existingCustomer.lastName}`
          }),
          tenantId: session.user.tenantId,
          userId: session.user.id
        }
      })

      // Invalidate cache
      await invalidateCustomerCache(id, {
        tenantId: session.user.tenantId,
        userId: session.user.id
      })

      return successResponse({ id: id }, "Customer deleted successfully")
    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.api)
}

// Export versioned handlers
export const GET = withAPIVersioning(getHandler, {
  supportedVersions: ['v1', 'v2'],
  currentVersion: 'v2',
  transformResponse: (data, fromVersion, toVersion) => {
    if (fromVersion === 'v2' && toVersion === 'v1') {
      return responseTransformers.customerV2ToV1(data)
    }
    return data
  }
})

export const PUT = withAPIVersioning(putHandler, {
  supportedVersions: ['v1', 'v2'],
  currentVersion: 'v2',
  transformResponse: (data, fromVersion, toVersion) => {
    if (fromVersion === 'v2' && toVersion === 'v1') {
      return responseTransformers.customerV2ToV1(data)
    }
    return data
  }
})

export const DELETE = withAPIVersioning(deleteHandler, {
  supportedVersions: ['v1', 'v2'],
  currentVersion: 'v2'
})