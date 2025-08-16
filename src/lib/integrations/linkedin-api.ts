/**
 * CoreFlow360 - LinkedIn Sales Navigator API Integration
 * Enterprise-grade LinkedIn integration for social selling and prospecting
 */

import { encrypt, decrypt } from '@/lib/encryption/field-encryption'

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline: string
  profileUrl: string
  publicProfileUrl: string
  location: string
  industry: string
  connections: number
  profilePictureUrl?: string
  summary?: string
  experience: LinkedInExperience[]
  education: LinkedInEducation[]
  skills: string[]
  companyId?: string
  companyName?: string
  companyUrl?: string
  salesNavigatorUrl?: string
}

export interface LinkedInExperience {
  id: string
  title: string
  companyName: string
  companyId?: string
  location?: string
  startDate: string
  endDate?: string
  description?: string
  current: boolean
}

export interface LinkedInEducation {
  id: string
  school: string
  degree?: string
  fieldOfStudy?: string
  startYear?: number
  endYear?: number
}

export interface LinkedInCompany {
  id: string
  name: string
  universalName: string
  description?: string
  website?: string
  industry: string
  size: string
  headquarters: string
  type: string
  founded?: number
  specialties: string[]
  logoUrl?: string
  coverImageUrl?: string
  followerCount: number
  employeeCount: number
  locations: LinkedInLocation[]
  recentUpdates: LinkedInUpdate[]
}

export interface LinkedInLocation {
  country: string
  city: string
  address?: string
  postalCode?: string
}

export interface LinkedInUpdate {
  id: string
  text: string
  publishedAt: string
  type: 'ARTICLE' | 'POST' | 'JOB_POSTING' | 'COMPANY_UPDATE'
  engagement: {
    likes: number
    comments: number
    shares: number
  }
}

export interface LinkedInMessage {
  id: string
  conversationId: string
  from: string
  to: string[]
  subject?: string
  body: string
  sentAt: string
  readAt?: string
  messageType: 'INMAIL' | 'CONNECTION_REQUEST' | 'MESSAGE'
}

export interface LinkedInSearchFilters {
  keywords?: string
  location?: string
  industry?: string[]
  company?: string
  title?: string
  connectionLevel?: '1' | '2' | '3+'
  pastCompany?: string
  school?: string
  profileLanguage?: string
  serviceCategory?: string
  network?: string
  yearsExperience?: string
  functionArea?: string
  seniorityLevel?: string
  companySize?: string
  fortune?: '500' | '1000'
  recentlyJoined?: boolean
  currentlyAt?: string
  spotlightCompany?: boolean
}

export interface LinkedInSalesInsight {
  profileId: string
  companyId: string
  connectionPath: LinkedInProfile[]
  mutualConnections: LinkedInProfile[]
  recentActivity: LinkedInActivity[]
  jobChangeAlert?: {
    previousCompany: string
    newCompany: string
    changeDate: string
    changeType: 'PROMOTION' | 'NEW_ROLE' | 'NEW_COMPANY'
  }
  buyingSignals: {
    signal: string
    strength: 'LOW' | 'MEDIUM' | 'HIGH'
    source: string
    detectedAt: string
  }[]
  socialSellingIndex: {
    score: number
    rank: string
    industryAverage: number
    recommendations: string[]
  }
}

export interface LinkedInActivity {
  id: string
  type: 'POST' | 'LIKE' | 'COMMENT' | 'SHARE' | 'ARTICLE' | 'JOB_CHANGE'
  content: string
  publishedAt: string
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
}

