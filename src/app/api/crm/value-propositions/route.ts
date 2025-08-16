/**
 * CoreFlow360 - Value Propositions API
 * CRUD operations for value propositions management
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import ValuePropositionEngine, { ValueProposition, ValuePropCategory } from '@/lib/crm/value-proposition-engine'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const category = searchParams.get('category')
    const industry = searchParams.get('industry')
    const persona = searchParams.get('persona')
    const active = searchParams.get('active')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Build query filters
    const where: any = {
      tenantId,
      ...(category && { category }),
      ...(active !== null && { isActive: active === 'true' }),
      ...(industry && { targetIndustry: { has: industry } }),
      ...(persona && { targetPersona: { has: persona } })
    }

    const valuePropositions = await prisma.valueProposition.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            customerProblems: true,
            generatedInfographics: true
          }
        }
      },
      orderBy: [
        { aiOptimizationScore: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform to include performance metrics
    const transformedValueProps = await Promise.all(
      valuePropositions.map(async (vp) => {
        // Get recent performance analytics
        const analytics = await prisma.valuePropositionAnalytics.findMany({
          where: {
            valuePropId: vp.id,
            dateperiod: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: { dateperiod: 'desc' },
          take: 30
        })

        const totalViews = analytics.reduce((sum, a) => sum + (a.totalViews || 0), 0)
        const totalConversions = analytics.reduce((sum, a) => sum + (a.leadsGenerated || 0), 0)
        const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0

        return {
          id: vp.id,
          title: vp.title,
          description: vp.description,
          category: vp.category,
          problemStatement: vp.problemStatement,
          targetPainPoints: vp.targetPainPoints,
          solutionDescription: vp.solutionDescription,
          keyBenefits: vp.keyBenefits,
          quantifiableBenefits: vp.quantifiableBenefits,
          useCase: vp.useCase,
          targetPersona: vp.targetPersona,
          industry: vp.targetIndustry,
          testimonials: vp.testimonials,
          caseStudies: vp.caseStudies,
          metrics: vp.metrics,
          iconUrl: vp.iconUrl,
          colorScheme: vp.colorScheme,
          visualStyle: vp.visualStyle,
          aiOptimizationScore: Number(vp.aiOptimizationScore),
          aiSuggestions: vp.aiSuggestions,
          usageCount: vp.usageCount || 0,
          successRate: Number(vp.successRate || 0),
          isActive: vp.isActive,
          createdAt: vp.createdAt.toISOString(),
          updatedAt: vp.updatedAt.toISOString(),
          user: vp.user,
          performanceMetrics: {
            totalViews,
            conversionRate: Math.round(conversionRate * 100) / 100,
            problemsMatched: vp._count.customerProblems,
            materialsGenerated: vp._count.generatedInfographics
          }
        }
      })
    )

    return NextResponse.json({
      valuePropositions: transformedValueProps,
      total: transformedValueProps.length,
      categories: Object.values(ValuePropCategory),
      summary: {
        totalActive: transformedValueProps.filter(vp => vp.isActive).length,
        avgOptimizationScore: Math.round(
          transformedValueProps.reduce((sum, vp) => sum + vp.aiOptimizationScore, 0) / 
          transformedValueProps.length * 100
        ) / 100,
        topPerforming: transformedValueProps
          .sort((a, b) => b.performanceMetrics.conversionRate - a.performanceMetrics.conversionRate)
          .slice(0, 3)
          .map(vp => ({ id: vp.id, title: vp.title, conversionRate: vp.performanceMetrics.conversionRate }))
      }
    })

  } catch (error) {
    console.error('Error fetching value propositions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch value propositions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      tenantId,
      title,
      description,
      category,
      problemStatement,
      targetPainPoints,
      solutionDescription,
      keyBenefits,
      quantifiableBenefits,
      useCase,
      targetPersona,
      industry,
      testimonials = [],
      caseStudies = [],
      metrics = [],
      iconUrl,
      colorScheme,
      visualStyle = 'MODERN',
      generateWithAI = false
    } = body

    // Validation
    if (!tenantId || !title || !description || !category || !problemStatement || !solutionDescription) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    let valuePropData = {
      tenantId,
      userId: session.user.id,
      title,
      description,
      category,
      problemStatement,
      targetPainPoints: targetPainPoints || [],
      solutionDescription,
      keyBenefits: keyBenefits || [],
      quantifiableBenefits: quantifiableBenefits || [],
      useCase,
      targetPersona: targetPersona || [],
      targetIndustry: industry || [],
      testimonials,
      caseStudies,
      metrics,
      iconUrl,
      colorScheme,
      visualStyle,
      aiOptimizationScore: 0.0,
      aiSuggestions: [],
      usageCount: 0,
      successRate: 0.0,
      isActive: true
    }

    // Use AI to enhance the value proposition if requested
    if (generateWithAI) {
      const engine = new ValuePropositionEngine()
      const aiEnhancedVP = await engine.generateValueProposition(
        problemStatement,
        industry?.[0] || 'General',
        targetPersona?.[0] || 'Business Owner',
        [] // No existing value props to compare against for now
      )

      valuePropData = {
        ...valuePropData,
        title: aiEnhancedVP.title,
        description: aiEnhancedVP.description,
        keyBenefits: aiEnhancedVP.keyBenefits,
        quantifiableBenefits: aiEnhancedVP.quantifiableBenefits,
        useCase: aiEnhancedVP.useCase,
        aiOptimizationScore: aiEnhancedVP.aiOptimizationScore,
        aiSuggestions: aiEnhancedVP.aiSuggestions
      }
    }

    const valueProposition = await prisma.valueProposition.create({
      data: valuePropData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Initialize analytics tracking
    await prisma.valuePropositionAnalytics.create({
      data: {
        valuePropId: valueProposition.id,
        datePeriod: new Date(),
        periodType: 'DAILY',
        timesUsed: 0,
        materialsGenerated: 0,
        totalViews: 0,
        totalDownloads: 0,
        totalShares: 0,
        leadsGenerated: 0,
        meetingsBooked: 0,
        dealsInfluenced: 0,
        revenueInfluenced: 0,
        engagementRate: 0,
        conversionRate: 0
      }
    })

    return NextResponse.json({
      valueProposition: {
        id: valueProposition.id,
        title: valueProposition.title,
        description: valueProposition.description,
        category: valueProposition.category,
        problemStatement: valueProposition.problemStatement,
        targetPainPoints: valueProposition.targetPainPoints,
        solutionDescription: valueProposition.solutionDescription,
        keyBenefits: valueProposition.keyBenefits,
        quantifiableBenefits: valueProposition.quantifiableBenefits,
        useCase: valueProposition.useCase,
        targetPersona: valueProposition.targetPersona,
        industry: valueProposition.targetIndustry,
        testimonials: valueProposition.testimonials,
        caseStudies: valueProposition.caseStudies,
        metrics: valueProposition.metrics,
        iconUrl: valueProposition.iconUrl,
        colorScheme: valueProposition.colorScheme,
        visualStyle: valueProposition.visualStyle,
        aiOptimizationScore: Number(valueProposition.aiOptimizationScore),
        aiSuggestions: valueProposition.aiSuggestions,
        usageCount: valueProposition.usageCount || 0,
        successRate: Number(valueProposition.successRate || 0),
        isActive: valueProposition.isActive,
        createdAt: valueProposition.createdAt.toISOString(),
        updatedAt: valueProposition.updatedAt.toISOString(),
        user: valueProposition.user
      }
    })

  } catch (error) {
    console.error('Error creating value proposition:', error)
    return NextResponse.json(
      { error: 'Failed to create value proposition' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, optimizeWithAI = false, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Value proposition ID required' }, { status: 400 })
    }

    // Check ownership/access
    const existingVP = await prisma.valueProposition.findFirst({
      where: {
        id,
        tenantId: updateData.tenantId || session.user.tenantId
      }
    })

    if (!existingVP) {
      return NextResponse.json({ error: 'Value proposition not found' }, { status: 404 })
    }

    let finalUpdateData = { ...updateData }

    // Use AI to optimize the value proposition if requested
    if (optimizeWithAI) {
      const engine = new ValuePropositionEngine()
      
      // Get recent performance data
      const recentAnalytics = await prisma.valuePropositionAnalytics.findMany({
        where: {
          valuePropId: id,
          datePeriod: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })

      const totalViews = recentAnalytics.reduce((sum, a) => sum + (a.totalViews || 0), 0)
      const totalConversions = recentAnalytics.reduce((sum, a) => sum + (a.leadsGenerated || 0), 0)
      const engagementRate = recentAnalytics.reduce((sum, a) => sum + Number(a.engagementRate || 0), 0) / Math.max(recentAnalytics.length, 1)
      const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0

      const optimizedVP = await engine.optimizeValueProposition(
        existingVP as any,
        {
          engagementRate,
          conversionRate,
          feedbackScore: 7.5 // Would come from actual feedback data
        }
      )

      finalUpdateData = {
        ...finalUpdateData,
        title: optimizedVP.title,
        description: optimizedVP.description,
        keyBenefits: optimizedVP.keyBenefits,
        aiOptimizationScore: optimizedVP.aiOptimizationScore,
        aiSuggestions: optimizedVP.aiSuggestions
      }

      // Track the optimization
      await prisma.aiOptimizationHistory.create({
        data: {
          entityType: 'VALUE_PROPOSITION',
          entityId: id,
          tenantId: existingVP.tenantId,
          optimizationType: 'PERFORMANCE_BOOST',
          originalData: existingVP,
          optimizedData: finalUpdateData,
          aiModel: 'gpt-4',
          optimizationPrompt: 'Performance-based optimization',
          confidenceScore: optimizedVP.aiOptimizationScore,
          originalPerformance: { engagementRate, conversionRate },
          optimizedPerformance: { expected: true },
          status: 'IMPLEMENTED'
        }
      })
    }

    const updatedValueProposition = await prisma.valueProposition.update({
      where: { id },
      data: finalUpdateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      valueProposition: {
        id: updatedValueProposition.id,
        title: updatedValueProposition.title,
        description: updatedValueProposition.description,
        category: updatedValueProposition.category,
        problemStatement: updatedValueProposition.problemStatement,
        targetPainPoints: updatedValueProposition.targetPainPoints,
        solutionDescription: updatedValueProposition.solutionDescription,
        keyBenefits: updatedValueProposition.keyBenefits,
        quantifiableBenefits: updatedValueProposition.quantifiableBenefits,
        useCase: updatedValueProposition.useCase,
        targetPersona: updatedValueProposition.targetPersona,
        industry: updatedValueProposition.targetIndustry,
        testimonials: updatedValueProposition.testimonials,
        caseStudies: updatedValueProposition.caseStudies,
        metrics: updatedValueProposition.metrics,
        iconUrl: updatedValueProposition.iconUrl,
        colorScheme: updatedValueProposition.colorScheme,
        visualStyle: updatedValueProposition.visualStyle,
        aiOptimizationScore: Number(updatedValueProposition.aiOptimizationScore),
        aiSuggestions: updatedValueProposition.aiSuggestions,
        usageCount: updatedValueProposition.usageCount || 0,
        successRate: Number(updatedValueProposition.successRate || 0),
        isActive: updatedValueProposition.isActive,
        createdAt: updatedValueProposition.createdAt.toISOString(),
        updatedAt: updatedValueProposition.updatedAt.toISOString(),
        user: updatedValueProposition.user
      }
    })

  } catch (error) {
    console.error('Error updating value proposition:', error)
    return NextResponse.json(
      { error: 'Failed to update value proposition' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const tenantId = searchParams.get('tenantId')

    if (!id || !tenantId) {
      return NextResponse.json({ error: 'ID and tenant ID required' }, { status: 400 })
    }

    // Check ownership/access
    const valueProposition = await prisma.valueProposition.findFirst({
      where: { id, tenantId }
    })

    if (!valueProposition) {
      return NextResponse.json({ error: 'Value proposition not found' }, { status: 404 })
    }

    // Soft delete by setting inactive (preserve analytics)
    await prisma.valueProposition.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting value proposition:', error)
    return NextResponse.json(
      { error: 'Failed to delete value proposition' },
      { status: 500 }
    )
  }
}