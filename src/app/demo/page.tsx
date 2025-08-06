'use client'

import { useState } from 'react'
import { IndustryToggle } from '@/components/IndustryToggle'
import {
  getIndustryConfig,
  getIndustryFeatures,
  getIndustryCustomFields,
  getIndustryWorkflows,
  getIndustryAIAgents,
  getIndustryCompliance,
  getIndustryIntegrations,
} from '@/lib/industry-config'
import {
  CubeIcon,
  DocumentTextIcon,
  CogIcon,
  SparklesIcon,
  ShieldCheckIcon,
  LinkIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  TruckIcon,
  WrenchIcon,
  ScaleIcon,
  BeakerIcon,
  UserCircleIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

export default function DemoPage() {
  const [currentIndustry, setCurrentIndustry] = useState('general')
  const industryConfig = getIndustryConfig(currentIndustry)
  const features = getIndustryFeatures(currentIndustry)
  const customFields = getIndustryCustomFields(currentIndustry)
  const workflows = getIndustryWorkflows(currentIndustry)
  const aiAgents = getIndustryAIAgents(currentIndustry)
  const compliance = getIndustryCompliance(currentIndustry)
  const integrations = getIndustryIntegrations(currentIndustry)

  const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    crm: UserGroupIcon,
    projectManagement: ChartBarIcon,
    scheduling: CalendarIcon,
    inventory: CubeIcon,
    accounting: CurrencyDollarIcon,
    hr: UserCircleIcon,
    documentManagement: DocumentTextIcon,
    compliance: ShieldCheckIcon,
    analytics: ChartBarIcon,
    mobileApp: BuildingOfficeIcon,
    fieldService: TruckIcon,
    equipment: WrenchIcon,
    warranty: ShieldCheckIcon,
    permits: DocumentTextIcon,
    subcontractors: UserGroupIcon,
    patients: UserCircleIcon,
    prescriptions: BeakerIcon,
    caseManagement: ScaleIcon,
    timeTracking: ClockIcon,
    trustAccounting: CurrencyDollarIcon,
    emergencyDispatch: TruckIcon,
  }

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝'
      case 'number':
        return '🔢'
      case 'date':
        return '📅'
      case 'boolean':
        return '✅'
      case 'select':
        return '📋'
      case 'multiselect':
        return '📋'
      case 'file':
        return '📎'
      default:
        return '📝'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                CoreFlow360 - Multi-Industry Demo
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                World&apos;s #1 AI-First Multi-Industry ERP Platform
              </p>
            </div>
            <IndustryToggle
              currentIndustry={currentIndustry}
              onIndustryChange={setCurrentIndustry}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Industry Overview */}
        <div className={`mb-8 rounded-lg p-6 ${industryConfig.color} bg-opacity-10`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">{industryConfig.icon}</span>
            <div className="flex-1">
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {industryConfig.name} Configuration Active
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">{industryConfig.description}</p>
              {industryConfig.subTypes && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Specializations:
                  </span>
                  {industryConfig.subTypes.map((subType) => (
                    <span
                      key={subType}
                      className="rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300"
                    >
                      {subType}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <CogIcon className="h-6 w-6" />
            Enabled Features
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(features).map(([feature, enabled]) => {
              const Icon = featureIcons[feature] || CogIcon
              return (
                <div
                  key={feature}
                  className={`rounded-lg border p-4 ${
                    enabled
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
                      />
                      <span
                        className={`font-medium ${
                          enabled
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    {enabled ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Custom Fields */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <DocumentTextIcon className="h-6 w-6" />
            Industry-Specific Fields ({customFields.length})
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Required
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {customFields.map((field) => (
                    <tr key={field.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{getFieldTypeIcon(field.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {field.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {field.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {field.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {field.group || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {field.required ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Workflows */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <CogIcon className="h-6 w-6" />
            Industry Workflows ({workflows.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {workflow.name}
                </h4>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {workflow.description}
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Workflow Steps:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {step.name}
                        </span>
                        {index < workflow.steps.length - 1 && (
                          <ChevronRightIcon className="mx-1 h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Agents */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <SparklesIcon className="h-6 w-6" />
            AI-Powered Agents ({aiAgents.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {aiAgents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm dark:border-purple-800 dark:from-purple-900/20 dark:to-blue-900/20"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {agent.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>

                {agent.specializations && agent.specializations.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Specializations:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.specializations.map((spec) => (
                        <span
                          key={spec}
                          className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {agent.certifications && agent.certifications.length > 0 && (
                  <div>
                    <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Certifications:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Compliance */}
        {compliance.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <ShieldCheckIcon className="h-6 w-6" />
              Compliance Requirements ({compliance.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {compliance.map((comp) => (
                <div
                  key={comp.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {comp.name}
                      </h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {comp.type.toUpperCase()}
                      </span>
                    </div>
                    <ShieldCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Requirements:
                    </div>
                    <ul className="space-y-1">
                      {comp.requirements.slice(0, 3).map((req, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <span className="mt-0.5 text-green-600 dark:text-green-400">•</span>
                          {req}
                        </li>
                      ))}
                      {comp.requirements.length > 3 && (
                        <li className="text-sm text-gray-500 italic dark:text-gray-400">
                          +{comp.requirements.length - 3} more requirements
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Integrations */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <LinkIcon className="h-6 w-6" />
            Pre-Built Integrations ({integrations.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {integration.name}
                  </h4>
                  <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                  by {integration.provider}
                </p>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {integration.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-12">
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Experience the Power of Industry-Specific AI
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-blue-100">
              CoreFlow360 adapts to your industry with specialized features, workflows, and AI
              agents that understand your business like no other platform.
            </p>
            <div className="flex justify-center gap-4">
              <button className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-gray-100">
                Start Free Trial
              </button>
              <button className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-800">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
