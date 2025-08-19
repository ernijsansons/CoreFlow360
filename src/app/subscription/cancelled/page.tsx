/**
 * CoreFlow360 - Subscription Cancelled Page
 * Page shown when user cancels Stripe checkout
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

const SubscriptionCancelledPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center"
      >
        {/* Cancelled Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-500"
        >
          <svg
            className="h-12 w-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </motion.div>

        {/* Cancelled Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 space-y-4"
        >
          <h1 className="text-4xl font-bold text-gray-900">Subscription Cancelled</h1>
          <p className="text-xl text-gray-600">
            Your subscription process was cancelled. No charges were made.
          </p>
        </motion.div>

        {/* Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 rounded-xl bg-white p-8 shadow-lg"
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-900">What Happened?</h2>
          <p className="mb-6 text-gray-600">
            You cancelled the checkout process before completing your subscription. Your payment
            information was not processed and no charges were made to your account.
          </p>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-medium text-blue-900">Still Interested in CoreFlow360?</h3>
            <p className="text-sm text-blue-700">
              You can try our interactive demo or restart the subscription process at any time. Your
              module selections and preferences have not been saved.
            </p>
          </div>
        </motion.div>

        {/* Alternative Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 rounded-xl bg-gray-50 p-6"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900">Explore Your Options</h2>
          <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-2xl">🎮</div>
              <h3 className="font-medium text-gray-900">Try the Demo</h3>
              <p className="text-sm text-gray-600">
                Experience CoreFlow360's features with our interactive demo - no commitment
                required.
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
          className="flex flex-col justify-center gap-4 sm:flex-row"
        >
          <button
            onClick={() => (window.location.href = '/pricing')}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = '/demo')}
            className="rounded-lg border-2 border-blue-600 px-8 py-3 font-medium text-blue-600 transition-all hover:bg-blue-50"
          >
            View Demo
          </button>

          <button
            onClick={() => (window.location.href = '/contact')}
            className="rounded-lg px-8 py-3 font-medium text-gray-600 transition-all hover:bg-gray-100"
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
