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
      'Peer success stories that create gentle FOMO'
    ],
    triggers: [
      'Competitor advancement',
      'Operational breakdown',
      'Growth plateau',
      'Team frustration signals'
    ],
    barriers: [
      'Status quo bias',
      'Change resistance',
      'Investment hesitation',
      'Learning curve fear'
    ],
    nextStage: 'aware',
    color: '#6B7280',
    icon: '😴'
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
      'Competitive disadvantage analysis'
    ],
    triggers: [
      'Problem becomes painful',
      'Competition pressure increases',
      'Team productivity questions',
      'Growth ambition emerges'
    ],
    barriers: [
      'Problem seems too complex',
      'Overwhelm paralysis',
      'Resource constraints',
      'Uncertainty about solutions'
    ],
    nextStage: 'seeking',
    color: '#F59E0B',
    icon: '👁️'
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
      'ROI calculation tools'
    ],
    triggers: [
      'Research validation',
      'Peer recommendations',
      'Clear value propositions',
      'Risk mitigation assurance'
    ],
    barriers: [
      'Information overload',
      'Analysis paralysis',
      'Budget concerns',
      'Implementation fears'
    ],
    nextStage: 'understanding',
    color: '#10B981',
    icon: '🔍'
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
      'Success story immersion'
    ],
    triggers: [
      'Vision clarity achieved',
      'Benefits quantified',
      'Success path visible',
      'Confidence building'
    ],
    barriers: [
      'Implementation complexity',
      'Change management concerns',
      'Team resistance fears',
      'Investment justification'
    ],
    nextStage: 'committed',
    color: '#3B82F6',
    icon: '💡'
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
      'Onboarding experience previews'
    ],
    triggers: [
      'Budget allocation',
      'Team alignment',
      'Timeline establishment',
      'Success metrics definition'
    ],
    barriers: [
      'Final investment hesitation',
      'Vendor selection uncertainty',
      'Timing concerns',
      'Success guarantee needs'
    ],
    nextStage: 'transforming',
    color: '#8B5CF6',
    icon: '🎯'
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
      'Expansion opportunity identification'
    ],
    triggers: [
      'Early wins achieved',
      'Team adoption success',
      'Efficiency improvements',
      'Expansion readiness'
    ],
    barriers: [
      'Implementation challenges',
      'Adoption resistance',
      'Integration complexities',
      'ROI timeline concerns'
    ],
    nextStage: 'conscious',
    color: '#06B6D4',
    icon: '🚀'
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
      'Advocacy program invitations'
    ],
    triggers: [
      'Transformation success',
      'Competitive advantage',
      'Team empowerment',
      'Growth acceleration'
    ],
    barriers: [
      'Complacency risk',
      'Expansion hesitation',
      'Leadership transition',
      'Market evolution'
    ],
    nextStage: 'conscious',
    color: '#EC4899',
    icon: '✨'
  }
]

const FRAMEWORK_PRINCIPLES = [
  {
    id: 'consciousness-first',
    title: 'Consciousness Over Conversion',
    description: 'Focus on raising awareness rather than pushing for immediate sales',
    example: 'Ask "Is your business unconscious?" instead of "Buy our software"'
  },
  {
    id: 'education-over-promotion',
    title: 'Education Over Promotion',
    description: 'Teach prospects about intelligence multiplication before selling',
    example: 'Explain 1×2×3×4×5=120 vs 1+1+1+1+1=5 concept'
  },
  {
    id: 'journey-respect',
    title: 'Respect the Journey',
    description: 'Meet prospects where they are, don\'t force advancement',
    example: 'Provide stage-appropriate content, not one-size-fits-all'
  },
  {
    id: 'transformation-focus',
    title: 'Transformation Over Transaction',
    description: 'Emphasize business evolution rather than feature benefits',
    example: 'Promise "conscious business organism" not "better software"'
  }
]

