'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Menu,
  X,
  Sparkles,
  Users,
  DollarSign,
  Info,
  MessageSquare,
  Home,
  Monitor,
} from 'lucide-react'
import { GlowingButton } from './ui/GlowingButton'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/features', label: 'Features', icon: Brain },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/demo', label: 'Demo', icon: Monitor },
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: MessageSquare },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-800/50 bg-black/90 backdrop-blur-xl">
      <div className="container-fluid">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 transition-transform duration-300 group-hover:scale-110">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="gradient-text-ai text-lg font-bold">CoreFlow360</span>
              <span className="-mt-1 text-xs text-gray-400">AI-Powered ERP</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'border border-violet-500/50 bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/auth/signin"
              className="font-medium text-gray-300 transition-colors duration-200 hover:text-white"
            >
              Sign In
            </Link>
            <GlowingButton href="/auth/signup" size="sm">
              Try Free
              <Sparkles className="ml-1 h-3 w-3" />
            </GlowingButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50 text-gray-300 transition-colors duration-200 hover:text-white lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-gray-800/50 lg:hidden"
            >
              <div className="space-y-2 py-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-300 ${
                          isActive(item.href)
                            ? 'border border-violet-500/50 bg-violet-600/20 text-white'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navItems.length * 0.1 }}
                  className="space-y-3 border-t border-gray-800/50 pt-4"
                >
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-300 transition-all duration-300 hover:bg-gray-800/50 hover:text-white"
                  >
                    <Users className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                  <div className="px-4">
                    <GlowingButton href="/auth/signup" size="md" className="w-full">
                      Try Free Trial
                      <Sparkles className="ml-2 h-4 w-4" />
                    </GlowingButton>
                  </div>
                </motion.div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
