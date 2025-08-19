'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Share2,
  TrendingUp,
  Award,
  Presentation,
  Download,
  Send,
  Calendar,
  Target,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Eye,
  Heart,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'

interface ContentTemplate {
  id: string
  name: string
  description: string
  type: 'executive-report' | 'success-story' | 'benchmark-report' | 'social-post' | 'presentation'
  icon: React.ElementType
  estimatedViralScore: number
  timeToGenerate: string
  shareability: 'High' | 'Medium' | 'Low'
  targetAudience: string[]
  sampleOutput: string
}

interface GenerationRequest {
  templateId: string
  customizations: {
    title?: string
    message?: string
    callToAction?: string
    includeMetrics?: boolean
    includeBranding?: boolean
  }
  distribution: {
    channels: string[]
    schedule: 'immediate' | 'scheduled'
    scheduledTime?: Date
  }
}

interface GeneratedContentPreview {
  id: string
  title: string
  preview: string
  viralScore: number
  estimatedReach: number
  shareUrl: string
  status: 'generating' | 'ready' | 'distributed'
}

export default function ContentGeneration() {
  const [step, setStep] = useState<'templates' | 'customize' | 'preview' | 'success'>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null)
  const [generationRequest, setGenerationRequest] = useState<Partial<GenerationRequest>>({})
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentPreview | null>(null)
  const [loading, setLoading] = useState(false)

  const templates: ContentTemplate[] = [
    {
      id: 'executive-report',
      name: 'Executive Performance Report',
      description: 'Professional monthly report with AI insights and branded metrics',
      type: 'executive-report',
      icon: FileText,
      estimatedViralScore: 85,
      timeToGenerate: '2 minutes',
      shareability: 'High',
      targetAudience: ['Executives', 'Board Members', 'Investors'],
      sampleOutput:
        'Professional PDF report showing 34% efficiency improvement and $2.4M annual savings...',
    },
    {
      id: 'success-story',
      name: 'ROI Success Story',
      description: 'Compelling case study highlighting your business transformation',
      type: 'success-story',
      icon: Award,
      estimatedViralScore: 92,
      timeToGenerate: '3 minutes',
      shareability: 'High',
      targetAudience: ['Peers', 'Industry Leaders', 'Prospects'],
      sampleOutput: '"How Acme Corp achieved 340% ROI in 90 days with AI automation..."',
    },
    {
      id: 'benchmark-report',
      name: 'Industry Benchmark Report',
      description: 'Data-driven industry analysis featuring your performance',
      type: 'benchmark-report',
      icon: BarChart3,
      estimatedViralScore: 78,
      timeToGenerate: '4 minutes',
      shareability: 'High',
      targetAudience: ['Industry Analysts', 'Media', 'Executives'],
      sampleOutput: 'Comprehensive industry report showing you outperform 87% of competitors...',
    },
    {
      id: 'linkedin-post',
      name: 'LinkedIn Achievement Post',
      description: 'Professional social media content highlighting your success',
      type: 'social-post',
      icon: Share2,
      estimatedViralScore: 70,
      timeToGenerate: '1 minute',
      shareability: 'High',
      targetAudience: ['Professional Network', 'Industry Peers'],
      sampleOutput: '🚀 Exciting update! Our AI transformation delivered 45% efficiency gains...',
    },
    {
      id: 'board-presentation',
      name: 'Board Presentation',
      description: 'Executive presentation template with performance metrics',
      type: 'presentation',
      icon: Presentation,
      estimatedViralScore: 65,
      timeToGenerate: '5 minutes',
      shareability: 'Medium',
      targetAudience: ['Board Members', 'Executive Team', 'Stakeholders'],
      sampleOutput:
        '12-slide presentation covering AI ROI, efficiency gains, and strategic impact...',
    },
  ]

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template)
    setGenerationRequest({
      templateId: template.id,
      customizations: {
        includeMetrics: true,
        includeBranding: true,
      },
      distribution: {
        channels: [],
        schedule: 'immediate',
      },
    })
    setStep('customize')
  }

  const generateContent = async () => {
    if (!selectedTemplate || !generationRequest.templateId) return

    setLoading(true)

    try {
      // Simulate content generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockContent: GeneratedContentPreview = {
        id: `content_${Date.now()}`,
        title: generationRequest.customizations?.title || selectedTemplate.name,
        preview: selectedTemplate.sampleOutput,
        viralScore: selectedTemplate.estimatedViralScore,
        estimatedReach: Math.floor(Math.random() * 10000) + 5000,
        shareUrl: `https://coreflow360.com/share/content_${Date.now()}`,
        status: 'ready',
      }

      setGeneratedContent(mockContent)

      // Track generation
      if (typeof window !== 'undefined' && (window as unknown).gtag) {
        ;(window as unknown).gtag('event', 'content_generated', {
          template_id: selectedTemplate.id,
          template_name: selectedTemplate.name,
          viral_score: mockContent.viralScore,
          estimated_reach: mockContent.estimatedReach,
        })
      }

      setStep('preview')
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleDistribute = async () => {
    if (!generatedContent) return

    setLoading(true)

    try {
      // Simulate distribution
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setGeneratedContent({
        ...generatedContent,
        status: 'distributed',
      })

      setStep('success')
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-orange-400'
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
              className="mb-4 text-4xl font-bold"
            >
              <span className="gradient-text-ai">Content Generation</span>
            </motion.h1>
            <p className="mb-6 text-xl text-gray-300">
              Transform your performance data into viral content that drives growth
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4">
              {[
                { id: 'templates', label: 'Choose Template', icon: FileText },
                { id: 'customize', label: 'Customize', icon: Target },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'success', label: 'Share', icon: Share2 },
              ].map((stepItem, index) => {
                const Icon = stepItem.icon
                const isActive = step === stepItem.id
                const isCompleted =
                  ['templates', 'customize', 'preview'].indexOf(step) >
                  ['templates', 'customize', 'preview'].indexOf(stepItem.id)

                return (
                  <div key={stepItem.id} className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isActive
                          ? 'bg-violet-600 text-white'
                          : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`ml-2 text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {stepItem.label}
                    </span>
                    {index < 3 && <ArrowRight className="mx-4 h-4 w-4 text-gray-600" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">Choose Content Template</h2>
                <p className="text-xl text-gray-300">
                  Select the type of content that best showcases your success
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template, index) => {
                  const Icon = template.icon
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleTemplateSelect(template)}
                      className="group cursor-pointer rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm transition-all hover:border-violet-500/50"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            template.shareability === 'High'
                              ? 'bg-green-600/20 text-green-400'
                              : template.shareability === 'Medium'
                                ? 'bg-yellow-600/20 text-yellow-400'
                                : 'bg-gray-600/20 text-gray-400'
                          }`}
                        >
                          {template.shareability} Viral
                        </div>
                      </div>

                      <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-violet-300">
                        {template.name}
                      </h3>

                      <p className="mb-6 text-sm text-gray-300">{template.description}</p>

                      <div className="mb-6 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Viral Score:</span>
                          <span
                            className={`font-semibold ${getViralScoreColor(template.estimatedViralScore)}`}
                          >
                            {template.estimatedViralScore}/100
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Generation Time:</span>
                          <span className="text-gray-300">{template.timeToGenerate}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="mb-2 text-xs text-gray-400">Target Audience:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.targetAudience.slice(0, 2).map((audience) => (
                            <span
                              key={audience}
                              className="rounded bg-gray-700/50 px-2 py-1 text-xs text-gray-300"
                            >
                              {audience}
                            </span>
                          ))}
                          {template.targetAudience.length > 2 && (
                            <span className="rounded bg-gray-700/50 px-2 py-1 text-xs text-gray-400">
                              +{template.targetAudience.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4 rounded-xl bg-gray-900/40 p-3">
                        <div className="mb-1 text-xs text-gray-400">Sample Output:</div>
                        <div className="text-xs text-gray-300 italic">{template.sampleOutput}</div>
                      </div>

                      <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 py-2 font-medium text-white transition-all hover:opacity-90">
                        Select Template
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 'customize' && selectedTemplate && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">
                  Customize Your {selectedTemplate.name}
                </h2>
                <p className="text-gray-300">Personalize the content for maximum impact</p>
              </div>

              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
                <div className="mb-8 grid gap-8 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Custom Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={generationRequest.customizations?.title || ''}
                      onChange={(e) =>
                        setGenerationRequest({
                          ...generationRequest,
                          customizations: {
                            ...generationRequest.customizations,
                            title: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900/50 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                      placeholder={selectedTemplate.name}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Call to Action
                    </label>
                    <input
                      type="text"
                      value={generationRequest.customizations?.callToAction || ''}
                      onChange={(e) =>
                        setGenerationRequest({
                          ...generationRequest,
                          customizations: {
                            ...generationRequest.customizations,
                            callToAction: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900/50 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                      placeholder="Learn more about our transformation"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="mb-4 block text-sm font-medium text-white">
                    Distribution Channels
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {['LinkedIn', 'Email', 'Internal Slack', 'Executive Report'].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            generationRequest.distribution?.channels?.includes(channel) || false
                          }
                          onChange={(e) => {
                            const channels = generationRequest.distribution?.channels || []
                            const newChannels = e.target.checked
                              ? [...channels, channel]
                              : channels.filter((c) => c !== channel)
                            setGenerationRequest({
                              ...generationRequest,
                              distribution: {
                                ...generationRequest.distribution,
                                channels: newChannels,
                              },
                            })
                          }}
                          className="mr-3 h-4 w-4 rounded border-gray-600 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-gray-300">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="mb-4 block text-sm font-medium text-white">
                    Content Options
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={generationRequest.customizations?.includeMetrics || false}
                        onChange={(e) =>
                          setGenerationRequest({
                            ...generationRequest,
                            customizations: {
                              ...generationRequest.customizations,
                              includeMetrics: e.target.checked,
                            },
                          })
                        }
                        className="mr-3 h-4 w-4 rounded border-gray-600 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-gray-300">Include performance metrics</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={generationRequest.customizations?.includeBranding || false}
                        onChange={(e) =>
                          setGenerationRequest({
                            ...generationRequest,
                            customizations: {
                              ...generationRequest.customizations,
                              includeBranding: e.target.checked,
                            },
                          })
                        }
                        className="mr-3 h-4 w-4 rounded border-gray-600 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-gray-300">Include company branding</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('templates')}
                    className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition-all hover:border-gray-500"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={generateContent}
                    disabled={loading}
                    className="flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Content
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'preview' && generatedContent && selectedTemplate && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">Content Preview</h2>
                <p className="text-gray-300">Review and distribute your generated content</p>
              </div>

              {/* Viral Score Display */}
              <div className="mb-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6 text-center">
                  <div
                    className={`mb-2 text-3xl font-bold ${getViralScoreColor(generatedContent.viralScore)}`}
                  >
                    {generatedContent.viralScore}/100
                  </div>
                  <div className="text-gray-300">Viral Score</div>
                </div>

                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-6 text-center">
                  <div className="mb-2 text-3xl font-bold text-blue-400">
                    {generatedContent.estimatedReach.toLocaleString()}
                  </div>
                  <div className="text-gray-300">Est. Reach</div>
                </div>

                <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-6 text-center">
                  <div className="mb-2 text-3xl font-bold text-violet-400">
                    {selectedTemplate.timeToGenerate}
                  </div>
                  <div className="text-gray-300">Generated In</div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
                <h3 className="mb-4 text-xl font-semibold text-white">{generatedContent.title}</h3>

                <div className="mb-6 rounded-xl bg-white/5 p-6">
                  <div className="whitespace-pre-line text-gray-300">
                    {generatedContent.preview}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      Projected views:{' '}
                      {Math.floor(generatedContent.estimatedReach * 0.3).toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <Share2 className="mr-1 h-4 w-4" />
                      Projected shares:{' '}
                      {Math.floor(generatedContent.estimatedReach * 0.05).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex items-center rounded-xl border border-gray-600 px-4 py-2 text-gray-300 transition-all hover:border-gray-500">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </button>
                    <button className="flex items-center rounded-xl border border-gray-600 px-4 py-2 text-gray-300 transition-all hover:border-gray-500">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('customize')}
                  className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition-all hover:border-gray-500"
                >
                  ← Back
                </button>
                <button
                  onClick={handleDistribute}
                  disabled={loading}
                  className="flex items-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Send className="mr-2 h-5 w-5 animate-pulse" />
                      Distributing...
                    </>
                  ) : (
                    <>
                      Distribute Content
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && generatedContent && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-2xl text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              <h2 className="mb-4 text-3xl font-bold text-white">Content Distributed!</h2>
              <p className="mb-8 text-xl text-gray-300">
                Your content is now spreading across your selected channels
              </p>

              <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">Share URL</h3>
                <div className="flex items-center rounded-xl bg-gray-900/40 p-3">
                  <span className="flex-1 font-mono text-sm text-gray-300">
                    {generatedContent.shareUrl}
                  </span>
                  <button className="ml-3 rounded bg-violet-600 px-3 py-1 text-sm text-white transition-colors hover:bg-violet-700">
                    Copy
                  </button>
                </div>
              </div>

              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-gray-800/40 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-green-400">
                    {generatedContent.viralScore}
                  </div>
                  <div className="text-sm text-gray-400">Viral Score</div>
                </div>
                <div className="rounded-xl bg-gray-800/40 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-blue-400">
                    {generatedContent.estimatedReach.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Est. Reach</div>
                </div>
                <div className="rounded-xl bg-gray-800/40 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-violet-400">
                    {generationRequest.distribution?.channels?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Channels</div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => {
                    setStep('templates')
                    setSelectedTemplate(null)
                    setGenerationRequest({})
                    setGeneratedContent(null)
                  }}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 font-semibold text-white"
                >
                  Create More Content
                </button>
                <button
                  onClick={() => (window.location.href = '/dashboard')}
                  className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition-all hover:border-gray-500"
                >
                  View Analytics
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
