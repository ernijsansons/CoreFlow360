'use client'

/**
 * Consciousness Marketing Framework
 *
 * Revolutionary marketing framework that guides prospects through
 * consciousness awakening stages rather than traditional sales funnels.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConsciousnessStage {
  id: string
  name: string
  level: number
  description: string
  psychologicalState: string
  marketingApproach: string
  contentTypes: string[]
  triggers: string[]
  barriers: string[]
  nextStage: string
  color: string
  icon: string
}

interface ProspectJourney {
  id: string
  currentStage: string
  consciousnessLevel: number
  engagementHistory: string[]
  painPoints: string[]
  readinessSignals: string[]
  recommendedContent: string[]
}

interface ConsciousnessMarketingFrameworkProps {
  showAnalytics?: boolean
  interactiveDemo?: boolean
  onStageChange?: (stage: ConsciousnessStage) => void
  className?: string
}

// The 7 Stages of Business Consciousness Awakening
const CONSCIOUSNESS_STAGES: ConsciousnessStage[] = [
  {
    id: 'unconscious',
    name: 'Unconscious Competence',
    level: 0,
    description: 'Business runs on autopilot. No awareness of intelligence limitations.',
    psychologicalState: 'Comfortable ignorance - "Everything is fine"',
    marketingApproach: 'Pattern interruption and consciousness seeds',
    contentTypes: [
      'Thought-provoking questions about business automation',
      'Subtle hints at hidden inefficiencies',
      'Curiosity-generating statistics',
      'Peer success stories that create gentle FOMO',
    ],
    triggers: [
      'Competitor advancement',
      'Operational breakdown',
      'Growth plateau',
      'Team frustration signals',
    ],
    barriers: [
      'Status quo bias',
      'Change resistance',
      'Investment hesitation',
      'Learning curve fear',
    ],
    nextStage: 'aware',
    color: '#6B7280',
    icon: '😴',
  },
  {
    id: 'aware',
    name: 'Conscious Awareness',
    level: 1,
    description: 'Beginning to notice business limitations and inefficiencies.',
    psychologicalState: 'Uncomfortable recognition - "Something needs to change"',
    marketingApproach: 'Education and problem amplification',
    contentTypes: [
      'Problem identification frameworks',
      'Cost of inaction calculators',
      'Inefficiency assessment tools',
      'Competitive disadvantage analysis',
    ],
    triggers: [
      'Problem becomes painful',
      'Competition pressure increases',
      'Team productivity questions',
      'Growth ambition emerges',
    ],
    barriers: [
      'Problem seems too complex',
      'Overwhelm paralysis',
      'Resource constraints',
      'Uncertainty about solutions',
    ],
    nextStage: 'seeking',
    color: '#F59E0B',
    icon: '👁️',
  },
  {
    id: 'seeking',
    name: 'Active Seeking',
    level: 2,
    description: 'Actively researching solutions and alternatives.',
    psychologicalState: 'Hope mixed with confusion - "There must be a better way"',
    marketingApproach: 'Solution education and positioning',
    contentTypes: [
      'Solution comparison guides',
      'Technology education content',
      'Vendor evaluation frameworks',
      'ROI calculation tools',
    ],
    triggers: [
      'Research validation',
      'Peer recommendations',
      'Clear value propositions',
      'Risk mitigation assurance',
    ],
    barriers: [
      'Information overload',
      'Analysis paralysis',
      'Budget concerns',
      'Implementation fears',
    ],
    nextStage: 'understanding',
    color: '#10B981',
    icon: '🔍',
  },
  {
    id: 'understanding',
    name: 'Deep Understanding',
    level: 3,
    description: 'Grasps the potential of intelligence multiplication.',
    psychologicalState: 'Excitement and possibility - "This could transform everything"',
    marketingApproach: 'Vision expansion and possibility amplification',
    contentTypes: [
      'Transformation case studies',
      'Future state visualization',
      'Intelligence multiplication demos',
      'Success story immersion',
    ],
    triggers: [
      'Vision clarity achieved',
      'Benefits quantified',
      'Success path visible',
      'Confidence building',
    ],
    barriers: [
      'Implementation complexity',
      'Change management concerns',
      'Team resistance fears',
      'Investment justification',
    ],
    nextStage: 'committed',
    color: '#3B82F6',
    icon: '💡',
  },
  {
    id: 'committed',
    name: 'Conscious Commitment',
    level: 4,
    description: 'Ready to invest in consciousness transformation.',
    psychologicalState: 'Determined resolve - "We need to do this"',
    marketingApproach: 'Implementation support and success assurance',
    contentTypes: [
      'Implementation roadmaps',
      'Change management guides',
      'Success guarantee frameworks',
      'Onboarding experience previews',
    ],
    triggers: [
      'Budget allocation',
      'Team alignment',
      'Timeline establishment',
      'Success metrics definition',
    ],
    barriers: [
      'Final investment hesitation',
      'Vendor selection uncertainty',
      'Timing concerns',
      'Success guarantee needs',
    ],
    nextStage: 'transforming',
    color: '#8B5CF6',
    icon: '🎯',
  },
  {
    id: 'transforming',
    name: 'Active Transformation',
    level: 5,
    description: 'Implementing consciousness multiplication systems.',
    psychologicalState: 'Focused execution - "Making it happen"',
    marketingApproach: 'Experience optimization and expansion opportunities',
    contentTypes: [
      'Implementation best practices',
      'Optimization strategies',
      'Advanced feature education',
      'Expansion opportunity identification',
    ],
    triggers: [
      'Early wins achieved',
      'Team adoption success',
      'Efficiency improvements',
      'Expansion readiness',
    ],
    barriers: [
      'Implementation challenges',
      'Adoption resistance',
      'Integration complexities',
      'ROI timeline concerns',
    ],
    nextStage: 'conscious',
    color: '#06B6D4',
    icon: '🚀',
  },
  {
    id: 'conscious',
    name: 'Full Consciousness',
    level: 6,
    description: 'Operating as a conscious business organism.',
    psychologicalState: 'Transcendent capability - "This is the future of business"',
    marketingApproach: 'Community leadership and advocacy cultivation',
    contentTypes: [
      'Thought leadership platforms',
      'Success story amplification',
      'Community building initiatives',
      'Advocacy program invitations',
    ],
    triggers: [
      'Transformation success',
      'Competitive advantage',
      'Team empowerment',
      'Growth acceleration',
    ],
    barriers: [
      'Complacency risk',
      'Expansion hesitation',
      'Leadership transition',
      'Market evolution',
    ],
    nextStage: 'conscious',
    color: '#EC4899',
    icon: '✨',
  },
]

const FRAMEWORK_PRINCIPLES = [
  {
    id: 'consciousness-first',
    title: 'Consciousness Over Conversion',
    description: 'Focus on raising awareness rather than pushing for immediate sales',
    example: 'Ask "Is your business unconscious?" instead of "Buy our software"',
  },
  {
    id: 'education-over-promotion',
    title: 'Education Over Promotion',
    description: 'Teach prospects about intelligence multiplication before selling',
    example: 'Explain 1×2×3×4×5=120 vs 1+1+1+1+1=5 concept',
  },
  {
    id: 'journey-respect',
    title: 'Respect the Journey',
    description: "Meet prospects where they are, don't force advancement",
    example: 'Provide stage-appropriate content, not one-size-fits-all',
  },
  {
    id: 'transformation-focus',
    title: 'Transformation Over Transaction',
    description: 'Emphasize business evolution rather than feature benefits',
    example: 'Promise "conscious business organism" not "better software"',
  },
]

const ConsciousnessMarketingFramework: React.FC<ConsciousnessMarketingFrameworkProps> = ({
  showAnalytics = true,
  interactiveDemo = false,
  onStageChange,
  className = '',
}) => {
  const [selectedStage, setSelectedStage] = useState<ConsciousnessStage>(CONSCIOUSNESS_STAGES[0])
  const [journeyVisualization, setJourneyVisualization] = useState<unknown[]>([])
  const [showPrinciples, setShowPrinciples] = useState(false)

  // Handle stage selection
  const handleStageSelect = (stage: ConsciousnessStage) => {
    setSelectedStage(stage)
    onStageChange?.(stage)
  }

  // Simulate prospect journey data
  useEffect(() => {
    if (showAnalytics) {
      const mockJourneyData = CONSCIOUSNESS_STAGES.map((stage, index) => ({
        stage: stage.name,
        prospects: Math.floor(Math.random() * 1000) + 100,
        conversionRate: Math.random() * 0.3 + 0.1,
        avgTimeInStage: Math.floor(Math.random() * 30) + 7,
      }))
      setJourneyVisualization(mockJourneyData)
    }
  }, [showAnalytics])

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Framework Header */}
      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-thin text-white">🧠 Consciousness Marketing Framework</h2>
        <p className="mx-auto max-w-4xl text-xl text-gray-300">
          Revolutionary approach that guides prospects through consciousness awakening rather than
          traditional sales pressure
        </p>
      </div>

      {/* Core Principles */}
      <div className="rounded-2xl border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
        <button
          onClick={() => setShowPrinciples(!showPrinciples)}
          className="flex w-full items-center justify-between text-left"
        >
          <h3 className="text-xl font-bold text-white">📚 Framework Principles</h3>
          <motion.div
            animate={{ rotate: showPrinciples ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-purple-400"
          >
            ▼
          </motion.div>
        </button>

        <AnimatePresence>
          {showPrinciples && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              {FRAMEWORK_PRINCIPLES.map((principle) => (
                <div key={principle.id} className="rounded-lg bg-black/30 p-4">
                  <h4 className="mb-2 text-lg font-semibold text-cyan-400">{principle.title}</h4>
                  <p className="mb-3 text-sm text-gray-300">{principle.description}</p>
                  <div className="rounded bg-gray-800 p-2 text-xs text-gray-400">
                    <strong>Example:</strong> {principle.example}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Consciousness Stages Journey */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
        <h3 className="mb-6 text-2xl font-bold text-white">
          🛤️ The 7 Stages of Business Consciousness Awakening
        </h3>

        {/* Stage Navigation */}
        <div className="mb-8 flex space-x-2 overflow-x-auto pb-2">
          {CONSCIOUSNESS_STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleStageSelect(stage)}
              className={`flex-shrink-0 rounded-lg border px-4 py-2 transition-all ${
                selectedStage.id === stage.id
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="text-lg">{stage.icon}</div>
                <div className="text-xs font-semibold">{stage.name}</div>
                <div className="text-xs opacity-70">Level {stage.level}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Stage Details */}
        <motion.div
          key={selectedStage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-8 md:grid-cols-2"
        >
          {/* Stage Overview */}
          <div className="space-y-6">
            <div className="rounded-lg bg-black/30 p-6">
              <div className="mb-4 flex items-center space-x-4">
                <div className="text-4xl">{selectedStage.icon}</div>
                <div>
                  <h4 className="text-xl font-bold text-white">{selectedStage.name}</h4>
                  <div className="text-sm text-gray-400">
                    Consciousness Level {selectedStage.level}
                  </div>
                </div>
              </div>
              <p className="mb-4 text-gray-300">{selectedStage.description}</p>
              <div className="rounded border border-purple-700 bg-purple-900/30 p-3">
                <div className="text-sm text-purple-300">
                  <strong>Psychological State:</strong> {selectedStage.psychologicalState}
                </div>
              </div>
            </div>

            {/* Marketing Approach */}
            <div className="rounded-lg bg-black/30 p-6">
              <h5 className="mb-3 text-lg font-semibold text-cyan-400">🎯 Marketing Approach</h5>
              <p className="text-gray-300">{selectedStage.marketingApproach}</p>
            </div>
          </div>

          {/* Stage Tactics */}
          <div className="space-y-6">
            {/* Content Types */}
            <div className="rounded-lg bg-black/30 p-6">
              <h5 className="mb-3 text-lg font-semibold text-green-400">📝 Content Types</h5>
              <div className="space-y-2">
                {selectedStage.contentTypes.map((content, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-400" />
                    <span className="text-sm text-gray-300">{content}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Triggers & Barriers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-black/30 p-4">
                <h6 className="text-md mb-2 font-semibold text-blue-400">⚡ Triggers</h6>
                <div className="space-y-1">
                  {selectedStage.triggers.map((trigger, index) => (
                    <div key={index} className="text-xs text-gray-400">
                      • {trigger}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-black/30 p-4">
                <h6 className="text-md mb-2 font-semibold text-red-400">🚧 Barriers</h6>
                <div className="space-y-1">
                  {selectedStage.barriers.map((barrier, index) => (
                    <div key={index} className="text-xs text-gray-400">
                      • {barrier}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Journey Visualization */}
      {showAnalytics && journeyVisualization.length > 0 && (
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
          <h3 className="mb-6 text-xl font-bold text-white">📊 Consciousness Journey Analytics</h3>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
            {journeyVisualization.map((data, index) => (
              <div key={index} className="rounded-lg bg-black/30 p-4 text-center">
                <div className="mb-2 text-2xl">{CONSCIOUSNESS_STAGES[index].icon}</div>
                <div className="text-lg font-bold text-white">{data.prospects}</div>
                <div className="mb-2 text-xs text-gray-400">{data.stage}</div>
                <div className="text-xs text-cyan-400">
                  {(data.conversionRate * 100).toFixed(1)}% convert
                </div>
                <div className="text-xs text-purple-400">{data.avgTimeInStage} days avg</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consciousness-Based Messaging Examples */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-6">
        <h3 className="mb-6 text-xl font-bold text-white">
          💬 Consciousness-Based Messaging Examples
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-4 text-lg font-semibold text-red-400">
              ❌ Traditional Sales Approach
            </h4>
            <div className="space-y-3">
              <div className="rounded border border-red-700 bg-red-900/20 p-3">
                <div className="text-sm text-red-300">"Buy our business management software"</div>
              </div>
              <div className="rounded border border-red-700 bg-red-900/20 p-3">
                <div className="text-sm text-red-300">
                  "Feature-rich platform with advanced capabilities"
                </div>
              </div>
              <div className="rounded border border-red-700 bg-red-900/20 p-3">
                <div className="text-sm text-red-300">"Book a demo today and get 20% off"</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-green-400">
              ✅ Consciousness Marketing Approach
            </h4>
            <div className="space-y-3">
              <div className="rounded border border-green-700 bg-green-900/20 p-3">
                <div className="text-sm text-green-300">"Is your business unconscious?"</div>
              </div>
              <div className="rounded border border-green-700 bg-green-900/20 p-3">
                <div className="text-sm text-green-300">
                  "Transform your business into a conscious organism"
                </div>
              </div>
              <div className="rounded border border-green-700 bg-green-900/20 p-3">
                <div className="text-sm text-green-300">
                  "Discover your intelligence multiplication potential"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Checklist */}
      <div className="rounded-2xl border border-indigo-700 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-6">
        <h3 className="mb-6 text-xl font-bold text-white">✅ Framework Implementation Checklist</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-4 text-lg font-semibold text-cyan-400">Content Strategy</h4>
            <div className="space-y-2">
              {[
                'Map content to consciousness stages',
                'Create stage-specific nurture sequences',
                'Develop consciousness assessment tools',
                'Build transformation case studies',
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded border border-cyan-400"></div>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-purple-400">Analytics Setup</h4>
            <div className="space-y-2">
              {[
                'Track consciousness stage progression',
                'Measure content engagement by stage',
                'Monitor conversion rates between stages',
                'Analyze stage-specific drop-off points',
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded border border-purple-400"></div>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsciousnessMarketingFramework
