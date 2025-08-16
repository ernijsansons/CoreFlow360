'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  GiftIcon,
  MegaphoneIcon,
  PuzzlePieceIcon,
  HeartIcon,
  BoltIcon,
  FireIcon,
  StarIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  TrophyIcon,
  GlobeAltIcon,
  MusicalNoteIcon,
  PhotoIcon,
  QrCodeIcon,
  TicketIcon,
  CakeIcon,
  MapIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  NewspaperIcon,
  RadioIcon,
  TvIcon,
  WifiIcon,
  CloudIcon,
  SunIcon,
  MoonIcon,
  BeakerIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  UserGroupIcon,
  BellIcon,
  ChartLineIcon,
  CalendarIcon,
  RectangleStackIcon,
  MicrophoneIcon,
  EyeIcon,
  AcademicCapIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface CreativeOutreachMethod {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  effectiveness: number
  personalizationLevel: 'low' | 'medium' | 'high' | 'ultra'
  channels: string[]
  templates: OutreachTemplate[]
  aiPrompt: string
}

interface OutreachTemplate {
  id: string
  name: string
  preview: string
  variables: string[]
  mediaType: 'text' | 'image' | 'video' | 'interactive' | 'physical'
}

const CREATIVE_OUTREACH_METHODS: CreativeOutreachMethod[] = [
  // Visual Impact Methods (1-20)
  {
    id: 'personalized-infographic',
    name: 'Decision Impact Infographic',
    description: 'AI-generated infographic with decision maker\'s name showing business impact',
    icon: PhotoIcon,
    category: 'Visual Impact',
    effectiveness: 95,
    personalizationLevel: 'ultra',
    channels: ['email', 'linkedin', 'whatsapp'],
    templates: [],
    aiPrompt: 'Generate personalized business impact visualization'
  },
  {
    id: 'animated-roi-calculator',
    name: 'Interactive ROI Calculator',
    description: 'Personalized animated calculator showing exact savings',
    icon: BeakerIcon,
    category: 'Visual Impact',
    effectiveness: 92,
    personalizationLevel: 'high',
    channels: ['email', 'web'],
    templates: [],
    aiPrompt: 'Create interactive ROI visualization'
  },
  {
    id: 'ceo-desk-mockup',
    name: 'CEO Desk AR Mockup',
    description: 'AR visualization of solution on their actual desk',
    icon: ComputerDesktopIcon,
    category: 'Visual Impact',
    effectiveness: 90,
    personalizationLevel: 'ultra',
    channels: ['mobile', 'email'],
    templates: [],
    aiPrompt: 'Generate AR desk mockup'
  },
  {
    id: 'company-future-vision',
    name: 'Company Future Vision Board',
    description: 'AI-generated vision of their company after implementation',
    icon: GlobeAltIcon,
    category: 'Visual Impact',
    effectiveness: 88,
    personalizationLevel: 'high',
    channels: ['email', 'presentation'],
    templates: [],
    aiPrompt: 'Create future state visualization'
  },
  {
    id: 'competitor-comparison-chart',
    name: 'Dynamic Competitor Analysis',
    description: 'Real-time animated chart showing competitive advantage',
    icon: ChartBarIcon,
    category: 'Visual Impact',
    effectiveness: 87,
    personalizationLevel: 'medium',
    channels: ['email', 'web'],
    templates: [],
    aiPrompt: 'Generate competitive analysis visual'
  },

  // Video & Animation Methods (21-40)
  {
    id: 'ai-ceo-conversation',
    name: 'AI CEO Conversation',
    description: 'Deepfake video of their favorite CEO recommending solution',
    icon: VideoCameraIcon,
    category: 'Video & Animation',
    effectiveness: 93,
    personalizationLevel: 'ultra',
    channels: ['email', 'linkedin'],
    templates: [],
    aiPrompt: 'Create AI CEO recommendation video'
  },
  {
    id: 'personalized-movie-trailer',
    name: 'Success Story Movie Trailer',
    description: 'Hollywood-style trailer of their company\'s success story',
    icon: TvIcon,
    category: 'Video & Animation',
    effectiveness: 91,
    personalizationLevel: 'ultra',
    channels: ['email', 'social'],
    templates: [],
    aiPrompt: 'Generate company success movie trailer'
  },
  {
    id: 'animated-journey-map',
    name: 'Customer Journey Animation',
    description: 'Personalized animation of improved customer experience',
    icon: MapIcon,
    category: 'Video & Animation',
    effectiveness: 89,
    personalizationLevel: 'high',
    channels: ['email', 'web'],
    templates: [],
    aiPrompt: 'Create customer journey animation'
  },
  {
    id: 'time-lapse-transformation',
    name: 'Business Transformation Time-lapse',
    description: 'Visualization of business transformation over time',
    icon: ClockIcon,
    category: 'Video & Animation',
    effectiveness: 86,
    personalizationLevel: 'high',
    channels: ['email', 'presentation'],
    templates: [],
    aiPrompt: 'Generate transformation time-lapse'
  },
  {
    id: 'whiteboard-explanation',
    name: 'AI Whiteboard Explainer',
    description: 'Personalized whiteboard video addressing their challenges',
    icon: PencilIcon,
    category: 'Video & Animation',
    effectiveness: 85,
    personalizationLevel: 'medium',
    channels: ['email', 'web'],
    templates: [],
    aiPrompt: 'Create whiteboard explainer video'
  },

  // Interactive Experiences (41-60)
  {
    id: 'virtual-office-tour',
    name: 'Virtual Office Implementation',
    description: 'VR tour of their office with solution implemented',
    icon: BuildingOfficeIcon,
    category: 'Interactive',
    effectiveness: 94,
    personalizationLevel: 'ultra',
    channels: ['vr', 'web'],
    templates: [],
    aiPrompt: 'Create virtual office tour'
  },
  {
    id: 'gamified-savings-quest',
    name: 'Savings Quest Game',
    description: 'Interactive game showing potential savings as rewards',
    icon: TrophyIcon,
    category: 'Interactive',
    effectiveness: 90,
    personalizationLevel: 'high',
    channels: ['web', 'mobile'],
    templates: [],
    aiPrompt: 'Design savings quest game'
  },
  {
    id: 'ai-chatbot-advisor',
    name: 'Personal AI Business Advisor',
    description: 'AI chatbot that knows their business and gives advice',
    icon: ChatBubbleLeftRightIcon,
    category: 'Interactive',
    effectiveness: 88,
    personalizationLevel: 'ultra',
    channels: ['web', 'whatsapp'],
    templates: [],
    aiPrompt: 'Create AI business advisor'
  },
  {
    id: 'decision-tree-explorer',
    name: 'Interactive Decision Explorer',
    description: 'Choose-your-own-adventure style decision tree',
    icon: ChartBarIcon,
    category: 'Interactive',
    effectiveness: 86,
    personalizationLevel: 'medium',
    channels: ['web', 'email'],
    templates: [],
    aiPrompt: 'Build decision tree explorer'
  },
  {
    id: 'virtual-workshop',
    name: 'Personalized Virtual Workshop',
    description: 'AI-led workshop addressing their specific challenges',
    icon: AcademicCapIcon,
    category: 'Interactive',
    effectiveness: 84,
    personalizationLevel: 'high',
    channels: ['zoom', 'web'],
    templates: [],
    aiPrompt: 'Design virtual workshop'
  },

  // Physical & Tangible (61-70)
  {
    id: 'executive-survival-kit',
    name: 'Executive Survival Kit',
    description: 'Physical box with items solving their pain points',
    icon: GiftIcon,
    category: 'Physical',
    effectiveness: 96,
    personalizationLevel: 'ultra',
    channels: ['direct-mail'],
    templates: [],
    aiPrompt: 'Design executive survival kit'
  },
  {
    id: 'custom-puzzle-solution',
    name: 'Solution Puzzle Box',
    description: 'Physical puzzle that reveals solution when solved',
    icon: PuzzlePieceIcon,
    category: 'Physical',
    effectiveness: 92,
    personalizationLevel: 'high',
    channels: ['direct-mail'],
    templates: [],
    aiPrompt: 'Create solution puzzle'
  },
  {
    id: 'augmented-business-card',
    name: 'AR Business Card',
    description: 'Business card that shows AR visualization when scanned',
    icon: QrCodeIcon,
    category: 'Physical',
    effectiveness: 89,
    personalizationLevel: 'medium',
    channels: ['in-person', 'direct-mail'],
    templates: [],
    aiPrompt: 'Design AR business card'
  },
  {
    id: 'success-timeline-poster',
    name: 'Future Success Timeline',
    description: 'Large poster showing their company\'s future milestones',
    icon: CalendarIcon,
    category: 'Physical',
    effectiveness: 85,
    personalizationLevel: 'high',
    channels: ['direct-mail'],
    templates: [],
    aiPrompt: 'Create success timeline poster'
  },
  {
    id: 'mini-billboard',
    name: 'Desktop Mini Billboard',
    description: 'Miniature billboard with rotating personalized messages',
    icon: RectangleStackIcon,
    category: 'Physical',
    effectiveness: 83,
    personalizationLevel: 'high',
    channels: ['direct-mail'],
    templates: [],
    aiPrompt: 'Design mini billboard messages'
  },

  // Audio & Voice (71-80)
  {
    id: 'personalized-podcast',
    name: 'CEO Success Podcast Episode',
    description: 'AI-generated podcast about their success story',
    icon: MicrophoneIcon,
    category: 'Audio',
    effectiveness: 87,
    personalizationLevel: 'ultra',
    channels: ['email', 'spotify'],
    templates: [],
    aiPrompt: 'Create personalized podcast episode'
  },
  {
    id: 'voice-message-celebrity',
    name: 'Celebrity Voice Message',
    description: 'Personalized message in celebrity voice about their business',
    icon: MusicalNoteIcon,
    category: 'Audio',
    effectiveness: 85,
    personalizationLevel: 'high',
    channels: ['whatsapp', 'email'],
    templates: [],
    aiPrompt: 'Generate celebrity voice message'
  },
  {
    id: 'success-anthem',
    name: 'Company Success Anthem',
    description: 'AI-composed song about their company\'s future',
    icon: MusicalNoteIcon,
    category: 'Audio',
    effectiveness: 82,
    personalizationLevel: 'ultra',
    channels: ['email', 'social'],
    templates: [],
    aiPrompt: 'Compose company success anthem'
  },
  {
    id: 'radio-ad-simulation',
    name: 'Future Radio Ad',
    description: 'Simulated radio ad of their successful company',
    icon: RadioIcon,
    category: 'Audio',
    effectiveness: 80,
    personalizationLevel: 'high',
    channels: ['email', 'web'],
    templates: [],
    aiPrompt: 'Create future radio ad'
  },
  {
    id: 'meditation-success',
    name: 'Success Visualization Meditation',
    description: 'Guided meditation visualizing their business success',
    icon: SparklesIcon,
    category: 'Audio',
    effectiveness: 78,
    personalizationLevel: 'medium',
    channels: ['app', 'email'],
    templates: [],
    aiPrompt: 'Create success meditation'
  },

  // Social & Viral (81-90)
  {
    id: 'linkedin-takeover',
    name: 'LinkedIn Feed Takeover',
    description: 'Coordinated posts from industry leaders mentioning them',
    icon: GlobeAltIcon,
    category: 'Social',
    effectiveness: 91,
    personalizationLevel: 'ultra',
    channels: ['linkedin'],
    templates: [],
    aiPrompt: 'Orchestrate LinkedIn campaign'
  },
  {
    id: 'viral-challenge',
    name: 'Business Transformation Challenge',
    description: 'Viral challenge featuring their company',
    icon: FireIcon,
    category: 'Social',
    effectiveness: 88,
    personalizationLevel: 'high',
    channels: ['tiktok', 'instagram'],
    templates: [],
    aiPrompt: 'Create viral challenge'
  },
  {
    id: 'employee-testimonials',
    name: 'Future Employee Testimonials',
    description: 'AI-generated testimonials from happy future employees',
    icon: UserGroupIcon,
    category: 'Social',
    effectiveness: 86,
    personalizationLevel: 'high',
    channels: ['linkedin', 'glassdoor'],
    templates: [],
    aiPrompt: 'Generate employee testimonials'
  },
  {
    id: 'industry-news-feature',
    name: 'Fake Future News Article',
    description: 'News article about their company\'s future success',
    icon: NewspaperIcon,
    category: 'Social',
    effectiveness: 84,
    personalizationLevel: 'ultra',
    channels: ['email', 'web'],
    templates: [],
    aiPrompt: 'Write future news article'
  },
  {
    id: 'customer-success-stories',
    name: 'Customer Video Testimonials',
    description: 'AI-generated customer success story videos',
    icon: VideoCameraIcon,
    category: 'Social',
    effectiveness: 82,
    personalizationLevel: 'high',
    channels: ['youtube', 'email'],
    templates: [],
    aiPrompt: 'Create customer testimonials'
  },

  // Data & Analytics (91-100)
  {
    id: 'real-time-competitor-alert',
    name: 'Competitor Move Alerts',
    description: 'Real-time alerts when competitors make moves',
    icon: BellIcon,
    category: 'Data-Driven',
    effectiveness: 93,
    personalizationLevel: 'high',
    channels: ['sms', 'email'],
    templates: [],
    aiPrompt: 'Monitor competitor activities'
  },
  {
    id: 'market-opportunity-radar',
    name: 'Opportunity Radar',
    description: 'AI-powered alerts for market opportunities',
    icon: ChartBarIcon,
    category: 'Data-Driven',
    effectiveness: 90,
    personalizationLevel: 'high',
    channels: ['dashboard', 'email'],
    templates: [],
    aiPrompt: 'Identify market opportunities'
  },
  {
    id: 'predictive-success-model',
    name: 'Success Prediction Model',
    description: 'ML model showing their success probability',
    icon: ChartLineIcon,
    category: 'Data-Driven',
    effectiveness: 88,
    personalizationLevel: 'ultra',
    channels: ['web', 'presentation'],
    templates: [],
    aiPrompt: 'Build success prediction model'
  },
  {
    id: 'industry-benchmark-report',
    name: 'Personalized Benchmark Report',
    description: 'How they compare to industry leaders',
    icon: ChartBarIcon,
    category: 'Data-Driven',
    effectiveness: 86,
    personalizationLevel: 'high',
    channels: ['email', 'pdf'],
    templates: [],
    aiPrompt: 'Generate benchmark report'
  },
  {
    id: 'growth-simulation',
    name: 'Growth Simulation Engine',
    description: 'Interactive simulation of business growth scenarios',
    icon: RocketLaunchIcon,
    category: 'Data-Driven',
    effectiveness: 85,
    personalizationLevel: 'ultra',
    channels: ['web', 'app'],
    templates: [],
    aiPrompt: 'Create growth simulation'
  }
]

