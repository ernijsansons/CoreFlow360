/**
 * CoreFlow360 - Pricing Page
 * Live module selection and pricing with Stripe integration
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ModuleSelectionDashboard from '@/components/subscription/ModuleSelectionDashboard'
import CheckoutFlow from '@/components/subscription/CheckoutFlow'

export default function PricingPage() {
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pay only for the modules you need. Start small, scale as you grow.
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
              <span>14-day free trial</span>
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
              <span>Cancel anytime</span>
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
      <div className="py-8">
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
        >
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I change my modules later?
                </h3>
                <p className="text-gray-600">
                  Yes! You can add or remove modules at any time. Changes take effect immediately and billing is prorated.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do you offer discounts for annual billing?
                </h3>
                <p className="text-gray-600">
                  Yes, we offer a 10% discount when you pay annually. Switch between monthly and annual billing anytime.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What's included in the setup fee?
                </h3>
                <p className="text-gray-600">
                  Setup fees cover data migration, custom configuration, and onboarding training. Many modules have no setup fee.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  How does the AI pricing work?
                </h3>
                <p className="text-gray-600">
                  AI features are included with each module. More modules = more powerful cross-module AI capabilities.
                </p>
              </div>
            </div>
          </div>
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