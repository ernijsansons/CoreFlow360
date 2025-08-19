/**
 * FAQ Section - Free SaaS Template
 * Addresses common questions about AI-powered ERP
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

interface FAQ {
  id: string
  question: string
  answer: string
  category: 'general' | 'pricing' | 'technical' | 'ai'
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How does CoreFlow360 differ from traditional ERPs like SAP or Oracle?',
    answer:
      "Unlike traditional ERPs that store data, CoreFlow360's AI agents actively think, predict, and act with your data. We've integrated 8 leading ERP systems with specialized AI agents for each module. While SAP requires months of implementation, our modular approach lets you activate features instantly. Plus, at $7-150/user/month, we're 60% less expensive than enterprise solutions.",
    category: 'general',
  },
  {
    id: '2',
    question: 'What makes your AI orchestration different from other AI tools?',
    answer:
      "Our AI doesn't just automate tasks—it orchestrates entire business processes across modules. When you have CRM + Accounting active, the AI creates cross-departmental workflows automatically. With all modules active, you get full autonomous operations where AI agents collaborate to run your business. It's like having a team of AI specialists working together.",
    category: 'ai',
  },
  {
    id: '3',
    question: 'Can I start with just one module and add more later?',
    answer:
      'Absolutely! Our modular pricing starts at $7/user/month for individual modules. You can activate and deactivate modules instantly through our dashboard. The AI capabilities grow as you add modules—single modules get basic AI, multiple modules enable cross-departmental intelligence, and all modules unlock full autonomous orchestration.',
    category: 'pricing',
  },
  {
    id: '4',
    question: 'How quickly can we get up and running?',
    answer:
      'Most customers are fully operational within 24-48 hours. Our AI handles the complex integrations automatically, and each module comes pre-configured for your industry. No lengthy implementations, no consultant fees, no custom coding required. Just select your modules, customize your workflows, and watch the AI take over.',
    category: 'technical',
  },
  {
    id: '5',
    question: 'Is our data secure with AI processing everything?',
    answer:
      "Security is built into every layer. We use enterprise-grade encryption, zero-trust architecture, and tenant isolation for all data. Your AI agents run in secured containers with audit logging for every action. We're SOC 2 compliant and undergo regular security audits. Your data never leaves our secured infrastructure.",
    category: 'technical',
  },
  {
    id: '6',
    question: 'What industries work best with CoreFlow360?',
    answer:
      'We excel with knowledge-intensive industries: HVAC/Manufacturing (Carbon ERP), Legal Services (Worklenz), HR/Staffing (Ever Gauzy), Financial Services (Bigcapital), and Project-based businesses (Plane). However, our modular approach adapts to any industry that needs CRM, accounting, project management, or HR functions.',
    category: 'general',
  },
  {
    id: '7',
    question: 'How accurate is the AI prediction and automation?',
    answer:
      'Our AI maintains 96% accuracy across prediction tasks like lead scoring, churn prediction, and demand forecasting. For critical decisions, AI provides recommendations with confidence scores, and you maintain final approval. The system learns from your business patterns and improves accuracy over time.',
    category: 'ai',
  },
  {
    id: '8',
    question: 'What happens if we need to cancel or downgrade?',
    answer:
      'No contracts, no penalties. Cancel anytime with 30 days notice. Downgrade modules instantly through your dashboard. You keep all your data, and we provide export tools in standard formats. Our goal is to make AI so valuable that you never want to leave, not trap you with contracts.',
    category: 'pricing',
  },
  {
    id: '9',
    question: 'Do we need technical expertise to manage the AI systems?',
    answer:
      'Not at all. The AI is designed for business users, not IT departments. Setup is point-and-click, AI recommendations are presented in plain English, and the system handles technical complexities automatically. Most of our customers never need to involve their IT team after initial setup.',
    category: 'technical',
  },
  {
    id: '10',
    question: 'How does pricing compare to hiring additional staff?',
    answer:
      'A single CoreFlow360 license at $150/month replaces functions that would cost $8,000+/month in salary for dedicated specialists (CRM manager, accountant, HR coordinator, project manager). The AI works 24/7, never takes vacation, and scales instantly with your business growth.',
    category: 'pricing',
  },
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { trackEvent } = useTrackEvent()

  const toggleItem = (id: string) => {
    const isOpen = openItems.includes(id)
    if (isOpen) {
      setOpenItems(openItems.filter((item) => item !== id))
      trackEvent('faq_closed', { faq_id: id })
    } else {
      setOpenItems([...openItems, id])
      trackEvent('faq_opened', { faq_id: id })
    }
  }

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'General' },
    { id: 'ai', label: 'AI Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'technical', label: 'Technical' },
  ]

  const filteredFAQs =
    activeCategory === 'all' ? faqs : faqs.filter((faq) => faq.category === activeCategory)

  return (
    <section className="bg-gray-950 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="heading-section mb-6 text-white">
            Frequently Asked <span className="gradient-text-ai">Questions</span>
          </h2>
          <p className="text-body-large mx-auto max-w-3xl text-gray-400">
            Everything you need to know about AI-orchestrated ERP. Can't find what you're looking
            for? We're here to help.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id)
                trackEvent('faq_category_clicked', { category: category.id })
              }}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="mx-auto max-w-4xl">
          <AnimatePresence>
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="mb-4"
              >
                <div className="overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-sm">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="flex w-full items-center justify-between px-6 py-6 text-left transition-colors duration-200 hover:bg-gray-800/30"
                  >
                    <span className="pr-4 font-medium text-white">{faq.question}</span>
                    <div className="flex-shrink-0">
                      {openItems.includes(faq.id) ? (
                        <Minus className="h-5 w-5 text-violet-400" />
                      ) : (
                        <Plus className="h-5 w-5 text-violet-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openItems.includes(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 leading-relaxed text-gray-300">{faq.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 to-cyan-900/20 p-8">
            <h3 className="mb-4 text-xl font-bold text-white">Still have questions?</h3>
            <p className="mb-6 text-gray-300">
              Our AI specialists are standing by to help you understand how CoreFlow360 can
              transform your business operations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-violet-600 hover:to-cyan-600"
                onClick={() => trackEvent('faq_contact_clicked', { location: 'faq_section' })}
              >
                Contact Support
              </button>
              <button
                className="rounded-lg border border-gray-600 px-6 py-3 font-semibold text-gray-300 transition-all duration-200 hover:border-gray-500 hover:text-white"
                onClick={() => trackEvent('faq_demo_clicked', { location: 'faq_section' })}
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
