/**
 * CoreFlow360 - Login Page
 * Multi-tenant authentication with NextAuth.js
 */

'use client'

import React, { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { z } from 'zod'
import { Brain, Shield, Users, BarChart3, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  tenantId: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    tenantId: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showTenantField, setShowTenantField] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      const validatedData = loginSchema.parse(formData)

      // Attempt to sign in
      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        tenantId: validatedData.tenantId || undefined,
        redirect: false,
      })

      if (result?.error) {
        // Handle specific error cases
        if (result.error === 'CredentialsSignin') {
          setErrors({
            general: 'Invalid credentials. Please check your email and password.',
          })
        } else {
          setErrors({ general: 'Sign in failed. Please try again.' })
        }
      } else if (result?.ok) {
        // Successful login - redirect to callback URL
        router.push(callbackUrl)
        router.refresh()
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
      } else {
        setErrors({ general: 'An unexpected error occurred.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (error) {
      setErrors({ general: 'Google sign in failed. Please try again.' })
      setLoading(false)
    }
  }

  const handleDemoLogin = async (email: string) => {
    setFormData({ email, password: 'demo123456', tenantId: '' })
    const result = await signIn('credentials', {
      email,
      password: 'demo123456',
      redirect: false,
    })

    if (result?.ok) {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  const demoAccounts = [
    { email: 'super@coreflow360.com', role: 'Super Admin', desc: 'Full system access' },
    { email: 'admin@coreflow360.com', role: 'Org Admin', desc: 'Organization management' },
    { email: 'manager@coreflow360.com', role: 'Department Manager', desc: 'Department oversight' },
    { email: 'user@coreflow360.com', role: 'User', desc: 'Standard access' },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="grid w-full max-w-5xl items-center gap-8 md:grid-cols-2">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-white"
        >
          <div className="flex items-center space-x-3">
            <Brain className="h-10 w-10 text-purple-500" />
            <h1 className="text-3xl font-bold">CoreFlow360</h1>
          </div>

          <h2 className="text-4xl leading-tight font-bold">
            Experience the Future of
            <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI-Powered Business
            </span>
          </h2>

          <p className="text-lg text-gray-300">
            Role-based access with personalized dashboards, AI insights, and IoT monitoring.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-400" />
              <div>
                <p className="font-semibold">Enterprise Security</p>
                <p className="text-sm text-gray-400">Role-based permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="font-semibold">AI Intelligence</p>
                <p className="text-sm text-gray-400">Personalized insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="font-semibold">Team Collaboration</p>
                <p className="text-sm text-gray-400">Real-time updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-purple-400" />
              <div>
                <p className="font-semibold">IoT Monitoring</p>
                <p className="text-sm text-gray-400">Connected devices</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
            <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h3>

            {/* Error Messages */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error === 'CredentialsSignin' && 'Invalid credentials. Please try again.'}
                {error === 'Verification' && 'Please verify your email address first.'}
                {error === 'AccessDenied' && 'Access denied. Contact your administrator.'}
                {error &&
                  !['CredentialsSignin', 'Verification', 'AccessDenied'].includes(error) &&
                  'An error occurred during sign in.'}
              </div>
            )}

            {errors.general && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-white py-3 pr-4 pl-10 text-gray-900 transition-colors focus:border-transparent focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500 dark:border-gray-600'
                    }`}
                    placeholder="Enter your email"
                    disabled={loading}
                    required
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-white py-3 pr-4 pl-10 text-gray-900 transition-colors focus:border-transparent focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      errors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500 dark:border-gray-600'
                    }`}
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Tenant ID (Optional) */}
              {showTenantField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tenant ID (Optional)
                  </label>
                  <input
                    name="tenantId"
                    type="text"
                    value={formData.tenantId}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter tenant ID (if known)"
                    disabled={loading}
                  />
                </motion.div>
              )}

              {/* Toggle Tenant Field */}
              <button
                type="button"
                onClick={() => setShowTenantField(!showTenantField)}
                className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                disabled={loading}
              >
                {showTenantField ? 'Hide' : 'Show'} advanced options
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white transition-colors hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                    Signing in...
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* OAuth Divider */}
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500 dark:bg-gray-800">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Demo Accounts:</p>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account.email)}
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{account.role}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.email} - {account.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Footer Links */}
              <div className="mt-6 space-y-2 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Sign up for free
                  </Link>
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Demo Notice */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Want to see a demo first?{' '}
                  <Link
                    href="/demo"
                    className="font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Try the interactive demo
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="from-background via-background flex min-h-screen items-center justify-center bg-gradient-to-br to-purple-900/20">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
