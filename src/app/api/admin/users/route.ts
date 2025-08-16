/**
 * CoreFlow360 - Admin Users API
 * API endpoints for user management by administrators
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, ApiContext } from '@/lib/api-wrapper'
import { createAuthzError, createValidationError } from '@/lib/error-handler'
import { prisma } from '@/lib/db'

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['USER', 'MANAGER', 'ADMIN']),
  departmentId: z.string().optional(),
  permissions: z.array(z.string()).optional()
})

const updateUserSchema = createUserSchema.partial().extend({
  id: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
})

const handleGET = async (context: ApiContext): Promise<NextResponse> => {
  const { user, tenantId } = context

  // Only admins can manage users
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw createAuthzError('Admin access required')
  }

  // Super admins can see all tenants' users, regular admins only their tenant
  const whereClause = user.role === 'SUPER_ADMIN' ? {} : { tenantId }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      department: {
        select: {
          name: true
        }
      },
      tenant: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const transformedUsers = users.map(user => ({
    ...user,
    department: user.department?.name || 'No Department'
  }))

  return NextResponse.json({
    success: true,
    users: transformedUsers,
    total: users.length
  })
}

const handlePOST = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user, tenantId } = context

  // Only admins can create users
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw createAuthzError('Admin access required')
  }

  const body = await request.json()
  const validatedData = createUserSchema.parse(body)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email }
  })

  if (existingUser) {
    throw createValidationError('User with this email already exists')
  }

  // Get default department if not specified
  let departmentId = validatedData.departmentId
  if (!departmentId) {
    const defaultDept = await prisma.department.findFirst({
      where: { tenantId, code: 'GENERAL' }
    })
    departmentId = defaultDept?.id
  }

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
      tenantId: tenantId!,
      departmentId,
      status: 'ACTIVE',
      permissions: JSON.stringify(validatedData.permissions || []),
      // Note: In production, you'd send an invitation email instead of creating with no password
      password: null
    },
    include: {
      department: {
        select: { name: true }
      },
      tenant: {
        select: { name: true, slug: true }
      }
    }
  })

  // Log the user creation
  await prisma.auditLog.create({
    data: {
      tenantId: tenantId!,
      userId: user.id,
      action: 'CREATE',
      entityType: 'user',
      entityId: newUser.id,
      newValues: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      })
    }
  })

  return NextResponse.json({
    success: true,
    user: {
      ...newUser,
      department: newUser.department?.name || 'No Department'
    }
  }, { status: 201 })
}

const handlePUT = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user, tenantId } = context

  // Only admins can update users
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw createAuthzError('Admin access required')
  }

  const body = await request.json()
  const validatedData = updateUserSchema.parse(body)

  // Find the user to update
  const existingUser = await prisma.user.findUnique({
    where: { id: validatedData.id }
  })

  if (!existingUser) {
    throw createValidationError('User not found')
  }

  // Regular admins can only update users in their tenant
  if (user.role !== 'SUPER_ADMIN' && existingUser.tenantId !== tenantId) {
    throw createAuthzError('Cannot modify users from other tenants')
  }

  // Prepare update data
  const updateData: any = {}
  if (validatedData.name) updateData.name = validatedData.name
  if (validatedData.email) updateData.email = validatedData.email
  if (validatedData.role) updateData.role = validatedData.role
  if (validatedData.status) updateData.status = validatedData.status
  if (validatedData.departmentId) updateData.departmentId = validatedData.departmentId
  if (validatedData.permissions) updateData.permissions = JSON.stringify(validatedData.permissions)

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: validatedData.id },
    data: updateData,
    include: {
      department: {
        select: { name: true }
      },
      tenant: {
        select: { name: true, slug: true }
      }
    }
  })

  // Log the user update
  await prisma.auditLog.create({
    data: {
      tenantId: existingUser.tenantId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'user',
      entityId: updatedUser.id,
      oldValues: JSON.stringify({
        name: existingUser.name,
        role: existingUser.role,
        status: existingUser.status
      }),
      newValues: JSON.stringify({
        name: updatedUser.name,
        role: updatedUser.role,
        status: updatedUser.status
      })
    }
  })

  return NextResponse.json({
    success: true,
    user: {
      ...updatedUser,
      department: updatedUser.department?.name || 'No Department'
    }
  })
}

const handleDELETE = async (context: ApiContext): Promise<NextResponse> => {
  const { request, user, tenantId } = context

  // Only super admins can delete users
  if (user.role !== 'SUPER_ADMIN') {
    throw createAuthzError('Super admin access required')
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id')

  if (!userId) {
    throw createValidationError('User ID is required')
  }

  // Find the user to delete
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!existingUser) {
    throw createValidationError('User not found')
  }

  // Don't allow deleting yourself
  if (existingUser.id === user.id) {
    throw createValidationError('Cannot delete your own account')
  }

  // Soft delete the user (set status to DELETED)
  await prisma.user.update({
    where: { id: userId },
    data: { 
      status: 'DELETED',
      email: `deleted-${Date.now()}-${existingUser.email}` // Prevent email conflicts
    }
  })

  // Log the user deletion
  await prisma.auditLog.create({
    data: {
      tenantId: existingUser.tenantId,
      userId: user.id,
      action: 'DELETE',
      entityType: 'user',
      entityId: userId,
      oldValues: JSON.stringify({
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      })
    }
  })

  return NextResponse.json({
    success: true,
    message: 'User deleted successfully'
  })
}

// Export wrapped handlers
export const GET = withAuth(handleGET)
export const POST = withAuth(handlePOST)
export const PUT = withAuth(handlePUT)
export const DELETE = withAuth(handleDELETE)