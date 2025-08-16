'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building,
  Clock,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  Calendar,
  Award,
  Shield,
  Zap,
  BarChart3,
  Phone,
  Mail,
  FileText,
  Download,
  Play,
  Star,
  AlertTriangle
} from 'lucide-react'

interface POCRequest {
  companyName: string
  industry: string
  companySize: string
  currentSolution: string
  primaryChallenges: string[]
  expectedROI: string
  timeline: string
  decisionMakers: string[]
  technicalContact: {
    name: string
    email: string
    role: string
  }
  businessContact: {
    name: string
    email: string
    role: string
  }
}

interface POCTemplate {
  id: string
  name: string
  description: string
  industry: string[]
  duration: string
  successMetrics: string[]
  includedModules: string[]
  estimatedROI: string
  difficulty: 'easy' | 'medium' | 'complex'
  icon: React.ElementType
}

interface ROICalculation {
  currentCosts: number
  projectedSavings: number
  additionalRevenue: number
  implementation: number
  netROI: number
  paybackPeriod: number
  yearOneValue: number
}

export default function EnterprisePOC() {
  const [step, setStep] = useState<'template' | 'form' | 'roi' | 'submit'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<POCTemplate | null>(null)
  const [pocRequest, setPocRequest] = useState<Partial<POCRequest>>({})
  const [roiCalculation, setROICalculation] = useState<ROICalculation | null>(null)
  const [loading, setLoading] = useState(false)

  const pocTemplates: POCTemplate[] = [
    {
      id: 'sales-acceleration',
      name: 'Sales Acceleration POC',
      description: 'Prove 3x faster deal closure and 40% higher conversion rates',
      industry: ['Technology', 'SaaS', 'Manufacturing', 'Professional Services'],
      duration: '30 days',
      successMetrics: [
        'Lead qualification speed increase by 60%',
        'Sales cycle reduction by 45%',
        'Conversion rate improvement by 40%',
        'Pipeline accuracy improvement by 70%'
      ],
      includedModules: ['AI Sales Expert', 'AI Customer Expert', 'AI Crystal Ball'],
      estimatedROI: '340%',
      difficulty: 'easy',
      icon: Target
    },
    {
      id: 'financial-optimization',
      name: 'Financial Intelligence POC',
      description: 'Demonstrate cash flow prediction and cost optimization capabilities',
      industry: ['Manufacturing', 'Retail', 'Healthcare', 'Financial Services'],
      duration: '45 days',
      successMetrics: [
        'Cash flow prediction accuracy >90%',
        'Cost reduction identification >15%',
        'Budget variance reduction by 50%',
        'Financial reporting automation 80%'
      ],
      includedModules: ['AI Money Detective', 'AI Crystal Ball', 'AI Operations Expert'],
      estimatedROI: '275%',
      difficulty: 'medium',
      icon: DollarSign
    },
    {
      id: 'operations-transformation',
      name: 'Operations Excellence POC',
      description: 'Prove workflow automation and efficiency gains across departments',
      industry: ['Manufacturing', 'Healthcare', 'Logistics', 'Government'],
      duration: '60 days',
      successMetrics: [
        'Process efficiency improvement 35%',
        'Manual task reduction by 70%',
        'Error rate reduction by 85%',
        'Employee productivity increase 45%'
      ],
      includedModules: ['AI Operations Expert', 'AI People Person', 'AI Crystal Ball'],
      estimatedROI: '420%',
      difficulty: 'complex',
      icon: Zap
    },
    {
      id: 'complete-transformation',
      name: 'Complete Digital Transformation',
      description: 'Full-scale POC across all business functions with measurable KPIs',
      industry: ['Enterprise', 'Conglomerate', 'Large Corporation'],
      duration: '90 days',
      successMetrics: [
        'Overall efficiency improvement 50%',
        'Revenue increase 25%',
        'Cost reduction 30%',
        'Customer satisfaction +40 NPS'
      ],
      includedModules: ['All AI Agents', 'Custom Integrations', 'Executive Dashboard'],
      estimatedROI: '650%',
      difficulty: 'complex',
      icon: Building
    }
  ]

  const handleTemplateSelect = (template: POCTemplate) => {
    setSelectedTemplate(template)
    setPocRequest({
      ...pocRequest,
      expectedROI: template.estimatedROI,
      timeline: template.duration
    })
    setStep('form')
  }

  const calculateROI = (formData: Partial<POCRequest>) => {
    // Simplified ROI calculation - in production this would be more sophisticated
    const companySize = parseInt(formData.companySize?.split('-')[0] || '100')
    const currentCosts = companySize * 2400 // $2400/employee/year for inefficiencies
    const projectedSavings = currentCosts * 0.35 // 35% savings
    const additionalRevenue = currentCosts * 0.25 // 25% revenue increase
    const implementation = Math.min(50000, companySize * 100) // Implementation costs

    const yearOneValue = projectedSavings + additionalRevenue - implementation
    const netROI = (yearOneValue / implementation) * 100
    const paybackPeriod = implementation / (projectedSavings / 12)

    const calculation: ROICalculation = {
      currentCosts,
      projectedSavings,
      additionalRevenue,
      implementation,
      netROI,
      paybackPeriod,
      yearOneValue
    }

    setROICalculation(calculation)
    setStep('roi')
  }

  const submitPOCRequest = async () => {
    setLoading(true)
    
    try {
      // Track POC request
      const pocData = {
        template: selectedTemplate?.id,
        templateName: selectedTemplate?.name,
        company: pocRequest.companyName,
        industry: pocRequest.industry,
        companySize: pocRequest.companySize,
        currentSolution: pocRequest.currentSolution,
        challenges: pocRequest.primaryChallenges,
        roi: roiCalculation,
        timestamp: new Date().toISOString()
      }

      // Send to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'enterprise_poc_request', {
          template_id: selectedTemplate?.id,
          company_size: pocRequest.companySize,
          industry: pocRequest.industry,
          estimated_roi: roiCalculation?.netROI,
          projected_value: roiCalculation?.yearOneValue
        })
      }

      // Submit to backend
      const response = await fetch('/api/enterprise/poc-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pocData)
      })

      if (response.ok) {
        setStep('submit')
      } else {
        throw new Error('Failed to submit POC request')
      }
    } catch (error) {
      console.error('POC submission error:', error)
      alert('There was an error submitting your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-4"
            >
              Enterprise <span className="gradient-text-ai">Proof of Concept</span>
            </motion.h1>
            <p className="text-xl text-gray-300 mb-6">
              90-day trial with guaranteed ROI tracking and dedicated success management
            </p>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[
                { id: 'template', label: 'Template', icon: FileText },
                { id: 'form', label: 'Details', icon: Building },
                { id: 'roi', label: 'ROI', icon: TrendingUp },
                { id: 'submit', label: 'Complete', icon: CheckCircle }
              ].map((stepItem, index) => {
                const Icon = stepItem.icon
                const isActive = step === stepItem.id
                const isCompleted = ['template', 'form', 'roi'].indexOf(step) > ['template', 'form', 'roi'].indexOf(stepItem.id)
                
                return (
                  <div key={stepItem.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'bg-violet-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`ml-2 text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {stepItem.label}
                    </span>
                    {index < 3 && (
                      <ArrowRight className="w-4 h-4 text-gray-600 mx-4" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Choose Your POC Template</h2>
                <p className="text-xl text-gray-300">
                  Select the business area where you want to see immediate ROI
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {pocTemplates.map((template, index) => {
                  const Icon = template.icon
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleTemplateSelect(template)}
                      className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 cursor-pointer hover:border-violet-500/50 transition-all group"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white group-hover:text-violet-300 transition-colors">
                            {template.name}
                          </h3>
                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {template.duration}
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              {template.estimatedROI} ROI
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-6">{template.description}</p>

                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-white mb-3">Success Metrics:</h4>
                        <div className="space-y-2">
                          {template.successMetrics.slice(0, 2).map((metric, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {metric}
                            </div>
                          ))}
                          {template.successMetrics.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{template.successMetrics.length - 2} more metrics
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {template.industry.slice(0, 2).map((industry) => (
                            <span key={industry} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                              {industry}
                            </span>
                          ))}
                          {template.industry.length > 2 && (
                            <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                              +{template.industry.length - 2}
                            </span>
                          )}
                        </div>
                        
                        <div className={`px-2 py-1 rounded text-xs ${
                          template.difficulty === 'easy' 
                            ? 'bg-green-600/20 text-green-400'
                            : template.difficulty === 'medium'
                            ? 'bg-yellow-600/20 text-yellow-400'
                            : 'bg-red-600/20 text-red-400'
                        }`}>
                          {template.difficulty}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 'form' && selectedTemplate && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {selectedTemplate.name} - Company Details
                </h2>
                <p className="text-gray-300">Help us customize your POC for maximum impact</p>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={pocRequest.companyName || ''}
                      onChange={(e) => setPocRequest({...pocRequest, companyName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-violet-500 focus:outline-none"
                      placeholder="Acme Corporation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Industry
                    </label>
                    <select
                      value={pocRequest.industry || ''}
                      onChange={(e) => setPocRequest({...pocRequest, industry: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="">Select Industry</option>
                      {selectedTemplate.industry.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Company Size
                    </label>
                    <select
                      value={pocRequest.companySize || ''}
                      onChange={(e) => setPocRequest({...pocRequest, companySize: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="">Select Size</option>
                      <option value="100-500">100-500 employees</option>
                      <option value="500-1000">500-1,000 employees</option>
                      <option value="1000-5000">1,000-5,000 employees</option>
                      <option value="5000+">5,000+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Current Solution
                    </label>
                    <select
                      value={pocRequest.currentSolution || ''}
                      onChange={(e) => setPocRequest({...pocRequest, currentSolution: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="">Select Current Solution</option>
                      <option value="SAP">SAP</option>
                      <option value="NetSuite">NetSuite</option>
                      <option value="Microsoft Dynamics">Microsoft Dynamics</option>
                      <option value="Salesforce">Salesforce</option>
                      <option value="Custom/Legacy">Custom/Legacy System</option>
                      <option value="Multiple Tools">Multiple Disconnected Tools</option>
                      <option value="Manual Processes">Mostly Manual Processes</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-medium text-white mb-4">
                    Primary Business Challenges (Select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Slow decision making',
                      'Data silos',
                      'Manual processes',
                      'Poor forecasting',
                      'High operational costs',
                      'Compliance issues',
                      'Customer satisfaction',
                      'Employee productivity'
                    ].map((challenge) => (
                      <label key={challenge} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pocRequest.primaryChallenges?.includes(challenge) || false}
                          onChange={(e) => {
                            const challenges = pocRequest.primaryChallenges || []
                            if (e.target.checked) {
                              setPocRequest({...pocRequest, primaryChallenges: [...challenges, challenge]})
                            } else {
                              setPocRequest({...pocRequest, primaryChallenges: challenges.filter(c => c !== challenge)})
                            }
                          }}
                          className="mr-3 w-4 h-4 text-violet-600 border-gray-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-gray-300">{challenge}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep('template')}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => calculateROI(pocRequest)}
                    disabled={!pocRequest.companyName || !pocRequest.industry || !pocRequest.companySize}
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Calculate ROI →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'roi' && roiCalculation && (
            <motion.div
              key="roi"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Your Projected ROI</h2>
                <p className="text-gray-300">Based on your company profile and industry benchmarks</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {roiCalculation.netROI.toFixed(0)}%
                  </div>
                  <div className="text-gray-300">First Year ROI</div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {roiCalculation.paybackPeriod.toFixed(1)}
                  </div>
                  <div className="text-gray-300">Months to Payback</div>
                </div>

                <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-violet-400 mb-2">
                    {formatCurrency(roiCalculation.yearOneValue)}
                  </div>
                  <div className="text-gray-300">Year One Value</div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-semibold text-white mb-6">ROI Breakdown</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <span className="text-gray-300">Current Annual Inefficiency Costs</span>
                    <span className="text-red-400 font-semibold">{formatCurrency(roiCalculation.currentCosts)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <span className="text-gray-300">Projected Annual Savings (35%)</span>
                    <span className="text-green-400 font-semibold">+{formatCurrency(roiCalculation.projectedSavings)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <span className="text-gray-300">Additional Revenue (25%)</span>
                    <span className="text-green-400 font-semibold">+{formatCurrency(roiCalculation.additionalRevenue)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <span className="text-gray-300">Implementation Investment</span>
                    <span className="text-gray-400 font-semibold">-{formatCurrency(roiCalculation.implementation)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 text-lg font-bold">
                    <span className="text-white">Net Year One Value</span>
                    <span className="text-emerald-400">{formatCurrency(roiCalculation.yearOneValue)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-violet-600/20 border border-violet-500/30 rounded-2xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-violet-400 mr-3" />
                  <h4 className="text-lg font-semibold text-white">90-Day Guarantee</h4>
                </div>
                <p className="text-gray-300">
                  If you don't see measurable improvement in your success metrics within 90 days, 
                  we'll refund 100% of your implementation cost. No questions asked.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('form')}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={submitPOCRequest}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Start 90-Day POC'}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">POC Request Submitted!</h2>
              <p className="text-xl text-gray-300 mb-8">
                Your dedicated success manager will contact you within 4 hours to begin setup.
              </p>

              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">What happens next:</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</div>
                    <span className="text-gray-300">Success manager call within 4 hours</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</div>
                    <span className="text-gray-300">Custom environment setup (24-48 hours)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</div>
                    <span className="text-gray-300">Team training and onboarding</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</div>
                    <span className="text-gray-300">90-day success tracking begins</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 transition-all"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => window.location.href = '/marketplace'}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold"
                >
                  Explore Marketplace
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}