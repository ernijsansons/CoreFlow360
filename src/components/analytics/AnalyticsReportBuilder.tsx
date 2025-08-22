/**
 * CoreFlow360 - Analytics Report Builder
 * Interactive report creation with drag-and-drop widgets and advanced filtering
 */

'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Save,
  Share2,
  Copy,
  Trash2,
  Settings,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  RefreshCw,
  Layout,
  Grid,
  Maximize,
  Minimize,
  Clock,
  Target,
  Layers,
  Database
} from 'lucide-react'

interface ReportWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'kpi' | 'trend'
  title: string
  description?: string
  config: {
    dataSource: string
    visualization: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
    metrics: string[]
    dimensions?: string[]
    filters?: Record<string, any>
    timeRange?: {
      start: Date
      end: Date
      granularity: '1h' | '1d' | '1w' | '1m'
    }
    size: 'small' | 'medium' | 'large'
    position: { x: number; y: number; w: number; h: number }
  }
  data?: any[]
  isVisible: boolean
  isLoading: boolean
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'financial' | 'operational' | 'custom'
  widgets: ReportWidget[]
  layout: string
  createdAt: Date
  updatedAt: Date
}

const widgetTypes = [
  {
    type: 'chart',
    icon: BarChart3,
    name: 'Chart',
    description: 'Various chart visualizations'
  },
  {
    type: 'metric',
    icon: Activity,
    name: 'Metric Card',
    description: 'Single metric display'
  },
  {
    type: 'table',
    icon: Grid,
    name: 'Data Table',
    description: 'Tabular data view'
  },
  {
    type: 'kpi',
    icon: Target,
    name: 'KPI Widget',
    description: 'Key performance indicators'
  },
  {
    type: 'trend',
    icon: TrendingUp,
    name: 'Trend Analysis',
    description: 'Trend visualization'
  }
]

const dataSourceOptions = [
  { value: 'customers', label: 'Customer Data', icon: Users },
  { value: 'revenue', label: 'Revenue Data', icon: DollarSign },
  { value: 'analytics', label: 'Analytics Events', icon: Activity },
  { value: 'performance', label: 'Performance Metrics', icon: BarChart3 }
]

