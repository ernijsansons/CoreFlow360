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
  ExternalLink
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
      sampleOutput: 'Professional PDF report showing 34% efficiency improvement and $2.4M annual savings...'
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
      sampleOutput: '"How Acme Corp achieved 340% ROI in 90 days with AI automation..."'
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
      sampleOutput: 'Comprehensive industry report showing you outperform 87% of competitors...'
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
      sampleOutput: '🚀 Exciting update! Our AI transformation delivered 45% efficiency gains...'
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
      sampleOutput: '12-slide presentation covering AI ROI, efficiency gains, and strategic impact...'
    }
  ]

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template)
    setGenerationRequest({
      templateId: template.id,
      customizations: {
        includeMetrics: true,
        includeBranding: true
      },
      distribution: {
        channels: [],
        schedule: 'immediate'
      }
    })
    setStep('customize')
  }

  const generateContent = async () => {
    if (!selectedTemplate || !generationRequest.templateId) return
    
    setLoading(true)
    
    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockContent: GeneratedContentPreview = {
        id: `content_${Date.now()}`,
        title: generationRequest.customizations?.title || selectedTemplate.name,
        preview: selectedTemplate.sampleOutput,
        viralScore: selectedTemplate.estimatedViralScore,
        estimatedReach: Math.floor(Math.random() * 10000) + 5000,
        shareUrl: `https://coreflow360.com/share/content_${Date.now()}`,
        status: 'ready'
      }
      
      setGeneratedContent(mockContent)
      
      // Track generation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'content_generated', {
          template_id: selectedTemplate.id,
          template_name: selectedTemplate.name,
          viral_score: mockContent.viralScore,
          estimated_reach: mockContent.estimatedReach
        })
      }
      
      setStep('preview')
    } catch (error) {
      console.error('Content generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDistribute = async () => {
    if (!generatedContent) return
    
    setLoading(true)
    
    try {
      // Simulate distribution
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setGeneratedContent({
        ...generatedContent,
        status: 'distributed'
      })
      
      setStep('success')
    } catch (error) {
      console.error('Distribution failed:', error)
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
              className="text-4xl font-bold mb-4"
            >
              <span className="gradient-text-ai">Content Generation</span>
            </motion.h1>
            <p className="text-xl text-gray-300 mb-6">
              Transform your performance data into viral content that drives growth
            </p>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4">
              {[
                { id: 'templates', label: 'Choose Template', icon: FileText },
                { id: 'customize', label: 'Customize', icon: Target },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'success', label: 'Share', icon: Share2 }
              ].map((stepItem, index) => {
                const Icon = stepItem.icon
                const isActive = step === stepItem.id
                const isCompleted = ['templates', 'customize', 'preview'].indexOf(step) > ['templates', 'customize', 'preview'].indexOf(stepItem.id)
                
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
          {step === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Choose Content Template</h2>
                <p className="text-xl text-gray-300">
                  Select the type of content that best showcases your success
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template, index) => {
                  const Icon = template.icon
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleTemplateSelect(template)}
                      className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 cursor-pointer hover:border-violet-500/50 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          template.shareability === 'High' 
                            ? 'bg-green-600/20 text-green-400'
                            : template.shareability === 'Medium'
                            ? 'bg-yellow-600/20 text-yellow-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {template.shareability} Viral
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                        {template.name}
                      </h3>
                      
                      <p className="text-gray-300 text-sm mb-6">{template.description}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Viral Score:</span>
                          <span className={`font-semibold ${getViralScoreColor(template.estimatedViralScore)}`}>
                            {template.estimatedViralScore}/100
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Generation Time:</span>
                          <span className="text-gray-300">{template.timeToGenerate}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="text-xs text-gray-400 mb-2">Target Audience:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.targetAudience.slice(0, 2).map((audience) => (
                            <span key={audience} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                              {audience}
                            </span>
                          ))}
                          {template.targetAudience.length > 2 && (
                            <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                              +{template.targetAudience.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-900/40 rounded-xl p-3 mb-4">
                        <div className="text-xs text-gray-400 mb-1">Sample Output:</div>
                        <div className="text-gray-300 text-xs italic">
                          {template.sampleOutput}
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white py-2 rounded-xl font-medium transition-all">
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
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Customize Your {selectedTemplate.name}
                </h2>
                <p className="text-gray-300">Personalize the content for maximum impact</p>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Custom Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={generationRequest.customizations?.title || ''}
                      onChange={(e) => setGenerationRequest({
                        ...generationRequest,
                        customizations: {
                          ...generationRequest.customizations,
                          title: e.target.value
                        }
                      })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-violet-500 focus:outline-none"
                      placeholder={selectedTemplate.name}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Call to Action
                    </label>
                    <input
                      type="text"
                      value={generationRequest.customizations?.callToAction || ''}
                      onChange={(e) => setGenerationRequest({
                        ...generationRequest,
                        customizations: {
                          ...generationRequest.customizations,
                          callToAction: e.target.value
                        }
                      })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-violet-500 focus:outline-none"
                      placeholder="Learn more about our transformation"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-white mb-4">
                    Distribution Channels
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['LinkedIn', 'Email', 'Internal Slack', 'Executive Report'].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={generationRequest.distribution?.channels?.includes(channel) || false}
                          onChange={(e) => {
                            const channels = generationRequest.distribution?.channels || []
                            const newChannels = e.target.checked
                              ? [...channels, channel]
                              : channels.filter(c => c !== channel)
                            setGenerationRequest({
                              ...generationRequest,
                              distribution: {
                                ...generationRequest.distribution,
                                channels: newChannels
                              }
                            })
                          }}
                          className="mr-3 w-4 h-4 text-violet-600 border-gray-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-gray-300">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-white mb-4">
                    Content Options
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={generationRequest.customizations?.includeMetrics || false}
                        onChange={(e) => setGenerationRequest({
                          ...generationRequest,
                          customizations: {
                            ...generationRequest.customizations,
                            includeMetrics: e.target.checked
                          }
                        })}
                        className="mr-3 w-4 h-4 text-violet-600 border-gray-600 rounded focus:ring-violet-500"
                      />
                      <span className="text-gray-300">Include performance metrics</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={generationRequest.customizations?.includeBranding || false}
                        onChange={(e) => setGenerationRequest({
                          ...generationRequest,
                          customizations: {
                            ...generationRequest.customizations,
                            includeBranding: e.target.checked
                          }
                        })}
                        className="mr-3 w-4 h-4 text-violet-600 border-gray-600 rounded focus:ring-violet-500"
                      />
                      <span className="text-gray-300">Include company branding</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('templates')}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={generateContent}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Content
                        <ArrowRight className="w-5 h-5 ml-2" />
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
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Content Preview</h2>
                <p className="text-gray-300">Review and distribute your generated content</p>
              </div>

              {/* Viral Score Display */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 text-center">
                  <div className={`text-3xl font-bold mb-2 ${getViralScoreColor(generatedContent.viralScore)}`}>
                    {generatedContent.viralScore}/100
                  </div>
                  <div className="text-gray-300">Viral Score</div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {generatedContent.estimatedReach.toLocaleString()}
                  </div>
                  <div className="text-gray-300">Est. Reach</div>
                </div>

                <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-violet-400 mb-2">
                    {selectedTemplate.timeToGenerate}
                  </div>
                  <div className="text-gray-300">Generated In</div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {generatedContent.title}
                </h3>
                
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <div className="text-gray-300 whitespace-pre-line">
                    {generatedContent.preview}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Projected views: {Math.floor(generatedContent.estimatedReach * 0.3).toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <Share2 className="w-4 h-4 mr-1" />
                      Projected shares: {Math.floor(generatedContent.estimatedReach * 0.05).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 transition-all flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 transition-all flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('customize')}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleDistribute}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Send className="w-5 h-5 mr-2 animate-pulse" />
                      Distributing...
                    </>
                  ) : (
                    <>
                      Distribute Content
                      <Send className="w-5 h-5 ml-2" />
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
              className="text-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Content Distributed!</h2>
              <p className="text-xl text-gray-300 mb-8">
                Your content is now spreading across your selected channels
              </p>

              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Share URL</h3>
                <div className="flex items-center bg-gray-900/40 rounded-xl p-3">
                  <span className="text-gray-300 flex-1 font-mono text-sm">
                    {generatedContent.shareUrl}
                  </span>
                  <button className="ml-3 px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-700 transition-colors">
                    Copy
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/40 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {generatedContent.viralScore}
                  </div>
                  <div className="text-gray-400 text-sm">Viral Score</div>
                </div>
                <div className="bg-gray-800/40 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {generatedContent.estimatedReach.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Est. Reach</div>
                </div>
                <div className="bg-gray-800/40 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-violet-400 mb-1">
                    {generationRequest.distribution?.channels?.length || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Channels</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setStep('templates')
                    setSelectedTemplate(null)
                    setGenerationRequest({})
                    setGeneratedContent(null)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold"
                >
                  Create More Content
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 transition-all"
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