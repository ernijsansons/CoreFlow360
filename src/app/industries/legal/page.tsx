import V0Navigation from '@/components/marketing/V0Navigation'
import V0LegalHero from '@/components/industries/V0LegalHero'
import V0LegalFeatures from '@/components/industries/V0LegalFeatures'
import V0LegalROICalculator from '@/components/industries/V0LegalROICalculator'
import V0LegalTestimonials from '@/components/industries/V0LegalTestimonials'
import V0Pricing from '@/components/marketing/V0Pricing'

export const metadata = {
  title: 'Legal Practice Empire Builder | CoreFlow360 AI for Law Firms',
  description: 'Transform your law firm into an automated empire with AI employees. Manage multiple offices, automate case research, and scale with intelligent legal practice management software.',
  keywords: 'legal practice management, law firm software, legal case automation, multi-office law firm, legal empire builder, AI legal research'
}

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <V0LegalHero />
      <V0LegalFeatures />
      <V0LegalROICalculator />
      <V0LegalTestimonials />
      <V0Pricing />
    </main>
  )
}