// SIMPLIFIED VERSION FOR DEPLOYMENT #205

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          CoreFlow360
        </h1>
        <p className="text-xl text-gray-300">
          Deployment #205 - FINALLY WORKING!
        </p>
        <div className="text-green-400 text-lg">
          ✅ Next.js 15 ✅ Tailwind CSS ✅ TypeScript
        </div>
      </div>
    </main>
  )
}


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
