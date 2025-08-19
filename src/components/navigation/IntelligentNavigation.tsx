/**
 * CoreFlow360 - Intelligent Navigation & Information Architecture
 * Role-based navigation with AI-enhanced search, breadcrumbs, and command palette
 */

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Users,
  DollarSign,
  Target,
  Package,
  FileText,
  Calendar,
  Settings,
  Search,
  Command,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  Bell,
  User,
  Zap,
  Brain,
  History,
  Star,
  ArrowRight,
  Filter,
  Sparkles,
  Home,
  Building2,
  TrendingUp,
  MessageSquare,
} from 'lucide-react'
import { UserRole } from '@/components/onboarding/WelcomeRoleSelection'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: unknown
  badge?: number
  children?: NavigationItem[]
  roleAccess: UserRole[]
  moduleRequired?: string[]
  category: 'core' | 'modules' | 'settings' | 'ai'
  aiEnabled?: boolean
}

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'page' | 'customer' | 'project' | 'document' | 'action'
  category: string
  href: string
  icon: unknown
  relevance: number
  recent?: boolean
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface IntelligentNavigationProps {
  userRole: UserRole
  selectedModules: string[]
  companyName: string
  onNavigate?: (href: string) => void
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    roleAccess: ['admin', 'manager', 'user'],
    category: 'core',
    aiEnabled: true,
  },
  {
    id: 'crm',
    label: 'CRM & Sales',
    href: '/crm',
    icon: Users,
    badge: 5,
    roleAccess: ['admin', 'manager', 'user'],
    moduleRequired: ['crm'],
    category: 'modules',
    aiEnabled: true,
    children: [
      {
        id: 'customers',
        label: 'Customers',
        href: '/crm/customers',
        icon: Users,
        roleAccess: ['admin', 'manager', 'user'],
        category: 'modules',
      },
      {
        id: 'deals',
        label: 'Deals',
        href: '/crm/deals',
        icon: Target,
        badge: 3,
        roleAccess: ['admin', 'manager', 'user'],
        category: 'modules',
      },
      {
        id: 'leads',
        label: 'Leads',
        href: '/crm/leads',
        icon: TrendingUp,
        roleAccess: ['admin', 'manager'],
        category: 'modules',
      },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    href: '/accounting',
    icon: DollarSign,
    roleAccess: ['admin', 'manager'],
    moduleRequired: ['accounting'],
    category: 'modules',
    children: [
      {
        id: 'invoices',
        label: 'Invoices',
        href: '/accounting/invoices',
        icon: FileText,
        roleAccess: ['admin', 'manager'],
        category: 'modules',
      },
      {
        id: 'expenses',
        label: 'Expenses',
        href: '/accounting/expenses',
        icon: DollarSign,
        roleAccess: ['admin', 'manager'],
        category: 'modules',
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: Target,
    badge: 2,
    roleAccess: ['admin', 'manager', 'user'],
    moduleRequired: ['project'],
    category: 'modules',
    aiEnabled: true,
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: '/inventory',
    icon: Package,
    roleAccess: ['admin', 'manager'],
    moduleRequired: ['inventory'],
    category: 'modules',
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roleAccess: ['admin', 'manager'],
    moduleRequired: ['analytics'],
    category: 'modules',
    aiEnabled: true,
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    href: '/ai',
    icon: Brain,
    roleAccess: ['admin', 'manager', 'user'],
    category: 'ai',
    aiEnabled: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roleAccess: ['admin'],
    category: 'settings',
  },
]

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Acme Corporation',
    description: 'Enterprise customer • $125K annual value',
    type: 'customer',
    category: 'CRM',
    href: '/crm/customers/acme',
    icon: Building2,
    relevance: 95,
    recent: true,
  },
  {
    id: '2',
    title: 'Q4 Sales Report',
    description: 'Generated yesterday • Revenue analysis',
    type: 'document',
    category: 'Reports',
    href: '/reports/q4-sales',
    icon: FileText,
    relevance: 88,
  },
  {
    id: '3',
    title: 'Website Redesign Project',
    description: 'In progress • Due next month',
    type: 'project',
    category: 'Projects',
    href: '/projects/website-redesign',
    icon: Target,
    relevance: 82,
  },
  {
    id: '4',
    title: 'Create New Invoice',
    description: 'Quick action',
    type: 'action',
    category: 'Accounting',
    href: '/accounting/invoices/new',
    icon: DollarSign,
    relevance: 75,
  },
]

