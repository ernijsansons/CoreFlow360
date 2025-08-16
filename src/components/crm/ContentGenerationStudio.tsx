/**
 * CoreFlow360 - Visual Content Generation Studio
 * AI-powered marketing material creation interface ($29/month)
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  DocumentTextIcon,
  PhotoIcon,
  FilmIcon,
  PresentationChartLineIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  DownloadIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  BeakerIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  StarIcon,
  SwatchIcon,
  CpuChipIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { AccessibleButton, AccessibleInput, AccessibleSelect, AccessibleTextarea } from '@/components/accessibility/AccessibleComponents'

interface ContentTemplate {
  id: string
  name: string
  category: string
  description: string
  thumbnailUrl: string
  popularity: number
  premium: boolean
  industries: string[]
  useCases: string[]
}

interface GeneratedContent {
  id: string
  type: string
  title: string
  status: 'GENERATING' | 'READY' | 'FAILED'
  previewUrl?: string
  assets: Array<{
    format: string
    url: string
    size: string
  }>
  createdAt: string
  metrics?: {
    views: number
    downloads: number
    shares: number
  }
}

interface ProposalProject {
  id: string
  clientName: string
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'SENT'
  value: number
  products: string[]
  includesVideo: boolean
  createdAt: string
  documentUrl?: string
  videoUrl?: string
}

interface BrandSettings {
  companyName: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  tagline?: string
}

export default function ContentGenerationStudio() {
  const [activeTab, setActiveTab] = useState<'templates' | 'infographics' | 'proposals' | 'social' | 'brand'>('templates')
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [proposals, setProposals] = useState<ProposalProject[]>([])
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    companyName: '',
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6'
  })
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Mock data - in real app, fetch from API
      const mockTemplates: ContentTemplate[] = [
        {
          id: 'inf-stats-modern',
          name: 'Modern Statistics Infographic',
          category: 'INFOGRAPHIC',
          description: 'Clean, modern design for showcasing key statistics and metrics',
          thumbnailUrl: '/templates/stats-modern-thumb.png',
          popularity: 95,
          premium: false,
          industries: ['Technology', 'SaaS', 'Finance'],
          useCases: ['Product Launch', 'Annual Report', 'Sales Pitch']
        },
        {
          id: 'inf-comparison',
          name: 'Comparison Chart',
          category: 'INFOGRAPHIC',
          description: 'Side-by-side comparison of features, pricing, or benefits',
          thumbnailUrl: '/templates/comparison-thumb.png',
          popularity: 88,
          premium: false,
          industries: ['All'],
          useCases: ['Competitive Analysis', 'Product Comparison']
        },
        {
          id: 'social-linkedin',
          name: 'LinkedIn Post Template',
          category: 'SOCIAL',
          description: 'Professional LinkedIn post with engagement-optimized layout',
          thumbnailUrl: '/templates/linkedin-thumb.png',
          popularity: 92,
          premium: false,
          industries: ['B2B', 'Professional Services'],
          useCases: ['Thought Leadership', 'Company Updates']
        },
        {
          id: 'prop-executive',
          name: 'Executive Proposal',
          category: 'PROPOSAL',
          description: 'Concise executive-focused proposal with ROI emphasis',
          thumbnailUrl: '/templates/exec-proposal-thumb.png',
          popularity: 87,
          premium: true,
          industries: ['Enterprise', 'B2B'],
          useCases: ['Enterprise Sales', 'C-Suite Presentations']
        },
        {
          id: 'one-pager-saas',
          name: 'SaaS One-Pager',
          category: 'ONE_PAGER',
          description: 'Single-page overview of your SaaS solution',
          thumbnailUrl: '/templates/saas-onepager-thumb.png',
          popularity: 90,
          premium: false,
          industries: ['SaaS', 'Technology'],
          useCases: ['Sales Enablement', 'Trade Shows']
        }
      ]

      const mockGeneratedContent: GeneratedContent[] = [
        {
          id: 'gen-001',
          type: 'INFOGRAPHIC',
          title: 'Q4 2024 Performance Metrics',
          status: 'READY',
          previewUrl: '/generated/q4-metrics-preview.png',
          assets: [
            { format: 'PNG', url: '/generated/q4-metrics.png', size: '1080x1920' },
            { format: 'PDF', url: '/generated/q4-metrics.pdf', size: 'A4' }
          ],
          createdAt: '2024-08-08T10:00:00Z',
          metrics: { views: 145, downloads: 23, shares: 8 }
        },
        {
          id: 'gen-002',
          type: 'SOCIAL',
          title: 'Product Launch Announcement',
          status: 'GENERATING',
          createdAt: '2024-08-09T14:30:00Z'
        }
      ]

      const mockProposals: ProposalProject[] = [
        {
          id: 'prop-001',
          clientName: 'TechCorp Solutions',
          status: 'READY',
          value: 125000,
          products: ['CRM Pro', 'Automation Suite'],
          includesVideo: true,
          createdAt: '2024-08-07T09:00:00Z',
          documentUrl: '/proposals/techcorp-proposal.pdf',
          videoUrl: '/proposals/techcorp-video.mp4'
        },
        {
          id: 'prop-002',
          clientName: 'Growth Industries',
          status: 'GENERATING',
          value: 85000,
          products: ['CRM Pro'],
          includesVideo: false,
          createdAt: '2024-08-09T11:00:00Z'
        }
      ]

      setTemplates(mockTemplates)
      setGeneratedContent(mockGeneratedContent)
      setProposals(mockProposals)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = filterCategory === 'ALL' || template.category === filterCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'INFOGRAPHIC': PhotoIcon,
      'PROPOSAL': DocumentTextIcon,
      'SOCIAL': ShareIcon,
      'ONE_PAGER': DocumentDuplicateIcon,
      'PRESENTATION': PresentationChartLineIcon,
      'VIDEO': FilmIcon
    }
    return icons[category] || DocumentTextIcon
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'GENERATING': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'DRAFT': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'SENT': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'FAILED': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const handleGenerateContent = async (template: ContentTemplate) => {
    setSelectedTemplate(template)
    
    if (template.category === 'PROPOSAL') {
      setShowProposalModal(true)
    } else {
      setShowGenerateModal(true)
    }
  }

  const handleCreateContent = async (data: any) => {
    try {
      const newContent: GeneratedContent = {
        id: `gen-${Date.now()}`,
        type: selectedTemplate?.category || 'INFOGRAPHIC',
        title: data.title,
        status: 'GENERATING',
        createdAt: new Date().toISOString()
      }

      setGeneratedContent([newContent, ...generatedContent])
      setShowGenerateModal(false)

      // Simulate generation
      setTimeout(() => {
        setGeneratedContent(prev => prev.map(content => 
          content.id === newContent.id
            ? {
                ...content,
                status: 'READY',
                previewUrl: '/generated/preview.png',
                assets: [
                  { format: 'PNG', url: '/generated/content.png', size: '1080x1920' }
                ]
              }
            : content
        ))
      }, 5000)
    } catch (error) {
      console.error('Failed to generate content:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Premium Badge */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Generation Studio</h1>
          <p className="text-gray-400 mt-1">Create stunning marketing materials with AI</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Visual Studio - $29/month</span>
            </div>
          </div>
          <AccessibleButton className="bg-gradient-to-r from-purple-500 to-pink-600">
            <RocketLaunchIcon className="w-4 h-4 mr-2" />
            Upgrade Now
          </AccessibleButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Templates Available</p>
              <p className="text-2xl font-bold text-white">500+</p>
            </div>
            <DocumentDuplicateIcon className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Content Generated</p>
              <p className="text-2xl font-bold text-white">{generatedContent.length}</p>
            </div>
            <SparklesIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Proposals</p>
              <p className="text-2xl font-bold text-white">{proposals.length}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Downloads</p>
              <p className="text-2xl font-bold text-white">
                {generatedContent.reduce((sum, c) => sum + (c.metrics?.downloads || 0), 0)}
              </p>
            </div>
            <DownloadIcon className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'templates', name: 'Templates', icon: DocumentDuplicateIcon },
            { id: 'infographics', name: 'Generated Content', icon: PhotoIcon },
            { id: 'proposals', name: 'Proposals', icon: DocumentTextIcon },
            { id: 'social', name: 'Social Media', icon: ShareIcon },
            { id: 'brand', name: 'Brand Settings', icon: SwatchIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <AccessibleSelect
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={[
                    { value: 'ALL', label: 'All Categories' },
                    { value: 'INFOGRAPHIC', label: 'Infographics' },
                    { value: 'PROPOSAL', label: 'Proposals' },
                    { value: 'SOCIAL', label: 'Social Media' },
                    { value: 'ONE_PAGER', label: 'One-Pagers' }
                  ]}
                />
                <AccessibleInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search templates..."
                  className="w-64"
                />
              </div>
              <AccessibleButton variant="secondary">
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Filters
              </AccessibleButton>
            </div>

            {/* Template Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((template, index) => {
                const CategoryIcon = getCategoryIcon(template.category)
                
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors cursor-pointer"
                    onClick={() => handleGenerateContent(template)}
                  >
                    <div className="aspect-[4/3] bg-gray-800 relative">
                      {template.thumbnailUrl ? (
                        <img
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <CategoryIcon className="w-16 h-16 text-gray-600" />
                        </div>
                      )}
                      {template.premium && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded">
                          PREMIUM
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(template.popularity / 20)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-400 capitalize">
                          {template.category.replace('_', ' ').toLowerCase()}
                        </span>
                        <AccessibleButton size="sm" variant="ghost">
                          <SparklesIcon className="w-4 h-4 mr-1" />
                          Use
                        </AccessibleButton>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'infographics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {generatedContent.map((content, index) => {
              const CategoryIcon = getCategoryIcon(content.type)
              
              return (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                        {content.previewUrl ? (
                          <img
                            src={content.previewUrl}
                            alt={content.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : content.status === 'GENERATING' ? (
                          <ArrowPathIcon className="w-8 h-8 text-purple-400 animate-spin" />
                        ) : (
                          <CategoryIcon className="w-8 h-8 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{content.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(content.status)}`}>
                            {content.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <span className="capitalize">{content.type.toLowerCase()}</span>
                          <span>Created {new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {content.metrics && (
                          <div className="flex items-center space-x-6 text-sm">
                            <span className="text-gray-300">
                              <EyeIcon className="w-4 h-4 inline mr-1" />
                              {content.metrics.views} views
                            </span>
                            <span className="text-gray-300">
                              <DownloadIcon className="w-4 h-4 inline mr-1" />
                              {content.metrics.downloads} downloads
                            </span>
                            <span className="text-gray-300">
                              <ShareIcon className="w-4 h-4 inline mr-1" />
                              {content.metrics.shares} shares
                            </span>
                          </div>
                        )}
                        
                        {content.assets && content.assets.length > 0 && (
                          <div className="mt-3 flex items-center space-x-2">
                            {content.assets.map((asset, i) => (
                              <span key={i} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                                {asset.format} • {asset.size}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {content.status === 'READY' && (
                        <>
                          <AccessibleButton variant="ghost" size="sm">
                            <EyeIcon className="w-4 h-4" />
                          </AccessibleButton>
                          <AccessibleButton variant="ghost" size="sm">
                            <PencilIcon className="w-4 h-4" />
                          </AccessibleButton>
                          <AccessibleButton variant="ghost" size="sm">
                            <ShareIcon className="w-4 h-4" />
                          </AccessibleButton>
                          <AccessibleButton variant="ghost" size="sm">
                            <DownloadIcon className="w-4 h-4" />
                          </AccessibleButton>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'proposals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-end mb-4">
              <AccessibleButton onClick={() => setShowProposalModal(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                New Proposal
              </AccessibleButton>
            </div>
            
            {proposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{proposal.clientName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      {proposal.includesVideo && (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded text-xs">
                          <FilmIcon className="w-3 h-3 inline mr-1" />
                          VIDEO
                        </span>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Deal Value</p>
                        <p className="text-xl font-semibold text-green-400">
                          ${proposal.value.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Products</p>
                        <p className="text-white">{proposal.products.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Created</p>
                        <p className="text-white">{new Date(proposal.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {proposal.status === 'READY' && (
                      <div className="flex items-center space-x-4">
                        {proposal.documentUrl && (
                          <a
                            href={proposal.documentUrl}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                            View Proposal
                          </a>
                        )}
                        {proposal.videoUrl && (
                          <a
                            href={proposal.videoUrl}
                            className="text-sm text-purple-400 hover:text-purple-300"
                          >
                            <FilmIcon className="w-4 h-4 inline mr-1" />
                            Watch Video
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {proposal.status === 'READY' && (
                      <>
                        <AccessibleButton variant="ghost" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </AccessibleButton>
                        <AccessibleButton variant="ghost" size="sm">
                          <ShareIcon className="w-4 h-4" />
                        </AccessibleButton>
                        <AccessibleButton size="sm">
                          Send to Client
                        </AccessibleButton>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'brand' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl"
          >
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Brand Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Company Name</label>
                  <AccessibleInput
                    value={brandSettings.companyName}
                    onChange={(value) => setBrandSettings({...brandSettings, companyName: value})}
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tagline</label>
                  <AccessibleInput
                    value={brandSettings.tagline || ''}
                    onChange={(value) => setBrandSettings({...brandSettings, tagline: value})}
                    placeholder="Your company tagline"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandSettings.primaryColor}
                        onChange={(e) => setBrandSettings({...brandSettings, primaryColor: e.target.value})}
                        className="w-12 h-12 rounded border-2 border-gray-700"
                      />
                      <AccessibleInput
                        value={brandSettings.primaryColor}
                        onChange={(value) => setBrandSettings({...brandSettings, primaryColor: value})}
                        placeholder="#6366F1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandSettings.secondaryColor}
                        onChange={(e) => setBrandSettings({...brandSettings, secondaryColor: e.target.value})}
                        className="w-12 h-12 rounded border-2 border-gray-700"
                      />
                      <AccessibleInput
                        value={brandSettings.secondaryColor}
                        onChange={(value) => setBrandSettings({...brandSettings, secondaryColor: value})}
                        placeholder="#8B5CF6"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Logo</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                    <PhotoIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 mb-2">Upload your company logo</p>
                    <AccessibleButton variant="secondary" size="sm">
                      Choose File
                    </AccessibleButton>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <AccessibleButton variant="secondary">
                    Reset
                  </AccessibleButton>
                  <AccessibleButton>
                    Save Brand Settings
                  </AccessibleButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Content Modal */}
      <AnimatePresence>
        {showGenerateModal && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Generate {selectedTemplate.name}
                </h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <AccessibleInput
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Key Points</label>
                  <AccessibleTextarea
                    placeholder="Enter key points, one per line"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Target Audience</label>
                  <AccessibleSelect
                    options={[
                      { value: 'executives', label: 'C-Suite Executives' },
                      { value: 'managers', label: 'Department Managers' },
                      { value: 'technical', label: 'Technical Teams' },
                      { value: 'general', label: 'General Business' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Visual Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Modern', 'Corporate', 'Playful', 'Minimal', 'Bold', 'Elegant'].map((style) => (
                      <button
                        key={style}
                        className="p-2 text-sm border border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 text-gray-300 hover:text-white transition-colors"
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CpuChipIcon className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-purple-300">AI Enhancement</span>
                  </div>
                  <p className="text-sm text-purple-200">
                    Our AI will optimize your content for maximum engagement and visual impact
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <AccessibleButton
                    variant="secondary"
                    onClick={() => setShowGenerateModal(false)}
                  >
                    Cancel
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={() => handleCreateContent({ title: 'New Content' })}
                  >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generate Content
                  </AccessibleButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}