export class LinkedInAPI {
  private accessToken: string
  private clientId: string
  private clientSecret: string
  private baseUrl = 'https://api.linkedin.com/v2'
  private salesNavigatorUrl = 'https://api.linkedin.com/sales/v2'

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || ''
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || ''
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN || ''
  }

  /**
   * Initialize OAuth flow for LinkedIn integration
   */
  generateAuthUrl(state: string, scopes: string[] = []): string {
    const defaultScopes = [
      'r_liteprofile',
      'r_emailaddress',
      'w_member_social',
      'r_organization_social',
      'rw_organization_admin'
    ]
    
    const allScopes = [...defaultScopes, ...scopes]
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/linkedin/callback`
    
    return `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent(allScopes.join(' '))}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string
    expires_in: number
    refresh_token?: string
  }> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/linkedin/callback`
      })
    })

    if (!response.ok) {
      throw new Error(`LinkedIn OAuth error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token
  }

  /**
   * Get authenticated user's LinkedIn profile
   */
  async getMyProfile(): Promise<LinkedInProfile> {
    const response = await this.makeRequest('/people/~')
    
    return {
      id: response.id,
      firstName: response.localizedFirstName || response.firstName?.localized?.en_US,
      lastName: response.localizedLastName || response.lastName?.localized?.en_US,
      headline: response.localizedHeadline || response.headline?.localized?.en_US,
      profileUrl: response.publicProfileUrl,
      publicProfileUrl: response.publicProfileUrl,
      location: response.locationName,
      industry: response.industryName,
      connections: 0, // Would need separate API call
      profilePictureUrl: response.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
      experience: [],
      education: [],
      skills: [],
      companyName: response.positions?.values?.[0]?.company?.name,
      salesNavigatorUrl: `https://www.linkedin.com/sales/people/${response.id}`
    }
  }

  /**
   * Search for LinkedIn profiles with advanced filters
   */
  async searchProfiles(
    filters: LinkedInSearchFilters,
    limit = 25,
    offset = 0
  ): Promise<{
    profiles: LinkedInProfile[]
    total: number
    hasMore: boolean
  }> {
    // This would integrate with LinkedIn Sales Navigator API
    // For demo purposes, we'll return mock data
    const mockProfiles: LinkedInProfile[] = [
      {
        id: 'linkedin-123',
        firstName: 'John',
        lastName: 'Smith',
        headline: 'VP of Sales at TechCorp | B2B SaaS Expert',
        profileUrl: 'https://linkedin.com/in/johnsmith',
        publicProfileUrl: 'https://linkedin.com/in/johnsmith',
        location: 'San Francisco, CA',
        industry: 'Technology',
        connections: 500,
        experience: [
          {
            id: 'exp-1',
            title: 'VP of Sales',
            companyName: 'TechCorp',
            current: true,
            startDate: '2022-01-01'
          }
        ],
        education: [],
        skills: ['Sales', 'B2B', 'SaaS', 'Leadership'],
        companyName: 'TechCorp',
        salesNavigatorUrl: 'https://www.linkedin.com/sales/people/linkedin-123'
      }
    ]

    return {
      profiles: mockProfiles,
      total: 1,
      hasMore: false
    }
  }

  /**
   * Get detailed profile information including experience and education
   */
  async getProfileDetails(profileId: string): Promise<LinkedInProfile> {
    try {
      const [profile, experience, education] = await Promise.all([
        this.makeRequest(`/people/${profileId}`),
        this.makeRequest(`/people/${profileId}/positions`),
        this.makeRequest(`/people/${profileId}/educations`)
      ])

      return {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        headline: profile.localizedHeadline,
        profileUrl: profile.publicProfileUrl,
        publicProfileUrl: profile.publicProfileUrl,
        location: profile.locationName,
        industry: profile.industryName,
        connections: 0,
        summary: profile.summary?.localized?.en_US,
        experience: experience.values?.map((exp: any) => ({
          id: exp.id,
          title: exp.title?.localized?.en_US,
          companyName: exp.company?.name,
          companyId: exp.company?.id,
          location: exp.locationName,
          startDate: `${exp.startDate?.year}-${exp.startDate?.month}-01`,
          endDate: exp.endDate ? `${exp.endDate?.year}-${exp.endDate?.month}-01` : undefined,
          description: exp.description?.localized?.en_US,
          current: !exp.endDate
        })) || [],
        education: education.values?.map((edu: any) => ({
          id: edu.id,
          school: edu.schoolName,
          degree: edu.degreeName,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: edu.startDate?.year,
          endYear: edu.endDate?.year
        })) || [],
        skills: [],
        salesNavigatorUrl: `https://www.linkedin.com/sales/people/${profileId}`
      }
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error)
      throw new Error('Failed to fetch LinkedIn profile details')
    }
  }

  /**
   * Get company information
   */
  async getCompany(companyId: string): Promise<LinkedInCompany> {
    const response = await this.makeRequest(`/companies/${companyId}`)
    
    return {
      id: response.id,
      name: response.localizedName,
      universalName: response.universalName,
      description: response.localizedDescription,
      website: response.websiteUrl,
      industry: response.industries?.[0]?.localized?.en_US,
      size: response.companyType?.localized?.en_US,
      headquarters: response.locations?.[0]?.address?.city,
      type: response.companyType?.localized?.en_US,
      founded: response.foundedOn?.year,
      specialties: response.specialties || [],
      logoUrl: response.logo?.original,
      followerCount: response.followersCount || 0,
      employeeCount: response.staffCount || 0,
      locations: response.locations?.map((loc: any) => ({
        country: loc.address?.country,
        city: loc.address?.city,
        address: loc.address?.line1,
        postalCode: loc.address?.postalCode
      })) || [],
      recentUpdates: []
    }
  }

  /**
   * Send connection request with personalized message
   */
  async sendConnectionRequest(
    profileId: string, 
    message: string,
    trackingId?: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await this.makeRequest('/people/~/mailbox', 'POST', {
        recipients: {
          values: [{
            person: `urn:li:person:${profileId}`
          }]
        },
        subject: 'Connection Request',
        body: message
      })

      return {
        success: true,
        messageId: response.value
      }
    } catch (error) {
      console.error('Error sending connection request:', error)
      return { success: false }
    }
  }

  /**
   * Send message to LinkedIn connection
   */
  async sendMessage(
    profileId: string,
    subject: string,
    message: string,
    messageType: 'MESSAGE' | 'INMAIL' = 'MESSAGE'
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await this.makeRequest('/messaging/conversations', 'POST', {
        recipients: [`urn:li:person:${profileId}`],
        subject,
        body: message
      })

      return {
        success: true,
        messageId: response.value
      }
    } catch (error) {
      console.error('Error sending LinkedIn message:', error)
      return { success: false }
    }
  }

  /**
   * Get Sales Navigator insights for a profile
   */
  async getSalesInsights(profileId: string): Promise<LinkedInSalesInsight> {
    // This would integrate with LinkedIn Sales Navigator API
    // For demo purposes, return mock data
    return {
      profileId,
      companyId: 'company-123',
      connectionPath: [],
      mutualConnections: [],
      recentActivity: [
        {
          id: 'activity-1',
          type: 'POST',
          content: 'Excited to announce our new product launch!',
          publishedAt: new Date().toISOString(),
          engagement: { likes: 45, comments: 12, shares: 8 }
        }
      ],
      jobChangeAlert: {
        previousCompany: 'OldCorp',
        newCompany: 'TechCorp',
        changeDate: new Date().toISOString(),
        changeType: 'NEW_ROLE'
      },
      buyingSignals: [
        {
          signal: 'Posted about scaling challenges',
          strength: 'HIGH',
          source: 'LinkedIn Post',
          detectedAt: new Date().toISOString()
        }
      ],
      socialSellingIndex: {
        score: 78,
        rank: 'Top 10%',
        industryAverage: 65,
        recommendations: [
          'Share more industry insights',
          'Engage with prospects\' content',
          'Expand your network in target accounts'
        ]
      }
    }
  }

  /**
   * Track profile activities and updates
   */
  async getProfileActivity(
    profileId: string, 
    days = 30
  ): Promise<LinkedInActivity[]> {
    // This would track real LinkedIn activity
    // For demo, return mock activities
    return [
      {
        id: 'act-1',
        type: 'POST',
        content: 'Great insights on B2B sales trends in 2024',
        publishedAt: new Date().toISOString(),
        engagement: { likes: 23, comments: 5, shares: 3 }
      },
      {
        id: 'act-2',
        type: 'JOB_CHANGE',
        content: 'Started new position as VP of Sales at TechCorp',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  /**
   * Get social selling recommendations
   */
  async getSocialSellingRecommendations(profileId?: string): Promise<{
    score: number
    recommendations: Array<{
      category: 'BRAND' | 'NETWORK' | 'INSIGHTS' | 'RELATIONSHIPS'
      title: string
      description: string
      impact: 'HIGH' | 'MEDIUM' | 'LOW'
      actionUrl?: string
    }>
  }> {
    return {
      score: 78,
      recommendations: [
        {
          category: 'BRAND',
          title: 'Optimize your LinkedIn headline',
          description: 'Your headline could better showcase your value proposition',
          impact: 'HIGH'
        },
        {
          category: 'INSIGHTS',
          title: 'Share industry insights weekly',
          description: 'Regular content sharing increases visibility by 400%',
          impact: 'HIGH'
        },
        {
          category: 'NETWORK',
          title: 'Connect with decision makers',
          description: '15 target prospects in your ICP are 2nd degree connections',
          impact: 'MEDIUM'
        }
      ]
    }
  }

  /**
   * Bulk operations for lead lists
   */
  async bulkEnrichProfiles(profileIds: string[]): Promise<{
    enriched: LinkedInProfile[]
    failed: string[]
  }> {
    const enriched: LinkedInProfile[] = []
    const failed: string[] = []

    for (const profileId of profileIds) {
      try {
        const profile = await this.getProfileDetails(profileId)
        enriched.push(profile)
      } catch (error) {
        failed.push(profileId)
      }
    }

    return { enriched, failed }
  }

  /**
   * Private helper to make authenticated requests
   */
  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202401'
      }
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LinkedIn API error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  /**
   * Handle rate limiting and retry logic
   */
  private async makeRequestWithRetry(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    retries = 3
  ): Promise<any> {
    try {
      return await this.makeRequest(endpoint, method, data)
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.message.includes('429')) {
        // Rate limited, wait and retry
        await new Promise(resolve => setTimeout(resolve, 60000)) // Wait 1 minute
        return this.makeRequestWithRetry(endpoint, method, data, retries - 1)
      }
      throw error
    }
  }
}

export default LinkedInAPI