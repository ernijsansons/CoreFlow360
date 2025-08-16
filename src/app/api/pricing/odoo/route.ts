/**
 * CoreFlow360 - Odoo-Style Pricing API
 * Enterprise-grade pricing endpoint with dynamic rules and intelligent optimization
 */

import { NextRequest, NextResponse } from 'next/server'
import { odooPricingEngine } from '@/lib/odoo-style-pricing-engine'
import { handleError, handleValidationError, ErrorContext } from '@/lib/error-handler'
import { sanitizeInput } from '@/middleware/security'

export async function POST(request: NextRequest) {
  const context: ErrorContext = {
    endpoint: '/api/pricing/odoo',
    method: 'POST',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  }

  try {
    const body = await request.json()
    
    // Sanitize input
    const sanitizedBody = sanitizeInput(body)
    
    // Calculate Odoo-style pricing
    const pricingResult = await odooPricingEngine.calculateOdooPricing(sanitizedBody)
    
    // Add metadata
    const response = {
      success: true,
      data: pricingResult,
      metadata: {
        calculatedAt: new Date().toISOString(),
        pricingEngine: 'odoo-style',
        version: '1.0.0',
        features: [
          'Dynamic pricing rules',
          'Volume discounts',
          'Commitment discounts',
          'ROI calculation',
          'TCO analysis',
          'Competitive analysis',
          'Intelligent recommendations'
        ]
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    return handleError(error, context)
  }
}

export async function GET(request: NextRequest) {
  const context: ErrorContext = {
    endpoint: '/api/pricing/odoo',
    method: 'GET',
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    requestId: request.headers.get('x-request-id') || undefined
  }

  try {
    // Return pricing information and available options
    const pricingInfo = {
      success: true,
      data: {
        pricingModels: [
          {
            key: 'standard',
            name: 'Standard',
            description: 'Perfect for small to medium businesses',
            features: ['Core modules', 'Standard support', 'Cloud deployment'],
            limitations: ['Up to 100 users', 'Basic analytics', 'Standard integrations']
          },
          {
            key: 'enterprise',
            name: 'Enterprise',
            description: 'Advanced features for large organizations',
            features: ['All modules', 'Premium support', 'Custom integrations', 'Advanced analytics'],
            limitations: ['None', 'Unlimited users', 'Full customization']
          },
          {
            key: 'custom',
            name: 'Custom',
            description: 'Tailored pricing for unique requirements',
            features: ['Custom modules', 'Dedicated support', 'On-premise deployment'],
            limitations: ['Custom limitations', 'Flexible terms']
          }
        ],
        contractTypes: [
          {
            key: 'subscription',
            name: 'Subscription',
            description: 'Monthly or annual recurring billing',
            benefits: ['Flexible', 'Scalable', 'No upfront costs']
          },
          {
            key: 'perpetual',
            name: 'Perpetual License',
            description: 'One-time purchase with annual maintenance',
            benefits: ['Ownership', 'Predictable costs', 'Long-term value']
          },
          {
            key: 'usage-based',
            name: 'Usage-Based',
            description: 'Pay only for what you use',
            benefits: ['Cost optimization', 'Scalable', 'Fair pricing']
          }
        ],
        deploymentTypes: [
          {
            key: 'cloud',
            name: 'Cloud',
            description: 'Hosted in our secure cloud infrastructure',
            benefits: ['No infrastructure', 'Automatic updates', 'High availability']
          },
          {
            key: 'on-premise',
            name: 'On-Premise',
            description: 'Deployed in your own infrastructure',
            benefits: ['Full control', 'Data sovereignty', 'Custom security']
          },
          {
            key: 'hybrid',
            name: 'Hybrid',
            description: 'Combination of cloud and on-premise',
            benefits: ['Flexibility', 'Optimized costs', 'Best of both worlds']
          }
        ],
        supportLevels: [
          {
            key: 'basic',
            name: 'Basic Support',
            price: 'Included',
            features: ['Email support', 'Documentation', 'Community forum'],
            responseTime: '24 hours'
          },
          {
            key: 'standard',
            name: 'Standard Support',
            price: '+50%',
            features: ['Email support', 'Phone support', 'Documentation', 'Training videos'],
            responseTime: '8 hours'
          },
          {
            key: 'premium',
            name: 'Premium Support',
            price: '+100%',
            features: ['Priority support', 'Phone support', 'Video calls', 'Custom training'],
            responseTime: '4 hours'
          },
          {
            key: 'enterprise',
            name: 'Enterprise Support',
            price: '+200%',
            features: ['Dedicated support', '24/7 phone support', 'On-site training', 'Custom development'],
            responseTime: '1 hour'
          }
        ],
        discountTypes: [
          {
            type: 'volume',
            description: 'Volume discounts for large user counts',
            tiers: [
              { users: '20+', discount: '10%' },
              { users: '50+', discount: '15%' },
              { users: '100+', discount: '20%' },
              { users: '250+', discount: '25%' }
            ]
          },
          {
            type: 'commitment',
            description: 'Commitment discounts for long-term contracts',
            tiers: [
              { months: '12+', discount: '15%' },
              { months: '24+', discount: '20%' },
              { months: '36+', discount: '25%' }
            ]
          },
          {
            type: 'billing',
            description: 'Billing cycle discounts',
            tiers: [
              { cycle: 'quarterly', discount: '5%' },
              { cycle: 'annual', discount: '15%' }
            ]
          },
          {
            type: 'partner',
            description: 'Partner program discounts',
            tiers: [
              { level: 'Silver', discount: '10%' },
              { level: 'Gold', discount: '15%' },
              { level: 'Platinum', discount: '20%' }
            ]
          }
        ],
        addons: [
          {
            key: 'advanced_analytics',
            name: 'Advanced Analytics',
            price: '$50/user/month',
            description: 'Advanced reporting and business intelligence',
            features: ['Custom dashboards', 'Predictive analytics', 'Data visualization']
          },
          {
            key: 'custom_integrations',
            name: 'Custom Integrations',
            price: '$100/month',
            description: 'Custom API integrations and workflows',
            features: ['API access', 'Webhook support', 'Custom connectors']
          },
          {
            key: 'white_label',
            name: 'White Label',
            price: '$500/month',
            description: 'White-label the platform for your brand',
            features: ['Custom branding', 'Domain customization', 'Branded emails']
          },
          {
            key: 'dedicated_support',
            name: 'Dedicated Support',
            price: '$1000/month',
            description: 'Dedicated support representative',
            features: ['Personal account manager', 'Priority support', 'Custom training']
          }
        ]
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        pricingEngine: 'odoo-style',
        version: '1.0.0'
      }
    }

    return NextResponse.json(pricingInfo, { status: 200 })

  } catch (error) {
    return handleError(error, context)
  }
}
