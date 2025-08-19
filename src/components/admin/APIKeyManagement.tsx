/**
 * CoreFlow360 - API Key Management Component
 * Secure interface for super admin API key operations
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Key,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  APIKey,
  APIKeyListResponse,
  CreateAPIKeyRequest,
  UpdateAPIKeyRequest,
  RotateAPIKeyRequest,
  APIKeyFilter,
  APIKeyStatus,
  SecurityLevel,
} from '@/types/api-keys'

interface APIKeyCardProps {
  apiKey: APIKey
  onUpdate: (id: string, data: UpdateAPIKeyRequest) => Promise<void>
  onRotate: (id: string, data: RotateAPIKeyRequest) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onViewDetails: (id: string) => void
}

function APIKeyCard({ apiKey, onUpdate, onRotate, onDelete, onViewDetails }: APIKeyCardProps) {
  const [isKeyVisible, setIsKeyVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: apiKey.name,
    description: apiKey.description || '',
  })

  const getStatusColor = (status: APIKeyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'ROTATION_REQUIRED':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'COMPROMISED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSecurityLevelColor = (level: SecurityLevel) => {
    switch (level) {
      case 'EXCELLENT':
        return 'text-green-600'
      case 'HIGH':
        return 'text-blue-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-orange-600'
      case 'CRITICAL':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleSaveEdit = async () => {
    try {
      await onUpdate(apiKey.id, editData)
      setIsEditing(false)
    } catch (error) {}
  }

  const handleRotateKey = async () => {
    const newKey = prompt('Enter the new API key:')
    if (newKey) {
      try {
        await onRotate(apiKey.id, {
          newKey,
          reason: 'Manual rotation from admin panel',
        })
      } catch (error) {}
    }
  }

  const handleDeleteKey = async () => {
    if (
      confirm(
        `Are you sure you want to delete the API key "${apiKey.name || 'Unknown'}"? This action cannot be undone.`
      )
    ) {
      try {
        await onDelete(apiKey.id)
      } catch (error) {}
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
            <Key className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="border-b border-gray-300 bg-transparent text-lg font-semibold focus:border-blue-500 focus:outline-none dark:border-gray-600"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{apiKey.name}</h3>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {apiKey.service.charAt(0).toUpperCase() + apiKey.service.slice(1)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(apiKey.status)}`}
          >
            {apiKey.status}
          </span>
          <div className="flex items-center space-x-1">
            <Shield className={`h-4 w-4 ${getSecurityLevelColor(apiKey.securityScore.level)}`} />
            <span
              className={`text-sm font-medium ${getSecurityLevelColor(apiKey.securityScore.level)}`}
            >
              {apiKey.securityScore.score}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {isEditing ? (
        <textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          placeholder="Description (optional)"
          className="w-full resize-none rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-600"
          rows={2}
        />
      ) : (
        apiKey.description && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{apiKey.description}</p>
        )
      )}

      {/* API Key Display */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
          API Key
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 rounded border bg-gray-50 p-2 font-mono text-sm dark:bg-gray-700">
            {isKeyVisible ? (
              <span className="text-gray-900 dark:text-white">
                {apiKey.keyPreview.replace('...', '••••••••••••••••••••••••••••••••')}
              </span>
            ) : (
              <span className="text-gray-500">{apiKey.keyPreview}</span>
            )}
          </div>
          <button
            onClick={() => setIsKeyVisible(!isKeyVisible)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {apiKey.usage.totalRequests.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Total Requests</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {(
              (apiKey.usage.failedRequests / Math.max(apiKey.usage.totalRequests, 1)) *
              100
            ).toFixed(1)}
            %
          </div>
          <div className="text-xs text-gray-500">Error Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
          </div>
          <div className="text-xs text-gray-500">Last Used</div>
        </div>
      </div>

      {/* Security Recommendations */}
      {apiKey.securityScore.recommendations.length > 0 && (
        <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/10">
          <div className="mb-2 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Security Recommendations
            </span>
          </div>
          <ul className="space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
            {apiKey.securityScore.recommendations.slice(0, 2).map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-500 hover:text-blue-600"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={handleRotateKey}
                className="p-1 text-gray-500 hover:text-green-600"
                title="Rotate Key"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleDeleteKey}
                className="p-1 text-gray-500 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onViewDetails(apiKey.id)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

interface CreateAPIKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateAPIKeyRequest) => Promise<void>
}

function CreateAPIKeyModal({ isOpen, onClose, onCreate }: CreateAPIKeyModalProps) {
  const [formData, setFormData] = useState<CreateAPIKeyRequest>({
    service: '',
    name: '',
    description: '',
    key: '',
    rotationDays: 90,
    vendorId: 'openai', // Default vendor
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.service) {
      newErrors.service = 'Service is required'
    }

    if (!formData.name) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    } else if (!/^[a-zA-Z0-9\s_-]+$/.test(formData.name)) {
      newErrors.name = 'Name contains invalid characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    if (!formData.key) {
      newErrors.key = 'API key is required'
    } else if (formData.key.length < 8) {
      newErrors.key = 'API key must be at least 8 characters'
    } else if (formData.key.length > 200) {
      newErrors.key = 'API key is too long'
    }

    if (formData.rotationDays < 1 || formData.rotationDays > 365) {
      newErrors.rotationDays = 'Rotation days must be between 1 and 365'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onCreate(formData)
      onClose()
      setFormData({
        service: '',
        name: '',
        description: '',
        key: '',
        rotationDays: 90,
        vendorId: 'openai',
      })
      setErrors({})
      setSubmitError('')
    } catch (error: unknown) {
      setSubmitError(error.message || 'Failed to create API key')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setErrors({})
    setSubmitError('')
    setFormData({
      service: '',
      name: '',
      description: '',
      key: '',
      rotationDays: 90,
      vendorId: 'openai',
    })
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Add New API Key
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service
            </label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className={`w-full rounded-md border bg-white px-3 py-2 dark:bg-gray-700 ${
                errors.service
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              required
            >
              <option value="">Select a service</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="google_ai">Google AI</option>
              <option value="stripe">Stripe</option>
              <option value="aws">Amazon Web Services</option>
              <option value="github">GitHub</option>
            </select>
            {errors.service && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.service}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="e.g., Production OpenAI Key"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Description of this API key's purpose"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              API Key
            </label>
            <input
              type="password"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono dark:border-gray-600 dark:bg-gray-700"
              placeholder="Paste your API key here"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rotation Days
            </label>
            <input
              type="number"
              value={formData.rotationDays}
              onChange={(e) => setFormData({ ...formData, rotationDays: parseInt(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              min="1"
              max="365"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function APIKeyManagement() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [filteredKeys, setFilteredKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<APIKeyStatus | 'ALL'>('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [metrics, setMetrics] = useState<unknown>(null)

  // Check if user is super admin
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  const fetchAPIKeys = useCallback(async () => {
    if (!isSuperAdmin) return

    try {
      setLoading(true)
      const response = await fetch('/api/admin/api-keys')

      if (!response.ok) {
        throw new Error('Failed to fetch API keys')
      }

      const data: APIKeyListResponse = await response.json()
      setApiKeys(data.keys)
      setMetrics(data.metrics)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin])

  const handleCreateAPIKey = async (data: CreateAPIKeyRequest) => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()

        // Handle specific error types
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before trying again.')
        } else if (response.status === 403) {
          throw new Error('Insufficient permissions for this operation.')
        } else if (response.status === 400 && error.details) {
          const validationErrors = Array.isArray(error.details)
            ? error.details.map((e: unknown) => e.message || e.field).join(', ')
            : error.details
          throw new Error(`Validation failed: ${validationErrors}`)
        }

        throw new Error(error.error || 'Failed to create API key')
      }

      await fetchAPIKeys()

      // Show success notification
    } catch (error: unknown) {
      throw error
    }
  }

  const handleUpdateAPIKey = async (id: string, data: UpdateAPIKeyRequest) => {
    const response = await fetch(`/api/admin/api-keys/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update API key')
    }

    await fetchAPIKeys()
  }

  const handleRotateAPIKey = async (id: string, data: RotateAPIKeyRequest) => {
    const response = await fetch(`/api/admin/api-keys/${id}/rotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to rotate API key')
    }

    await fetchAPIKeys()
  }

  const handleDeleteAPIKey = async (id: string) => {
    const response = await fetch(`/api/admin/api-keys/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete API key')
    }

    await fetchAPIKeys()
  }

  const handleViewDetails = (_id: string) => {
    // TODO: Open detailed view modal
  }

  // Filter keys based on search and status
  useEffect(() => {
    let filtered = apiKeys

    if (searchTerm) {
      filtered = filtered.filter(
        (key) =>
          key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.service.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((key) => key.status === statusFilter)
    }

    setFilteredKeys(filtered)
  }, [apiKeys, searchTerm, statusFilter])

  useEffect(() => {
    fetchAPIKeys()
  }, [fetchAPIKeys])

  if (!isSuperAdmin) {
    return (
      <div className="py-8 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
          Access Restricted
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          API key management requires Super Admin privileges.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Key Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage third-party vendor API keys securely
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAPIKeys}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add API Key</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Keys</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600">{metrics.byStatus.ACTIVE}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Keys</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.byStatus.ROTATION_REQUIRED}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Need Rotation</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.usageMetrics.avgSecurityScore.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Security Score</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search API keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as APIKeyStatus | 'ALL')}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="EXPIRED">Expired</option>
          <option value="ROTATION_REQUIRED">Needs Rotation</option>
          <option value="COMPROMISED">Compromised</option>
        </select>
      </div>

      {/* API Keys Grid */}
      {loading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading API keys...</p>
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="py-8 text-center">
          <Key className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No API keys found
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first API key'}
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add Your First API Key
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredKeys.map((apiKey) => (
            <APIKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onUpdate={handleUpdateAPIKey}
              onRotate={handleRotateAPIKey}
              onDelete={handleDeleteAPIKey}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateAPIKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAPIKey}
      />
    </div>
  )
}
