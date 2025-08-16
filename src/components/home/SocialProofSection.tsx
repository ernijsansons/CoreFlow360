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
    { name: 'BuildCorp', industry: 'Construction' }
  ]

  const testimonials = [
    {
      quote: "CoreFlow360 transformed our chaos into a well-oiled machine. We went from struggling to keep up to scaling effortlessly.",
      author: "Sarah Chen",
      title: "CEO",
      company: "TechFlow Solutions",
      results: "+340% revenue growth",
      timeframe: "6 months",
      image: "/testimonials/sarah-chen.jpg"
    },
    {
      quote: "I was working 80-hour weeks. Now CoreFlow360 runs my $4.2M business while I focus on strategy and growth.",
      author: "Mike Rodriguez",
      title: "Owner",
      company: "Premier HVAC",
      results: "30+ hours saved weekly",
      timeframe: "3 months",
      image: "/testimonials/mike-rodriguez.jpg"
    },
    {
      quote: "The ROI was immediate. We recovered our investment in the first month and haven't looked back since.",
      author: "Jennifer Wu",
      title: "Partner",
      company: "Legal Partners",
      results: "+280% efficiency",
      timeframe: "2 months",
      image: "/testimonials/jennifer-wu.jpg"
    }
  ]

  const stats = [
    { number: "2,847", label: "Businesses Transformed", icon: Building },
    { number: "97%", label: "Customer Satisfaction", icon: Star },
    { number: "$2.4M", label: "Average Revenue Increase", icon: DollarSign },
    { number: "24/7", label: "Automated Operations", icon: TrendingUp }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join <span className="text-violet-400">2,847+ Businesses</span> 
            <br />That Transformed Their Operations
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            From struggling startups to scaling enterprises, businesses trust CoreFlow360 
            to automate their operations and accelerate growth.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-violet-900/20 border border-violet-500/30 rounded-2xl p-6 mb-4">
                <stat.icon className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
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
          <p className="text-center text-gray-400 mb-8">Trusted by industry leaders</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            {customerLogos.map((logo, index) => (
              <div 
                key={index} 
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center hover:border-violet-500/50 transition-colors"
              >
                <div className="text-white font-semibold text-sm mb-1">{logo.name}</div>
                <div className="text-xs text-gray-500">{logo.industry}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-violet-500/30 transition-colors group"
            >
              {/* Quote */}
              <Quote className="w-8 h-8 text-violet-400 mb-4" />
              <p className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Results Badge */}
              <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3 mb-6">
                <div className="text-emerald-400 font-semibold text-sm">
                  {testimonial.results}
                </div>
                <div className="text-emerald-300 text-xs">
                  in just {testimonial.timeframe}
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-cyan-400 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">
                    {testimonial.title}, {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Join Them?
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Start your transformation today. See why thousands of businesses choose CoreFlow360 
            to automate their operations and accelerate growth.
          </p>
          <button 
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            onClick={() => trackEvent('social_proof_cta_clicked')}
          >
            Start Your Free Trial
          </button>
        </motion.div>

        {/* Legal Disclaimer */}
        <div className="mt-12 text-center text-xs text-gray-500 max-w-2xl mx-auto">
          *Testimonials are from real customers but individual results may vary. 
          Results depend on various factors including business model, market conditions, 
          and implementation. Past performance does not guarantee future results.
        </div>
      </div>
    </section>
  )
}