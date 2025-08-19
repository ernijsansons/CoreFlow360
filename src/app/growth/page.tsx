'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share2,
  Users,
  Gift,
  TrendingUp,
  Copy,
  Check,
  Star,
  Award,
  Target,
  Zap,
  Crown,
  ExternalLink,
  Mail,
  MessageSquare,
  Linkedin,
  Twitter,
  Facebook,
  Send,
  BarChart3,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
  Heart,
  Eye,
  MessageCircle,
  Repeat2,
} from 'lucide-react'

interface ReferralStats {
  totalReferrals: number
  successfulReferrals: number
  totalRevenue: number
  viralScore: number
  currentTier: string
  nextTierProgress: number
  thisMonthReferrals: number
}

interface ReferralLink {
  id: string
  code: string
  url: string
  clicks: number
  conversions: number
  revenue: number
  campaign: string
  createdAt: Date
}

interface Reward {
  type: string
  value: string | number
  description: string
  tier: string
  unlocked: boolean
  progress: number
  requirement: string
}

interface ShareTemplate {
  id: string
  platform: string
  title: string
  preview: string
  estimatedReach: number
  viralScore: number
  icon: React.ElementType
}

export default function ViralGrowthHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'social' | 'rewards'>(
    'overview'
  )
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [shareTemplates, setShareTemplates] = useState<ShareTemplate[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const mockStats: ReferralStats = {
    totalReferrals: 23,
    successfulReferrals: 12,
    totalRevenue: 4350,
    viralScore: 78,
    currentTier: 'Silver',
    nextTierProgress: 65,
    thisMonthReferrals: 8,
  }

  const mockReferralLinks: ReferralLink[] = [
    {
      id: '1',
      code: 'alex_1a2b3c',
      url: 'https://coreflow360.com/ref/alex_1a2b3c',
      clicks: 47,
      conversions: 8,
      revenue: 1200,
      campaign: 'Friends Referral',
      createdAt: new Date('2024-01-05'),
    },
    {
      id: '2',
      code: 'alex_4d5e6f',
      url: 'https://coreflow360.com/ref/alex_4d5e6f',
      clicks: 23,
      conversions: 4,
      revenue: 600,
      campaign: 'Team Network',
      createdAt: new Date('2024-01-08'),
    },
  ]

  const mockRewards: Reward[] = [
    {
      type: 'feature_unlock',
      value: '3 Premium AI Agents',
      description: 'Unlock 3 premium AI agents for life',
      tier: 'Bronze',
      unlocked: true,
      progress: 100,
      requirement: '1 successful referral',
    },
    {
      type: 'discount',
      value: '50%',
      description: '50% off your next billing cycle',
      tier: 'Silver',
      unlocked: true,
      progress: 100,
      requirement: '3 successful referrals',
    },
    {
      type: 'cash',
      value: '$100',
      description: '$100 cash reward deposited to your account',
      tier: 'Gold',
      unlocked: false,
      progress: 60,
      requirement: '5 successful referrals + $500 revenue',
    },
    {
      type: 'feature_unlock',
      value: 'Custom Branding',
      description: 'Custom branding for all shared content',
      tier: 'Platinum',
      unlocked: false,
      progress: 15,
      requirement: '10 successful referrals + $2000 revenue',
    },
  ]

  const mockShareTemplates: ShareTemplate[] = [
    {
      id: 'linkedin_achievement',
      platform: 'LinkedIn',
      title: 'Professional Achievement',
      preview:
        '🎉 Just unlocked "Task Master" achievement! CoreFlow360\'s AI automation saved me 15 hours this week...',
      estimatedReach: 2500,
      viralScore: 85,
      icon: Linkedin,
    },
    {
      id: 'twitter_milestone',
      platform: 'Twitter',
      title: 'Business Milestone',
      preview:
        "🚀 Major milestone: 300% productivity increase! Thanks to @CoreFlow360's AI-first approach...",
      estimatedReach: 1200,
      viralScore: 78,
      icon: Twitter,
    },
    {
      id: 'email_success',
      platform: 'Email',
      title: 'Success Story',
      preview: 'I had to share this incredible result with you. Our AI transformation delivered...',
      estimatedReach: 500,
      viralScore: 92,
      icon: Mail,
    },
  ]

  useEffect(() => {
    setReferralStats(mockStats)
    setReferralLinks(mockReferralLinks)
    setRewards(mockRewards)
    setShareTemplates(mockShareTemplates)
  }, [])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {}
  }

  const generateNewReferralLink = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newLink: ReferralLink = {
        id: Date.now().toString(),
        code: `alex_${Math.random().toString(36).substr(2, 6)}`,
        url: `https://coreflow360.com/ref/alex_${Math.random().toString(36).substr(2, 6)}`,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        campaign: 'Custom Link',
        createdAt: new Date(),
      }

      setReferralLinks([newLink, ...referralLinks])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'text-orange-400'
      case 'silver':
        return 'text-gray-400'
      case 'gold':
        return 'text-yellow-400'
      case 'platinum':
        return 'text-violet-400'
      case 'diamond':
        return 'text-cyan-400'
      default:
        return 'text-gray-400'
    }
  }

  const getTierBg = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'bg-orange-600/20 border-orange-500/30'
      case 'silver':
        return 'bg-gray-600/20 border-gray-500/30'
      case 'gold':
        return 'bg-yellow-600/20 border-yellow-500/30'
      case 'platinum':
        return 'bg-violet-600/20 border-violet-500/30'
      case 'diamond':
        return 'bg-cyan-600/20 border-cyan-500/30'
      default:
        return 'bg-gray-600/20 border-gray-500/30'
    }
  }

  if (!referralStats) return null

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
              Growth <span className="gradient-text-ai">Engine</span>
            </motion.h1>
            <p className="mb-8 text-xl text-gray-300">
              Grow your network, unlock rewards, and share your success
            </p>

            {/* Tier Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center px-6 py-3 ${getTierBg(referralStats.currentTier)} rounded-2xl`}
            >
              <Crown className={`h-6 w-6 ${getTierColor(referralStats.currentTier)} mr-3`} />
              <div>
                <div className={`text-lg font-bold ${getTierColor(referralStats.currentTier)}`}>
                  {referralStats.currentTier} Member
                </div>
                <div className="text-sm text-gray-400">
                  {referralStats.nextTierProgress}% to next tier
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-6 text-center"
          >
            <Users className="mx-auto mb-3 h-8 w-8 text-blue-400" />
            <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
            <div className="text-sm text-blue-300">Total Referrals</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6 text-center"
          >
            <Target className="mx-auto mb-3 h-8 w-8 text-green-400" />
            <div className="text-2xl font-bold text-white">{referralStats.successfulReferrals}</div>
            <div className="text-sm text-green-300">Conversions</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 p-6 text-center"
          >
            <DollarSign className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
            <div className="text-2xl font-bold text-white">
              ${referralStats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-300">Revenue Generated</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-6 text-center"
          >
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-violet-400" />
            <div className="text-2xl font-bold text-white">{referralStats.viralScore}</div>
            <div className="text-sm text-violet-300">Viral Score</div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="mb-8 flex items-center rounded-2xl border border-gray-700/50 bg-gray-800/40 p-2 backdrop-blur-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'referrals', label: 'Referral Links', icon: Share2 },
            { id: 'social', label: 'Social Sharing', icon: Heart },
            { id: 'rewards', label: 'Rewards', icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as unknown)}
                className={`flex flex-1 items-center justify-center rounded-xl px-6 py-3 transition-all ${
                  activeTab === tab.id
                    ? 'border border-violet-500/30 bg-violet-600/30 text-violet-300'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="mr-2 h-5 w-5" />
                <span className="hidden md:block">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Progress to Next Tier */}
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-semibold text-white">Progress to Gold Tier</h3>

                <div className="relative mb-6">
                  <div className="h-6 w-full overflow-hidden rounded-full bg-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${referralStats.nextTierProgress}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-yellow-600 to-orange-500"
                    >
                      <motion.div
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ width: '100px' }}
                      />
                    </motion.div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                    {referralStats.nextTierProgress}%
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="text-center">
                    <div className="mb-2 text-2xl font-bold text-white">3/5</div>
                    <div className="text-gray-400">Successful Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl font-bold text-white">$650/$500</div>
                    <div className="text-gray-400">Revenue Generated</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-semibold text-white">Recent Activity</h3>

                <div className="space-y-4">
                  {[
                    {
                      type: 'referral',
                      message: 'Sarah Chen signed up using your link',
                      time: '2 hours ago',
                      value: '+$50',
                    },
                    {
                      type: 'share',
                      message: 'Your achievement post got 15 clicks',
                      time: '5 hours ago',
                      value: '+2 pts',
                    },
                    {
                      type: 'reward',
                      message: 'Silver tier reward unlocked!',
                      time: '1 day ago',
                      value: '50% discount',
                    },
                    {
                      type: 'referral',
                      message: 'Marcus Johnson joined your team',
                      time: '2 days ago',
                      value: '+$25',
                    },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-xl bg-gray-700/20 p-4"
                    >
                      <div className="flex items-center">
                        <div
                          className={`mr-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                            activity.type === 'referral'
                              ? 'bg-green-600/20 text-green-400'
                              : activity.type === 'share'
                                ? 'bg-blue-600/20 text-blue-400'
                                : 'bg-yellow-600/20 text-yellow-400'
                          }`}
                        >
                          {activity.type === 'referral' && <Users className="h-5 w-5" />}
                          {activity.type === 'share' && <Share2 className="h-5 w-5" />}
                          {activity.type === 'reward' && <Gift className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="text-sm text-white">{activity.message}</div>
                          <div className="text-xs text-gray-400">{activity.time}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-400">{activity.value}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Create New Link */}
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Referral Links</h3>
                  <button
                    onClick={generateNewReferralLink}
                    disabled={loading}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-2 font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate New Link'}
                  </button>
                </div>

                <div className="space-y-4">
                  {referralLinks.map((link, index) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl bg-gray-700/30 p-6"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="mb-1 font-semibold text-white">{link.campaign}</h4>
                          <div className="text-sm text-gray-400">
                            Created {link.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">${link.revenue}</div>
                          <div className="text-sm text-gray-400">Revenue</div>
                        </div>
                      </div>

                      <div className="mb-4 flex items-center rounded-xl bg-gray-800/50 p-3">
                        <code className="mr-3 flex-1 font-mono text-sm break-all text-gray-300">
                          {link.url}
                        </code>
                        <button
                          onClick={() => copyToClipboard(link.url, link.id)}
                          className="p-2 text-gray-400 transition-colors hover:text-white"
                        >
                          {copied === link.id ? (
                            <Check className="h-5 w-5 text-green-400" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{link.clicks}</div>
                          <div className="text-sm text-gray-400">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{link.conversions}</div>
                          <div className="text-sm text-gray-400">Conversions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {link.clicks > 0
                              ? Math.round((link.conversions / link.clicks) * 100)
                              : 0}
                            %
                          </div>
                          <div className="text-sm text-gray-400">Conversion Rate</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-semibold text-white">Share Your Success</h3>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {shareTemplates.map((template, index) => {
                    const Icon = template.icon
                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="cursor-pointer rounded-xl bg-gray-700/30 p-6 transition-all hover:bg-gray-700/40"
                      >
                        <div className="mb-4 flex items-center">
                          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{template.platform}</h4>
                            <p className="text-sm text-gray-400">{template.title}</p>
                          </div>
                        </div>

                        <div className="mb-4 rounded-lg bg-gray-800/50 p-4">
                          <p className="text-sm text-gray-300 italic">{template.preview}</p>
                        </div>

                        <div className="mb-4 flex items-center justify-between text-sm">
                          <div className="flex items-center text-blue-400">
                            <Eye className="mr-1 h-4 w-4" />
                            {template.estimatedReach.toLocaleString()} reach
                          </div>
                          <div className="flex items-center text-yellow-400">
                            <Zap className="mr-1 h-4 w-4" />
                            {template.viralScore}% viral
                          </div>
                        </div>

                        <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2 font-medium text-white transition-all hover:opacity-90">
                          Share Now
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-semibold text-white">Available Rewards</h3>

                <div className="space-y-6">
                  {rewards.map((reward, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-2xl p-6 ${getTierBg(reward.tier)} ${
                        reward.unlocked ? 'border-2' : 'opacity-75'
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`mr-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                              reward.unlocked
                                ? `bg-gradient-to-r from-green-500 to-emerald-600`
                                : `bg-gray-600/50`
                            }`}
                          >
                            {reward.unlocked ? (
                              <Check className="h-6 w-6 text-white" />
                            ) : (
                              <Gift className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className={`text-lg font-bold ${getTierColor(reward.tier)}`}>
                              {reward.value}
                            </h4>
                            <p className="text-sm text-white">{reward.description}</p>
                            <p className="mt-1 text-xs text-gray-400">{reward.requirement}</p>
                          </div>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getTierBg(reward.tier)}`}
                        >
                          {reward.tier}
                        </div>
                      </div>

                      {!reward.unlocked && (
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className="text-sm text-white">{reward.progress}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-700">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${reward.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className={`h-full rounded-full bg-gradient-to-r ${
                                reward.tier === 'Gold'
                                  ? 'from-yellow-500 to-orange-500'
                                  : reward.tier === 'Platinum'
                                    ? 'from-violet-500 to-purple-500'
                                    : 'from-gray-500 to-gray-400'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
