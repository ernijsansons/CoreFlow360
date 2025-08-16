// CoreFlow360 - Territory Management Types

export interface Territory {
  id: string
  tenantId: string
  name: string
  description?: string
  boundaryData: GeoJSONPolygon // Territory boundary as GeoJSON
  
  // AI Optimization Settings
  visitFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
  optimalDays: string[] // ['monday', 'wednesday', 'friday']
  priority: number // 1-10 priority score
  
  // Performance Metrics
  leadConversionRate: number
  avgDealValue: number
  customerSatisfaction: number
  marketPenetration: number
  competitiveActivity: number
  
  // Assignment
  assignedUserId?: string
  assignedUser?: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
  
  // Status
  isActive: boolean
  lastVisitDate?: string
  nextVisitDate?: string
  
  createdAt: string
  updatedAt: string
}

export interface TerritoryPlan {
  id: string
  territoryId: string
  territory?: Territory
  
  // Plan Details
  plannedDate: string
  visitType: 'regular' | 'blitz' | 'maintenance' | 'expansion'
  duration: number // minutes
  
  // AI Recommendations
  recommendedRoute: OptimizedRoute
  priorityAccounts: string[] // Customer IDs
  suggestedActivities: TerritoryActivity[]
  preparationNotes?: string
  
  // Execution Tracking
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  actualStartTime?: string
  actualEndTime?: string
  
  // Results
  appointmentsBooked: number
  leadsGenerated: number
  dealsAdvanced: number
  revenue: number
  
  createdAt: string
  updatedAt: string
}

export interface TerritoryVisit {
  id: string
  territoryId: string
  territory?: Territory
  userId: string
  user: {
    id: string
    name?: string
    email: string
  }
  
  // Visit Details
  visitDate: string
  startTime: string
  endTime?: string
  visitType: string
  
  // Pre-Visit Intelligence
  briefingData: TerritoryBriefing
  targetAccounts: string[]
  objectives: string[]
  
  // Execution Tracking
  actualRoute?: GPSRoute
  accountsVisited: string[]
  activitiesCompleted: CompletedActivity[]
  
  // Results & Outcomes
  newLeads: number
  meetingsBooked: number
  dealsProgressed: number
  revenue: number
  notes?: string
  nextActions: string[]
  
  // Effectiveness Metrics
  effectivenessScore: number // AI-calculated effectiveness
  roiScore: number // Return on investment
  
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  tenantId: string
  
  // Lead Details
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  title?: string
  
  // Address Information
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  
  // Lead Source & Classification
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  qualification: 'unqualified' | 'mql' | 'sql' | 'opportunity'
  
  // AI Scoring
  aiScore: number // 0-100
  buyingIntent: number // 0-1
  responseProb: number // 0-1
  
  // Territory Assignment
  territoryId?: string
  territory?: Territory
  assignedUserId?: string
  assignedUser?: {
    id: string
    name?: string
    email: string
  }
  
  // Lead Intelligence
  companySize?: string
  annualRevenue?: number
  industry?: string
  decisionMaker: boolean
  budget?: number
  timeline?: 'immediate' | '1-3_months' | '3-6_months' | '6-12_months' | '12+_months'
  
  // Engagement Tracking
  firstTouchDate?: string
  lastTouchDate?: string
  touchCount: number
  emailOpens: number
  emailClicks: number
  websiteVisits: number
  
  // Conversion Tracking
  convertedToDeal: boolean
  conversionDate?: string
  dealId?: string
  
  createdAt: string
  updatedAt: string
}

export interface LeadTerritoryAssignment {
  id: string
  tenantId: string
  
  // Assignment Rules
  ruleName: string
  priority: number
  isActive: boolean
  
  // Geographic Rules
  zipCodes: string[]
  cities: string[]
  states: string[]
  radiusMiles?: number
  centerLat?: number
  centerLng?: number
  
  // Business Rules
  industries: string[]
  companySizes: string[]
  revenueRange?: {
    min: number
    max: number
  }
  
  // Assignment Logic
  assignmentType: 'round_robin' | 'territory_based' | 'expertise_match' | 'workload_balance'
  targetUserId?: string
  targetUser?: {
    id: string
    name?: string
    email: string
  }
  
  // Performance Tracking
  leadsAssigned: number
  conversionRate: number
  avgResponseTime: number // minutes
  
  createdAt: string
  updatedAt: string
}

export interface TerritoryAnalytics {
  id: string
  territoryId?: string
  territory?: Territory
  userId?: string
  user?: {
    id: string
    name?: string
    email: string
  }
  
