'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Clock, Headphones, FileCheck, Zap, CheckCircle } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function RiskReversalSection() {
  const { trackEvent } = useTrackEvent()

  const guarantees = [
    {
      icon: Shield,
      title: "30-Day Money-Back Guarantee",
      description: "Not satisfied? Get a full refund within 30 days. No questions, no hassles.",
      highlight: "100% Risk-Free"
    },
    {
      icon: Clock,
      title: "2-Week Implementation Promise",
      description: "We guarantee full setup within 2 weeks or your first month is free.",
      highlight: "Speed Guarantee"
    },
    {
      icon: Headphones,
      title: "Unlimited Expert Support",
      description: "24/7 support, free onboarding, and dedicated success manager included.",
      highlight: "Always There"
    },
    {
      icon: FileCheck,
      title: "Free Data Migration",
      description: "We'll migrate all your existing data at no extra cost. Zero data loss guaranteed.",
      highlight: "Seamless Transfer"
    },
    {
      icon: Award,
      title: "Success Guarantee Program",
      description: "If you don't see measurable improvements in 90 days, we'll work for free until you do.",
      highlight: "Results Assured"
    },
    {
      icon: Zap,
      title: "Lock-In Current Pricing",
      description: "Your pricing will never increase. Lock in today's rates forever.",
      highlight: "Price Protection"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/50 px-6 py-3 rounded-full mb-6">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">100% Risk-Free Investment</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            We Take All The Risk,
            <br />
            <span className="text-emerald-400">You Keep All The Rewards</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We're so confident CoreFlow360 will transform your business that we're putting our money where our mouth is. 
            Try it risk-free with these iron-clad guarantees.
          </p>
        </motion.div>

        {/* Guarantees Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {guarantees.map((guarantee, index) => (
            <div 
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 group hover:transform hover:scale-105"
            >
              {/* Icon */}
              <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-emerald-800/40 transition-colors">
                <guarantee.icon className="w-8 h-8 text-emerald-400" />
              </div>

              {/* Highlight Badge */}
              <div className="bg-emerald-500 text-emerald-950 px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                {guarantee.highlight}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">
                {guarantee.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {guarantee.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/50 rounded-2xl p-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">99.8%</div>
              <div className="text-emerald-300 text-sm">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">&lt; 24hrs</div>
              <div className="text-cyan-300 text-sm">Average Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-violet-400 mb-2">$0</div>
              <div className="text-violet-300 text-sm">Setup Fees</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">∞</div>
              <div className="text-orange-300 text-sm">Training & Support</div>
            </div>
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Everything Included. Nothing Extra.
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                "Complete ERP Suite (8 Modules)",
                "Unlimited Users & Data",
                "Advanced Analytics & Reporting",
                "Mobile Apps (iOS & Android)",
                "API Access & Integrations"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              {[
                "24/7 Priority Support",
                "Free Data Migration",
                "Custom Onboarding",
                "Training & Certification",
                "99.9% Uptime SLA"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            With all these guarantees, the only risk is <em>not</em> trying CoreFlow360. 
            Start your risk-free trial today.
          </p>
          
          <button 
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
            onClick={() => trackEvent('risk_reversal_cta_clicked')}
          >
            Start 30-Day Risk-Free Trial
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Full money-back guarantee</span>
            </div>
          </div>
        </motion.div>

        {/* Legal Disclaimer */}
        <motion.div
          className="mt-16 text-xs text-gray-500 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
        >
          <p className="mb-4">
            <strong>Money-Back Guarantee Terms:</strong> Full refund available within 30 days of signup for monthly plans. 
            Annual plans eligible for prorated refund. Refunds processed within 5-7 business days.
          </p>
          
          <p className="mb-4">
            <strong>Implementation Guarantee:</strong> Standard setup completed within 2 weeks for businesses with under 100 users. 
            Complex customizations may require additional time. Free month applies to standard monthly fee only.
          </p>
          
          <p>
            <strong>Success Guarantee:</strong> "Measurable improvements" defined as documented increases in efficiency, 
            cost savings, or revenue attributable to CoreFlow360 usage. Extended support provided at our discretion. 
            Customer must participate in success program activities. Results may vary based on implementation and usage.
          </p>
        </motion.div>
      </div>
    </section>
  )
}