const ConsciousnessMarketingFramework: React.FC<ConsciousnessMarketingFrameworkProps> = ({
  showAnalytics = true,
  interactiveDemo = false,
  onStageChange,
  className = ''
}) => {
  const [selectedStage, setSelectedStage] = useState<ConsciousnessStage>(CONSCIOUSNESS_STAGES[0])
  const [journeyVisualization, setJourneyVisualization] = useState<any[]>([])
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
        avgTimeInStage: Math.floor(Math.random() * 30) + 7
      }))
      setJourneyVisualization(mockJourneyData)
    }
  }, [showAnalytics])

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Framework Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-thin text-white">
          🧠 Consciousness Marketing Framework
        </h2>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          Revolutionary approach that guides prospects through consciousness awakening 
          rather than traditional sales pressure
        </p>
      </div>

      {/* Core Principles */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-2xl p-6">
        <button
          onClick={() => setShowPrinciples(!showPrinciples)}
          className="flex items-center justify-between w-full text-left"
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
              className="mt-6 grid md:grid-cols-2 gap-4"
            >
              {FRAMEWORK_PRINCIPLES.map((principle) => (
                <div key={principle.id} className="bg-black/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">
                    {principle.title}
                  </h4>
                  <p className="text-gray-300 text-sm mb-3">
                    {principle.description}
                  </p>
                  <div className="bg-gray-800 rounded p-2 text-xs text-gray-400">
                    <strong>Example:</strong> {principle.example}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Consciousness Stages Journey */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6">
          🛤️ The 7 Stages of Business Consciousness Awakening
        </h3>
        
        {/* Stage Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {CONSCIOUSNESS_STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleStageSelect(stage)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-all ${
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
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Stage Overview */}
          <div className="space-y-6">
            <div className="bg-black/30 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">{selectedStage.icon}</div>
                <div>
                  <h4 className="text-xl font-bold text-white">{selectedStage.name}</h4>
                  <div className="text-sm text-gray-400">Consciousness Level {selectedStage.level}</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{selectedStage.description}</p>
              <div className="bg-purple-900/30 border border-purple-700 rounded p-3">
                <div className="text-sm text-purple-300">
                  <strong>Psychological State:</strong> {selectedStage.psychologicalState}
                </div>
              </div>
            </div>

            {/* Marketing Approach */}
            <div className="bg-black/30 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-cyan-400 mb-3">🎯 Marketing Approach</h5>
              <p className="text-gray-300">{selectedStage.marketingApproach}</p>
            </div>
          </div>

          {/* Stage Tactics */}
          <div className="space-y-6">
            {/* Content Types */}
            <div className="bg-black/30 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-green-400 mb-3">📝 Content Types</h5>
              <div className="space-y-2">
                {selectedStage.contentTypes.map((content, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{content}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Triggers & Barriers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-lg p-4">
                <h6 className="text-md font-semibold text-blue-400 mb-2">⚡ Triggers</h6>
                <div className="space-y-1">
                  {selectedStage.triggers.map((trigger, index) => (
                    <div key={index} className="text-xs text-gray-400">• {trigger}</div>
                  ))}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h6 className="text-md font-semibold text-red-400 mb-2">🚧 Barriers</h6>
                <div className="space-y-1">
                  {selectedStage.barriers.map((barrier, index) => (
                    <div key={index} className="text-xs text-gray-400">• {barrier}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Journey Visualization */}
      {showAnalytics && journeyVisualization.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">📊 Consciousness Journey Analytics</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4">
            {journeyVisualization.map((data, index) => (
              <div key={index} className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">{CONSCIOUSNESS_STAGES[index].icon}</div>
                <div className="text-lg font-bold text-white">{data.prospects}</div>
                <div className="text-xs text-gray-400 mb-2">{data.stage}</div>
                <div className="text-xs text-cyan-400">
                  {(data.conversionRate * 100).toFixed(1)}% convert
                </div>
                <div className="text-xs text-purple-400">
                  {data.avgTimeInStage} days avg
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consciousness-Based Messaging Examples */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">💬 Consciousness-Based Messaging Examples</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-red-400 mb-4">❌ Traditional Sales Approach</h4>
            <div className="space-y-3">
              <div className="bg-red-900/20 border border-red-700 rounded p-3">
                <div className="text-sm text-red-300">"Buy our business management software"</div>
              </div>
              <div className="bg-red-900/20 border border-red-700 rounded p-3">
                <div className="text-sm text-red-300">"Feature-rich platform with advanced capabilities"</div>
              </div>
              <div className="bg-red-900/20 border border-red-700 rounded p-3">
                <div className="text-sm text-red-300">"Book a demo today and get 20% off"</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-green-400 mb-4">✅ Consciousness Marketing Approach</h4>
            <div className="space-y-3">
              <div className="bg-green-900/20 border border-green-700 rounded p-3">
                <div className="text-sm text-green-300">"Is your business unconscious?"</div>
              </div>
              <div className="bg-green-900/20 border border-green-700 rounded p-3">
                <div className="text-sm text-green-300">"Transform your business into a conscious organism"</div>
              </div>
              <div className="bg-green-900/20 border border-green-700 rounded p-3">
                <div className="text-sm text-green-300">"Discover your intelligence multiplication potential"</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Checklist */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">✅ Framework Implementation Checklist</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Content Strategy</h4>
            <div className="space-y-2">
              {[
                'Map content to consciousness stages',
                'Create stage-specific nurture sequences',
                'Develop consciousness assessment tools',
                'Build transformation case studies'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-cyan-400 rounded"></div>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-purple-400 mb-4">Analytics Setup</h4>
            <div className="space-y-2">
              {[
                'Track consciousness stage progression',
                'Measure content engagement by stage',
                'Monitor conversion rates between stages',
                'Analyze stage-specific drop-off points'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-purple-400 rounded"></div>
                  <span className="text-gray-300 text-sm">{item}</span>
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