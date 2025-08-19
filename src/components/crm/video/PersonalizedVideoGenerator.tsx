'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  VideoCameraIcon,
  UserIcon,
  MicrophoneIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ShareIcon,
  DownloadIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  FaceSmileIcon,
  LanguageIcon,
  ClockIcon,
  FireIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CameraIcon,
  PresentationChartLineIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface VideoAvatar {
  id: string
  name: string
  type: 'ceo' | 'executive' | 'sales' | 'custom'
  gender: 'male' | 'female'
  ethnicity: string
  industry: string
  thumbnail: string
  voiceId: string
  languages: string[]
  premium: boolean
}

interface VideoTemplate {
  id: string
  name: string
  description: string
  duration: number
  style: 'professional' | 'casual' | 'enthusiastic' | 'authoritative'
  useCase: string
  script: string
  variables: string[]
}

interface VideoSettings {
  avatar: string
  background: string
  voice: string
  language: string
  speed: number
  tone: string
  music: boolean
  subtitles: boolean
  branding: boolean
}

const VIDEO_AVATARS: VideoAvatar[] = [
  {
    id: 'ceo-male-1',
    name: 'David Sterling',
    type: 'ceo',
    gender: 'male',
    ethnicity: 'Caucasian',
    industry: 'Technology',
    thumbnail: '/avatars/ceo-male-1.jpg',
    voiceId: 'en-US-ceo-male-authoritative',
    languages: ['en-US', 'en-GB', 'de-DE'],
    premium: true,
  },
  {
    id: 'ceo-female-1',
    name: 'Sarah Chen',
    type: 'ceo',
    gender: 'female',
    ethnicity: 'Asian',
    industry: 'Technology',
    thumbnail: '/avatars/ceo-female-1.jpg',
    voiceId: 'en-US-ceo-female-confident',
    languages: ['en-US', 'zh-CN', 'ja-JP'],
    premium: true,
  },
  {
    id: 'exec-male-1',
    name: 'Marcus Johnson',
    type: 'executive',
    gender: 'male',
    ethnicity: 'African American',
    industry: 'Finance',
    thumbnail: '/avatars/exec-male-1.jpg',
    voiceId: 'en-US-exec-male-professional',
    languages: ['en-US', 'fr-FR'],
    premium: false,
  },
  {
    id: 'sales-female-1',
    name: 'Emily Rodriguez',
    type: 'sales',
    gender: 'female',
    ethnicity: 'Hispanic',
    industry: 'Sales',
    thumbnail: '/avatars/sales-female-1.jpg',
    voiceId: 'en-US-sales-female-enthusiastic',
    languages: ['en-US', 'es-ES'],
    premium: false,
  },
]

const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'ceo-introduction',
    name: 'CEO Introduction',
    description: 'Professional introduction from a respected industry leader',
    duration: 90,
    style: 'authoritative',
    useCase: 'First contact with C-level executives',
    script: `Hi {prospect_name}, I'm {avatar_name}, and I wanted to personally reach out to you about {company_name}. 

I've been following {prospect_company} in the {industry} space, and I'm impressed by your {recent_achievement}. 

Many {title}s I speak with are facing similar challenges around {pain_point}. We've helped companies like {similar_company} achieve {result}, and I believe we could do the same for {prospect_company}.

I'd love to show you exactly how we could help {prospect_company} {desired_outcome}. Would you be open to a 15-minute conversation this week?`,
    variables: [
      'prospect_name',
      'company_name',
      'prospect_company',
      'industry',
      'recent_achievement',
      'title',
      'pain_point',
      'similar_company',
      'result',
      'desired_outcome',
    ],
  },
  {
    id: 'solution-demo',
    name: 'Solution Demo Preview',
    description: 'Personalized demo of your solution in action',
    duration: 120,
    style: 'enthusiastic',
    useCase: 'Product demonstration and value proposition',
    script: `{prospect_name}, I wanted to show you something that I think will blow your mind.

Imagine if {prospect_company} could {primary_benefit} while {secondary_benefit}. That's exactly what we've built.

Let me show you what this looks like for a {industry} company like yours. *[Demo simulation]* 

As you can see, {prospect_company} would immediately benefit from {specific_benefit}, which could result in {quantified_outcome}.

{prospect_name}, I genuinely believe this could be game-changing for {prospect_company}. Can we set up 20 minutes to explore this further?`,
    variables: [
      'prospect_name',
      'prospect_company',
      'primary_benefit',
      'secondary_benefit',
      'industry',
      'specific_benefit',
      'quantified_outcome',
    ],
  },
  {
    id: 'social-proof',
    name: 'Customer Success Story',
    description: 'Compelling story from a similar customer',
    duration: 75,
    style: 'professional',
    useCase: 'Building credibility and trust',
    script: `{prospect_name}, I thought you'd find this interesting.

Last month, I was speaking with {customer_name}, the {customer_title} at {customer_company} - a {industry} company similar to {prospect_company}.

They told me that before working with us, they were struggling with {challenge}. Sound familiar?

Within {timeframe}, they achieved {result}. {customer_name} said, and I quote: "{testimonial}"

{prospect_name}, I see the same opportunity at {prospect_company}. Would you like to hear more about how we could replicate these results for you?`,
    variables: [
      'prospect_name',
      'customer_name',
      'customer_title',
      'customer_company',
      'industry',
      'prospect_company',
      'challenge',
      'timeframe',
      'result',
      'testimonial',
    ],
  },
  {
    id: 'urgency-creator',
    name: 'Time-Sensitive Opportunity',
    description: 'Creates urgency while providing value',
    duration: 60,
    style: 'professional',
    useCase: 'Follow-up with time-sensitive offers',
    script: `{prospect_name}, I have some news that could impact {prospect_company}.

We've just onboarded {competitor_company}, another {industry} company, and the results have been extraordinary. They've seen {metric} in just {timeframe}.

I'm reaching out because I believe {prospect_company} has even greater potential. But here's the thing - we can only take on {number} new {industry} clients this quarter, and we're down to the last {remaining} spots.

{prospect_name}, I'd hate for {prospect_company} to miss this opportunity. Can we schedule 15 minutes this week to explore if this is a fit?`,
    variables: [
      'prospect_name',
      'prospect_company',
      'competitor_company',
      'industry',
      'metric',
      'timeframe',
      'number',
      'remaining',
    ],
  },
]

