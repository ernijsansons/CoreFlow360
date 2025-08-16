'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBarIcon,
  UserIcon,
  BuildingOfficeIcon,
  TrendingUpIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  CameraIcon,
  ShareIcon,
  DownloadIcon,
  PaintBrushIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface InfographicData {
  decisionMakerName: string
  decisionMakerTitle: string
  companyName: string
  companyLogo?: string
  impact: {
    revenue: { current: number; projected: number; growth: number }
    efficiency: { current: number; projected: number; improvement: number }
    customers: { current: number; projected: number; growth: number }
    timeToMarket: { current: number; projected: number; reduction: number }
  }
  keyMetrics: Array<{
    label: string
    value: string | number
    trend: 'up' | 'down' | 'neutral'
    impact: 'high' | 'medium' | 'low'
  }>
  risks: Array<{
    description: string
    probability: number
    impact: number
  }>
  recommendations: string[]
}

const INFOGRAPHIC_TEMPLATES = [
  {
    id: 'executive-impact',
    name: 'Executive Impact Dashboard',
    description: 'Shows direct business impact with personalized metrics',
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    style: 'professional'
  },
  {
    id: 'growth-trajectory',
    name: 'Growth Trajectory Visualizer',
    description: 'Illustrates potential growth paths and outcomes',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    style: 'dynamic'
  },
  {
    id: 'risk-opportunity',
    name: 'Risk vs Opportunity Matrix',
    description: 'Balances risks against potential opportunities',
    primaryColor: '#DC2626',
    secondaryColor: '#F59E0B',
    style: 'analytical'
  },
  {
    id: 'roi-calculator',
    name: 'ROI Impact Calculator',
    description: 'Visual ROI breakdown with timeline',
    primaryColor: '#7C3AED',
    secondaryColor: '#A78BFA',
    style: 'financial'
  }
]

const VISUAL_STYLES = [
  { id: 'modern', name: 'Modern Minimal', className: 'modern-minimal' },
  { id: 'corporate', name: 'Corporate Professional', className: 'corporate-pro' },
  { id: 'creative', name: 'Creative Bold', className: 'creative-bold' },
  { id: 'tech', name: 'Tech Futuristic', className: 'tech-future' }
]