const ENGAGEMENT_SEQUENCES = [
  {
    id: 'executive-impact',
    name: 'Executive Impact Sequence',
    description: 'High-touch sequence for C-level executives',
    steps: [
      { day: 0, methods: ['personalized-infographic', 'linkedin-connection'] },
      { day: 3, methods: ['ai-ceo-conversation', 'industry-news-feature'] },
      { day: 7, methods: ['executive-survival-kit', 'personalized-podcast'] },
      { day: 14, methods: ['virtual-office-tour', 'success-timeline-poster'] },
      { day: 21, methods: ['roi-calculator', 'competitor-comparison-chart'] }
    ]
  },
  {
    id: 'innovation-showcase',
    name: 'Innovation Showcase Sequence',
    description: 'Tech-forward sequence for innovation leaders',
    steps: [
      { day: 0, methods: ['ar-business-card', 'animated-roi-calculator'] },
      { day: 2, methods: ['virtual-workshop', 'ai-chatbot-advisor'] },
      { day: 5, methods: ['gamified-savings-quest', 'future-vision-board'] },
      { day: 10, methods: ['growth-simulation', 'predictive-success-model'] },
      { day: 15, methods: ['personalized-movie-trailer', 'viral-challenge'] }
    ]
  }
]

export default function CreativeOutreachAutomation() {
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [activeSequence, setActiveSequence] = useState<any>(null)
  const [targetProfile, setTargetProfile] = useState({
    name: '',
    title: '',
    company: '',
    industry: '',
    challenges: [],
    preferences: []
  })
  const [generatingContent, setGeneratingContent] = useState(false)
  const [previewContent, setPreviewContent] = useState<any>(null)

  const generatePersonalizedContent = useCallback(async (method: CreativeOutreachMethod) => {
    setGeneratingContent(true)
    try {
      const response = await fetch('/api/crm/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: method.id,
          targetProfile,
          aiPrompt: method.aiPrompt
        })
      })

      const result = await response.json()
      setPreviewContent(result)
      toast.success(`Generated ${method.name} content!`)
    } catch (error) {
      toast.error('Failed to generate content')
    } finally {
      setGeneratingContent(false)
    }
  }, [targetProfile])

  const launchSequence = useCallback(async () => {
    if (!activeSequence || selectedMethods.length === 0) {
      toast.error('Please select methods and a sequence')
      return
    }

    try {
      const response = await fetch('/api/crm/outreach/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence: activeSequence,
          methods: selectedMethods,
          targetProfile
        })
      })

      if (response.ok) {
        toast.success('Outreach sequence launched!')
      }
    } catch (error) {
      toast.error('Failed to launch sequence')
    }
  }, [activeSequence, selectedMethods, targetProfile])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Creative Outreach Automation
          </h1>
          <p className="text-lg text-gray-600">
            100 innovative ways to engage decision makers
          </p>
        </div>

        {/* Target Profile */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Target Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision Maker Name
              </label>
              <input
                value={targetProfile.name}
                onChange={(e) => setTargetProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                value={targetProfile.title}
                onChange={(e) => setTargetProfile(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="CEO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                value={targetProfile.company}
                onChange={(e) => setTargetProfile(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                value={targetProfile.industry}
                onChange={(e) => setTargetProfile(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
              </select>
            </div>
          </div>
        </div>

        {/* Creative Methods Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Creative Outreach Methods</h2>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from(new Set(CREATIVE_OUTREACH_METHODS.map(m => m.category))).map(category => (
              <button
                key={category}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {CREATIVE_OUTREACH_METHODS.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  if (selectedMethods.includes(method.id)) {
                    setSelectedMethods(prev => prev.filter(id => id !== method.id))
                  } else {
                    setSelectedMethods(prev => [...prev, method.id])
                  }
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMethods.includes(method.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <method.icon className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-500">
                    {method.effectiveness}% effective
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{method.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    method.personalizationLevel === 'ultra' ? 'bg-red-100 text-red-700' :
                    method.personalizationLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                    method.personalizationLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {method.personalizationLevel} personalization
                  </span>
                  <div className="flex gap-1">
                    {method.channels.slice(0, 2).map(channel => (
                      <span key={channel} className="text-xs text-gray-500">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engagement Sequences */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Engagement Sequences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENGAGEMENT_SEQUENCES.map((sequence) => (
              <div
                key={sequence.id}
                onClick={() => setActiveSequence(sequence)}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  activeSequence?.id === sequence.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">{sequence.name}</h3>
                <p className="text-gray-600 mb-4">{sequence.description}</p>
                <div className="space-y-2">
                  {sequence.steps.map((step, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">Day {step.day}:</span>
                      <span className="text-gray-600">{step.methods.length} touchpoints</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              if (selectedMethods.length > 0) {
                const method = CREATIVE_OUTREACH_METHODS.find(m => m.id === selectedMethods[0])
                if (method) generatePersonalizedContent(method)
              }
            }}
            disabled={selectedMethods.length === 0 || generatingContent}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
          >
            {generatingContent ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Preview...
              </>
            ) : (
              <>
                <EyeIcon className="w-5 h-5 mr-2" />
                Preview Content
              </>
            )}
          </button>
          <button
            onClick={launchSequence}
            disabled={selectedMethods.length === 0 || !activeSequence}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center disabled:opacity-50"
          >
            <RocketLaunchIcon className="w-5 h-5 mr-2" />
            Launch Sequence
          </button>
        </div>
      </div>
    </div>
  )
}