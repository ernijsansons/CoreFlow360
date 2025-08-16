'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Star,
  Download,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Award,
  Clock,
  DollarSign,
  ChevronRight,
  Sparkles,
  Crown,
  Target,
  BarChart3,
  Bot,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

interface AIAgent {
  id: string
  name: string
  developer: string
  description: string
  longDescription: string
  category: string
  industry: string[]
  pricing: {
    model: 'free' | 'one-time' | 'subscription'
    price: number
    period?: 'month' | 'year'
    freeTier?: boolean
  }
  rating: number
  reviews: number
  downloads: number
  features: string[]
  screenshots: string[]
  icon: string
  verified: boolean
  trending: boolean
  compatibility: string[]
  lastUpdated: string
  version: string
  tags: string[]
  installation: {
    difficulty: 'easy' | 'medium' | 'advanced'
    timeRequired: string
    requirements: string[]
  }
}

interface MarketplaceCategory {
  id: string
  name: string
  icon: React.ElementType
  description: string
  agentCount: number
  trending: boolean
}

export default function AIMarketplace() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<AIAgent[]>([])
  const [categories, setCategories] = useState<MarketplaceCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'price'>('popular')
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
  const [showInstallModal, setShowInstallModal] = useState(false)

  // Mock data - in production this would come from API
  const mockCategories: MarketplaceCategory[] = [
    {
      id: 'all',
      name: 'All Categories',
      icon: Sparkles,
      description: 'Browse all available AI agents',
      agentCount: 47,
      trending: false
    },
    {
      id: 'sales',
      name: 'Sales & CRM',
      icon: Target,
      description: 'AI agents for sales optimization and customer relationship management',
      agentCount: 12,
      trending: true
    },
    {
      id: 'finance',
      name: 'Finance & Accounting',
      icon: DollarSign,
      description: 'Financial analysis, budgeting, and accounting automation',
      agentCount: 8,
      trending: false
    },
    {
      id: 'analytics',
      name: 'Analytics & BI',
      icon: BarChart3,
      description: 'Business intelligence and data analytics solutions',
      agentCount: 15,
      trending: true
    },
    {
      id: 'operations',
      name: 'Operations',
      icon: Zap,
      description: 'Workflow automation and operational efficiency',
      agentCount: 9,
      trending: false
    },
    {
      id: 'hr',
      name: 'Human Resources',
      icon: Users,
      description: 'Talent management and HR process automation',
      agentCount: 6,
      trending: false
    }
  ]

  const mockAgents: AIAgent[] = [
    {
      id: 'lead-intelligence-pro',
      name: 'Lead Intelligence Pro',
      developer: 'SalesForce AI Labs',
      description: 'Advanced lead scoring and qualification using multi-dimensional AI analysis',
      longDescription: 'Transform your lead qualification process with our advanced AI that analyzes 200+ data points to predict lead conversion probability with 94% accuracy. Integrates seamlessly with your existing CRM and provides real-time insights.',
      category: 'sales',
      industry: ['SaaS', 'B2B', 'Technology'],
      pricing: {
        model: 'subscription',
        price: 29,
        period: 'month',
        freeTier: true
      },
      rating: 4.8,
      reviews: 247,
      downloads: 1456,
      features: [
        'Real-time lead scoring',
        'Multi-channel data integration', 
        'Predictive analytics',
        'Custom scoring models',
        'API access',
        'White-label reports'
      ],
      screenshots: ['/marketplace/lead-intelligence-1.png', '/marketplace/lead-intelligence-2.png'],
      icon: '/marketplace/icons/lead-intelligence.svg',
      verified: true,
      trending: true,
      compatibility: ['CRM', 'Sales', 'Analytics'],
      lastUpdated: '2024-01-15',
      version: '2.3.1',
      tags: ['lead scoring', 'sales automation', 'predictive analytics'],
      installation: {
        difficulty: 'easy',
        timeRequired: '5 minutes',
        requirements: ['CRM integration', 'Sales module']
      }
    },
    {
      id: 'financial-crystal-ball',
      name: 'Financial Crystal Ball',
      developer: 'FinTech Innovations',
      description: 'AI-powered financial forecasting with 91% accuracy for cash flow prediction',
      longDescription: 'See your financial future with unprecedented clarity. Our AI analyzes historical data, market trends, and business patterns to predict cash flow, identify risks, and suggest optimizations 6 months ahead.',
      category: 'finance',
      industry: ['Finance', 'Consulting', 'Manufacturing'],
      pricing: {
        model: 'subscription',
        price: 89,
        period: 'month'
      },
      rating: 4.9,
      reviews: 183,
      downloads: 892,
      features: [
        'Cash flow forecasting',
        'Risk assessment',
        'Budget optimization',
        'Scenario modeling',
        'Executive dashboards',
        'Compliance monitoring'
      ],
      screenshots: ['/marketplace/financial-crystal-1.png'],
      icon: '/marketplace/icons/financial-crystal.svg',
      verified: true,
      trending: false,
      compatibility: ['Finance', 'Analytics'],
      lastUpdated: '2024-01-10',
      version: '1.8.2',
      tags: ['forecasting', 'cash flow', 'financial planning'],
      installation: {
        difficulty: 'medium',
        timeRequired: '15 minutes',
        requirements: ['Finance module', 'Banking integration']
      }
    },
    {
      id: 'customer-sentiment-radar',
      name: 'Customer Sentiment Radar',
      developer: 'AI Insights Corp',
      description: 'Real-time customer sentiment analysis across all touchpoints',
      longDescription: 'Never lose a customer to dissatisfaction again. Our AI monitors customer sentiment across emails, calls, support tickets, and social media, alerting you before issues escalate.',
      category: 'sales',
      industry: ['Retail', 'SaaS', 'E-commerce'],
      pricing: {
        model: 'subscription',
        price: 49,
        period: 'month',
        freeTier: true
      },
      rating: 4.7,
      reviews: 156,
      downloads: 1089,
      features: [
        'Multi-channel sentiment tracking',
        'Real-time alerts',
        'Churn prediction',
        'Sentiment trending',
        'Team notifications',
        'Custom workflows'
      ],
      screenshots: ['/marketplace/sentiment-radar-1.png'],
      icon: '/marketplace/icons/sentiment-radar.svg',
      verified: true,
      trending: true,
      compatibility: ['CRM', 'Support', 'Analytics'],
      lastUpdated: '2024-01-12',
      version: '3.1.0',
      tags: ['sentiment analysis', 'customer success', 'churn prevention'],
      installation: {
        difficulty: 'easy',
        timeRequired: '8 minutes',
        requirements: ['CRM integration', 'Support module']
      }
    },
    {
      id: 'workflow-optimizer-max',
      name: 'Workflow Optimizer Max',
      developer: 'ProcessAI Solutions',
      description: 'Identify and eliminate workflow bottlenecks with AI-powered process optimization',
      longDescription: 'Boost productivity by 40% with intelligent workflow analysis. Our AI maps your processes, identifies bottlenecks, and automatically suggests optimizations that save hours every week.',
      category: 'operations',
      industry: ['Manufacturing', 'Services', 'Healthcare'],
      pricing: {
        model: 'one-time',
        price: 299
      },
      rating: 4.6,
      reviews: 94,
      downloads: 567,
      features: [
        'Process mapping',
        'Bottleneck identification',
        'Automation suggestions',
        'Performance tracking',
        'Team collaboration',
        'ROI calculator'
      ],
      screenshots: ['/marketplace/workflow-optimizer-1.png'],
      icon: '/marketplace/icons/workflow-optimizer.svg',
      verified: true,
      trending: false,
      compatibility: ['Operations', 'Analytics', 'HR'],
      lastUpdated: '2024-01-08',
      version: '4.2.1',
      tags: ['workflow optimization', 'process improvement', 'automation'],
      installation: {
        difficulty: 'advanced',
        timeRequired: '30 minutes',
        requirements: ['Operations module', 'Process mapping tools']
      }
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories(mockCategories)
      setAgents(mockAgents)
      setFilteredAgents(mockAgents)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = [...agents]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'price':
          return (a.pricing.price || 0) - (b.pricing.price || 0)
        default:
          return 0
      }
    })

    setFilteredAgents(filtered)
  }, [agents, selectedCategory, searchQuery, sortBy])

  const handleInstallAgent = (agent: AIAgent) => {
    setSelectedAgent(agent)
    setShowInstallModal(true)
  }

  const handleConfirmInstall = async () => {
    if (!selectedAgent) return

    // Track installation
    const installData = {
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      developer: selectedAgent.developer,
      price: selectedAgent.pricing.price,
      timestamp: new Date().toISOString()
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ai_agent_installed', {
        agent_id: selectedAgent.id,
        agent_name: selectedAgent.name,
        developer: selectedAgent.developer,
        price: selectedAgent.pricing.price,
        category: selectedAgent.category
      })
    }

    // Simulate installation process
    console.log('Installing AI agent:', installData)
    
    // Close modal and show success
    setShowInstallModal(false)
    setSelectedAgent(null)
    
    // In production, redirect to agent configuration
    alert(`${selectedAgent.name} installed successfully! Redirecting to configuration...`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AI Marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-4"
            >
              <span className="gradient-text-ai">AI Agent Marketplace</span>
            </motion.h1>
            <p className="text-xl text-gray-300 mb-6">
              Supercharge your business with specialized AI agents from our developer ecosystem
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">47</div>
                <div className="text-gray-400 text-sm">AI Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">1,247</div>
                <div className="text-gray-400 text-sm">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">50+</div>
                <div className="text-gray-400 text-sm">Developers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-400">4.8★</div>
                <div className="text-gray-400 text-sm">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search AI agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center p-3 rounded-xl transition-all text-left ${
                      selectedCategory === category.id
                        ? 'bg-violet-600/20 border border-violet-500/50 text-violet-300'
                        : 'bg-gray-800/30 hover:bg-gray-700/30 text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.agentCount} agents</div>
                    </div>
                    {category.trending && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Agents Grid */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all group"
                  >
                    {/* Agent Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                            {agent.name}
                          </h3>
                          <p className="text-gray-400 text-sm">by {agent.developer}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {agent.verified && (
                          <Shield className="w-4 h-4 text-blue-500" title="Verified" />
                        )}
                        {agent.trending && (
                          <TrendingUp className="w-4 h-4 text-orange-500" title="Trending" />
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {agent.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {agent.rating} ({agent.reviews})
                      </div>
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {agent.downloads.toLocaleString()}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-white">
                        {agent.pricing.model === 'free' ? (
                          <span className="font-bold text-emerald-400">Free</span>
                        ) : agent.pricing.model === 'one-time' ? (
                          <span className="font-bold">${agent.pricing.price}</span>
                        ) : (
                          <div>
                            <span className="font-bold">${agent.pricing.price}</span>
                            <span className="text-gray-400">/{agent.pricing.period}</span>
                            {agent.pricing.freeTier && (
                              <div className="text-xs text-emerald-400">Free tier available</div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        agent.installation.difficulty === 'easy' 
                          ? 'bg-green-600/20 text-green-400'
                          : agent.installation.difficulty === 'medium'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {agent.installation.difficulty}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {agent.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                          +{agent.tags.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Install Button */}
                    <button
                      onClick={() => handleInstallAgent(agent)}
                      className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white py-2 rounded-xl font-medium transition-all flex items-center justify-center group"
                    >
                      Install Agent
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No agents found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Install Modal */}
      <AnimatePresence>
        {showInstallModal && selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Install AI Agent</h2>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedAgent.name}</h3>
                  <p className="text-gray-400">by {selectedAgent.developer}</p>
                </div>
              </div>

              <div className="bg-gray-800/40 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-white mb-2">What you'll get:</h4>
                <ul className="space-y-2">
                  {selectedAgent.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-violet-600/20 border border-violet-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">
                      {selectedAgent.pricing.model === 'free' ? 'Free' : 
                       selectedAgent.pricing.model === 'one-time' ? 
                       `$${selectedAgent.pricing.price}` :
                       `$${selectedAgent.pricing.price}/${selectedAgent.pricing.period}`}
                    </div>
                    <div className="text-violet-300 text-sm">
                      Installation time: {selectedAgent.installation.timeRequired}
                    </div>
                  </div>
                  <Crown className="w-8 h-8 text-violet-400" />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="flex-1 border border-gray-600 text-gray-300 py-3 rounded-xl hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmInstall}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Install Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}