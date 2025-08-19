'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  GlobeAltIcon,
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  CubeIcon,
  PaintBrushIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  CloudArrowDownIcon,
  ShareIcon,
  PencilSquareIcon,
  DuplicateIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface VisualTemplate {
  id: string
  name: string
  category: TemplateCategory
  type: ContentType
  thumbnail: string
  preview: string
  tags: string[]
  industry: string[]
  rating: number
  downloads: number
  isPremium: boolean
  customizable: CustomizationOptions
  aiFeatures: AIFeature[]
  dimensions: {
    width: number
    height: number
    format: string
  }
}

interface TemplateCategory {
  id: string
  name: string
  icon: React.ComponentType<unknown>
  color: string
}

interface ContentType {
  id: string
  name: string
  icon: React.ComponentType<unknown>
}

interface CustomizationOptions {
  colors: boolean
  fonts: boolean
  layout: boolean
  content: boolean
  animations: boolean
  branding: boolean
}

interface AIFeature {
  id: string
  name: string
  description: string
}

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'proposals', name: 'Proposals', icon: DocumentTextIcon, color: 'purple' },
  { id: 'presentations', name: 'Presentations', icon: PresentationChartLineIcon, color: 'blue' },
  { id: 'infographics', name: 'Infographics', icon: ChartBarIcon, color: 'green' },
  { id: 'social', name: 'Social Media', icon: GlobeAltIcon, color: 'pink' },
  { id: 'videos', name: 'Videos', icon: VideoCameraIcon, color: 'red' },
  { id: 'interactive', name: 'Interactive', icon: CubeIcon, color: 'orange' },
]

const CONTENT_TYPES: ContentType[] = [
  { id: 'static', name: 'Static', icon: PhotoIcon },
  { id: 'animated', name: 'Animated', icon: BoltIcon },
  { id: 'video', name: 'Video', icon: VideoCameraIcon },
  { id: 'interactive', name: 'Interactive', icon: CubeIcon },
]

