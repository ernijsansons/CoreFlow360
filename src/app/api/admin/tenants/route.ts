/**
 * CoreFlow360 - Admin Tenants API
 * API endpoints for tenant management by super administrators
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, ApiContext } from '@/lib/api-wrapper'
import { createAuthzError, createValidationError } from '@/lib/error-handler'
import { prisma } from '@/lib/db'

const createTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  domain: z.string().optional(),
  industryType: z.enum(['GENERAL', 'HVAC', 'LEGAL', 'MANUFACTURING', 'HEALTHCARE', 'FINANCE', 'REAL_ESTATE', 'CONSTRUCTION', 'CONSULTING', 'RETAIL', 'EDUCATION']).default('GENERAL'),
  subscriptionTier: z.enum(['trial', 'basic', 'professional', 'enterprise']).default('trial'),
  maxUsers: z.number().min(1).default(5),
  enabledModules: z.array(z.string()).default(['crm'])
})

const updateTenantSchema = createTenantSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional(),
  subscriptionStatus: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED']).optional()
})

const handleGET = async (context: ApiContext): Promise<NextResponse> => {
  const { user } = context

  // Only super admins can manage all tenants
  if (user.role !== 'SUPER_ADMIN') {
    throw createAuthzError('Super admin access required')
  }

  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          users: true,
          departments: true
        }
      },
      subscription: {
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          activeModules: true,
          userCount: true,
          currentPeriodEnd: true,
          nextBillingDate: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const transformedTenants = tenants.map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    domain: tenant.domain,
    industryType: tenant.industryType,
    isActive: tenant.isActive,
    subscriptionStatus: tenant.subscriptionStatus,
    createdAt: tenant.createdAt,
    userCount: tenant._count.users,
    departmentCount: tenant._count.departments,
    subscription: tenant.subscription ? {
      tier: tenant.subscription.subscriptionTier,
      status: tenant.subscription.subscriptionStatus,
      activeModules: JSON.parse(tenant.subscription.activeModules || '{}'),
      userLimit: tenant.subscription.userCount,
      billingDate: tenant.subscription.nextBillingDate,
      periodEnd: tenant.subscription.currentPeriodEnd
    } : null
  }))

  return NextResponse.json({
    success: true,
    tenants: transformedTenants,
    total: tenants.length
  })
}

const handlePOST = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user } = context

  // Only super admins can create tenants
  if (user.role !== 'SUPER_ADMIN') {
    throw createAuthzError('Super admin access required')
  }

  const body = await request.json()
  const validatedData = createTenantSchema.parse(body)

  // Generate unique slug
  const baseSlug = validatedData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
  let slug = baseSlug
  let counter = 1
  
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Create tenant with subscription in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create tenant
    const tenant = await tx.tenant.create({
      data: {
        name: validatedData.name,
        domain: validatedData.domain || `${slug}.coreflow360.com`,
        slug,
        industryType: validatedData.industryType,
        subscriptionStatus: 'TRIAL',
        enabledModules: JSON.stringify(
          validatedData.enabledModules.reduce((acc, module) => ({ ...acc, [module]: true }), {})
        )
      }
    })

    // Create default department
    await tx.department.create({
      data: {
        name: 'Administration',
        code: 'ADMIN',
        tenantId: tenant.id
      }
    })

    // Create subscription
    await tx.tenantSubscription.create({
      data: {
        tenantId: tenant.id,
        subscriptionTier: validatedData.subscriptionTier,
        subscriptionStatus: 'ACTIVE',
        activeModules: JSON.stringify(
          validatedData.enabledModules.reduce((acc, module) => ({ ...acc, [module]: true }), {})
        ),
        userCount: validatedData.maxUsers,
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    return tenant
  })

  // Log the tenant creation
  await prisma.auditLog.create({
    data: {
      tenantId: result.id,
      userId: user.id,
      action: 'CREATE',
      entityType: 'tenant',
      entityId: result.id,
      newValues: JSON.stringify({
        name: result.name,
        industryType: result.industryType,
        subscriptionTier: validatedData.subscriptionTier
      })
    }
  })

  return NextResponse.json({
    success: true,
    tenant: result
  }, { status: 201 })
}

const handlePUT = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user } = context

  // Only super admins can update tenants
  if (user.role !== 'SUPER_ADMIN') {
    throw createAuthzError('Super admin access required')
  }

  const body = await request.json()
  const validatedData = updateTenantSchema.parse(body)

  // Find the tenant to update
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: validatedData.id }
  })

  if (!existingTenant) {
    throw createValidationError('Tenant not found')
  }

  // Prepare update data
  const updateData: any = {}
  if (validatedData.name) updateData.name = validatedData.name
  if (validatedData.domain) updateData.domain = validatedData.domain
  if (validatedData.industryType) updateData.industryType = validatedData.industryType
  if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
  if (validatedData.subscriptionStatus) updateData.subscriptionStatus = validatedData.subscriptionStatus

  if (validatedData.enabledModules) {
    updateData.enabledModules = JSON.stringify(
      validatedData.enabledModules.reduce((acc, module) => ({ ...acc, [module]: true }), {})
    )
  }

  // Update tenant
  const updatedTenant = await prisma.tenant.update({
    where: { id: validatedData.id },
    data: updateData
  })

  // Log the tenant update
  await prisma.auditLog.create({
    data: {
      tenantId: validatedData.id,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'tenant',
      entityId: validatedData.id,
      oldValues: JSON.stringify({
        name: existingTenant.name,
        isActive: existingTenant.isActive,
        subscriptionStatus: existingTenant.subscriptionStatus
      }),
      newValues: JSON.stringify({
        name: updatedTenant.name,
        isActive: updatedTenant.isActive,
        subscriptionStatus: updatedTenant.subscriptionStatus
      })
    }
  })

  return NextResponse.json({
    success: true,
    tenant: updatedTenant
  })
}

const handleDELETE = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user } = context

  // Only super admins can delete tenants
  if (user.role !== 'SUPER_ADMIN') {
    throw createAuthzError('Super admin access required')
  }

  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('id')

  if (!tenantId) {
    throw createValidationError('Tenant ID is required')
  }

  // Find the tenant to delete
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      users: true
    }
  })

  if (!existingTenant) {
    throw createValidationError('Tenant not found')
  }

  // Don't allow deleting tenant with active users
  if (existingTenant.users.some(u => u.status === 'ACTIVE')) {
    throw createValidationError('Cannot delete tenant with active users')
  }

  // Soft delete the tenant
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { 
      isActive: false,
      subscriptionStatus: 'CANCELLED'
    }
  })

  // Log the tenant deletion
  await prisma.auditLog.create({
    data: {
      tenantId: tenantId,
      userId: user.id,
      action: 'DELETE',
      entityType: 'tenant',
      entityId: tenantId,
      oldValues: JSON.stringify({
        name: existingTenant.name,
        subscriptionStatus: existingTenant.subscriptionStatus
      })
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Tenant deactivated successfully'
  })
}

// Get tenant statistics
const handleStats = async (context: ApiContext): Promise<NextResponse> => {
  const { user } = context

  if (user.role !== 'SUPER_ADMIN') {
    throw createAuthzError('Super admin access required')
  }

  const [
    totalTenants,
    activeTenants,
    trialTenants,
    subscriptionStats,
    recentActivity
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.tenant.count({ where: { subscriptionStatus: 'TRIAL' } }),
    prisma.tenantSubscription.groupBy({
      by: ['subscriptionTier'],
      _count: { id: true }
    }),
    prisma.auditLog.findMany({
      take: 10,
      where: { entityType: 'tenant' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        tenant: { select: { name: true } }
      }
    })
  ])

  return NextResponse.json({
    success: true,
    stats: {
      totalTenants,
      activeTenants,
      trialTenants,
      subscriptionTiers: subscriptionStats.reduce((acc: any, item) => {
        acc[item.subscriptionTier] = item._count.id
        return acc
      }, {}),
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        action: log.action,
        user: log.user?.name || 'System',
        tenant: log.tenant?.name || 'Unknown',
        timestamp: log.createdAt
      }))
    }
  })
}

// Export wrapped handlers
export const GET = withAuth(handleGET)
export const POST = withAuth(handlePOST)
export const PUT = withAuth(handlePUT)
export const DELETE = withAuth(handleDELETE)

// Export stats endpoint separately
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}