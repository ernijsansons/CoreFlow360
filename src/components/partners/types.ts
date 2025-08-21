/**
 * Partner Component Types
 */

export interface Partner {
  id: string
  name: string
  email: string
  company: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  certificationLevel: 'basic' | 'intermediate' | 'advanced' | 'expert'
  businessIntelligenceLevel: number
  joinDate: Date
  lastActive: Date
  metrics: {
    totalRevenue: number
    clientsReferred: number
    certificationScore: number
  }
}

export interface PartnerCertification {
  id: string
  name: string
  description: string
  requirements: string[]
  businessIntelligenceLevel: number
  completionTime: number
  prerequisites?: string[]
}

export interface PartnerMetrics {
  totalPartners: number
  activePartners: number
  averageBusinessIntelligenceLevel: number
  totalRevenue: number
  monthlyGrowth: number
}