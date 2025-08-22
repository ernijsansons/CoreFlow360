import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreatePartnerSchema = z.object({
  partnerName: z.string().min(2).max(100),
  partnerSlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  partnerType: z.enum(['STANDARD', 'PREMIUM', 'ENTERPRISE']).default('STANDARD'),
  contactName: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  companyWebsite: z.string().url().optional(),
  businessType: z.string().optional(),
  targetMarket: z.string().optional(),
  subscriptionTier: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).default('STARTER'),
  monthlyFee: z.number().min(0).default(0),
  revenueShare: z.number().min(0).max(1).default(0.15),
  setupFee: z.number().min(0).default(0),
  customDomain: z.string().optional(),
  subdomain: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  features: z.record(z.boolean()).optional().default({}),
  moduleAccess: z.array(z.string()).optional().default([]),
  userLimits: z.record(z.number()).optional().default({})
})

const UpdatePartnerSchema = CreatePartnerSchema.partial()

const PartnerQuerySchema = z.object({
  partnerType: z.enum(['STANDARD', 'PREMIUM', 'ENTERPRISE']).optional(),
  subscriptionTier: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreatePartnerSchema.parse(body)

    // Check if subdomain is already taken
    const existingPartner = await checkSubdomainAvailability(validatedData.subdomain)
    if (existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Subdomain is already taken' },
        { status: 400 }
      )
    }

    // Create partner
    const partner = await createWhiteLabelPartner(validatedData)

    // Initialize default branding
    await createDefaultBranding(partner.id)

    // Create initial configuration
    await createDefaultConfiguration(partner.id)

    // Generate API keys
    const apiKeys = await generatePartnerAPIKeys(partner.id)

    return NextResponse.json({
      success: true,
      data: {
        partner,
        apiKeys,
        setupInstructions: generateSetupInstructions(partner)
      },
      message: 'White-label partner created successfully'
    })

  } catch (error) {
    console.error('Create partner error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid partner data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      partnerType: searchParams.get('partnerType') || undefined,
      subscriptionTier: searchParams.get('subscriptionTier') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    }

    const validatedQuery = PartnerQuerySchema.parse(queryParams)

    // Mock partners - in production, fetch from database
    const mockPartners = getMockPartners()
    
    // Apply filters
    let filteredPartners = mockPartners
    
    if (validatedQuery.partnerType) {
      filteredPartners = filteredPartners.filter(p => p.partnerType === validatedQuery.partnerType)
    }
    
    if (validatedQuery.subscriptionTier) {
      filteredPartners = filteredPartners.filter(p => p.subscriptionTier === validatedQuery.subscriptionTier)
    }
    
    if (validatedQuery.isActive !== undefined) {
      filteredPartners = filteredPartners.filter(p => p.isActive === validatedQuery.isActive)
    }
    
    if (validatedQuery.search) {
      const searchLower = validatedQuery.search.toLowerCase()
      filteredPartners = filteredPartners.filter(p => 
        p.partnerName.toLowerCase().includes(searchLower) ||
        p.contactName.toLowerCase().includes(searchLower) ||
        p.contactEmail.toLowerCase().includes(searchLower)
      )
    }

    // Apply pagination
    const total = filteredPartners.length
    const paginatedPartners = filteredPartners.slice(
      validatedQuery.offset,
      validatedQuery.offset + validatedQuery.limit
    )

    // Calculate analytics
    const analytics = calculatePartnerAnalytics(filteredPartners)

    return NextResponse.json({
      success: true,
      data: {
        partners: paginatedPartners,
        pagination: {
          total,
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          hasMore: validatedQuery.offset + validatedQuery.limit < total
        },
        analytics
      }
    })

  } catch (error) {
    console.error('Get partners error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

async function checkSubdomainAvailability(subdomain: string) {
  // In production, check database for existing subdomain
  const reservedSubdomains = ['www', 'api', 'admin', 'app', 'portal', 'dashboard', 'help', 'support']
  return reservedSubdomains.includes(subdomain.toLowerCase())
}

async function createWhiteLabelPartner(data: z.infer<typeof CreatePartnerSchema>) {
  // In production, save to database
  const partnerId = `partner-${Date.now()}`
  
  const partner = {
    id: partnerId,
    partnerName: data.partnerName,
    partnerSlug: data.partnerSlug,
    partnerType: data.partnerType,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    companyWebsite: data.companyWebsite,
    businessType: data.businessType,
    targetMarket: data.targetMarket,
    subscriptionTier: data.subscriptionTier,
    monthlyFee: data.monthlyFee,
    revenueShare: data.revenueShare,
    setupFee: data.setupFee,
    isActive: true,
    launchDate: null,
    customDomain: data.customDomain,
    subdomain: data.subdomain,
    sslEnabled: true,
    features: data.features,
    moduleAccess: data.moduleAccess,
    userLimits: data.userLimits,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return partner
}

async function createDefaultBranding(partnerId: string) {
  // Create default branding configuration
  const branding = {
    id: `branding-${partnerId}`,
    partnerId,
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter, sans-serif',
    logoUrl: null,
    faviconUrl: null,
    customCSS: '',
    emailTemplate: 'default',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return branding
}

async function createDefaultConfiguration(partnerId: string) {
  // Create default partner configuration
  const configuration = {
    id: `config-${partnerId}`,
    partnerId,
    configType: 'GENERAL',
    configKey: 'default_settings',
    configValue: {
      timeZone: 'UTC',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      features: {
        multiTenant: true,
        customReports: false,
        apiAccess: true,
        whiteLabeling: true
      }
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return configuration
}

async function generatePartnerAPIKeys(partnerId: string) {
  // Generate API keys for partner
  const keys = [
    {
      id: `key-${partnerId}-public`,
      partnerId,
      keyName: 'Public API Key',
      keyType: 'PUBLIC',
      apiKey: `pk_${generateRandomKey(32)}`,
      permissions: ['read:public', 'read:users', 'read:organizations'],
      rateLimit: 1000,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: `key-${partnerId}-private`,
      partnerId,
      keyName: 'Private API Key',
      keyType: 'PRIVATE',
      apiKey: `sk_${generateRandomKey(32)}`,
      permissions: ['read:all', 'write:all', 'admin:partner'],
      rateLimit: 10000,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  return keys
}

function generateRandomKey(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateSetupInstructions(partner: any) {
  return {
    steps: [
      {
        step: 1,
        title: 'Domain Configuration',
        description: 'Configure your custom domain or use the provided subdomain',
        details: {
          subdomain: `https://${partner.subdomain}.coreflow360.com`,
          customDomain: partner.customDomain || 'Not configured',
          sslEnabled: partner.sslEnabled
        }
      },
      {
        step: 2,
        title: 'Branding Setup',
        description: 'Customize colors, logos, and styling to match your brand',
        actions: ['Upload logo', 'Set brand colors', 'Configure custom CSS']
      },
      {
        step: 3,
        title: 'Feature Configuration',
        description: 'Enable and configure features for your platform',
        features: partner.moduleAccess
      },
      {
        step: 4,
        title: 'API Integration',
        description: 'Integrate with your systems using the provided API keys',
        documentation: '/api/docs/white-label'
      },
      {
        step: 5,
        title: 'Testing & Launch',
        description: 'Test your white-label platform and schedule launch',
        checklist: [
          'Test user registration and login',
          'Verify branding appears correctly',
          'Test core functionality',
          'Configure support settings',
          'Schedule launch date'
        ]
      }
    ],
    estimatedSetupTime: '2-4 weeks',
    supportContact: 'white-label@coreflow360.com'
  }
}

function getMockPartners() {
  return [
    {
      id: 'partner-001',
      partnerName: 'TechFlow Solutions',
      partnerSlug: 'techflow',
      partnerType: 'PREMIUM',
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah@techflow.com',
      contactPhone: '+1-555-0123',
      companyWebsite: 'https://techflow.com',
      businessType: 'Technology Consulting',
      targetMarket: 'Small to Medium Tech Companies',
      subscriptionTier: 'PROFESSIONAL',
      monthlyFee: 2500,
      revenueShare: 0.12,
      setupFee: 5000,
      isActive: true,
      launchDate: new Date('2024-03-15'),
      customDomain: 'platform.techflow.com',
      subdomain: 'techflow',
      sslEnabled: true,
      features: {
        customReports: true,
        apiAccess: true,
        whiteLabeling: true,
        advancedAnalytics: true
      },
      moduleAccess: ['CRM', 'PROJECT_MANAGEMENT', 'ANALYTICS', 'REPORTING'],
      userLimits: { maxUsers: 500, maxOrganizations: 100 },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'partner-002',
      partnerName: 'Business Pro Suite',
      partnerSlug: 'bizpro',
      partnerType: 'ENTERPRISE',
      contactName: 'Michael Chen',
      contactEmail: 'michael@bizpro.com',
      contactPhone: '+1-555-0456',
      companyWebsite: 'https://bizpro.com',
      businessType: 'Business Management Software',
      targetMarket: 'Enterprise Clients',
      subscriptionTier: 'ENTERPRISE',
      monthlyFee: 8500,
      revenueShare: 0.08,
      setupFee: 15000,
      isActive: true,
      launchDate: new Date('2024-01-10'),
      customDomain: 'app.bizpro.com',
      subdomain: 'bizpro',
      sslEnabled: true,
      features: {
        customReports: true,
        apiAccess: true,
        whiteLabeling: true,
        advancedAnalytics: true,
        enterpriseSupport: true,
        customIntegrations: true
      },
      moduleAccess: ['ALL'],
      userLimits: { maxUsers: 10000, maxOrganizations: 1000 },
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-05')
    },
    {
      id: 'partner-003',
      partnerName: 'StartupLaunch',
      partnerSlug: 'startupla',
      partnerType: 'STANDARD',
      contactName: 'Emma Rodriguez',
      contactEmail: 'emma@startupla.com',
      businessType: 'Startup Accelerator',
      targetMarket: 'Early-stage Startups',
      subscriptionTier: 'STARTER',
      monthlyFee: 750,
      revenueShare: 0.18,
      setupFee: 1500,
      isActive: true,
      launchDate: null,
      customDomain: null,
      subdomain: 'startupla',
      sslEnabled: true,
      features: {
        customReports: false,
        apiAccess: true,
        whiteLabeling: true,
        advancedAnalytics: false
      },
      moduleAccess: ['CRM', 'PROJECT_MANAGEMENT', 'BASIC_ANALYTICS'],
      userLimits: { maxUsers: 100, maxOrganizations: 25 },
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20')
    }
  ]
}

function calculatePartnerAnalytics(partners: any[]) {
  const total = partners.length
  
  const typeDistribution = {
    STANDARD: partners.filter(p => p.partnerType === 'STANDARD').length,
    PREMIUM: partners.filter(p => p.partnerType === 'PREMIUM').length,
    ENTERPRISE: partners.filter(p => p.partnerType === 'ENTERPRISE').length
  }
  
  const tierDistribution = {
    STARTER: partners.filter(p => p.subscriptionTier === 'STARTER').length,
    PROFESSIONAL: partners.filter(p => p.subscriptionTier === 'PROFESSIONAL').length,
    ENTERPRISE: partners.filter(p => p.subscriptionTier === 'ENTERPRISE').length
  }
  
  const activePartners = partners.filter(p => p.isActive).length
  const launchedPartners = partners.filter(p => p.launchDate).length
  
  const totalMonthlyRevenue = partners
    .filter(p => p.isActive)
    .reduce((sum, p) => sum + p.monthlyFee, 0)
  
  const avgRevenueShare = total > 0 ? 
    partners.reduce((sum, p) => sum + p.revenueShare, 0) / total : 0
    
  const avgSetupFee = total > 0 ?
    partners.reduce((sum, p) => sum + p.setupFee, 0) / total : 0

  return {
    totalPartners: total,
    activePartners,
    launchedPartners,
    inSetupPartners: activePartners - launchedPartners,
    typeDistribution,
    tierDistribution,
    totalMonthlyRevenue,
    averageRevenueShare: Math.round(avgRevenueShare * 100) / 100,
    averageSetupFee: Math.round(avgSetupFee),
    customDomainPartners: partners.filter(p => p.customDomain).length,
    enterpriseFeaturesPartners: partners.filter(p => 
      p.features?.enterpriseSupport || p.features?.customIntegrations
    ).length
  }
}