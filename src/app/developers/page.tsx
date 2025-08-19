'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code,
  Rocket,
  DollarSign,
  Users,
  BarChart3,
  Book,
  Download,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Terminal,
  Package,
  GitBranch,
  Award,
  TrendingUp,
  Bot,
} from 'lucide-react'

interface DeveloperStats {
  totalDevelopers: number
  totalAgents: number
  totalRevenue: number
  averageRating: number
  monthlyDownloads: number
}

interface SDKFeature {
  title: string
  description: string
  icon: React.ElementType
  codeExample?: string
}

interface SuccessStory {
  developer: string
  company: string
  agent: string
  revenue: string
  timeToMarket: string
  rating: number
  quote: string
}

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sdk' | 'docs' | 'submit'>('overview')
  const [stats, setStats] = useState<DeveloperStats | null>(null)
  const [loading, setLoading] = useState(true)

  const sdkFeatures: SDKFeature[] = [
    {
      title: 'AI Agent Framework',
      description: 'Pre-built templates and components for rapid AI agent development',
      icon: Bot,
      codeExample: `import { AIAgent, CoreFlow360SDK } from '@coreflow360/sdk'

class MyCustomAgent extends AIAgent {
  constructor() {
    super({
      name: 'Customer Intelligence Pro',
      version: '1.0.0',
      capabilities: ['analysis', 'prediction', 'automation']
    })
  }
  
  async process(data) {
    // Your AI logic here
    return this.analyze(data)
  }
}`,
    },
    {
      title: 'Revenue APIs',
      description: 'Built-in billing, subscription management, and revenue sharing',
      icon: DollarSign,
      codeExample: `import { RevenueAPI } from '@coreflow360/sdk'

// Automatic revenue sharing
const billing = new RevenueAPI({
  pricing: {
    model: 'subscription',
    price: 49,
    period: 'month',
    freeTier: true
  },
  revenueShare: 0.70 // You keep 70%
})`,
    },
    {
      title: 'Integration Hub',
      description: 'Connect to 500+ business applications with pre-built connectors',
      icon: Globe,
      codeExample: `import { IntegrationHub } from '@coreflow360/sdk'

const salesforce = await IntegrationHub.connect('salesforce', {
  credentials: userCredentials
})

const leads = await salesforce.getLeads()
const enriched = await this.enrichLeadData(leads)`,
    },
    {
      title: 'Real-time Analytics',
      description: 'Track usage, performance, and revenue with built-in analytics',
      icon: BarChart3,
      codeExample: `import { Analytics } from '@coreflow360/sdk'

// Automatic tracking
Analytics.track('agent_execution', {
  agentId: this.id,
  userId: user.id,
  duration: executionTime,
  success: true
})`,
    },
  ]

  const successStories: SuccessStory[] = [
    {
      developer: 'Sarah Chen',
      company: 'AI Insights Corp',
      agent: 'Customer Sentiment Radar',
      revenue: '$23,000/month',
      timeToMarket: '6 weeks',
      rating: 4.8,
      quote:
        'The SDK made it incredibly easy to build and monetize our AI agent. We went from idea to $20K MRR in just 6 weeks.',
    },
    {
      developer: 'Marcus Rodriguez',
      company: 'FinTech Innovations',
      agent: 'Financial Crystal Ball',
      revenue: '$45,000/month',
      timeToMarket: '8 weeks',
      rating: 4.9,
      quote:
        "CoreFlow360's marketplace gave us instant access to thousands of potential customers. The revenue sharing is generous too.",
    },
    {
      developer: 'Emily Johnson',
      company: 'ProcessAI Solutions',
      agent: 'Workflow Optimizer Max',
      revenue: '$18,500/month',
      timeToMarket: '4 weeks',
      rating: 4.6,
      quote:
        'I love how the platform handles billing, support, and distribution. I can focus on building great AI instead of business operations.',
    },
  ]

  useEffect(() => {
    // Simulate API call for stats
    setTimeout(() => {
      setStats({
        totalDevelopers: 127,
        totalAgents: 47,
        totalRevenue: 1247000,
        averageRating: 4.7,
        monthlyDownloads: 15680,
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleGetStarted = () => {
    // Track developer interest
    if (typeof window !== 'undefined' && (window as unknown).gtag) {
      ;(window as unknown).gtag('event', 'developer_signup_interest', {
        source: 'developer_portal',
        page: 'overview',
      })
    }

    // In production, this would redirect to developer registration
    alert("Developer registration opening soon! We'll notify you when it's ready.")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading Developer Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Hero Section */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-16">
          <div className="mb-12 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-5xl font-bold"
            >
              Build AI Agents That <span className="gradient-text-ai">Make Money</span>
            </motion.h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-300">
              Join the fastest-growing AI marketplace. Create intelligent agents, reach thousands of
              customers, and earn revenue while they work.
            </p>

            {/* Stats */}
            {stats && (
              <div className="mx-auto mb-8 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-5">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.totalDevelopers}</div>
                  <div className="text-sm text-gray-400">Developers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    ${(stats.totalRevenue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-400">Developer Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats.totalAgents}</div>
                  <div className="text-sm text-gray-400">Live Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-400">{stats.averageRating}★</div>
                  <div className="text-sm text-gray-400">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">
                    {(stats.monthlyDownloads / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-400">Downloads/Month</div>
                </div>
              </div>
            )}

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={handleGetStarted}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white hover:opacity-90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="rounded-xl border border-gray-600 px-8 py-4 text-gray-300 transition-all hover:border-gray-500">
                Download SDK
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Rocket },
              { id: 'sdk', label: 'SDK & Tools', icon: Code },
              { id: 'docs', label: 'Documentation', icon: Book },
              { id: 'submit', label: 'Submit Agent', icon: Package },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as unknown)}
                className={`flex items-center border-b-2 px-4 py-4 transition-all ${
                  activeTab === id
                    ? 'border-violet-500 text-violet-300'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="mr-2 h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Value Proposition */}
              <div className="mb-16 grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">Earn 70% Revenue Share</h3>
                  <p className="text-gray-400">
                    Keep majority of revenue while we handle billing, support, and distribution
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">Instant Customer Base</h3>
                  <p className="text-gray-400">
                    Access 1,200+ companies actively looking for AI solutions
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">Rapid Development</h3>
                  <p className="text-gray-400">
                    Ship AI agents 5x faster with our comprehensive SDK and templates
                  </p>
                </div>
              </div>

              {/* Success Stories */}
              <div className="mb-16">
                <h2 className="mb-8 text-center text-3xl font-bold text-white">
                  Developer Success Stories
                </h2>
                <div className="grid gap-8 md:grid-cols-3">
                  {successStories.map((story, index) => (
                    <motion.div
                      key={story.developer}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{story.developer}</h4>
                          <p className="text-sm text-gray-400">{story.company}</p>
                        </div>
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 text-yellow-500" />
                          <span className="text-white">{story.rating}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="mb-1 text-lg font-bold text-emerald-400">
                          {story.revenue}
                        </div>
                        <div className="text-sm text-gray-400">Agent: {story.agent}</div>
                      </div>

                      <blockquote className="mb-4 text-sm text-gray-300 italic">
                        "{story.quote}"
                      </blockquote>

                      <div className="text-xs text-gray-500">
                        Time to market: {story.timeToMarket}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sdk' && (
            <motion.div
              key="sdk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">CoreFlow360 Developer SDK</h2>
                <p className="mx-auto max-w-3xl text-xl text-gray-300">
                  Everything you need to build, test, and deploy AI agents at scale
                </p>
              </div>

              <div className="mb-12 grid gap-8 md:grid-cols-2">
                {sdkFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm"
                  >
                    <div className="mb-4 flex items-center">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    </div>

                    <p className="mb-6 text-gray-300">{feature.description}</p>

                    {feature.codeExample && (
                      <div className="rounded-xl bg-gray-900/60 p-4">
                        <pre className="overflow-x-auto text-sm text-gray-300">
                          <code>{feature.codeExample}</code>
                        </pre>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Getting Started */}
              <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 p-8 text-center">
                <h3 className="mb-4 text-2xl font-bold text-white">Ready to Start Building?</h3>
                <p className="mb-6 text-gray-300">
                  Join our developer community and start earning from your AI innovations
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 font-semibold text-white hover:opacity-90">
                    Download SDK
                  </button>
                  <button className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition-all hover:border-gray-500">
                    View Examples
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">Developer Documentation</h2>
                <p className="text-xl text-gray-300">Comprehensive guides and API references</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: 'Quick Start Guide',
                    description: 'Get your first AI agent running in 15 minutes',
                    icon: Rocket,
                    time: '15 min read',
                  },
                  {
                    title: 'API Reference',
                    description: 'Complete documentation of all available APIs',
                    icon: Terminal,
                    time: 'Reference',
                  },
                  {
                    title: 'Agent Architecture',
                    description: 'Understanding the AI agent lifecycle and patterns',
                    icon: GitBranch,
                    time: '30 min read',
                  },
                  {
                    title: 'Integration Hub',
                    description: 'Connect to external services and applications',
                    icon: Globe,
                    time: '20 min read',
                  },
                  {
                    title: 'Revenue & Billing',
                    description: 'Monetization strategies and billing integration',
                    icon: DollarSign,
                    time: '10 min read',
                  },
                  {
                    title: 'Best Practices',
                    description: 'Performance optimization and security guidelines',
                    icon: Shield,
                    time: '25 min read',
                  },
                ].map((doc, index) => (
                  <motion.div
                    key={doc.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm transition-all hover:border-gray-600/50"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <doc.icon className="h-8 w-8 text-violet-400" />
                      <span className="text-xs text-gray-500">{doc.time}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-violet-300">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-300">{doc.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="mb-6 text-3xl font-bold text-white">Submit Your AI Agent</h2>
                <p className="mb-8 text-xl text-gray-300">
                  Ready to share your AI agent with thousands of businesses?
                </p>

                <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
                  <div className="mb-8 grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="mb-2 font-semibold text-white">Quality Review</h4>
                      <p className="text-sm text-gray-400">
                        Our team reviews every submission for quality and security
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="mb-2 font-semibold text-white">Marketing Support</h4>
                      <p className="text-sm text-gray-400">
                        Featured placement and promotional opportunities
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="mb-2 font-semibold text-white">Success Metrics</h4>
                      <p className="text-sm text-gray-400">
                        Detailed analytics and performance insights
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="mb-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white hover:opacity-90">
                      Submit AI Agent
                    </button>
                    <p className="text-sm text-gray-400">
                      Review process typically takes 3-5 business days
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-900/40 p-6 text-left">
                  <h4 className="mb-4 font-semibold text-white">Submission Requirements:</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Built using CoreFlow360 SDK v2.0+
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Comprehensive documentation and examples
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Security audit and code review
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Clear pricing and license terms
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Support and maintenance commitment
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
