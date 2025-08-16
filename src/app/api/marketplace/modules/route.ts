/**
 * CoreFlow360 - Marketplace Modules API
 * Provides module information for the marketplace
 */

import { NextRequest, NextResponse } from 'next/server'
import { MODULE_INTEGRATIONS } from '@/modules/integration-config'
import { handleError, ErrorContext } from '@/lib/error-handler'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    const context: ErrorContext = {
      endpoint: '/api/marketplace/modules',
      method: 'GET',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      requestId: request.headers.get('x-request-id') || undefined
    }

    try {
      // Transform module configurations for marketplace display
      const marketplaceModules = Object.values(MODULE_INTEGRATIONS).map(module => ({
        id: module.id,
        name: module.name,
        description: module.description,
        longDescription: `${module.description}. This ${module.deploymentType} integration provides ${module.capabilities.length} core capabilities including ${module.capabilities.slice(0, 3).join(', ')}${module.capabilities.length > 3 ? ' and more' : ''}.`,
        category: module.category,
        accessible: false, // Will be set by client based on subscription
        popularity: generatePopularityScore(module),
        rating: generateRating(module),
        reviews: generateReviewCount(module),
        features: module.capabilities.slice(0, 8), // Top 8 features
        pricing: {
          tier: getTierRequirement(module.category),
          included: false, // Will be determined by client
          requiresUpgrade: true // Will be determined by client
        },
        integration: {
          connectionType: module.connectionType,
          deploymentType: module.deploymentType,
          setupDifficulty: getSetupDifficulty(module)
        },
        vendor: {
          name: getVendorName(module.id),
          verified: isVerifiedVendor(module.id)
        }
      }))

      // Sort by popularity by default
      marketplaceModules.sort((a, b) => b.popularity - a.popularity)

      return NextResponse.json({
        success: true,
        data: marketplaceModules,
        total: marketplaceModules.length,
        categories: getUniqueCategories(marketplaceModules)
      })

    } catch (error) {
      return handleError(error, context)
    }
  }, RATE_LIMITS.public)
}

/**
 * Generate popularity score based on module characteristics
 */
function generatePopularityScore(module: any): number {
  let score = Math.floor(Math.random() * 1000) + 100 // Base random score

  // Boost popular categories
  if (['accounting', 'crm'].includes(module.category)) {
    score += 500
  }

  // Boost based on number of capabilities
  score += module.capabilities.length * 50

  // Boost easy-to-deploy modules
  if (module.deploymentType === 'docker' || module.deploymentType === 'cloud') {
    score += 200
  }

  // Boost well-known modules
  const popularModules = ['bigcapital', 'twenty', 'erpnext', 'dolibarr']
  if (popularModules.includes(module.id)) {
    score += 1000
  }

  return score
}

/**
 * Generate rating based on module quality indicators
 */
function generateRating(module: any): number {
  let rating = 3.5 // Base rating

  // Boost for comprehensive modules
  if (module.capabilities.length >= 5) {
    rating += 0.8
  } else if (module.capabilities.length >= 3) {
    rating += 0.5
  }

  // Boost for mature deployment types
  if (module.deploymentType === 'cloud' || module.deploymentType === 'docker') {
    rating += 0.3
  }

  // Boost for popular categories
  if (['accounting', 'crm', 'erp'].includes(module.category)) {
    rating += 0.4
  }

  // Boost well-known modules
  const highQualityModules = ['bigcapital', 'twenty', 'erpnext', 'plane']
  if (highQualityModules.includes(module.id)) {
    rating += 0.5
  }

  // Cap at 5.0 and round to 1 decimal
  return Math.min(Math.round(rating * 10) / 10, 5.0)
}

/**
 * Generate review count based on popularity
 */
function generateReviewCount(module: any): number {
  const baseReviews = Math.floor(Math.random() * 50) + 10
  
  // Popular modules have more reviews
  const popularModules = ['bigcapital', 'twenty', 'erpnext', 'dolibarr']
  if (popularModules.includes(module.id)) {
    return baseReviews + 200 + Math.floor(Math.random() * 300)
  }

  return baseReviews
}

/**
 * Determine tier requirement for module category
 */
function getTierRequirement(category: string): string {
  switch (category) {
    case 'accounting':
    case 'crm':
      return 'starter'
    case 'operations':
    case 'erp':
      return 'professional'
    case 'ai':
    case 'platform':
      return 'enterprise'
    default:
      return 'starter'
  }
}

/**
 * Determine setup difficulty
 */
function getSetupDifficulty(module: any): 'easy' | 'medium' | 'hard' {
  if (module.deploymentType === 'embedded' || module.authMethod === 'none') {
    return 'easy'
  }
  
  if (module.deploymentType === 'docker' || module.deploymentType === 'cloud') {
    return 'medium'
  }
  
  return 'hard'
}

/**
 * Get vendor name for module
 */
function getVendorName(moduleId: string): string {
  const vendorMap: Record<string, string> = {
    bigcapital: 'Bigcapital Team',
    twenty: 'Twenty Team',
    erpnext: 'Frappe Technologies',
    dolibarr: 'Dolibarr Foundation',
    plane: 'Plane Team',
    nocobase: 'NocoBase Team',
    fingpt: 'AI4Finance Foundation',
    finrobot: 'AI4Finance Foundation',
    idurar: 'IDURAR Team',
    inventory: 'CoreFlow360 Team'
  }

  return vendorMap[moduleId] || 'Third Party'
}

/**
 * Check if vendor is verified
 */
function isVerifiedVendor(moduleId: string): boolean {
  const verifiedModules = ['bigcapital', 'twenty', 'erpnext', 'dolibarr', 'plane', 'inventory']
  return verifiedModules.includes(moduleId)
}

/**
 * Get unique categories from modules
 */
function getUniqueCategories(modules: any[]): string[] {
  const categories = [...new Set(modules.map(m => m.category))]
  return categories.sort()
}