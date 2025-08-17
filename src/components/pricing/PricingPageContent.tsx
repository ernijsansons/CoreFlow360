'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ModuleSelectionDashboard from '@/components/subscription/ModuleSelectionDashboard'
import CheckoutFlow from '@/components/subscription/CheckoutFlow'

export default function PricingPageContent() {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutSelection, setCheckoutSelection] = useState<any>(null)

  const handleCheckout = (selection: any) => {
    setCheckoutSelection(selection)
    setShowCheckout(true)
  }

  const handleCheckoutSuccess = (sessionId: string) => {
    // In production, you might want to track this conversion
    console.log('Checkout session created:', sessionId)
  }

  const handleCheckoutCancel = () => {
    setShowCheckout(false)
    setCheckoutSelection(null)
  }

  const faqData = [
    {
      question: "Can I change my modules later?",
      answer: "Yes! You can add or remove modules at any time. Changes take effect immediately and billing is prorated."
    },
    {
      question: "Do you offer discounts for annual billing?", 
      answer: "Yes, we offer a 10% discount when you pay annually. Switch between monthly and annual billing anytime."
    },
    {
      question: "What's included in the setup fee?",
      answer: "Setup fees cover data migration, custom configuration, and onboarding training. Many modules have no setup fee."
    },
    {
      question: "How does the AI pricing work?",
      answer: "AI features are included with each module. More modules = more powerful cross-module AI capabilities."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Affordable Business Automation Starting at $45/month
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent pricing for business automation software. Compare plans starting at $45/user/month. No setup fees, 30-day money-back guarantee.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Free migrations</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="py-8" data-section="pricing">
        {!showCheckout ? (
          <ModuleSelectionDashboard
            tenantId="new-customer"
            userCount={10}
            onCheckout={handleCheckout}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4"
          >
            <CheckoutFlow
              selection={checkoutSelection}
              onSuccess={handleCheckoutSuccess}
              onCancel={handleCheckoutCancel}
              onError={(error) => {
                console.error('Checkout error:', error)
                // Show error notification in production
              }}
            />
          </motion.div>
        )}
      </div>

      {/* FAQ Section */}
      {!showCheckout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-t border-gray-200 py-16"
          data-section="faq"
        >
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqData.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Add structured data for FAQ */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqData.map(faq => ({
                  '@type': 'Question',
                  name: faq.question.replace(/[<>'"]/g, ''),
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer.replace(/[<>'"]/g, '')
                  }
                }))
              }).replace(/[<>]/g, '') // Additional sanitization
            }}
          />
        </motion.div>
      )}

      {/* Contact Sales CTA */}
      {!showCheckout && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-gray-600 mb-8">
              Our team can help design the perfect module combination for your business
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      )}
    </div>
  )
}