/**
 * CoreFlow360 - Subscription Success Page
 * Thank you page after successful Stripe checkout
 */

'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

const SubscriptionSuccessContent: React.FC = () => {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionDetails, setSessionDetails] = useState<unknown>(null)

  useEffect(() => {
    const session_id = searchParams.get('session_id')
    setSessionId(session_id)

    const loadSubscriptionDetails = async () => {
      try {
        // Get current subscription details
        const response = await fetch('/api/subscriptions/current')
        if (response.ok) {
          const data = await response.json()
          setSessionDetails({
            customer_email: data.email || 'Subscription Active',
            subscription_status: data.status,
            tier: data.tier,
            users: data.users,
            next_billing_date: new Date(data.nextBillingDate),
            modules_activated: data.tier === 'starter' ? ['CRM', 'Basic Reporting'] :
                             data.tier === 'professional' ? ['CRM', 'Accounting', 'AI Analytics'] :
                             ['All Modules', 'Custom Integrations', 'Priority Support']
          })
        }
      } catch (error) {
        console.error('Failed to load subscription details:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptionDetails()
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <h2 className="text-xl font-bold text-gray-900">Processing Your Subscription...</h2>
          <p className="text-gray-600">Please wait while we activate your modules.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500"
        >
          <svg
            className="h-12 w-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 space-y-4"
        >
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
            Welcome to CoreFlow360!
          </h1>
          <p className="text-xl text-gray-600">
            Your subscription has been successfully activated.
          </p>
        </motion.div>

        {/* Session Details */}
        {sessionDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 rounded-xl bg-white p-8 shadow-lg"
          >
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Subscription Details</h2>

            <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium text-gray-700">Account Email</h3>
                <p className="text-gray-900">{sessionDetails.customer_email}</p>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-gray-700">Status</h3>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  ✅ {sessionDetails.subscription_status}
                </span>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-gray-700">Activated Modules</h3>
                <div className="space-y-1">
                  {sessionDetails.modules_activated?.map((module: string) => (
                    <span
                      key={module}
                      className="mr-2 inline-flex items-center rounded bg-blue-100 px-2 py-1 text-sm text-blue-800"
                    >
                      {module.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-gray-700">Next Billing</h3>
                <p className="text-gray-900">
                  {sessionDetails.next_billing_date?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 rounded-xl bg-blue-50 p-6"
        >
          <h2 className="mb-4 text-xl font-bold text-blue-900">What's Next?</h2>
          <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-2xl">📧</div>
              <h3 className="font-medium text-blue-900">Check Your Email</h3>
              <p className="text-sm text-blue-700">
                We've sent you a welcome email with login instructions and setup guide.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-2xl">⚙️</div>
              <h3 className="font-medium text-blue-900">Configure Your Modules</h3>
              <p className="text-sm text-blue-700">
                Set up your activated modules and customize them for your business.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-2xl">🚀</div>
              <h3 className="font-medium text-blue-900">Start Using CoreFlow360</h3>
              <p className="text-sm text-blue-700">
                Begin managing your business operations with our AI-powered tools.
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
            onClick={() => (window.location.href = '/dashboard')}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => (window.location.href = '/demo')}
            className="rounded-lg border-2 border-blue-600 px-8 py-3 font-medium text-blue-600 transition-all hover:bg-blue-50"
          >
            View Demo
          </button>

          <button
            onClick={() => (window.location.href = '/support')}
            className="rounded-lg px-8 py-3 font-medium text-gray-600 transition-all hover:bg-gray-100"
          >
            Need Help?
          </button>
        </motion.div>

        {/* Session ID for Reference */}
        {sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-400">Session ID: {sessionId}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

const SubscriptionSuccessPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <h2 className="text-xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}

export default SubscriptionSuccessPage
