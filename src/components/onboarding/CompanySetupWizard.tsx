/**
 * CoreFlow360 - Company Setup Wizard Component
 * Second step in user onboarding - collects company details with AI-powered industry recommendations
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2,
  Users,
  MapPin,
  Briefcase,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  BarChart3,
  Lightbulb,
  Shield
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { UserRole } from './WelcomeRoleSelection'

export interface CompanyInfo {
  name: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  location: string
  description?: string
}

interface CompanySetupWizardProps {
  onSetupCompleted: (companyInfo: CompanyInfo) => void
  onBack: () => void
  userRole: UserRole
  userEmail?: string
}

const companySizes = [
  {
    id: 'startup',
    label: 'Startup',
    range: '1-10 employees',
    description: 'Just getting started with rapid growth potential',
    icon: Zap,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'small',
    label: 'Small Business', 
    range: '11-50 employees',
    description: 'Established with steady growth and local presence',
    icon: Target,
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'medium',
    label: 'Medium Business',
    range: '51-200 employees',
    description: 'Growing organization with multiple departments',
    icon: BarChart3,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'large',
    label: 'Large Company',
    range: '201-1000 employees',
    description: 'Established corporation with complex operations',
    icon: Building2,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    range: '1000+ employees',
    description: 'Large-scale organization with global operations',
    icon: Shield,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-purple-600'
  }
]

const industries = [
  { id: 'technology', label: 'Technology & Software', icon: '💻', aiModules: ['AI Development', 'Project Management', 'Customer Support'] },
  { id: 'healthcare', label: 'Healthcare & Medical', icon: '🏥', aiModules: ['Patient Management', 'Compliance', 'Scheduling'] },
  { id: 'finance', label: 'Finance & Banking', icon: '💰', aiModules: ['Risk Management', 'Compliance', 'Customer Analytics'] },
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭', aiModules: ['Supply Chain', 'Quality Control', 'Inventory Management'] },
  { id: 'retail', label: 'Retail & E-commerce', icon: '🛍️', aiModules: ['Customer Analytics', 'Inventory Management', 'Marketing Automation'] },
  { id: 'education', label: 'Education', icon: '🎓', aiModules: ['Student Management', 'Curriculum Planning', 'Performance Analytics'] },
  { id: 'construction', label: 'Construction & Real Estate', icon: '🏗️', aiModules: ['Project Management', 'Resource Planning', 'Safety Compliance'] },
  { id: 'consulting', label: 'Professional Services', icon: '💼', aiModules: ['Project Management', 'Time Tracking', 'Client Management'] },
  { id: 'nonprofit', label: 'Non-Profit', icon: '🤝', aiModules: ['Donor Management', 'Event Planning', 'Volunteer Coordination'] },
  { id: 'other', label: 'Other', icon: '🌟', aiModules: ['General Business', 'Data Analytics', 'Process Automation'] }
]

export function CompanySetupWizard({
  onSetupCompleted,
  onBack,
  userRole,
  userEmail
}: CompanySetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    size: 'small',
    industry: '',
    location: '',
    description: ''
  })

  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])

  // Generate AI recommendations based on company profile
  useEffect(() => {
    if (companyInfo.industry && companyInfo.size) {
      const selectedIndustry = industries.find(i => i.id === companyInfo.industry)
      if (selectedIndustry) {
        setAiRecommendations(selectedIndustry.aiModules)
      }
    }
  }, [companyInfo.industry, companyInfo.size])

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!companyInfo.name || !companyInfo.industry) return

    setIsSubmitting(true)
    
    // Simulate API call to save company information
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onSetupCompleted(companyInfo)
    setIsSubmitting(false)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return companyInfo.name.trim().length > 0 && companyInfo.location.trim().length > 0
      case 2:
        return companyInfo.size && companyInfo.industry
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step 
                      ? 'border-violet-500 bg-violet-500 text-white' 
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    {currentStep > step ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step}</span>
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
                      currentStep > step ? 'bg-violet-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Let's Set Up Your Company
            </h1>
            <p className="text-xl text-gray-300">
              Step {currentStep} of 3 - {
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Business Profile' :
                'AI Recommendations'
              }
            </p>
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 mb-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-xl">
                    <Building2 className="w-6 h-6 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Company Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your company name"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={companyInfo.location}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Company Description (Optional)
                  </label>
                  <textarea
                    value={companyInfo.description}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what your company does..."
                    rows={3}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl">
                    <Briefcase className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Business Profile</h2>
                </div>

                {/* Company Size Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Company Size</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {companySizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setCompanyInfo(prev => ({ ...prev, size: size.id as any }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          companyInfo.size === size.id
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <size.icon className={`w-5 h-5 ${size.color}`} />
                          <span className="font-semibold text-white">{size.label}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{size.range}</p>
                        <p className="text-xs text-gray-400">{size.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Industry</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {industries.map((industry) => (
                      <button
                        key={industry.id}
                        onClick={() => setCompanyInfo(prev => ({ ...prev, industry: industry.id }))}
                        className={`p-4 rounded-lg border transition-all duration-200 text-left flex items-center gap-3 ${
                          companyInfo.industry === industry.id
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <span className="text-2xl">{industry.icon}</span>
                        <span className="font-medium text-white">{industry.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">AI-Powered Recommendations</h2>
                </div>

                <div className="bg-gradient-to-r from-violet-900/20 to-cyan-900/20 border border-violet-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Perfect Match for {companyInfo.name}
                      </h3>
                      <p className="text-gray-300 mb-6">
                        Based on your {industries.find(i => i.id === companyInfo.industry)?.label} industry 
                        and {companySizes.find(s => s.id === companyInfo.size)?.label.toLowerCase()} size, 
                        our AI recommends these modules to get you started:
                      </p>
                      
                      <div className="grid gap-3 mb-6">
                        {aiRecommendations.map((module, index) => (
                          <motion.div
                            key={module}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3"
                          >
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span className="text-white font-medium">{module}</span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">
                          <strong className="text-violet-400">Why these modules?</strong>
                        </p>
                        <p className="text-sm text-gray-300">
                          As a {userRole} in the {industries.find(i => i.id === companyInfo.industry)?.label.toLowerCase()} 
                          industry, you'll benefit from specialized AI agents that understand your workflow patterns 
                          and can automate routine tasks while providing intelligent insights.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <GlowingButton
            onClick={currentStep === 1 ? onBack : handlePrevious}
            variant="outline"
            className="px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Back to Role Selection' : 'Previous'}
          </GlowingButton>

          {currentStep < 3 ? (
            <GlowingButton
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-3"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlowingButton>
          ) : (
            <GlowingButton
              onClick={handleComplete}
              disabled={isSubmitting}
              className="px-8 py-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent mr-2"></div>
                  Setting Up...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </GlowingButton>
          )}
        </div>
      </div>
    </div>
  )
}