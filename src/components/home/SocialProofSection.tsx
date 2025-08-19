'use client'

import { motion } from 'framer-motion'
import { Star, Quote, TrendingUp, Building, Users, DollarSign } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function SocialProofSection() {
  const { trackEvent } = useTrackEvent()

  const customerLogos = [
    { name: 'TechFlow Solutions', industry: 'Technology' },
    { name: 'Premier HVAC', industry: 'HVAC' },
    { name: 'Legal Partners', industry: 'Legal' },
    { name: 'ManufacturingPro', industry: 'Manufacturing' },
    { name: 'ServiceMaster', industry: 'Professional Services' },
    { name: 'BuildCorp', industry: 'Construction' },
  ]

  const testimonials = [
    {
      quote:
        'CoreFlow360 transformed our chaos into a well-oiled machine. We went from struggling to keep up to scaling effortlessly.',
      author: 'Sarah Chen',
      title: 'CEO',
      company: 'TechFlow Solutions',
      results: '+340% revenue growth',
      timeframe: '6 months',
      image: '/testimonials/sarah-chen.jpg',
    },
    {
      quote:
        'I was working 80-hour weeks. Now CoreFlow360 runs my $4.2M business while I focus on strategy and growth.',
      author: 'Mike Rodriguez',
      title: 'Owner',
      company: 'Premier HVAC',
      results: '30+ hours saved weekly',
      timeframe: '3 months',
      image: '/testimonials/mike-rodriguez.jpg',
    },
    {
      quote:
        "The ROI was immediate. We recovered our investment in the first month and haven't looked back since.",
      author: 'Jennifer Wu',
      title: 'Partner',
      company: 'Legal Partners',
      results: '+280% efficiency',
      timeframe: '2 months',
      image: '/testimonials/jennifer-wu.jpg',
    },
  ]

  const stats = [
    { number: '2,847', label: 'Businesses Transformed', icon: Building },
    { number: '97%', label: 'Customer Satisfaction', icon: Star },
    { number: '$2.4M', label: 'Average Revenue Increase', icon: DollarSign },
    { number: '24/7', label: 'Automated Operations', icon: TrendingUp },
  ]

  return (
    <section className="bg-gradient-to-b from-gray-950 to-black py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Join <span className="text-violet-400">2,847+ Businesses</span>
            <br />
            That Transformed Their Operations
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-400">
            From struggling startups to scaling enterprises, businesses trust CoreFlow360 to
            automate their operations and accelerate growth.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="mb-20 grid grid-cols-2 gap-8 md:grid-cols-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 rounded-2xl border border-violet-500/30 bg-violet-900/20 p-6">
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-violet-400" />
                <div className="mb-2 text-3xl font-bold text-white md:text-4xl">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Customer Logos */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="mb-8 text-center text-gray-400">Trusted by industry leaders</p>
          <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-6">
            {customerLogos.map((logo, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 text-center transition-colors hover:border-violet-500/50"
              >
                <div className="mb-1 text-sm font-semibold text-white">{logo.name}</div>
                <div className="text-xs text-gray-500">{logo.industry}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-gray-800 bg-gray-900/50 p-8 transition-colors hover:border-violet-500/30"
            >
              {/* Quote */}
              <Quote className="mb-4 h-8 w-8 text-violet-400" />
              <p className="mb-6 leading-relaxed text-gray-300">"{testimonial.quote}"</p>

              {/* Results Badge */}
              <div className="mb-6 rounded-lg border border-emerald-500/50 bg-emerald-900/30 p-3">
                <div className="text-sm font-semibold text-emerald-400">{testimonial.results}</div>
                <div className="text-xs text-emerald-300">in just {testimonial.timeframe}</div>
              </div>

              {/* Author */}
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">
                    {testimonial.title}, {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="mt-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-4 text-2xl font-bold text-white">Ready to Join Them?</h3>
          <p className="mx-auto mb-8 max-w-2xl text-gray-400">
            Start your transformation today. See why thousands of businesses choose CoreFlow360 to
            automate their operations and accelerate growth.
          </p>
          <button
            className="transform rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-violet-700 hover:to-cyan-700"
            onClick={() => trackEvent('social_proof_cta_clicked')}
          >
            Start Your Free Trial
          </button>
        </motion.div>

        {/* Legal Disclaimer */}
        <div className="mx-auto mt-12 max-w-2xl text-center text-xs text-gray-500">
          *Testimonials are from real customers but individual results may vary. Results depend on
          various factors including business model, market conditions, and implementation. Past
          performance does not guarantee future results.
        </div>
      </div>
    </section>
  )
}