export default function InfographicGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(INFOGRAPHIC_TEMPLATES[0])
  const [selectedStyle, setSelectedStyle] = useState(VISUAL_STYLES[0])
  const [infographicData, setInfographicData] = useState<InfographicData>({
    decisionMakerName: '',
    decisionMakerTitle: '',
    companyName: '',
    impact: {
      revenue: { current: 1000000, projected: 1500000, growth: 50 },
      efficiency: { current: 65, projected: 85, improvement: 20 },
      customers: { current: 1000, projected: 2500, growth: 150 },
      timeToMarket: { current: 12, projected: 6, reduction: 50 }
    },
    keyMetrics: [],
    risks: [],
    recommendations: []
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const infographicRef = useRef<HTMLDivElement>(null)

  const generateInfographic = useCallback(async () => {
    setIsGenerating(true)
    try {
      // Generate AI-powered insights
      const response = await fetch('/api/crm/infographics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate.id,
          data: infographicData
        })
      })

      const result = await response.json()
      setInfographicData(prev => ({
        ...prev,
        keyMetrics: result.keyMetrics,
        risks: result.risks,
        recommendations: result.recommendations
      }))

      // Generate download link for the infographic
      const imageUrl = `/api/crm/infographics/render?template=${selectedTemplate.id}&data=${encodeURIComponent(JSON.stringify(infographicData))}`
      setGeneratedImage(imageUrl)

      toast.success('Infographic generated successfully!')
    } catch (error) {
      toast.error('Failed to generate infographic')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedTemplate, infographicData])

  const shareInfographic = useCallback(async (channel: 'email' | 'sms' | 'whatsapp' | 'linkedin') => {
    if (!generatedImage) return

    try {
      const response = await fetch('/api/crm/infographics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          image: generatedImage,
          recipientData: {
            name: infographicData.decisionMakerName,
            company: infographicData.companyName
          }
        })
      })

      if (response.ok) {
        toast.success(`Infographic shared via ${channel}!`)
      }
    } catch (error) {
      toast.error('Failed to share infographic')
    }
  }, [generatedImage, infographicData])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Decision Maker Infographic Generator
          </h1>
          <p className="text-gray-600">
            Create personalized, impactful visuals that resonate with executives
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Choose Template</h3>
              <div className="space-y-3">
                {INFOGRAPHIC_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Visual Style</h3>
              <div className="grid grid-cols-2 gap-3">
                {VISUAL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedStyle.id === style.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Decision Maker Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Decision Maker Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    value={infographicData.decisionMakerName}
                    onChange={(e) => setInfographicData(prev => ({
                      ...prev,
                      decisionMakerName: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    value={infographicData.decisionMakerTitle}
                    onChange={(e) => setInfographicData(prev => ({
                      ...prev,
                      decisionMakerTitle: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CEO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    value={infographicData.companyName}
                    onChange={(e) => setInfographicData(prev => ({
                      ...prev,
                      companyName: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Toolbar */}
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Infographic Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={generateInfographic}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </button>
                  {generatedImage && (
                    <>
                      <button
                        onClick={() => shareInfographic('email')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                      >
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a')
                          link.download = `infographic-${infographicData.decisionMakerName}.png`
                          link.href = generatedImage
                          link.click()
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Infographic Content */}
              <div className="p-8">
                <div
                  ref={infographicRef}
                  className={`bg-white rounded-lg p-8 ${selectedStyle.className}`}
                  style={{
                    background: `linear-gradient(135deg, ${selectedTemplate.primaryColor}10 0%, ${selectedTemplate.secondaryColor}10 100%)`
                  }}
                >
                  {/* Header Section */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                      <UserIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {infographicData.decisionMakerName || 'Decision Maker'}'s Impact Analysis
                    </h2>
                    <p className="text-lg text-gray-600">
                      {infographicData.decisionMakerTitle} at {infographicData.companyName}
                    </p>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
                        <span className="text-2xl font-bold text-green-500">
                          +{infographicData.impact.revenue.growth}%
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Revenue Growth</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        ${(infographicData.impact.revenue.projected / 1000000).toFixed(1)}M projected
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUpIcon className="w-8 h-8 text-blue-500" />
                        <span className="text-2xl font-bold text-blue-500">
                          +{infographicData.impact.efficiency.improvement}%
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Efficiency Gain</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {infographicData.impact.efficiency.projected}% operational efficiency
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <UserIcon className="w-8 h-8 text-purple-500" />
                        <span className="text-2xl font-bold text-purple-500">
                          {infographicData.impact.customers.growth}%
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Customer Growth</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {infographicData.impact.customers.projected.toLocaleString()} customers
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-orange-500"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <ClockIcon className="w-8 h-8 text-orange-500" />
                        <span className="text-2xl font-bold text-orange-500">
                          -{infographicData.impact.timeToMarket.reduction}%
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Time to Market</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {infographicData.impact.timeToMarket.projected} months
                      </p>
                    </motion.div>
                  </div>

                  {/* Visual Chart Section */}
                  <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
                    <h3 className="text-xl font-semibold mb-4">Projected Business Impact</h3>
                    <div className="h-64 flex items-end justify-between gap-4">
                      {Object.entries(infographicData.impact).map(([key, value], index) => (
                        <div key={key} className="flex-1 flex flex-col items-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(value.projected / value.current) * 100}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                            className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg relative"
                            style={{ minHeight: '40px' }}
                          >
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-gray-900">
                              {value.growth || value.improvement || value.reduction}%
                            </span>
                          </motion.div>
                          <p className="text-sm text-gray-600 mt-2 text-center capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <LightBulbIcon className="w-6 h-6 mr-2 text-blue-600" />
                      Strategic Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Implement AI-driven automation', 'Optimize customer experience', 'Scale operations efficiently', 'Enhance data analytics'].map((rec, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}