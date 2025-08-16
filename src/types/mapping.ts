// CoreFlow360 - Mapping System Types

export interface CustomerLocation {
  id: string
  customerId: string
  customer?: {
    id: string
    name: string
    email?: string
    phone?: string
    company?: string
  }
  
  // Address information
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Geographic coordinates
  latitude: number
  longitude: number
  
  // Location metadata
  locationType: 'primary' | 'billing' | 'shipping' | 'service'
  isVerified: boolean
  lastVerifiedAt?: string
  
  // Territory assignment
  salesRep?: string
  territory?: string
  
  createdAt: string
  updatedAt: string
}

export interface GoogleMapsUsage {
  id: string
  tenantId: string
  requestType: 'geocoding' | 'directions' | 'places' | 'static_map'
  requestCount: number
  creditsUsed: number
  endpoint?: string
  requestData?: Record<string, any>
  responseTime?: number
  billingMonth: number
  billingYear: number
  createdAt: string
}

export interface MapsBilling {
  id: string
  tenantId: string
  billingMonth: number
  billingYear: number
  totalRequests: number
  totalCredits: number
  freeCreditsUsed: number
  paidCreditsUsed: number
  baseCost: number
  perUserCost: number
  apiOverageCost: number
  totalCost: number
  isPaid: boolean
  paidAt?: string
  stripeInvoiceId?: string
  createdAt: string
  updatedAt: string
}

export interface VisitSchedule {
  id: string
  tenantId: string
  customerLocationId: string
  customerLocation: CustomerLocation
  userId: string
  user: {
    id: string
    name?: string
    email: string
  }
  
  // Schedule details
  scheduledDate: string
  scheduledTime: string
  duration: number
  visitType: 'sales' | 'service' | 'follow_up' | 'demo'
  
  // Status tracking
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  actualStartTime?: string
  actualEndTime?: string
  
  // Visit notes
  notes?: string
  outcome?: string
  nextSteps?: string
  
  // Route optimization
  routeOptimized: boolean
  routePosition?: number
  estimatedTravelTime?: number
  
  createdAt: string
  updatedAt: string
}

export interface RouteStop {
  id: string
  routeId: string
  customerLocationId: string
  customerLocation: CustomerLocation
  visitScheduleId?: string
  visitSchedule?: VisitSchedule
  
  // Route details
  stopNumber: number
  estimatedArrival: string
  actualArrival?: string
  estimatedDuration: number
  actualDuration?: number
  
  // Navigation
  distanceFromPrevious?: number
  travelTimeFromPrevious?: number
  
  // Status
  status: 'planned' | 'in_progress' | 'completed' | 'skipped'
  
  createdAt: string
  updatedAt: string
}

export interface MapProvider {
  name: 'openstreetmap' | 'google'
  isEnabled: boolean
  isPremium: boolean
  features: string[]
  costPerRequest?: number
  monthlyLimit?: number
}

export interface TenantMappingConfig {
  mappingTier: 'free' | 'premium'
  googleMapsEnabled: boolean
  googleMapsSubKey?: string
  monthlyMapCredits: number
  mapUsageResetDate?: string
}

export interface MapRequestOptions {
  provider?: 'openstreetmap' | 'google'
  requestType: 'geocoding' | 'directions' | 'places' | 'static_map'
  fallbackToFree?: boolean
  trackUsage?: boolean
}

export interface GeocodeResult {
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  confidence: number
  provider: 'openstreetmap' | 'google'
}

export interface DirectionsResult {
  distance: number // miles
  duration: number // minutes
  steps: Array<{
    instruction: string
    distance: number
    duration: number
  }>
  provider: 'openstreetmap' | 'google'
}

export interface RouteOptimizationRequest {
  startLocation: {
    latitude: number
    longitude: number
  }
  destinations: Array<{
    id: string
    latitude: number
    longitude: number
    duration?: number // estimated visit duration
    timeWindow?: {
      start: string
      end: string
    }
  }>
  options: {
    optimize: boolean
    roundTrip: boolean
    avoidTolls?: boolean
    avoidHighways?: boolean
  }
}

export interface RouteOptimizationResult {
  optimizedOrder: Array<{
    destinationId: string
    stopNumber: number
    estimatedArrival: string
    estimatedDeparture: string
    travelTime: number
    distance: number
  }>
  totalDistance: number
  totalTravelTime: number
  totalDuration: number
  efficiency: number // percentage improvement over unoptimized
  provider: 'openstreetmap' | 'google'
}

export interface MappingAnalytics {
  totalLocations: number
  verifiedLocations: number
  territoryCoverage: Record<string, number>
  salesRepDistribution: Record<string, number>
  visitFrequency: Record<string, number>
  routeEfficiency: number
  avgTravelTime: number
  costSavings: number
}