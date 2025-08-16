/**
 * CoreFlow360 - Subscription Success Page
 * Thank you page after successful Stripe checkout
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

const SubscriptionSuccessPage: React.FC = () => {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionDetails, setSessionDetails] = useState<any>(null)

  useEffect(() => {
    const session_id = searchParams.get('session_id')
    setSessionId(session_id)

    if (session_id) {
      // In a real implementation, you might want to verify the session
      // and get the subscription details from your backend
      setTimeout(() => {
        setSessionDetails({
          customer_email: 'demo@coreflow360.com',
          subscription_status: 'active',
          modules_activated: ['crm', 'accounting'],
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        setLoading(false)
      }, 2000)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-900">Processing Your Subscription...</h2>
          <p className="text-gray-600">Please wait while we activate your modules.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Account Email</h3>
                <p className="text-gray-900">{sessionDetails.customer_email}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Status</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✅ {sessionDetails.subscription_status}
                </span>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Activated Modules</h3>
                <div className="space-y-1">
                  {sessionDetails.modules_activated?.map((module: string) => (
                    <span key={module} className="inline-flex items-center px-2 py-1 rounded text-sm bg-blue-100 text-blue-800 mr-2">
                      {module.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Next Billing</h3>
                <p className="text-gray-900">
                  {sessionDetails.next_billing_date?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
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
          className="bg-blue-50 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-blue-900 mb-4">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
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
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={() => window.location.href = '/demo'}
            className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all"
          >
            View Demo
          </button>
          
          <button
            onClick={() => window.location.href = '/support'}
            className="text-gray-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all"
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
            <p className="text-xs text-gray-400">
              Session ID: {sessionId}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SubscriptionSuccessPage