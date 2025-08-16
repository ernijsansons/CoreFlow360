/**
 * CoreFlow360 - Subscription Cancelled Page
 * Page shown when user cancels Stripe checkout
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

const SubscriptionCancelledPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Cancelled Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </motion.div>

        {/* Cancelled Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            Subscription Cancelled
          </h1>
          <p className="text-xl text-gray-600">
            Your subscription process was cancelled. No charges were made.
          </p>
        </motion.div>

        {/* Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Happened?</h2>
          <p className="text-gray-600 mb-6">
            You cancelled the checkout process before completing your subscription. 
            Your payment information was not processed and no charges were made to your account.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Still Interested in CoreFlow360?</h3>
            <p className="text-sm text-blue-700">
              You can try our interactive demo or restart the subscription process at any time. 
              Your module selections and preferences have not been saved.
            </p>
          </div>
        </motion.div>

        {/* Alternative Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Your Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="space-y-2">
              <div className="text-2xl">🎮</div>
              <h3 className="font-medium text-gray-900">Try the Demo</h3>
              <p className="text-sm text-gray-600">
                Experience CoreFlow360's features with our interactive demo - no commitment required.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl">💬</div>
              <h3 className="font-medium text-gray-900">Talk to Sales</h3>
              <p className="text-sm text-gray-600">
                Get personalized recommendations and custom pricing from our sales team.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl">📚</div>
              <h3 className="font-medium text-gray-900">Learn More</h3>
              <p className="text-sm text-gray-600">
                Read our documentation and case studies to understand how CoreFlow360 works.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/demo'}
            className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all"
          >
            View Demo
          </button>
          
          <button
            onClick={() => window.location.href = '/contact'}
            className="text-gray-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all"
          >
            Contact Sales
          </button>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Questions? Email us at{' '}
            <a href="mailto:support@coreflow360.com" className="text-blue-600 hover:underline">
              support@coreflow360.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SubscriptionCancelledPage