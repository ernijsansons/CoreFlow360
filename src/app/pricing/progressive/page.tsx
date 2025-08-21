'use client'

import { ProgressivePricingCalculator } from '@/components/pricing/progressive/ProgressivePricingCalculator'
import { ProgressivePricingShowcase } from '@/components/multi-business/ProgressivePricingShowcase'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ProgressivePricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Progressive Multi-Business Pricing
            </h1>
            <p className="text-xl text-gray-300">
              The more businesses you add, the more you save. Up to 50% off!
            </p>
          </div>
          
          <ProgressivePricingShowcase />
          <ProgressivePricingCalculator />
        </div>
      </div>
      <Footer />
    </div>
  )
}