/**
 * Survey Builder Component
 * Free survey creation tool with professional templates
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye,
  Download,
  Copy,
  CheckSquare,
  Circle,
  Type,
  Star,
  Calendar,
  Hash,
  ArrowUp,
  ArrowDown,
  Save
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

interface SurveyQuestion {
  id: string
  type: 'text' | 'textarea' | 'multiple_choice' | 'single_choice' | 'rating' | 'scale' | 'date' | 'number'
  title: string
  description?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

interface Survey {
  id: string
  title: string
  description: string
  questions: SurveyQuestion[]
  settings: {
    anonymous: boolean
    showProgressBar: boolean
    randomizeQuestions: boolean
    oneResponsePerUser: boolean
    collectEmail: boolean
  }
}

const questionTypes = [
  { 
    type: 'text', 
    label: 'Short Text', 
    icon: Type,
    description: 'Single line text input'
  },
  { 
    type: 'textarea', 
    label: 'Long Text', 
    icon: Edit,
    description: 'Multi-line text input'
  },
  { 
    type: 'single_choice', 
    label: 'Single Choice', 
    icon: Circle,
    description: 'Radio buttons - select one option'
  },
  { 
    type: 'multiple_choice', 
    label: 'Multiple Choice', 
    icon: CheckSquare,
    description: 'Checkboxes - select multiple options'
  },
  { 
    type: 'rating', 
    label: 'Star Rating', 
    icon: Star,
    description: '1-5 star rating scale'
  },
  { 
    type: 'scale', 
    label: 'Scale', 
    icon: Hash,
    description: 'Numbered scale (e.g., 1-10)'
  },
  { 
    type: 'date', 
    label: 'Date', 
    icon: Calendar,
    description: 'Date picker input'
  },
  { 
    type: 'number', 
    label: 'Number', 
    icon: Hash,
    description: 'Numeric input with validation'
  }
]

const surveyTemplates = [
  {
    id: 'nps',
    title: 'Net Promoter Score (NPS)',
    description: 'Measure customer loyalty and satisfaction',
    questions: [
      {
        id: '1',
        type: 'scale' as const,
        title: 'How likely are you to recommend our product to a friend or colleague?',
        description: '0 = Not at all likely, 10 = Extremely likely',
        required: true,
        validation: { min: 0, max: 10 }
      },
      {
        id: '2',
        type: 'textarea' as const,
        title: 'What is the primary reason for your score?',
        required: false
      }
    ]
  },
  {
    id: 'feature_feedback',
    title: 'Feature Feedback Survey',
    description: 'Collect detailed feedback on specific features',
    questions: [
      {
        id: '1',
        type: 'single_choice' as const,
        title: 'How often do you use this feature?',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        id: '2',
        type: 'rating' as const,
        title: 'How would you rate the usefulness of this feature?',
        required: true
      },
      {
        id: '3',
        type: 'textarea' as const,
        title: 'What improvements would you suggest for this feature?',
        required: false
      }
    ]
  },
  {
    id: 'onboarding',
    title: 'User Onboarding Survey',
    description: 'Understand the new user experience',
    questions: [
      {
        id: '1',
        type: 'rating' as const,
        title: 'How would you rate your overall onboarding experience?',
        required: true
      },
      {
        id: '2',
        type: 'single_choice' as const,
        title: 'Which part of the onboarding was most helpful?',
        required: true,
        options: ['Setup wizard', 'Tutorial videos', 'Documentation', 'Support chat', 'None']
      },
      {
        id: '3',
        type: 'textarea' as const,
        title: 'What was the most confusing part of getting started?',
        required: false
      }
    ]
  }
]

export function SurveyBuilder() {
  const { trackEvent } = useTrackEvent()
  const [survey, setSurvey] = useState<Survey>({
    id: '',
    title: '',
    description: '',
    questions: [],
    settings: {
      anonymous: true,
      showProgressBar: true,
      randomizeQuestions: false,
      oneResponsePerUser: false,
      collectEmail: false
    }
  })

  const [activeTab, setActiveTab] = useState<'build' | 'preview' | 'settings'>('build')
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

  const addQuestion = (type: SurveyQuestion['type']) => {
    const newQuestion: SurveyQuestion = {
      id: Date.now().toString(),
      type,
      title: '',
      required: false,
      ...(type === 'single_choice' || type === 'multiple_choice' ? { options: ['Option 1', 'Option 2'] } : {})
    }
    
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
    
    setSelectedQuestionId(newQuestion.id)
    trackEvent('survey_question_added', { type })
  }

  const updateQuestion = (questionId: string, updates: Partial<SurveyQuestion>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }))
  }

  const deleteQuestion = (questionId: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }))
    
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null)
    }
  }

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    setSurvey(prev => {
      const questions = [...prev.questions]
      const index = questions.findIndex(q => q.id === questionId)
      
      if (direction === 'up' && index > 0) {
        [questions[index - 1], questions[index]] = [questions[index], questions[index - 1]]
      } else if (direction === 'down' && index < questions.length - 1) {
        [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]]
      }
      
      return { ...prev, questions }
    })
  }

  const loadTemplate = (templateId: string) => {
    const template = surveyTemplates.find(t => t.id === templateId)
    if (template) {
      setSurvey(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
        questions: template.questions.map(q => ({ ...q, id: Date.now().toString() + Math.random() }))
      }))
      trackEvent('survey_template_loaded', { template: templateId })
    }
  }

  const exportSurvey = () => {
    const surveyData = JSON.stringify(survey, null, 2)
    const blob = new Blob([surveyData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${survey.title || 'survey'}.json`
    a.click()
    URL.revokeObjectURL(url)
    trackEvent('survey_exported')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text-ai mb-4">Survey Builder</h1>
        <p className="text-gray-400">Create professional surveys with our free templates and tools</p>
      </div>

      {/* Templates */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Start Templates</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {surveyTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ y: -4 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer"
              onClick={() => loadTemplate(template.id)}
            >
              <h3 className="font-semibold text-white mb-2">{template.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              <div className="text-violet-400 text-sm">
                {template.questions.length} questions • Click to load
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Survey Builder */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Question Types Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4 sticky top-6">
            <h3 className="font-semibold text-white mb-4">Question Types</h3>
            <div className="space-y-2">
              {questionTypes.map((type) => (
                <motion.button
                  key={type.type}
                  whileHover={{ x: 4 }}
                  onClick={() => addQuestion(type.type as SurveyQuestion['type'])}
                  className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  <div className="flex items-start">
                    <type.icon className="w-4 h-4 text-violet-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white text-sm">{type.label}</div>
                      <div className="text-xs text-gray-400">{type.description}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Builder Area */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-900 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('build')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'build'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'preview'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 min-h-[600px]">
            {activeTab === 'build' && (
              <BuildTab
                survey={survey}
                setSurvey={setSurvey}
                selectedQuestionId={selectedQuestionId}
                setSelectedQuestionId={setSelectedQuestionId}
                updateQuestion={updateQuestion}
                deleteQuestion={deleteQuestion}
                moveQuestion={moveQuestion}
              />
            )}
            
            {activeTab === 'preview' && (
              <PreviewTab survey={survey} />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab survey={survey} setSurvey={setSurvey} />
            )}
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">
                {survey.questions.length} questions
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportSurvey}
                disabled={!survey.title || survey.questions.length === 0}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <GlowingButton
                href="#"
                disabled={!survey.title || survey.questions.length === 0}
                onClick={() => trackEvent('survey_published')}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Survey
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BuildTab({ 
  survey, 
  setSurvey, 
  selectedQuestionId, 
  setSelectedQuestionId,
  updateQuestion,
  deleteQuestion,
  moveQuestion
}: any) {
  return (
    <div className="space-y-6">
      {/* Survey Header */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Survey Title *
          </label>
          <input
            type="text"
            value={survey.title}
            onChange={(e) => setSurvey((prev: any) => ({ ...prev, title: e.target.value }))}
            placeholder="Enter survey title"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={survey.description}
            onChange={(e) => setSurvey((prev: any) => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of your survey"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Questions</h3>
        
        {survey.questions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
            <Plus className="w-8 h-8 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No questions yet. Add your first question from the sidebar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {survey.questions.map((question: SurveyQuestion, index: number) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                isSelected={selectedQuestionId === question.id}
                onSelect={() => setSelectedQuestionId(question.id)}
                onUpdate={(updates) => updateQuestion(question.id, updates)}
                onDelete={() => deleteQuestion(question.id)}
                onMove={(direction) => moveQuestion(question.id, direction)}
                canMoveUp={index > 0}
                canMoveDown={index < survey.questions.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionEditor({ 
  question, 
  index, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onMove,
  canMoveUp,
  canMoveDown
}: any) {
  const questionType = questionTypes.find(t => t.type === question.type)

  return (
    <motion.div
      layout
      className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-violet-600 text-white rounded-lg px-2 py-1 text-sm font-medium">
            {index + 1}
          </div>
          <div className="flex items-center space-x-2">
            {questionType && <questionType.icon className="w-4 h-4 text-violet-400" />}
            <span className="text-gray-400 text-sm">{questionType?.label}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMove('up')
            }}
            disabled={!canMoveUp}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMove('down')
            }}
            disabled={!canMoveDown}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter your question"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
          onClick={(e) => e.stopPropagation()}
        />

        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
          <div className="space-y-2">
            {question.options?.map((option: string, optionIndex: number) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])]
                    newOptions[optionIndex] = e.target.value
                    onUpdate({ options: newOptions })
                  }}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-violet-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const newOptions = question.options?.filter((_: any, i: number) => i !== optionIndex)
                    onUpdate({ options: newOptions })
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation()
                const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
                onUpdate({ options: newOptions })
              }}
              className="text-violet-400 hover:text-violet-300 text-sm"
            >
              + Add option
            </button>
          </div>
        )}

        <div className="flex items-center space-x-4 pt-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-gray-300 text-sm">Required</span>
          </label>
        </div>
      </div>
    </motion.div>
  )
}

