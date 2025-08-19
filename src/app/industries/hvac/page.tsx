'use client'

import { motion } from 'framer-motion'
import {
  Thermometer,
  Wrench,
  MapPin,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function HVACIndustryPage() {
  const hvacChallenges = [
    {
      icon: Clock,
      title: 'Scheduling Nightmares',
      problem: 'Double bookings, no-shows, inefficient routing costing 20+ hours/week',
      solution: 'Smart scheduling with GPS routing saves 25+ hours weekly',
    },
    {
      icon: DollarSign,
      title: 'Lost Revenue',
      problem: 'Manual estimates, forgotten follow-ups, poor inventory tracking',
      solution: 'Automated quotes increase close rate by 40%, inventory alerts prevent stockouts',
    },
    {
      icon: Users,
      title: 'Customer Communication',
      problem: "Customers calling asking 'when will you be here?' constantly",
      solution: 'Real-time updates and automated notifications reduce calls by 80%',
    },
    {
      icon: Wrench,
      title: 'Equipment Management',
      problem: 'No tracking of maintenance schedules, warranty info scattered everywhere',
      solution: 'Complete equipment history and proactive maintenance scheduling',
    },
  ]

  const hvacFeatures = [
    {
      title: 'Smart Dispatch & Routing',
      description: 'Optimize technician routes automatically, reduce drive time by 30%',
      benefits: ['GPS-optimized routing', 'Real-time traffic updates', 'Automatic rescheduling'],
    },
    {
      title: 'Mobile Field Service',
      description: 'Everything your techs need on their phone - no more paperwork',
      benefits: ['Digital work orders', 'Photo documentation', 'Instant invoicing'],
    },
    {
      title: 'Inventory Management',
      description: 'Track parts across trucks and warehouses, never run out again',
      benefits: ['Real-time stock levels', 'Automatic reordering', 'Cost tracking'],
    },
    {
      title: 'Customer Portal',
      description: 'Let customers schedule, track, and pay online - reduce admin work',
      benefits: ['Online booking', 'Service history', 'Payment processing'],
    },
    {
      title: 'Financial Dashboard',
      description: 'See your profit margins, outstanding invoices, and cash flow at a glance',
      benefits: ['Real-time reporting', 'Profit analysis', 'Cash flow forecasting'],
    },
    {
      title: 'Maintenance Contracts',
      description: 'Automate recurring services and increase predictable revenue',
      benefits: ['Contract scheduling', 'Renewal reminders', 'Revenue tracking'],
    },
  ]

  const hvacStats = [
    { number: '847', label: 'HVAC Companies Using CoreFlow360', icon: Users },
    { number: '35%', label: 'Average Revenue Increase', icon: TrendingUp },
    { number: '25+ hrs', label: 'Time Saved Per Week', icon: Clock },
    { number: '40%', label: 'Better Close Rate', icon: DollarSign },
  ]

  const customerStory = {
    company: 'Premier HVAC Solutions',
    owner: 'Mike Rodriguez',
    location: 'Phoenix, AZ',
    employees: '12 technicians',
    beforeRevenue: '$850K/year',
    afterRevenue: '$1.4M/year',
    growth: '+65% growth',
    timeframe: '8 months',
    quote:
      'CoreFlow360 transformed our chaos into a well-oiled machine. We went from constantly firefighting to proactively growing. My techs love the mobile app, customers love the communication, and I love the profit margins.',
    challenges: [
      'Manual scheduling causing double bookings',
      'Technicians spending 2+ hours on paperwork daily',
      '30% of customers calling asking for updates',
      'Inventory scattered across trucks with no tracking',
    ],
    results: [
      'Zero double bookings with smart scheduling',
      'Paperwork eliminated - everything digital',
      'Customer calls reduced by 85%',
      'Perfect inventory tracking across all locations',
    ],
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-orange-950/20 to-black py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-5xl text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/50 bg-orange-900/30 px-6 py-3">
                <Thermometer className="h-5 w-5 text-orange-400" />
                <span className="font-semibold text-orange-300">HVAC Industry Solution</span>
              </div>

              <h1 className="mb-8 text-5xl font-black md:text-7xl">
                Turn Your HVAC Business Into a
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Profit Machine
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-4xl text-xl text-gray-300 md:text-2xl">
                Stop losing money to scheduling chaos, paperwork nightmares, and unhappy customers.
                <span className="font-semibold text-orange-400">
                  {' '}
                  CoreFlow360 automates everything
                </span>{' '}
                so you can focus on
                <span className="font-semibold text-emerald-400"> growing your HVAC empire.</span>
              </p>

              {/* HVAC-Specific Stats */}
              <div className="mx-auto mb-8 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
                {hvacStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="rounded-2xl border border-orange-500/50 bg-orange-900/30 p-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <stat.icon className="mx-auto mb-2 h-6 w-6 text-orange-400" />
                    <div className="mb-1 text-2xl font-bold text-orange-400">{stat.number}</div>
                    <div className="text-xs text-orange-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <button className="mb-6 transform rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-12 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:from-orange-700 hover:to-red-700">
                Start Free HVAC Trial
              </button>

              <div className="text-sm text-gray-400">
                ✓ No credit card required ✓ Setup in under 2 weeks ✓ 847+ HVAC companies trust us
              </div>
            </motion.div>
          </div>
        </section>

        {/* HVAC Challenges */}
        <section className="bg-gray-950 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white">
                Every HVAC Business Faces These Challenges
                <br />
                <span className="text-orange-400">We Solve Every Single One</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {hvacChallenges.map((challenge, index) => (
                <motion.div
                  key={index}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-orange-500/50 bg-orange-900/30">
                      <challenge.icon className="h-6 w-6 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-xl font-bold text-white">{challenge.title}</h3>
                      <div className="mb-4 rounded-lg border border-red-500/50 bg-red-900/30 p-3">
                        <div className="mb-1 text-sm font-semibold text-red-400">The Problem:</div>
                        <div className="text-gray-300">{challenge.problem}</div>
                      </div>
                      <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/30 p-3">
                        <div className="mb-1 text-sm font-semibold text-emerald-400">
                          CoreFlow360 Solution:
                        </div>
                        <div className="text-white">{challenge.solution}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Success Story */}
        <section className="bg-black py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-6xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-12 text-center">
                <h2 className="mb-6 text-4xl font-bold text-white">Real HVAC Success Story</h2>
                <p className="text-xl text-gray-400">How one HVAC company grew 65% in 8 months</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-900/30 to-orange-900/30 p-8">
                {/* Company Info */}
                <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold text-white">{customerStory.company}</h3>
                    <div className="space-y-2 text-gray-300">
                      <div>
                        <span className="text-emerald-400">Owner:</span> {customerStory.owner}
                      </div>
                      <div>
                        <span className="text-emerald-400">Location:</span> {customerStory.location}
                      </div>
                      <div>
                        <span className="text-emerald-400">Team:</span> {customerStory.employees}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-black text-emerald-400">
                      {customerStory.growth}
                    </div>
                    <div className="text-emerald-300">in just {customerStory.timeframe}</div>
                    <div className="mt-2 text-sm text-gray-400">
                      From {customerStory.beforeRevenue} to {customerStory.afterRevenue}
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div className="mb-8 rounded-xl border border-gray-700 bg-gray-900/50 p-6">
                  <div className="text-center">
                    <div className="mb-4 text-2xl text-white italic">"{customerStory.quote}"</div>
                    <div className="mb-2 flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <div className="font-semibold text-emerald-400">
                      - {customerStory.owner}, {customerStory.company}
                    </div>
                  </div>
                </div>

                {/* Before/After */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <h4 className="mb-4 text-xl font-bold text-red-400">Before CoreFlow360:</h4>
                    <div className="space-y-3">
                      {customerStory.challenges.map((challenge, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-400"></div>
                          <span className="text-gray-300">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-4 text-xl font-bold text-emerald-400">After CoreFlow360:</h4>
                    <div className="space-y-3">
                      {customerStory.results.map((result, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                          <span className="text-white">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HVAC Features */}
        <section className="bg-gray-950 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white">
                Complete HVAC Business Management
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to run a profitable HVAC company
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {hvacFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-orange-500/30"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mb-4 text-gray-400">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-orange-950/50 to-red-950/50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white">
                Ready to Transform Your HVAC Business?
              </h2>
              <p className="mb-8 text-xl text-gray-400">
                Join 847+ HVAC companies that chose CoreFlow360. See results in under 30 days or
                your money back.
              </p>

              <div className="mb-8 inline-block rounded-2xl border border-orange-500/50 bg-orange-900/30 p-6">
                <div className="mb-2 font-semibold text-orange-400">HVAC Special Offer:</div>
                <div className="mb-2 text-2xl font-bold text-white">50% OFF First 6 Months</div>
                <div className="text-orange-300">+ Free setup + Free data migration</div>
              </div>

              <button className="mb-6 transform rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-12 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:from-orange-700 hover:to-red-700">
                Start Your HVAC Transformation
              </button>

              <div className="flex flex-col items-center justify-center gap-4 text-sm text-gray-400 sm:flex-row">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Setup in under 2 weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>24/7 HVAC expert support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