const STUNNING_TEMPLATES: VisualTemplate[] = [
  // Proposal Templates
  {
    id: 'executive-impact-proposal',
    name: 'Executive Impact Proposal',
    category: TEMPLATE_CATEGORIES[0],
    type: CONTENT_TYPES[2],
    thumbnail: '/templates/executive-impact-thumb.jpg',
    preview: '/templates/executive-impact-preview.mp4',
    tags: ['professional', 'data-driven', 'executive', 'impact'],
    industry: ['Technology', 'Finance', 'Consulting'],
    rating: 4.9,
    downloads: 3450,
    isPremium: true,
    customizable: {
      colors: true,
      fonts: true,
      layout: true,
      content: true,
      animations: true,
      branding: true,
    },
    aiFeatures: [
      {
        id: 'auto-personalize',
        name: 'Auto Personalization',
        description: 'AI personalizes content for each recipient',
      },
      {
        id: 'data-viz',
        name: 'Smart Data Visualization',
        description: 'Automatically creates charts from your data',
      },
      {
        id: 'content-gen',
        name: 'Content Generation',
        description: 'AI writes compelling copy based on inputs',
      },
    ],
    dimensions: { width: 1920, height: 1080, format: 'HD Video' },
  },
  {
    id: 'innovation-showcase',
    name: 'Innovation Showcase',
    category: TEMPLATE_CATEGORIES[0],
    type: CONTENT_TYPES[1],
    thumbnail: '/templates/innovation-showcase-thumb.jpg',
    preview: '/templates/innovation-showcase-preview.gif',
    tags: ['creative', 'modern', 'tech', 'innovative'],
    industry: ['SaaS', 'Startup', 'Technology'],
    rating: 4.8,
    downloads: 2890,
    isPremium: true,
    customizable: {
      colors: true,
      fonts: true,
      layout: true,
      content: true,
      animations: true,
      branding: true,
    },
    aiFeatures: [
      {
        id: 'motion-design',
        name: 'AI Motion Design',
        description: 'Creates smooth animations automatically',
      },
      {
        id: 'color-match',
        name: 'Brand Color Matching',
        description: 'Matches template to brand colors',
      },
    ],
    dimensions: { width: 1920, height: 1080, format: 'Animated PDF' },
  },

  // Presentation Templates
  {
    id: 'growth-story-deck',
    name: 'Growth Story Deck',
    category: TEMPLATE_CATEGORIES[1],
    type: CONTENT_TYPES[3],
    thumbnail: '/templates/growth-story-thumb.jpg',
    preview: '/templates/growth-story-preview.html',
    tags: ['storytelling', 'growth', 'metrics', 'investor'],
    industry: ['All Industries'],
    rating: 4.9,
    downloads: 5670,
    isPremium: false,
    customizable: {
      colors: true,
      fonts: true,
      layout: true,
      content: true,
      animations: true,
      branding: true,
    },
    aiFeatures: [
      {
        id: 'story-flow',
        name: 'Story Flow Optimizer',
        description: 'Optimizes slide flow for maximum impact',
      },
      {
        id: 'data-import',
        name: 'Smart Data Import',
        description: 'Imports and visualizes data automatically',
      },
    ],
    dimensions: { width: 1920, height: 1080, format: 'Interactive HTML5' },
  },

  // Infographic Templates
  {
    id: 'decision-impact-visual',
    name: 'Decision Impact Visualizer',
    category: TEMPLATE_CATEGORIES[2],
    type: CONTENT_TYPES[0],
    thumbnail: '/templates/decision-impact-thumb.jpg',
    preview: '/templates/decision-impact-preview.png',
    tags: ['infographic', 'decision', 'impact', 'executive'],
    industry: ['Enterprise', 'Consulting', 'Finance'],
    rating: 4.7,
    downloads: 4320,
    isPremium: true,
    customizable: {
      colors: true,
      fonts: true,
      layout: true,
      content: true,
      animations: false,
      branding: true,
    },
    aiFeatures: [
      {
        id: 'data-analysis',
        name: 'Impact Analysis',
        description: 'Analyzes and visualizes decision impacts',
      },
      {
        id: 'icon-suggestion',
        name: 'Smart Icon Selection',
        description: 'Suggests relevant icons for your content',
      },
    ],
    dimensions: { width: 2480, height: 3508, format: 'Print-Ready PDF' },
  },

  // Video Templates
  {
    id: 'ceo-message-video',
    name: 'Personalized CEO Message',
    category: TEMPLATE_CATEGORIES[4],
    type: CONTENT_TYPES[2],
    thumbnail: '/templates/ceo-message-thumb.jpg',
    preview: '/templates/ceo-message-preview.mp4',
    tags: ['video', 'personalized', 'executive', 'message'],
    industry: ['All Industries'],
    rating: 5.0,
    downloads: 6780,
    isPremium: true,
    customizable: {
      colors: true,
      fonts: true,
      layout: false,
      content: true,
      animations: true,
      branding: true,
    },
    aiFeatures: [
      {
        id: 'voice-clone',
        name: 'AI Voice Cloning',
        description: 'Creates natural voice from text',
      },
      { id: 'lip-sync', name: 'Lip Sync Animation', description: 'Syncs avatar lips to speech' },
      {
        id: 'scene-gen',
        name: 'Scene Generation',
        description: 'Generates professional backgrounds',
      },
    ],
    dimensions: { width: 1920, height: 1080, format: 'MP4 Video' },
  },

  // Social Media Templates
  {
    id: 'viral-success-story',
    name: 'Viral Success Story',
    category: TEMPLATE_CATEGORIES[3],
    type: CONTENT_TYPES[1],
    thumbnail: '/templates/viral-success-thumb.jpg',
    preview: '/templates/viral-success-preview.gif',
    tags: ['social', 'viral', 'story', 'engagement'],
    industry: ['B2C', 'Retail', 'Technology'],
    rating: 4.6,
    downloads: 3210,
    isPremium: false,
    customizable: {
      colors: true,
      fonts: true,
      layout: true,
      content: true,
      animations: true,
      branding: true,
    },
    aiFeatures: [
      {
        id: 'trend-match',
        name: 'Trend Matching',
        description: 'Matches content to current trends',
      },
      { id: 'hashtag-gen', name: 'Hashtag Generator', description: 'Generates relevant hashtags' },
    ],
    dimensions: { width: 1080, height: 1080, format: 'Square Video' },
  },

  // Interactive Templates
  {
    id: 'roi-calculator-interactive',
    name: 'Interactive ROI Calculator',
    category: TEMPLATE_CATEGORIES[5],
    type: CONTENT_TYPES[3],
    thumbnail: '/templates/roi-calculator-thumb.jpg',
    preview: '/templates/roi-calculator-preview.html',
    tags: ['interactive', 'calculator', 'roi', 'sales'],
    industry: ['SaaS', 'Technology', 'Finance'],
    rating: 4.9,
    downloads: 5430,
    isPremium: true,
    customizable: {
      colors: true,
      fonts: true,
      layout: true,
      content: true,
      animations: true,
      branding: true,
    },
    aiFeatures: [
      {
        id: 'formula-builder',
        name: 'AI Formula Builder',
        description: 'Creates custom ROI formulas',
      },
      {
        id: 'benchmark-data',
        name: 'Industry Benchmarks',
        description: 'Includes industry benchmark data',
      },
    ],
    dimensions: { width: 1920, height: 1080, format: 'Interactive Web' },
  },
]

const AI_ENHANCEMENT_OPTIONS = [
  { id: 'personalize', name: 'Personalize Content', icon: SparklesIcon },
  { id: 'optimize', name: 'Optimize for Conversion', icon: ChartBarIcon },
  { id: 'translate', name: 'Multi-language', icon: GlobeAltIcon },
  { id: 'accessibility', name: 'Enhance Accessibility', icon: HeartIcon },
]

