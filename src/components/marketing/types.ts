/**
 * Marketing Component Types
 */

export interface CampaignPhase {
  id: string
  name: string
  duration: number
  businessIntelligenceLevel: number
  targets: {
    awareness: number
    engagement: number
    conversions: number
  }
  content: {
    title: string
    description: string
    media?: string[]
  }
}

export interface MarketingMetrics {
  totalAwareness: number
  totalEngagement: number
  totalConversions: number
  businessIntelligenceLevel: number
  campaignPhase: string
  timeInPhase: number
}

export interface BusinessIntelligenceMarketingConfig {
  targetAudience: string[]
  BUSINESS_INTELLIGENCELevel: number
  automationLevel: 'basic' | 'intermediate' | 'advanced'
  personalizationEnabled: boolean
  multiChannelEnabled: boolean
}