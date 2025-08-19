import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { RealTimePrivacyMonitor } from '@/lib/security/privacy-audit'
import { z } from 'zod'

const WebhookEventSchema = z.object({
  event_type: z.string(),
  tenant_id: z.string(),
  user_id: z.string().optional(),
  timestamp: z.string(),
  data: z.record(z.any()),
  source: z.string(),
  signature: z.string().optional(),
})

const ConsentWebhookSchema = z.object({
  event_type: z.literal('consent_updated'),
  data: z.object({
    user_id: z.string(),
    consent_type: z.string(),
    consent_given: z.boolean(),
    purposes: z.array(z.string()),
    timestamp: z.string(),
  }),
})

const DataAccessWebhookSchema = z.object({
  event_type: z.literal('data_accessed'),
  data: z.object({
    user_id: z.string(),
    data_categories: z.array(z.string()),
    access_method: z.string(),
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
    timestamp: z.string(),
  }),
})

const DataExportWebhookSchema = z.object({
  event_type: z.literal('data_exported'),
  data: z.object({
    user_id: z.string(),
    export_format: z.string(),
    data_categories: z.array(z.string()),
    file_size: z.number(),
    download_url: z.string(),
    timestamp: z.string(),
  }),
})

const DataDeletionWebhookSchema = z.object({
  event_type: z.literal('data_deleted'),
  data: z.object({
    user_id: z.string(),
    data_categories: z.array(z.string()),
    deletion_method: z.string(),
    systems_affected: z.array(z.string()),
    timestamp: z.string(),
  }),
})

const BreachDetectionWebhookSchema = z.object({
  event_type: z.literal('breach_detected'),
  data: z.object({
    incident_id: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    affected_users: z.number(),
    data_types: z.array(z.string()),
    detection_method: z.string(),
    timestamp: z.string(),
  }),
})

// Privacy webhook events registry
const PRIVACY_WEBHOOK_EVENTS = [
  'consent_updated',
  'consent_withdrawn',
  'data_accessed',
  'data_exported',
  'data_deleted',
  'data_corrected',
  'breach_detected',
  'policy_updated',
  'compliance_violation',
  'vendor_assessment_completed',
  'risk_threshold_exceeded',
] as const

export async function POST(request: NextRequest) {
  try {
    const headersList = headers()
    const signature = headersList.get('x-privacy-signature')
    const eventType = headersList.get('x-event-type')
    const source = headersList.get('x-source') || 'unknown'

    // Verify webhook signature if provided
    if (signature && !(await verifyWebhookSignature(request, signature))) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const body = await request.json()

    // Validate webhook payload
    const validatedEvent = WebhookEventSchema.parse(body)

    // Route to appropriate handler based on event type
    switch (validatedEvent.event_type) {
      case 'consent_updated':
        return await handleConsentUpdate(validatedEvent)

      case 'consent_withdrawn':
        return await handleConsentWithdrawal(validatedEvent)

      case 'data_accessed':
        return await handleDataAccess(validatedEvent)

      case 'data_exported':
        return await handleDataExport(validatedEvent)

      case 'data_deleted':
        return await handleDataDeletion(validatedEvent)

      case 'data_corrected':
        return await handleDataCorrection(validatedEvent)

      case 'breach_detected':
        return await handleBreachDetection(validatedEvent)

      case 'policy_updated':
        return await handlePolicyUpdate(validatedEvent)

      case 'compliance_violation':
        return await handleComplianceViolation(validatedEvent)

      case 'vendor_assessment_completed':
        return await handleVendorAssessment(validatedEvent)

      case 'risk_threshold_exceeded':
        return await handleRiskThresholdExceeded(validatedEvent)

      default:
        return NextResponse.json({
          warning: `Unknown event type: ${validatedEvent.event_type}`,
          processed: false,
        })
    }
  } catch (error) {
    // Return different status codes based on error type
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid webhook payload',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON payload',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Webhook processing failed',
      },
      { status: 500 }
    )
  }
}

async function verifyWebhookSignature(request: NextRequest, signature: string): Promise<boolean> {
  // Implement webhook signature verification
  // This would typically use HMAC-SHA256 with a shared secret
  try {
    const payload = await request.text()
    const expectedSignature = `sha256=${generateHMAC(payload, process.env.PRIVACY_WEBHOOK_SECRET || '')}`
    return signature === expectedSignature
  } catch (error) {
    return false
  }
}

function generateHMAC(payload: string, secret: string): string {
  // Mock HMAC generation - in real implementation, use crypto.createHmac
  return Buffer.from(`${payload}:${secret}`).toString('base64').slice(0, 32)
}