  // Analytics Period
  periodStart: string
  periodEnd: string
  periodType: 'week' | 'month' | 'quarter' | 'year'
  
  // Activity Metrics
  visitsPlanned: number
  visitsCompleted: number
  totalVisitTime: number // minutes
  
  // Lead & Opportunity Metrics
  newLeads: number
  qualifiedLeads: number
  leadsConverted: number
  conversionRate: number
  
  // Revenue Metrics
  pipelineValue: number
  closedRevenue: number
  avgDealSize: number
  
  // Efficiency Metrics
  milesTravel: number
  fuelCost: number
  timeUtilization: number // % of time in productive activities
  
  // Customer Metrics
  newCustomers: number
  customerMeetings: number
  satisfactionScore: number
  
  // Competitive Intelligence
  competitorMentions: number
  lostToCompetitors: number
  competitiveWins: number
  
  // AI Insights
  performanceScore: number // Overall AI-calculated performance
  improvementAreas: string[]
  recommendations: Record<string, any>
  
  recordedAt: string
}

// Supporting types

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][] // Array of linear rings
}

export interface OptimizedRoute {
  waypoints: RouteWaypoint[]
  totalDistance: number // miles
  totalTime: number // minutes
  optimizationScore: number // efficiency improvement %
}

export interface RouteWaypoint {
  id: string
  customerId: string
  customerName: string
  address: string
  latitude: number
  longitude: number
  estimatedArrival: string
  estimatedDuration: number // minutes
  visitPurpose: string
  priority: number
}

export interface TerritoryActivity {
  id: string
  type: 'customer_visit' | 'prospecting' | 'follow_up' | 'relationship_building'
  customerId?: string
  customerName?: string
  description: string
  estimatedDuration: number // minutes
  priority: number
  objectives: string[]
  suggestedTalkingPoints: string[]
}

export interface TerritoryBriefing {
  territoryOverview: {
    totalAccounts: number
    activeOpportunities: number
    pipelineValue: number
    lastVisitDate: string
    keyMetrics: Record<string, number>
  }
  priorityAccounts: {
    id: string
    name: string
    value: number
    lastContact: string
    nextAction: string
    urgency: 'high' | 'medium' | 'low'
  }[]
  marketIntelligence: {
    competitorActivity: string[]
    industryTrends: string[]
    newsAndEvents: string[]
  }
  recommendedActivities: TerritoryActivity[]
  talkingPoints: {
    category: string
    points: string[]
  }[]
}

export interface GPSRoute {
  coordinates: {
    latitude: number
    longitude: number
    timestamp: string
  }[]
  totalDistance: number
  totalTime: number
}

export interface CompletedActivity {
  activityId: string
  type: string
  customerId?: string
  completedAt: string
  duration: number
  outcome: string
  notes?: string
  nextAction?: string
}

export interface TerritoryPerformanceMetrics {
  visitsThisWeek: number
  visitsThisMonth: number
  avgVisitsPerWeek: number
  territoryEfficiency: number // %
  leadConversionRate: number // %
  pipelineVelocity: number // days
  revenuePerVisit: number
  costPerLead: number
  customerSatisfactionScore: number
  competitiveWinRate: number // %
}

export interface TerritoryOptimizationSuggestions {
  visitFrequency: {
    current: string
    recommended: string
    reasoning: string
    expectedImpact: string
  }
  routeOptimization: {
    currentEfficiency: number
    optimizedEfficiency: number
    timeSavings: number // minutes per day
    costSavings: number // dollars per month
  }
  focusAreas: {
    area: string
    priority: 'high' | 'medium' | 'low'
    description: string
    actions: string[]
  }[]
  accountPrioritization: {
    customerId: string
    currentPriority: number
    recommendedPriority: number
    reasoning: string
  }[]
}

export interface TerritoryAssignmentRequest {
  leadId: string
  leadData: {
    company?: string
    industry?: string
    revenue?: number
    location: {
      address?: string
      city?: string
      state?: string
      zipCode?: string
      latitude?: number
      longitude?: number
    }
  }
  urgency: 'high' | 'medium' | 'low'
  requiredExpertise?: string[]
}

export interface TerritoryAssignmentResult {
  assignedUserId: string
  assignedUser: {
    id: string
    name?: string
    email: string
    territory?: string
  }
  territoryId?: string
  assignmentReason: string
  confidence: number // 0-1
  estimatedResponseTime: number // minutes
  alternativeAssignees?: {
    userId: string
    score: number
    reasoning: string
  }[]
}