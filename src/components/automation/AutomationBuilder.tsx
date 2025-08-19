/**
 * CoreFlow360 - Natural Language Automation Builder
 * Super easy automation creation - just describe what you want in plain English
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  Share,
} from 'lucide-react'
import { AccessibleButton } from '@/components/accessibility/AccessibleComponents'
import { VisualWorkflowDesigner } from './VisualWorkflowDesigner'
import { AutomationQuestionsPanel } from './AutomationQuestionsPanel'
import { NaturalLanguageWorkflowProcessor } from '@/lib/automation/natural-language-processor'
import {
  WorkflowGenerationResponse,
  WorkflowGenerationRequest,
  Workflow,
} from '@/lib/automation/workflow-types'

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
  const [currentStep, setCurrentStep] = useState<'describe' | 'review' | 'questions' | 'finalize'>(
    'describe'
  )
  const [workflow, setWorkflow] = useState<Workflow | null>(null)

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const processor = useRef(new NaturalLanguageWorkflowProcessor())

  // Example prompts for inspiration
  const examplePrompts = [
    'When a new lead fills out our contact form, add them to CRM and send a welcome email',
    'If an invoice becomes 30 days overdue, send a reminder email and notify the accounts team',
    'When a customer signs a contract, create an onboarding checklist and assign a success manager',
    'Every Monday at 9 AM, generate a weekly sales report and email it to the team',
    "When a support ticket isn't answered in 4 hours, escalate to manager and update customer",
    'After a project is marked complete, send satisfaction survey and generate final report',
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
          userRole: userProfile.role,
        },
        preferences: {
          complexity: 'simple',
          executionTiming: 'immediate',
          errorHandling: 'basic',
        },
      }

      const result = await processor.current.processDescription(request)
      setGenerationResult(result)
      setWorkflow(result.workflow)
      setCurrentStep('review')
    } catch (error) {
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
          className="mb-12 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-900/30 px-6 py-3">
            <Wand2 className="h-5 w-5 text-violet-400" />
            <span className="font-semibold text-violet-300">AI Automation Builder</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
            Just Describe It,
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              We'll Build It
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-xl text-gray-400">
            No coding, no complex setup, no learning curve. Simply tell us what you want to automate
            in plain English, and our AI will create a perfect workflow for you.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="mx-auto max-w-6xl">
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
              onDeploy={() => {}}
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
  textareaRef,
}: DescribeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Main Input */}
      <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-8 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 p-3">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>

          <div className="flex-1">
            <h2 className="mb-2 text-xl font-semibold text-white">Describe Your Automation</h2>
            <p className="mb-6 text-gray-400">
              Tell us what you want to automate in simple, everyday language. Be as detailed or as
              brief as you like.
            </p>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="For example: When a new customer fills out our contact form, add them to our CRM, send a welcome email, and create a follow-up task for our sales team..."
                className="min-h-[120px] w-full resize-none rounded-2xl border border-gray-700 bg-gray-800/50 px-6 py-4 text-lg text-white placeholder-gray-500 transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                disabled={isGenerating}
              />

              {description.length > 0 && (
                <div className="absolute right-4 bottom-4 text-sm text-gray-500">
                  {description.length} characters
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
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
                    <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                    Building Magic...
                  </>
                ) : (
                  <>
                    Generate Workflow
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </AccessibleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-4">
        <h3 className="text-center text-lg font-semibold text-white">
          Need Inspiration? Try These Examples:
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {examplePrompts.map((prompt, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onExampleClick(prompt)}
              className={`rounded-2xl border bg-gray-900/40 p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:border-violet-500/50 hover:bg-gray-800/60 ${
                index === currentExampleIndex
                  ? 'border-violet-500/50 bg-violet-900/20'
                  : 'border-gray-800'
              }`}
              disabled={isGenerating}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gradient-to-r from-violet-500/20 to-cyan-500/20 p-2">
                  <Lightbulb className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-gray-300">{prompt}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Features Preview */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">Instant Generation</h3>
          <p className="text-sm text-gray-400">
            Our AI understands your description and creates a complete workflow in seconds
          </p>
        </div>

        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">Visual Editor</h3>
          <p className="text-sm text-gray-400">
            See your workflow as a beautiful flowchart and edit with simple drag-and-drop
          </p>
        </div>

        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600">
            <Play className="h-8 w-8 text-white" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">One-Click Deploy</h3>
          <p className="text-sm text-gray-400">
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

function ReviewStep({
  generationResult,
  workflow,
  onBack,
  onNext,
  onWorkflowChange,
}: ReviewStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Review Your Workflow</h2>
          <p className="text-gray-400">
            AI generated this workflow with {Math.round(generationResult.confidence * 100)}%
            confidence
          </p>
        </div>

        <div className="flex gap-3">
          <AccessibleButton variant="secondary" onClick={onBack}>
            Back to Edit
          </AccessibleButton>
          <AccessibleButton onClick={onNext}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </AccessibleButton>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="mb-2 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="font-medium text-white">AI Analysis Complete</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 w-full rounded-full bg-gray-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
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
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60">
        <div className="border-b border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-white">Visual Workflow</h3>
          <p className="text-sm text-gray-400">Drag nodes to rearrange, click to edit</p>
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
        <div className="grid gap-4 md:grid-cols-2">
          {generationResult.warnings.length > 0 && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-900/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <span className="font-medium text-orange-300">Warnings</span>
              </div>
              <div className="space-y-2">
                {generationResult.warnings.slice(0, 2).map((warning, index) => (
                  <p key={index} className="text-sm text-orange-200">
                    • {warning.message}
                  </p>
                ))}
                {generationResult.warnings.length > 2 && (
                  <p className="text-sm font-medium text-orange-300">
                    +{generationResult.warnings.length - 2} more warnings
                  </p>
                )}
              </div>
            </div>
          )}

          {generationResult.suggestions.length > 0 && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-900/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-blue-300">Suggestions</span>
              </div>
              <div className="space-y-2">
                {generationResult.suggestions.slice(0, 2).map((suggestion, index) => (
                  <p key={index} className="text-sm text-blue-200">
                    • {suggestion.title}
                  </p>
                ))}
                {generationResult.suggestions.length > 2 && (
                  <p className="text-sm font-medium text-blue-300">
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

function QuestionsStep({
  generationResult,
  workflow,
  onBack,
  onNext,
  onWorkflowChange,
}: QuestionsStepProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({})

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Perfect Your Workflow</h2>
          <p className="text-gray-400">Answer a few questions to optimize your automation</p>
        </div>

        <div className="flex gap-3">
          <AccessibleButton variant="secondary" onClick={onBack}>
            Back
          </AccessibleButton>
          <AccessibleButton onClick={onNext}>
            Finalize Workflow
            <ArrowRight className="ml-2 h-4 w-4" />
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
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Your Automation is Ready!</h2>
        <p className="text-gray-400">
          Review the final workflow and deploy it to start automating your business
        </p>
      </div>

      {/* Final Workflow View */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60">
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
              <p className="text-sm text-gray-400">{workflow.description}</p>
            </div>

            <div className="flex gap-2">
              <AccessibleButton variant="ghost" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </AccessibleButton>
              <AccessibleButton variant="ghost" size="sm">
                <Share className="mr-2 h-4 w-4" />
                Share
              </AccessibleButton>
            </div>
          </div>
        </div>

        <div className="h-96">
          <VisualWorkflowDesigner workflow={workflow} onChange={() => {}} readonly={true} />
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center">
          <div className="mb-2 text-2xl font-bold text-white">{workflow.nodes.length}</div>
          <div className="text-sm text-gray-400">Automation Steps</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center">
          <div className="mb-2 text-2xl font-bold text-white">~2 min</div>
          <div className="text-sm text-gray-400">Estimated Runtime</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center">
          <div className="mb-2 text-2xl font-bold text-green-400">Ready</div>
          <div className="text-sm text-gray-400">Status</div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <AccessibleButton variant="secondary" onClick={onBack}>
          Back to Edit
        </AccessibleButton>

        <AccessibleButton onClick={onDeploy} size="lg" className="min-w-[200px]">
          <Play className="mr-2 h-5 w-5" />
          Deploy Automation
        </AccessibleButton>
      </div>
    </motion.div>
  )
}
