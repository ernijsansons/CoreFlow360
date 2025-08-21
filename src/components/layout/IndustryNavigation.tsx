'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Briefcase, Factory, Scale, ChevronRight } from 'lucide-react'

interface Industry {
  href: string
  name: string
  icon: typeof Building2
  color: string
  bgColor: string
  borderColor: string
  available: boolean
  stats: string
  featured?: boolean
  badge?: string
}

const industries: Industry[] = [
  {
    href: '/industries/hvac',
    name: 'HVAC Empire Builders',
    icon: Building2,
    color: 'text-orange-600 hover:text-orange-700',
    bgColor: 'bg-orange-600/10 hover:bg-orange-600/20',
    borderColor: 'border-orange-600/20',
    available: true,
    stats: '847 multi-location businesses',
    featured: true,
    badge: 'SPECIALIZED',
  },
  {
    href: '/industries/professional-services',
    name: 'Professional Services',
    icon: Briefcase,
    color: 'text-blue-600 hover:text-blue-700',
    bgColor: 'bg-blue-600/10 hover:bg-blue-600/20',
    borderColor: 'border-blue-600/20',
    available: true,
    stats: 'Coming Soon',
  },
  {
    href: '/industries/manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    color: 'text-green-600 hover:text-green-700',
    bgColor: 'bg-green-600/10 hover:bg-green-600/20',
    borderColor: 'border-green-600/20',
    available: false,
    stats: 'Coming Q1 2025',
  },
  {
    href: '/industries/legal',
    name: 'Legal Practices',
    icon: Scale,
    color: 'text-purple-600 hover:text-purple-700',
    bgColor: 'bg-purple-600/10 hover:bg-purple-600/20',
    borderColor: 'border-purple-600/20',
    available: false,
    stats: 'Coming Q2 2025',
  },
]

export function IndustryNavigation() {
  return (
    <div className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">Industry Focus:</span>
            <span className="text-xs font-bold text-orange-500 bg-orange-500/20 px-2 py-0.5 rounded">HVAC SPECIALIZED</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {industry.available ? (
                  <Link
                    href={industry.href}
                    className={`group flex items-center gap-2 rounded-lg border ${industry.borderColor} ${industry.bgColor} px-3 py-1.5 transition-all duration-200 ${industry.featured ? 'ring-2 ring-orange-500/50' : ''}`}
                  >
                    <industry.icon className={`h-4 w-4 ${industry.color}`} />
                    <span className={`text-sm font-medium ${industry.color}`}>
                      {industry.name}
                    </span>
                    {industry.badge && (
                      <span className="text-xs font-bold text-orange-500 bg-orange-500/20 px-1.5 py-0.5 rounded">
                        {industry.badge}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">({industry.stats})</span>
                    <ChevronRight className={`h-3 w-3 ${industry.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-1.5 opacity-60">
                    <industry.icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">
                      {industry.name}
                    </span>
                    <span className="text-xs text-gray-600">({industry.stats})</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <Link
            href="/industries"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            View All Industries →
          </Link>
        </div>
      </div>
    </div>
  )
}

export function IndustryNavigationCompact() {
  return (
    <div className="bg-gray-950/80 backdrop-blur-sm py-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-6 overflow-x-auto">
          {industries.filter(i => i.available).map((industry) => (
            <Link
              key={industry.href}
              href={industry.href}
              className={`flex items-center gap-1.5 text-sm font-medium ${industry.color} whitespace-nowrap`}
            >
              <industry.icon className="h-3.5 w-3.5" />
              <span>{industry.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}