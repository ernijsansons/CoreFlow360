/**
 * CoreFlow360 - Lead Ingestion Webhook
 * Universal lead intake with intelligent routing to voice AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { leadQueue } from '@/lib/queues/lead-processor'
import { rateLimiter } from '@/lib/rate-limiting/lead-limiter'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

interface LeadSource {
  id: string
  name: string
  validator: (payload: any) => boolean
  parser: (payload: any) => ParsedLead
  webhookSecret?: string
}

interface ParsedLead {
  source: string
  sourceId: string
  contactName: string
  phone: string
  email?: string
  company?: string
  industry?: string
  serviceType?: string
  urgency?: 'low' | 'medium' | 'high' | 'emergency'
  customFields?: Record<string, any>
  metadata?: Record<string, any>
}

// Supported lead sources with extensible configuration
const LEAD_SOURCES: Record<string, LeadSource> = {
  meta: {
    id: 'meta',
    name: 'Meta (Facebook/Instagram)',
    validator: (payload) => payload.object === 'page' && payload.entry?.[0]?.changes?.[0]?.value?.leadgen_id,
    parser: parseMetaLead,
    webhookSecret: process.env.META_WEBHOOK_SECRET
  },
  
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot CRM',
    validator: (payload) => payload.objectType && payload.subscriptionType,
    parser: parseHubSpotLead
  },
  
  salesforce: {
    id: 'salesforce', 
    name: 'Salesforce CRM',
    validator: (payload) => payload.sobjectType && payload.event?.type,
    parser: parseSalesforceLead
  },
  
  zapier: {
    id: 'zapier',
    name: 'Zapier Integration', 
    validator: (payload) => payload.trigger_source === 'zapier',
    parser: parseZapierLead
  },
  
  webform: {
    id: 'webform',
    name: 'Website Contact Form',
    validator: (payload) => payload.form_id && payload.contact_name,
    parser: parseWebFormLead
  },
  
  api: {
    id: 'api',
    name: 'Direct API',
    validator: (payload) => payload.lead_source === 'api' && payload.contact_name && payload.phone,
    parser: parseAPILead
  }
}

/**
 * POST /api/leads/webhook
 * Universal lead ingestion endpoint
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await rateLimiter.checkLimit(clientIp)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        }, 
        { status: 429 }
      )
    }

    // Parse request payload
    const payload = await request.json()
    const source = identifyLeadSource(payload)
    
    if (!source) {
      return NextResponse.json(
        { error: 'Unsupported lead source' },
        { status: 400 }
      )
    }

    // Verify webhook signature if required
    if (source.webhookSecret) {
      const isValid = await verifyWebhookSignature(request, payload, source.webhookSecret)
      if (!isValid) {
        console.error(`Invalid webhook signature for source: ${source.id}`)
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Parse lead data using source-specific parser
    const parsedLead = source.parser(payload)
    
    // Validate required fields
    const validation = validateLeadData(parsedLead)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid lead data', details: validation.errors },
        { status: 400 }
      )
    }

    // Process lead through pipeline
    const result = await processLeadIngestion(parsedLead)
    
    // Log processing time for monitoring
    const processingTime = Date.now() - startTime
    console.log(`📥 Lead processed in ${processingTime}ms:`, {
      source: source.id,
      leadId: result.leadId,
      queuedForCall: result.queuedForCall,
      processingTime
    })

    return NextResponse.json({
      success: true,
      leadId: result.leadId,
      queuedForCall: result.queuedForCall,
      processingTime
    })
    
  } catch (error) {
    console.error('Lead webhook error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal processing error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/leads/webhook
 * Webhook verification for services like Meta
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  
  // Meta webhook verification
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Meta webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }
  
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

/**
 * Identify lead source from payload
 */
function identifyLeadSource(payload: any): LeadSource | null {
  for (const source of Object.values(LEAD_SOURCES)) {
    if (source.validator(payload)) {
      return source
    }
  }
  return null
}

/**
 * Verify webhook signature
 */
async function verifyWebhookSignature(
  request: NextRequest,
  payload: any,
  secret: string
): Promise<boolean> {
  const signature = request.headers.get('x-hub-signature-256')
  if (!signature) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
    
  return signature === `sha256=${expectedSignature}`
}

/**
 * Validate lead data
 */