export default function VisualContentLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTemplates, setFilteredTemplates] = useState(STUNNING_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<VisualTemplate | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [customizationOptions, setCustomizationOptions] = useState<unknown>({})
  const [aiEnhancements, setAiEnhancements] = useState<string[]>([])

  useEffect(() => {
    let filtered = STUNNING_TEMPLATES

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category.id === selectedCategory)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((t) => t.type.id === selectedType)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredTemplates(filtered)
  }, [selectedCategory, selectedType, searchQuery])

  const handleTemplateSelect = useCallback((template: VisualTemplate) => {
    setSelectedTemplate(template)
    setIsCustomizing(false)
  }, [])

  const handleCustomize = useCallback(async () => {
    if (!selectedTemplate) return

    setIsCustomizing(true)
    try {
      const response = await fetch('/api/crm/templates/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          customizations: customizationOptions,
          aiEnhancements,
        }),
      })

      const result = await response.json()
      toast.success('Template customized successfully!')

      // Open customization editor
      window.open(result.editorUrl, '_blank')
    } catch (error) {
      toast.error('Failed to customize template')
    } finally {
      setIsCustomizing(false)
    }
  }, [selectedTemplate, customizationOptions, aiEnhancements])

  const handleDownload = useCallback(async (template: VisualTemplate) => {
    try {
      const response = await fetch('/api/crm/templates/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name}.${template.dimensions.format.split(' ')[0].toLowerCase()}`
      a.click()

      toast.success('Template downloaded!')
    } catch (error) {
      toast.error('Failed to download template')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Visual Content Library</h1>
          <p className="text-lg text-gray-600">
            Stunning templates that convert prospects into customers
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="min-w-[300px] flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="Search templates..."
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              {CONTENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-lg"
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Thumbnail */}
              <div className="aspect-w-16 aspect-h-9 group relative bg-gradient-to-br from-purple-100 to-pink-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <template.type.icon className="h-20 w-20 text-purple-300" />
                </div>

                {/* Hover Overlay */}
                <div className="bg-opacity-0 group-hover:bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-all group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button className="rounded-full bg-white p-2 transition-colors hover:bg-gray-100">
                      <PlayIcon className="h-5 w-5 text-gray-700" />
                    </button>
                    <button className="rounded-full bg-white p-2 transition-colors hover:bg-gray-100">
                      <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 text-xs font-semibold text-white">
                    PREMIUM
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="ml-1 text-sm text-gray-600">{template.rating}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3 flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <ArrowDownTrayIcon className="mr-1 h-4 w-4" />
                    {template.downloads.toLocaleString()}
                  </span>
                  <span>{template.dimensions.format}</span>
                </div>

                {/* AI Features */}
                {template.aiFeatures.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <div className="flex items-center text-sm">
                      <SparklesIcon className="mr-1 h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-600">
                        {template.aiFeatures.length} AI Features
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Template Detail Modal */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
              onClick={() => setSelectedTemplate(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="border-b p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                      <p className="mt-1 text-gray-600">
                        {selectedTemplate.category.name} • {selectedTemplate.type.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Preview */}
                    <div>
                      <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg bg-gray-100">
                        <div className="flex items-center justify-center">
                          <selectedTemplate.type.icon className="h-24 w-24 text-gray-300" />
                        </div>
                      </div>

                      {/* AI Features */}
                      <div className="mt-4">
                        <h3 className="mb-3 text-lg font-semibold">AI Features</h3>
                        <div className="space-y-2">
                          {selectedTemplate.aiFeatures.map((feature) => (
                            <div key={feature.id} className="flex items-start">
                              <SparklesIcon className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-purple-600" />
                              <div>
                                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      {/* Customization Options */}
                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-semibold">Customization Options</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedTemplate.customizable).map(([key, value]) => (
                            <div key={key} className="flex items-center">
                              <div
                                className={`mr-2 h-4 w-4 rounded-full ${
                                  value ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Enhancements */}
                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-semibold">AI Enhancements</h3>
                        <div className="space-y-2">
                          {AI_ENHANCEMENT_OPTIONS.map((option) => (
                            <label key={option.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={aiEnhancements.includes(option.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAiEnhancements([...aiEnhancements, option.id])
                                  } else {
                                    setAiEnhancements(
                                      aiEnhancements.filter((id) => id !== option.id)
                                    )
                                  }
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <div className="ml-3 flex items-center">
                                <option.icon className="mr-2 h-5 w-5 text-gray-500" />
                                <span className="text-gray-700">{option.name}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Industries */}
                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-semibold">Best For</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.industry.map((ind) => (
                            <span
                              key={ind}
                              className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedTemplate.rating}
                          </div>
                          <div className="text-sm text-gray-600">Rating</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedTemplate.downloads.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Downloads</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedTemplate.dimensions.width}x{selectedTemplate.dimensions.height}
                          </div>
                          <div className="text-sm text-gray-600">Resolution</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t bg-gray-50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="flex items-center rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
                        <ShareIcon className="mr-2 h-4 w-4" />
                        Share
                      </button>
                      <button className="flex items-center rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
                        <DuplicateIcon className="mr-2 h-4 w-4" />
                        Duplicate
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(selectedTemplate)}
                        className="flex items-center rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                      >
                        <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={handleCustomize}
                        disabled={isCustomizing}
                        className="flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white transition-all hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                      >
                        {isCustomizing ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                            Customizing...
                          </>
                        ) : (
                          <>
                            <PencilSquareIcon className="mr-2 h-4 w-4" />
                            Customize & Use
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
