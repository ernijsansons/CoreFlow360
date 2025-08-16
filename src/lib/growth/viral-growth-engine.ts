/**
 * CoreFlow360 Advanced Viral Growth Engine
 * 
 * Sophisticated viral mechanisms with internal referrals, social sharing,
 * network effects, and automated growth loops
 */

export interface ViralCampaign {
  id: string
  name: string
  type: 'referral' | 'social_share' | 'network_invite' | 'content_viral' | 'milestone_sharing'
  description: string
  status: 'active' | 'paused' | 'completed'
  startDate: Date
  endDate?: Date
  rewards: ViralReward[]
  conditions: ViralCondition[]
  metrics: ViralMetrics
  targetAudience: string[]
  channels: string[]
}

export interface ViralReward {
  type: 'discount' | 'feature_unlock' | 'credits' | 'badge' | 'early_access' | 'cash'
  value: string | number
  description: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirements: {
    referrals?: number
    shares?: number
    conversions?: number
    revenue?: number
  }
}

export interface ViralCondition {
  trigger: 'sign_up' | 'first_purchase' | 'milestone' | 'achievement' | 'time_based'
  value?: number
  description: string
}

export interface ViralMetrics {
  shares: number
  clicks: number
  signups: number
  conversions: number
  revenue: number
  viralCoefficient: number
  cycletime: number // in hours
  conversionRate: number
}

export interface ReferralLink {
  id: string
  userId: string
  code: string
  campaignId: string
  url: string
  customMessage?: string
  expiresAt?: Date
  createdAt: Date
  clicks: number
  conversions: number
  revenue: number
  isActive: boolean
}

export interface SocialShareData {
  id: string
  userId: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'email' | 'slack'
  content: string
  contentType: 'achievement' | 'milestone' | 'result' | 'invitation'
  templateId: string
  sharedAt: Date
  engagement: {
    views: number
    likes: number
    comments: number
    shares: number
    clicks: number
  }
}

export interface NetworkInvite {
  id: string
  fromUserId: string
  toEmail: string
  campaignId: string
  message: string
  status: 'sent' | 'opened' | 'clicked' | 'converted'
  sentAt: Date
  convertedAt?: Date
  value: number
}

export interface UserViralProfile {
  userId: string
  totalReferrals: number
  successfulReferrals: number
  totalRevenue: number
  viralScore: number
  achievements: string[]
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  nextTierProgress: number
  referralLinks: ReferralLink[]
  socialShares: SocialShareData[]
  networkInvites: NetworkInvite[]
}

export class ViralGrowthEngine {
  private campaigns: Map<string, ViralCampaign> = new Map()
  private userProfiles: Map<string, UserViralProfile> = new Map()
  private shareTemplates: Map<string, ShareTemplate> = new Map()
  private growthHooks: Map<string, GrowthHook[]> = new Map()

  constructor() {
    this.initializeCampaigns()
    this.initializeShareTemplates()
    this.initializeGrowthHooks()
    console.log('🚀 Viral Growth Engine initialized with', this.campaigns.size, 'campaigns')
  }