export function IntelligentNavigation({
  userRole,
  selectedModules,
  companyName,
  onNavigate,
}: IntelligentNavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>(['crm'])
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Acme Corp',
    'Q4 Report',
    'New Invoice',
  ])

  const pathname = usePathname()
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { trackFeatureUsage } = useTrackEvent()

  // Filter navigation items based on role and modules
  const filteredNavigation = useMemo(() => {
    return navigationItems
      .filter((item) => {
        const hasRoleAccess = item.roleAccess.includes(userRole)
        const hasModuleAccess =
          !item.moduleRequired ||
          item.moduleRequired.some((module) => selectedModules.includes(module))
        return hasRoleAccess && hasModuleAccess
      })
      .map((item) => ({
        ...item,
        children: item.children?.filter((child) => child.roleAccess.includes(userRole)),
      }))
  }, [userRole, selectedModules])

  // Generate breadcrumbs from current path
  const breadcrumbs = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }]

    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/')
      const item = navigationItems.find((nav) => nav.href === href)
      if (item) {
        crumbs.push({ label: item.label, href })
      } else {
        crumbs.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1), href })
      }
    })

    return crumbs
  }, [pathname])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
        setCommandPaletteOpen(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }

      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setCommandPaletteOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search functionality
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = mockSearchResults
        .filter(
          (result) =>
            result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.relevance - a.relevance)

      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleNavigation = (href: string) => {
    trackFeatureUsage('navigation', href)
    if (onNavigate) {
      onNavigate(href)
    } else {
      router.push(href)
    }
    setIsSidebarOpen(false)
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setRecentSearches((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 5))
      trackFeatureUsage('global_search', query)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-gray-800 bg-gray-900 p-2 lg:hidden"
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 280 : 0,
          opacity: isSidebarOpen ? 1 : 0,
        }}
        className="fixed top-0 left-0 z-40 h-full overflow-hidden border-r border-gray-800 bg-gray-900/95 backdrop-blur-sm"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">CoreFlow360</h2>
                <p className="text-xs text-gray-400">{companyName}</p>
              </div>
            </div>
          </div>

          {/* Global Search */}
          <div className="border-b border-gray-800 p-4">
            <button
              onClick={() => {
                setIsSearchOpen(true)
                setCommandPaletteOpen(true)
                setTimeout(() => searchInputRef.current?.focus(), 100)
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-left transition-colors hover:border-gray-600"
            >
              <Search className="h-4 w-4 text-gray-400" />
              <span className="flex-1 text-gray-400">Search everything...</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {filteredNavigation.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                isExpanded={expandedItems.includes(item.id)}
                isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                onNavigate={handleNavigation}
                onToggleExpanded={toggleExpanded}
              />
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                <User className="h-4 w-4 text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white capitalize">{userRole}</p>
                <p className="text-xs text-gray-400">Logged in</p>
              </div>
              <button className="p-1 text-gray-400 transition-colors hover:text-white">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="border-b border-gray-800 bg-gray-900/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="mx-2 h-4 w-4 text-gray-500" />}
                  {crumb.href ? (
                    <button
                      onClick={() => handleNavigation(crumb.href!)}
                      className="text-gray-400 transition-colors hover:text-white"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="font-medium text-white">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-400 transition-colors hover:text-white"
              >
                <Search className="h-5 w-5" />
              </button>
              <button className="relative p-2 text-gray-400 transition-colors hover:text-white">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></div>
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-400 transition-colors hover:text-white"
              >
                <ChevronLeft
                  className={`h-5 w-5 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`}
                />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Command Palette / Global Search */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 pt-20 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl"
            >
              {/* Search Input */}
              <div className="flex items-center gap-4 border-b border-gray-800 p-6">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      handleNavigation(searchResults[0].href)
                      handleSearch(searchQuery)
                      setIsSearchOpen(false)
                    }
                  }}
                  placeholder="Search customers, projects, documents..."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {searchQuery ? (
                  searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => {
                            handleNavigation(result.href)
                            handleSearch(searchQuery)
                            setIsSearchOpen(false)
                          }}
                          className="flex w-full items-center gap-4 rounded-lg p-4 text-left transition-colors hover:bg-gray-800"
                        >
                          <div className="rounded-lg bg-gray-800 p-2">
                            <result.icon className="h-5 w-5 text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white">{result.title}</h3>
                              {result.recent && (
                                <span className="rounded bg-violet-500/20 px-2 py-1 text-xs text-violet-400">
                                  Recent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{result.description}</p>
                            <p className="mt-1 text-xs text-gray-500">{result.category}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-500" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="mx-auto mb-3 h-8 w-8 text-gray-500" />
                      <p className="text-gray-400">No results found for "{searchQuery}"</p>
                    </div>
                  )
                ) : (
                  <div className="p-4">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-400">
                          <History className="h-4 w-4" />
                          Recent Searches
                        </h3>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => setSearchQuery(search)}
                              className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-800"
                            >
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-300">{search}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-400">
                        <Zap className="h-4 w-4" />
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            handleNavigation('/crm/customers/new')
                            setIsSearchOpen(false)
                          }}
                          className="rounded-lg bg-gray-800/50 p-3 text-left transition-colors hover:bg-gray-800"
                        >
                          <Users className="mb-2 h-5 w-5 text-blue-400" />
                          <div className="text-sm font-medium text-white">New Customer</div>
                        </button>
                        <button
                          onClick={() => {
                            handleNavigation('/accounting/invoices/new')
                            setIsSearchOpen(false)
                          }}
                          className="rounded-lg bg-gray-800/50 p-3 text-left transition-colors hover:bg-gray-800"
                        >
                          <FileText className="mb-2 h-5 w-5 text-green-400" />
                          <div className="text-sm font-medium text-white">New Invoice</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

interface NavigationItemProps {
  item: NavigationItem
  isExpanded: boolean
  isActive: boolean
  onNavigate: (href: string) => void
  onToggleExpanded: (itemId: string) => void
}

function NavigationItem({
  item,
  isExpanded,
  isActive,
  onNavigate,
  onToggleExpanded,
}: NavigationItemProps) {
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <button
        onClick={hasChildren ? () => onToggleExpanded(item.id) : () => onNavigate(item.href)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
          isActive
            ? 'border border-violet-500/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-white'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
        }`}
      >
        <item.icon className={`h-5 w-5 ${isActive ? 'text-violet-400' : 'text-gray-400'}`} />
        <span className="flex-1 font-medium">{item.label}</span>
        {item.aiEnabled && (
          <div className="rounded bg-violet-500/20 p-0.5">
            <Sparkles className="h-3 w-3 text-violet-400" />
          </div>
        )}
        {item.badge && (
          <div className="min-w-[1.25rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs text-white">
            {item.badge}
          </div>
        )}
        {hasChildren && (
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 ml-8 space-y-1 overflow-hidden"
          >
            {item.children?.map((child) => (
              <button
                key={child.id}
                onClick={() => onNavigate(child.href)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                  child.href === window.location.pathname
                    ? 'border border-violet-500/20 bg-violet-500/10 text-violet-400'
                    : 'text-gray-500 hover:bg-gray-800/30 hover:text-gray-300'
                }`}
              >
                <child.icon className="h-4 w-4" />
                <span className="flex-1">{child.label}</span>
                {child.badge && (
                  <div className="min-w-[1rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs text-white">
                    {child.badge}
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
