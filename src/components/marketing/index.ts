/**
 * CoreFlow360 Marketing Components
 * 
 * Revolutionary consciousness-based marketing components that guide prospects
 * through awakening stages rather than traditional sales funnels.
 */

export { default as TeaserCampaignAssets } from './TeaserCampaignAssets'
export { default as LaunchSequenceOrchestrator } from './LaunchSequenceOrchestrator'
export { default as ConsciousnessMarketingFramework } from './ConsciousnessMarketingFramework'

// Marketing campaign types
export interface CampaignPhase {
  id: string
  name: string
  duration: number
  consciousnessLevel: number
  targets: {
    awareness: number
    engagement: number
    conversion: number
  }
  channels: LaunchChannel[]
  assets: LaunchAsset[]
  triggers: LaunchTrigger[]
}

export interface LaunchChannel {
  id: string
  name: string
  priority: 'primary' | 'secondary' | 'support'
  audienceSize: number
  consciousnessReceptivity: number
}

export interface LaunchAsset {
  id: string
  type: 'teaser' | 'demo' | 'story' | 'proof' | 'education'
  variant: 'hero' | 'social' | 'email' | 'banner' | 'video'
  consciousnessLevel: number
  message: string
  cta: string
}

export interface LaunchTrigger {
  id: string
  condition: 'time' | 'engagement' | 'conversion' | 'consciousness'
  threshold: number
  nextPhase?: string
  action: string
}

// Consciousness marketing types
export interface ConsciousnessStage {
  id: string
  name: string
  level: number
  description: string
  psychologicalState: string
  marketingApproach: string
  contentTypes: string[]
  triggers: string[]
  barriers: string[]
  nextStage: string
  color: string
  icon: string
}

export interface ProspectJourney {
  id: string
  currentStage: string
  consciousnessLevel: number
  engagementHistory: string[]
  painPoints: string[]
  readinessSignals: string[]
  recommendedContent: string[]
}