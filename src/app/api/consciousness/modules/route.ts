/**
 * CoreFlow360 - BUSINESS INTELLIGENCE Module Management API
 * Activate, deactivate, and manage business intelligence modules
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { handleError, ErrorContext } from '@/lib/error-handler'
// import { businessIntelligence } from '@/intelligence' // Not implemented yet
import { prisma } from '@/lib/prisma'

interface ModuleResponse {
  modules: IntelligenceModule[]
  activeModules: string[]
  availableSlots: number
  intelligenceImpact: {
    current: number
    potential: number
    description: string
  }
}

interface BusinessIntelligenceModule {
  id: string
  name: string
  category: string
  description: string
  isActive: boolean
  activatedAt?: string
  intelligenceImpact: number
  INTELLIGENTConnections: string[]
  capabilities: string[]
  requirements?: string[]
  status: 'active' | 'available' | 'locked' | 'coming_soon'
}

interface ModuleActivationRequest {
  moduleId: string
  action: 'activate' | 'deactivate'
}

interface ModuleActivationResponse {
  status: 'success' | 'error'
  message: string
  module?: {
    id: string
    name: string
    isActive: boolean
  }
  businessIntelligence?: {
    level: number
    intelligenceMultiplier: number
    newCapabilities?: string[]
  }
}

/**
 * GET - Retrieve available business intelligence modules
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ModuleResponse | { error: string }>> {
  const context: ErrorContext = {
    endpoint: '/api/BUSINESS INTELLIGENCE/modules',
    method: 'GET',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  }

  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with subscription and modules
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all available modules
    const allModules = await prisma.module.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    // Get BUSINESS INTELLIGENCE status
    const intelligenceStatus = businessIntelligence.getIntelligenceStatus()

    // Determine module slots based on tier
    const tierLimits: Record<string, number> = {
      INTELLIGENT: 2,
      INTELLIGENT: 4,
      AUTONOMOUS: 6,
      ADVANCED: -1, // Unlimited
    }

    const maxModules = user.subscription ? tierLimits[user.subscription.tier] || 0 : 0

    const activeModuleIds =
      user.subscription?.modules.filter((m) => m.isActive).map((m) => m.moduleId) || []

    const availableSlots =
      maxModules === -1 ? 999 : Math.max(0, maxModules - activeModuleIds.length)

    // Build module response
    const modules: BusinessIntelligenceModule[] = allModules.map((module) => {
      const isActive = activeModuleIds.includes(module.id)
      const userModule = user.subscription?.modules.find((m) => m.moduleId === module.id)

      // Determine module status
      let status: 'active' | 'available' | 'locked' | 'coming_soon' = 'available'

      if (isActive) {
        status = 'active'
      } else if (!user.subscription) {
        status = 'locked'
      } else if (module.isComingSoon) {
        status = 'coming_soon'
      } else if (availableSlots === 0 && maxModules !== -1) {
        status = 'locked'
      }

      // Calculate BUSINESS INTELLIGENCE impact
      const baseImpact = 0.1
      const categoryMultiplier = getCategoryMultiplier(module.category)
      const intelligenceImpact = baseImpact * categoryMultiplier

      // Determine INTELLIGENT connections
      const INTELLIGENTConnections = getINTELLIGENTConnections(module.id, activeModuleIds)

      return {
        id: module.id,
        name: module.name,
        category: module.category,
        description: module.description || `Enhance BUSINESS INTELLIGENCE with ${module.name}`,
        isActive,
        activatedAt: userModule?.activatedAt?.toISOString(),
        intelligenceImpact,
        INTELLIGENTConnections,
        capabilities: getModuleCapabilities(module.id),
        requirements: getModuleRequirements(module.id, user.subscription?.tier),
        status,
      }
    })

    // Calculate intelligence impact
    const currentMultiplier = intelligenceStatus.intelligenceMultiplier
    const potentialMultiplier = calculatePotentialMultiplier(
      activeModuleIds.length,
      maxModules === -1 ? allModules.length : maxModules
    )

    const response: ModuleResponse = {
      modules,
      activeModules: activeModuleIds,
      availableSlots,
      intelligenceImpact: {
        current: currentMultiplier,
        potential: potentialMultiplier,
        description: `Activating all available modules would ${
          potentialMultiplier > currentMultiplier * 2 ? 'exponentially' : 'significantly'
        } increase your business intelligence by ${Math.round(
          (potentialMultiplier / currentMultiplier - 1) * 100
        )}%`,
      },
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    return handleError(error, context)
  }
}

/**
 * POST - Activate or deactivate business intelligence modules
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ModuleActivationResponse | { error: string }>> {
  const context: ErrorContext = {
    endpoint: '/api/BUSINESS INTELLIGENCE/modules',
    method: 'POST',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  }

  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ModuleActivationRequest = await request.json()
    const { moduleId, action } = body

    // Validate request
    if (!moduleId || !action || !['activate', 'deactivate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })

    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 403 })
    }

    // Get module
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Check module limits
    const tierLimits: Record<string, number> = {
      INTELLIGENT: 2,
      INTELLIGENT: 4,
      AUTONOMOUS: 6,
      ADVANCED: -1,
    }

    const maxModules = tierLimits[user.subscription.tier] || 0
    const activeModules = user.subscription.modules.filter((m) => m.isActive)

    if (action === 'activate') {
      // Check if already active
      const existingModule = user.subscription.modules.find((m) => m.moduleId === moduleId)
      if (existingModule?.isActive) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Module is already active',
          },
          { status: 400 }
        )
      }

      // Check slot availability
      if (maxModules !== -1 && activeModules.length >= maxModules) {
        return NextResponse.json(
          {
            status: 'error',
            message: `You have reached the maximum of ${maxModules} modules for your ${user.subscription.tier} tier`,
          },
          { status: 403 }
        )
      }

      // Activate module
      if (existingModule) {
        await prisma.subscriptionModule.update({
          where: { id: existingModule.id },
          data: {
            isActive: true,
            activatedAt: new Date(),
          },
        })
      } else {
        await prisma.subscriptionModule.create({
          data: {
            subscriptionId: user.subscription.id,
            moduleId: moduleId,
            isActive: true,
            activatedAt: new Date(),
          },
        })
      }

      // Update business intelligence
      const updatedModules = [...activeModules.map((m) => m.moduleId), moduleId]
      await businessIntelligence.updateActiveModules(updatedModules)

      // Trigger evolution
      await businessIntelligence.evolveIntelligence('module-activation', {
        moduleId,
        moduleName: module.name,
      })

      // Get new BUSINESS INTELLIGENCE status
      const newStatus = businessIntelligence.getIntelligenceStatus()
      const newCapabilities = getModuleCapabilities(moduleId)

      return NextResponse.json({
        status: 'success',
        message: `${module.name} business intelligence module activated`,
        module: {
          id: module.id,
          name: module.name,
          isActive: true,
        },
        businessIntelligence: {
          level: newStatus.level,
          intelligenceMultiplier: newStatus.intelligenceMultiplier,
          newCapabilities,
        },
      })
    } else {
      // Deactivate module
      const existingModule = user.subscription.modules.find(
        (m) => m.moduleId === moduleId && m.isActive
      )

      if (!existingModule) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Module is not active',
          },
          { status: 400 }
        )
      }

      // Prevent deactivating if it would go below minimum
      const minimumModules = user.subscription.tier === 'INTELLIGENT' ? 2 : 1
      if (activeModules.length <= minimumModules) {
        return NextResponse.json(
          {
            status: 'error',
            message: `You must keep at least ${minimumModules} module(s) active`,
          },
          { status: 403 }
        )
      }

      // Deactivate module
      await prisma.subscriptionModule.update({
        where: { id: existingModule.id },
        data: {
          isActive: false,
        },
      })

      // Update BUSINESS INTELLIGENCE
      const updatedModules = activeModules
        .filter((m) => m.moduleId !== moduleId)
        .map((m) => m.moduleId)
      await businessIntelligence.updateActiveModules(updatedModules)

      // Get new BUSINESS INTELLIGENCE status
      const newStatus = businessIntelligence.getIntelligenceStatus()

      return NextResponse.json({
        status: 'success',
        message: `${module.name} business intelligence module deactivated`,
        module: {
          id: module.id,
          name: module.name,
          isActive: false,
        },
        businessIntelligence: {
          level: newStatus.level,
          intelligenceMultiplier: newStatus.intelligenceMultiplier,
        },
      })
    }
  } catch (error: unknown) {
    return handleError(error, context)
  }
}

/**
 * Get category multiplier for BUSINESS INTELLIGENCE impact
 */
