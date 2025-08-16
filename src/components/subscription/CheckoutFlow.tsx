/**
 * CoreFlow360 - Checkout Flow Component
 * Handles the checkout process integration with ModuleSelectionDashboard
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CheckoutSelection {
  modules: string[]
  bundle?: string
  userCount: number
  billingCycle: 'monthly' | 'annual'
  pricing: any
  tenantId?: string
}

interface CustomerInfo {
  email: string
  name: string
  companyName: string
}

interface CheckoutFlowProps {
  selection: CheckoutSelection
  onSuccess?: (sessionId: string) => void
  onCancel?: () => void
  onError?: (error: string) => void
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  selection,
  onSuccess,
  onCancel,
  onError
}) => {
  const [step, setStep] = useState<'customer-info' | 'processing' | 'redirecting'>('customer-info')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    name: '',
    companyName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerInfo.email || !customerInfo.name || !customerInfo.companyName) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)
    setStep('processing')

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selection.tenantId || `tenant-${Date.now()}`,
          modules: selection.modules,
          bundleKey: selection.bundle,
          userCount: selection.userCount,
          billingCycle: selection.billingCycle,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          companyName: customerInfo.companyName,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancelled`
        })
      })

      const data = await response.json()

      if (!data.success || !data.sessionUrl) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      setStep('redirecting')
      
      // Redirect to Stripe checkout
      window.location.href = data.sessionUrl
      
      // Call success callback with session ID
      onSuccess?.(data.sessionId)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed'
      setError(errorMessage)
      onError?.(errorMessage)
      setStep('customer-info')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {step === 'customer-info' && (
          <motion.div
            key="customer-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Modules ({selection.modules.length})</span>
                  <span className="font-medium">{selection.modules.join(', ')}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Users</span>
                  <span className="font-medium">{selection.userCount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Billing</span>
                  <span className="font-medium capitalize">{selection.billingCycle}</span>
                </div>
                
                {selection.pricing?.billingDetails?.setupFeesTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Setup Fee</span>
                    <span className="font-medium">
                      {formatPrice(selection.pricing.billingDetails.setupFeesTotal)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {formatPrice(selection.billingCycle === 'annual' 
                      ? selection.pricing?.totalAnnualPrice || 0
                      : selection.pricing?.totalMonthlyPrice || 0
                    )} 
                    <span className="text-sm text-gray-500 font-normal">
                      /{selection.billingCycle === 'annual' ? 'year' : 'month'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
              
              <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.email@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.companyName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Company Inc."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Creating Your Checkout Session</h3>
            <p className="text-gray-600">Please wait while we prepare your subscription...</p>
          </motion.div>
        )}

        {step === 'redirecting' && (
          <motion.div
            key="redirecting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Redirecting to Payment</h3>
            <p className="text-gray-600">You'll be redirected to Stripe to complete your payment...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Notice */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-600">🔒</span>
          <div className="text-sm">
            <span className="font-medium text-green-800">Secure Payment Processing</span>
            <p className="text-green-600">
              Your payment is processed securely by Stripe. We never store your payment information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutFlow