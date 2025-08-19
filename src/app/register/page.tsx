/**
 * CoreFlow360 - Registration Page
 * Self-service tenant and user registration
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { z } from 'zod'
import { Brain, Building2, Mail, Lock, User, Factory, ArrowRight, CheckCircle } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    companyName: z.string().min(1, 'Company name is required'),
    industryType: z
      .enum([
        'GENERAL',
        'HVAC',
        'LEGAL',
        'MANUFACTURING',
        'HEALTHCARE',
        'FINANCE',
        'REAL_ESTATE',
        'CONSTRUCTION',
        'CONSULTING',
        'RETAIL',
        'EDUCATION',
      ])
      .default('GENERAL'),
    invitationCode: z.string().optional(),
    agreeToTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.agreeToTerms === true, {
    message: 'You must agree to the terms of service',
    path: ['agreeToTerms'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const industries = [
  { value: 'GENERAL', label: 'General Business' },
  { value: 'HVAC', label: 'HVAC & Climate Control' },
  { value: 'LEGAL', label: 'Legal Services' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'FINANCE', label: 'Finance & Banking' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'EDUCATION', label: 'Education' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industryType: 'GENERAL',
    invitationCode: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = registerSchema.parse(formData)

      // Submit registration using API client
      const response = await api.post('/api/auth/register', {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        companyName: validatedData.companyName,
        industryType: validatedData.industryType,
        invitationCode: validatedData.invitationCode,
      })

      if (response.success) {
        setSuccess(true)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message
          }
        })
        setErrors(fieldErrors)
      } else if (error instanceof ApiError) {
        // Handle API errors
        if (error.details && Array.isArray(error.details)) {
          const fieldErrors: Record<string, string> = {}
          error.details.forEach((issue: unknown) => {
            if (issue.path && issue.path[0]) {
              fieldErrors[issue.path[0]] = issue.message
            }
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: error.message || 'Registration failed' })
        }
      } else {
        setErrors({ general: 'An unexpected error occurred.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>

          <h2 className="mb-4 text-3xl font-bold text-gray-900">Welcome to CoreFlow360!</h2>

          <p className="mb-6 text-gray-600">
            Your account has been created successfully. You can now sign in to start your 14-day
            free trial.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-medium text-white shadow-lg transition-colors hover:from-blue-700 hover:to-purple-700"
          >
            Sign In to Continue
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-3">
            <Brain className="h-10 w-10 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">CoreFlow360</h1>
          </div>

          <h2 className="text-4xl leading-tight font-bold text-gray-900">
            Start Your
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI-Powered Journey
            </span>
          </h2>

          <p className="text-lg text-gray-600">
            Join thousands of businesses using our modular ERP platform to streamline operations
            with AI intelligence.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-1 h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-gray-900">14-day free trial</p>
                <p className="text-sm text-gray-600">No credit card required</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-1 h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-gray-900">Modular pricing</p>
                <p className="text-sm text-gray-600">Pay only for what you need</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-1 h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-gray-900">AI-first design</p>
                <p className="text-sm text-gray-600">Intelligence built into every feature</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Registration form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl bg-white p-8 shadow-xl"
        >
          <h3 className="mb-6 text-2xl font-bold text-gray-900">Create Your Account</h3>

          {/* Error Messages */}
          {errors.general && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Full Name *</label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border py-3 pr-4 pl-10 transition-colors focus:ring-2 focus:outline-none ${
                      errors.name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border py-3 pr-4 pl-10 transition-colors focus:ring-2 focus:outline-none ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="john@company.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            {/* Company Information */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Company Name *</label>
              <div className="relative">
                <Building2 className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border py-3 pr-4 pl-10 transition-colors focus:ring-2 focus:outline-none ${
                    errors.companyName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Acme Corporation"
                  disabled={loading}
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Factory</label>
              <div className="relative">
                <Factory className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  name="industryType"
                  value={formData.industryType}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={loading}
                >
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Password *</label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border py-3 pr-4 pl-10 transition-colors focus:ring-2 focus:outline-none ${
                      errors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Min. 8 characters"
                    disabled={loading}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border py-3 pr-4 pl-10 transition-colors focus:ring-2 focus:outline-none ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Confirm password"
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Invitation Code */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Invitation Code (Optional)
              </label>
              <input
                name="invitationCode"
                type="text"
                value={formData.invitationCode}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter invitation code if you have one"
                disabled={loading}
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <label className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-3 font-medium text-white transition-colors ${
                loading
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
