import { Navbar } from '@/components/layout/Navbar'
import { IndustryNavigationCompact } from '@/components/layout/IndustryNavigation'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { MultiBusinessShowcase } from '@/components/home/MultiBusinessShowcase'
import { ProgressivePricingPreview } from '@/components/home/ProgressivePricingPreview'
import { SocialProofSection } from '@/components/home/SocialProofSection'
import { InteractiveROICalculator } from '@/components/home/InteractiveROICalculator'
import { UrgencySection } from '@/components/home/UrgencySection'
import { FeaturesGrid } from '@/components/home/FeaturesGrid'
import { IndustryShowcase } from '@/components/home/IndustryShowcase'
import { AIFeaturesShowcase } from '@/components/home/AIFeaturesShowcase'
import { HVACSpecializationSection } from '@/components/home/HVACSpecializationSection'
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
    <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Industry Navigation */}
      <IndustryNavigationCompact />

      {/* Hero Section - The Awakening */}
      <HeroSection />

      {/* Multi-Business Showcase - Portfolio Management */}
      <MultiBusinessShowcase />

      {/* Progressive Pricing Preview - Save More as You Grow */}
      <ProgressivePricingPreview />

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

      {/* AI Features Showcase - Business Intelligence */}
      <AIFeaturesShowcase />

      {/* HVAC Specialization - Proven Industry Success */}
      <HVACSpecializationSection />

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
      <section className="bg-gray-950 py-24">
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