function validateLeadData(lead: ParsedLead): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!lead.contactName?.trim()) {
    errors.push('Contact name is required')
  }
  
  if (!lead.phone?.trim()) {
    errors.push('Phone number is required')
  } else {
    try {
      const phoneNumber = parsePhoneNumber(lead.phone, 'US')
      if (!isValidPhoneNumber(lead.phone, 'US')) {
        errors.push('Invalid phone number format')
      }
    } catch (error) {
      errors.push('Invalid phone number format')
    }
  }
  
  if (!lead.source) {
    errors.push('Lead source is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Process lead through ingestion pipeline
 */
async function processLeadIngestion(parsedLead: ParsedLead) {
  try {
    // 1. Store lead in database
    const lead = await db.customer.create({
      data: {
        name: parsedLead.contactName,
        phone: parsedLead.phone,
        email: parsedLead.email,
        company: parsedLead.company,
        industry: parsedLead.industry,
        source: parsedLead.source,
        customFields: {
          serviceType: parsedLead.serviceType,
          urgency: parsedLead.urgency,
          sourceId: parsedLead.sourceId,
          ...parsedLead.customFields
        },
        metadata: parsedLead.metadata,
        createdAt: new Date()
      }
    })

    // 2. Check consent and subscription status
    const consentCheck = await checkConsentAndBundle(lead)
    
    if (!consentCheck.canCall) {
      console.log(`⚠️ Lead ${lead.id} not eligible for calling:`, consentCheck.reason)
      return {
        leadId: lead.id,
        queuedForCall: false,
        reason: consentCheck.reason
      }
    }

    // 3. Queue for AI voice call
    const callJob = await leadQueue.add('process-lead-call', {
      leadId: lead.id,
      leadData: parsedLead,
      priority: getCallPriority(parsedLead.urgency),
      bundleLevel: consentCheck.bundleLevel,
      tenantId: consentCheck.tenantId
    }, {
      priority: getJobPriority(parsedLead.urgency),
      delay: getCallDelay(parsedLead.urgency),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10000
      }
    })

    console.log(`📞 Lead ${lead.id} queued for AI call (Job: ${callJob.id})`)
    
    return {
      leadId: lead.id,
      queuedForCall: true,
      jobId: callJob.id,
      bundleLevel: consentCheck.bundleLevel
    }
    
  } catch (error) {
    console.error('Lead processing error:', error)
    throw new Error(`Failed to process lead: ${error.message}`)
  }
}

/**
 * Check consent status and subscription bundle
 */
async function checkConsentAndBundle(lead: any) {
  try {
    // Find tenant from phone number or create default
    const tenant = await db.tenant.findFirst({
      where: { 
        voiceFeaturesEnabled: true,
        // Add tenant matching logic based on your setup
      },
      select: {
        id: true,
        voiceFeaturesEnabled: true,
        tcpaEnabled: true,
        consentRequired: true,
        dailyCallLimit: true
      }
    })

    if (!tenant) {
      return {
        canCall: false,
        reason: 'No active voice-enabled tenant found'
      }
    }

    // Check TCPA consent if required
    if (tenant.tcpaEnabled && tenant.consentRequired) {
      const hasConsent = await db.callConsent.findFirst({
        where: {
          tenantId: tenant.id,
          phoneNumber: lead.phone,
          consentGiven: true,
          tcpaCompliant: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ],
          revokedAt: null
        }
      })

      if (!hasConsent) {
        return {
          canCall: false,
          reason: 'TCPA consent required but not found'
        }
      }
    }

    // Check DNC list
    const isDNC = await checkDNCList(lead.phone)
    if (isDNC) {
      return {
        canCall: false,
        reason: 'Phone number on Do Not Call list'
      }
    }

    // Check daily call limits
    const todayCallCount = await db.callLog.count({
      where: {
        tenantId: tenant.id,
        startedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    if (todayCallCount >= (tenant.dailyCallLimit || 1000)) {
      return {
        canCall: false,
        reason: 'Daily call limit reached'
      }
    }

    // Determine bundle level (mock implementation - replace with actual logic)
    const bundleLevel = determineBundleLevel(tenant.id)

    return {
      canCall: true,
      tenantId: tenant.id,
      bundleLevel,
      dailyCallsRemaining: (tenant.dailyCallLimit || 1000) - todayCallCount
    }
    
  } catch (error) {
    console.error('Consent/bundle check error:', error)
    return {
      canCall: false,
      reason: 'Error checking consent/bundle status'
    }
  }
}

/**
 * Check DNC list status
 */
async function checkDNCList(phoneNumber: string): Promise<boolean> {
  // Implementation would check against DNC providers like:
  // - National DNC Registry
  // - Internal DNC list
  // - State-specific registries
  
  // Mock implementation
  return false
}

/**
 * Determine subscription bundle level
 */
function determineBundleLevel(tenantId: string): string {
  // Mock implementation - replace with actual subscription logic
  return 'professional' // starter, professional, enterprise
}

/**
 * Get call priority based on urgency
 */
function getCallPriority(urgency: string = 'medium'): number {
  const priorities = {
    emergency: 1,
    high: 2,
    medium: 3,
    low: 4
  }
  return priorities[urgency] || 3
}

/**
 * Get job priority (lower number = higher priority)
 */
function getJobPriority(urgency: string = 'medium'): number {
  const priorities = {
    emergency: 1,
    high: 5,
    medium: 10,
    low: 15
  }
  return priorities[urgency] || 10
}

/**
 * Get call delay based on urgency
 */
function getCallDelay(urgency: string = 'medium'): number {
  const delays = {
    emergency: 0,        // Immediate
    high: 30000,         // 30 seconds
    medium: 300000,      // 5 minutes
    low: 1800000         // 30 minutes
  }
  return delays[urgency] || 300000
}

// ===========================================
// SOURCE-SPECIFIC PARSERS
// ===========================================

/**
 * Parse Meta (Facebook/Instagram) lead
 */
function parseMetaLead(payload: any): ParsedLead {
  const leadData = payload.entry[0]?.changes[0]?.value
  const fieldData = leadData?.field_data || []
  
  const getFieldValue = (name: string) => {
    const field = fieldData.find((f: any) => f.name === name)
    return field?.values?.[0] || ''
  }

  return {
    source: 'meta',
    sourceId: leadData?.leadgen_id,
    contactName: getFieldValue('full_name') || `${getFieldValue('first_name')} ${getFieldValue('last_name')}`.trim(),
    phone: getFieldValue('phone_number'),
    email: getFieldValue('email'),
    company: getFieldValue('company_name'),
    serviceType: getFieldValue('what_service_do_you_need'),
    urgency: determineUrgency(getFieldValue('urgency_level') || getFieldValue('when_do_you_need_service')),
    customFields: {
      adName: leadData?.ad_name,
      adId: leadData?.ad_id,
      formName: leadData?.form_name,
      pageId: leadData?.page_id
    },
    metadata: {
      platform: leadData?.platform || 'facebook',
      createdTime: leadData?.created_time,
      rawFieldData: fieldData
    }
  }
}

/**
 * Parse HubSpot lead
 */
function parseHubSpotLead(payload: any): ParsedLead {
  return {
    source: 'hubspot',
    sourceId: payload.objectId,
    contactName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
    phone: payload.phone,
    email: payload.email,
    company: payload.company,
    industry: payload.industry,
    serviceType: payload.service_interest,
    customFields: {
      lifecycleStage: payload.lifecyclestage,
      leadStatus: payload.hs_lead_status
    },
    metadata: {
      hubspotId: payload.objectId,
      subscriptionType: payload.subscriptionType
    }
  }
}

/**
 * Parse Salesforce lead
 */
function parseSalesforceLead(payload: any): ParsedLead {
  return {
    source: 'salesforce',
    sourceId: payload.sobject?.Id,
    contactName: `${payload.sobject?.FirstName || ''} ${payload.sobject?.LastName || ''}`.trim(),
    phone: payload.sobject?.Phone,
    email: payload.sobject?.Email,
    company: payload.sobject?.Company,
    industry: payload.sobject?.Industry,
    customFields: {
      leadSource: payload.sobject?.LeadSource,
      status: payload.sobject?.Status,
      rating: payload.sobject?.Rating
    },
    metadata: {
      salesforceId: payload.sobject?.Id,
      eventType: payload.event?.type
    }
  }
}

/**
 * Parse Zapier integration lead
 */
function parseZapierLead(payload: any): ParsedLead {
  return {
    source: 'zapier',
    sourceId: payload.id || payload.zapier_id,
    contactName: payload.name || payload.contact_name,
    phone: payload.phone,
    email: payload.email,
    company: payload.company,
    industry: payload.industry,
    serviceType: payload.service_type,
    urgency: payload.urgency,
    customFields: payload.custom_fields || {},
    metadata: {
      zapSource: payload.zap_source,
      originalSource: payload.original_source
    }
  }
}

/**
 * Parse website form lead
 */
function parseWebFormLead(payload: any): ParsedLead {
  return {
    source: 'webform',
    sourceId: payload.form_id + '_' + Date.now(),
    contactName: payload.contact_name || payload.name,
    phone: payload.phone,
    email: payload.email,
    company: payload.company,
    serviceType: payload.service_type || payload.interest,
    urgency: payload.urgency || payload.timeline,
    customFields: {
      formId: payload.form_id,
      formName: payload.form_name,
      pageUrl: payload.page_url,
      message: payload.message
    },
    metadata: {
      userAgent: payload.user_agent,
      ipAddress: payload.ip_address,
      referrer: payload.referrer
    }
  }
}

/**
 * Parse direct API lead
 */
function parseAPILead(payload: any): ParsedLead {
  return {
    source: 'api',
    sourceId: payload.id || payload.external_id,
    contactName: payload.contact_name || payload.name,
    phone: payload.phone,
    email: payload.email,
    company: payload.company,
    industry: payload.industry,
    serviceType: payload.service_type,
    urgency: payload.urgency,
    customFields: payload.custom_fields || {},
    metadata: payload.metadata || {}
  }
}

/**
 * Determine urgency from text input
 */
function determineUrgency(input: string = ''): 'low' | 'medium' | 'high' | 'emergency' {
  const lower = input.toLowerCase()
  
  if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately')) {
    return 'emergency'
  }
  
  if (lower.includes('today') || lower.includes('this week') || lower.includes('soon')) {
    return 'high'
  }
  
  if (lower.includes('next week') || lower.includes('next month')) {
    return 'medium'
  }
  
  return 'low'
}