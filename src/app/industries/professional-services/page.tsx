'use client'

import { motion } from 'framer-motion'
import {
  Briefcase, Clock, DollarSign, Users, FileText, 
  TrendingUp, CheckCircle, Star, Scale, Brain
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ProfessionalServicesPage() {
  const challenges = [
    {
      icon: Clock,
      title: 'Billable Hours Leakage',
      problem: 'Lost 15-20% of billable time due to poor tracking',
      solution: 'AI-powered time capture increases billing by 18%',
    },
    {
      icon: FileText,
      title: 'Project Scope Creep',
      problem: 'Fixed-fee projects consistently run 30% over budget',
      solution: 'Real-time project monitoring prevents overruns',
    },
    {
      icon: Users,
      title: 'Resource Utilization',
      problem: 'Team utilization averaging only 65%',
      solution: 'Smart scheduling optimizes to 85%+ utilization',
    },
    {
      icon: DollarSign,
      title: 'Collection Delays',
      problem: 'Average 67 days to collect invoices',
      solution: 'Automated follow-ups reduce to 35 days',
    },
  ]

  const successMetrics = [
    { value: '523', label: 'Law Firms & Consultancies', icon: Scale },
    { value: '28%', label: 'Revenue Increase', icon: TrendingUp },
    { value: '18%', label: 'More Billable Hours', icon: Clock },
    { value: '45%', label: 'Faster Collections', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-950/20 to-black py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-5xl text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/50 bg-blue-900/30 px-6 py-3">
                <Briefcase className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-blue-300">Professional Services Solution</span>
              </div>
              
              <h1 className="mb-8 text-5xl font-black md:text-7xl">
                Bill More. Collect Faster.
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Scale Your Practice
                </span>
              </h1>
              
              <p className="mx-auto mb-8 max-w-4xl text-xl text-gray-300 md:text-2xl">
                Built for law firms, consultancies, and agencies that need to
                <span className="font-semibold text-blue-400"> maximize billable hours</span>,
                <span className="font-semibold text-purple-400"> automate operations</span>, and
                <span className="font-semibold text-emerald-400"> accelerate growth</span>.
              </p>
              
              {/* Success Metrics */}
              <div className="mx-auto mb-8 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
                {successMetrics.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="rounded-2xl border border-blue-500/50 bg-blue-900/30 p-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <stat.icon className="mx-auto mb-2 h-6 w-6 text-blue-400" />
                    <div className="mb-1 text-2xl font-bold text-blue-400">{stat.value}</div>
                    <div className="text-xs text-blue-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              
              <button className="mb-6 transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-bold text-white transition-all hover:scale-105">
                Start Free Trial for Firms
              </button>
            </motion.div>
          </div>
        </section>
        
        {/* Challenges & Solutions */}
        <section className="bg-gray-950 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-4xl font-bold">
              Challenges Every Firm Faces
              <br />
              <span className="text-blue-400">We Solve Them All</span>
            </h2>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={index}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl border border-blue-500/50 bg-blue-900/30 p-3">
                      <challenge.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-xl font-bold">{challenge.title}</h3>
                      <div className="mb-4 rounded-lg border border-red-500/50 bg-red-900/30 p-3">
                        <div className="text-sm font-semibold text-red-400">The Problem:</div>
                        <div className="text-gray-300">{challenge.problem}</div>
                      </div>
                      <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/30 p-3">
                        <div className="text-sm font-semibold text-emerald-400">Our Solution:</div>
                        <div className="text-white">{challenge.solution}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}