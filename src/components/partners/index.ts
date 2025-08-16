/**
 * CoreFlow360 Partner Components
 * 
 * Comprehensive ecosystem for Intelligence Certified Consultants
 * to manage their consciousness transformation practice.
 */

export { default as PartnerPortalDashboard } from './PartnerPortalDashboard'
export { default as IntelligenceCertificationProgram } from './IntelligenceCertificationProgram'
// export { default as PartnerResourceLibrary } from './PartnerResourceLibrary' // Disabled - missing @react-three/fiber
// export { default as PartnerTrainingAcademy } from './PartnerTrainingAcademy' // Disabled - missing @react-three/fiber
export { default as PartnerCommunityHub } from './PartnerCommunityHub'

// Partner types
export interface Partner {
  id: string
  name: string
  email: string
  company: string
  certificationLevel: 'foundation' | 'advanced' | 'master' | 'transcendent'
  certificationDate: Date
  consciousnessLevel: number
  intelligenceScore: number
  clientsTransformed: number
  totalRevenue: number
  specializationAreas: string[]
  location: string
  timezone: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface PartnerMetrics {
  monthlyClients: number
  monthlyRevenue: number
  averageTransformationTime: number
  clientSatisfactionScore: number
  intelligenceMultiplicationAverage: number
  communityContributions: number
}

export interface CertificationProgress {
  currentLevel: string
  nextLevel: string
  progressPercentage: number
  requirementsCompleted: string[]
  requirementsPending: string[]
  estimatedCompletionDate: Date
}