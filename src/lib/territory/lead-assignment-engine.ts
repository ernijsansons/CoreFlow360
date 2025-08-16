// CoreFlow360 - Intelligent Lead Assignment Engine
// Automatically routes new leads to optimal sales reps based on AI analysis

import { TerritoryOptimizer } from './territory-optimizer'
import { Lead, Territory, TerritoryAssignmentRequest, TerritoryAssignmentResult } from '@/types/territory'

export class LeadAssignmentEngine {
  /**
   * Main entry point for lead assignment
   * Processes new leads in real-time with sub-second assignment
   */
  static async assignLead(leadData: Partial<Lead>): Promise<{
    assignedUserId: string
    assignedUser: any
    territoryId?: string
    assignmentReason: string
    confidence: number
    estimatedResponseTime: number // minutes
    priority: 'high' | 'medium' | 'low'
  }> {
    try {
      console.log(`🎯 Processing lead assignment for: ${leadData.company} - ${leadData.firstName} ${leadData.lastName}`)
      
      // 1. Lead Quality Assessment - AI scoring
      const leadScore = await this.assessLeadQuality(leadData)
      console.log(`📊 Lead quality score: ${leadScore.overall}/100`)
      
      // 2. Geographic Territory Identification
      const territories = await this.identifyTerritories(leadData)
      console.log(`🗺️ Found ${territories.length} potential territories`)
      
      // 3. Rep Availability & Workload Analysis
      const repAnalysis = await this.analyzeRepCapacity()
      console.log(`👥 Analyzed ${Object.keys(repAnalysis).length} sales reps`)
      
      // 4. AI-Powered Assignment Algorithm
      const assignmentRequest: TerritoryAssignmentRequest = {
        leadId: leadData.id || 'temp-id',
        leadData: {
          company: leadData.company,
          industry: leadData.industry,
          revenue: leadData.annualRevenue,
          location: {
            address: leadData.address,
            city: leadData.city,
            state: leadData.state,
            zipCode: leadData.zipCode,
            latitude: await this.geocodeAddress(leadData.address, leadData.city, leadData.state),
            longitude: await this.geocodeAddress(leadData.address, leadData.city, leadData.state, true)
          }
        },
        urgency: this.calculateUrgency(leadScore),
        requiredExpertise: this.identifyRequiredExpertise(leadData)
      }
      
      const users = await this.getAvailableReps()
      const assignment = await TerritoryOptimizer.assignLeadToTerritory(
        assignmentRequest,
        territories,
        users
      )
      
      // 5. Assignment Validation & Quality Check
      const validatedAssignment = await this.validateAssignment(assignment, leadData)
      
      // 6. Real-time Assignment Execution
      await this.executeAssignment(validatedAssignment, leadData)
      
      // 7. Trigger Follow-up Workflows
      await this.triggerFollowupWorkflows(validatedAssignment, leadData)
      
      console.log(`✅ Lead assigned to ${validatedAssignment.assignedUser.name} (confidence: ${validatedAssignment.confidence})`)
      
      return {
        assignedUserId: validatedAssignment.assignedUserId,
        assignedUser: validatedAssignment.assignedUser,
        territoryId: validatedAssignment.territoryId,
        assignmentReason: validatedAssignment.assignmentReason,
        confidence: validatedAssignment.confidence,
        estimatedResponseTime: validatedAssignment.estimatedResponseTime,
        priority: assignmentRequest.urgency
      }
      
    } catch (error) {
      console.error('❌ Lead assignment failed:', error)
      
      // Fallback assignment to prevent lead loss
      return await this.fallbackAssignment(leadData)
    }
  }

  /**
   * Batch process multiple leads for efficiency
   */
  static async assignLeadsBatch(leads: Partial<Lead>[]): Promise<Array<{
    leadId: string
    assignedUserId: string
    assignmentReason: string
    confidence: number
  }>> {
    console.log(`🔄 Processing batch assignment for ${leads.length} leads`)
    
    const results = []
    const batchSize = 10 // Process 10 leads at a time for optimal performance
    
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize)
      const batchPromises = batch.map(lead => this.assignLead(lead))
      