async function handleConsentUpdate(event: unknown) {
  const consentData = ConsentWebhookSchema.parse(event)
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    userId: consentData.data.user_id,
    eventType: 'consent_change',
    severity: 'low',
    description: `User updated consent for purposes: ${consentData.data.purposes.join(', ')}`,
    metadata: {
      purposes: consentData.data.purposes,
      consent_given: consentData.data.consent_given,
      consent_type: consentData.data.consent_type,
    },
    complianceImpact: 'none',
    autoResolved: true,
    requiresAction: false,
  })

  return NextResponse.json({
    success: true,
    message: 'Consent update processed successfully',
  })
}

async function handleConsentWithdrawal(event: unknown) {
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    userId: event.data.user_id,
    eventType: 'consent_change',
    severity: 'medium',
    description: 'User withdrew consent - data processing restrictions now apply',
    metadata: {
      withdrawn_purposes: event.data.purposes || [],
      withdrawal_method: event.data.method || 'unknown',
    },
    complianceImpact: 'major',
    autoResolved: false,
    requiresAction: true,
  })

  return NextResponse.json({
    success: true,
    message: 'Consent withdrawal processed successfully',
  })
}

async function handleDataAccess(event: unknown) {
  const accessData = DataAccessWebhookSchema.parse(event)
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  // Determine if this is suspicious access
  const isSuspicious = await evaluateAccessSuspiciousness(accessData.data)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    userId: accessData.data.user_id,
    eventType: 'data_access',
    severity: isSuspicious ? 'high' : 'low',
    description: `Data access: ${accessData.data.data_categories.join(', ')} via ${accessData.data.access_method}`,
    metadata: {
      data_categories: accessData.data.data_categories,
      access_method: accessData.data.access_method,
      ip_address: accessData.data.ip_address,
      user_agent: accessData.data.user_agent,
      suspicious: isSuspicious,
    },
    complianceImpact: isSuspicious ? 'major' : 'none',
    autoResolved: !isSuspicious,
    requiresAction: isSuspicious,
  })

  return NextResponse.json({
    success: true,
    message: 'Data access event processed successfully',
    flags: isSuspicious ? ['suspicious_access'] : [],
  })
}

async function handleDataExport(event: unknown) {
  const exportData = DataExportWebhookSchema.parse(event)
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  // Check if export is unusually large
  const isLargeExport = exportData.data.file_size > 100 * 1024 * 1024 // 100MB threshold

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    userId: exportData.data.user_id,
    eventType: 'data_export',
    severity: isLargeExport ? 'medium' : 'low',
    description: `Data exported in ${exportData.data.export_format} format (${formatFileSize(exportData.data.file_size)})`,
    metadata: {
      export_format: exportData.data.export_format,
      data_categories: exportData.data.data_categories,
      file_size: exportData.data.file_size,
      download_url: exportData.data.download_url,
      large_export: isLargeExport,
    },
    complianceImpact: 'minor',
    autoResolved: true,
    requiresAction: false,
  })

  return NextResponse.json({
    success: true,
    message: 'Data export event processed successfully',
    flags: isLargeExport ? ['large_export'] : [],
  })
}

async function handleDataDeletion(event: unknown) {
  const deletionData = DataDeletionWebhookSchema.parse(event)
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    userId: deletionData.data.user_id,
    eventType: 'data_deletion',
    severity: 'low',
    description: `Data deleted from ${deletionData.data.systems_affected.length} systems: ${deletionData.data.data_categories.join(', ')}`,
    metadata: {
      data_categories: deletionData.data.data_categories,
      deletion_method: deletionData.data.deletion_method,
      systems_affected: deletionData.data.systems_affected,
    },
    complianceImpact: 'minor',
    autoResolved: true,
    requiresAction: false,
  })

  return NextResponse.json({
    success: true,
    message: 'Data deletion event processed successfully',
  })
}

async function handleDataCorrection(event: unknown) {
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    userId: event.data.user_id,
    eventType: 'data_access', // Using data_access as correction type
    severity: 'low',
    description: `Data corrected: ${event.data.fields_corrected?.join(', ') || 'multiple fields'}`,
    metadata: {
      fields_corrected: event.data.fields_corrected || [],
      correction_method: event.data.correction_method || 'manual',
    },
    complianceImpact: 'minor',
    autoResolved: true,
    requiresAction: false,
  })

  return NextResponse.json({
    success: true,
    message: 'Data correction event processed successfully',
  })
}

