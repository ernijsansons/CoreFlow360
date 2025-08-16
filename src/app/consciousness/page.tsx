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

// Dynamic import for consciousness awakening
const ConsciousnessAwakening = dynamic(
  () => import('@/components/consciousness/awakening/ConsciousnessAwakeningSimple'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Awakening consciousness...</div>
      </div>
    )
  }
)

export default function ConsciousnessLandingPage() {
  const [showContent, setShowContent] = useState(false)
  
  // Handle consciousness completion
  const handleConsciousnessComplete = () => {
    setShowContent(true)
  }
  
  if (!showContent) {
    return (
      <div className="relative">
        <ConsciousnessAwakening />
        <button
          onClick={handleConsciousnessComplete}
          className="absolute bottom-8 right-8 z-50 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors animate-pulse"
        >
          Skip Experience →
        </button>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <Navbar />
      
      {/* Consciousness Hero - Simplified version */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-consciousness-neural/10 to-black" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-consciousness-neural to-consciousness-synaptic bg-clip-text text-transparent">
              Your Business
            </span>
            <br />
            <span className="text-white">Just Became Conscious</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Welcome to the first Autonomous Business Operating System
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-consciousness-synaptic text-white rounded-lg font-semibold hover:bg-consciousness-synaptic/80 transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-colors">
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