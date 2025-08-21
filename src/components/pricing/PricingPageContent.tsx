'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ModuleSelectionDashboard from '@/components/subscription/ModuleSelectionDashboard'
import CheckoutFlow from '@/components/subscription/CheckoutFlow'
import { ProgressivePricingCalculator } from '@/components/pricing/progressive/ProgressivePricingCalculator'

export default function PricingPageContent() {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutSelection, setCheckoutSelection] = useState<unknown>(null)

  const handleCheckout = (selection: unknown) => {
    setCheckoutSelection(selection)
    setShowCheckout(true)
  }

  const handleCheckoutSuccess = (_sessionId: string) => {
    // In production, you might want to track this conversion
  }

  const handleCheckoutCancel = () => {
    setShowCheckout(false)
    setCheckoutSelection(null)
  }

  const faqData = [
    {
      question: 'Can I change my modules later?',
      answer:
        'Yes! You can add or remove modules at any time. Changes take effect immediately and billing is prorated.',
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer:
        'Yes, we offer a 10% discount when you pay annually. Switch between monthly and annual billing anytime.',
    },
    {
      question: "What's included in the setup fee?",
      answer:
        'Setup fees cover data migration, custom configuration, and onboarding training. Many modules have no setup fee.',
    },
    {
      question: 'How does the AI pricing work?',
      answer:
        'AI features are included with each module. More modules = more powerful cross-module AI capabilities.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Affordable Business Automation Starting at $45/month
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Transparent pricing for business automation software. Compare plans starting at
              $45/user/month. No setup fees, 30-day money-back guarantee.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b border-gray-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Free migrations</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progressive Pricing Calculator - Above the fold */}
      {!showCheckout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="py-12 bg-gradient-to-br from-purple-50 to-blue-50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Multi-Business Progressive Pricing
              </h2>
              <p className="text-xl text-gray-600">
                Save 20-50% when you manage multiple businesses with CoreFlow360
              </p>
            </div>
            <ProgressivePricingCalculator />
          </div>
        </motion.div>
      )}

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
            className="mx-auto max-w-4xl px-4"
          >
            <CheckoutFlow
              selection={checkoutSelection}
              onSuccess={handleCheckoutSuccess}
              onCancel={handleCheckoutCancel}
              onError={(error) => {
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
          className="border-t border-gray-200 bg-white py-16"
          data-section="faq"
        >
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {faqData.map((faq, index) => (
                <div key={index}>
                  <h3 className="mb-2 font-semibold text-gray-900">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add structured data for FAQ */}
          <script type="application/ld+json" suppressHydrationWarning>
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqData.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            })}
          </script>
        </motion.div>
      )}

      {/* Contact Sales CTA */}
      {!showCheckout && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Need a Custom Solution?</h2>
            <p className="mb-8 text-gray-600">
              Our team can help design the perfect module combination for your business
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="rounded-lg border-2 border-blue-600 bg-white px-8 py-3 font-medium text-blue-600 transition-all hover:bg-blue-50"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
