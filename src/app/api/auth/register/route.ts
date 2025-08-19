import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'
import { z } from 'zod'
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  errorResponse,
} from '@/lib/api-response'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(1, 'Company name is required'),
  industryType: z
    .enum([
      'GENERAL',
      'HVAC',
      'LEGAL',
      'MANUFACTURING',
      'HEALTHCARE',
      'FINANCE',
      'REAL_ESTATE',
      'CONSTRUCTION',
      'CONSULTING',
      'RETAIL',
      'EDUCATION',
    ])
    .default('GENERAL'),
  invitationCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return validationErrorResponse(
        [{ message: 'User with this email already exists', path: ['email'] }],
        'User already exists'
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(validatedData.password, 12)

    // Generate unique slug
    const baseSlug = validatedData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    let slug = baseSlug
    let counter = 1

    // Ensure slug is unique
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create tenant and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.companyName,
          domain: `${slug}.coreflow360.com`,
          slug,
          industryType: validatedData.industryType,
          subscriptionStatus: 'TRIAL',
          enabledModules: JSON.stringify({ crm: true }), // Start with CRM module
        },
      })

      // Create default department
      const department = await tx.department.create({
        data: {
          name: 'Administration',
          code: 'ADMIN',
          tenantId: tenant.id,
        },
      })

      // Create user as admin
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          tenantId: tenant.id,
          departmentId: department.id,
          role: 'ADMIN', // First user is admin
          status: 'ACTIVE',
          permissions: JSON.stringify([
            'tenant:read',
            'tenant:update',
            'users:read',
            'users:create',
            'users:update',
            'customers:*',
            'deals:*',
            'projects:*',
            'reports:read',
          ]),
        },
      })

      // Create legacy subscription for compatibility
      await tx.legacyTenantSubscription.create({
        data: {
          tenantId: tenant.id,
          subscriptionTier: 'trial',
          activeModules: JSON.stringify({ crm: true }),
          status: 'active',
          userCount: 1,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          billingCycle: 'monthly',
        },
      })

      // Log the registration
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          action: 'CREATE',
          entityType: 'tenant',
          entityId: tenant.id,
          newValues: JSON.stringify({
            companyName: validatedData.companyName,
            industryType: validatedData.industryType,
            registrationMethod: 'self_signup',
          }),
        },
      })

      return { tenant, user, department }
    })

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = result.user

    return createdResponse(
      {
        user: userWithoutPassword,
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          industryType: result.tenant.industryType,
        },
        trial: {
          daysRemaining: 14,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      },
      'Account created successfully! You can now sign in.'
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors, 'Invalid registration data')
    }

    return errorResponse(error as Error)
  }
}
