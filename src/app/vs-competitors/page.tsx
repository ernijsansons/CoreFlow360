'use client'

import { motion } from 'framer-motion'
import { CheckCircle, X, DollarSign, Clock, Zap, Shield, Star, TrendingUp } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function VsCompetitorsPage() {
  const competitors = [
    {
      name: 'Legacy ERP Systems',
      examples: '(SAP, Oracle, Microsoft Dynamics)',
      problems: [
        '6-12 month implementation',
        '$50K-500K+ setup costs',
        'Requires IT team',
        'Complex training needed',
        'Limited integrations',
        'Poor mobile experience',
      ],
      costs: '$150K-2M+ first year',
    },
    {
      name: 'Point Solutions',
      examples: '(Salesforce + QuickBooks + others)',
      problems: [
        'Data silos everywhere',
        'Multiple logins/passwords',
        'No unified reporting',
        'Integration nightmares',
        'Expensive per-app pricing',
        'Support chaos',
      ],
      costs: '$500-2K+ per month',
    },
    {
      name: 'Manual Processes',
      examples: '(Spreadsheets, Paper, Email)',
      problems: [
        'Human error prone',
        'No real-time insights',
        'Time-consuming updates',
        'Version control issues',
        'Limited scalability',
        'Compliance risks',
      ],
      costs: '30+ hours/week lost',
    },
  ]

  const comparisonTable = [
    {
      feature: 'Implementation Time',
      coreflow: '< 2 weeks',
      competitor1: '6-12 months',
      competitor2: '3-6 months',
      competitor3: 'Ongoing manual work',
    },
    {
      feature: 'Setup Cost',
      coreflow: '$0',
      competitor1: '$50K-500K+',
      competitor2: '$5K-50K',
      competitor3: '$0',
    },
    {
      feature: 'Monthly Cost (50 users)',
      coreflow: '$4,250',
      competitor1: '$15K-50K+',
      competitor2: '$8K-15K',
      competitor3: '$0 (but lost productivity)',
    },
    {
      feature: 'Training Required',
      coreflow: '2 hours',
      competitor1: '40+ hours',
      competitor2: '20+ hours',
      competitor3: 'Ongoing confusion',
    },
    {
      feature: 'Mobile Experience',
      coreflow: 'Native apps',
      competitor1: 'Poor/None',
      competitor2: 'Limited',
      competitor3: 'None',
    },
    {
      feature: 'Integration Capability',
      coreflow: '500+ apps',
      competitor1: 'Limited/Expensive',
      competitor2: 'Complex setup',
      competitor3: 'Manual data entry',
    },
    {
      feature: 'Support Quality',
      coreflow: '24/7 Priority',
      competitor1: 'Pay per incident',
      competitor2: 'Business hours',
      competitor3: 'None',
    },
    {
      feature: 'ROI Timeline',
      coreflow: '< 30 days',
      competitor1: '12-24 months',
      competitor2: '6-12 months',
      competitor3: 'Never',
    },
  ]

  const successStories = [
    {
      company: 'TechFlow Solutions',
      industry: 'Technology',
      previousSolution: 'Salesforce + QuickBooks + 6 other tools',
      problem: 'Spending $12K/month on disconnected tools, data everywhere',
      result: 'Now pays $3,400/month for everything integrated',
      savings: '$8,600/month saved',
      timeframe: 'ROI in 3 weeks',
    },
    {
      company: 'Premier HVAC',
      industry: 'HVAC',
      previousSolution: 'Manual processes + spreadsheets',
      problem: 'Owner working 80 hours/week, no real-time visibility',
      result: 'Automated workflows, real-time dashboards, owner works 40 hours',
      savings: '40 hours/week saved',
      timeframe: 'Transformed in 10 days',
    },
    {
      company: 'Manufacturing Plus',
      industry: 'Manufacturing',
      previousSolution: 'Legacy ERP system (SAP)',
      problem: '$200K implementation, still not working after 18 months',
      result: 'Full CoreFlow360 implementation in 12 days, everything works',
      savings: '$180K saved on implementation',
      timeframe: 'Up and running in under 2 weeks',
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-red-950/20 to-black py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-900/30 px-6 py-3">
                <TrendingUp className="h-5 w-5 text-red-400" />
                <span className="font-semibold text-red-300">Competitive Analysis</span>
              </div>

              <h1 className="mb-8 text-5xl font-black md:text-6xl">
                Why <span className="text-red-400">Every Alternative</span>
                <br />
                Falls Short of CoreFlow360
              </h1>

              <p className="mb-8 text-xl text-gray-400">
                We've analyzed every major business software solution. Here's the brutal truth about
                why businesses are ditching their current systems for CoreFlow360.
              </p>

              <div className="inline-block rounded-2xl border border-emerald-500/50 bg-emerald-900/30 p-6">
                <div className="mb-2 text-lg font-semibold text-emerald-400">The Bottom Line:</div>
                <div className="text-2xl font-bold text-white">
                  CoreFlow360 = Better, Faster, Cheaper
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problem Overview */}
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
                The Three Paths Businesses Take
                <br />
                <span className="text-red-400">(And Why They All Fail)</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {competitors.map((competitor, index) => (
                <motion.div
                  key={index}
                  className="rounded-2xl border border-red-500/50 bg-red-900/20 p-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-6 text-center">
                    <h3 className="mb-2 text-xl font-bold text-white">{competitor.name}</h3>
                    <p className="text-sm text-gray-400">{competitor.examples}</p>
                  </div>

                  <div className="mb-6 space-y-3">
                    {competitor.problems.map((problem, problemIndex) => (
                      <div key={problemIndex} className="flex items-start gap-3">
                        <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                        <span className="text-sm text-gray-300">{problem}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-red-600/50 bg-red-800/30 p-4 text-center">
                    <div className="text-sm font-semibold text-red-400">Typical Cost:</div>
                    <div className="font-bold text-white">{competitor.costs}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section className="bg-black py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white">Head-to-Head Comparison</h2>
              <p className="text-xl text-gray-400">
                See exactly how CoreFlow360 crushes the competition
              </p>
            </motion.div>

            <motion.div
              className="overflow-x-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <table className="w-full overflow-hidden rounded-2xl bg-gray-900">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-6 text-left font-semibold text-white">Feature</th>
                    <th className="bg-emerald-900/50 p-6 text-center font-bold text-emerald-400">
                      CoreFlow360
                      <div className="mt-1 text-xs text-emerald-300">👑 Winner</div>
                    </th>
                    <th className="p-6 text-center text-gray-400">Legacy ERP</th>
                    <th className="p-6 text-center text-gray-400">Point Solutions</th>
                    <th className="p-6 text-center text-gray-400">Manual Process</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((row, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="p-6 font-medium text-white">{row.feature}</td>
                      <td className="border-x border-emerald-500/30 bg-emerald-900/20 p-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                          <span className="font-semibold text-emerald-400">{row.coreflow}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center text-gray-400">{row.competitor1}</td>
                      <td className="p-6 text-center text-gray-400">{row.competitor2}</td>
                      <td className="p-6 text-center text-gray-400">{row.competitor3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* Success Stories */}
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
                Real Businesses, Real Transformations
              </h2>
              <p className="text-xl text-gray-400">
                See how companies ditched their old systems for CoreFlow360
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {successStories.map((story, index) => (
                <motion.div
                  key={index}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{story.company}</h3>
                    <p className="text-sm text-emerald-400">{story.industry}</p>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-sm text-gray-400">Previous Solution:</div>
                    <div className="font-medium text-white">{story.previousSolution}</div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-sm text-red-400">The Problem:</div>
                    <div className="text-gray-300">{story.problem}</div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-sm text-emerald-400">CoreFlow360 Result:</div>
                    <div className="text-white">{story.result}</div>
                  </div>

                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/30 p-4">
                    <div className="text-lg font-bold text-emerald-400">{story.savings}</div>
                    <div className="text-sm text-emerald-300">{story.timeframe}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-emerald-950/50 to-cyan-950/50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white">Stop Settling for Less</h2>
              <p className="mb-8 text-xl text-gray-400">
                Join the 2,847+ businesses that chose the superior solution. See why CoreFlow360
                beats every alternative.
              </p>

              <button className="mb-6 transform rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-12 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-cyan-700">
                Start Your Free 30-Day Trial
              </button>

              <div className="flex flex-col items-center justify-center gap-4 text-sm text-gray-400 sm:flex-row">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Setup in under 2 weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="bg-black py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-xs text-gray-500">
              <p className="mb-4">
                *Competitive comparisons based on publicly available pricing and feature information
                as of 2024. Individual experiences may vary. Implementation times and costs depend
                on business complexity and requirements.
              </p>
              <p className="mb-4">
                *Customer results are real but individual results may vary. Success stories
                represent actual customer experiences but outcomes depend on various factors
                including business model, implementation, and market conditions.
              </p>
              <p>
                *Pricing comparisons based on equivalent functionality for a 50-user business.
                Competitor pricing may vary based on specific configurations and contract terms. All
                trademark names are property of their respective owners.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
