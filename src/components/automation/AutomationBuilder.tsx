/**
 * CoreFlow360 - Natural Language Automation Builder
 * Super easy automation creation - just describe what you want in plain English
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Sparkles,
  Wand2,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Clock,
  Users,
  Mail,
  Settings,
  Play,
  Eye,
  Copy,
  Share
} from 'lucide-react'
import { AccessibleButton } from '@/components/accessibility/AccessibleComponents'
import { VisualWorkflowDesigner } from './VisualWorkflowDesigner'
import { AutomationQuestionsPanel } from './AutomationQuestionsPanel'
import { NaturalLanguageWorkflowProcessor } from '@/lib/automation/natural-language-processor'
import { WorkflowGenerationResponse, WorkflowGenerationRequest, Workflow } from '@/lib/automation/workflow-types'

interface AutomationBuilderProps {
  userProfile: {
    industry: string
    companySize: string
    role: string
    existingSystems: string[]
  }
}

export function AutomationBuilder({ userProfile }: AutomationBuilderProps) {
  // State management
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<WorkflowGenerationResponse | null>(null)
  const [currentStep, setCurrentStep] = useState<'describe' | 'review' | 'questions' | 'finalize'>('describe')
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const processor = useRef(new NaturalLanguageWorkflowProcessor())

  // Example prompts for inspiration
  const examplePrompts = [
    "When a new lead fills out our contact form, add them to CRM and send a welcome email",
    "If an invoice becomes 30 days overdue, send a reminder email and notify the accounts team",
    "When a customer signs a contract, create an onboarding checklist and assign a success manager",
    "Every Monday at 9 AM, generate a weekly sales report and email it to the team",
    "When a support ticket isn't answered in 4 hours, escalate to manager and update customer",
    "After a project is marked complete, send satisfaction survey and generate final report"
  ]

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)

  // Rotate example prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % examplePrompts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [examplePrompts.length])

  // Handle automation generation
  const handleGenerate = async () => {
    if (!description.trim()) return

    setIsGenerating(true)
    try {
      const request: WorkflowGenerationRequest = {
        description: description.trim(),
        businessContext: {
          industry: userProfile.industry,
          companySize: userProfile.companySize,
          existingSystems: userProfile.existingSystems,
          userRole: userProfile.role
        },
        preferences: {
          complexity: 'simple',
          executionTiming: 'immediate',
          errorHandling: 'basic'
        }
      }

      const result = await processor.current.processDescription(request)
      setGenerationResult(result)
      setWorkflow(result.workflow)
      setCurrentStep('review')
    } catch (error) {
      console.error('Failed to generate workflow:', error)
      // TODO: Show error toast
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle example prompt selection
  const handleExampleClick = (example: string) => {
    setDescription(example)
    textareaRef.current?.focus()
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [description])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-500/50 px-6 py-3 rounded-full mb-6">
            <Wand2 className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-semibold">AI Automation Builder</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Just Describe It,
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              We'll Build It
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            No coding, no complex setup, no learning curve. Simply tell us what you want to automate 
            in plain English, and our AI will create a perfect workflow for you.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'describe' && (
            <DescribeStep
              description={description}
              setDescription={setDescription}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
              examplePrompts={examplePrompts}
              currentExampleIndex={currentExampleIndex}
              onExampleClick={handleExampleClick}
              textareaRef={textareaRef}
            />
          )}

          {currentStep === 'review' && generationResult && (
            <ReviewStep
              generationResult={generationResult}
              workflow={workflow!}
              onBack={() => setCurrentStep('describe')}
              onNext={() => setCurrentStep('questions')}
              onWorkflowChange={setWorkflow}
            />
          )}

          {currentStep === 'questions' && generationResult && workflow && (
            <QuestionsStep
              generationResult={generationResult}
              workflow={workflow}
              onBack={() => setCurrentStep('review')}
              onNext={() => setCurrentStep('finalize')}
              onWorkflowChange={setWorkflow}
            />
          )}

          {currentStep === 'finalize' && workflow && (
            <FinalizeStep
              workflow={workflow}
              onBack={() => setCurrentStep('questions')}
              onDeploy={() => console.log('Deploy workflow')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Describe Step Component
interface DescribeStepProps {
  description: string
  setDescription: (desc: string) => void
  isGenerating: boolean
  onGenerate: () => void
  examplePrompts: string[]
  currentExampleIndex: number
  onExampleClick: (example: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

function DescribeStep({
  description,
  setDescription,
  isGenerating,
  onGenerate,
  examplePrompts,
  currentExampleIndex,
  onExampleClick,
  textareaRef
}: DescribeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Main Input */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">
              Describe Your Automation
            </h2>
            <p className="text-gray-400 mb-6">
              Tell us what you want to automate in simple, everyday language. Be as detailed or as brief as you like.
            </p>
            
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="For example: When a new customer fills out our contact form, add them to our CRM, send a welcome email, and create a follow-up task for our sales team..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl px-6 py-4 text-white placeholder-gray-500 text-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 resize-none min-h-[120px]"
                disabled={isGenerating}
              />
              
              {description.length > 0 && (
                <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                  {description.length} characters
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                ✨ Our AI will understand your intent and create the perfect workflow
              </div>
              
              <AccessibleButton
                onClick={onGenerate}
                disabled={!description.trim() || isGenerating}
                loading={isGenerating}
                size="lg"
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                    Building Magic...
                  </>
                ) : (
                  <>
                    Generate Workflow
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </AccessibleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white text-center">
          Need Inspiration? Try These Examples:
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {examplePrompts.map((prompt, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onExampleClick(prompt)}
              className={`p-4 bg-gray-900/40 border rounded-2xl text-left transition-all duration-200 hover:bg-gray-800/60 hover:border-violet-500/50 hover:scale-[1.02] ${
                index === currentExampleIndex 
                  ? 'border-violet-500/50 bg-violet-900/20' 
                  : 'border-gray-800'
              }`}
              disabled={isGenerating}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm leading-relaxed">{prompt}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Instant Generation</h3>
          <p className="text-gray-400 text-sm">
            Our AI understands your description and creates a complete workflow in seconds
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Visual Editor</h3>
          <p className="text-gray-400 text-sm">
            See your workflow as a beautiful flowchart and edit with simple drag-and-drop
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">One-Click Deploy</h3>
          <p className="text-gray-400 text-sm">
            Your automation goes live instantly - no technical setup required
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Review Step Component
interface ReviewStepProps {
  generationResult: WorkflowGenerationResponse
  workflow: Workflow
  onBack: () => void
  onNext: () => void
  onWorkflowChange: (workflow: Workflow) => void
}

function ReviewStep({ generationResult, workflow, onBack, onNext, onWorkflowChange }: ReviewStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Review Your Workflow</h2>
          <p className="text-gray-400">
            AI generated this workflow with {Math.round(generationResult.confidence * 100)}% confidence
          </p>
        </div>
        
        <div className="flex gap-3">
          <AccessibleButton variant="secondary" onClick={onBack}>
            Back to Edit
          </AccessibleButton>
          <AccessibleButton onClick={onNext}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </AccessibleButton>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium text-white">AI Analysis Complete</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${generationResult.confidence * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-white">
            {Math.round(generationResult.confidence * 100)}% Confidence
          </span>
        </div>
      </div>

      {/* Visual Workflow */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Visual Workflow</h3>
          <p className="text-gray-400 text-sm">Drag nodes to rearrange, click to edit</p>
        </div>
        
        <div className="h-96">
          <VisualWorkflowDesigner
            workflow={workflow}
            onChange={onWorkflowChange}
            readonly={false}
          />
        </div>
      </div>

      {/* Warnings & Suggestions Preview */}
      {(generationResult.warnings.length > 0 || generationResult.suggestions.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {generationResult.warnings.length > 0 && (
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-orange-300">Warnings</span>
              </div>
              <div className="space-y-2">
                {generationResult.warnings.slice(0, 2).map((warning, index) => (
                  <p key={index} className="text-orange-200 text-sm">
                    • {warning.message}
                  </p>
                ))}
                {generationResult.warnings.length > 2 && (
                  <p className="text-orange-300 text-sm font-medium">
                    +{generationResult.warnings.length - 2} more warnings
                  </p>
                )}
              </div>
            </div>
          )}
          
          {generationResult.suggestions.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-300">Suggestions</span>
              </div>
              <div className="space-y-2">
                {generationResult.suggestions.slice(0, 2).map((suggestion, index) => (
                  <p key={index} className="text-blue-200 text-sm">
                    • {suggestion.title}
                  </p>
                ))}
                {generationResult.suggestions.length > 2 && (
                  <p className="text-blue-300 text-sm font-medium">
                    +{generationResult.suggestions.length - 2} more suggestions
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Questions Step Component
interface QuestionsStepProps {
  generationResult: WorkflowGenerationResponse
  workflow: Workflow
  onBack: () => void
  onNext: () => void
  onWorkflowChange: (workflow: Workflow) => void
}

function QuestionsStep({ generationResult, workflow, onBack, onNext, onWorkflowChange }: QuestionsStepProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Perfect Your Workflow</h2>
          <p className="text-gray-400">
            Answer a few questions to optimize your automation
          </p>
        </div>
        
        <div className="flex gap-3">
          <AccessibleButton variant="secondary" onClick={onBack}>
            Back
          </AccessibleButton>
          <AccessibleButton onClick={onNext}>
            Finalize Workflow
            <ArrowRight className="w-4 h-4 ml-2" />
          </AccessibleButton>
        </div>
      </div>

      <AutomationQuestionsPanel
        questions={generationResult.questions}
        answers={answers}
        onAnswersChange={setAnswers}
        workflow={workflow}
        onWorkflowChange={onWorkflowChange}
      />
    </motion.div>
  )
}

// Finalize Step Component
interface FinalizeStepProps {
  workflow: Workflow
  onBack: () => void
  onDeploy: () => void
}

function FinalizeStep({ workflow, onBack, onDeploy }: FinalizeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Automation is Ready!</h2>
        <p className="text-gray-400">
          Review the final workflow and deploy it to start automating your business
        </p>
      </div>

      {/* Final Workflow View */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
              <p className="text-gray-400 text-sm">{workflow.description}</p>
            </div>
            
            <div className="flex gap-2">
              <AccessibleButton variant="ghost" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </AccessibleButton>
              <AccessibleButton variant="ghost" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </AccessibleButton>
            </div>
          </div>
        </div>
        
        <div className="h-96">
          <VisualWorkflowDesigner
            workflow={workflow}
            onChange={() => {}}
            readonly={true}
          />
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">{workflow.nodes.length}</div>
          <div className="text-gray-400 text-sm">Automation Steps</div>
        </div>
        
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">~2 min</div>
          <div className="text-gray-400 text-sm">Estimated Runtime</div>
        </div>
        
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-green-400 mb-2">Ready</div>
          <div className="text-gray-400 text-sm">Status</div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <AccessibleButton variant="secondary" onClick={onBack}>
          Back to Edit
        </AccessibleButton>
        
        <AccessibleButton onClick={onDeploy} size="lg" className="min-w-[200px]">
          <Play className="w-5 h-5 mr-2" />
          Deploy Automation
        </AccessibleButton>
      </div>
    </motion.div>
  )
}