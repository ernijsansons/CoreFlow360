'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  PresentationChartLineIcon,
  PhotoIcon,
  VideoCameraIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  ShareIcon,
  DownloadIcon
} from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface ProposalTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  sections: ProposalSection[]
  style: ProposalStyle
  industry: string
  rating: number
  usageCount: number
}

interface ProposalSection {
  id: string
  type: 'cover' | 'executive-summary' | 'problem' | 'solution' | 'benefits' | 'pricing' | 'timeline' | 'team' | 'case-study' | 'testimonial' | 'cta'
  title: string
  content: any
  layout: string
  visuals: VisualElement[]
}

interface VisualElement {
  type: 'image' | 'chart' | 'infographic' | 'video' | 'animation' | 'interactive'
  data: any
  position: { x: number, y: number, width: number, height: number }
  effects: string[]
}

interface ProposalStyle {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  borderRadius: string
  animationStyle: 'professional' | 'creative' | 'minimal' | 'bold'
}

const STUNNING_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'tech-innovation',
    name: 'Tech Innovation Showcase',
    category: 'Technology',
    thumbnail: '/templates/tech-innovation.jpg',
    industry: 'SaaS',
    rating: 4.9,
    usageCount: 1250,
    style: {
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      fontFamily: 'Inter',
      borderRadius: '12px',
      animationStyle: 'creative'
    },
    sections: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Transform Your Business',
        content: {
          headline: 'AI-Powered Solutions for Tomorrow',
          subheadline: 'Revolutionize your operations with cutting-edge technology',
          backgroundType: 'gradient-animated'
        },
        layout: 'hero-centered',
        visuals: [
          {
            type: 'animation',
            data: { animationType: 'particle-network' },
            position: { x: 0, y: 0, width: 100, height: 100 },
            effects: ['glow', 'pulse']
          }
        ]
      }
    ]
  },
  {
    id: 'executive-impact',
    name: 'Executive Impact Report',
    category: 'Enterprise',
    thumbnail: '/templates/executive-impact.jpg',
    industry: 'Consulting',
    rating: 4.8,
    usageCount: 890,
    style: {
      primaryColor: '#0F172A',
      secondaryColor: '#3B82F6',
      fontFamily: 'Playfair Display',
      borderRadius: '0px',
      animationStyle: 'professional'
    },
    sections: []
  },
  {
    id: 'creative-agency',
    name: 'Creative Agency Pitch',
    category: 'Marketing',
    thumbnail: '/templates/creative-agency.jpg',
    industry: 'Agency',
    rating: 4.9,
    usageCount: 2100,
    style: {
      primaryColor: '#EC4899',
      secondaryColor: '#F59E0B',
      fontFamily: 'Poppins',
      borderRadius: '24px',
      animationStyle: 'bold'
    },
    sections: []
  }
]

const VISUAL_COMPONENTS = {
  infographics: [
    { id: 'decision-impact', name: 'Decision Impact Visualizer', type: 'interactive' },
    { id: 'roi-calculator', name: 'ROI Calculator', type: 'interactive' },
    { id: 'growth-trajectory', name: 'Growth Trajectory', type: 'chart' },
    { id: 'competitor-analysis', name: 'Competitor Analysis', type: 'chart' },
    { id: 'success-metrics', name: 'Success Metrics Dashboard', type: 'dashboard' }
  ],
  animations: [
    { id: 'logo-reveal', name: 'Logo Reveal', type: 'motion' },
    { id: 'data-flow', name: 'Data Flow Visualization', type: 'motion' },
    { id: 'process-timeline', name: 'Process Timeline', type: 'motion' }
  ],
  personalizations: [
    { id: 'ceo-message', name: 'Personalized CEO Message', type: 'video' },
    { id: 'team-intro', name: 'Team Introduction', type: 'video' },
    { id: 'custom-demo', name: 'Custom Product Demo', type: 'interactive' }
  ]
}