      try {
        const batchResults = await Promise.allSettled(batchPromises)
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push({
              leadId: batch[index].id || `temp-${i + index}`,
              assignedUserId: result.value.assignedUserId,
              assignmentReason: result.value.assignmentReason,
              confidence: result.value.confidence
            })
          } else {
            console.error(`Failed to assign lead ${batch[index].id}:`, result.reason)
          }
        })
        
        // Prevent overwhelming the system
        if (i + batchSize < leads.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
      } catch (error) {
        console.error('Batch assignment error:', error)
      }
    }
    
    console.log(`✅ Batch assignment completed: ${results.length}/${leads.length} successful`)
    return results
  }

  /**
   * Assess lead quality using AI scoring
   */
  private static async assessLeadQuality(leadData: Partial<Lead>): Promise<{
    overall: number
    factors: {
      companyFit: number
      contactQuality: number
      buyingSignals: number
      demographics: number
      timeliness: number
    }
  }> {
    // Company Fit Score (0-25 points)
    let companyFit = 0
    if (leadData.annualRevenue && leadData.annualRevenue > 1000000) companyFit += 15
    if (leadData.company && leadData.company.length > 3) companyFit += 5
    if (leadData.industry) companyFit += 5
    
    // Contact Quality Score (0-25 points)  
    let contactQuality = 0
    if (leadData.email && this.isValidBusinessEmail(leadData.email)) contactQuality += 10
    if (leadData.phone) contactQuality += 5
    if (leadData.title && this.isDecisionMakerTitle(leadData.title)) contactQuality += 10
    
    // Buying Signals Score (0-25 points)
    let buyingSignals = 0
    if (leadData.source === 'website' || leadData.source === 'referral') buyingSignals += 10
    if (leadData.websiteVisits && leadData.websiteVisits > 3) buyingSignals += 10
    if (leadData.timeline && ['immediate', '1-3_months'].includes(leadData.timeline)) buyingSignals += 5
    
    // Demographics Score (0-15 points)
    let demographics = 0
    if (leadData.city && leadData.state) demographics += 5
    if (leadData.zipCode) demographics += 5
    if (leadData.country === 'US') demographics += 5
    
    // Timeliness Score (0-10 points)
    let timeliness = 10 // New leads get full points, older leads lose points
    
    const overall = companyFit + contactQuality + buyingSignals + demographics + timeliness
    
    return {
      overall,
      factors: {
        companyFit,
        contactQuality,
        buyingSignals,
        demographics,
        timeliness
      }
    }
  }

  /**
   * Identify territories that could handle this lead
   */
  private static async identifyTerritories(leadData: Partial<Lead>): Promise<Territory[]> {
    // Mock territory data - in production, this would query the database
    const mockTerritories: Territory[] = [
      {
        id: 'territory-1',
        tenantId: 'tenant-1',
        name: 'Northeast Territory',
        description: 'New York, New Jersey, Connecticut',
        boundaryData: { type: 'Polygon', coordinates: [[[-74, 40], [-73, 41], [-72, 40], [-74, 40]]] },
        visitFrequency: 'weekly',
        optimalDays: ['monday', 'tuesday', 'wednesday'],
        priority: 8,
        leadConversionRate: 0.25,
        avgDealValue: 75000,
        customerSatisfaction: 4.2,
        marketPenetration: 0.15,
        competitiveActivity: 7,
        assignedUserId: 'user-1',
        assignedUser: {
          id: 'user-1',
          name: 'Alex Morgan',
          email: 'alex.morgan@coreflow360.com',
          avatar: '/avatars/alex.jpg'
        },
        isActive: true,
        lastVisitDate: '2024-08-09T10:00:00Z',
        nextVisitDate: '2024-08-16T09:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-08-09T10:00:00Z'
      },
      {
        id: 'territory-2',
        tenantId: 'tenant-1',
        name: 'West Coast Territory',
        description: 'California, Oregon, Washington',
        boundaryData: { type: 'Polygon', coordinates: [[[-122, 37], [-121, 38], [-120, 37], [-122, 37]]] },
        visitFrequency: 'biweekly',
        optimalDays: ['tuesday', 'wednesday', 'thursday'],
        priority: 7,
        leadConversionRate: 0.28,
        avgDealValue: 95000,
        customerSatisfaction: 4.5,
        marketPenetration: 0.22,
        competitiveActivity: 9,
        assignedUserId: 'user-2',
        assignedUser: {
          id: 'user-2',
          name: 'Jordan Lee',
          email: 'jordan.lee@coreflow360.com',
          avatar: '/avatars/jordan.jpg'
        },
        isActive: true,
        lastVisitDate: '2024-08-05T14:00:00Z',
        nextVisitDate: '2024-08-19T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-08-05T14:00:00Z'
      }
    ]
    
    // Filter territories based on lead location
    return mockTerritories.filter(territory => {
      if (!leadData.state) return false
      
      // Simple state-based matching (in production, use proper geospatial queries)
      const northeastStates = ['NY', 'NJ', 'CT', 'MA', 'PA']
      const westCoastStates = ['CA', 'OR', 'WA']
      
      if (northeastStates.includes(leadData.state) && territory.name.includes('Northeast')) {
        return true
      }
      
      if (westCoastStates.includes(leadData.state) && territory.name.includes('West Coast')) {
        return true
      }
      
      return false
    })
  }

  /**
   * Analyze current rep capacity and workload
   */
  private static async analyzeRepCapacity(): Promise<{
    [userId: string]: {
      currentLeads: number
      activeDeals: number
      capacity: number
      utilizationRate: number
      responseTimeAvg: number
      performanceScore: number
    }
  }> {
    // Mock rep capacity data
    return {
      'user-1': {
        currentLeads: 15,
        activeDeals: 8,
        capacity: 25,
        utilizationRate: 0.72,
        responseTimeAvg: 45, // minutes
        performanceScore: 0.85
      },
      'user-2': {
        currentLeads: 12,
        activeDeals: 6,
        capacity: 25,
        utilizationRate: 0.58,
        responseTimeAvg: 30, // minutes
        performanceScore: 0.92
      }
    }
  }

  /**
   * Calculate lead urgency based on quality and characteristics
   */
  private static calculateUrgency(leadScore: any): 'high' | 'medium' | 'low' {
    if (leadScore.overall >= 80) return 'high'
    if (leadScore.overall >= 60) return 'medium'
    return 'low'
  }

  /**
   * Identify expertise requirements for this lead
   */
  private static identifyRequiredExpertise(leadData: Partial<Lead>): string[] {
    const expertise = []
    
    if (leadData.industry) expertise.push(leadData.industry)
    if (leadData.annualRevenue && leadData.annualRevenue > 10000000) expertise.push('enterprise_sales')
    if (leadData.title && this.isDecisionMakerTitle(leadData.title)) expertise.push('c_level_selling')
    
    return expertise
  }

  /**
   * Get available sales reps
   */
  private static async getAvailableReps(): Promise<any[]> {
    return [
      {
        id: 'user-1',
        name: 'Alex Morgan',
        email: 'alex.morgan@coreflow360.com',
        expertise: {
          industries: ['technology', 'manufacturing'],
          companySizes: ['51-200', '201-500'],
          specialties: ['enterprise_sales']
        },
        performance: {
          conversionRate: 0.25,
          avgResponseTime: 45,
          customerSatisfaction: 4.2
        }
      },
      {
        id: 'user-2',
        name: 'Jordan Lee',
        email: 'jordan.lee@coreflow360.com',
        expertise: {
          industries: ['healthcare', 'finance'],
          companySizes: ['11-50', '51-200'],
          specialties: ['c_level_selling', 'consultative_sales']
        },
        performance: {
          conversionRate: 0.28,
          avgResponseTime: 30,
          customerSatisfaction: 4.5
        }
      }
    ]
  }

  /**
   * Validate assignment quality
   */
  private static async validateAssignment(
    assignment: TerritoryAssignmentResult,
    leadData: Partial<Lead>
  ): Promise<TerritoryAssignmentResult> {
    // Check if assignment confidence is acceptable
    if (assignment.confidence < 0.6) {
      console.warn(`⚠️ Low confidence assignment (${assignment.confidence}) for lead ${leadData.id}`)
    }
    
    // Validate rep has capacity
    const repCapacity = await this.analyzeRepCapacity()
    const assignedRepCapacity = repCapacity[assignment.assignedUserId]
    
    if (assignedRepCapacity && assignedRepCapacity.utilizationRate > 0.9) {
      console.warn(`⚠️ Assigned rep ${assignment.assignedUserId} is at high capacity (${assignedRepCapacity.utilizationRate})`)
    }
    
    return assignment
  }

  /**
   * Execute the assignment in the database and CRM
   */
  private static async executeAssignment(
    assignment: TerritoryAssignmentResult,
    leadData: Partial<Lead>
  ): Promise<void> {
    try {
      // 1. Update lead record with assignment
      console.log(`📝 Updating lead ${leadData.id} with assignment to ${assignment.assignedUserId}`)
      
      // 2. Create assignment audit log
      console.log(`📋 Creating assignment audit log`)
      
      // 3. Update territory metrics
      console.log(`📊 Updating territory metrics`)
      
      // 4. Trigger CRM integration
      console.log(`🔄 Syncing with CRM system`)
      
      // In production, these would be actual database operations
      
    } catch (error) {
      console.error('Failed to execute assignment:', error)
      throw new Error(`Assignment execution failed: ${error}`)
    }
  }

  /**
   * Trigger automated follow-up workflows
   */
  private static async triggerFollowupWorkflows(
    assignment: TerritoryAssignmentResult,
    leadData: Partial<Lead>
  ): Promise<void> {
    try {
      // 1. Send assignment notification to rep
      console.log(`📧 Sending assignment notification to ${assignment.assignedUser.email}`)
      
      // 2. Schedule follow-up reminders
      const followupTime = new Date(Date.now() + assignment.estimatedResponseTime * 60 * 1000)
      console.log(`⏰ Scheduling follow-up reminder for ${followupTime.toISOString()}`)
      
      // 3. Create initial tasks for rep
      console.log(`✅ Creating initial tasks for rep`)
      
      // 4. Add to territory visit planning
      if (assignment.territoryId) {
        console.log(`🗺️ Adding to territory ${assignment.territoryId} visit planning`)
      }
      
      // 5. Trigger lead nurturing sequence if appropriate
      if (assignment.confidence < 0.8) {
        console.log(`🌱 Triggering lead nurturing sequence`)
      }
      
    } catch (error) {
      console.error('Failed to trigger follow-up workflows:', error)
      // Don't throw here - assignment was successful, workflows are secondary
    }
  }

  /**
   * Fallback assignment when main algorithm fails
   */
  private static async fallbackAssignment(leadData: Partial<Lead>): Promise<any> {
    console.log(`🚨 Using fallback assignment for lead ${leadData.id}`)
    
    // Simple round-robin assignment as fallback
    const availableReps = await this.getAvailableReps()
    const selectedRep = availableReps[Math.floor(Math.random() * availableReps.length)]
    
    return {
      assignedUserId: selectedRep.id,
      assignedUser: selectedRep,
      territoryId: undefined,
      assignmentReason: 'Fallback round-robin assignment due to system error',
      confidence: 0.5,
      estimatedResponseTime: 120, // 2 hours default
      priority: 'medium' as const
    }
  }

  // Utility methods

  private static isValidBusinessEmail(email: string): boolean {
    const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const domain = email.split('@')[1]?.toLowerCase()
    return domain && !businessDomains.includes(domain)
  }

  private static isDecisionMakerTitle(title: string): boolean {
    const decisionMakerKeywords = ['ceo', 'cto', 'cfo', 'president', 'director', 'vp', 'vice president', 'manager', 'head of']
    return decisionMakerKeywords.some(keyword => title.toLowerCase().includes(keyword))
  }

  private static async geocodeAddress(
    address?: string, 
    city?: string, 
    state?: string, 
    returnLongitude: boolean = false
  ): Promise<number | undefined> {
    // Mock geocoding - in production, use Google Maps or other geocoding service
    if (!city || !state) return undefined
    
    // Mock coordinates for demonstration
    const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'New York, NY': { lat: 40.7128, lng: -74.0060 },
      'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
      'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
      'Chicago, IL': { lat: 41.8781, lng: -87.6298 }
    }
    
    const key = `${city}, ${state}`
    const coords = mockCoordinates[key] || { lat: 39.8283, lng: -98.5795 } // Default to center of US
    
    return returnLongitude ? coords.lng : coords.lat
  }
}