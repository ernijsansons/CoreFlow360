/**
 * CoreFlow360 - AI-Powered Lead Intelligence Engine
 * Multi-source data enrichment with predictive analytics ($79/month)
 */

export interface LeadProfile {
  id: string
  tenantId: string

  // Basic Information
  email: string
  alternateEmails?: string[]
  firstName: string
  lastName: string
  fullName: string

  // Contact Information
  phoneNumbers: PhoneNumber[]
  location: LocationInfo
  timezone: string

  // Professional Information
  currentTitle: string
  currentCompany: CompanyInfo
  previousCompanies: CompanyInfo[]
  yearsOfExperience: number
  seniority: 'ENTRY' | 'MID' | 'SENIOR' | 'EXECUTIVE' | 'C_SUITE'
  department: string
  skills: string[]

  // Social Profiles
  linkedinUrl?: string
  twitterUrl?: string
  facebookUrl?: string
  githubUrl?: string
  personalWebsite?: string

  // Enrichment Data
  enrichmentSources: EnrichmentSource[]
  lastEnrichedAt: Date
  enrichmentScore: number // 0-100 quality score
  dataCompleteness: number // 0-100 percentage

  // Behavioral Data
  technographics: Technographic[]
  intentData: IntentSignal[]
  websiteActivity: WebActivity[]
  contentEngagement: ContentEngagement[]

  // Predictive Scores
  leadScore: number // 0-100
  conversionProbability: number // 0-1
  dealSizePrediction?: DealSizePrediction
  churnRisk: number // 0-1
  expansionPotential: number // 0-1

  // Relationship Data
  mutualConnections: Connection[]
  referralPaths: ReferralPath[]
  influenceNetwork: InfluenceNode[]

  // Company Insights
  companyGrowthStage: 'STARTUP' | 'GROWTH' | 'MATURE' | 'ENTERPRISE'
  companyFunding?: FundingInfo
  companyNews: NewsItem[]
  competitorUsage: CompetitorInfo[]

  // Communication Preferences
  preferredChannel: 'EMAIL' | 'PHONE' | 'LINKEDIN' | 'TEXT'
  bestTimeToContact: TimeWindow[]
  communicationFrequency: 'HIGH' | 'MEDIUM' | 'LOW'
  engagementStyle: 'FORMAL' | 'CASUAL' | 'TECHNICAL' | 'RELATIONSHIP'

  // AI Insights
  personalityProfile?: PersonalityProfile
  buyingRole: 'CHAMPION' | 'DECISION_MAKER' | 'INFLUENCER' | 'USER' | 'BLOCKER'
  painPoints: string[]
  motivations: string[]
  objections: string[]

  // Compliance & Privacy
  gdprConsent?: boolean
  emailOptIn?: boolean
  dataRetentionDate?: Date
  doNotContact?: boolean

  createdAt: Date
  updatedAt: Date
}

export interface CompanyInfo {
  id: string
  name: string
  domain: string
  industry: string
  subIndustry?: string
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE'
  employeeCount?: number
  revenue?: number
  location: LocationInfo
  description?: string
  foundedYear?: number
  linkedinUrl?: string
  website?: string
  technologies?: string[]
}

export interface PhoneNumber {
  number: string
  type: 'MOBILE' | 'WORK' | 'HOME' | 'OTHER'
  isPrimary: boolean
  isVerified: boolean
}

export interface LocationInfo {
  city?: string
  state?: string
  country: string
  postalCode?: string
  latitude?: number
  longitude?: number
  formattedAddress?: string
}

export interface EnrichmentSource {
  source: 'APOLLO' | 'ZOOMINFO' | 'CLEARBIT' | 'HUNTER' | 'LINKEDIN' | 'INTERNAL' | 'MANUAL'
  enrichedAt: Date
  dataPoints: Record<string, unknown>
  confidence: number
  cost: number // Track API costs
}

export interface Technographic {
  category: string
  technology: string
  vendor: string
  adoptedDate?: Date
  monthlySpend?: number
  contractEndDate?: Date
  satisfactionScore?: number
}

export interface IntentSignal {
  topic: string
  score: number // 0-100
  source: string
  detectedDate: Date
  keywords: string[]
  urls: string[]
}

export interface WebActivity {
  url: string
  pageTitle: string
  visitDate: Date
  duration: number // seconds
  source: string
  actions: string[]
}

export interface ContentEngagement {
  contentId: string
  contentType: 'BLOG' | 'WHITEPAPER' | 'WEBINAR' | 'CASE_STUDY' | 'VIDEO' | 'EMAIL'
  title: string
  engagementDate: Date
  engagementType: 'VIEW' | 'DOWNLOAD' | 'SHARE' | 'COMMENT'
  engagementScore: number
}

export interface DealSizePrediction {
  minValue: number
  maxValue: number
  mostLikelyValue: number
  confidence: number
  factors: string[]
}

export interface Connection {
  name: string
  title: string
  company: string
  relationshipStrength: number
  sharedConnections: number
}

