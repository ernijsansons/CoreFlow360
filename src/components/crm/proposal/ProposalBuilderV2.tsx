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
  DownloadIcon,
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
  type:
    | 'cover'
    | 'executive-summary'
    | 'problem'
    | 'solution'
    | 'benefits'
    | 'pricing'
    | 'timeline'
    | 'team'
    | 'case-study'
    | 'testimonial'
    | 'cta'
  title: string
  content: unknown
  layout: string
  visuals: VisualElement[]
}

interface VisualElement {
  type: 'image' | 'chart' | 'infographic' | 'video' | 'animation' | 'interactive'
  data: unknown
  position: { x: number; y: number; width: number; height: number }
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
      animationStyle: 'creative',
    },
    sections: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Transform Your Business',
        content: {
          headline: 'AI-Powered Solutions for Tomorrow',
          subheadline: 'Revolutionize your operations with cutting-edge technology',
          backgroundType: 'gradient-animated',
        },
        layout: 'hero-centered',
        visuals: [
          {
            type: 'animation',
            data: { animationType: 'particle-network' },
            position: { x: 0, y: 0, width: 100, height: 100 },
            effects: ['glow', 'pulse'],
          },
        ],
      },
    ],
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
      animationStyle: 'professional',
    },
    sections: [],
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
      animationStyle: 'bold',
    },
    sections: [],
  },
]

const VISUAL_COMPONENTS = {
  infographics: [
    { id: 'decision-impact', name: 'Decision Impact Visualizer', type: 'interactive' },
    { id: 'roi-calculator', name: 'ROI Calculator', type: 'interactive' },
    { id: 'growth-trajectory', name: 'Growth Trajectory', type: 'chart' },
    { id: 'competitor-analysis', name: 'Competitor Analysis', type: 'chart' },
    { id: 'success-metrics', name: 'Success Metrics Dashboard', type: 'dashboard' },
  ],
  animations: [
    { id: 'logo-reveal', name: 'Logo Reveal', type: 'motion' },
    { id: 'data-flow', name: 'Data Flow Visualization', type: 'motion' },
    { id: 'process-timeline', name: 'Process Timeline', type: 'motion' },
  ],
  personalizations: [
    { id: 'ceo-message', name: 'Personalized CEO Message', type: 'video' },
    { id: 'team-intro', name: 'Team Introduction', type: 'video' },
    { id: 'custom-demo', name: 'Custom Product Demo', type: 'interactive' },
  ],
}

