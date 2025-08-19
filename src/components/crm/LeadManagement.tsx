/**
 * CoreFlow360 - Lead Management with Smart Deduplication
 * AI-powered lead scoring and intelligent duplicate detection
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  FireIcon,
  StarIcon as SnowflakeIcon,
  SunIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  title?: string
  website?: string
  address?: string

  // Lead qualification
  source: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
  score: number
  temperature: 'COLD' | 'WARM' | 'HOT'

  // Conversion tracking
  convertedAt?: string
  convertedToDeal?: string
  lostReason?: string

  // AI Intelligence
  aiScore: number
  aiConversionRate: number
  aiRecommendations: string[]
  aiLastAnalysisAt?: string

  // Assignment
  assignee?: {
    id: string
    name: string
    avatar?: string
  }

  // Duplicate detection
  potentialDuplicates?: Array<{
    id: string
    name: string
    similarity: number
    reason: string
  }>

  createdAt: string
  updatedAt: string
  lastContactAt?: string
}

interface LeadMetrics {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  convertedLeads: number
  conversionRate: number
  avgScore: number
  hotLeads: number
  duplicatesDetected: number
}

interface LeadManagementProps {
  onLeadClick?: (lead: Lead) => void
  onAddLead?: () => void
  onEditLead?: (lead: Lead) => void
  onConvertLead?: (lead: Lead) => void
  onMergeLeads?: (primaryLead: Lead, duplicates: Lead[]) => void
}

const leadSources = [
  'Website',
  'Referral',
  'Cold Call',
  'Social Media',
  'Email Campaign',
  'Event',
  'Partner',
  'Advertisement',
  'Direct',
]

const leadStatuses = [
  { id: 'NEW', name: 'New', color: 'bg-gray-500', textColor: 'text-gray-700' },
  { id: 'CONTACTED', name: 'Contacted', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'QUALIFIED', name: 'Qualified', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'CONVERTED', name: 'Converted', color: 'bg-purple-500', textColor: 'text-purple-700' },
  { id: 'LOST', name: 'Lost', color: 'bg-red-500', textColor: 'text-red-700' },
]

export default function LeadManagement({
  onLeadClick,
  onAddLead,
  onEditLead,
  onConvertLead,
  onMergeLeads,
}: LeadManagementProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [metrics, setMetrics] = useState<LeadMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [temperatureFilter, setTemperatureFilter] = useState<string>('ALL')
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [showAIInsights, setShowAIInsights] = useState(true)

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      setLoading(true)

      // Mock data for demonstration
      const mockLeads: Lead[] = [
        {
          id: '1',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@techcorp.com',
          phone: '+1 (555) 123-4567',
          company: 'TechCorp Solutions',
          title: 'CTO',
          website: 'https://techcorp.com',
          source: 'Website',
          status: 'NEW',
          score: 85,
          temperature: 'HOT',
          aiScore: 92,
          aiConversionRate: 78,
          aiRecommendations: [
            'Call within 24 hours - high intent signals detected',
            'Send technical whitepaper on cloud migration',
            'Schedule demo focusing on enterprise features',
          ],
          aiLastAnalysisAt: '2024-08-09T12:00:00Z',
          assignee: {
            id: '1',
            name: 'Alex Morgan',
            avatar: '/avatars/alex.jpg',
          },
          potentialDuplicates: [
            {
              id: '7',
              name: 'A. Johnson - TechCorp',
              similarity: 85,
              reason: 'Similar name and company',
            },
          ],
          createdAt: '2024-08-09T10:30:00Z',
          updatedAt: '2024-08-09T14:22:00Z',
        },
        {
          id: '2',
          firstName: 'Robert',
          lastName: 'Chen',
          email: 'r.chen@innovatestart.io',
          phone: '+1 (555) 987-6543',
          company: 'InnovateStart',
          title: 'Founder',
          source: 'Referral',
          status: 'CONTACTED',
          score: 72,
          temperature: 'WARM',
          aiScore: 68,
          aiConversionRate: 55,
          aiRecommendations: [
            'Follow up on pricing discussion',
            'Address scalability concerns',
            'Connect with existing customer for reference',
          ],
          aiLastAnalysisAt: '2024-08-08T15:30:00Z',
          assignee: {
            id: '2',
            name: 'Jordan Lee',
            avatar: '/avatars/jordan.jpg',
          },
          createdAt: '2024-08-05T14:15:00Z',
          updatedAt: '2024-08-08T15:30:00Z',
          lastContactAt: '2024-08-08T15:30:00Z',
        },
        {
          id: '3',
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria@futuretech.com',
          phone: '+1 (555) 456-7890',
          company: 'FutureTech Industries',
          title: 'VP Technology',
          source: 'Cold Call',
          status: 'QUALIFIED',
          score: 91,
          temperature: 'HOT',
          aiScore: 95,
          aiConversionRate: 85,
          aiRecommendations: [
            'Prepare detailed proposal ASAP',
            'Include ROI calculator in presentation',
            'Schedule stakeholder demo this week',
          ],
          aiLastAnalysisAt: '2024-08-09T11:45:00Z',
          assignee: {
            id: '3',
            name: 'Sam Wilson',
            avatar: '/avatars/sam.jpg',
          },
          createdAt: '2024-07-25T09:20:00Z',
          updatedAt: '2024-08-09T11:45:00Z',
          lastContactAt: '2024-08-07T16:00:00Z',
        },
        {
          id: '4',
          firstName: 'David',
          lastName: 'Smith',
          email: 'dsmith@smallbiz.com',
          phone: '+1 (555) 321-9876',
          company: 'SmallBiz Solutions',
          title: 'Owner',
          source: 'Social Media',
          status: 'NEW',
          score: 45,
          temperature: 'COLD',
          aiScore: 38,
          aiConversionRate: 25,
          aiRecommendations: [
            'Send educational content first',
            'Qualify budget before demo',
            'Focus on small business benefits',
          ],
          aiLastAnalysisAt: '2024-08-09T09:15:00Z',
          assignee: {
            id: '1',
            name: 'Alex Morgan',
            avatar: '/avatars/alex.jpg',
          },
          createdAt: '2024-08-07T16:45:00Z',
          updatedAt: '2024-08-09T09:15:00Z',
        },
        {
          id: '5',
          firstName: 'Sarah',
          lastName: 'Williams',
          email: 'swilliams@enterprise.com',
          phone: '+1 (555) 654-3210',
          company: 'Enterprise Corp',
          title: 'IT Director',
          source: 'Event',
          status: 'CONVERTED',
          score: 88,
          temperature: 'HOT',
          convertedAt: '2024-08-01T10:00:00Z',
          convertedToDeal: 'deal-123',
          aiScore: 90,
          aiConversionRate: 100,
          aiRecommendations: [
            'Deal converted successfully',
            'Monitor onboarding progress',
            'Identify expansion opportunities',
          ],
          aiLastAnalysisAt: '2024-08-01T10:00:00Z',
          assignee: {
            id: '2',
            name: 'Jordan Lee',
            avatar: '/avatars/jordan.jpg',
          },
          createdAt: '2024-07-15T11:30:00Z',
          updatedAt: '2024-08-01T10:00:00Z',
          lastContactAt: '2024-07-30T14:20:00Z',
        },
      ]

      const mockMetrics: LeadMetrics = {
        totalLeads: 45,
        newLeads: 12,
        qualifiedLeads: 8,
        convertedLeads: 15,
        conversionRate: 33.3,
        avgScore: 72,
        hotLeads: 6,
        duplicatesDetected: 3,
      }

      setLeads(mockLeads)
      setMetrics(mockMetrics)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm)

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter
    const matchesTemperature = temperatureFilter === 'ALL' || lead.temperature === temperatureFilter
    const matchesDuplicates =
      !showDuplicatesOnly || (lead.potentialDuplicates && lead.potentialDuplicates.length > 0)

    return (
      matchesSearch && matchesStatus && matchesSource && matchesTemperature && matchesDuplicates
    )
  })

  const getStatusColor = (status: string) => {
    const statusObj = leadStatuses.find((s) => s.id === status)
    return statusObj?.color || 'bg-gray-500'
  }

  const getStatusTextColor = (_status: string) => {
    const statusObj = leadStatuses.find((s) => s.id === status)
    return statusObj?.textColor || 'text-gray-700'
  }

  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case 'HOT':
        return <FireIcon className="h-4 w-4 text-red-500" />
      case 'WARM':
        return <SunIcon className="h-4 w-4 text-yellow-500" />
      case 'COLD':
        return <SnowflakeIcon className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleLeadSelection = (leadId: string, selected: boolean) => {
    if (selected) {
      setSelectedLeads([...selectedLeads, leadId])
    } else {
      setSelectedLeads(selectedLeads.filter((id) => id !== leadId))
    }
  }

  const handleBulkMerge = () => {
    if (selectedLeads.length < 2) return

    const primaryLead = leads.find((l) => l.id === selectedLeads[0])
    const duplicates = leads.filter(
      (l) => selectedLeads.includes(l.id) && l.id !== selectedLeads[0]
    )

    if (primaryLead && duplicates.length > 0) {
      onMergeLeads?.(primaryLead, duplicates)
      setSelectedLeads([])
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="mt-1 text-gray-600">
            AI-powered lead scoring and intelligent duplicate detection
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium ${
              showAIInsights
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SparklesIcon className="mr-2 h-4 w-4" />
            AI Insights
          </button>
          <button
            onClick={onAddLead}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={metrics.totalLeads.toString()}
            label="Total Leads"
            icon={UserIcon}
            gradient="blue"
            trend={12}
          />
          <MetricCard
            value={`${metrics.conversionRate}%`}
            label="Conversion Rate"
            icon={CheckCircleIcon}
            gradient="emerald"
            trend={5}
          />
          <MetricCard
            value={metrics.hotLeads.toString()}
            label="Hot Leads"
            icon={FireIcon}
            gradient="orange"
            trend={8}
          />
          <MetricCard
            value={metrics.duplicatesDetected.toString()}
            label="Duplicates Detected"
            icon={ExclamationTriangleIcon}
            gradient="violet"
            trend={-2}
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Search leads..."
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block rounded-md border-gray-300 py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {leadStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="block rounded-md border-gray-300 py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Sources</option>
              {leadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <select
              value={temperatureFilter}
              onChange={(e) => setTemperatureFilter(e.target.value)}
              className="block rounded-md border-gray-300 py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Temperatures</option>
              <option value="HOT">Hot</option>
              <option value="WARM">Warm</option>
              <option value="COLD">Cold</option>
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showDuplicatesOnly}
                onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Duplicates only</span>
            </label>

            {selectedLeads.length > 1 && (
              <button
                onClick={handleBulkMerge}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Merge Selected ({selectedLeads.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lead List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          {filteredLeads.length === 0 ? (
            <div className="py-12 text-center">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first lead.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 ${
                    lead.potentialDuplicates && lead.potentialDuplicates.length > 0
                      ? 'border-l-4 border-l-yellow-400'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Selection checkbox for duplicate management */}
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-sm font-medium text-gray-700">
                            {lead.firstName.charAt(0)}
                            {lead.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center space-x-3">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${getStatusColor(lead.status)}`}
                          >
                            {leadStatuses.find((s) => s.id === lead.status)?.name}
                          </span>
                          {getTemperatureIcon(lead.temperature)}
                          <div className="flex items-center">
                            <SparklesIcon className="mr-1 h-4 w-4 text-purple-500" />
                            <span className="text-sm text-gray-500">{lead.aiScore}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {lead.company && (
                            <div className="flex items-center space-x-1">
                              <BuildingOfficeIcon className="h-4 w-4" />
                              <span>{lead.company}</span>
                            </div>
                          )}
                          {lead.title && <span>{lead.title}</span>}
                          <span>Score: {lead.score}</span>
                          <span>{lead.source}</span>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          {lead.email && (
                            <div className="flex items-center space-x-1">
                              <EnvelopeIcon className="h-4 w-4" />
                              <span>{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center space-x-1">
                              <PhoneIcon className="h-4 w-4" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* AI Insights */}
                        {showAIInsights && lead.aiRecommendations.length > 0 && (
                          <div className="mt-3 rounded-lg bg-purple-50 p-3">
                            <div className="mb-2 flex items-center space-x-2">
                              <SparklesIcon className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-900">
                                AI Recommendations
                              </span>
                            </div>
                            <ul className="space-y-1">
                              {lead.aiRecommendations.slice(0, 2).map((rec, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start space-x-2 text-sm text-purple-800"
                                >
                                  <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Duplicate Alert */}
                        {lead.potentialDuplicates && lead.potentialDuplicates.length > 0 && (
                          <div className="mt-3 rounded-lg bg-yellow-50 p-3">
                            <div className="flex items-center space-x-2">
                              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-900">
                                Potential Duplicates Detected
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-yellow-800">
                              {lead.potentialDuplicates[0].similarity}% similar to "
                              {lead.potentialDuplicates[0].name}"
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side info and actions */}
                    <div className="flex items-center space-x-6">
                      {/* Conversion Rate */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Conversion</p>
                        <p
                          className={`font-medium ${
                            lead.aiConversionRate > 70
                              ? 'text-green-600'
                              : lead.aiConversionRate > 40
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {lead.aiConversionRate}%
                        </p>
                      </div>

                      {/* Last Contact */}
                      {lead.lastContactAt && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Last Contact</p>
                          <p className="text-sm text-gray-900">{formatDate(lead.lastContactAt)}</p>
                        </div>
                      )}

                      {/* Assignee */}
                      {lead.assignee && (
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-300"></div>
                          <span className="text-sm text-gray-500">{lead.assignee.name}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {lead.status === 'QUALIFIED' && (
                          <button
                            onClick={() => onConvertLead?.(lead)}
                            className="text-sm font-medium text-green-600 hover:text-green-800"
                          >
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => onLeadClick?.(lead)}
                          className="text-gray-400 hover:text-blue-600"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditLead?.(lead)}
                          className="text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600" title="Delete">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
