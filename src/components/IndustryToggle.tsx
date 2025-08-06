'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { getAllIndustries } from '@/lib/industry-config'

interface IndustryToggleProps {
  currentIndustry?: string
  onIndustryChange?: (industryId: string) => void
}

export function IndustryToggle({ currentIndustry = 'hvac', onIndustryChange }: IndustryToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const industries = getAllIndustries()
  const current = industries.find((i) => i.id === currentIndustry) || industries[0]

  if (!current) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      >
        <span className="text-2xl">{current.icon}</span>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{current.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Industry Mode</div>
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Select Industry</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Choose your industry to enable specialized features
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => {
                    onIndustryChange?.(industry.id)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    industry.id === currentIndustry ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <span className="mt-0.5 text-2xl">{industry.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {industry.name}
                      </div>
                      {industry.id === currentIndustry && (
                        <span className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {industry.description}
                    </div>
                    {industry.subTypes && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {industry.subTypes.map((subType) => (
                          <span
                            key={subType}
                            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {subType}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Industry-specific features will be enabled automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
