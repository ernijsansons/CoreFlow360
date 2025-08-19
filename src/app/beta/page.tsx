/**
 * Beta Program Landing Page
 * Free template inspired by Linear, Stripe, and successful SaaS beta launches
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Rocket,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Bot,
  Sparkles,
  Clock,
  Shield,
  Zap,
  Gift,
  Crown,
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

interface BetaSignupData {
  email: string
  firstName: string
  lastName: string
  company: string
  role: string
  industryVertical: string
  teamSize: string
  currentERP: string
  painPoints: string[]
  expectedUsage: string
}

const industries = [
  'HVAC & Manufacturing',
  'Legal Services',
  'Financial Services',
  'Healthcare',
  'Construction',
  'Professional Services',
  'Technology',
  'Other',
]

const teamSizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees',
]

const currentERPs = [
  'NetSuite',
  'SAP',
  'Oracle',
  'QuickBooks',
  'Salesforce',
  'Microsoft Dynamics',
  'Spreadsheets/Manual',
  'No current system',
  'Other',
]

const painPoints = [
  'Slow manual processes',
  'Data silos between departments',
  'Lack of real-time insights',
  'Expensive current solution',
  'Poor user experience',
  'Integration challenges',
  'Scaling difficulties',
  'Compliance issues',
]

export default function BetaPage() {
  const { trackEvent } = useTrackEvent()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<BetaSignupData>>({
    painPoints: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const updateFormData = (updates: Partial<BetaSignupData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handlePainPointToggle = (painPoint: string) => {
    const current = formData.painPoints || []
    const updated = current.includes(painPoint)
      ? current.filter((p) => p !== painPoint)
      : [...current, painPoint]

    updateFormData({ painPoints: updated })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    trackEvent('beta_signup_submitted', {
      industry: formData.industryVertical,
      team_size: formData.teamSize,
      current_erp: formData.currentERP,
      pain_points_count: formData.painPoints?.length || 0,
    })

    try {
      const response = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
      } else {
        // In production, show error message to user
      }
    } catch (error) {
      // In production, show error message to user
    }

    setIsSubmitting(false)
  }

  const nextStep = () => {
    trackEvent('beta_signup_step_completed', { step: currentStep })
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  if (isSubmitted) {
    return <SuccessPage />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-900/30 px-6 py-3">
              <Rocket className="h-5 w-5 text-violet-400" />
              <span className="font-semibold text-violet-300">Join the Beta Program</span>
            </div>

            <h1 className="heading-hero gradient-text-ai mb-6">
              Be Among the First to Experience
              <br />
              AI-Orchestrated ERP
            </h1>

            <p className="text-body-large mx-auto mb-12 max-w-3xl text-gray-300">
              Get exclusive early access to CoreFlow360. Help shape the future of business
              automation while enjoying premium features, priority support, and founding member
              benefits.
            </p>

            {/* Beta Benefits */}
            <div className="mx-auto mb-12 grid max-w-4xl gap-6 md:grid-cols-3">
              <BetaBenefit
                icon={Gift}
                title="Free for 6 Months"
                description="Full access to all premium features during beta period"
              />
              <BetaBenefit
                icon={Crown}
                title="Founding Member Status"
                description="Permanent 50% discount when we launch publicly"
              />
              <BetaBenefit
                icon={Users}
                title="Direct Access to Team"
                description="Weekly feedback sessions with our engineering team"
              />
            </div>
          </motion.div>

          {/* Multi-step Form */}
          <div className="mx-auto max-w-2xl">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="mb-2 flex justify-between text-sm text-gray-400">
                <span>Step {currentStep} of 4</span>
                <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-900 p-8">
              {currentStep === 1 && (
                <Step1 formData={formData} updateFormData={updateFormData} onNext={nextStep} />
              )}

              {currentStep === 2 && (
                <Step2
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}

              {currentStep === 3 && (
                <Step3
                  formData={formData}
                  updateFormData={updateFormData}
                  painPoints={painPoints}
                  onPainPointToggle={handlePainPointToggle}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}

              {currentStep === 4 && (
                <Step4
                  formData={formData}
                  updateFormData={updateFormData}
                  onSubmit={handleSubmit}
                  onPrev={prevStep}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function BetaBenefit({
  icon: Icon,
  title,
  description,
}: {
  icon: unknown
  title: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-800/50 bg-gray-900/60 p-6 text-center"
    >
      <Icon className="mx-auto mb-4 h-8 w-8 text-violet-400" />
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  )
}

// Step 1: Basic Information
function Step1({
  formData,
  updateFormData,
  onNext,
}: {
  formData: Partial<BetaSignupData>
  updateFormData: (updates: Partial<BetaSignupData>) => void
  onNext: () => void
}) {
  const canContinue = formData.email && formData.firstName && formData.lastName

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Let's get started</h2>
        <p className="text-gray-400">Tell us about yourself</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">First Name *</label>
          <input
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Last Name *</label>
          <input
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Work Email *</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => updateFormData({ email: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
          placeholder="Enter your work email"
        />
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`rounded-lg px-8 py-3 font-semibold transition-all duration-200 ${
            canContinue
              ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600'
              : 'cursor-not-allowed bg-gray-700 text-gray-400'
          }`}
        >
          Continue
          <ArrowRight className="ml-2 inline h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Step 2: Company Information
function Step2({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: {
  formData: Partial<BetaSignupData>
  updateFormData: (updates: Partial<BetaSignupData>) => void
  onNext: () => void
  onPrev: () => void
}) {
  const canContinue = formData.company && formData.role && formData.industryVertical

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">About your company</h2>
        <p className="text-gray-400">Help us understand your business context</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Company Name *</label>
        <input
          type="text"
          value={formData.company || ''}
          onChange={(e) => updateFormData({ company: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
          placeholder="Enter your company name"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Your Role *</label>
        <input
          type="text"
          value={formData.role || ''}
          onChange={(e) => updateFormData({ role: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
          placeholder="e.g., CEO, CTO, Operations Manager"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Industry Vertical *</label>
        <select
          value={formData.industryVertical || ''}
          onChange={(e) => updateFormData({ industryVertical: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
        >
          <option value="">Select your industry</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Team Size</label>
        <select
          value={formData.teamSize || ''}
          onChange={(e) => updateFormData({ teamSize: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
        >
          <option value="">Select team size</option>
          {teamSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="rounded-lg border border-gray-600 px-8 py-3 font-semibold text-gray-300 transition-all duration-200 hover:border-gray-500 hover:text-white"
        >
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`rounded-lg px-8 py-3 font-semibold transition-all duration-200 ${
            canContinue
              ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600'
              : 'cursor-not-allowed bg-gray-700 text-gray-400'
          }`}
        >
          Continue
          <ArrowRight className="ml-2 inline h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Step 3: Current Situation & Pain Points
function Step3({
  formData,
  updateFormData,
  painPoints,
  onPainPointToggle,
  onNext,
  onPrev,
}: {
  formData: Partial<BetaSignupData>
  updateFormData: (updates: Partial<BetaSignupData>) => void
  painPoints: string[]
  onPainPointToggle: (painPoint: string) => void
  onNext: () => void
  onPrev: () => void
}) {
  const canContinue = formData.currentERP && (formData.painPoints?.length || 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Current situation</h2>
        <p className="text-gray-400">Help us understand your current challenges</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Current ERP/Business System *
        </label>
        <select
          value={formData.currentERP || ''}
          onChange={(e) => updateFormData({ currentERP: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
        >
          <option value="">Select your current system</option>
          {currentERPs.map((erp) => (
            <option key={erp} value={erp}>
              {erp}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-4 block text-sm font-medium text-gray-300">
          What are your biggest pain points? * (Select all that apply)
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          {painPoints.map((painPoint) => (
            <button
              key={painPoint}
              onClick={() => onPainPointToggle(painPoint)}
              className={`rounded-lg border p-3 text-left transition-all duration-200 ${
                formData.painPoints?.includes(painPoint)
                  ? 'border-violet-500 bg-violet-500/20 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${
                    formData.painPoints?.includes(painPoint)
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-gray-600'
                  }`}
                >
                  {formData.painPoints?.includes(painPoint) && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                {painPoint}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="rounded-lg border border-gray-600 px-8 py-3 font-semibold text-gray-300 transition-all duration-200 hover:border-gray-500 hover:text-white"
        >
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`rounded-lg px-8 py-3 font-semibold transition-all duration-200 ${
            canContinue
              ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600'
              : 'cursor-not-allowed bg-gray-700 text-gray-400'
          }`}
        >
          Continue
          <ArrowRight className="ml-2 inline h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Step 4: Final Details & Submission
function Step4({
  formData,
  updateFormData,
  onSubmit,
  onPrev,
  isSubmitting,
}: {
  formData: Partial<BetaSignupData>
  updateFormData: (updates: Partial<BetaSignupData>) => void
  onSubmit: () => void
  onPrev: () => void
  isSubmitting: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Almost there!</h2>
        <p className="text-gray-400">Final details to personalize your beta experience</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Expected Usage Pattern
        </label>
        <select
          value={formData.expectedUsage || ''}
          onChange={(e) => updateFormData({ expectedUsage: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
        >
          <option value="">How do you plan to use CoreFlow360?</option>
          <option value="replace_current">Replace current ERP system</option>
          <option value="supplement_current">Supplement current tools</option>
          <option value="new_implementation">First ERP implementation</option>
          <option value="evaluation">Just evaluating options</option>
        </select>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h3 className="mb-4 font-semibold text-white">Beta Program Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center text-green-400">
            <CheckCircle className="mr-2 h-4 w-4" />6 months free access to all premium features
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="mr-2 h-4 w-4" />
            50% permanent discount as founding member
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="mr-2 h-4 w-4" />
            Direct access to engineering team
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="mr-2 h-4 w-4" />
            Shape the product roadmap with your feedback
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-600 px-8 py-3 font-semibold text-gray-300 transition-all duration-200 hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3 font-semibold text-white transition-all duration-200 hover:from-violet-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Joining Beta...
            </>
          ) : (
            <>
              Join Beta Program
              <Rocket className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// Success Page
function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl px-4 text-center"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>

        <h1 className="gradient-text-ai mb-6 text-4xl font-bold">Welcome to the Future!</h1>

        <p className="mb-8 text-xl text-gray-300">
          You're now part of the CoreFlow360 beta program. We'll be in touch within 24 hours with
          your access credentials and onboarding materials.
        </p>

        <div className="mb-8 rounded-xl bg-gray-900 p-6">
          <h3 className="mb-4 font-semibold text-white">What happens next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start">
              <Clock className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-violet-400" />
              <div>
                <div className="font-medium text-white">Within 24 hours</div>
                <div className="text-sm text-gray-400">Receive your beta access credentials</div>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-violet-400" />
              <div>
                <div className="font-medium text-white">Week 1</div>
                <div className="text-sm text-gray-400">
                  Personal onboarding session with our team
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <Sparkles className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-violet-400" />
              <div>
                <div className="font-medium text-white">Ongoing</div>
                <div className="text-sm text-gray-400">
                  Weekly feedback sessions and feature previews
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <GlowingButton href="/" size="lg">
            Return Home
          </GlowingButton>
          <GlowingButton href="/demo/subscription-simulator" variant="outline" size="lg">
            Try Demo
          </GlowingButton>
        </div>
      </motion.div>
    </div>
  )
}
