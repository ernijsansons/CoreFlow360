/**
 * CoreFlow360 - Available Modules API
 * Get all available modules with pricing and feature information
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'



export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const industryOnly = searchParams.get('industryOnly') === 'true'

    let whereClause: any = { isActive: true }

    if (category) {
      whereClause.category = category
    }

    if (industryOnly) {
      whereClause.category = 'industry'
    }

    const modules = await prisma.moduleDefinition.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { perUserPrice: 'asc' }
      ]
    })

    const formattedModules = modules.map(module => ({
      moduleKey: module.moduleKey,
      name: module.name,
      description: module.description,
      category: module.category,
      pricing: {
        basePrice: module.basePrice,
        perUserPrice: module.perUserPrice,
        setupFee: module.setupFee,
        currency: 'USD'
      },
      constraints: {
        minUserCount: module.minUserCount,
        maxUserCount: module.maxUserCount,
        enterpriseOnly: module.enterpriseOnly,
        defaultEnabled: module.defaultEnabled
      },
      dependencies: JSON.parse(module.dependencies || '[]'),
      conflicts: JSON.parse(module.conflicts || '[]'),
      features: {
        aiCapabilities: JSON.parse(module.aiCapabilities || '{}'),
        featureFlags: JSON.parse(module.featureFlags || '{}'),
        crossModuleEvents: JSON.parse(module.crossModuleEvents || '[]')
      },
      version: module.version,
      updatedAt: module.updatedAt
    }))

    // Group modules by category for better organization
    const categorizedModules = formattedModules.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = []
      }
      acc[module.category].push(module)
      return acc
    }, {} as Record<string, typeof formattedModules>)

    return NextResponse.json({
      modules: formattedModules,
      categorized: categorizedModules,
      meta: {
        totalModules: formattedModules.length,
        categories: Object.keys(categorizedModules),
        priceRange: {
          min: Math.min(...formattedModules.map(m => m.pricing.perUserPrice)),
          max: Math.max(...formattedModules.map(m => m.pricing.perUserPrice))
        }
      }
    })

  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}