export default function ProposalBuilderV2() {
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [proposalData, setProposalData] = useState<any>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeVisual, setActiveVisual] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue } = useForm()

  const generatePersonalizedContent = useCallback(async (clientData: any) => {
    setIsGenerating(true)
    try {
      // AI-powered content generation
      const response = await fetch('/api/crm/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          clientData,
          visualPreferences: activeVisual
        })
      })

      const result = await response.json()
      setProposalData(result.proposal)
      toast.success('Personalized proposal generated!')
    } catch (error) {
      toast.error('Failed to generate proposal')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedTemplate, activeVisual])

  const addVisualElement = useCallback((visualType: string, visualId: string) => {
    const newVisual = {
      type: visualType,
      id: visualId,
      timestamp: Date.now()
    }
    
    setProposalData((prev: any) => ({
      ...prev,
      visuals: [...(prev.visuals || []), newVisual]
    }))
    
    toast.success('Visual element added!')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Proposal Builder
          </h1>
          <p className="text-lg text-gray-600">
            Create stunning, personalized proposals that convert
          </p>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <SparklesIcon className="w-6 h-6 mr-2 text-purple-600" />
              Choose Your Template
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STUNNING_TEMPLATES.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTemplate(template)}
                  className="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-purple-400 to-pink-600">
                    <div className="flex items-center justify-center h-48">
                      <DocumentTextIcon className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.industry}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm ml-1">{template.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {template.usageCount} uses
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Proposal Builder */}
        {selectedTemplate && !previewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Panel - Visual Components */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Visual Elements</h3>
              
              {/* Infographics */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Infographics
                </h4>
                <div className="space-y-2">
                  {VISUAL_COMPONENTS.infographics.map((visual) => (
                    <button
                      key={visual.id}
                      onClick={() => addVisualElement('infographic', visual.id)}
                      className="w-full text-left p-3 rounded-lg border hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                      <div className="flex items-center">
                        <ChartBarIcon className="w-5 h-5 mr-2 text-purple-600" />
                        <span className="text-sm">{visual.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Animations
                </h4>
                <div className="space-y-2">
                  {VISUAL_COMPONENTS.animations.map((visual) => (
                    <button
                      key={visual.id}
                      onClick={() => addVisualElement('animation', visual.id)}
                      className="w-full text-left p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center">
                        <VideoCameraIcon className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="text-sm">{visual.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalizations */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Personalizations
                </h4>
                <div className="space-y-2">
                  {VISUAL_COMPONENTS.personalizations.map((visual) => (
                    <button
                      key={visual.id}
                      onClick={() => addVisualElement('personalization', visual.id)}
                      className="w-full text-left p-3 rounded-lg border hover:border-green-500 hover:bg-green-50 transition-all"
                    >
                      <div className="flex items-center">
                        <UserGroupIcon className="w-5 h-5 mr-2 text-green-600" />
                        <span className="text-sm">{visual.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Panel - Content Editor */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Proposal Content</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={() => generatePersonalizedContent(watch())}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Generate AI Content
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Client Information Form */}
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Decision Maker Name
                    </label>
                    <input
                      {...register('decisionMakerName')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      {...register('companyName')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Business Challenge
                  </label>
                  <textarea
                    {...register('businessChallenge')}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the main challenge they're facing..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desired Outcome
                  </label>
                  <textarea
                    {...register('desiredOutcome')}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="What success looks like for them..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Range
                    </label>
                    <select
                      {...register('budgetRange')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select budget</option>
                      <option value="10-25k">$10,000 - $25,000</option>
                      <option value="25-50k">$25,000 - $50,000</option>
                      <option value="50-100k">$50,000 - $100,000</option>
                      <option value="100k+">$100,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeline
                    </label>
                    <select
                      {...register('timeline')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select timeline</option>
                      <option value="immediate">Immediate</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="3-months">Within 3 months</option>
                      <option value="6-months">Within 6 months</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Visual Elements Added */}
              {proposalData.visuals && proposalData.visuals.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Added Visual Elements
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {proposalData.visuals.map((visual: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center">
                          {visual.type === 'infographic' && (
                            <ChartBarIcon className="w-5 h-5 mr-2 text-purple-600" />
                          )}
                          {visual.type === 'animation' && (
                            <VideoCameraIcon className="w-5 h-5 mr-2 text-blue-600" />
                          )}
                          {visual.type === 'personalization' && (
                            <UserGroupIcon className="w-5 h-5 mr-2 text-green-600" />
                          )}
                          <span className="text-sm">{visual.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Preview Mode */}
        {previewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Proposal Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                    <ShareIcon className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Preview content would be rendered here */}
              <div className="text-center py-20">
                <DocumentTextIcon className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Proposal preview will appear here</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}