/**
 * CoreFlow360 - Advanced Sequence Builder Component
 * Multi-channel campaign builder with A/B testing and AI personalization
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  BeakerIcon,
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  FunnelIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CpuChipIcon,
  FireIcon,
  TrophyIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  GlobeAltIcon,
  HashtagIcon,
  AtSymbolIcon,
  LinkIcon,
  FolderIcon,
  TagIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { AccessibleButton, AccessibleInput, AccessibleSelect, AccessibleTextarea } from '@/components/accessibility/AccessibleComponents'

interface SequenceStep {
  id: string
  type: 'EMAIL' | 'LINKEDIN_MESSAGE' | 'LINKEDIN_CONNECTION' | 'PHONE_CALL' | 'SMS' | 'TASK' | 'WAIT' | 'CONDITIONAL'
  name: string
  delay: {
    type: string
    value: number
  }
  content?: {
    subject?: string
    body?: string
    aiEnhancement?: boolean
  }
  conditions?: Array<{
    type: string
    operator: string
    value: any
  }>
  metrics?: {
    sent: number
    opened: number
    clicked: number
    replied: number
  }
}

interface SequenceVariant {
  id: string
  name: string
  weight: number
  steps: SequenceStep[]
  performance?: {
    conversionRate: number
    responseRate: number
  }
}

interface Sequence {
  id: string
  name: string
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  type: 'OUTBOUND' | 'NURTURE' | 'ONBOARDING' | 'RE_ENGAGEMENT'
  audience: {
    filters: any[]
    size: number
  }
  steps: SequenceStep[]
  variants?: SequenceVariant[]
  metrics?: {
    totalContacts: number
    activeContacts: number
    completedContacts: number
    conversionRate: number
  }
}

export default function AdvancedSequenceBuilder() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null)
  const [activeTab, setActiveTab] = useState<'builder' | 'audience' | 'testing' | 'analytics'>('builder')
  const [showNewSequenceModal, setShowNewSequenceModal] = useState(false)
  const [showStepModal, setShowStepModal] = useState(false)
  const [selectedStep, setSelectedStep] = useState<SequenceStep | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSequences()
  }, [])

  const loadSequences = async () => {
    try {
      setLoading(true)
      // Mock data
      const mockSequences: Sequence[] = [
        {
          id: 'seq-1',
          name: 'Enterprise Sales Outreach',
          status: 'ACTIVE',
          type: 'OUTBOUND',
          audience: {
            filters: [
              { field: 'company_size', operator: 'GREATER_THAN', value: 1000 },
              { field: 'industry', operator: 'IN', value: ['Technology', 'Finance'] }
            ],
            size: 450
          },
          steps: [
            {
              id: 'step-1',
              type: 'EMAIL',
              name: 'Initial Outreach',
              delay: { type: 'IMMEDIATE', value: 0 },
              content: {
                subject: 'Quick question about {{company}}\'s growth plans',
                body: 'Hi {{firstName}}, noticed {{company}} is scaling rapidly...',
                aiEnhancement: true
              },
              metrics: { sent: 420, opened: 168, clicked: 42, replied: 21 }
            },
            {
              id: 'step-2',
              type: 'WAIT',
              name: 'Wait 3 days',
              delay: { type: 'DAYS', value: 3 }
            },
            {
              id: 'step-3',
              type: 'LINKEDIN_MESSAGE',
              name: 'LinkedIn Follow-up',
              delay: { type: 'DAYS', value: 1 },
              content: {
                body: 'Hi {{firstName}}, wanted to follow up on my email...'
              }
            }
          ],
          metrics: {
            totalContacts: 450,
            activeContacts: 312,
            completedContacts: 138,
            conversionRate: 0.14
          }
        }
      ]
      setSequences(mockSequences)
      setSelectedSequence(mockSequences[0])
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!selectedSequence) return
    
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = selectedSequence.steps.findIndex(s => s.id === active.id)
    const newIndex = selectedSequence.steps.findIndex(s => s.id === over.id)
    
    const newSteps = [...selectedSequence.steps]
    const [movedStep] = newSteps.splice(oldIndex, 1)
    newSteps.splice(newIndex, 0, movedStep)
    
    setSelectedSequence({
      ...selectedSequence,
      steps: newSteps
    })
  }

  const addStep = (type: SequenceStep['type']) => {
    if (!selectedSequence) return
    
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      type,
      name: `${type} Step`,
      delay: { type: 'DAYS', value: 1 }
    }
    
    setSelectedSequence({
      ...selectedSequence,
      steps: [...selectedSequence.steps, newStep]
    })
    
    setSelectedStep(newStep)
    setShowStepModal(true)
  }

  const getStepIcon = (type: string) => {
    const icons: Record<string, any> = {
      'EMAIL': EnvelopeIcon,
      'LINKEDIN_MESSAGE': ChatBubbleLeftRightIcon,
      'LINKEDIN_CONNECTION': LinkIcon,
      'PHONE_CALL': PhoneIcon,
      'SMS': HashtagIcon,
      'TASK': CheckCircleIcon,
      'WAIT': ClockIcon,
      'CONDITIONAL': AdjustmentsHorizontalIcon
    }
    return icons[type] || EnvelopeIcon
  }

  const getStepColor = (type: string) => {
    const colors: Record<string, string> = {
      'EMAIL': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'LINKEDIN_MESSAGE': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'LINKEDIN_CONNECTION': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'PHONE_CALL': 'bg-green-500/20 text-green-300 border-green-500/30',
      'SMS': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'TASK': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'WAIT': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'CONDITIONAL': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Sequence Builder</h1>
          <p className="text-gray-400 mt-1">Multi-channel campaigns with AI personalization</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Sequence Engine - $99/month</span>
            </div>
          </div>
          <AccessibleButton className="bg-gradient-to-r from-green-500 to-emerald-600">
            <RocketLaunchIcon className="w-4 h-4 mr-2" />
            Upgrade Now
          </AccessibleButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Sequences</p>
              <p className="text-2xl font-bold text-white">
                {sequences.filter(s => s.status === 'ACTIVE').length}
              </p>
            </div>
            <PlayIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Contacts</p>
              <p className="text-2xl font-bold text-white">
                {sequences.reduce((sum, s) => sum + (s.metrics?.totalContacts || 0), 0)}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Response Rate</p>
              <p className="text-2xl font-bold text-white">24%</p>
            </div>
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Revenue Generated</p>
              <p className="text-2xl font-bold text-white">$240K</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Sequence List */}
        <div className="w-80 space-y-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Sequences</h2>
              <AccessibleButton
                size="sm"
                onClick={() => setShowNewSequenceModal(true)}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                New
              </AccessibleButton>
            </div>
            
            <div className="space-y-2">
              {sequences.map(sequence => (
                <motion.div
                  key={sequence.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSequence?.id === sequence.id
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedSequence(sequence)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{sequence.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {sequence.steps.length} steps • {sequence.audience.size} contacts
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sequence.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                      sequence.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {sequence.status}
                    </span>
                  </div>
                  
                  {sequence.metrics && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Active:</span>
                        <span className="text-gray-300 ml-1">{sequence.metrics.activeContacts}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Conv:</span>
                        <span className="text-green-400 ml-1">
                          {Math.round(sequence.metrics.conversionRate * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CpuChipIcon className="w-5 h-5 text-purple-400" />
              <h3 className="font-medium text-purple-300">AI Assistant</h3>
            </div>
            <p className="text-sm text-purple-200 mb-3">
              Get AI-powered suggestions for your sequences
            </p>
            <AccessibleButton
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setShowAIAssistant(true)}
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              Get Suggestions
            </AccessibleButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {selectedSequence ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl">
              {/* Tabs */}
              <div className="border-b border-gray-700 px-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'builder', name: 'Sequence Builder', icon: AdjustmentsHorizontalIcon },
                    { id: 'audience', name: 'Audience', icon: UserGroupIcon },
                    { id: 'testing', name: 'A/B Testing', icon: BeakerIcon },
                    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'builder' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      {/* Sequence Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-white">{selectedSequence.name}</h2>
                          <p className="text-sm text-gray-400">
                            {selectedSequence.type.replace('_', ' ').toLowerCase()} sequence
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AccessibleButton variant="secondary" size="sm">
                            <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                            Clone
                          </AccessibleButton>
                          <AccessibleButton
                            size="sm"
                            className={
                              selectedSequence.status === 'ACTIVE'
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }
                          >
                            {selectedSequence.status === 'ACTIVE' ? (
                              <>
                                <PauseIcon className="w-4 h-4 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <PlayIcon className="w-4 h-4 mr-1" />
                                Start
                              </>
                            )}
                          </AccessibleButton>
                        </div>
                      </div>

                      {/* Steps */}
                      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                          items={selectedSequence.steps.map(s => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {selectedSequence.steps.map((step, index) => {
                              const StepIcon = getStepIcon(step.type)
                              
                              return (
                                <motion.div
                                  key={step.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="group"
                                >
                                  {/* Connector */}
                                  {index > 0 && (
                                    <div className="flex items-center justify-center -mt-1 mb-1">
                                      <div className="w-0.5 h-6 bg-gray-700"></div>
                                    </div>
                                  )}
                                  
                                  <div className={`p-4 rounded-lg border ${getStepColor(step.type)} relative`}>
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start space-x-3">
                                        <div className="mt-0.5">
                                          <StepIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                          <h3 className="font-medium text-white">{step.name}</h3>
                                          
                                          {step.delay && (
                                            <p className="text-sm text-gray-400 mt-1">
                                              <ClockIcon className="w-3 h-3 inline mr-1" />
                                              {step.delay.type === 'IMMEDIATE' ? 'Immediately' :
                                               `Wait ${step.delay.value} ${step.delay.type.toLowerCase()}`}
                                            </p>
                                          )}
                                          
                                          {step.content && (
                                            <div className="mt-2 space-y-1">
                                              {step.content.subject && (
                                                <p className="text-sm text-gray-300">
                                                  <span className="text-gray-500">Subject:</span> {step.content.subject}
                                                </p>
                                              )}
                                              {step.content.aiEnhancement && (
                                                <span className="inline-flex items-center text-xs text-purple-400">
                                                  <SparklesIcon className="w-3 h-3 mr-1" />
                                                  AI Enhanced
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          
                                          {step.metrics && (
                                            <div className="mt-3 flex items-center space-x-4 text-xs">
                                              <span className="text-gray-400">
                                                Sent: {step.metrics.sent}
                                              </span>
                                              <span className="text-blue-400">
                                                Opened: {step.metrics.opened} ({Math.round(step.metrics.opened / step.metrics.sent * 100)}%)
                                              </span>
                                              <span className="text-green-400">
                                                Replied: {step.metrics.replied} ({Math.round(step.metrics.replied / step.metrics.sent * 100)}%)
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                        <button
                                          onClick={() => {
                                            setSelectedStep(step)
                                            setShowStepModal(true)
                                          }}
                                          className="p-1 hover:bg-gray-700 rounded"
                                        >
                                          <PencilIcon className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-700 rounded">
                                          <TrashIcon className="w-4 h-4 text-gray-400" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>

                      {/* Add Step */}
                      <div className="pt-4">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-0.5 h-6 bg-gray-700"></div>
                        </div>
                        
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                          <p className="text-sm text-gray-400 text-center mb-3">Add a step to your sequence</p>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { type: 'EMAIL' as const, name: 'Email', icon: EnvelopeIcon },
                              { type: 'LINKEDIN_MESSAGE' as const, name: 'LinkedIn', icon: ChatBubbleLeftRightIcon },
                              { type: 'PHONE_CALL' as const, name: 'Call', icon: PhoneIcon },
                              { type: 'SMS' as const, name: 'SMS', icon: HashtagIcon },
                              { type: 'TASK' as const, name: 'Task', icon: CheckCircleIcon },
                              { type: 'WAIT' as const, name: 'Wait', icon: ClockIcon },
                              { type: 'CONDITIONAL' as const, name: 'If/Then', icon: AdjustmentsHorizontalIcon }
                            ].map((stepType) => {
                              const Icon = stepType.icon
                              return (
                                <button
                                  key={stepType.type}
                                  onClick={() => addStep(stepType.type)}
                                  className="flex flex-col items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                  <Icon className="w-5 h-5 text-gray-400 mb-1" />
                                  <span className="text-xs text-gray-300">{stepType.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'audience' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="bg-gray-800/50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Audience Filters</h3>
                        <div className="space-y-4">
                          {selectedSequence.audience.filters.map((filter, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <AccessibleSelect
                                value={filter.field}
                                options={[
                                  { value: 'company_size', label: 'Company Size' },
                                  { value: 'industry', label: 'Industry' },
                                  { value: 'title', label: 'Job Title' },
                                  { value: 'location', label: 'Location' }
                                ]}
                              />
                              <AccessibleSelect
                                value={filter.operator}
                                options={[
                                  { value: 'EQUALS', label: 'equals' },
                                  { value: 'CONTAINS', label: 'contains' },
                                  { value: 'GREATER_THAN', label: 'greater than' },
                                  { value: 'IN', label: 'in' }
                                ]}
                              />
                              <AccessibleInput
                                value={filter.value}
                                placeholder="Value"
                              />
                              <button className="text-gray-400 hover:text-red-400">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <AccessibleButton variant="secondary" size="sm">
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Add Filter
                          </AccessibleButton>
                        </div>
                        
                        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-purple-300">Estimated Audience Size</p>
                              <p className="text-2xl font-bold text-white">{selectedSequence.audience.size}</p>
                            </div>
                            <AccessibleButton variant="secondary" size="sm">
                              <ArrowPathIcon className="w-4 h-4 mr-1" />
                              Refresh
                            </AccessibleButton>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'testing' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <BeakerIcon className="w-6 h-6 text-purple-400" />
                          <h3 className="text-lg font-medium text-white">A/B Testing</h3>
                        </div>
                        <p className="text-sm text-gray-300 mb-6">
                          Test different variations to optimize your sequence performance
                        </p>
                        
                        {selectedSequence.variants && selectedSequence.variants.length > 0 ? (
                          <div className="space-y-4">
                            {selectedSequence.variants.map((variant) => (
                              <div key={variant.id} className="bg-gray-800/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-white">{variant.name}</h4>
                                  <span className="text-sm text-gray-400">{variant.weight}% traffic</span>
                                </div>
                                {variant.performance && (
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Response Rate:</span>
                                      <span className="text-green-400 ml-2">
                                        {Math.round(variant.performance.responseRate * 100)}%
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Conversion:</span>
                                      <span className="text-blue-400 ml-2">
                                        {Math.round(variant.performance.conversionRate * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <BeakerIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 mb-4">No variants created yet</p>
                            <AccessibleButton>
                              <PlusIcon className="w-4 h-4 mr-2" />
                              Create Variant
                            </AccessibleButton>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'analytics' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-white mb-4">Funnel Analysis</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Sent</span>
                              <span className="text-white">420</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Opened</span>
                              <span className="text-white">168 (40%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Clicked</span>
                              <span className="text-white">42 (10%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Converted</span>
                              <span className="text-white">21 (5%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-white mb-4">Channel Performance</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                                <span className="text-white">Email</span>
                              </div>
                              <span className="text-green-400">32% response</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                                <span className="text-white">LinkedIn</span>
                              </div>
                              <span className="text-green-400">28% response</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <PhoneIcon className="w-5 h-5 text-green-400" />
                                <span className="text-white">Phone</span>
                              </div>
                              <span className="text-green-400">45% response</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-12 text-center">
              <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Select a sequence to get started</p>
              <AccessibleButton onClick={() => setShowNewSequenceModal(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create New Sequence
              </AccessibleButton>
            </div>
          )}
        </div>
      </div>

      {/* Step Edit Modal */}
      <AnimatePresence>
        {showStepModal && selectedStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowStepModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit Step</h2>
                <button
                  onClick={() => setShowStepModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Step Name</label>
                  <AccessibleInput
                    value={selectedStep.name}
                    placeholder="Enter step name"
                  />
                </div>

                {selectedStep.type === 'EMAIL' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Subject Line</label>
                      <AccessibleInput
                        value={selectedStep.content?.subject || ''}
                        placeholder="Enter subject line"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email Body</label>
                      <AccessibleTextarea
                        value={selectedStep.content?.body || ''}
                        placeholder="Write your email content..."
                        rows={8}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <SparklesIcon className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-purple-300">AI Enhancement</p>
                          <p className="text-xs text-purple-200">Personalize with AI</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Delay Type</label>
                    <AccessibleSelect
                      value={selectedStep.delay.type}
                      options={[
                        { value: 'IMMEDIATE', label: 'Immediately' },
                        { value: 'MINUTES', label: 'Minutes' },
                        { value: 'HOURS', label: 'Hours' },
                        { value: 'DAYS', label: 'Days' },
                        { value: 'BUSINESS_DAYS', label: 'Business Days' }
                      ]}
                    />
                  </div>
                  
                  {selectedStep.delay.type !== 'IMMEDIATE' && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Delay Value</label>
                      <AccessibleInput
                        type="number"
                        value={selectedStep.delay.value}
                        min="1"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <AccessibleButton
                    variant="secondary"
                    onClick={() => setShowStepModal(false)}
                  >
                    Cancel
                  </AccessibleButton>
                  <AccessibleButton onClick={() => setShowStepModal(false)}>
                    Save Changes
                  </AccessibleButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAIAssistant(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <CpuChipIcon className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">AI Sequence Assistant</h2>
                </div>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="font-medium text-purple-300 mb-2">Optimization Suggestions</h3>
                  <ul className="space-y-2 text-sm text-purple-200">
                    <li className="flex items-start">
                      <LightBulbIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      Add a LinkedIn connection request before the message for 40% higher response rate
                    </li>
                    <li className="flex items-start">
                      <LightBulbIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      Include a case study in step 3 - similar sequences see 25% more conversions
                    </li>
                    <li className="flex items-start">
                      <LightBulbIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      Optimal timing: Send emails on Tuesday/Thursday at 10 AM recipient time
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-2">Ask AI Assistant</h3>
                  <AccessibleTextarea
                    placeholder="E.g., 'How can I improve my follow-up messages?' or 'Generate a re-engagement sequence'"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <AccessibleButton variant="secondary" onClick={() => setShowAIAssistant(false)}>
                    Close
                  </AccessibleButton>
                  <AccessibleButton>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Get Suggestions
                  </AccessibleButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}