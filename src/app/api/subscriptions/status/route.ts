/**
 * CoreFlow360 - Subscription Status API
 * Get comprehensive subscription status for a tenant
 */

import { NextRequest, NextResponse } from 'next/server'
import { moduleManager } from '@/services/subscription/module-manager'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId query parameter is required' },
        { status: 400 }
      )
    }

    // Get subscription details
    const subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId }
    })

    if (!subscription) {
      return NextResponse.json({
        tenantId,
        hasSubscription: false,
        message: 'No subscription found for this tenant'
      })
    }

    // Get active modules
    const activeModules = await moduleManager.getActiveModules(tenantId)
    
    // Get module capabilities for each active module
    const moduleCapabilities: Record<string, any> = {}
    for (const moduleKey of activeModules) {
      moduleCapabilities[moduleKey] = await moduleManager.getModuleCapabilities(tenantId, moduleKey)
    }

    // Get module definitions for pricing info
    const moduleDefinitions = await prisma.moduleDefinition.findMany({
      where: { moduleKey: { in: activeModules }, isActive: true }
    })

    // Calculate current pricing
    let totalMonthlyPrice = 0
    const moduleBreakdown = moduleDefinitions.map(module => {
      const modulePrice = Math.max(module.basePrice, module.perUserPrice * subscription.userCount)
      totalMonthlyPrice += modulePrice
      
      return {
        moduleKey: module.moduleKey,
        name: module.name,
        category: module.category,
        monthlyPrice: modulePrice,
        perUserPrice: module.perUserPrice
      }
    })

    // Get recent subscription events
    const recentEvents = await prisma.subscriptionEvent.findMany({
      where: { tenantSubscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get usage data (latest for each module)
    const usageData = await prisma.subscriptionUsage.findMany({
      where: { tenantSubscriptionId: subscription.id },
      orderBy: { usageDate: 'desc' },
      take: activeModules.length
    })

    return NextResponse.json({
      tenantId,
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        subscriptionTier: subscription.subscriptionTier,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        userCount: subscription.userCount,
        maxUsers: subscription.maxUsers,
        discountRate: subscription.discountRate,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        nextBillingDate: subscription.nextBillingDate
      },
      modules: {
        active: activeModules,
        count: activeModules.length,
        capabilities: moduleCapabilities,
        breakdown: moduleBreakdown
      },
      pricing: {
        totalMonthlyPrice: Math.round(totalMonthlyPrice * 100) / 100,
        totalAnnualPrice: Math.round(totalMonthlyPrice * 12 * 100) / 100,
        currency: 'USD',
        lastUpdated: subscription.updatedAt
      },
      usage: {
        data: usageData.map(usage => ({
          moduleKey: usage.moduleKey,
          usageDate: usage.usageDate,
          userCount: usage.userCount,
          apiCalls: usage.apiCalls,
          dataStorage: usage.dataStorage,
          aiTokensUsed: usage.aiTokensUsed,
          averageResponseTime: usage.averageResponseTime,
          errorCount: usage.errorCount
        })),
        lastUpdated: usageData.length > 0 ? usageData[0].usageDate : null
      },
      events: {
        recent: recentEvents.map(event => ({
          eventType: event.eventType,
          effectiveDate: event.effectiveDate,
          metadata: JSON.parse(event.metadata || '{}'),
          createdAt: event.createdAt
        })),
        count: recentEvents.length
      },
      stripe: {
        customerId: subscription.stripeCustomerId,
        subscriptionId: subscription.stripeSubscriptionId,
        hasPaymentMethod: !!subscription.stripeCustomerId
      },
      meta: {
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        dataFreshness: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, modules } = body

    if (!tenantId || !Array.isArray(modules)) {
      return NextResponse.json(
        { error: 'tenantId and modules array are required' },
        { status: 400 }
      )
    }

    // Update subscription modules
    const result = await moduleManager.updateSubscriptionModules(tenantId, modules)

    return NextResponse.json({
      success: result.success,
      tenantId,
      updateResult: result,
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}