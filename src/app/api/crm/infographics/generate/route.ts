/**
 * CoreFlow360 - AI Infographic Generation API
 * Generate personalized marketing materials using AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import ValuePropositionEngine from '@/lib/crm/value-proposition-engine'

interface GenerateInfographicRequest {
  tenantId: string
  customerId?: string
  linkedinProfileId?: string
  templateId: string
  problemIds: string[]
  valuePropIds: string[]
  brandElementsId?: string
  materialTypes: ('INFOGRAPHIC' | 'ONE_PAGER' | 'EMAIL_TEMPLATE' | 'PROPOSAL')[]
  customizations?: {
    title?: string
    colorScheme?: string
    includeBranding?: boolean
    includeTestimonials?: boolean
    includeMetrics?: boolean
    tone?: 'PROFESSIONAL' | 'CASUAL' | 'TECHNICAL'
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateInfographicRequest = await request.json()
    const {
      tenantId,
      customerId,
      linkedinProfileId,
      templateId,
      problemIds,
      valuePropIds,
      brandElementsId,
      materialTypes = ['INFOGRAPHIC'],
      customizations = {}
    } = body

    // Validation
    if (!tenantId || !templateId || (!customerId && !linkedinProfileId)) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, templateId, and customerId or linkedinProfileId' },
        { status: 400 }
      )
    }

    if (problemIds.length === 0 || valuePropIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one problem and one value proposition required' },
        { status: 400 }
      )
    }

    // Fetch required data
    const [template, problems, valueProps, brandElements, customer, linkedinProfile] = await Promise.all([
      prisma.infographicTemplate.findUnique({ where: { id: templateId } }),
      prisma.customerProblem.findMany({
        where: { 
          id: { in: problemIds },
          tenantId 
        },
        include: {
          customer: true,
          linkedinProfile: true
        }
      }),
      prisma.valueProposition.findMany({
        where: { 
          id: { in: valuePropIds },
          tenantId 
        }
      }),
      brandElementsId ? prisma.companyBrandElements.findUnique({
        where: { id: brandElementsId }
      }) : null,
      customerId ? prisma.customer.findUnique({ where: { id: customerId } }) : null,
      linkedinProfileId ? prisma.linkedinProfile.findUnique({ where: { id: linkedinProfileId } }) : null
    ])

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (problems.length === 0 || valueProps.length === 0) {
      return NextResponse.json({ error: 'Problems or value propositions not found' }, { status: 404 })
    }

    // Prepare customer profile
    const customerProfile = {
      company: customer?.name || linkedinProfile?.currentCompany || 'Company',
      industry: linkedinProfile?.industry || 'General',
      size: '50-200', // Would be determined from customer data
      role: linkedinProfile?.currentTitle || 'Decision Maker',
      painPoints: problems.map(p => p.problemTitle)
    }

    // Prepare brand elements
    const brandData = brandElements ? {
      companyName: brandElements.companyName,
      logoUrl: brandElements.logoUrl,
      primaryColor: brandElements.primaryColor || '#2563EB',
      secondaryColor: brandElements.secondaryColor || '#64748B',
      visualStyle: brandElements.visualStyle || 'MODERN',
      tagline: brandElements.tagline
    } : {
      companyName: 'Your Company',
      primaryColor: '#2563EB',
      secondaryColor: '#64748B',
      visualStyle: 'MODERN'
    }

    // Initialize the Value Proposition Engine
    const engine = new ValuePropositionEngine()

    // Transform data for the engine
    const engineProblems = problems.map(p => ({
      id: p.id,
      customerId: p.customerId,
      linkedinProfileId: p.linkedinProfileId,
      problemTitle: p.problemTitle,
      problemDescription: p.problemDescription,
      problemCategory: p.problemCategory as any,
      severity: p.severity as any,
      urgency: p.urgency as any,
      businessImpact: p.businessImpact || '',
      financialImpact: p.financialImpact,
      matchedValueProps: p.matchedValueProps,
      confidenceScore: Number(p.confidenceScore),
      identifiedFrom: p.identifiedFrom as any,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }))

    const engineValueProps = valueProps.map(vp => ({
      id: vp.id,
      tenantId: vp.tenantId,
      userId: vp.userId,
      title: vp.title,
      description: vp.description,
      category: vp.category as any,
      problemStatement: vp.problemStatement,
      targetPainPoints: vp.targetPainPoints,
      solutionDescription: vp.solutionDescription,
      keyBenefits: vp.keyBenefits,
      quantifiableBenefits: vp.quantifiableBenefits as any,
      useCase: vp.useCase || '',
      targetPersona: vp.targetPersona,
      industry: vp.targetIndustry,
      testimonials: vp.testimonials as any,
      caseStudies: vp.caseStudies,
      metrics: vp.metrics as any,
      iconUrl: vp.iconUrl,
      colorScheme: vp.colorScheme,
      visualStyle: vp.visualStyle as any,
      aiOptimizationScore: Number(vp.aiOptimizationScore),
      aiSuggestions: vp.aiSuggestions,
      isActive: vp.isActive,
      createdAt: vp.createdAt,
      updatedAt: vp.updatedAt
    }))

    // Generate materials for each requested type
    const generatedMaterials = []

    for (const materialType of materialTypes) {
      try {
        let generatedContent

        if (materialType === 'INFOGRAPHIC') {
          // Generate infographic
          generatedContent = await engine.generatePersonalizedInfographic(
            customerId || linkedinProfileId!,
            engineProblems,
            engineValueProps,
            templateId,
            brandData as any
          )

          // Store in database
          const storedInfographic = await prisma.generatedInfographic.create({
            data: {
              tenantId,
              userId: session.user.id,
              customerId,
              valuePropIds,
              customerProblemIds: problemIds,
              templateId,
              title: customizations.title || generatedContent.title,
              subtitle: generatedContent.subtitle,
              sections: generatedContent.sections,
              colorScheme: generatedContent.colorScheme,
              font: generatedContent.font,
              iconSet: generatedContent.iconSet,
              brandElementsId,
              previewUrl: generatedContent.previewUrl,
              finalAssets: generatedContent.finalAssets,
              aiPrompt: generatedContent.aiPrompt,
              generationModel: generatedContent.generationModel,
              generationTimeMs: generatedContent.generationTime,
              qualityScore: generatedContent.qualityScore,
              status: 'GENERATED'
            }
          })

          generatedMaterials.push({
            type: 'INFOGRAPHIC',
            id: storedInfographic.id,
            data: generatedContent
          })

        } else {
          // Generate other material types
          const materials = await engine.generateMarketingMaterialsSuite(
            customerId || linkedinProfileId!,
            engineProblems,
            engineValueProps,
            brandData as any
          )

          const relevantMaterial = materials.find(m => m.materialType === materialType)
          
          if (relevantMaterial) {
            const storedMaterial = await prisma.personalizedMarketingMaterial.create({
              data: {
                tenantId,
                customerId: customerId || linkedinProfileId!,
                materialType,
                customerProblemIds: problemIds,
                selectedValuePropIds: valuePropIds,
                customerProfile: customerProfile,
                content: relevantMaterial.content,
                assets: relevantMaterial.assets,
                title: customizations.title || `${materialType} for ${customerProfile.company}`,
                description: `Personalized ${materialType.toLowerCase()} addressing key challenges`,
                generationPrompt: `Generate ${materialType} for ${customerProfile.company} addressing: ${problems.map(p => p.problemTitle).join(', ')}`
              }
            })

            generatedMaterials.push({
              type: materialType,
              id: storedMaterial.id,
              data: relevantMaterial
            })
          }
        }

        // Update usage analytics for value propositions
        await Promise.all(
          valuePropIds.map(vpId =>
            prisma.valuePropositionAnalytics.upsert({
              where: {
                valuePropId_datePeriod_periodType: {
                  valuePropId: vpId,
                  datePeriod: new Date(),
                  periodType: 'DAILY'
                }
              },
              update: {
                timesUsed: { increment: 1 },
                materialsGenerated: { increment: 1 }
              },
              create: {
                valuePropId: vpId,
                datePeriod: new Date(),
                periodType: 'DAILY',
                timesUsed: 1,
                materialsGenerated: 1,
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
          )
        )

        // Update value proposition usage count
        await Promise.all(
          valuePropIds.map(vpId =>
            prisma.valueProposition.update({
              where: { id: vpId },
              data: { usageCount: { increment: 1 } }
            })
          )
        )

      } catch (materialError) {
        console.error(`Error generating ${materialType}:`, materialError)
        // Continue with other material types
      }
    }

    // Generate sharing URLs for easy access
    const sharingUrls = generatedMaterials.map(material => ({
      type: material.type,
      id: material.id,
      shareUrl: `/api/crm/materials/share/${material.id}`,
      previewUrl: `/crm/materials/preview/${material.id}`
    }))

    return NextResponse.json({
      success: true,
      generatedMaterials: generatedMaterials.map(material => ({
        type: material.type,
        id: material.id,
        title: material.data.title || `${material.type} for ${customerProfile.company}`,
        previewUrl: material.data.previewUrl || `/crm/materials/preview/${material.id}`,
        assets: material.data.finalAssets || material.data.assets || [],
        qualityScore: material.data.qualityScore || 0.85,
        generatedAt: new Date().toISOString()
      })),
      sharingUrls,
      customerProfile,
      processingTime: Date.now(),
      analytics: {
        problemsAddressed: problems.length,
        valuePropsUsed: valueProps.length,
        materialsGenerated: generatedMaterials.length,
        averageQualityScore: generatedMaterials.reduce((sum, m) => sum + (m.data.qualityScore || 0.85), 0) / generatedMaterials.length
      }
    })

  } catch (error) {
    console.error('Error generating marketing materials:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate marketing materials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get generation status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Build query
    const where: any = { tenantId }
    if (customerId) where.customerId = customerId
    if (status) where.status = status

    const [infographics, materials] = await Promise.all([
      prisma.generatedInfographic.findMany({
        where,
        include: {
          template: { select: { name: true, category: true } },
          customer: { select: { name: true } }
        },
        orderBy: { generatedAt: 'desc' },
        take: limit
      }),
      prisma.personalizedMarketingMaterial.findMany({
        where: { tenantId, ...(customerId && { customerId }) },
        include: {
          customer: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ])

    const allMaterials = [
      ...infographics.map(ig => ({
        id: ig.id,
        type: 'INFOGRAPHIC',
        title: ig.title,
        customerId: ig.customerId,
        customerName: ig.customer?.name,
        templateName: ig.template?.name,
        previewUrl: ig.previewUrl,
        finalAssets: ig.finalAssets,
        qualityScore: Number(ig.qualityScore),
        viewCount: ig.viewCount || 0,
        downloadCount: ig.downloadCount || 0,
        status: ig.status,
        generatedAt: ig.generatedAt.toISOString(),
        isShared: ig.isShared,
        sharedUrl: ig.sharedUrl
      })),
      ...materials.map(mat => ({
        id: mat.id,
        type: mat.materialType,
        title: mat.title,
        customerId: mat.customerId,
        customerName: mat.customer?.name,
        templateName: mat.materialType,
        previewUrl: `/crm/materials/preview/${mat.id}`,
        finalAssets: mat.assets,
        qualityScore: 0.85, // Default for non-infographic materials
        viewCount: mat.openCount || 0,
        downloadCount: mat.downloadCount || 0,
        status: 'GENERATED',
        generatedAt: mat.createdAt.toISOString(),
        isShared: false,
        performance: {
          sent: mat.sent,
          opened: mat.opened,
          clicked: mat.clicked,
          converted: mat.converted
        }
      }))
    ].sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())

    return NextResponse.json({
      materials: allMaterials.slice(0, limit),
      total: allMaterials.length,
      summary: {
        totalGenerated: allMaterials.length,
        byType: allMaterials.reduce((acc, material) => {
          acc[material.type] = (acc[material.type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        averageQualityScore: allMaterials.reduce((sum, mat) => sum + mat.qualityScore, 0) / allMaterials.length,
        totalViews: allMaterials.reduce((sum, mat) => sum + mat.viewCount, 0),
        totalDownloads: allMaterials.reduce((sum, mat) => sum + mat.downloadCount, 0)
      }
    })

  } catch (error) {
    console.error('Error fetching generated materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generated materials' },
      { status: 500 }
    )
  }
}