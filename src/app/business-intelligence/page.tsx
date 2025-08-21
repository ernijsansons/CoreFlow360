'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FeaturesGrid } from '@/components/home/FeaturesGrid'
import { IndustryShowcase } from '@/components/home/IndustryShowcase'
import { PerformanceMetrics } from '@/components/home/PerformanceMetrics'
import { PricingSection } from '@/components/home/PricingSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { BetaCTA } from '@/components/marketing/BetaCTA'
import { CTASection } from '@/components/home/CTASection'

// Dynamic import for business intelligence awakening
const BusinessIntelligenceAwakening = dynamic(
  () => import('@/components/business-intelligence/awakening/BusinessIntelligenceAwakening'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Awakening business intelligence...</div>
      </div>
    ),
  }
)

export default function BusinessIntelligenceLandingPage() {
  const [showContent, setShowContent] = useState(false)

  // Handle business intelligence completion
  const handleBusinessIntelligenceComplete = () => {
    setShowContent(true)
  }

  if (!showContent) {
    return (
      <div className="relative">
        <BusinessIntelligenceAwakening />
        <button
          onClick={handleBusinessIntelligenceComplete}
          className="absolute right-8 bottom-8 z-50 animate-pulse rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Skip Experience →
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* Navigation */}
      <Navbar />

      {/* Business Intelligence Hero - Simplified version */}
      <section className="relative flex min-h-screen items-center justify-center">
        <div className="via-cyan-400/10 absolute inset-0 bg-gradient-to-b from-black to-black" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            <span className="from-cyan-400 to-purple-400 bg-gradient-to-r bg-clip-text text-transparent">
              Your Business
            </span>
            <br />
            <span className="text-white">Just Became Intelligent</span>
          </h1>
          <p className="mb-8 text-xl text-gray-300 md:text-2xl">
            Welcome to the first Autonomous Business Operating System
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-cyan-600 hover:bg-cyan-600/80 rounded-lg px-8 py-4 font-semibold text-white transition-colors">
              Start Free Trial
            </button>
            <button className="rounded-lg border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

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
      <section className="bg-gray-950 py-24">
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
