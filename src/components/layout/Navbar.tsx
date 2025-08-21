/**
 * Professional Navbar Component - Free SaaS Template
 * Inspired by Linear, Stripe, and other successful SaaS navbars
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bot, Sparkles, ChevronDown } from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProductOpen, setIsProductOpen] = useState(false)
  const [showPersonaNav, setShowPersonaNav] = useState(false)
  const { trackEvent } = useTrackEvent()

  const personaNavItems = [
    { label: "I'm Building My First Empire", href: '/get-started/first-empire', icon: '🚀' },
    { label: 'I Have 2-3 Businesses', href: '/get-started/growing-portfolio', icon: '📈' },
    { label: 'I Have 4+ Businesses', href: '/get-started/established-empire', icon: '👑' },
    { label: "I'm Acquiring Businesses", href: '/get-started/acquisition', icon: '🎯' },
  ]

  const navItems = [
    {
      label: 'Portfolio Management',
      href: '/portfolio',
      highlight: true,
    },
    {
      label: 'Progressive Pricing',
      href: '/pricing',
      badge: 'Save 20-50%',
    },
    {
      label: 'Multi-Business Tools',
      hasDropdown: true,
      items: [
        {
          label: 'Cross-Business Employees',
          href: '/features/employee-management',
          description: 'Manage staff across multiple businesses',
        },
        {
          label: 'Unified Customer Database',
          href: '/features/customer-database',
          description: 'One view for all customer relationships',
        },
        {
          label: 'Consolidated Reporting',
          href: '/features/reporting',
          description: 'Portfolio-wide analytics and insights',
        },
        {
          label: 'Business Acquisition Tools',
          href: '/features/acquisition',
          description: 'Streamline M&A and integration',
        },
        {
          label: 'Resource Optimization',
          href: '/features/optimization',
          description: 'Share resources across your empire',
        },
      ],
    },
    { label: 'Success Stories', href: '/customers' },
    {
      label: 'Resources',
      hasDropdown: true,
      items: [
        {
          label: 'Multi-Business Guide',
          href: '/resources/multi-business-guide',
          description: 'Complete guide to building your empire',
        },
        {
          label: 'ROI Calculator',
          href: '/calculator',
          description: 'Calculate your progressive savings',
        },
        {
          label: 'Industry Templates',
          href: '/templates',
          description: 'Pre-built setups for your industry',
        },
        {
          label: 'Partner Program',
          href: '/partners',
          description: 'Join our ecosystem',
        },
      ],
    },
  ]

  return (
    <>
      {/* Persona Navigation Bar */}
      {showPersonaNav && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-10 items-center justify-between">
              <div className="flex items-center space-x-6">
                <span className="text-xs font-medium text-purple-100">Choose your path:</span>
                {personaNavItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-1 text-xs text-white transition-colors hover:text-purple-200"
                    onClick={() => trackEvent('persona_nav_clicked', { persona: item.label })}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
              <button
                onClick={() => setShowPersonaNav(false)}
                className="text-xs text-purple-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      <nav className={`fixed right-0 left-0 z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-md ${
        showPersonaNav ? 'top-10' : 'top-0'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            onClick={() => trackEvent('logo_clicked', { location: 'navbar' })}
          >
            <a href="/" className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-violet-400" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-cyan-400" />
              </div>
              <span className="gradient-text-ai text-xl font-bold">CoreFlow360</span>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsProductOpen(true)}
                    onMouseLeave={() => setIsProductOpen(false)}
                  >
                    <button className="flex items-center space-x-1 text-gray-300 transition-colors duration-200 hover:text-white">
                      <span>{item.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    <AnimatePresence>
                      {isProductOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-gray-800/50 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-sm"
                        >
                          {item.items?.map((subItem) => (
                            <a
                              key={subItem.label}
                              href={subItem.href}
                              className="group block rounded-lg p-3 transition-colors duration-200 hover:bg-gray-800/50"
                              onClick={() =>
                                trackEvent('nav_dropdown_clicked', {
                                  section: item.label,
                                  item: subItem.label,
                                })
                              }
                            >
                              <div className="font-medium text-white transition-colors group-hover:text-violet-400">
                                {subItem.label}
                              </div>
                              <div className="text-sm text-gray-400 transition-colors group-hover:text-gray-300">
                                {subItem.description}
                              </div>
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      item.highlight 
                        ? 'font-semibold text-violet-400 hover:text-violet-300' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => trackEvent('nav_clicked', { section: item.label })}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                        {item.badge}
                      </span>
                    )}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center space-x-4 md:flex">
            <button
              onClick={() => setShowPersonaNav(!showPersonaNav)}
              className="text-xs text-gray-400 transition-colors hover:text-white"
            >
              {showPersonaNav ? 'Hide' : 'Show'} Persona Guide
            </button>
            <div onClick={() => trackEvent('nav_login_clicked', { location: 'navbar' })}>
              <a
                href="/auth/signin"
                className="text-gray-300 transition-colors duration-200 hover:text-white"
              >
                Sign in
              </a>
            </div>
            <div onClick={() => trackEvent('nav_cta_clicked', { location: 'navbar' })}>
              <GlowingButton href="/demo/subscription-simulator" size="sm">
                Try Free
              </GlowingButton>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 transition-colors duration-200 hover:text-white focus:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 border-t border-gray-800/50 pt-4 pb-4 md:hidden"
            >
              <div className="space-y-4">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.hasDropdown ? (
                      <div className="space-y-2">
                        <div className="font-medium text-white">{item.label}</div>
                        <div className="space-y-2 pl-4">
                          {item.items?.map((subItem) => (
                            <a
                              key={subItem.label}
                              href={subItem.href}
                              className="block text-gray-400 transition-colors duration-200 hover:text-white"
                              onClick={() => {
                                setIsOpen(false)
                                trackEvent('mobile_nav_clicked', {
                                  section: item.label,
                                  item: subItem.label,
                                })
                              }}
                            >
                              {subItem.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        className={`flex items-center justify-between text-gray-300 transition-colors duration-200 hover:text-white ${
                          item.highlight ? 'font-semibold text-violet-400' : ''
                        }`}
                        onClick={() => {
                          setIsOpen(false)
                          trackEvent('mobile_nav_clicked', { section: item.label })
                        }}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    )}
                  </div>
                ))}

                {/* Persona Navigation for Mobile */}
                <div className="border-t border-gray-800/50 pt-4">
                  <div className="mb-2 text-xs font-medium text-gray-400">Choose Your Path</div>
                  {personaNavItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center space-x-2 py-2 text-sm text-gray-300 transition-colors hover:text-white"
                      onClick={() => {
                        setIsOpen(false)
                        trackEvent('mobile_persona_nav_clicked', { persona: item.label })
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>

                <div className="space-y-4 border-t border-gray-800/50 pt-4">
                  <div onClick={() => trackEvent('mobile_nav_login_clicked')}>
                    <a
                      href="/auth/signin"
                      className="block text-gray-300 transition-colors duration-200 hover:text-white"
                    >
                      Sign in
                    </a>
                  </div>
                  <div onClick={() => trackEvent('mobile_nav_cta_clicked')}>
                    <GlowingButton href="/demo/subscription-simulator" className="w-full">
                      Try Free
                    </GlowingButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
    </>
  )
}
