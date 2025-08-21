'use client'

export const dynamic = 'force-dynamic'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Flame, Briefcase, HardHat, Factory, 
  ArrowRight, TrendingUp, Users, DollarSign 
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function IndustriesPage() {
  const industries = [
    {
      id: 'hvac',
      icon: Flame,
      title: 'HVAC Contractors',
      description: 'Service scheduling, equipment tracking, and maintenance contracts optimized for HVAC businesses.',
      color: 'orange',
      metrics: {
        companies: '872',
        efficiency: '+42%',
        revenue: '+31%',
      },
      href: '/industries/hvac',
      features: ['Smart Scheduling', 'Inventory Management', 'Service Contracts', 'Route Optimization'],
    },
    {
      id: 'professional-services',
      icon: Briefcase,
      title: 'Professional Services',
      description: 'Billable hours tracking, project management, and client billing for law firms and consultancies.',
      color: 'blue',
      metrics: {
        companies: '523',
        efficiency: '+28%',
        revenue: '+18%',
      },
      href: '/industries/professional-services',
      features: ['Time Tracking', 'Project Management', 'Client Portal', 'Automated Billing'],
    },
    {
      id: 'construction',
      icon: HardHat,
      title: 'Construction',
      description: 'Job site management, equipment tracking, and project coordination for construction companies.',
      color: 'yellow',
      metrics: {
        companies: '312',
        efficiency: '+35%',
        revenue: '+22%',
      },
      href: '/industries/construction',
      features: ['Job Costing', 'Equipment Tracking', 'Subcontractor Management', 'Safety Compliance'],
    },
    {
      id: 'manufacturing',
      icon: Factory,
      title: 'Manufacturing',
      description: 'Production planning, inventory control, and quality management for manufacturers.',
      color: 'green',
      metrics: {
        companies: 'Coming Soon',
        efficiency: 'TBD',
        revenue: 'TBD',
      },
      href: '/industries/manufacturing',
      features: ['Production Planning', 'Quality Control', 'Supply Chain', 'Warehouse Management'],
      comingSoon: true,
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      orange: {
        border: 'border-orange-500/50',
        bg: 'bg-orange-900/30',
        text: 'text-orange-400',
        hover: 'hover:bg-orange-900/50',
        gradient: 'from-orange-400 to-red-400',
      },
      blue: {
        border: 'border-blue-500/50',
        bg: 'bg-blue-900/30',
        text: 'text-blue-400',
        hover: 'hover:bg-blue-900/50',
        gradient: 'from-blue-400 to-purple-400',
      },
      yellow: {
        border: 'border-yellow-500/50',
        bg: 'bg-yellow-900/30',
        text: 'text-yellow-400',
        hover: 'hover:bg-yellow-900/50',
        gradient: 'from-yellow-400 to-orange-400',
      },
      green: {
        border: 'border-green-500/50',
        bg: 'bg-green-900/30',
        text: 'text-green-400',
        hover: 'hover:bg-green-900/50',
        gradient: 'from-green-400 to-emerald-400',
      },
    }
    return colors[color as keyof typeof colors]
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-950/20 to-black py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-5xl text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="mb-8 text-5xl font-black md:text-7xl">
                Industry-Specific Solutions
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Built for Your Business
                </span>
              </h1>
              
              <p className="mx-auto mb-12 max-w-3xl text-xl text-gray-300">
                We don't believe in one-size-fits-all. CoreFlow360 adapts to your industry's 
                unique workflows, regulations, and challenges.
              </p>
              
              {/* Overall Stats */}
              <div className="mx-auto mb-16 grid max-w-3xl grid-cols-3 gap-6">
                <div className="rounded-xl border border-purple-500/50 bg-purple-900/30 p-4">
                  <Users className="mx-auto mb-2 h-6 w-6 text-purple-400" />
                  <div className="text-3xl font-bold text-purple-400">2,019</div>
                  <div className="text-sm text-purple-300">Active Companies</div>
                </div>
                <div className="rounded-xl border border-purple-500/50 bg-purple-900/30 p-4">
                  <TrendingUp className="mx-auto mb-2 h-6 w-6 text-purple-400" />
                  <div className="text-3xl font-bold text-purple-400">35%</div>
                  <div className="text-sm text-purple-300">Avg Efficiency Gain</div>
                </div>
                <div className="rounded-xl border border-purple-500/50 bg-purple-900/30 p-4">
                  <DollarSign className="mx-auto mb-2 h-6 w-6 text-purple-400" />
                  <div className="text-3xl font-bold text-purple-400">24%</div>
                  <div className="text-sm text-purple-300">Avg Revenue Increase</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Industries Grid */}
        <section className="bg-gray-950 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {industries.map((industry, index) => {
                const colors = getColorClasses(industry.color)
                
                return (
                  <motion.div
                    key={industry.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link href={industry.href}>
                      <div className={`group relative h-full rounded-2xl border ${colors.border} ${colors.bg} p-8 transition-all ${colors.hover} ${industry.comingSoon ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        {industry.comingSoon && (
                          <div className="absolute top-4 right-4 rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
                            Coming Soon
                          </div>
                        )}
                        
                        {/* Header */}
                        <div className="mb-6 flex items-start justify-between">
                          <div>
                            <div className={`mb-4 inline-flex rounded-xl border ${colors.border} ${colors.bg} p-3`}>
                              <industry.icon className={`h-8 w-8 ${colors.text}`} />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-white">
                              {industry.title}
                            </h3>
                            <p className="text-gray-400">
                              {industry.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Metrics */}
                        <div className="mb-6 grid grid-cols-3 gap-4">
                          <div>
                            <div className={`text-lg font-bold ${colors.text}`}>
                              {industry.metrics.companies}
                            </div>
                            <div className="text-xs text-gray-500">Companies</div>
                          </div>
                          <div>
                            <div className={`text-lg font-bold ${colors.text}`}>
                              {industry.metrics.efficiency}
                            </div>
                            <div className="text-xs text-gray-500">Efficiency</div>
                          </div>
                          <div>
                            <div className={`text-lg font-bold ${colors.text}`}>
                              {industry.metrics.revenue}
                            </div>
                            <div className="text-xs text-gray-500">Revenue</div>
                          </div>
                        </div>
                        
                        {/* Features */}
                        <div className="mb-6 flex flex-wrap gap-2">
                          {industry.features.map((feature) => (
                            <span
                              key={feature}
                              className={`rounded-full border ${colors.border} px-3 py-1 text-xs ${colors.text}`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        {/* CTA */}
                        {!industry.comingSoon && (
                          <div className={`flex items-center gap-2 ${colors.text} transition-transform group-hover:translate-x-2`}>
                            <span className="font-semibold">Learn More</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}