function PreviewTab({ survey }: { survey: Survey }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white text-black rounded-xl p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">{survey.title || 'Untitled Survey'}</h1>
          {survey.description && (
            <p className="text-gray-600 mb-4">{survey.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="text-sm font-medium text-gray-500 mt-1">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <h3 className="font-medium mb-2">
                    {question.title || 'Untitled Question'}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  
                  <QuestionPreview question={question} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Submit Survey
          </button>
        </div>
      </div>
    </div>
  )
}

function QuestionPreview({ question }: { question: SurveyQuestion }) {
  switch (question.type) {
    case 'text':
      return <input type="text" className="w-full border rounded px-3 py-2" placeholder="Your answer" disabled />
    
    case 'textarea':
      return <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="Your answer" disabled />
    
    case 'single_choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input type="radio" name={question.id} disabled />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )
    
    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input type="checkbox" disabled />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )
    
    case 'rating':
      return (
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Star key={rating} className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer" />
          ))}
        </div>
      )
    
    case 'scale':
      return <input type="range" min="1" max="10" className="w-full" disabled />
    
    case 'date':
      return <input type="date" className="border rounded px-3 py-2" disabled />
    
    case 'number':
      return <input type="number" className="border rounded px-3 py-2" placeholder="0" disabled />
    
    default:
      return <div className="text-gray-500">Preview not available</div>
  }
}