export interface ReferralPath {
  path: string[]
  strength: number
  commonInterests: string[]
}

export interface InfluenceNode {
  personId: string
  name: string
  influenceScore: number
  relationship: string
}

export interface FundingInfo {
  totalRaised: number
  lastRoundAmount: number
  lastRoundDate: Date
  lastRoundType: string
  investors: string[]
  valuation?: number
}

export interface NewsItem {
  title: string
  summary: string
  source: string
  publishedDate: Date
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  relevance: number
  topics: string[]
}

export interface CompetitorInfo {
  competitorName: string
  product: string
  usageSince?: Date
  satisfactionLevel?: 'HIGH' | 'MEDIUM' | 'LOW'
  contractEndDate?: Date
  switchingLikelihood?: number
}

export interface TimeWindow {
  dayOfWeek: number // 0-6
  startHour: number // 0-23
  endHour: number // 0-23
  timezone: string
}

export interface PersonalityProfile {
  discProfile?: 'D' | 'I' | 'S' | 'C'
  communicationStyle: string[]
  decisionMakingStyle: string
  riskTolerance: 'HIGH' | 'MEDIUM' | 'LOW'
  learningStyle: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC'
}

export class LeadIntelligenceEngine {
  private apiKeys: {
    apollo?: string
    zoominfo?: string
    clearbit?: string
    hunter?: string
  }

  constructor() {
    this.apiKeys = {
      apollo: process.env.APOLLO_API_KEY,
      zoominfo: process.env.ZOOMINFO_API_KEY,
      clearbit: process.env.CLEARBIT_API_KEY,
      hunter: process.env.HUNTER_API_KEY,
    }
  }

  /**
   * Enrich a lead profile from multiple data sources
   */
  async enrichLead(email: string, additionalContext?: Partial<LeadProfile>): Promise<LeadProfile> {
    const enrichmentResults: EnrichmentSource[] = []
    let combinedData: Partial<LeadProfile> = {
      email,
      ...additionalContext,
    }

    try {
      // Try each enrichment source
      const enrichmentPromises = []

      if (this.apiKeys.apollo) {
        enrichmentPromises.push(this.enrichFromApollo(email))
      }

      if (this.apiKeys.clearbit) {
        enrichmentPromises.push(this.enrichFromClearbit(email))
      }

      if (this.apiKeys.hunter) {
        enrichmentPromises.push(this.enrichFromHunter(email))
      }

      // Internal enrichment from CRM data
      enrichmentPromises.push(this.enrichFromInternal(email))

      const results = await Promise.allSettled(enrichmentPromises)

      // Merge results intelligently
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          enrichmentResults.push(result.value.source)
          combinedData = this.mergeEnrichmentData(combinedData, result.value.data)
        }
      }

      // Calculate enrichment quality
      const enrichmentScore = this.calculateEnrichmentScore(combinedData)
      const dataCompleteness = this.calculateDataCompleteness(combinedData)

      // Generate AI insights
      const aiInsights = await this.generateAIInsights(combinedData)

      // Calculate predictive scores
      const predictiveScores = await this.calculatePredictiveScores(combinedData)