export default function ProposalBuilderV2() {
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [proposalData, setProposalData] = useState<unknown>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeVisual, setActiveVisual] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue } = useForm()

  const generatePersonalizedContent = useCallback(
    async (clientData: unknown) => {
      setIsGenerating(true)
      try {
        // AI-powered content generation
        const response = await fetch('/api/crm/proposals/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template: selectedTemplate,
            clientData,
            visualPreferences: activeVisual,
          }),
        })

        const result = await response.json()
        setProposalData(result.proposal)
        toast.success('Personalized proposal generated!')
      } catch (error) {
        toast.error('Failed to generate proposal')
      } finally {
        setIsGenerating(false)
      }
    },
    [selectedTemplate, activeVisual]
  )

  const addVisualElement = useCallback((visualType: string, visualId: string) => {
    const newVisual = {
      type: visualType,
      id: visualId,
      timestamp: Date.now(),
    }

    setProposalData((prev: unknown) => ({
      ...prev,
      visuals: [...(prev.visuals || []), newVisual],
    }))

    toast.success('Visual element added!')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">AI Proposal Builder</h1>
          <p className="text-lg text-gray-600">
            Create stunning, personalized proposals that convert
          </p>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-6 flex items-center text-2xl font-semibold">
              <SparklesIcon className="mr-2 h-6 w-6 text-purple-600" />
              Choose Your Template
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {STUNNING_TEMPLATES.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTemplate(template)}
                  className="cursor-pointer overflow-hidden rounded-lg shadow-md transition-all hover:shadow-xl"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-purple-400 to-pink-600">
                    <div className="flex h-48 items-center justify-center">
                      <DocumentTextIcon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <div className="bg-white p-4">
                    <h3 className="mb-1 text-lg font-semibold">{template.name}</h3>
                    <p className="mb-2 text-sm text-gray-600">{template.industry}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 text-sm">{template.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">{template.usageCount} uses</span>
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
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Left Panel - Visual Components */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Visual Elements</h3>

              {/* Infographics */}
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Infographics</h4>
                <div className="space-y-2">
                  {VISUAL_COMPONENTS.infographics.map((visual) => (
                    <button
                      key={visual.id}
                      onClick={() => addVisualElement('infographic', visual.id)}
                      className="w-full rounded-lg border p-3 text-left transition-all hover:border-purple-500 hover:bg-purple-50"
                    >
                      <div className="flex items-center">
                        <ChartBarIcon className="mr-2 h-5 w-5 text-purple-600" />
                        <span className="text-sm">{visual.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Animations</h4>
                <div className="space-y-2">
                  {VISUAL_COMPONENTS.animations.map((visual) => (
                    <button
                      key={visual.id}
                      onClick={() => addVisualElement('animation', visual.id)}
                      className="w-full rounded-lg border p-3 text-left transition-all hover:border-blue-500 hover:bg-blue-50"
                    >
                      <div className="flex items-center">
                        <VideoCameraIcon className="mr-2 h-5 w-5 text-blue-600" />
                        <span className="text-sm">{visual.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalizations */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Personalizations</h4>
                <div className="space-y-2">
                  {VISUAL_COMPONENTS.personalizations.map((visual) => (
                    <button
                      key={visual.id}
                      onClick={() => addVisualElement('personalization', visual.id)}
                      className="w-full rounded-lg border p-3 text-left transition-all hover:border-green-500 hover:bg-green-50"
                    >
                      <div className="flex items-center">
                        <UserGroupIcon className="mr-2 h-5 w-5 text-green-600" />
                        <span className="text-sm">{visual.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Panel - Content Editor */}
            <div className="rounded-xl bg-white p-6 shadow-lg lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Proposal Content</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
                  >
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => generatePersonalizedContent(watch())}
                    disabled={isGenerating}
                    className="flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white transition-all hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="mr-2 h-4 w-4" />
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Decision Maker Name
                    </label>
                    <input
                      {...register('decisionMakerName')}
                      className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <input
                      {...register('companyName')}
                      className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Key Business Challenge
                  </label>
                  <textarea
                    {...register('businessChallenge')}
                    rows={3}
                    className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe the main challenge they're facing..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Desired Outcome
                  </label>
                  <textarea
                    {...register('desiredOutcome')}
                    rows={3}
                    className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    placeholder="What success looks like for them..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Budget Range
                    </label>
                    <select
                      {...register('budgetRange')}
                      className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select budget</option>
                      <option value="10-25k">$10,000 - $25,000</option>
                      <option value="25-50k">$25,000 - $50,000</option>
                      <option value="50-100k">$50,000 - $100,000</option>
                      <option value="100k+">$100,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Timeline</label>
                    <select
                      {...register('timeline')}
                      className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
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
                <div className="mt-6 border-t pt-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Added Visual Elements</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {proposalData.visuals.map((visual: unknown, index: number) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center">
                          {visual.type === 'infographic' && (
                            <ChartBarIcon className="mr-2 h-5 w-5 text-purple-600" />
                          )}
                          {visual.type === 'animation' && (
                            <VideoCameraIcon className="mr-2 h-5 w-5 text-blue-600" />
                          )}
                          {visual.type === 'personalization' && (
                            <UserGroupIcon className="mr-2 h-5 w-5 text-green-600" />
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
            className="overflow-hidden rounded-xl bg-white shadow-lg"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Proposal Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="rounded-lg bg-white px-4 py-2 text-purple-600 transition-colors hover:bg-gray-100"
                  >
                    Back to Edit
                  </button>
                  <button className="flex items-center rounded-lg bg-white px-4 py-2 text-purple-600 transition-colors hover:bg-gray-100">
                    <ShareIcon className="mr-2 h-4 w-4" />
                    Share
                  </button>
                  <button className="flex items-center rounded-lg bg-white px-4 py-2 text-purple-600 transition-colors hover:bg-gray-100">
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Preview content would be rendered here */}
              <div className="py-20 text-center">
                <DocumentTextIcon className="mx-auto mb-4 h-24 w-24 text-gray-300" />
                <p className="text-gray-500">Proposal preview will appear here</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
