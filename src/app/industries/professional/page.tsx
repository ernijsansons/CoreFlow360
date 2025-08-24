import V0Navigation from '@/components/marketing/V0Navigation'
import V0ProfessionalHero from '@/components/industries/V0ProfessionalHero'
import V0ProfessionalFeatures from '@/components/industries/V0ProfessionalFeatures'
import V0ProfessionalROICalculator from '@/components/industries/V0ProfessionalROICalculator'
import V0ProfessionalTestimonials from '@/components/industries/V0ProfessionalTestimonials'
import V0Pricing from '@/components/marketing/V0Pricing'

export default function ProfessionalPage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <V0ProfessionalHero />
      <V0ProfessionalFeatures />
      <V0ProfessionalROICalculator />
      <V0ProfessionalTestimonials />
      <V0Pricing />
    </main>
  )
}