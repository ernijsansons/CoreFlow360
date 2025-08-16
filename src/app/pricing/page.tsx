/**
 * CoreFlow360 - Pricing Page
 * Live module selection and pricing with Stripe integration
 */

import type { Metadata } from 'next'
import { seoOptimizer } from '@/lib/seo/meta-optimizer'
import PricingPageContent from '@/components/pricing/PricingPageContent'

export const metadata: Metadata = seoOptimizer.generateMetadata(
  seoOptimizer.getPricingPageSEO()
)

export default function PricingPage() {
  return <PricingPageContent />
}