import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { SocialProofSection } from '@/components/home/SocialProofSection'
import { InteractiveROICalculator } from '@/components/home/InteractiveROICalculator'
import { UrgencySection } from '@/components/home/UrgencySection'
import { FeaturesGrid } from '@/components/home/FeaturesGrid'
import { IndustryShowcase } from '@/components/home/IndustryShowcase'
import { RiskReversalSection } from '@/components/home/RiskReversalSection'
import { PerformanceMetrics } from '@/components/home/PerformanceMetrics'
import { PricingSection } from '@/components/home/PricingSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { VideoTestimonials } from '@/components/testimonials/VideoTestimonials'
import { FAQSection } from '@/components/sections/FAQSection'
import { BetaCTA } from '@/components/marketing/BetaCTA'
import { CTASection } from '@/components/home/CTASection'
import { LiveChat } from '@/components/chat/LiveChat'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section - The Awakening */}
      <HeroSection />

      {/* Social Proof Section - Trust & Credibility */}
      <SocialProofSection />

      {/* Interactive ROI Calculator - Conversion Machine */}
      <InteractiveROICalculator />

      {/* Urgency Section - FOMO & Scarcity */}
      <UrgencySection />

      {/* Features Grid - The Capabilities Showcase */}
      <FeaturesGrid />

      {/* Industry Showcase */}
      <IndustryShowcase />

      {/* Risk Reversal - Remove All Objections */}
      <RiskReversalSection />

      {/* Performance Metrics */}
      <PerformanceMetrics />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Video Testimonials */}
      <VideoTestimonials />

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
      
      {/* Live Chat Widget */}
      <LiveChat />
    </div>
  )
}