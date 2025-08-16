import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturesGrid } from '@/components/home/FeaturesGrid'
import { IndustryShowcase } from '@/components/home/IndustryShowcase'
import { PerformanceMetrics } from '@/components/home/PerformanceMetrics'
import { PricingSection } from '@/components/home/PricingSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { BetaCTA } from '@/components/marketing/BetaCTA'
import { CTASection } from '@/components/home/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section - The Awakening */}
      <HeroSection />

      {/* Features Grid - The Capabilities Showcase */}
      <FeaturesGrid />

      {/* Industry Showcase */}
      <IndustryShowcase />

      {/* Performance Metrics */}
      <PerformanceMetrics />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Beta CTA Section */}
      <section className="py-24 bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BetaCTA showBenefits={true} />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}