  private initializeCampaigns(): void {
    const campaigns: ViralCampaign[] = [
      {
        id: 'friends_referral',
        name: 'Refer Friends, Unlock Power',
        type: 'referral',
        description: 'Get premium features for every friend who joins',
        status: 'active',
        startDate: new Date('2024-01-01'),
        rewards: [
          {
            type: 'feature_unlock',
            value: 'premium_ai_agents',
            description: 'Unlock 3 premium AI agents',
            tier: 'bronze',
            requirements: { referrals: 1, conversions: 1 }
          },
          {
            type: 'discount',
            value: 50,
            description: '50% off next billing cycle',
            tier: 'silver',
            requirements: { referrals: 3, conversions: 2 }
          },
          {
            type: 'cash',
            value: 100,
            description: '$100 cash reward',
            tier: 'gold',
            requirements: { referrals: 5, conversions: 3, revenue: 500 }
          }
        ],
        conditions: [
          { trigger: 'sign_up', description: 'Friend signs up using your link' },
          { trigger: 'first_purchase', description: 'Friend makes their first purchase' }
        ],
        metrics: {
          shares: 2847,
          clicks: 8934,
          signups: 1256,
          conversions: 423,
          revenue: 42300,
          viralCoefficient: 1.8,
          cycletime: 72,
          conversionRate: 14.9
        },
        targetAudience: ['existing_customers', 'power_users'],
        channels: ['email', 'social', 'in_app']
      },

      {
        id: 'achievement_sharing',
        name: 'Share Your Success',
        type: 'social_share',
        description: 'Share achievements and milestones to inspire others',
        status: 'active',
        startDate: new Date('2024-01-01'),
        rewards: [
          {
            type: 'badge',
            value: 'influencer',
            description: 'Influencer badge and profile boost',
            tier: 'bronze',
            requirements: { shares: 10 }
          },
          {
            type: 'feature_unlock',
            value: 'custom_branding',
            description: 'Custom branding for shared content',
            tier: 'silver',
            requirements: { shares: 25, conversions: 5 }
          }
        ],
        conditions: [
          { trigger: 'achievement', description: 'User unlocks significant achievement' },
          { trigger: 'milestone', description: 'User reaches business milestone' }
        ],
        metrics: {
          shares: 5632,
          clicks: 15789,
          signups: 847,
          conversions: 234,
          revenue: 18500,
          viralCoefficient: 1.3,
          cycletime: 48,
          conversionRate: 15.1
        },
        targetAudience: ['active_users', 'achievers'],
        channels: ['linkedin', 'twitter', 'facebook']
      },

      {
        id: 'team_network_growth',
        name: 'Build Your Business Network',
        type: 'network_invite',
        description: 'Invite team members and business contacts',
        status: 'active',
        startDate: new Date('2024-01-01'),
        rewards: [
          {
            type: 'feature_unlock',
            value: 'team_collaboration',
            description: 'Advanced team collaboration features',
            tier: 'bronze',
            requirements: { referrals: 3 }
          },
          {
            type: 'discount',
            value: 25,
            description: '25% off team plans permanently',
            tier: 'gold',
            requirements: { referrals: 10, conversions: 5, revenue: 1000 }
          }
        ],
        conditions: [
          { trigger: 'sign_up', description: 'Successful business contact sign-up' }
        ],
        metrics: {
          shares: 1234,
          clicks: 3456,
          signups: 567,
          conversions: 189,
          revenue: 25600,
          viralCoefficient: 2.1,
          cycletime: 96,
          conversionRate: 16.3
        },
        targetAudience: ['business_users', 'team_leaders'],
        channels: ['email', 'linkedin', 'in_app']
      }
    ]

    campaigns.forEach(campaign => {
      this.campaigns.set(campaign.id, campaign)
    })
  }

  private initializeShareTemplates(): void {
    const templates: ShareTemplate[] = [
      {
        id: 'achievement_linkedin',
        platform: 'linkedin',
        contentType: 'achievement',
        template: `🎉 Just unlocked "{achievementName}" on CoreFlow360! 

{description}

The AI-powered business automation is a game changer - saving hours every day and boosting productivity by {percentage}%.

Want to see what AI can do for your business? Check it out: {referralUrl}

#AI #BusinessAutomation #Productivity #TechInnovation`,
        viralScore: 85
      },
      {
        id: 'milestone_twitter',
        platform: 'twitter',
        contentType: 'milestone',
        template: `🚀 Major milestone reached! {milestoneText}

Thanks to @CoreFlow360's AI automation:
✅ {metric1}
✅ {metric2}
✅ {metric3}

Ready to transform your business? {referralUrl}

#AIRevolution #BusinessGrowth #Milestone`,
        viralScore: 78
      },
      {
        id: 'results_email',
        platform: 'email',
        contentType: 'result',
        template: `Subject: You won't believe what I achieved with AI automation

Hi {recipientName},

I had to share this with you - I just hit an incredible milestone using CoreFlow360's AI platform:

{achievementDetails}

The results speak for themselves:
• {result1}
• {result2}
• {result3}

I know you're always looking for ways to grow your business more efficiently. This platform has been a complete game-changer for me.

Want to see what it could do for you? Check it out here: {referralUrl}

I'm happy to walk you through how I set everything up if you're interested.

Best regards,
{senderName}`,
        viralScore: 92
      }
    ]

    templates.forEach(template => {
      this.shareTemplates.set(template.id, template)
    })
  }

  private initializeGrowthHooks(): void {
    // Growth hooks are triggered at specific user journey points
    const hooks: Record<string, GrowthHook[]> = {
      'user_signup': [
        {
          id: 'welcome_referral',
          type: 'referral_prompt',
          trigger: 'immediate',
          message: 'Know someone who could benefit? Invite them and both get premium features!',
          reward: 'Get 3 premium AI agents free when your friend signs up',
          cta: 'Invite Friends'
        }
      ],
      'first_success': [
        {
          id: 'achievement_share',
          type: 'social_share',
          trigger: 'after_success',
          message: 'Amazing work! Share your success to inspire others',
          reward: 'Build your professional brand and unlock influencer features',
          cta: 'Share Achievement'
        }
      ],
      'milestone_reached': [
        {
          id: 'milestone_celebration',
          type: 'content_viral',
          trigger: 'milestone_achieved',
          message: 'Celebrate this milestone! Show others what\'s possible',
          reward: 'Increase your professional visibility and network',
          cta: 'Share Milestone'
        }
      ]
    }

    Object.entries(hooks).forEach(([event, hookList]) => {
      this.growthHooks.set(event, hookList)
    })
  }

