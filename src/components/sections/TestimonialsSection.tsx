/**
 * Testimonials Section - Free SaaS Template
 * Inspired by Linear, Stripe, and other successful SaaS testimonial sections
 */

'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  content: string
  rating: number
  metrics?: {
    improvement: string
    timeframe: string
  }
}

// Sample testimonials - replace with real ones
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Operations Director',
    company: 'TechFlow HVAC',
    avatar: '👩‍💼',
    content:
      'CoreFlow360 transformed our entire operation. The AI orchestrator reduced our manual processes by 78% and our response time to customer issues dropped from hours to minutes. The cross-module insights are game-changing.',
    rating: 5,
    metrics: {
      improvement: '78% efficiency gain',
      timeframe: '3 months',
    },
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Managing Partner',
    company: 'Rodriguez Legal Group',
    avatar: '👨‍💼',
    content:
      'The legal module with AI document analysis has revolutionized our practice. We can process cases 3x faster while maintaining accuracy. The AI insights help us develop better strategies for our clients.',
    rating: 5,
    metrics: {
      improvement: '3x faster processing',
      timeframe: '2 months',
    },
  },
  {
    id: '3',
    name: 'Emily Watson',
    role: 'CFO',
    company: 'GrowthCorp',
    avatar: '👩‍💻',
    content:
      'The financial AI in Bigcapital integration caught anomalies worth $50k that we would have missed. The predictive cash flow modeling is incredibly accurate and helps us make better investment decisions.',
    rating: 5,
    metrics: {
      improvement: '$50k saved',
      timeframe: '1 month',
    },
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Head of HR',
    company: 'InnovateNow',
    avatar: '👨‍💻',
    content:
      'The HR module predicted 89% of our potential turnover cases, allowing us to intervene early. Employee satisfaction increased by 40% after implementing the AI-recommended changes.',
    rating: 5,
    metrics: {
      improvement: '89% prediction accuracy',
      timeframe: '4 months',
    },
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    role: 'VP of Sales',
    company: 'SalesForce Pro',
    avatar: '👩‍🚀',
    content:
      "Twenty CRM with AI lead scoring increased our conversion rate by 156%. The AI knows which leads to prioritize better than our senior sales reps. It's like having a sales genius on the team.",
    rating: 5,
    metrics: {
      improvement: '156% conversion increase',
      timeframe: '6 weeks',
    },
  },
  {
    id: '6',
    name: 'James Park',
    role: 'Project Manager',
    company: 'BuildTech Solutions',
    avatar: '👨‍🔧',
    content:
      'Plane project management with AI optimization reduced our project overruns by 67%. The AI predicts bottlenecks before they happen and suggests resource reallocation automatically.',
    rating: 5,
    metrics: {
      improvement: '67% fewer overruns',
      timeframe: '3 months',
    },
  },
]

export function TestimonialsSection() {
  const { trackEvent } = useTrackEvent()

  return (
    <section className="bg-gradient-to-b from-black to-gray-950 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 className="heading-section mb-6 text-white">
            Loved by <span className="gradient-text-ai">AI-Forward</span> Teams
          </h2>
          <p className="text-body-large mx-auto max-w-3xl text-gray-400">
            See how industry leaders are transforming their operations with AI-orchestrated
            workflows. Real results from real customers across 8 different verticals.
          </p>

          {/* Overall Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="gradient-text-ai text-3xl font-bold">98%</div>
              <div className="text-sm text-gray-400">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-ai text-3xl font-bold">4.9</div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-ai text-3xl font-bold">65%</div>
              <div className="text-sm text-gray-400">Average Efficiency Gain</div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative cursor-pointer"
              onClick={() =>
                trackEvent('testimonial_clicked', {
                  testimonial_id: testimonial.id,
                  company: testimonial.company,
                })
              }
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100" />

              <div className="relative h-full rounded-2xl border border-gray-800/50 bg-gray-900/60 p-6 backdrop-blur-sm transition-all duration-300 group-hover:border-gray-700/50">
                {/* Quote Icon */}
                <Quote className="mb-4 h-8 w-8 text-violet-400" />

                {/* Content */}
                <p className="mb-6 leading-relaxed text-gray-300">"{testimonial.content}"</p>

                {/* Metrics */}
                {testimonial.metrics && (
                  <div className="mb-6 rounded-lg bg-gray-800/50 p-3">
                    <div className="text-center">
                      <div className="gradient-text-ai text-lg font-bold">
                        {testimonial.metrics.improvement}
                      </div>
                      <div className="text-xs text-gray-400">
                        Achieved in {testimonial.metrics.timeframe}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="mb-4 flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className="mr-3 text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-900/30 to-cyan-900/30 p-8">
            <h3 className="mb-4 text-2xl font-bold text-white">Join These Success Stories</h3>
            <p className="mb-6 text-gray-300">
              See how AI can transform your business operations. Start your free trial today and
              experience the power of autonomous ERP.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3 font-semibold text-white transition-all duration-200 hover:from-violet-600 hover:to-cyan-600"
                onClick={() =>
                  trackEvent('testimonials_cta_clicked', {
                    cta_type: 'primary',
                    location: 'testimonials_section',
                  })
                }
              >
                Start Free Trial
              </button>
              <button
                className="rounded-lg border border-gray-600 px-8 py-3 font-semibold text-gray-300 transition-all duration-200 hover:border-gray-500 hover:text-white"
                onClick={() =>
                  trackEvent('testimonials_demo_clicked', {
                    cta_type: 'secondary',
                    location: 'testimonials_section',
                  })
                }
              >
                See Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