function getCategoryMultiplier(category: string): number {
  const multipliers: Record<string, number> = {
    core: 2.0,
    analytics: 1.8,
    automation: 1.5,
    communication: 1.3,
    finance: 1.5,
    operations: 1.4,
    sales: 1.6,
    marketing: 1.4,
    hr: 1.2,
    support: 1.1,
  }

  return multipliers[category.toLowerCase()] || 1.0
}

/**
 * Get INTELLIGENT connections for a module
 */
function getINTELLIGENTConnections(moduleId: string, activeModules: string[]): string[] {
  const connections: Record<string, string[]> = {
    crm: ['accounting', 'inventory', 'analytics'],
    accounting: ['crm', 'inventory', 'hr'],
    inventory: ['crm', 'accounting', 'projects'],
    hr: ['accounting', 'projects', 'analytics'],
    projects: ['hr', 'inventory', 'analytics'],
    analytics: ['crm', 'hr', 'projects'],
  }

  const moduleConnections = connections[moduleId] || []
  return moduleConnections.filter((conn) => activeModules.includes(conn))
}

/**
 * Get module capabilities
 */
function getModuleCapabilities(moduleId: string): string[] {
  const capabilities: Record<string, string[]> = {
    crm: [
      'Customer Pattern Recognition',
      'Predictive Churn Analysis',
      'Autonomous Relationship Management',
    ],
    accounting: [
      'Financial Pattern Detection',
      'Automated Reconciliation',
      'Tax Optimization Intelligence',
    ],
    inventory: ['Demand Prediction', 'Supply Chain Optimization', 'Autonomous Reordering'],
    hr: ['Performance Pattern Analysis', 'Team Dynamics Optimization', 'Talent Prediction'],
    projects: ['Resource Optimization', 'Timeline Prediction', 'Risk Pattern Detection'],
    analytics: [
      'Cross-Module Intelligence',
      'Predictive Business Insights',
      'Autonomous Reporting',
    ],
  }

  return capabilities[moduleId] || ['Enhanced Business Intelligence']
}

/**
 * Get module requirements
 */
function getModuleRequirements(moduleId: string, tier?: string): string[] | undefined {
  const requirements: Record<string, string[]> = {
    analytics: ['INTELLIGENT tier or higher'],
    projects: ['Autonomous tier or higher'],
  }

  const moduleReqs = requirements[moduleId]
  if (!moduleReqs || !tier) return moduleReqs

  // Filter out met requirements
  const tierOrder = ['INTELLIGENT', 'INTELLIGENT', 'AUTONOMOUS', 'ADVANCED']
  const currentTierIndex = tierOrder.indexOf(tier)

  return moduleReqs.filter((req) => {
    if (req.includes('INTELLIGENT') && currentTierIndex >= 1) return false
    if (req.includes('Autonomous') && currentTierIndex >= 2) return false
    if (req.includes('ADVANCED') && currentTierIndex >= 3) return false
    return true
  })
}

/**
 * Calculate potential intelligence multiplier
 */
function calculatePotentialMultiplier(currentModules: number, maxModules: number): number {
  // Use the exponential multiplication formula
  let multiplier = 1
  for (let i = 1; i <= maxModules; i++) {
    multiplier *= i
  }

  // Cap at reasonable limit for display
  return Math.min(multiplier, 1000)
}
