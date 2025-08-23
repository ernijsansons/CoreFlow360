import V0Navigation from '@/components/marketing/V0Navigation'
import V0HVACHero from '@/components/industries/V0HVACHero'
import V0HVACFeatures from '@/components/industries/V0HVACFeatures'
import V0HVACROICalculator from '@/components/industries/V0HVACROICalculator'
import V0HVACTestimonials from '@/components/industries/V0HVACTestimonials'
import V0Pricing from '@/components/marketing/V0Pricing'

export const metadata = {
  title: 'HVAC Business Empire Builder | CoreFlow360 AI for Heating & Cooling',
  description: 'Transform your HVAC business into an automated empire with AI employees. Manage multiple locations, automate scheduling, and scale with intelligent heating & cooling business software.',
  keywords: 'HVAC software, heating cooling business automation, HVAC scheduling, multi-location HVAC management, HVAC empire builder'
}

export default function HVACPage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <V0HVACHero />
      <V0HVACFeatures />
      <V0HVACROICalculator />
      <V0HVACTestimonials />
      <V0Pricing />
    </main>
  )
}