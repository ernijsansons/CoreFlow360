'use client'

/**
 * White-Label Partner Dashboard
 * 
 * Comprehensive management dashboard for white-label partners,
 * including configuration, branding, analytics, and support.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WhiteLabelPartner {
  id: string
  partnerName: string
  partnerSlug: string
  partnerType: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE'
  contactName: string
  contactEmail: string
  contactPhone?: string
  companyWebsite?: string
  businessType?: string
  targetMarket?: string
  
  subscriptionTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  monthlyFee: number
  revenueShare: number
  setupFee: number
  
  isActive: boolean
  launchDate?: Date
  customDomain?: string
  subdomain: string
  sslEnabled: boolean
  
  features: any
  moduleAccess: string[]
  userLimits: any
}

interface PartnerBranding {
  id: string
  partnerId: string
  brandName: string
  logoUrl?: string
  logoUrlDark?: string
  faviconUrl?: string
  brandColors: any
  typography: any
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  customCSS?: string
  fontFamily: string
  borderRadius: string
  shadows: any
  heroTitle?: string
  heroSubtitle?: string
  footerText?: string
  supportEmail?: string
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  socialLinks: any
}

interface PartnerAnalytics {
  id: string
  partnerId: string
  date: Date
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  activeUsers: number
  newUsers: number
  totalSessions: number
  avgSessionDuration: number
  pageViews: number
  newBusinesses: number
  totalBusinesses: number
  revenueGenerated: number
  subscriptionChanges: number
  apiRequests: number
  errorRate: number
  uptime: number
  supportTickets: number
  featureUsage: any
  moduleUsage: any
  partnerRevenue: number
  revenueSharePaid: number
}

interface WhiteLabelPartnerDashboardProps {
  partnerId?: string
  className?: string
}

const WhiteLabelPartnerDashboard: React.FC<WhiteLabelPartnerDashboardProps> = ({
  partnerId = 'demo-partner',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BRANDING' | 'CONFIGURATION' | 'ANALYTICS' | 'SUPPORT'>('OVERVIEW')
  const [partner, setPartner] = useState<WhiteLabelPartner | null>(null)
  const [branding, setBranding] = useState<PartnerBranding | null>(null)
  const [analytics, setAnalytics] = useState<PartnerAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPartnerData()
  }, [partnerId])

  const loadPartnerData = async () => {
    setIsLoading(true)

    // Mock partner data - in production, fetch from API
    const mockPartner: WhiteLabelPartner = {
      id: partnerId,
      partnerName: 'TechFlow Business Solutions',
      partnerSlug: 'techflow-business',
      partnerType: 'PREMIUM',
      contactName: 'Sarah Martinez',
      contactEmail: 'sarah@techflowbiz.com',
      contactPhone: '+1 (555) 123-4567',
      companyWebsite: 'https://techflowbiz.com',
      businessType: 'Software Consulting',
      targetMarket: 'SMB Technology Companies',
      
      subscriptionTier: 'PROFESSIONAL',
      monthlyFee: 299,
      revenueShare: 0.15,
      setupFee: 2500,
      
      isActive: true,
      launchDate: new Date('2024-01-15'),
      customDomain: 'app.techflowbiz.com',
      subdomain: 'techflow',
      sslEnabled: true,
      
      features: {
        customBranding: true,
        apiAccess: true,
        whiteLabel: true,
        customDomain: true,
        analytics: true,
        support: 'PRIORITY'
      },
      moduleAccess: ['CRM', 'PROJECTS', 'ACCOUNTING', 'HR', 'MULTI_BUSINESS'],
      userLimits: {
        maxUsers: 500,
        maxBusinesses: 25,
        storageGB: 100
      }
    }

    const mockBranding: PartnerBranding = {
      id: 'brand-001',
      partnerId,
      brandName: 'TechFlow Business Hub',
      logoUrl: '/assets/partners/techflow/logo.png',
      logoUrlDark: '/assets/partners/techflow/logo-dark.png',
      faviconUrl: '/assets/partners/techflow/favicon.ico',
      brandColors: {
        primary: '#1e40af',
        secondary: '#7c3aed',
        accent: '#059669'
      },
      typography: {
        heading: 'Poppins',
        body: 'Inter'
      },
      primaryColor: '#1e40af',
      secondaryColor: '#7c3aed',
      accentColor: '#059669',
      backgroundColor: '#ffffff',
      surfaceColor: '#f8fafc',
      textColor: '#1e293b',
      customCSS: '/* Custom partner styles */\n.partner-header { border-top: 3px solid #1e40af; }',
      fontFamily: 'Inter',
      borderRadius: '12px',
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      },
      heroTitle: 'Streamline Your Business Operations',
      heroSubtitle: 'The complete platform for modern business management',
      footerText: '© 2024 TechFlow Business Hub. All rights reserved.',
      supportEmail: 'support@techflowbiz.com',
      privacyPolicyUrl: 'https://techflowbiz.com/privacy',
      termsOfServiceUrl: 'https://techflowbiz.com/terms',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/techflow',
        twitter: 'https://twitter.com/techflowbiz',
        website: 'https://techflowbiz.com'
      }
    }

    const mockAnalytics: PartnerAnalytics[] = [
      {
        id: 'analytics-001',
        partnerId,
        date: new Date('2024-03-01'),
        periodType: 'MONTHLY',
        activeUsers: 287,
        newUsers: 45,
        totalSessions: 1456,
        avgSessionDuration: 1847, // seconds
        pageViews: 8934,
        newBusinesses: 12,
        totalBusinesses: 67,
        revenueGenerated: 89500,
        subscriptionChanges: 8,
        apiRequests: 45678,
        errorRate: 0.02,
        uptime: 99.9,
        supportTickets: 23,
        featureUsage: {
          crm: 245,
          projects: 189,
          accounting: 156,
          hr: 98,
          multiBusiness: 67
        },
        moduleUsage: {
          dashboard: 287,
          reports: 189,
          settings: 134,
          integrations: 67
        },
        partnerRevenue: 13425,
        revenueSharePaid: 13425
      }
    ]

    setTimeout(() => {
      setPartner(mockPartner)
      setBranding(mockBranding)
      setAnalytics(mockAnalytics)
      setIsLoading(false)
    }, 1000)
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
  }

  const getPartnerTypeColor = (type: string) => {
    switch (type) {
      case 'ENTERPRISE': return 'text-purple-400 bg-purple-500/20'
      case 'PREMIUM': return 'text-cyan-400 bg-cyan-500/20'
      case 'STANDARD': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading partner dashboard...</div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🏢 White-Label Partner Dashboard</h1>
            <p className="text-gray-400">{partner.partnerName} • {partner.partnerSlug}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getPartnerTypeColor(partner.partnerType)}`}>
              {partner.partnerType}
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(partner.isActive)}`}>
              {partner.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">
              {analytics.length > 0 ? analytics[0].activeUsers : 0}
            </div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {analytics.length > 0 ? analytics[0].totalBusinesses : 0}
            </div>
            <div className="text-sm text-gray-400">Total Businesses</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">
              {analytics.length > 0 ? formatCurrency(analytics[0].revenueGenerated) : '$0'}
            </div>
            <div className="text-sm text-gray-400">Revenue Generated</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {analytics.length > 0 ? analytics[0].uptime.toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6">
          {[
            { key: 'OVERVIEW', label: 'Overview', icon: '📊' },
            { key: 'BRANDING', label: 'Branding', icon: '🎨' },
            { key: 'CONFIGURATION', label: 'Configuration', icon: '⚙️' },
            { key: 'ANALYTICS', label: 'Analytics', icon: '📈' },
            { key: 'SUPPORT', label: 'Support', icon: '🎧' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Partner Details */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📋 Partner Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contact Name</label>
                  <div className="text-white">{partner.contactName}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
                  <div className="text-white">{partner.contactEmail}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <div className="text-white">{partner.contactPhone || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Website</label>
                  <div className="text-cyan-400">
                    {partner.companyWebsite ? (
                      <a href={partner.companyWebsite} target="_blank" rel="noopener noreferrer">
                        {partner.companyWebsite}
                      </a>
                    ) : 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Business Type</label>
                  <div className="text-white">{partner.businessType || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Market</label>
                  <div className="text-white">{partner.targetMarket || 'Not specified'}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-600">
                <label className="block text-sm text-gray-400 mb-1">Launch Date</label>
                <div className="text-white">
                  {partner.launchDate ? partner.launchDate.toLocaleDateString() : 'Not launched'}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Billing */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">💰 Subscription & Billing</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subscription Tier</label>
                  <div className="text-cyan-400 font-medium">{partner.subscriptionTier}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Fee</label>
                  <div className="text-green-400 font-medium">{formatCurrency(partner.monthlyFee)}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Revenue Share</label>
                  <div className="text-purple-400 font-medium">{formatPercentage(partner.revenueShare)}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Setup Fee</label>
                  <div className="text-yellow-400 font-medium">{formatCurrency(partner.setupFee)}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-600">
                <label className="block text-sm text-gray-400 mb-2">Revenue This Month</label>
                <div className="text-2xl font-bold text-green-400">
                  {analytics.length > 0 ? formatCurrency(analytics[0].partnerRevenue) : '$0'}
                </div>
                <div className="text-sm text-gray-400">
                  Revenue share paid: {analytics.length > 0 ? formatCurrency(analytics[0].revenueSharePaid) : '$0'}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Configuration */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">🔧 Platform Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subdomain</label>
                <div className="text-cyan-400">{partner.subdomain}.coreflow360.com</div>
              </div>
              
              {partner.customDomain && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Custom Domain</label>
                  <div className="text-cyan-400">{partner.customDomain}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SSL Status</label>
                  <div className={`font-medium ${partner.sslEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {partner.sslEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Users</label>
                  <div className="text-white">{partner.userLimits.maxUsers}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Module Access</label>
                <div className="flex flex-wrap gap-2">
                  {partner.moduleAccess.map((module) => (
                    <span key={module} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">⚡ Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500">
                🎨 Customize Branding
              </button>
              <button className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600">
                📊 View Analytics
              </button>
              <button className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600">
                🔧 Configure Settings
              </button>
              <button className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600">
                🎧 Contact Support
              </button>
              <button className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600">
                🔑 Manage API Keys
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-600">
              <div className="text-sm text-gray-400 mb-2">Platform Health</div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-400 text-sm">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'BRANDING' && branding && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Brand Identity */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🎨 Brand Identity</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Brand Name</label>
                  <input
                    type="text"
                    value={branding.brandName}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={branding.logoUrl || ''}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="https://example.com/logo.png"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={branding.heroTitle || ''}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hero Subtitle</label>
                  <textarea
                    value={branding.heroSubtitle || ''}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🌈 Color Scheme</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Primary Color', value: branding.primaryColor, key: 'primaryColor' },
                  { label: 'Secondary Color', value: branding.secondaryColor, key: 'secondaryColor' },
                  { label: 'Accent Color', value: branding.accentColor, key: 'accentColor' },
                  { label: 'Background Color', value: branding.backgroundColor, key: 'backgroundColor' }
                ].map((color) => (
                  <div key={color.key} className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: color.value }}
                    ></div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400">{color.label}</label>
                      <div className="text-white font-mono text-sm">{color.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-2">Font Family</label>
                <div className="text-white">{branding.fontFamily}</div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Border Radius</label>
                <div className="text-white">{branding.borderRadius}</div>
              </div>
            </div>

            {/* Custom CSS */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4">💻 Custom CSS</h3>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {branding.customCSS || '/* No custom CSS defined */'}
                </pre>
              </div>

              <div className="mt-4 flex space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                  Edit CSS
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500">
                  Preview Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'CONFIGURATION' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Feature Flags */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🚩 Feature Flags</h3>
              
              <div className="space-y-3">
                {Object.entries(partner.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-white capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                    <div className={`px-3 py-1 rounded text-sm ${
                      enabled === true ? 'bg-green-500/20 text-green-400' :
                      enabled === false ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {enabled === true ? 'Enabled' : enabled === false ? 'Disabled' : String(enabled)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Limits */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">👥 User Limits</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Max Users</span>
                    <span className="text-white">{partner.userLimits.maxUsers}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${(analytics[0]?.activeUsers || 0) / partner.userLimits.maxUsers * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Current: {analytics[0]?.activeUsers || 0} users
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Max Businesses</span>
                    <span className="text-white">{partner.userLimits.maxBusinesses}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(analytics[0]?.totalBusinesses || 0) / partner.userLimits.maxBusinesses * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Current: {analytics[0]?.totalBusinesses || 0} businesses
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Storage Limit</span>
                    <span className="text-white">{partner.userLimits.storageGB} GB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Used: {Math.round(partner.userLimits.storageGB * 0.45)} GB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'ANALYTICS' && analytics.length > 0 && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Usage Metrics */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">👥 Usage Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{analytics[0].activeUsers}</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                  <div className="text-xs text-green-400">+{analytics[0].newUsers} new this month</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-purple-400">{analytics[0].totalSessions.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Sessions</div>
                  <div className="text-xs text-gray-400">
                    Avg: {Math.round(analytics[0].avgSessionDuration / 60)} min duration
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{analytics[0].pageViews.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Page Views</div>
                </div>
              </div>
            </div>

            {/* Business Metrics */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🏢 Business Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">{analytics[0].totalBusinesses}</div>
                  <div className="text-sm text-gray-400">Total Businesses</div>
                  <div className="text-xs text-green-400">+{analytics[0].newBusinesses} new this month</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{formatCurrency(analytics[0].revenueGenerated)}</div>
                  <div className="text-sm text-gray-400">Revenue Generated</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-purple-400">{analytics[0].subscriptionChanges}</div>
                  <div className="text-sm text-gray-400">Subscription Changes</div>
                </div>
              </div>
            </div>

            {/* Technical Metrics */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">⚙️ Technical Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">{analytics[0].uptime}%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-blue-400">{analytics[0].apiRequests.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">API Requests</div>
                  <div className="text-xs text-red-400">{(analytics[0].errorRate * 100).toFixed(2)}% error rate</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-orange-400">{analytics[0].supportTickets}</div>
                  <div className="text-sm text-gray-400">Support Tickets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Usage Chart */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📊 Feature Usage</h3>
            
            <div className="grid gap-4 md:grid-cols-5">
              {Object.entries(analytics[0].featureUsage).map(([feature, usage]) => (
                <div key={feature} className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{usage as number}</div>
                  <div className="text-sm text-gray-400 capitalize">{feature}</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, ((usage as number) / analytics[0].activeUsers) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'SUPPORT' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Support Overview */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">🎧 Support Overview</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Support Level</div>
                    <div className="text-sm text-gray-400">{partner.features.support || 'Standard'}</div>
                  </div>
                  <div className="text-cyan-400 font-medium">Priority</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Open Tickets</div>
                    <div className="text-sm text-gray-400">This month</div>
                  </div>
                  <div className="text-yellow-400 font-medium">{analytics[0]?.supportTickets || 0}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Response Time</div>
                    <div className="text-sm text-gray-400">Average</div>
                  </div>
                  <div className="text-green-400 font-medium">2.4 hours</div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">📞 Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Support Email</label>
                  <div className="text-cyan-400">{branding?.supportEmail || 'support@coreflow360.com'}</div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Partner Contact</label>
                  <div className="text-white">{partner.contactName}</div>
                  <div className="text-cyan-400">{partner.contactEmail}</div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Support</label>
                  <div className="text-white">{partner.contactPhone || 'Available on request'}</div>
                </div>

                <div className="pt-4 border-t border-gray-600">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500">
                    Create Support Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* API Documentation */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white mb-4">🔑 API & Documentation</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-medium text-white mb-2">API Documentation</h4>
                <p className="text-sm text-gray-400 mb-3">Complete API reference and integration guides</p>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                  View Docs →
                </button>
              </div>

              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-medium text-white mb-2">SDK & Libraries</h4>
                <p className="text-sm text-gray-400 mb-3">Official SDKs for popular programming languages</p>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                  Download SDKs →
                </button>
              </div>

              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-medium text-white mb-2">Integration Examples</h4>
                <p className="text-sm text-gray-400 mb-3">Sample code and implementation examples</p>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                  View Examples →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white">Loading partner dashboard...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhiteLabelPartnerDashboard