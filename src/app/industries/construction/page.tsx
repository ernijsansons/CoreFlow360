import V0Navigation from '@/components/marketing/V0Navigation'
import V0ConstructionHero from '@/components/industries/V0ConstructionHero'
import V0ConstructionFeatures from '@/components/industries/V0ConstructionFeatures'
import V0ConstructionROICalculator from '@/components/industries/V0ConstructionROICalculator'
import V0ConstructionTestimonials from '@/components/industries/V0ConstructionTestimonials'
import V0Pricing from '@/components/marketing/V0Pricing'

export const metadata = {
  title: 'Construction Empire Builder | CoreFlow360 AI for Contractors',
  description: 'Transform your construction business into an automated empire with AI employees. Manage multiple sites, automate project management, and scale with intelligent construction software.',
  keywords: 'construction management software, contractor business automation, project management, multi-site construction management, construction empire builder'
}

export default function ConstructionPage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <V0ConstructionHero />
      <V0ConstructionFeatures />
      <V0ConstructionROICalculator />
      <V0ConstructionTestimonials />
      <V0Pricing />
    </main>
  )
}