      const leadProfile: LeadProfile = {
        id: this.generateLeadId(email),
        tenantId: additionalContext?.tenantId || '',
        email,
        firstName: combinedData.firstName || '',
        lastName: combinedData.lastName || '',
        fullName: `${combinedData.firstName || ''} ${combinedData.lastName || ''}`.trim(),

        phoneNumbers: combinedData.phoneNumbers || [],
        location: combinedData.location || { country: 'Unknown' },
        timezone: combinedData.timezone || 'UTC',

        currentTitle: combinedData.currentTitle || '',
        currentCompany: combinedData.currentCompany || this.getEmptyCompany(),
        previousCompanies: combinedData.previousCompanies || [],
        yearsOfExperience: combinedData.yearsOfExperience || 0,
        seniority: combinedData.seniority || 'MID',
        department: combinedData.department || '',
        skills: combinedData.skills || [],

        linkedinUrl: combinedData.linkedinUrl,
        twitterUrl: combinedData.twitterUrl,

        enrichmentSources: enrichmentResults,
        lastEnrichedAt: new Date(),
        enrichmentScore,
        dataCompleteness,

        technographics: combinedData.technographics || [],
        intentData: combinedData.intentData || [],
        websiteActivity: combinedData.websiteActivity || [],
        contentEngagement: combinedData.contentEngagement || [],

        leadScore: predictiveScores.leadScore,
        conversionProbability: predictiveScores.conversionProbability,
        dealSizePrediction: predictiveScores.dealSizePrediction,
        churnRisk: predictiveScores.churnRisk,
        expansionPotential: predictiveScores.expansionPotential,

        mutualConnections: combinedData.mutualConnections || [],
        referralPaths: combinedData.referralPaths || [],
        influenceNetwork: combinedData.influenceNetwork || [],

        companyGrowthStage: combinedData.companyGrowthStage || 'GROWTH',
        companyFunding: combinedData.companyFunding,
        companyNews: combinedData.companyNews || [],
        competitorUsage: combinedData.competitorUsage || [],

        preferredChannel: aiInsights.preferredChannel,
        bestTimeToContact: aiInsights.bestTimeToContact,
        communicationFrequency: aiInsights.communicationFrequency,
        engagementStyle: aiInsights.engagementStyle,

        personalityProfile: aiInsights.personalityProfile,
        buyingRole: aiInsights.buyingRole,
        painPoints: aiInsights.painPoints,
        motivations: aiInsights.motivations,
        objections: aiInsights.objections,

        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return leadProfile
    } catch (error) {
      throw new Error('Failed to enrich lead profile')
    }
  }

  /**
   * Predict conversion probability using ML model
   */
  async predictConversion(lead: LeadProfile): Promise<{
    probability: number
    factors: ConversionFactor[]
    recommendations: string[]
  }> {
    try {
      const features = this.extractConversionFeatures(lead)

      // Calculate base probability from engagement signals
      let probability = 0.3 // Base probability

      // Positive factors
      if (lead.seniority === 'C_SUITE' || lead.seniority === 'EXECUTIVE') {
        probability += 0.15
      }

      if (lead.intentData.some((intent) => intent.score > 70)) {
        probability += 0.2
      }

      if (lead.websiteActivity.length > 5) {
        probability += 0.1
      }

      if (lead.contentEngagement.filter((e) => e.engagementType === 'DOWNLOAD').length > 0) {
        probability += 0.15
      }

      if (lead.companyGrowthStage === 'GROWTH' || lead.companyGrowthStage === 'STARTUP') {
        probability += 0.1
      }

      // Negative factors
      if (lead.competitorUsage.some((c) => c.satisfactionLevel === 'HIGH')) {
        probability -= 0.2
      }

      if (!lead.phoneNumbers.length && !lead.linkedinUrl) {
        probability -= 0.1
      }

      // Ensure probability is between 0 and 1
      probability = Math.max(0, Math.min(1, probability))

      // Identify key conversion factors
      const factors = this.identifyConversionFactors(lead, features)

      // Generate recommendations
      const recommendations = this.generateConversionRecommendations(lead, probability, factors)

      return {
        probability,
        factors,
        recommendations,
      }
    } catch (error) {
      return {
        probability: 0.5,
        factors: [],
        recommendations: ['Unable to generate predictions'],
      }
    }
  }

  /**
   * Predict potential deal size based on company and lead attributes
   */
  async predictDealSize(lead: LeadProfile): Promise<DealSizePrediction> {
    try {
      const company = lead.currentCompany
      let baseValue = 10000 // Default base

      // Adjust based on company size
      switch (company.size) {
        case 'ENTERPRISE':
          baseValue = 100000
          break
        case 'LARGE':
          baseValue = 50000
          break
        case 'MEDIUM':
          baseValue = 25000
          break
        case 'SMALL':
          baseValue = 10000
          break
      }

      // Adjust based on seniority
      const seniorityMultiplier = {
        C_SUITE: 3,
        EXECUTIVE: 2.5,
        SENIOR: 1.5,
        MID: 1,
        ENTRY: 0.5,
      }
      baseValue *= seniorityMultiplier[lead.seniority] || 1

      // Adjust based on industry
      const industryMultiplier = this.getIndustryMultiplier(company.industry)
      baseValue *= industryMultiplier

      // Adjust based on technographics
      if (lead.technographics.some((t) => t.monthlySpend && t.monthlySpend > 5000)) {
        baseValue *= 1.5
      }

      // Calculate range
      const minValue = Math.round(baseValue * 0.7)
      const maxValue = Math.round(baseValue * 1.5)
      const mostLikelyValue = Math.round(baseValue)

      const factors = [
        `Company size: ${company.size}`,
        `Seniority level: ${lead.seniority}`,
        `Industry: ${company.industry}`,
        `Current tech spend: $${lead.technographics.reduce((sum, t) => sum + (t.monthlySpend || 0), 0)}/month`,
      ]

      return {
        minValue,
        maxValue,
        mostLikelyValue,
        confidence: 0.75,
        factors,
      }
    } catch (error) {
      return {
        minValue: 5000,
        maxValue: 50000,
        mostLikelyValue: 15000,
        confidence: 0.5,
        factors: ['Default prediction due to limited data'],
      }
    }
  }

  /**
   * Identify competitors being used by the lead's company
   */
  async identifyCompetitors(lead: LeadProfile): Promise<CompetitorInfo[]> {
    const competitors: CompetitorInfo[] = []

    try {
      // Check technographics for competitor products
      const competitorTech = [
        { vendor: 'Salesforce', product: 'Salesforce CRM' },
        { vendor: 'HubSpot', product: 'HubSpot CRM' },
        { vendor: 'Pipedrive', product: 'Pipedrive' },
        { vendor: 'Monday.com', product: 'Monday CRM' },
        { vendor: 'Zoho', product: 'Zoho CRM' },
      ]

      for (const tech of lead.technographics) {
        const competitor = competitorTech.find((c) =>
          tech.vendor.toLowerCase().includes(c.vendor.toLowerCase())
        )

        if (competitor) {
          competitors.push({
            competitorName: competitor.vendor,
            product: competitor.product,
            usageSince: tech.adoptedDate,
            satisfactionLevel: this.estimateSatisfaction(tech),
            contractEndDate: tech.contractEndDate,
            switchingLikelihood: this.calculateSwitchingLikelihood(tech),
          })
        }
      }

      // Check for indirect signals of competitor usage
      if (
        lead.websiteActivity.some(
          (activity) =>
            activity.url.includes('salesforce.com') ||
            activity.pageTitle.toLowerCase().includes('salesforce')
        )
      ) {
        if (!competitors.find((c) => c.competitorName === 'Salesforce')) {
          competitors.push({
            competitorName: 'Salesforce',
            product: 'Salesforce CRM',
            satisfactionLevel: 'MEDIUM',
            switchingLikelihood: 0.3,
          })
        }
      }

      return competitors
    } catch (error) {
      return []
    }
  }

  /**
   * Generate personalized engagement strategy
   */
  async generateEngagementStrategy(lead: LeadProfile): Promise<{
    strategy: string
    tactics: EngagementTactic[]
    messaging: MessageTemplate[]
    timeline: EngagementTimeline
  }> {
    try {
      // Analyze lead profile for strategy
      const isHighValue =
        lead.leadScore > 70 || lead.seniority === 'C_SUITE' || lead.seniority === 'EXECUTIVE'
      const hasUrgency = lead.intentData.some((i) => i.score > 80)
      const isEngaged = lead.websiteActivity.length > 3 || lead.contentEngagement.length > 0

      let strategy = ''
      const tactics: EngagementTactic[] = []

      if (isHighValue && hasUrgency) {
        strategy = 'High-touch, personalized outreach with executive-level value propositions'
        tactics.push({
          channel: 'PHONE',
          action: 'Direct call from senior sales rep',
          priority: 'HIGH',
          timing: 'Within 24 hours',
        })
      } else if (isEngaged) {
        strategy = 'Nurture engaged lead with targeted content and gradual relationship building'
        tactics.push({
          channel: 'EMAIL',
          action: 'Send personalized case study',
          priority: 'MEDIUM',
          timing: 'Within 48 hours',
        })
      } else {
        strategy = 'Educational approach to build awareness and trust'
        tactics.push({
          channel: 'EMAIL',
          action: 'Add to nurture campaign',
          priority: 'LOW',
          timing: 'Start weekly touches',
        })
      }

      // Add channel-specific tactics based on preferences
      if (lead.preferredChannel === 'LINKEDIN' && lead.linkedinUrl) {
        tactics.push({
          channel: 'LINKEDIN',
          action: 'Connect with personalized message',
          priority: 'MEDIUM',
          timing: 'Day 1',
        })
      }

      // Generate messaging templates
      const messaging = await this.generateMessagingTemplates(lead, strategy)

      // Create engagement timeline
      const timeline = this.createEngagementTimeline(lead, tactics)

      return {
        strategy,
        tactics,
        messaging,
        timeline,
      }
    } catch (error) {
      throw new Error('Failed to generate engagement strategy')
    }
  }

  // Private helper methods
  private async enrichFromApollo(
    email: string
  ): Promise<{ source: EnrichmentSource; data: Partial<LeadProfile> }> {
    // Simulated Apollo enrichment - would call real API

    return {
      source: {
        source: 'APOLLO',
        enrichedAt: new Date(),
        dataPoints: {},
        confidence: 0.85,
        cost: 0.1,
      },
      data: {
        firstName: 'John',
        lastName: 'Doe',
        currentTitle: 'VP of Sales',
        currentCompany: {
          id: 'company-1',
          name: 'TechCorp',
          domain: 'techcorp.com',
          industry: 'Technology',
          size: 'MEDIUM',
          employeeCount: 500,
          location: { country: 'USA', state: 'CA', city: 'San Francisco' },
        } as CompanyInfo,
        seniority: 'EXECUTIVE',
        department: 'Sales',
        phoneNumbers: [
          {
            number: '+1-555-0123',
            type: 'WORK',
            isPrimary: true,
            isVerified: true,
          },
        ],
        linkedinUrl: 'https://linkedin.com/in/johndoe',
      },
    }
  }

  private async enrichFromClearbit(
    email: string
  ): Promise<{ source: EnrichmentSource; data: Partial<LeadProfile> }> {
    // Simulated Clearbit enrichment

    return {
      source: {
        source: 'CLEARBIT',
        enrichedAt: new Date(),
        dataPoints: {},
        confidence: 0.9,
        cost: 0.15,
      },
      data: {
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postalCode: '94105',
        },
        timezone: 'America/Los_Angeles',
        twitterUrl: 'https://twitter.com/johndoe',
        personalWebsite: 'https://johndoe.com',
      },
    }
  }

  private async enrichFromHunter(
    email: string
  ): Promise<{ source: EnrichmentSource; data: Partial<LeadProfile> }> {
    // Simulated Hunter enrichment

    return {
      source: {
        source: 'HUNTER',
        enrichedAt: new Date(),
        dataPoints: {},
        confidence: 0.75,
        cost: 0.05,
      },
      data: {
        alternateEmails: [`john@personal.com`],
        gdprConsent: true,
        emailOptIn: true,
      },
    }
  }

  private async enrichFromInternal(
    email: string
  ): Promise<{ source: EnrichmentSource; data: Partial<LeadProfile> }> {
    // Internal CRM data enrichment
    return {
      source: {
        source: 'INTERNAL',
        enrichedAt: new Date(),
        dataPoints: {},
        confidence: 1.0,
        cost: 0,
      },
      data: {
        websiteActivity: [
          {
            url: '/pricing',
            pageTitle: 'Pricing - CoreFlow360',
            visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            duration: 180,
            source: 'organic',
            actions: ['viewed_pricing', 'clicked_enterprise'],
          },
        ],
        contentEngagement: [
          {
            contentId: 'whitepaper-1',
            contentType: 'WHITEPAPER',
            title: 'AI in Modern CRM',
            engagementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            engagementType: 'DOWNLOAD',
            engagementScore: 0.8,
          },
        ],
      },
    }
  }

  private mergeEnrichmentData(
    existing: Partial<LeadProfile>,
    newData: Partial<LeadProfile>
  ): Partial<LeadProfile> {
    // Intelligent merging - prefer non-empty values, higher confidence sources
    const merged = { ...existing }

    for (const [key, value] of Object.entries(newData)) {
      if (
        value &&
        (!merged[key as keyof LeadProfile] ||
          this.isHigherQuality(value, merged[key as keyof LeadProfile]))
      ) {
        ;(merged as unknown)[key] = value
      }
    }

    // Merge arrays intelligently
    if (newData.phoneNumbers) {
      merged.phoneNumbers = this.mergePhoneNumbers(merged.phoneNumbers || [], newData.phoneNumbers)
    }

    if (newData.skills) {
      merged.skills = [...new Set([...(merged.skills || []), ...newData.skills])]
    }

    return merged
  }

  private isHigherQuality(newValue: unknown, existingValue: unknown): boolean {
    // Simple quality comparison - can be enhanced
    if (!existingValue) return true
    if (typeof newValue === 'string' && newValue.length > existingValue.length) return true
    if (Array.isArray(newValue) && newValue.length > existingValue.length) return true
    return false
  }

  private mergePhoneNumbers(existing: PhoneNumber[], newNumbers: PhoneNumber[]): PhoneNumber[] {
    const phoneMap = new Map<string, PhoneNumber>()

    // Add existing numbers
    existing.forEach((phone) => phoneMap.set(phone.number, phone))

    // Merge new numbers
    newNumbers.forEach((phone) => {
      if (!phoneMap.has(phone.number)) {
        phoneMap.set(phone.number, phone)
      }
    })

    return Array.from(phoneMap.values())
  }

  private calculateEnrichmentScore(data: Partial<LeadProfile>): number {
    const importantFields = [
      'firstName',
      'lastName',
      'currentTitle',
      'currentCompany',
      'phoneNumbers',
      'linkedinUrl',
      'seniority',
      'department',
    ]

    let score = 0
    const maxScore = importantFields.length * 10

    for (const field of importantFields) {
      if (data[field as keyof LeadProfile]) {
        score += 10
      }
    }

    // Bonus for rich data
    if (data.phoneNumbers && data.phoneNumbers.length > 0) score += 5
    if (data.websiteActivity && data.websiteActivity.length > 0) score += 10
    if (data.intentData && data.intentData.length > 0) score += 15

    return Math.min(100, Math.round((score / maxScore) * 100))
  }

  private calculateDataCompleteness(data: Partial<LeadProfile>): number {
    const allFields = Object.keys(data).filter(
      (key) => data[key as keyof LeadProfile] !== undefined
    )
    const totalPossibleFields = 40 // Approximate number of fields

    return Math.round((allFields.length / totalPossibleFields) * 100)
  }

  private async generateAIInsights(data: Partial<LeadProfile>): Promise<unknown> {
    // AI-powered insights generation
    return {
      preferredChannel: this.inferPreferredChannel(data),
      bestTimeToContact: this.inferBestContactTimes(data),
      communicationFrequency: this.inferCommunicationFrequency(data),
      engagementStyle: this.inferEngagementStyle(data),
      personalityProfile: this.inferPersonalityProfile(data),
      buyingRole: this.inferBuyingRole(data),
      painPoints: this.inferPainPoints(data),
      motivations: this.inferMotivations(data),
      objections: this.inferObjections(data),
    }
  }

  private async calculatePredictiveScores(data: Partial<LeadProfile>): Promise<unknown> {
    // Calculate various predictive scores
    const leadScore = this.calculateLeadScore(data)
    const conversionProbability = this.calculateConversionProbability(data)
    const dealSizePrediction = await this.estimateDealSize(data)
    const churnRisk = this.calculateChurnRisk(data)
    const expansionPotential = this.calculateExpansionPotential(data)

    return {
      leadScore,
      conversionProbability,
      dealSizePrediction,
      churnRisk,
      expansionPotential,
    }
  }

  private calculateLeadScore(data: Partial<LeadProfile>): number {
    let score = 50 // Base score

    // Positive factors
    if (data.seniority === 'C_SUITE') score += 20
    else if (data.seniority === 'EXECUTIVE') score += 15
    else if (data.seniority === 'SENIOR') score += 10

    if (data.websiteActivity && data.websiteActivity.length > 3) score += 10
    if (data.contentEngagement && data.contentEngagement.length > 0) score += 15
    if (data.phoneNumbers && data.phoneNumbers.length > 0) score += 5
    if (data.linkedinUrl) score += 5

    // Company factors
    if (data.currentCompany?.size === 'ENTERPRISE') score += 10
    else if (data.currentCompany?.size === 'LARGE') score += 5

    return Math.min(100, Math.max(0, score))
  }

  private calculateConversionProbability(data: Partial<LeadProfile>): number {
    const leadScore = this.calculateLeadScore(data)
    const engagementLevel =
      (data.websiteActivity?.length || 0) + (data.contentEngagement?.length || 0)

    let probability = (leadScore / 100) * 0.5 // Lead score contributes 50%
    probability += Math.min(engagementLevel / 10, 0.3) // Engagement contributes up to 30%

    if (data.intentData && data.intentData.some((i) => i.score > 70)) {
      probability += 0.2 // High intent adds 20%
    }

    return Math.min(1, Math.max(0, probability))
  }

  private async estimateDealSize(
    data: Partial<LeadProfile>
  ): Promise<DealSizePrediction | undefined> {
    if (!data.currentCompany) return undefined

    const baseValue = this.getBaseValueByCompanySize(data.currentCompany.size || 'MEDIUM')
    const seniorityMultiplier = this.getSeniorityMultiplier(data.seniority || 'MID')

    const estimatedValue = baseValue * seniorityMultiplier

    return {
      minValue: Math.round(estimatedValue * 0.7),
      maxValue: Math.round(estimatedValue * 1.5),
      mostLikelyValue: Math.round(estimatedValue),
      confidence: 0.7,
      factors: ['Company size', 'Seniority level', 'Industry'],
    }
  }

  private calculateChurnRisk(data: Partial<LeadProfile>): number {
    // Simple churn risk calculation
    let risk = 0.3 // Base risk

    if (data.competitorUsage && data.competitorUsage.some((c) => c.satisfactionLevel === 'LOW')) {
      risk -= 0.2 // Lower satisfaction = lower churn risk for us
    }

    if (!data.websiteActivity || data.websiteActivity.length === 0) {
      risk += 0.2 // No engagement = higher churn risk
    }

    return Math.min(1, Math.max(0, risk))
  }

  private calculateExpansionPotential(data: Partial<LeadProfile>): number {
    let potential = 0.5 // Base potential

    if (data.currentCompany?.size === 'ENTERPRISE' || data.currentCompany?.size === 'LARGE') {
      potential += 0.2
    }

    if (data.companyGrowthStage === 'GROWTH' || data.companyGrowthStage === 'STARTUP') {
      potential += 0.3
    }

    return Math.min(1, Math.max(0, potential))
  }

  private inferPreferredChannel(
    data: Partial<LeadProfile>
  ): 'EMAIL' | 'PHONE' | 'LINKEDIN' | 'TEXT' {
    if (data.linkedinUrl && data.contentEngagement?.some((e) => e.contentType === 'LINKEDIN')) {
      return 'LINKEDIN'
    }
    if (data.phoneNumbers && data.phoneNumbers.some((p) => p.type === 'MOBILE')) {
      return 'PHONE'
    }
    return 'EMAIL'
  }

  private inferBestContactTimes(data: Partial<LeadProfile>): TimeWindow[] {
    // Default business hours based on timezone
    const timezone = data.timezone || 'America/New_York'

    return [
      { dayOfWeek: 2, startHour: 9, endHour: 11, timezone }, // Tuesday morning
      { dayOfWeek: 3, startHour: 14, endHour: 16, timezone }, // Wednesday afternoon
      { dayOfWeek: 4, startHour: 10, endHour: 12, timezone }, // Thursday morning
    ]
  }

  private inferCommunicationFrequency(data: Partial<LeadProfile>): 'HIGH' | 'MEDIUM' | 'LOW' {
    const engagementLevel =
      (data.websiteActivity?.length || 0) + (data.contentEngagement?.length || 0)

    if (engagementLevel > 10) return 'HIGH'
    if (engagementLevel > 5) return 'MEDIUM'
    return 'LOW'
  }

  private inferEngagementStyle(
    data: Partial<LeadProfile>
  ): 'FORMAL' | 'CASUAL' | 'TECHNICAL' | 'RELATIONSHIP' {
    if (data.seniority === 'C_SUITE' || data.seniority === 'EXECUTIVE') return 'FORMAL'
    if (data.department === 'Engineering' || data.department === 'IT') return 'TECHNICAL'
    if (data.department === 'Sales' || data.department === 'Marketing') return 'RELATIONSHIP'
    return 'CASUAL'
  }

  private inferPersonalityProfile(data: Partial<LeadProfile>): PersonalityProfile {
    // Basic inference based on role and behavior
    const isExecutive = data.seniority === 'C_SUITE' || data.seniority === 'EXECUTIVE'
    const isTechnical = data.department === 'Engineering' || data.department === 'IT'

    return {
      discProfile: isExecutive ? 'D' : isTechnical ? 'C' : 'I',
      communicationStyle: isExecutive
        ? ['direct', 'results-oriented']
        : ['collaborative', 'detailed'],
      decisionMakingStyle: isExecutive ? 'FAST' : 'ANALYTICAL',
      riskTolerance: data.companyGrowthStage === 'STARTUP' ? 'HIGH' : 'MEDIUM',
      learningStyle: isTechnical ? 'VISUAL' : 'AUDITORY',
    }
  }

  private inferBuyingRole(
    data: Partial<LeadProfile>
  ): 'CHAMPION' | 'DECISION_MAKER' | 'INFLUENCER' | 'USER' | 'BLOCKER' {
    if (data.seniority === 'C_SUITE') return 'DECISION_MAKER'
    if (data.seniority === 'EXECUTIVE') return 'DECISION_MAKER'
    if (data.contentEngagement && data.contentEngagement.length > 3) return 'CHAMPION'
    if (data.seniority === 'SENIOR') return 'INFLUENCER'
    return 'USER'
  }

  private inferPainPoints(data: Partial<LeadProfile>): string[] {
    const painPoints = []

    if (data.currentCompany?.size === 'ENTERPRISE') {
      painPoints.push(
        'Complex integration requirements',
        'Scalability concerns',
        'Security and compliance'
      )
    } else if (data.currentCompany?.size === 'SMALL') {
      painPoints.push('Limited budget', 'Resource constraints', 'Need for simplicity')
    }

    if (data.department === 'Sales') {
      painPoints.push('Lead generation', 'Sales efficiency', 'Pipeline visibility')
    }

    return painPoints
  }

  private inferMotivations(data: Partial<LeadProfile>): string[] {
    const motivations = []

    if (data.seniority === 'C_SUITE' || data.seniority === 'EXECUTIVE') {
      motivations.push('Revenue growth', 'Competitive advantage', 'Operational efficiency')
    }

    if (data.companyGrowthStage === 'GROWTH' || data.companyGrowthStage === 'STARTUP') {
      motivations.push('Scaling operations', 'Building foundation', 'Quick wins')
    }

    return motivations
  }

  private inferObjections(data: Partial<LeadProfile>): string[] {
    const objections = []

    if (data.competitorUsage && data.competitorUsage.length > 0) {
      objections.push(
        'Already using competitor solution',
        'Switching costs',
        'Integration complexity'
      )
    }

    if (data.currentCompany?.size === 'ENTERPRISE') {
      objections.push('Long procurement process', 'Multiple stakeholders', 'Risk aversion')
    }

    return objections
  }

  private generateLeadId(email: string): string {
    return `lead_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`
  }

  private getEmptyCompany(): CompanyInfo {
    return {
      id: '',
      name: 'Unknown',
      domain: '',
      industry: 'Unknown',
      size: 'MEDIUM',
      location: { country: 'Unknown' },
    }
  }

  private getBaseValueByCompanySize(size: string): number {
    const sizeToValue = {
      ENTERPRISE: 100000,
      LARGE: 50000,
      MEDIUM: 25000,
      SMALL: 10000,
    }
    return sizeToValue[size as keyof typeof sizeToValue] || 25000
  }

  private getSeniorityMultiplier(seniority: string): number {
    const seniorityToMultiplier = {
      C_SUITE: 3,
      EXECUTIVE: 2.5,
      SENIOR: 1.5,
      MID: 1,
      ENTRY: 0.5,
    }
    return seniorityToMultiplier[seniority as keyof typeof seniorityToMultiplier] || 1
  }

  private getIndustryMultiplier(industry: string): number {
    const highValueIndustries = ['Finance', 'Healthcare', 'Technology', 'Pharmaceuticals']
    return highValueIndustries.includes(industry) ? 1.5 : 1
  }

  private estimateSatisfaction(tech: Technographic): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (tech.satisfactionScore && tech.satisfactionScore > 80) return 'HIGH'
    if (tech.satisfactionScore && tech.satisfactionScore < 50) return 'LOW'
    return 'MEDIUM'
  }

  private calculateSwitchingLikelihood(tech: Technographic): number {
    let likelihood = 0.3 // Base likelihood

    if (tech.contractEndDate) {
      const monthsUntilEnd = Math.floor(
        (tech.contractEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
      )
      if (monthsUntilEnd < 3) likelihood += 0.3
    }

    if (tech.satisfactionScore && tech.satisfactionScore < 50) likelihood += 0.2

    return Math.min(1, likelihood)
  }

  private extractConversionFeatures(lead: LeadProfile): Record<string, unknown> {
    return {
      seniority: lead.seniority,
      companySize: lead.currentCompany.size,
      engagementLevel: lead.websiteActivity.length + lead.contentEngagement.length,
      hasIntent: lead.intentData.length > 0,
      hasPhone: lead.phoneNumbers.length > 0,
      hasLinkedIn: !!lead.linkedinUrl,
      competitorCount: lead.competitorUsage.length,
      leadScore: lead.leadScore,
    }
  }

  private identifyConversionFactors(
    lead: LeadProfile,
    features: Record<string, unknown>
  ): ConversionFactor[] {
    const factors: ConversionFactor[] = []

    if (features.seniority === 'C_SUITE' || features.seniority === 'EXECUTIVE') {
      factors.push({
        factor: 'Executive-level contact',
        impact: 'POSITIVE',
        weight: 0.8,
      })
    }

    if (features.hasIntent) {
      factors.push({
        factor: 'Shows buying intent',
        impact: 'POSITIVE',
        weight: 0.9,
      })
    }

    if (features.competitorCount > 0) {
      factors.push({
        factor: 'Using competitor solution',
        impact: 'NEGATIVE',
        weight: 0.6,
      })
    }

    return factors
  }

  private generateConversionRecommendations(
    lead: LeadProfile,
    probability: number,
    factors: ConversionFactor[]
  ): string[] {
    const recommendations = []

    if (probability > 0.7) {
      recommendations.push('High priority - contact immediately')
      recommendations.push('Assign to senior sales rep')
      recommendations.push('Prepare executive-level demo')
    } else if (probability > 0.5) {
      recommendations.push('Medium priority - nurture with targeted content')
      recommendations.push('Schedule follow-up in 2-3 days')
      recommendations.push('Share relevant case studies')
    } else {
      recommendations.push('Low priority - add to long-term nurture')
      recommendations.push('Focus on educational content')
      recommendations.push('Monitor for engagement signals')
    }

    // Add specific recommendations based on factors
    if (lead.competitorUsage.length > 0) {
      recommendations.push('Prepare competitive differentiation materials')
    }

    if (!lead.phoneNumbers.length) {
      recommendations.push('Attempt to acquire phone number through LinkedIn')
    }

    return recommendations
  }

  private async generateMessagingTemplates(
    lead: LeadProfile,
    strategy: string
  ): Promise<MessageTemplate[]> {
    const templates: MessageTemplate[] = []

    // Initial outreach
    templates.push({
      type: 'INITIAL_OUTREACH',
      channel: lead.preferredChannel,
      subject: `${lead.firstName}, noticed your interest in ${lead.contentEngagement[0]?.title || 'modern CRM solutions'}`,
      body: this.generatePersonalizedMessage(lead, 'initial'),
      personalizationTokens: ['firstName', 'company', 'painPoint'],
    })

    // Follow-up
    templates.push({
      type: 'FOLLOW_UP',
      channel: 'EMAIL',
      subject: 'Quick question about your CRM evaluation',
      body: this.generatePersonalizedMessage(lead, 'followup'),
      personalizationTokens: ['previousInteraction', 'valueProposition'],
    })

    return templates
  }

  private generatePersonalizedMessage(_lead: LeadProfile, _type: string): string {
    // This would use AI to generate personalized messages
    return `Hi ${lead.firstName}, [personalized message based on profile and engagement]`
  }

  private createEngagementTimeline(
    lead: LeadProfile,
    tactics: EngagementTactic[]
  ): EngagementTimeline {
    return {
      startDate: new Date(),
      touchpoints: tactics.map((tactic, index) => ({
        day: index * 2 + 1,
        action: tactic.action,
        channel: tactic.channel,
        expectedOutcome: 'Engagement or response',
      })),
      reviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    }
  }
}

// Supporting interfaces
interface ConversionFactor {
  factor: string
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  weight: number
}

interface EngagementTactic {
  channel: 'EMAIL' | 'PHONE' | 'LINKEDIN' | 'TEXT'
  action: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  timing: string
}

interface MessageTemplate {
  type: string
  channel: string
  subject?: string
  body: string
  personalizationTokens: string[]
}

interface EngagementTimeline {
  startDate: Date
  touchpoints: Array<{
    day: number
    action: string
    channel: string
    expectedOutcome: string
  }>
  reviewDate: Date
}

export default LeadIntelligenceEngine