function SettingsTab({ survey, setSurvey }: { survey: Survey, setSurvey: any }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-white">Survey Settings</h3>
      
      <div className="space-y-4">
        <SettingToggle
          label="Anonymous responses"
          description="Don't collect any identifying information"
          checked={survey.settings.anonymous}
          onChange={(checked) => setSurvey((prev: any) => ({
            ...prev,
            settings: { ...prev.settings, anonymous: checked }
          }))}
        />
        
        <SettingToggle
          label="Show progress bar"
          description="Display survey completion progress to respondents"
          checked={survey.settings.showProgressBar}
          onChange={(checked) => setSurvey((prev: any) => ({
            ...prev,
            settings: { ...prev.settings, showProgressBar: checked }
          }))}
        />
        
        <SettingToggle
          label="Randomize question order"
          description="Questions will appear in random order for each respondent"
          checked={survey.settings.randomizeQuestions}
          onChange={(checked) => setSurvey((prev: any) => ({
            ...prev,
            settings: { ...prev.settings, randomizeQuestions: checked }
          }))}
        />
        
        <SettingToggle
          label="One response per user"
          description="Prevent multiple submissions from the same user"
          checked={survey.settings.oneResponsePerUser}
          onChange={(checked) => setSurvey((prev: any) => ({
            ...prev,
            settings: { ...prev.settings, oneResponsePerUser: checked }
          }))}
        />
        
        <SettingToggle
          label="Collect email addresses"
          description="Ask respondents for their email address"
          checked={survey.settings.collectEmail}
          onChange={(checked) => setSurvey((prev: any) => ({
            ...prev,
            settings: { ...prev.settings, collectEmail: checked }
          }))}
        />
      </div>
    </div>
  )
}

function SettingToggle({ 
  label, 
  description, 
  checked, 
  onChange 
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1">
        <h4 className="font-medium text-white">{label}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-violet-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}