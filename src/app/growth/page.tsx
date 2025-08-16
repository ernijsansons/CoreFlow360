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
  Repeat2
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
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'social' | 'rewards'>('overview')
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
    thisMonthReferrals: 8
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
      createdAt: new Date('2024-01-05')
    },
    {
      id: '2',
      code: 'alex_4d5e6f',
      url: 'https://coreflow360.com/ref/alex_4d5e6f',
      clicks: 23,
      conversions: 4,
      revenue: 600,
      campaign: 'Team Network',
      createdAt: new Date('2024-01-08')
    }
  ]

  const mockRewards: Reward[] = [
    {
      type: 'feature_unlock',
      value: '3 Premium AI Agents',
      description: 'Unlock 3 premium AI agents for life',
      tier: 'Bronze',
      unlocked: true,
      progress: 100,
      requirement: '1 successful referral'
    },
    {
      type: 'discount',
      value: '50%',
      description: '50% off your next billing cycle',
      tier: 'Silver',
      unlocked: true,
      progress: 100,
      requirement: '3 successful referrals'
    },
    {
      type: 'cash',
      value: '$100',
      description: '$100 cash reward deposited to your account',
      tier: 'Gold',
      unlocked: false,
      progress: 60,
      requirement: '5 successful referrals + $500 revenue'
    },
    {
      type: 'feature_unlock',
      value: 'Custom Branding',
      description: 'Custom branding for all shared content',
      tier: 'Platinum',
      unlocked: false,
      progress: 15,
      requirement: '10 successful referrals + $2000 revenue'
    }
  ]

  const mockShareTemplates: ShareTemplate[] = [
    {
      id: 'linkedin_achievement',
      platform: 'LinkedIn',
      title: 'Professional Achievement',
      preview: '🎉 Just unlocked "Task Master" achievement! CoreFlow360\'s AI automation saved me 15 hours this week...',
      estimatedReach: 2500,
      viralScore: 85,
      icon: Linkedin
    },
    {
      id: 'twitter_milestone',
      platform: 'Twitter',
      title: 'Business Milestone',
      preview: '🚀 Major milestone: 300% productivity increase! Thanks to @CoreFlow360\'s AI-first approach...',
      estimatedReach: 1200,
      viralScore: 78,
      icon: Twitter
    },
    {
      id: 'email_success',
      platform: 'Email',
      title: 'Success Story',
      preview: 'I had to share this incredible result with you. Our AI transformation delivered...',
      estimatedReach: 500,
      viralScore: 92,
      icon: Mail
    }
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
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const generateNewReferralLink = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newLink: ReferralLink = {
        id: Date.now().toString(),
        code: `alex_${Math.random().toString(36).substr(2, 6)}`,
        url: `https://coreflow360.com/ref/alex_${Math.random().toString(36).substr(2, 6)}`,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        campaign: 'Custom Link',
        createdAt: new Date()
      }
      
      setReferralLinks([newLink, ...referralLinks])
    } catch (error) {
      console.error('Failed to generate link:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'text-orange-400'
      case 'silver': return 'text-gray-400'
      case 'gold': return 'text-yellow-400'
      case 'platinum': return 'text-violet-400'
      case 'diamond': return 'text-cyan-400'
      default: return 'text-gray-400'
    }
  }

  const getTierBg = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bg-orange-600/20 border-orange-500/30'
      case 'silver': return 'bg-gray-600/20 border-gray-500/30'
      case 'gold': return 'bg-yellow-600/20 border-yellow-500/30'
      case 'platinum': return 'bg-violet-600/20 border-violet-500/30'
      case 'diamond': return 'bg-cyan-600/20 border-cyan-500/30'
      default: return 'bg-gray-600/20 border-gray-500/30'
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
              className="text-4xl font-bold mb-4"
            >
              Growth <span className="gradient-text-ai">Engine</span>
            </motion.h1>
            <p className="text-xl text-gray-300 mb-8">
              Grow your network, unlock rewards, and share your success
            </p>

            {/* Tier Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center px-6 py-3 ${getTierBg(referralStats.currentTier)} rounded-2xl`}
            >
              <Crown className={`w-6 h-6 ${getTierColor(referralStats.currentTier)} mr-3`} />
              <div>
                <div className={`text-lg font-bold ${getTierColor(referralStats.currentTier)}`}>
                  {referralStats.currentTier} Member
                </div>
                <div className="text-gray-400 text-sm">
                  {referralStats.nextTierProgress}% to next tier
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 text-center"
          >
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
            <div className="text-blue-300 text-sm">Total Referrals</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 text-center"
          >
            <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{referralStats.successfulReferrals}</div>
            <div className="text-green-300 text-sm">Conversions</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center"
          >
            <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">${referralStats.totalRevenue.toLocaleString()}</div>
            <div className="text-yellow-300 text-sm">Revenue Generated</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6 text-center"
          >
            <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{referralStats.viralScore}</div>
            <div className="text-violet-300 text-sm">Viral Score</div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'referrals', label: 'Referral Links', icon: Share2 },
            { id: 'social', label: 'Social Sharing', icon: Heart },
            { id: 'rewards', label: 'Rewards', icon: Gift }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
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
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Progress to Gold Tier</h3>
                
                <div className="relative mb-6">
                  <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${referralStats.nextTierProgress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-yellow-600 to-orange-500 rounded-full relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ width: '100px' }}
                      />
                    </motion.div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                    {referralStats.nextTierProgress}%
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">3/5</div>
                    <div className="text-gray-400">Successful Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">$650/$500</div>
                    <div className="text-gray-400">Revenue Generated</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                
                <div className="space-y-4">
                  {[
                    { type: 'referral', message: 'Sarah Chen signed up using your link', time: '2 hours ago', value: '+$50' },
                    { type: 'share', message: 'Your achievement post got 15 clicks', time: '5 hours ago', value: '+2 pts' },
                    { type: 'reward', message: 'Silver tier reward unlocked!', time: '1 day ago', value: '50% discount' },
                    { type: 'referral', message: 'Marcus Johnson joined your team', time: '2 days ago', value: '+$25' }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-700/20 rounded-xl"
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                          activity.type === 'referral' ? 'bg-green-600/20 text-green-400' :
                          activity.type === 'share' ? 'bg-blue-600/20 text-blue-400' :
                          'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {activity.type === 'referral' && <Users className="w-5 h-5" />}
                          {activity.type === 'share' && <Share2 className="w-5 h-5" />}
                          {activity.type === 'reward' && <Gift className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-white text-sm">{activity.message}</div>
                          <div className="text-gray-400 text-xs">{activity.time}</div>
                        </div>
                      </div>
                      <div className="text-green-400 font-medium text-sm">{activity.value}</div>
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
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Referral Links</h3>
                  <button
                    onClick={generateNewReferralLink}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
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
                      className="bg-gray-700/30 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-semibold mb-1">{link.campaign}</h4>
                          <div className="text-gray-400 text-sm">
                            Created {link.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            ${link.revenue}
                          </div>
                          <div className="text-gray-400 text-sm">Revenue</div>
                        </div>
                      </div>

                      <div className="flex items-center bg-gray-800/50 rounded-xl p-3 mb-4">
                        <code className="flex-1 text-gray-300 text-sm font-mono break-all mr-3">
                          {link.url}
                        </code>
                        <button
                          onClick={() => copyToClipboard(link.url, link.id)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {copied === link.id ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{link.clicks}</div>
                          <div className="text-gray-400 text-sm">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{link.conversions}</div>
                          <div className="text-gray-400 text-sm">Conversions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {link.clicks > 0 ? Math.round((link.conversions / link.clicks) * 100) : 0}%
                          </div>
                          <div className="text-gray-400 text-sm">Conversion Rate</div>
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
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Share Your Success</h3>
                
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {shareTemplates.map((template, index) => {
                    const Icon = template.icon
                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-700/30 rounded-xl p-6 hover:bg-gray-700/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{template.platform}</h4>
                            <p className="text-gray-400 text-sm">{template.title}</p>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                          <p className="text-gray-300 text-sm italic">
                            {template.preview}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm mb-4">
                          <div className="flex items-center text-blue-400">
                            <Eye className="w-4 h-4 mr-1" />
                            {template.estimatedReach.toLocaleString()} reach
                          </div>
                          <div className="flex items-center text-yellow-400">
                            <Zap className="w-4 h-4 mr-1" />
                            {template.viralScore}% viral
                          </div>
                        </div>

                        <button className="w-full py-2 px-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium hover:opacity-90 transition-all">
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
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Available Rewards</h3>
                
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                            reward.unlocked 
                              ? `bg-gradient-to-r from-green-500 to-emerald-600` 
                              : `bg-gray-600/50`
                          }`}>
                            {reward.unlocked ? (
                              <Check className="w-6 h-6 text-white" />
                            ) : (
                              <Gift className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg ${getTierColor(reward.tier)}`}>
                              {reward.value}
                            </h4>
                            <p className="text-white text-sm">{reward.description}</p>
                            <p className="text-gray-400 text-xs mt-1">{reward.requirement}</p>
                          </div>
                        </div>

                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTierBg(reward.tier)}`}>
                          {reward.tier}
                        </div>
                      </div>

                      {!reward.unlocked && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Progress</span>
                            <span className="text-white text-sm">{reward.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${reward.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className={`h-full rounded-full bg-gradient-to-r ${
                                reward.tier === 'Gold' ? 'from-yellow-500 to-orange-500' :
                                reward.tier === 'Platinum' ? 'from-violet-500 to-purple-500' :
                                'from-gray-500 to-gray-400'
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