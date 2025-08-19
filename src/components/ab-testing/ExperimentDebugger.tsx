'use client'

import React, { useState } from 'react'
import { abTestManager } from '@/lib/ab-testing/ab-test-manager'
import { experiments } from '@/lib/ab-testing/experiments'

export function ExperimentDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string>>({})

  const loadAssignments = () => {
    if (abTestManager) {
      setAssignments(abTestManager.getActiveAssignments())
    }
  }

  const clearExperiment = (experimentId: string) => {
    if (abTestManager) {
      abTestManager.clearAssignment(experimentId)
      loadAssignments()
    }
  }

  const clearAll = () => {
    if (abTestManager) {
      abTestManager.clearAllAssignments()
      loadAssignments()
      window.location.reload()
    }
  }

  const exportData = () => {
    if (abTestManager) {
      const data = abTestManager.exportAnalytics()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ab-test-data-${Date.now()}.json`
      a.click()
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) loadAssignments()
        }}
        className="fixed bottom-4 left-4 z-50 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-purple-700"
      >
        A/B Tests
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-50 max-h-[80vh] w-96 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">A/B Test Debugger</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Active Experiments */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Active Experiments</h4>
            {experiments
              .filter((exp) => exp.status === 'active')
              .map((experiment) => {
                const assignment = assignments[experiment.id]
                const variant = experiment.variants.find((v) => v.id === assignment)

                return (
                  <div key={experiment.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">{experiment.name}</h5>
                        <p className="mt-1 text-xs text-gray-500">{experiment.description}</p>
                        {variant && (
                          <p className="mt-2 text-sm">
                            <span className="text-gray-600">Variant:</span>{' '}
                            <span className="font-medium text-purple-600">{variant.name}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => clearExperiment(experiment.id)}
                        className="ml-2 text-xs text-red-600 hover:text-red-700"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Variant Options */}
                    <div className="mt-2 space-y-1">
                      {experiment.variants.map((v) => (
                        <div
                          key={v.id}
                          className={`rounded px-2 py-1 text-xs ${
                            v.id === assignment
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {v.name} ({v.weight}%)
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={clearAll}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
            >
              Clear All Assignments
            </button>
            <button
              onClick={exportData}
              className="w-full rounded-lg bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
            >
              Export Analytics Data
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 text-xs text-gray-500">
            <p>Debug panel only visible in development.</p>
            <p>Clear assignments to get reassigned to experiments.</p>
          </div>
        </div>
      )}
    </>
  )
}
