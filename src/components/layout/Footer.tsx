/**
 * Professional Footer Component - Free SaaS Template
 * Inspired by successful SaaS footers with social proof and comprehensive links
 */

'use client'

import { Bot, Sparkles, Twitter, Github, Linkedin, Mail, ExternalLink } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function Footer() {
  const { trackEvent } = useTrackEvent()

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'AI Orchestrator', href: '/features/ai' },
        { label: 'Module Library', href: '/modules' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'API Documentation', href: '/docs/api' },
        { label: 'Pricing', href: '#pricing' },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { label: 'HVAC & Manufacturing', href: '/industries/hvac' },
        { label: 'Legal Services', href: '/industries/legal' },
        { label: 'HR & Workforce', href: '/industries/hr' },
        { label: 'Financial Services', href: '/industries/finance' },
        { label: 'Enterprise', href: '/enterprise' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Blog', href: '/blog' },
        { label: 'Case Studies', href: '/case-studies' },
        { label: 'Webinars', href: '/webinars' },
        { label: 'Help Center', href: '/help' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ]

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/coreflow360', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/coreflow360', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/coreflow360', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@coreflow360.com', label: 'Email' },
  ]

  return (
    <footer className="border-t border-gray-800/50 bg-black">
      {/* Social Proof Banner */}
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-violet-950/30 to-cyan-950/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="mb-4 text-2xl font-bold text-white">
              Trusted by Forward-Thinking Businesses
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {/* Placeholder company logos - replace with real ones later */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-violet-500 to-cyan-500"></div>
                <span className="font-medium text-gray-400">TechCorp</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-emerald-500 to-blue-500"></div>
                <span className="font-medium text-gray-400">InnovateLtd</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-orange-500 to-red-500"></div>
                <span className="font-medium text-gray-400">FutureScale</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <span className="font-medium text-gray-400">NextGen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-violet-400" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-cyan-400" />
              </div>
              <span className="gradient-text-ai text-xl font-bold">CoreFlow360</span>
            </div>
            <p className="mb-6 max-w-sm text-gray-400">
              The world's first AI-orchestrated ERP platform. 8 integrated systems, infinite
              possibilities, autonomous operations.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Stay Updated</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-l-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-400 transition-colors focus:border-violet-500 focus:outline-none"
                />
                <button
                  className="rounded-r-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-2 text-white transition-all duration-200 hover:from-violet-600 hover:to-cyan-600"
                  onClick={() => trackEvent('newsletter_signup_clicked', { location: 'footer' })}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-semibold text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center text-gray-400 transition-colors duration-200 hover:text-white"
                      onClick={() =>
                        trackEvent('footer_link_clicked', {
                          section: section.title,
                          link: link.label,
                        })
                      }
                    >
                      {link.label}
                      {link.href.startsWith('http') && (
                        <ExternalLink className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-800/50 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © 2024 CoreFlow360. All rights reserved. Built with AI-first principles.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                  aria-label={social.label}
                  onClick={() =>
                    trackEvent('social_link_clicked', {
                      platform: social.label.toLowerCase(),
                    })
                  }
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-gray-400">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
