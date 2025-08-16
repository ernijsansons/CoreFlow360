/**
 * CoreFlow360 - KPI Grid Component
 * World-class KPI dashboard with filtering, sorting, and drill-down
 */

'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KPICard, KPICardProps } from './KPICard'
import {
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Settings,
  Zap,
  Target,
  Activity,
  Users,
  DollarSign
} from 'lucide-react'

interface KPIGridProps {
  kpis: KPICardProps['kpi'][]
  onDrillDown?: (kpiKey: string) => void
  allowCustomization?: boolean
  showFilters?: boolean
  showSearch?: boolean
  defaultLayout?: 'grid' | 'list'
  className?: string
}

type SortOption = 'name' | 'value' | 'change' | 'status' | 'category'
type FilterOption = 'all' | 'FINANCIAL' | 'OPERATIONAL' | 'GROWTH' | 'CUSTOMER'
type StatusFilter = 'all' | 'good' | 'warning' | 'critical'

const CATEGORY_COLORS = {
  FINANCIAL: 'text-green-600 bg-green-50 border-green-200',
  OPERATIONAL: 'text-blue-600 bg-blue-50 border-blue-200',
  GROWTH: 'text-purple-600 bg-purple-50 border-purple-200',
  CUSTOMER: 'text-orange-600 bg-orange-50 border-orange-200'
}

const CATEGORY_ICONS = {
  FINANCIAL: DollarSign,
  OPERATIONAL: Activity,
  GROWTH: TrendingUp,
  CUSTOMER: Users
}

export function KPIGrid({ 
  kpis,
  onDrillDown,
  allowCustomization = true,
  showFilters = true,
  showSearch = true,
  defaultLayout = 'grid',
  className = ''
}: KPIGridProps) {
  const [layout, setLayout] = useState<'grid' | 'list'>(defaultLayout)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FilterOption>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [hiddenKPIs, setHiddenKPIs] = useState<Set<string>>(new Set())
  const [showCustomization, setShowCustomization] = useState(false)

  // Filter and sort KPIs
  const filteredAndSortedKPIs = useMemo(() => {
    let filtered = kpis.filter(kpi => {
      // Search filter
      if (searchTerm && !kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !kpi.key.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Category filter
      if (categoryFilter !== 'all' && kpi.category !== categoryFilter) {
        return false
      }
      
      // Status filter
      if (statusFilter !== 'all' && kpi.status !== statusFilter) {
        return false
      }
      
      // Hidden KPIs filter
      if (hiddenKPIs.has(kpi.key)) {
        return false
      }
      
      return true
    })

    // Sort KPIs
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'value':
          comparison = a.value - b.value
          break
        case 'change':
          comparison = (a.changePercent || 0) - (b.changePercent || 0)
          break
        case 'status':
          const statusOrder = { critical: 0, warning: 1, neutral: 2, good: 3 }
          comparison = statusOrder[a.status as keyof typeof statusOrder] - 
                      statusOrder[b.status as keyof typeof statusOrder]
          break
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '')
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [kpis, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder, hiddenKPIs])

  const toggleKPIVisibility = (kpiKey: string) => {
    const newHidden = new Set(hiddenKPIs)
    if (newHidden.has(kpiKey)) {
      newHidden.delete(kpiKey)
    } else {
      newHidden.add(kpiKey)
    }
    setHiddenKPIs(newHidden)
  }

  const handleSort = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return kpis.length
    return kpis.filter(kpi => kpi.status === status).length
  }

  const getCategoryCount = (category: FilterOption) => {
    if (category === 'all') return kpis.length
    return kpis.filter(kpi => kpi.category === category).length
  }

  const exportKPIs = () => {
    const data = filteredAndSortedKPIs.map(kpi => ({
      Name: kpi.name,
      Value: kpi.value,
      Change: kpi.changePercent || 0,
      Status: kpi.status,
      Category: kpi.category || 'N/A',
      Target: kpi.target || 'N/A'
    }))
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kpi-report.csv'
    a.click()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Key Performance Indicators
          </h2>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {filteredAndSortedKPIs.length} KPIs
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              {getStatusCount('good')} Good
            </span>
            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
              {getStatusCount('warning')} Warning
            </span>
            <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              {getStatusCount('critical')} Critical
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Layout Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded-md transition-colors ${
                layout === 'grid' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded-md transition-colors ${
                layout === 'list' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={exportKPIs}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          {allowCustomization && (
            <button
              onClick={() => setShowCustomization(!showCustomization)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Customize</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            {showSearch && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search KPIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Category Filter */}
            {showFilters && (
              <div className="flex flex-wrap items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Category:</span>
                {(['all', 'FINANCIAL', 'OPERATIONAL', 'GROWTH', 'CUSTOMER'] as FilterOption[]).map((category) => {
                  const Icon = category !== 'all' ? CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] : Target
                  const colorClass = category !== 'all' ? CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] : 'text-gray-600 bg-gray-50 border-gray-200'
                  
                  return (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        categoryFilter === category 
                          ? colorClass
                          : 'text-gray-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category === 'all' ? 'All' : category.toLowerCase().replace('_', ' ')}</span>
                      <span className="ml-1 px-1.5 py-0.5 bg-white/60 rounded text-xs">
                        {getCategoryCount(category)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="value">Value</option>
                <option value="change">Change</option>
                <option value="status">Status</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customization Panel */}
      <AnimatePresence>
        {showCustomization && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 border-purple-600"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customize Dashboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi) => (
                <div key={kpi.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {kpi.name}
                  </span>
                  <button
                    onClick={() => toggleKPIVisibility(kpi.key)}
                    className={`p-2 rounded-lg transition-colors ${
                      hiddenKPIs.has(kpi.key)
                        ? 'text-gray-400 hover:text-gray-600'
                        : 'text-purple-600 hover:text-purple-700'
                    }`}
                  >
                    {hiddenKPIs.has(kpi.key) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Grid */}
      <AnimatePresence>
        <motion.div
          layout
          className={
            layout === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredAndSortedKPIs.map((kpi, index) => (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <KPICard
                kpi={kpi}
                size={layout === 'list' ? 'small' : 'medium'}
                showChart={layout === 'grid'}
                onDrillDown={onDrillDown}
                className={layout === 'list' ? 'w-full' : ''}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredAndSortedKPIs.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No KPIs Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setCategoryFilter('all')
              setStatusFilter('all')
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}