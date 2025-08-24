/**
 * CoreFlow360 - Pricing Page
 * Live module selection and pricing with Stripe integration
 */

import V0Navigation from '@/components/marketing/V0Navigation'
import V0ProgressivePricing from '@/components/marketing/V0ProgressivePricing'
import V0ROICalculator from '@/components/marketing/V0ROICalculator'
import V0SuccessStories from '@/components/marketing/V0SuccessStories'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <div className="pt-16">
        <V0ProgressivePricing />
        <V0ROICalculator />
        <V0SuccessStories />
      </div>
    </main>
  )
}
