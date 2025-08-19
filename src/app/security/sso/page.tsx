/**
 * CoreFlow360 - Single Sign-On Configuration
 * Enterprise SSO setup and management
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// Build-time check to prevent prerendering issues
const isBuildTime = () => {
  return typeof window === 'undefined' && process.env.NODE_ENV === 'production'
}
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminGate } from '@/components/auth/PermissionGate'
import {
  Shield,
  Globe,
  Key,
  Building,
  Users,
  Check,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Copy,
  ExternalLink,
  Download,
  Upload,
  Settings,
  Zap,
} from 'lucide-react'

const SSO_PROVIDERS = [
  {
    id: 'saml',
    name: 'SAML 2.0',
    description: 'Enterprise identity providers like Okta, OneLogin, Auth0',
    icon: Shield,
    configured: false,
    popular: ['Okta', 'OneLogin', 'Auth0', 'PingIdentity'],
  },
  {
    id: 'oauth',
    name: 'OAuth 2.0 / OpenID Connect',
    description: 'Modern authentication with Google, Microsoft, GitHub',
    icon: Globe,
    configured: true,
    popular: ['Google Workspace', 'Microsoft Azure AD', 'GitHub Enterprise'],
  },
  {
    id: 'ldap',
    name: 'LDAP / Active Directory',
    description: 'On-premise directory services integration',
    icon: Building,
    configured: false,
    popular: ['Active Directory', 'OpenLDAP', 'FreeIPA'],
  },
]

// Mark as dynamic to skip static generation
export const dynamic = 'force-dynamic'

export default function SSOConfigPage() {
  // Return a simple loading state during build time
  if (isBuildTime()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="h-8 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <AdminGate>
        <SSOConfiguration />
      </AdminGate>
    </ProtectedRoute>
  )
}

function SSOConfiguration() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'providers' | 'settings' | 'users'>('providers')
  const [showConfigModal, setShowConfigModal] = useState(false)

  const samlConfig = {
    entityId: 'https://coreflow360.com/saml',
    acsUrl: 'https://coreflow360.com/api/auth/saml/callback',
    sloUrl: 'https://coreflow360.com/api/auth/saml/logout',
    certificate:
      '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKl...\n-----END CERTIFICATE-----',
  }

  const connectedDomains = [
    { domain: 'techcorp.com', provider: 'OAuth 2.0', users: 142, status: 'active' },
    { domain: 'enterprise.io', provider: 'SAML 2.0', users: 89, status: 'active' },
    { domain: 'startup.tech', provider: 'OAuth 2.0', users: 23, status: 'pending' },
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Back to Security Settings
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Single Sign-On (SSO)
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Configure enterprise authentication for your organization
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              <Zap className="h-4 w-4" />
              <span>Quick Setup</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-lg bg-white shadow-sm dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('providers')}
                className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'providers'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Authentication Providers
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Connected Domains
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'providers' && (
          <div className="space-y-4">
            {SSO_PROVIDERS.map((provider) => (
              <motion.div
                key={provider.id}
                whileHover={{ scale: 1.01 }}
                className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`rounded-lg p-3 ${
                        provider.configured
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <provider.icon
                        className={`h-6 w-6 ${
                          provider.configured ? 'text-green-600' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {provider.name}
                        </h3>
                        {provider.configured && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                            Configured
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {provider.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {provider.popular.map((service) => (
                          <span
                            key={service}
                            className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProvider(provider.id)}
                    className="rounded-lg border border-purple-600 px-4 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    {provider.configured ? 'Manage' : 'Configure'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              SAML Configuration
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Entity ID (Issuer)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={samlConfig.entityId}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => handleCopy(samlConfig.entityId)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ACS URL (Reply URL)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={samlConfig.acsUrl}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => handleCopy(samlConfig.acsUrl)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Single Logout URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={samlConfig.sloUrl}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => handleCopy(samlConfig.sloUrl)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  X.509 Certificate
                </label>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <pre className="overflow-x-auto font-mono text-xs text-gray-600 dark:text-gray-400">
                    {samlConfig.certificate}
                  </pre>
                  <div className="mt-3 flex space-x-2">
                    <button className="rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">
                      <Download className="mr-1 inline h-4 w-4" />
                      Download
                    </button>
                    <button className="rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">
                      <Copy className="mr-1 inline h-4 w-4" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Connected Domains
                </h2>
                <button className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                  <Users className="h-4 w-4" />
                  <span>Add Domain</span>
                </button>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {connectedDomains.map((domain) => (
                  <tr key={domain.domain}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {domain.domain}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {domain.provider}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {domain.users}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          domain.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {domain.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-purple-600 hover:text-purple-900">
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Setup Modal */}
        {showConfigModal && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="m-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800"
            >
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Quick SSO Setup
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Identity Provider
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                    <option>Okta</option>
                    <option>Auth0</option>
                    <option>Azure AD</option>
                    <option>Google Workspace</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Domain
                  </label>
                  <input
                    type="text"
                    placeholder="company.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600"
                  />
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    We'll generate all the configuration values you need for your identity provider.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                  Generate Config
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