  /**
   * Generate a referral link for a user
   */
  async generateReferralLink(
    userId: string, 
    campaignId: string, 
    customMessage?: string
  ): Promise<ReferralLink> {
    const campaign = this.campaigns.get(campaignId)
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`)
    }

    const code = this.generateReferralCode(userId)
    const referralLink: ReferralLink = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      code,
      campaignId,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/ref/${code}`,
      customMessage,
      createdAt: new Date(),
      clicks: 0,
      conversions: 0,
      revenue: 0,
      isActive: true
    }

    // Store in user profile
    const profile = this.getUserProfile(userId)
    profile.referralLinks.push(referralLink)
    this.userProfiles.set(userId, profile)

    console.log(`🔗 Generated referral link for user ${userId}: ${referralLink.url}`)
    return referralLink
  }

  /**
   * Track referral click and attribution
   */
  async trackReferralClick(referralCode: string, metadata?: any): Promise<void> {
    const profile = this.findUserByReferralCode(referralCode)
    if (!profile) {
      console.warn(`Referral code ${referralCode} not found`)
      return
    }

    const link = profile.referralLinks.find(l => l.code === referralCode)
    if (link) {
      link.clicks++
      
      // Track in campaign metrics
      const campaign = this.campaigns.get(link.campaignId)
      if (campaign) {
        campaign.metrics.clicks++
      }

      console.log(`👆 Referral click tracked: ${referralCode}`)
    }
  }

  /**
   * Process referral conversion
   */
  async processReferralConversion(
    referralCode: string, 
    newUserId: string, 
    conversionValue: number = 0
  ): Promise<void> {
    const referrerProfile = this.findUserByReferralCode(referralCode)
    if (!referrerProfile) return

    const link = referrerProfile.referralLinks.find(l => l.code === referralCode)
    if (!link) return

    // Update link metrics
    link.conversions++
    link.revenue += conversionValue

    // Update referrer profile
    referrerProfile.totalReferrals++
    referrerProfile.successfulReferrals++
    referrerProfile.totalRevenue += conversionValue

    // Calculate new viral score
    referrerProfile.viralScore = this.calculateViralScore(referrerProfile)

    // Check tier progression
    await this.checkTierProgression(referrerProfile)

    // Update campaign metrics
    const campaign = this.campaigns.get(link.campaignId)
    if (campaign) {
      campaign.metrics.conversions++
      campaign.metrics.revenue += conversionValue
      campaign.metrics.viralCoefficient = this.calculateViralCoefficient(campaign)
    }

    // Process rewards
    await this.processReferralRewards(referrerProfile, link, conversionValue)

    console.log(`✅ Referral conversion processed: ${referralCode} -> ${newUserId}`)
  }

  /**
   * Generate shareable content for achievements/milestones
   */
  async generateShareableContent(
    userId: string,
    contentType: 'achievement' | 'milestone' | 'result',
    data: any,
    platform: string
  ): Promise<ShareContent> {
    const template = this.findBestTemplate(contentType, platform)
    if (!template) {
      throw new Error(`No template found for ${contentType} on ${platform}`)
    }

    // Generate referral link for tracking
    const referralLink = await this.generateReferralLink(userId, 'achievement_sharing')

    // Process template with user data
    const content = this.processTemplate(template, data, referralLink.url)

    const shareData: ShareContent = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      platform,
      contentType,
      content,
      templateId: template.id,
      referralUrl: referralLink.url,
      estimatedViralScore: template.viralScore,
      createdAt: new Date()
    }

    console.log(`📤 Shareable content generated for user ${userId} on ${platform}`)
    return shareData
  }

  /**
   * Track social share performance
   */
  async trackSocialShare(shareId: string, engagement: Partial<SocialShareData['engagement']>): Promise<void> {
    // Find and update share data
    for (const profile of this.userProfiles.values()) {
      const share = profile.socialShares.find(s => s.id === shareId)
      if (share) {
        Object.assign(share.engagement, engagement)
        
        // Update viral score based on engagement
        profile.viralScore += this.calculateEngagementScore(engagement)
        
        console.log(`📊 Social share engagement tracked: ${shareId}`)
        break
      }
    }
  }

  /**
   * Get user's viral profile and stats
   */
  getUserViralProfile(userId: string): UserViralProfile {
    return this.getUserProfile(userId)
  }

  /**
   * Get viral campaign performance
   */
  getCampaignMetrics(campaignId?: string): ViralCampaign[] {
    if (campaignId) {
      const campaign = this.campaigns.get(campaignId)
      return campaign ? [campaign] : []
    }
    return Array.from(this.campaigns.values())
  }

  /**
   * Get growth opportunities for user
   */
  getGrowthOpportunities(userId: string): GrowthOpportunity[] {
    const profile = this.getUserProfile(userId)
    const opportunities: GrowthOpportunity[] = []

    // Check for available campaigns
    for (const campaign of this.campaigns.values()) {
      if (campaign.status !== 'active') continue

      const opportunity: GrowthOpportunity = {
        id: campaign.id,
        type: campaign.type,
        title: campaign.name,
        description: campaign.description,
        potentialReward: this.getNextReward(profile, campaign),
        difficulty: this.assessDifficulty(profile, campaign),
        estimatedTime: this.estimateCompletionTime(campaign),
        viralPotential: campaign.metrics.viralCoefficient
      }

      opportunities.push(opportunity)
    }

    return opportunities.sort((a, b) => b.viralPotential - a.viralPotential)
  }

  /**
   * Trigger growth hooks based on user events
   */
  async triggerGrowthHooks(userId: string, event: string, data?: any): Promise<GrowthHook[]> {
    const hooks = this.growthHooks.get(event) || []
    const triggeredHooks: GrowthHook[] = []

    for (const hook of hooks) {
      if (await this.shouldTriggerHook(userId, hook, data)) {
        await this.executeGrowthHook(userId, hook, data)
        triggeredHooks.push(hook)
      }
    }

    return triggeredHooks
  }

  private getUserProfile(userId: string): UserViralProfile {
    if (!this.userProfiles.has(userId)) {
      const profile: UserViralProfile = {
        userId,
        totalReferrals: 0,
        successfulReferrals: 0,
        totalRevenue: 0,
        viralScore: 0,
        achievements: [],
        currentTier: 'bronze',
        nextTierProgress: 0,
        referralLinks: [],
        socialShares: [],
        networkInvites: []
      }
      this.userProfiles.set(userId, profile)
    }
    return this.userProfiles.get(userId)!
  }

  private generateReferralCode(userId: string): string {
    return `${userId.slice(-4)}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`
  }

  private findUserByReferralCode(code: string): UserViralProfile | null {
    for (const profile of this.userProfiles.values()) {
      if (profile.referralLinks.some(link => link.code === code && link.isActive)) {
        return profile
      }
    }
    return null
  }

  private calculateViralScore(profile: UserViralProfile): number {
    const baseScore = profile.successfulReferrals * 10
    const revenueScore = profile.totalRevenue * 0.01
    const engagementScore = profile.socialShares.reduce((sum, share) => 
      sum + (share.engagement.views * 0.1 + share.engagement.shares * 2), 0
    )
    
    return Math.min(100, baseScore + revenueScore + engagementScore)
  }

  private async checkTierProgression(profile: UserViralProfile): Promise<void> {
    const tiers = {
      bronze: { referrals: 0, revenue: 0 },
      silver: { referrals: 5, revenue: 1000 },
      gold: { referrals: 15, revenue: 5000 },
      platinum: { referrals: 50, revenue: 25000 },
      diamond: { referrals: 100, revenue: 100000 }
    }

    const currentTierIndex = Object.keys(tiers).indexOf(profile.currentTier)
    const nextTier = Object.keys(tiers)[currentTierIndex + 1] as keyof typeof tiers

    if (nextTier && 
        profile.successfulReferrals >= tiers[nextTier].referrals && 
        profile.totalRevenue >= tiers[nextTier].revenue) {
      
      profile.currentTier = nextTier
      console.log(`🏆 User ${profile.userId} promoted to ${nextTier} tier!`)
    }

    // Calculate progress to next tier
    if (nextTier) {
      const requirements = tiers[nextTier]
      const referralProgress = profile.successfulReferrals / requirements.referrals
      const revenueProgress = profile.totalRevenue / requirements.revenue
      profile.nextTierProgress = Math.min(1, Math.min(referralProgress, revenueProgress)) * 100
    } else {
      profile.nextTierProgress = 100 // Already at highest tier
    }
  }

  private calculateViralCoefficient(campaign: ViralCampaign): number {
    if (campaign.metrics.shares === 0) return 0
    return campaign.metrics.conversions / campaign.metrics.shares
  }

  private async processReferralRewards(
    profile: UserViralProfile, 
    link: ReferralLink, 
    conversionValue: number
  ): Promise<void> {
    const campaign = this.campaigns.get(link.campaignId)
    if (!campaign) return

    for (const reward of campaign.rewards) {
      if (this.meetsRewardRequirements(profile, reward)) {
        await this.grantReward(profile.userId, reward)
      }
    }
  }

  private meetsRewardRequirements(profile: UserViralProfile, reward: ViralReward): boolean {
    const req = reward.requirements
    
    return (!req.referrals || profile.totalReferrals >= req.referrals) &&
           (!req.conversions || profile.successfulReferrals >= req.conversions) &&
           (!req.revenue || profile.totalRevenue >= req.revenue)
  }

  private async grantReward(userId: string, reward: ViralReward): Promise<void> {
    console.log(`🎁 Granting reward to user ${userId}:`, reward.description)
    
    // In production, this would integrate with the rewards system
    switch (reward.type) {
      case 'feature_unlock':
        // Unlock specific features
        break
      case 'discount':
        // Apply discount to user's account
        break
      case 'cash':
        // Process cash reward
        break
    }
  }

  private findBestTemplate(contentType: string, platform: string): ShareTemplate | null {
    const templates = Array.from(this.shareTemplates.values())
      .filter(t => t.contentType === contentType && t.platform === platform)
      .sort((a, b) => b.viralScore - a.viralScore)
    
    return templates[0] || null
  }

  private processTemplate(template: ShareTemplate, data: any, referralUrl: string): string {
    let content = template.template
    
    // Replace placeholders with actual data
    content = content.replace(/{(\w+)}/g, (match, key) => {
      if (key === 'referralUrl') return referralUrl
      return data[key] || match
    })
    
    return content
  }

  private calculateEngagementScore(engagement: Partial<SocialShareData['engagement']>): number {
    const { views = 0, likes = 0, comments = 0, shares = 0, clicks = 0 } = engagement
    return (views * 0.1) + (likes * 0.5) + (comments * 1) + (shares * 2) + (clicks * 1.5)
  }

  private getNextReward(profile: UserViralProfile, campaign: ViralCampaign): ViralReward | null {
    return campaign.rewards.find(reward => !this.meetsRewardRequirements(profile, reward))
  }

  private assessDifficulty(profile: UserViralProfile, campaign: ViralCampaign): 'easy' | 'medium' | 'hard' {
    const nextReward = this.getNextReward(profile, campaign)
    if (!nextReward) return 'easy'

    const req = nextReward.requirements
    const totalRequired = (req.referrals || 0) + (req.conversions || 0)
    
    if (totalRequired <= 3) return 'easy'
    if (totalRequired <= 10) return 'medium'
    return 'hard'
  }

  private estimateCompletionTime(campaign: ViralCampaign): string {
    const cycletime = campaign.metrics.cycletime
    
    if (cycletime <= 24) return '1 day'
    if (cycletime <= 72) return '3 days'
    if (cycletime <= 168) return '1 week'
    return '2+ weeks'
  }

  private async shouldTriggerHook(userId: string, hook: GrowthHook, data?: any): Promise<boolean> {
    // Implement logic to determine if hook should be triggered
    // Could check user preferences, previous interactions, etc.
    return true
  }

  private async executeGrowthHook(userId: string, hook: GrowthHook, data?: any): Promise<void> {
    console.log(`🎯 Executing growth hook: ${hook.id} for user ${userId}`)
    
    // In production, this would show UI prompts, send notifications, etc.
    switch (hook.type) {
      case 'referral_prompt':
        // Show referral invitation UI
        break
      case 'social_share':
        // Show social sharing options
        break
      case 'content_viral':
        // Generate viral content
        break
    }
  }
}

// Supporting interfaces
interface ShareTemplate {
  id: string
  platform: string
  contentType: string
  template: string
  viralScore: number
}

interface ShareContent {
  id: string
  userId: string
  platform: string
  contentType: string
  content: string
  templateId: string
  referralUrl: string
  estimatedViralScore: number
  createdAt: Date
}

interface GrowthHook {
  id: string
  type: 'referral_prompt' | 'social_share' | 'content_viral'
  trigger: string
  message: string
  reward: string
  cta: string
}

interface GrowthOpportunity {
  id: string
  type: string
  title: string
  description: string
  potentialReward: ViralReward | null
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
  viralPotential: number
}

export default ViralGrowthEngine