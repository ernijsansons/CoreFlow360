'use client'

import { motion } from 'framer-motion'
import { CustomerStoryCard } from '@/components/ui/CustomerStoryCard'

export function FeaturesGrid() {
  return (
    <section className="relative bg-gray-950 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="heading-section mb-6 text-white">
            Real People. <span className="gradient-text-ai">Real Results.</span>
          </h2>
          <p className="text-body-large mx-auto max-w-3xl text-gray-400">
            Don't take our word for it. Here's what happens when you let AI run your business. These
            are real customers who went from drowning in spreadsheets to running businesses on
            autopilot.
          </p>
        </motion.div>

        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <CustomerStoryCard
            name="Sarah Chen"
            title="Tech Startup Founder"
            company="CloudSync Pro"
            beforeText="I was manually tracking leads in spreadsheets and losing 60% of them"
            afterText="My AI found $247,000 in leads I would have missed. Last month alone."
            metric={{
              value: '$247K',
              label: 'New Revenue Found',
              type: 'money',
              trend: 'up',
            }}
            gradient="violet"
            delay={0.1}
          />

          <CustomerStoryCard
            name="Tom Rodriguez"
            title="Manufacturing Owner"
            company="Precision Parts Co"
            beforeText="Cash flow was a mystery. I never knew if we'd make payroll next month"
            afterText="Tom's AI found $83,000 hiding in his books. In one day."
            metric={{
              value: '$83K',
              label: 'Hidden Cash Found',
              type: 'money',
              trend: 'up',
            }}
            gradient="emerald"
            delay={0.2}
          />

          <CustomerStoryCard
            name="Lisa Park"
            title="HR Director"
            company="GrowthTech Solutions"
            beforeText="We lost our best people and never saw it coming"
            afterText="Haven't lost a single A-player in 8 months. AI tells me who's at risk before they even know it"
            metric={{
              value: '89%',
              label: 'Retention Rate',
              type: 'percentage',
              trend: 'up',
            }}
            gradient="blue"
            delay={0.3}
          />

          <CustomerStoryCard
            name="Mike Johnson"
            title="Construction CEO"
            company="BuildRight Inc"
            beforeText="Projects always ran late and over budget"
            afterText="Last 12 projects finished early and under budget. AI sees problems before I do"
            metric={{
              value: '47%',
              label: 'Faster Delivery',
              type: 'percentage',
              trend: 'up',
            }}
            gradient="cyan"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <CustomerStoryCard
            name="Dave Martinez"
            title="HVAC Business Owner"
            company="Climate Control Pros"
            beforeText="Energy costs were killing our margins"
            afterText="Cut energy costs 32% across all jobs. AI optimizes every system automatically"
            metric={{
              value: '32%',
              label: 'Energy Saved',
              type: 'percentage',
              trend: 'up',
            }}
            gradient="orange"
            delay={0.5}
          />

          <CustomerStoryCard
            name="Rachel Kim"
            title="Law Firm Partner"
            company="Kim & Associates"
            beforeText="Drowning in case documents and missing deadlines"
            afterText="AI reads every document, tracks every deadline. I work 4 days a week now"
            metric={{
              value: '78%',
              label: 'Time Saved',
              type: 'time',
              trend: 'up',
            }}
            gradient="red"
            delay={0.6}
          />

          <CustomerStoryCard
            name="Alex Thompson"
            title="Retail Chain Owner"
            company="Urban Threads"
            beforeText="Always had too much or too little inventory"
            afterText="Perfect stock levels. AI predicts demand better than I ever could"
            metric={{
              value: '91%',
              label: 'Forecast Accuracy',
              type: 'percentage',
              trend: 'up',
            }}
            gradient="emerald"
            delay={0.7}
          />

          <CustomerStoryCard
            name="Jane Foster"
            title="Agency Founder"
            company="Digital Growth Co"
            beforeText="Managing 8 different systems was chaos"
            afterText="Everything works together perfectly. It's like having a COO who never sleeps"
            metric={{
              value: '24/7',
              label: 'Always Working',
              type: 'generic',
            }}
            gradient="violet"
            delay={0.8}
          />
        </div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-violet-500/30 bg-gray-900/40 p-8 backdrop-blur-sm">
            <div className="mb-4 text-2xl font-bold text-white">Your Success Story Starts Here</div>
            <div className="mb-6 text-gray-300">
              Join 1,847 businesses already running on autopilot. Your AI starts learning your
              business in 60 seconds.
            </div>
            <div className="text-sm font-semibold text-emerald-400">
              ✓ 30-day free trial • ✓ No credit card • ✓ Results guaranteed
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