const mockTemplates: ReportTemplate[] = [
  {
    id: 'executive-dashboard',
    name: 'Executive Dashboard',
    description: 'High-level business metrics and KPIs',
    category: 'business',
    widgets: [],
    layout: 'grid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'financial-report',
    name: 'Financial Performance',
    description: 'Revenue, costs, and profitability analysis',
    category: 'financial',
    widgets: [],
    layout: 'stacked',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'customer-analytics',
    name: 'Customer Analytics',
    description: 'Customer behavior and engagement metrics',
    category: 'business',
    widgets: [],
    layout: 'mixed',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export function AnalyticsReportBuilder() {
  const [currentReport, setCurrentReport] = useState<ReportTemplate | null>(null)
  const [widgets, setWidgets] = useState<ReportWidget[]>([])
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  const addWidget = useCallback((type: string) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type: type as ReportWidget['type'],
      title: `New ${type}`,
      config: {
        dataSource: 'customers',
        visualization: 'line',
        metrics: ['count'],
        size: 'medium',
        position: { x: 0, y: 0, w: 6, h: 4 }
      },
      isVisible: true,
      isLoading: false
    }

    setWidgets(prev => [...prev, newWidget])
    setSelectedWidget(newWidget.id)
  }, [])

  const updateWidget = useCallback((id: string, updates: Partial<ReportWidget>) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, ...updates } : widget
      )
    )
  }, [])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id))
    if (selectedWidget === id) {
      setSelectedWidget(null)
    }
  }, [selectedWidget])

  const duplicateWidget = useCallback((id: string) => {
    const widget = widgets.find(w => w.id === id)
    if (!widget) return

    const newWidget: ReportWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (Copy)`,
      config: {
        ...widget.config,
        position: {
          ...widget.config.position,
          x: widget.config.position.x + 1,
          y: widget.config.position.y + 1
        }
      }
    }

    setWidgets(prev => [...prev, newWidget])
  }, [widgets])

  const saveReport = useCallback(() => {
    if (!currentReport) return

    const updatedReport: ReportTemplate = {
      ...currentReport,
      widgets,
      updatedAt: new Date()
    }

    // In real app, this would save to backend
    console.log('Saving report:', updatedReport)
  }, [currentReport, widgets])

  const exportReport = useCallback((format: 'pdf' | 'excel' | 'json') => {
    // In real app, this would export the report
    console.log('Exporting report as:', format)
  }, [])

  const renderWidget = (widget: ReportWidget) => {
    const IconComponent = {
      chart: BarChart3,
      metric: Activity,
      table: Grid,
      kpi: Target,
      trend: TrendingUp
    }[widget.type]

    return (
      <motion.div
        key={widget.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`rounded-xl bg-white p-4 shadow-sm transition-all dark:bg-gray-800 ${
          selectedWidget === widget.id
            ? 'ring-2 ring-blue-500'
            : 'hover:shadow-md'
        } ${widget.config.size === 'small' ? 'col-span-1' : 
           widget.config.size === 'large' ? 'col-span-2' : 'col-span-1'
        } ${widget.isVisible ? '' : 'opacity-50'}`}
        onClick={() => setSelectedWidget(widget.id)}
        style={{
          gridColumn: `span ${widget.config.size === 'large' ? 2 : 1}`,
          minHeight: widget.config.size === 'small' ? '200px' : '300px'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {widget.title}
            </h3>
          </div>
          
          {!previewMode && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  updateWidget(widget.id, { isVisible: !widget.isVisible })
                }}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                {widget.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  duplicateWidget(widget.id)
                }}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeWidget(widget.id)
                }}
                className="rounded p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {widget.description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {widget.description}
          </p>
        )}

        <div className="mt-4 flex h-32 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">
          {widget.isLoading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <IconComponent className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">
                {widget.config.visualization} chart with {widget.config.metrics.join(', ')}
              </p>
              <p className="text-xs mt-1">
                Source: {widget.config.dataSource}
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Size: {widget.config.size}</span>
          <span>Type: {widget.type}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`flex flex-col bg-white shadow-sm dark:bg-gray-800 transition-all duration-300 ${
        showWidgetLibrary ? 'w-80' : 'w-16'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {showWidgetLibrary && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Widget Library
            </h2>
          )}
          <button
            onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <Layers className="h-5 w-5" />
          </button>
        </div>

        {/* Widget Library */}
        {showWidgetLibrary && (
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Add Widgets
              </h3>
              {widgetTypes.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => addWidget(widget.type)}
                  className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <widget.icon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {widget.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {widget.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Templates
              </h3>
              <div className="space-y-2">
                {mockTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setCurrentReport(template)}
                    className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentReport?.name || 'New Report'}
              </h1>
              {currentReport && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {currentReport.category}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter className="mr-2 h-4 w-4 inline" />
                Filters
              </button>

              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  previewMode
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {previewMode ? <Minimize className="mr-2 h-4 w-4 inline" /> : <Maximize className="mr-2 h-4 w-4 inline" />}
                {previewMode ? 'Edit' : 'Preview'}
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={saveReport}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4 inline" />
                  Save
                </button>

                <div className="relative">
                  <button className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                <button className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-50 border-b border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Unit
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700">
                    <option>All Units</option>
                    <option>TechFlow Solutions</option>
                    <option>GreenTech Manufacturing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Metric Type
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700">
                    <option>All Metrics</option>
                    <option>Revenue</option>
                    <option>Customers</option>
                    <option>Performance</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          {widgets.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Start Building Your Report
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Add widgets from the sidebar to create your custom analytics report.
                </p>
                <button
                  onClick={() => setShowWidgetLibrary(true)}
                  className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Widget
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {widgets
                  .filter(widget => widget.isVisible || !previewMode)
                  .map(widget => renderWidget(widget))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Widget Configuration Panel */}
      <AnimatePresence>
        {selectedWidget && !previewMode && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Widget Settings
                </h3>
                <button
                  onClick={() => setSelectedWidget(null)}
                  className="rounded p-1 text-gray-400 hover:text-gray-600"
                >
                  <Minimize className="h-4 w-4" />
                </button>
              </div>

              {(() => {
                const widget = widgets.find(w => w.id === selectedWidget)
                if (!widget) return null

                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={widget.title}
                        onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data Source
                      </label>
                      <select
                        value={widget.config.dataSource}
                        onChange={(e) => updateWidget(widget.id, {
                          config: { ...widget.config, dataSource: e.target.value }
                        })}
                        className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
                      >
                        {dataSourceOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Visualization
                      </label>
                      <select
                        value={widget.config.visualization}
                        onChange={(e) => updateWidget(widget.id, {
                          config: { ...widget.config, visualization: e.target.value as any }
                        })}
                        className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
                      >
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="area">Area Chart</option>
                        <option value="scatter">Scatter Plot</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Size
                      </label>
                      <select
                        value={widget.config.size}
                        onChange={(e) => updateWidget(widget.id, {
                          config: { ...widget.config, size: e.target.value as any }
                        })}
                        className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Metrics
                      </label>
                      <div className="space-y-2">
                        {['count', 'sum', 'average', 'min', 'max'].map(metric => (
                          <label key={metric} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={widget.config.metrics.includes(metric)}
                              onChange={(e) => {
                                const newMetrics = e.target.checked
                                  ? [...widget.config.metrics, metric]
                                  : widget.config.metrics.filter(m => m !== metric)
                                updateWidget(widget.id, {
                                  config: { ...widget.config, metrics: newMetrics }
                                })
                              }}
                              className="mr-2 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {metric}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <button
                        onClick={() => updateWidget(widget.id, { isLoading: true })}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <RefreshCw className="mr-2 h-4 w-4 inline" />
                        Refresh Data
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}