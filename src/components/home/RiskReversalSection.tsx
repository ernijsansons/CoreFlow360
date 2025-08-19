'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Clock, Headphones, FileCheck, Zap, CheckCircle } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function RiskReversalSection() {
  const { trackEvent } = useTrackEvent()

  const guarantees = [
    {
      icon: Shield,
      title: '30-Day Money-Back Guarantee',
      description: 'Not satisfied? Get a full refund within 30 days. No questions, no hassles.',
      highlight: '100% Risk-Free',
    },
    {
      icon: Clock,
      title: '2-Week Implementation Promise',
      description: 'We guarantee full setup within 2 weeks or your first month is free.',
      highlight: 'Speed Guarantee',
    },
    {
      icon: Headphones,
      title: 'Unlimited Expert Support',
      description: '24/7 support, free onboarding, and dedicated success manager included.',
      highlight: 'Always There',
    },
    {
      icon: FileCheck,
      title: 'Free Data Migration',
      description:
        "We'll migrate all your existing data at no extra cost. Zero data loss guaranteed.",
      highlight: 'Seamless Transfer',
    },
    {
      icon: Award,
      title: 'Success Guarantee Program',
      description:
        "If you don't see measurable improvements in 90 days, we'll work for free until you do.",
      highlight: 'Results Assured',
    },
    {
      icon: Zap,
      title: 'Lock-In Current Pricing',
      description: "Your pricing will never increase. Lock in today's rates forever.",
      highlight: 'Price Protection',
    },
  ]

  return (
    <section className="bg-gradient-to-b from-gray-950 to-black py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/30 px-6 py-3">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-emerald-300">100% Risk-Free Investment</span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            We Take All The Risk,
            <br />
            <span className="text-emerald-400">You Keep All The Rewards</span>
          </h2>

          <p className="mx-auto max-w-3xl text-xl text-gray-400">
            We're so confident CoreFlow360 will transform your business that we're putting our money
            where our mouth is. Try it risk-free with these iron-clad guarantees.
          </p>
        </motion.div>

        {/* Guarantees Grid */}
        <motion.div
          className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {guarantees.map((guarantee, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all duration-300 hover:scale-105 hover:transform hover:border-emerald-500/30"
            >
              {/* Icon */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-emerald-500/50 bg-emerald-900/30 transition-colors group-hover:bg-emerald-800/40">
                <guarantee.icon className="h-8 w-8 text-emerald-400" />
              </div>

              {/* Highlight Badge */}
              <div className="mb-4 inline-block rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-emerald-950">
                {guarantee.highlight}
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-white">{guarantee.title}</h3>
              <p className="leading-relaxed text-gray-400">{guarantee.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mb-12 rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-3xl font-bold text-emerald-400">99.8%</div>
              <div className="text-sm text-emerald-300">Customer Satisfaction</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-cyan-400">&lt; 24hrs</div>
              <div className="text-sm text-cyan-300">Average Response Time</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-violet-400">$0</div>
              <div className="text-sm text-violet-300">Setup Fees</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-orange-400">∞</div>
              <div className="text-sm text-orange-300">Training & Support</div>
            </div>
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div
          className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-6 text-center text-2xl font-bold text-white">
            Everything Included. Nothing Extra.
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {[
                'Complete ERP Suite (8 Modules)',
                'Unlimited Users & Data',
                'Advanced Analytics & Reporting',
                'Mobile Apps (iOS & Android)',
                'API Access & Integrations',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[
                '24/7 Priority Support',
                'Free Data Migration',
                'Custom Onboarding',
                'Training & Certification',
                '99.9% Uptime SLA',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-400" />
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
          <h3 className="mb-4 text-3xl font-bold text-white">Ready to Transform Your Business?</h3>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-400">
            With all these guarantees, the only risk is <em>not</em> trying CoreFlow360. Start your
            risk-free trial today.
          </p>

          <button
            className="transform rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-12 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-cyan-700 hover:shadow-emerald-500/25"
            onClick={() => trackEvent('risk_reversal_cta_clicked')}
          >
            Start 30-Day Risk-Free Trial
          </button>

          <div className="mt-6 flex flex-col items-center justify-center gap-4 text-sm text-gray-400 sm:flex-row">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Full money-back guarantee</span>
            </div>
          </div>
        </motion.div>

        {/* Legal Disclaimer */}
        <motion.div
          className="mx-auto mt-16 max-w-4xl text-xs text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
        >
          <p className="mb-4">
            <strong>Money-Back Guarantee Terms:</strong> Full refund available within 30 days of
            signup for monthly plans. Annual plans eligible for prorated refund. Refunds processed
            within 5-7 business days.
          </p>

          <p className="mb-4">
            <strong>Implementation Guarantee:</strong> Standard setup completed within 2 weeks for
            businesses with under 100 users. Complex customizations may require additional time.
            Free month applies to standard monthly fee only.
          </p>

          <p>
            <strong>Success Guarantee:</strong> "Measurable improvements" defined as documented
            increases in efficiency, cost savings, or revenue attributable to CoreFlow360 usage.
            Extended support provided at our discretion. Customer must participate in success
            program activities. Results may vary based on implementation and usage.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
