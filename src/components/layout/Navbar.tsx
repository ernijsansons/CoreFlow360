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
      label: 'Product',
      hasDropdown: true,
      items: [
        { label: 'AI Orchestrator', href: '/features/ai', description: 'Intelligent automation for every process' },
        { label: 'Module Library', href: '/modules', description: '8 ERP systems integrated with AI' },
        { label: 'Industry Solutions', href: '/industries', description: 'Tailored for HVAC, Legal, HR, and more' },
        { label: 'API & Integrations', href: '/api', description: 'Connect everything with our APIs' }
      ]
    },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '/demo/subscription-simulator' },
    { label: 'Resources', href: '/resources' },
    { label: 'Contact', href: '/contact' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            onClick={() => trackEvent('logo_clicked', { location: 'navbar' })}
          >
            <a href="/" className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="w-8 h-8 text-violet-400" />
                <Sparkles className="w-3 h-3 text-cyan-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold gradient-text-ai">CoreFlow360</span>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsProductOpen(true)}
                    onMouseLeave={() => setIsProductOpen(false)}
                  >
                    <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-200">
                      <span>{item.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {isProductOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 shadow-2xl"
                        >
                          {item.items?.map((subItem) => (
                            <a
                              key={subItem.label}
                              href={subItem.href}
                              className="block p-3 rounded-lg hover:bg-gray-800/50 transition-colors duration-200 group"
                              onClick={() => trackEvent('nav_dropdown_clicked', { 
                                section: item.label, 
                                item: subItem.label 
                              })}
                            >
                              <div className="font-medium text-white group-hover:text-violet-400 transition-colors">
                                {subItem.label}
                              </div>
                              <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
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
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => trackEvent('nav_clicked', { section: item.label })}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <div onClick={() => trackEvent('nav_login_clicked', { location: 'navbar' })}>
              <a 
                href="/auth/signin" 
                className="text-gray-300 hover:text-white transition-colors duration-200"
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
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="md:hidden border-t border-gray-800/50 mt-4 pt-4 pb-4"
            >
              <div className="space-y-4">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.hasDropdown ? (
                      <div className="space-y-2">
                        <div className="text-white font-medium">{item.label}</div>
                        <div className="pl-4 space-y-2">
                          {item.items?.map((subItem) => (
                            <a
                              key={subItem.label}
                              href={subItem.href}
                              className="block text-gray-400 hover:text-white transition-colors duration-200"
                              onClick={() => {
                                setIsOpen(false)
                                trackEvent('mobile_nav_clicked', { 
                                  section: item.label, 
                                  item: subItem.label 
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
                        className="block text-gray-300 hover:text-white transition-colors duration-200"
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
                
                <div className="border-t border-gray-800/50 pt-4 space-y-4">
                  <div onClick={() => trackEvent('mobile_nav_login_clicked')}>
                    <a 
                      href="/auth/signin"
                      className="block text-gray-300 hover:text-white transition-colors duration-200"
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