const BACKGROUNDS = [
  { id: 'modern-office', name: 'Modern Office', thumbnail: '/backgrounds/modern-office.jpg' },
  {
    id: 'executive-boardroom',
    name: 'Executive Boardroom',
    thumbnail: '/backgrounds/boardroom.jpg',
  },
  { id: 'tech-startup', name: 'Tech Startup', thumbnail: '/backgrounds/tech-startup.jpg' },
  { id: 'coffee-shop', name: 'Coffee Shop', thumbnail: '/backgrounds/coffee-shop.jpg' },
  { id: 'city-skyline', name: 'City Skyline', thumbnail: '/backgrounds/city-skyline.jpg' },
  { id: 'home-office', name: 'Home Office', thumbnail: '/backgrounds/home-office.jpg' },
]

const VOICE_TONES = [
  { id: 'professional', name: 'Professional', description: 'Confident and authoritative' },
  { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic and exciting' },
  { id: 'consultative', name: 'Consultative', description: 'Advisory and thoughtful' },
]

export default function PersonalizedVideoGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<VideoAvatar | null>(null)
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    avatar: '',
    background: 'modern-office',
    voice: 'professional',
    language: 'en-US',
    speed: 1.0,
    tone: 'professional',
    music: false,
    subtitles: true,
    branding: true,
  })
  const [scriptVariables, setScriptVariables] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<unknown>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const updateScriptVariable = useCallback((variable: string, value: string) => {
    setScriptVariables((prev) => ({
      ...prev,
      [variable]: value,
    }))
  }, [])

  const generatePersonalizedScript = useCallback(() => {
    if (!selectedTemplate) return ''

    let script = selectedTemplate.script
    Object.entries(scriptVariables).forEach(([variable, value]) => {
      script = script.replace(new RegExp(`{${variable}}`, 'g'), value)
    })
    return script
  }, [selectedTemplate, scriptVariables])

  const generateVideo = useCallback(async () => {
    if (!selectedTemplate || !selectedAvatar) {
      toast.error('Please select a template and avatar')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/crm/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          avatar: selectedAvatar,
          settings: videoSettings,
          script: generatePersonalizedScript(),
          variables: scriptVariables,
        }),
      })

      const result = await response.json()
      setGeneratedVideo(result)
      toast.success('Video generated successfully!')
    } catch (error) {
      toast.error('Failed to generate video')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedTemplate, selectedAvatar, videoSettings, generatePersonalizedScript, scriptVariables])

  const shareVideo = useCallback(
    async (channel: string) => {
      if (!generatedVideo) return

      try {
        const response = await fetch('/api/crm/video/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: generatedVideo.id,
            channel,
            recipientData: scriptVariables,
          }),
        })

        if (response.ok) {
          toast.success(`Video shared via ${channel}!`)
        }
      } catch (error) {
        toast.error('Failed to share video')
      }
    },
    [generatedVideo, scriptVariables]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Personalized Video Generator</h1>
          <p className="text-lg text-gray-600">
            Create stunning AI-powered video messages that convert
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="space-y-6 lg:col-span-1">
            {/* Template Selection */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <DocumentTextIcon className="mr-2 h-5 w-5 text-purple-600" />
                Video Template
              </h3>
              <div className="space-y-3">
                {VIDEO_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <ClockIcon className="mr-1 h-4 w-4" />
                      {template.duration}s • {template.style}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <UserIcon className="mr-2 h-5 w-5 text-blue-600" />
                AI Avatar
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {VIDEO_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative rounded-lg border-2 p-3 transition-all ${
                      selectedAvatar?.id === avatar.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-gray-200">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">{avatar.name}</h4>
                    <p className="text-xs text-gray-600">{avatar.industry}</p>
                    {avatar.premium && (
                      <span className="absolute top-1 right-1 rounded bg-gradient-to-r from-purple-600 to-pink-600 px-1 py-0.5 text-xs text-white">
                        PRO
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <AdjustmentsHorizontalIcon className="mr-2 h-5 w-5 text-green-600" />
                Settings
              </h3>

              {/* Background */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Background</label>
                <select
                  value={videoSettings.background}
                  onChange={(e) =>
                    setVideoSettings((prev) => ({ ...prev, background: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  {BACKGROUNDS.map((bg) => (
                    <option key={bg.id} value={bg.id}>
                      {bg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Tone */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Voice Tone</label>
                <select
                  value={videoSettings.tone}
                  onChange={(e) => setVideoSettings((prev) => ({ ...prev, tone: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  {VOICE_TONES.map((tone) => (
                    <option key={tone.id} value={tone.id}>
                      {tone.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Speech Speed: {videoSettings.speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={videoSettings.speed}
                  onChange={(e) =>
                    setVideoSettings((prev) => ({ ...prev, speed: parseFloat(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={videoSettings.subtitles}
                    onChange={(e) =>
                      setVideoSettings((prev) => ({ ...prev, subtitles: e.target.checked }))
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Add subtitles</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={videoSettings.music}
                    onChange={(e) =>
                      setVideoSettings((prev) => ({ ...prev, music: e.target.checked }))
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Background music</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={videoSettings.branding}
                    onChange={(e) =>
                      setVideoSettings((prev) => ({ ...prev, branding: e.target.checked }))
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include branding</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6 lg:col-span-2">
            {/* Script Customization */}
            {selectedTemplate && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 flex items-center text-lg font-semibold">
                  <PresentationChartLineIcon className="mr-2 h-5 w-5 text-orange-600" />
                  Personalize Your Message
                </h3>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="mb-1 block text-sm font-medium text-gray-700 capitalize">
                        {variable.replace(/_/g, ' ')}
                      </label>
                      <input
                        value={scriptVariables[variable] || ''}
                        onChange={(e) => updateScriptVariable(variable, e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500"
                        placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Script Preview */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium text-gray-900">Script Preview:</h4>
                  <p className="text-sm whitespace-pre-line text-gray-700">
                    {generatePersonalizedScript()}
                  </p>
                </div>
              </div>
            )}

            {/* Video Preview/Generation */}
            <div className="overflow-hidden rounded-xl bg-white shadow-lg">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Video Preview</h3>
                  <div className="flex gap-2">
                    {!generatedVideo ? (
                      <button
                        onClick={generateVideo}
                        disabled={!selectedTemplate || !selectedAvatar || isGenerating}
                        className="flex items-center rounded-lg bg-white px-6 py-2 text-purple-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-purple-600" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="mr-2 h-4 w-4" />
                            Generate Video
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => shareVideo('email')}
                          className="flex items-center rounded-lg bg-white px-4 py-2 text-purple-600 transition-colors hover:bg-gray-100"
                        >
                          <ShareIcon className="mr-2 h-4 w-4" />
                          Share
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.download = `personalized-video-${Date.now()}.mp4`
                            link.href = generatedVideo.videoUrl
                            link.click()
                          }}
                          className="flex items-center rounded-lg bg-white px-4 py-2 text-purple-600 transition-colors hover:bg-gray-100"
                        >
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Download
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {generatedVideo ? (
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    <video
                      ref={videoRef}
                      src={generatedVideo.videoUrl}
                      controls
                      className="h-full w-full"
                      poster={generatedVideo.thumbnailUrl}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100">
                    <div className="text-center">
                      <VideoCameraIcon className="mx-auto mb-4 h-24 w-24 text-gray-300" />
                      <p className="text-gray-500">
                        {selectedTemplate && selectedAvatar
                          ? 'Click "Generate Video" to create your personalized message'
                          : 'Select a template and avatar to get started'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Generation Options */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Delivery Options</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <button className="flex flex-col items-center rounded-lg border p-4 transition-all hover:border-purple-500 hover:bg-purple-50">
                  <GlobeAltIcon className="mb-2 h-8 w-8 text-purple-600" />
                  <span className="text-sm font-medium">Email</span>
                </button>
                <button className="flex flex-col items-center rounded-lg border p-4 transition-all hover:border-blue-500 hover:bg-blue-50">
                  <ChatBubbleLeftRightIcon className="mb-2 h-8 w-8 text-blue-600" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
                <button className="flex flex-col items-center rounded-lg border p-4 transition-all hover:border-green-500 hover:bg-green-50">
                  <DevicePhoneMobileIcon className="mb-2 h-8 w-8 text-green-600" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center rounded-lg border p-4 transition-all hover:border-orange-500 hover:bg-orange-50">
                  <EnvelopeIcon className="mb-2 h-8 w-8 text-orange-600" />
                  <span className="text-sm font-medium">Direct Mail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
