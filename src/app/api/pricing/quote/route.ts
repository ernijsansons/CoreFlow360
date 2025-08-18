/**
 * CoreFlow360 - Quote Generation API
 * Generate detailed pricing quotes with terms and Stripe integration preparation
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const QuoteRequestSchema = z.object({
  // Customer information
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactName: z.string().min(1, "Contact name is required"),
  
  // Subscription details
  modules: z.array(z.string()).min(1, "At least one module is required"),
  userCount: z.number().min(1, "User count must be at least 1"),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  
  // Optional preferences
  industry: z.string().optional(),
  bundleKey: z.string().optional(),
  customRequirements: z.string().optional(),
  
  // Quote options
  includeImplementation: z.boolean().default(false),
  includeTraining: z.boolean().default(false),
  includeSupport: z.boolean().default(true)
})

interface QuoteLineItem {
  type: 'module' | 'bundle' | 'setup' | 'service'
  name: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  billingFrequency: 'one-time' | 'monthly' | 'annual'
}

interface GeneratedQuote {
  quoteId: string
  companyName: string
  contactEmail: string
  contactName: string
  quoteDate: string
  validUntil: string
  
  subscription: {
    modules: string[]
    userCount: number
    billingCycle: 'monthly' | 'annual'
    bundleApplied?: string
  }
  
  lineItems: QuoteLineItem[]
  
  pricing: {
    subtotal: number
    discounts: Array<{
      type: string
      description: string
      amount: number
    }>
    setupFees: number
    monthlyRecurring: number
    annualTotal?: number
    firstInvoiceTotal: number
  }
  
  terms: {
    paymentTerms: string
    billingFrequency: string
    autoRenewal: boolean
    cancellationPolicy: string
    supportLevel: string
  }
  
  nextSteps: {
    stripeCheckoutReady: boolean
    implementationRequired: boolean
    trainingIncluded: boolean
    estimatedGoLiveDate: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = QuoteRequestSchema.parse(body)
    
    const {
      companyName,
      contactEmail,
      contactName,
      modules,
      userCount,
      billingCycle,
      industry,
      bundleKey,
      customRequirements,
      includeImplementation,
      includeTraining,
      includeSupport
    } = validatedData

    // Generate unique quote ID
    const quoteId = `CX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Fetch module definitions
    const moduleDefinitions = await prisma.moduleDefinition.findMany({
      where: {
        moduleKey: { in: modules },
        isActive: true
      }
    })

    // Check if bundle was specified
    let bundleDefinition = null
    if (bundleKey) {
      bundleDefinition = await prisma.bundleDefinition.findUnique({
        where: { bundleKey, isActive: true }
      })
    }

    // Calculate pricing
    let lineItems: QuoteLineItem[] = []
    let subtotal = 0
    let setupFees = 0

    if (bundleDefinition) {
      // Use bundle pricing
      const bundlePrice = Math.max(
        bundleDefinition.basePrice, 
        bundleDefinition.perUserPrice * userCount
      )
      
      lineItems.push({
        type: 'bundle',
        name: bundleDefinition.name,
        description: bundleDefinition.description,
        quantity: userCount,
        unitPrice: bundleDefinition.perUserPrice,
        totalPrice: bundlePrice,
        billingFrequency: billingCycle === 'annual' ? 'annual' : 'monthly'
      })
      
      subtotal = bundlePrice
    } else {
      // Individual module pricing
      for (const module of moduleDefinitions) {
        const modulePrice = Math.max(module.basePrice, module.perUserPrice * userCount)
        
        lineItems.push({
          type: 'module',
          name: module.name,
          description: module.description,
          quantity: userCount,
          unitPrice: module.perUserPrice,
          totalPrice: modulePrice,
          billingFrequency: billingCycle === 'annual' ? 'annual' : 'monthly'
        })
        
        subtotal += modulePrice
        setupFees += module.setupFee || 0
      }
    }

    // Add setup fees as line items
    if (setupFees > 0) {
      lineItems.push({
        type: 'setup',
        name: 'Setup & Configuration',
        description: 'One-time setup and configuration of selected modules',
        quantity: 1,
        unitPrice: setupFees,
        totalPrice: setupFees,
        billingFrequency: 'one-time'
      })
    }

    // Add optional services
    if (includeImplementation) {
      const implementationFee = userCount <= 10 ? 500 : userCount <= 50 ? 1500 : 3000
      lineItems.push({
        type: 'service',
        name: 'Implementation Services',
        description: 'Dedicated implementation support and data migration',
        quantity: 1,
        unitPrice: implementationFee,
        totalPrice: implementationFee,
        billingFrequency: 'one-time'
      })
      setupFees += implementationFee
    }

    if (includeTraining) {
      const trainingFee = userCount <= 10 ? 300 : userCount <= 50 ? 800 : 1500
      lineItems.push({
        type: 'service',
        name: 'Training Sessions',
        description: 'Comprehensive user training and best practices workshops',
        quantity: 1,
        unitPrice: trainingFee,
        totalPrice: trainingFee,
        billingFrequency: 'one-time'
      })
      setupFees += trainingFee
    }

    // Apply discounts
    const discounts: Array<{ type: string; description: string; amount: number }> = []
    let discountedSubtotal = subtotal

    // Annual billing discount (10%)
    if (billingCycle === 'annual') {
      const annualDiscount = subtotal * 0.10
      discounts.push({
        type: 'annual',
        description: '10% Annual Billing Discount',
        amount: annualDiscount
      })
      discountedSubtotal -= annualDiscount
    }

    // Volume discounts
    if (userCount >= 50) {
      const volumeDiscount = subtotal * 0.10
      discounts.push({
        type: 'volume',
        description: '10% Volume Discount (50+ Users)',
        amount: volumeDiscount
      })
      discountedSubtotal -= volumeDiscount
    } else if (userCount >= 25) {
      const volumeDiscount = subtotal * 0.05
      discounts.push({
        type: 'volume',
        description: '5% Volume Discount (25+ Users)',
        amount: volumeDiscount
      })
      discountedSubtotal -= volumeDiscount
    }

    // Calculate totals
    const monthlyRecurring = Math.round(discountedSubtotal * 100) / 100
    const annualTotal = billingCycle === 'annual' ? monthlyRecurring : monthlyRecurring * 12
    const firstInvoiceTotal = monthlyRecurring + setupFees

    // Generate quote
    const quote: GeneratedQuote = {
      quoteId,
      companyName,
      contactEmail,
      contactName,
      quoteDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      
      subscription: {
        modules,
        userCount,
        billingCycle,
        bundleApplied: bundleKey
      },
      
      lineItems,
      
      pricing: {
        subtotal,
        discounts,
        setupFees,
        monthlyRecurring,
        annualTotal: billingCycle === 'annual' ? annualTotal : undefined,
        firstInvoiceTotal
      },
      
      terms: {
        paymentTerms: billingCycle === 'annual' ? 'Annual prepayment' : 'Monthly in advance',
        billingFrequency: billingCycle,
        autoRenewal: true,
        cancellationPolicy: '30-day notice required',
        supportLevel: includeSupport ? 'Standard support included' : 'Self-service support'
      },
      
      nextSteps: {
        stripeCheckoutReady: true,
        implementationRequired: includeImplementation,
        trainingIncluded: includeTraining,
        estimatedGoLiveDate: calculateGoLiveDate(includeImplementation, includeTraining)
      }
    }

    // TODO: Store quote in database for follow-up
    // await storeQuote(quote)

    return NextResponse.json({
      success: true,
      quote
    })

  } catch (error) {
    console.error('Quote generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid quote request', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    )
  }
}

function calculateGoLiveDate(includeImplementation: boolean, includeTraining: boolean): string {
  let daysFromNow = 1 // Same day for self-service

  if (includeImplementation) {
    daysFromNow += 14 // 2 weeks for implementation
  }

  if (includeTraining) {
    daysFromNow += 3 // Additional days for training
  }

  const goLiveDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
  return goLiveDate.toISOString().split('T')[0]
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to this endpoint with quote generation parameters',
    schema: {
      companyName: 'string',
      contactEmail: 'string (email)',
      contactName: 'string',
      modules: 'string[]',
      userCount: 'number',
      billingCycle: 'monthly | annual',
      industry: 'string (optional)',
      bundleKey: 'string (optional)',
      includeImplementation: 'boolean (default: false)',
      includeTraining: 'boolean (default: false)',
      includeSupport: 'boolean (default: true)'
    }
  })
}