async function handleBreachDetection(event: unknown) {
  const breachData = BreachDetectionWebhookSchema.parse(event)
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    eventType: 'breach_detection',
    severity: breachData.data.severity === 'critical' ? 'critical' : 'high',
    description: `Data breach detected: ${breachData.data.affected_users} users affected, data types: ${breachData.data.data_types.join(', ')}`,
    metadata: {
      incident_id: breachData.data.incident_id,
      affected_users: breachData.data.affected_users,
      data_types: breachData.data.data_types,
      detection_method: breachData.data.detection_method,
    },
    complianceImpact: 'critical',
    autoResolved: false,
    requiresAction: true,
  })

  // Trigger additional breach response procedures
  await triggerBreachResponse(event.tenant_id, breachData.data)

  return NextResponse.json({
    success: true,
    message: 'Breach detection event processed successfully',
    incident_id: breachData.data.incident_id,
    severity: breachData.data.severity,
  })
}

async function handlePolicyUpdate(event: unknown) {
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    eventType: 'policy_update',
    severity: 'medium',
    description: `Privacy policy updated: ${event.data.policy_type || 'privacy policy'}`,
    metadata: {
      policy_type: event.data.policy_type,
      version: event.data.version,
      changes_summary: event.data.changes_summary,
    },
    complianceImpact: 'minor',
    autoResolved: false,
    requiresAction: true,
  })

  return NextResponse.json({
    success: true,
    message: 'Policy update event processed successfully',
  })
}

async function handleComplianceViolation(event: unknown) {
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    userId: event.data.user_id,
    eventType: 'consent_violation',
    severity: event.data.severity || 'high',
    description: `Compliance violation detected: ${event.data.violation_type}`,
    metadata: {
      violation_type: event.data.violation_type,
      regulation: event.data.regulation,
      description: event.data.description,
      remediation_required: event.data.remediation_required,
    },
    complianceImpact: 'critical',
    autoResolved: false,
    requiresAction: true,
  })

  return NextResponse.json({
    success: true,
    message: 'Compliance violation event processed successfully',
    violation_type: event.data.violation_type,
  })
}

async function handleVendorAssessment(event: unknown) {
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    eventType: 'policy_update',
    severity: event.data.risk_level === 'high' ? 'high' : 'medium',
    description: `Vendor privacy assessment completed: ${event.data.vendor_name}`,
    metadata: {
      vendor_name: event.data.vendor_name,
      assessment_score: event.data.assessment_score,
      risk_level: event.data.risk_level,
      recommendations: event.data.recommendations,
    },
    complianceImpact: event.data.risk_level === 'high' ? 'major' : 'minor',
    autoResolved: false,
    requiresAction: event.data.risk_level === 'high',
  })

  return NextResponse.json({
    success: true,
    message: 'Vendor assessment event processed successfully',
    vendor: event.data.vendor_name,
    risk_level: event.data.risk_level,
  })
}

async function handleRiskThresholdExceeded(event: unknown) {
  const monitor = new RealTimePrivacyMonitor(event.tenant_id)

  await monitor.trackPrivacyEvent({
    tenantId: event.tenant_id,
    eventType: 'consent_violation',
    severity: 'high',
    description: `Privacy risk threshold exceeded: ${event.data.risk_type}`,
    metadata: {
      risk_type: event.data.risk_type,
      current_value: event.data.current_value,
      threshold: event.data.threshold,
      trend: event.data.trend,
    },
    complianceImpact: 'major',
    autoResolved: false,
    requiresAction: true,
  })

  return NextResponse.json({
    success: true,
    message: 'Risk threshold exceeded event processed successfully',
    risk_type: event.data.risk_type,
  })
}

async function evaluateAccessSuspiciousness(accessData: unknown): Promise<boolean> {
  // Implement suspicious access detection logic
  // This is a simplified version - in production, use ML models

  const suspiciousIndicators = [
    accessData.access_method === 'bulk_api',
    accessData.data_categories.length > 5,
    accessData.ip_address && isVPNOrTorIP(accessData.ip_address),
    isOffHoursAccess(new Date()),
  ]

  return suspiciousIndicators.filter(Boolean).length >= 2
}

function isVPNOrTorIP(ipAddress: string): boolean {
  // Mock VPN/Tor detection - in production, use IP intelligence services
  const knownVPNRanges = ['192.168.', '10.0.', '172.16.']
  return knownVPNRanges.some((range) => ipAddress.startsWith(range))
}

function isOffHoursAccess(timestamp: Date): boolean {
  const hour = timestamp.getHours()
  return hour < 6 || hour > 22 // Outside 6 AM - 10 PM
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

async function triggerBreachResponse(_tenantId: string, _breachData: unknown) {
  // Implement breach response procedures
  // In production, this would:
  // 1. Notify relevant stakeholders
  // 2. Initiate incident response procedures
  // 3. Prepare regulatory notifications
  // 4. Document the incident
  // 5. Begin containment and remediation
}
