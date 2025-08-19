/**
 * CoreFlow360 - Automation Questions Panel
 * AI-powered questioning system to perfect workflow automation
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Mail,
  User,
  Calendar,
  Zap,
  ArrowRight,
  Lightbulb,
  Target,
  Shield,
} from 'lucide-react'
import {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
} from '@/components/accessibility/AccessibleComponents'
import { WorkflowQuestion, Workflow } from '@/lib/automation/workflow-types'

interface AutomationQuestionsPanelProps {
  questions: WorkflowQuestion[]
  answers: Record<string, unknown>
  onAnswersChange: (answers: Record<string, unknown>) => void
  workflow: Workflow
  onWorkflowChange: (workflow: Workflow) => void
}

export function AutomationQuestionsPanel({
  questions,
  answers,
  onAnswersChange,
  workflow,
  onWorkflowChange,
}: AutomationQuestionsPanelProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const totalQuestions = questions.length
  const answeredQuestions = Object.keys(answers).filter((key) =>
    questions.find((q) => q.id === key)
  ).length

  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  // Category icons
  const categoryIcons = {
    configuration: Settings,
    integration: Zap,
    timing: Clock,
    error_handling: Shield,
  }

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: unknown) => {
    const newAnswers = { ...answers, [questionId]: value }
    onAnswersChange(newAnswers)

    // Auto-advance to next question if this was required
    const currentQuestion = questions[currentQuestionIndex]
    if (currentQuestion?.required && currentQuestion.id === questionId) {
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 500)
      } else {
        setIsCompleted(true)
      }
    }
  }

  // Navigate between questions
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
        <h3 className="mb-2 text-lg font-semibold text-white">Perfect Workflow!</h3>
        <p className="text-gray-400">
          Your automation is ready to deploy with no additional configuration needed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-white">Optimization Progress</h3>
          <span className="text-sm text-gray-400">
            {answeredQuestions}/{totalQuestions} completed
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-gray-800">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-green-400"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">All questions completed!</span>
          </motion.div>
        )}
      </div>

      {/* Question Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {questions.map((question, index) => {
          const Icon = categoryIcons[question.category] || HelpCircle
          const isAnswered = answers[question.id] !== undefined
          const isCurrent = currentQuestionIndex === index

          return (
            <button
              key={question.id}
              onClick={() => goToQuestion(index)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-lg border px-4 py-2 transition-all duration-200 ${
                isCurrent
                  ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                  : isAnswered
                    ? 'border-green-500 bg-green-500/10 text-green-300 hover:bg-green-500/20'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              } `}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{index + 1}</span>
              {isAnswered && <CheckCircle className="h-3 w-3" />}
            </button>
          )
        })}
      </div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {!isCompleted ? (
            <QuestionCard
              question={questions[currentQuestionIndex]}
              answer={answers[questions[currentQuestionIndex]?.id]}
              onAnswerChange={(value) =>
                handleAnswerChange(questions[currentQuestionIndex].id, value)
              }
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
            />
          ) : (
            <CompletionCard answeredQuestions={answeredQuestions} totalQuestions={totalQuestions} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <AccessibleButton
          variant="secondary"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </AccessibleButton>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <AccessibleButton
          onClick={nextQuestion}
          disabled={isCompleted || currentQuestionIndex === questions.length - 1}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </AccessibleButton>
      </div>

      {/* Question Categories Overview */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(
          questions.reduce(
            (acc, question) => {
              acc[question.category] = (acc[question.category] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          )
        ).map(([category, count]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons] || HelpCircle
          const answeredInCategory = questions
            .filter((q) => q.category === category)
            .filter((q) => answers[q.id] !== undefined).length

          return (
            <div key={category} className="rounded-lg border border-gray-800 bg-gray-900/40 p-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-gray-800 p-2">
                  <Icon className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white capitalize">
                    {category.replace('_', ' ')}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {answeredInCategory}/{count} answered
                  </p>
                </div>
              </div>

              <div className="h-1 w-full rounded-full bg-gray-800">
                <div
                  className="h-1 rounded-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${(answeredInCategory / count) * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Individual Question Card Component
interface QuestionCardProps {
  question: WorkflowQuestion
  answer: unknown
  onAnswerChange: (value: unknown) => void
  questionNumber: number
  totalQuestions: number
}

function QuestionCard({
  question,
  answer,
  onAnswerChange,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const Icon =
    {
      configuration: Settings,
      integration: Zap,
      timing: Clock,
      error_handling: Shield,
    }[question.category] || HelpCircle

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60">
      {/* Question Header */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 px-6 py-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-violet-500/20 p-2">
            <Icon className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-violet-300 capitalize">
                {question.category.replace('_', ' ')}
              </span>
              {question.required && (
                <span className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
                  Required
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">{question.question}</h3>

        {/* Answer Input */}
        <div className="space-y-4">
          {question.type === 'text' && (
            <AccessibleInput
              label=""
              value={answer || ''}
              onChange={onAnswerChange}
              placeholder="Enter your answer..."
            />
          )}

          {question.type === 'select' && question.options && (
            <AccessibleSelect
              label=""
              value={answer || ''}
              onChange={onAnswerChange}
              options={question.options.map((option) => ({
                value: option,
                label: option,
              }))}
              placeholder="Choose an option..."
            />
          )}

          {question.type === 'multi_select' && question.options && (
            <MultiSelectInput
              options={question.options}
              value={answer || []}
              onChange={onAnswerChange}
            />
          )}

          {question.type === 'boolean' && <BooleanInput value={answer} onChange={onAnswerChange} />}

          {question.type === 'number' && (
            <AccessibleInput
              label=""
              type="number"
              value={answer || ''}
              onChange={(value) => onAnswerChange(Number(value))}
              placeholder="Enter a number..."
            />
          )}

          {question.type === 'date' && (
            <AccessibleInput label="" type="date" value={answer || ''} onChange={onAnswerChange} />
          )}
        </div>

        {/* Smart Suggestions */}
        {question.category === 'timing' && (
          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Smart Suggestion</span>
            </div>
            <p className="text-sm text-blue-200">
              For most business processes, immediate execution works best unless you need to avoid
              peak hours.
            </p>
          </div>
        )}

        {question.category === 'integration' && (
          <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Integration Note</span>
            </div>
            <p className="text-sm text-yellow-200">
              This will require setting up a connection to the external service. We'll guide you
              through that later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Multi-Select Input Component
interface MultiSelectInputProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
}

function MultiSelectInput({ options, value, onChange }: MultiSelectInputProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3 transition-colors hover:bg-gray-700/50"
        >
          <input
            type="checkbox"
            checked={value.includes(option)}
            onChange={() => toggleOption(option)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-violet-500 focus:ring-violet-500"
          />
          <span className="text-white">{option}</span>
        </label>
      ))}
    </div>
  )
}

// Boolean Input Component
interface BooleanInputProps {
  value: boolean
  onChange: (value: boolean) => void
}

function BooleanInput({ value, onChange }: BooleanInputProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onChange(true)}
        className={`flex-1 rounded-lg border p-4 transition-all ${
          value === true
            ? 'border-green-500 bg-green-500/10 text-green-300'
            : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
        }`}
      >
        <CheckCircle className="mx-auto mb-2 h-5 w-5" />
        <span className="block text-sm font-medium">Yes</span>
      </button>

      <button
        onClick={() => onChange(false)}
        className={`flex-1 rounded-lg border p-4 transition-all ${
          value === false
            ? 'border-red-500 bg-red-500/10 text-red-300'
            : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
        }`}
      >
        <AlertCircle className="mx-auto mb-2 h-5 w-5" />
        <span className="block text-sm font-medium">No</span>
      </button>
    </div>
  )
}

// Completion Card Component
interface CompletionCardProps {
  answeredQuestions: number
  totalQuestions: number
}

function CompletionCard({ answeredQuestions, totalQuestions }: CompletionCardProps) {
  return (
    <div className="rounded-xl border border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>

      <h3 className="mb-2 text-2xl font-bold text-white">Questions Completed!</h3>

      <p className="mb-4 text-green-200">
        You've answered {answeredQuestions} out of {totalQuestions} questions. Your workflow has
        been optimized based on your responses.
      </p>

      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <p className="text-sm text-green-300">
          <strong>Next:</strong> Review your finalized workflow and deploy it to start automating
          your business processes.
        </p>
      </div>
    </div>
  )
}

export default AutomationQuestionsPanel
