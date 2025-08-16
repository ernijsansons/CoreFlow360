/**
 * CoreFlow360 - Mobile-First Responsive Layout
 * Touch-friendly interfaces with PWA features and mobile-optimized navigation
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSwipeable } from 'framer-motion'
import { 
  Menu,
  X,
  Home,
  Users,
  BarChart3,
  Bell,
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Share,
  Download,
  Wifi,
  WifiOff,
  Smartphone
} from 'lucide-react'
import { UserRole } from '@/components/onboarding/WelcomeRoleSelection'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

interface MobileOptimizedLayoutProps {
  children: React.ReactNode
  userRole: UserRole
  companyName: string
  isOnline?: boolean
  onInstallPWA?: () => void
  canInstallPWA?: boolean
}

interface BottomNavItem {
  id: string
  label: string
  icon: any
  href: string
  badge?: number
  activeColor: string
}

const bottomNavItems: BottomNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    activeColor: 'text-violet-500'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    href: '/crm/customers',
    badge: 3,
    activeColor: 'text-blue-500'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    activeColor: 'text-emerald-500'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/notifications',
    badge: 5,
    activeColor: 'text-orange-500'
  }
]

export function MobileOptimizedLayout({
  children,
  userRole,
  companyName,
  isOnline = true,
  onInstallPWA,
  canInstallPWA = false
}: MobileOptimizedLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [pullToRefresh, setPullToRefresh] = useState(false)
  const [refreshDistance, setRefreshDistance] = useState(0)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const { trackFeatureUsage } = useTrackEvent()

  // Detect scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // PWA install prompt
  useEffect(() => {
    if (canInstallPWA) {
      // Show install prompt after 30 seconds on mobile
      const timer = setTimeout(() => {
        setShowInstallPrompt(true)
      }, 30000)
      
      return () => clearTimeout(timer)
    }
  }, [canInstallPWA])

  // Pull to refresh functionality
  const swipeHandlers = useSwipeable({
    onSwipedDown: () => {
      if (window.scrollY === 0) {
        setPullToRefresh(true)
        // Simulate refresh
        setTimeout(() => {
          setPullToRefresh(false)
          setRefreshDistance(0)
        }, 2000)
      }
    },
    trackMouse: false
  })

  const handleTabChange = (tabId: string, href: string) => {
    setActiveTab(tabId)
    trackFeatureUsage('mobile_navigation', tabId)
    // Would typically handle navigation here
  }

  const handleInstallPWA = () => {
    if (onInstallPWA) {
      onInstallPWA()
    }
    setShowInstallPrompt(false)
    trackFeatureUsage('pwa_install_prompt', 'accepted')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Mobile Header */}
      <motion.header
        initial={false}
        animate={{
          backgroundColor: isScrolled 
            ? 'rgba(17, 24, 39, 0.95)' 
            : 'rgba(17, 24, 39, 0.8)'
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-gray-800/50"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Company Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg"></div>
            <span className="font-bold text-white text-lg">{companyName}</span>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!isOnline && (
          <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">Working offline</span>
            </div>
          </div>
        )}

        {/* Pull to Refresh Indicator */}
        <AnimatePresence>
          {pullToRefresh && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-violet-500/20 border-b border-violet-500/30 px-4 py-2"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <ArrowLeft className="w-4 h-4 text-violet-400 rotate-90" />
                </motion.div>
                <span className="text-violet-300 text-sm">Refreshing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800"
            >
              <MobileMenuContent 
                userRole={userRole}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main 
        {...swipeHandlers}
        className="pt-16 pb-20 px-4 min-h-screen"
      >
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
        <div className="flex items-center justify-around px-4 py-2">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id, item.href)}
              className="flex flex-col items-center gap-1 py-2 px-3 min-w-[4rem] transition-colors"
            >
              <div className="relative">
                <item.icon 
                  className={`w-6 h-6 transition-colors ${
                    activeTab === item.id ? item.activeColor : 'text-gray-400'
                  }`} 
                />
                {item.badge && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </div>
                )}
              </div>
              <span 
                className={`text-xs transition-colors ${
                  activeTab === item.id ? item.activeColor : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 left-4 right-4 z-40"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Install CoreFlow360</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Add to your home screen for quick access and offline functionality
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleInstallPWA}
                      className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Install
                    </button>
                    <button
                      onClick={() => setShowInstallPrompt(false)}
                      className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm"
                    >
                      Not now
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-6 z-30 w-14 h-14 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  )
}

interface MobileMenuContentProps {
  userRole: UserRole
  onClose: () => void
}

function MobileMenuContent({ userRole, onClose }: MobileMenuContentProps) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', badge: 0 },
    { icon: Users, label: 'Customers', href: '/customers', badge: 3 },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', badge: 0 },
    { icon: Bell, label: 'Notifications', href: '/notifications', badge: 5 }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Menu</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={onClose}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-800/50 transition-colors text-left"
            >
              <div className="p-2 bg-gray-800 rounded-lg">
                <item.icon className="w-5 h-5 text-gray-300" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-white">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                  {item.badge}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">QUICK ACTIONS</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 rounded-xl text-center">
              <Users className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <span className="text-sm text-white">New Customer</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl text-center">
              <Plus className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <span className="text-sm text-white">Quick Add</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          <div>
            <p className="font-medium text-white capitalize">{userRole}</p>
            <p className="text-sm text-gray-400">Connected</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg text-gray-300">
          <Share className="w-5 h-5" />
          <span>Share App</span>
        </button>
      </div>
    </div>
  )
}