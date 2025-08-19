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
  const { trackEvent } = useTrackEvent()

  const navItems = [
    {
      label: 'Solutions',
      hasDropdown: true,
      items: [
        {
          label: 'Smart Automation',
          href: '/features/automation',
          description: 'Automate repetitive tasks and workflows',
        },
        {
          label: 'Business Modules',
          href: '/modules',
          description: 'Complete ERP suite for every department',
        },
        {
          label: 'Industry Solutions',
          href: '/industries',
          description: 'HVAC, Professional Services, Manufacturing & more',
        },
        {
          label: 'Integrations',
          href: '/integrations',
          description: 'Connect with 500+ business tools',
        },
      ],
    },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Demo', href: '/demo' },
    { label: 'Success Stories', href: '/customers' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
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
                    className="text-gray-300 transition-colors duration-200 hover:text-white"
                    onClick={() => trackEvent('nav_clicked', { section: item.label })}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center space-x-4 md:flex">
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
                        className="block text-gray-300 transition-colors duration-200 hover:text-white"
                        onClick={() => {
                          setIsOpen(false)
                          trackEvent('mobile_nav_clicked', { section: item.label })
                        }}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}

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
  )
}
