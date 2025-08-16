/**
 * CoreFlow360 - Single Sign-On Configuration
 * Enterprise SSO setup and management
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
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
  Zap
} from 'lucide-react'

const SSO_PROVIDERS = [
  {
    id: 'saml',
    name: 'SAML 2.0',
    description: 'Enterprise identity providers like Okta, OneLogin, Auth0',
    icon: Shield,
    configured: false,
    popular: ['Okta', 'OneLogin', 'Auth0', 'PingIdentity']
  },
  {
    id: 'oauth',
    name: 'OAuth 2.0 / OpenID Connect',
    description: 'Modern authentication with Google, Microsoft, GitHub',
    icon: Globe,
    configured: true,
    popular: ['Google Workspace', 'Microsoft Azure AD', 'GitHub Enterprise']
  },
  {
    id: 'ldap',
    name: 'LDAP / Active Directory',
    description: 'On-premise directory services integration',
    icon: Building,
    configured: false,
    popular: ['Active Directory', 'OpenLDAP', 'FreeIPA']
  }
]

export default function SSOConfigPage() {
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
    certificate: '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKl...\n-----END CERTIFICATE-----'
  }

  const connectedDomains = [
    { domain: 'techcorp.com', provider: 'OAuth 2.0', users: 142, status: 'active' },
    { domain: 'enterprise.io', provider: 'SAML 2.0', users: 89, status: 'active' },
    { domain: 'startup.tech', provider: 'OAuth 2.0', users: 23, status: 'pending' }
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Security Settings
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Single Sign-On (SSO)
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Configure enterprise authentication for your organization
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Quick Setup</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('providers')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'providers'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Authentication Providers
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'settings'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      provider.configured 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}>
                      <provider.icon className={`w-6 h-6 ${
                        provider.configured ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {provider.name}
                        </h3>
                        {provider.configured && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Configured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {provider.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {provider.popular.map((service) => (
                          <span key={service} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProvider(provider.id)}
                    className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    {provider.configured ? 'Manage' : 'Configure'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              SAML Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entity ID (Issuer)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={samlConfig.entityId}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleCopy(samlConfig.entityId)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ACS URL (Reply URL)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={samlConfig.acsUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleCopy(samlConfig.acsUrl)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Single Logout URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={samlConfig.sloUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleCopy(samlConfig.sloUrl)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  X.509 Certificate
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                    {samlConfig.certificate}
                  </pre>
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">
                      <Download className="w-4 h-4 inline mr-1" />
                      Download
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">
                      <Copy className="w-4 h-4 inline mr-1" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Connected Domains
                </h2>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Add Domain</span>
                </button>
              </div>
            </div>
            
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {connectedDomains.map((domain) => (
                  <tr key={domain.domain}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        domain.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {domain.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick SSO Setup
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Identity Provider
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <option>Okta</option>
                    <option>Auth0</option>
                    <option>Azure AD</option>
                    <option>Google Workspace</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Domain
                  </label>
                  <input
                    type="text"
                    placeholder="company.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    We'll generate all the configuration values you need for your identity provider.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
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