/**
 * CoreFlow360 - Stripe Webhook Signature Verification
 * Handles webhook signature validation
 */

import Stripe from 'stripe'

export interface WebhookVerificationResult {
  success: boolean
  event?: Stripe.Event
  error?: string
}

/**
 * Verify Stripe webhook signature
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
  stripe: Stripe
): Promise<WebhookVerificationResult> {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret)
    return { success: true, event }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Invalid signature' 
    }
  }
}

/**
 * Extract tenant ID from webhook event metadata
 */
export function extractTenantId(event: Stripe.Event): string | null {
  const metadata = (event.data.object as any).metadata
  return metadata?.tenant_id || null
}

/**
 * Extract subscription metadata
 */
export function extractSubscriptionMetadata(event: Stripe.Event) {
  const obj = event.data.object as any
  const metadata = obj.metadata || {}
  
  return {
    tenantId: metadata.tenant_id,
    modules: metadata.modules?.split(',') || [],
    bundleKey: metadata.bundle_key || null,
    userCount: parseInt(metadata.user_count || '1'),
    billingCycle: (metadata.billing_cycle as 'monthly' | 'annual') || 'monthly',
    monthlyPrice: parseFloat(metadata.monthly_price || '0')
  }
}