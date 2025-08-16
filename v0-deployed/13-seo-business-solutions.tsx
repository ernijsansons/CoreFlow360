'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  MegaphoneIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ClockIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  StarIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import Head from 'next/head'

interface ModuleBenefit {
  problem: string
  solution: string
  result: string
  icon: React.ReactNode
}

interface IndustrySolution {
  name: string
  icon: React.ReactNode
  description: string
  features: string[]
  results: string[]
}

interface CustomerStory {
  company: string
  industry: string
  challenge: string
  solution: string
  results: {
    metric: string
    improvement: string
  }[]
  quote: string
  author: string
  position: string
  avatar: string
}

interface FAQ {
  question: string
  answer: string
  targetSnippet: string
}

const BusinessSolutionsHub: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('crm')
  const [employees, setEmployees] = useState<number>(10)
  const [currentSoftwareCost, setCurrentSoftwareCost] = useState<number>(500)
  const [hoursLostPerWeek, setHoursLostPerWeek] = useState<number>(5)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '200%'])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const modules = [
    {
      id: 'crm',
      name: 'CRM & Sales Automation',
      icon: <ChartBarIcon className="h-8 w-8" />,
      gradient: 'from-violet-600 to-purple-600',
      benefits: [
        {
          problem: 'Leads disappearing without follow-up',
          solution: 'Automated lead scoring and nurturing sequences',
          result: '35% increase in conversion rates',
          icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
        },
        {
          problem: 'Sales team missing opportunities',
          solution: 'Pipeline automation with next-best-action recommendations',
          result: '50% more deals closed per month',
          icon: <RocketLaunchIcon className="h-6 w-6" />,
        },
        {
          problem: 'No visibility into sales performance',
          solution: 'Real-time sales dashboard with forecasting',
          result: 'Accurate revenue predictions 3 months ahead',
          icon: <ChartBarIcon className="h-6 w-6" />,
        },
      ],
    },
    {
      id: 'finance',
      name: 'Financial Management',
      icon: <CurrencyDollarIcon className="h-8 w-8" />,
      gradient: 'from-emerald-600 to-green-600',
      benefits: [
        {
          problem: 'Not knowing if you can pay bills next month',
          solution: 'Live cash flow dashboard with 90-day forecasting',
          result: 'Avoid $10K+ in late fees annually',
          icon: <CurrencyDollarIcon className="h-6 w-6" />,
        },
        {
          problem: 'Invoices sent late, payments delayed',
          solution: 'Auto-generate and send invoices, payment reminders',
          result: 'Get paid 40% faster, improve cash flow',
          icon: <ClockIcon className="h-6 w-6" />,
        },
        {
          problem: 'Unclear where money is being wasted',
          solution: 'AI identifies unnecessary expenses and cost savings',
          result: 'Reduce expenses by 15-25% annually',
          icon: <SparklesIcon className="h-6 w-6" />,
        },
      ],
    },
    {
      id: 'operations',
      name: 'Operations Optimization',
      icon: <CogIcon className="h-8 w-8" />,
      gradient: 'from-cyan-600 to-blue-600',
      benefits: [
        {
          problem: 'Manual stock counting, frequent stockouts',
          solution: 'Automated reordering with demand forecasting',
          result: 'Reduce inventory costs by 30%',
          icon: <CogIcon className="h-6 w-6" />,
        },
        {
          problem: 'Quality issues discovered too late',
          solution: 'Real-time quality monitoring and alerts',
          result: '95% reduction in quality complaints',
          icon: <ShieldCheckIcon className="h-6 w-6" />,
        },
        {
          problem: 'Inefficient staff scheduling',
          solution: 'AI-optimized scheduling and resource allocation',
          result: '25% improvement in productivity',
          icon: <UserGroupIcon className="h-6 w-6" />,
        },
      ],
    },
    {
      id: 'hr',
      name: 'HR & Team Management',
      icon: <UserGroupIcon className="h-8 w-8" />,
      gradient: 'from-purple-600 to-pink-600',
      benefits: [
        {
          problem: 'High employee turnover and low engagement',
          solution: 'Automated satisfaction surveys and performance tracking',
          result: '60% reduction in turnover',
          icon: <UserGroupIcon className="h-6 w-6" />,
        },
        {
          problem: 'Slow hiring process',
          solution: 'Automated candidate screening and interview scheduling',
          result: '45% faster hiring process',
          icon: <ClockIcon className="h-6 w-6" />,
        },
        {
          problem: 'Manual HR administration',
          solution: 'Automated payroll, benefits, and compliance tracking',
          result: '80% less HR administrative work',
          icon: <DocumentTextIcon className="h-6 w-6" />,
        },
      ],
    },
    {
      id: 'marketing',
      name: 'Marketing Automation',
      icon: <MegaphoneIcon className="h-8 w-8" />,
      gradient: 'from-pink-600 to-rose-600',
      benefits: [
        {
          problem: 'Leads not being nurtured properly',
          solution: 'Multi-channel lead capture with automatic scoring',
          result: '300% increase in qualified leads',
          icon: <MegaphoneIcon className="h-6 w-6" />,
        },
        {
          problem: 'Low email engagement rates',
          solution: 'Personalized email sequences based on behavior',
          result: '45% higher open rates, 60% more clicks',
          icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
        },
        {
          problem: 'No visibility into marketing ROI',
          solution: 'Real-time ROI tracking across all channels',
          result: 'Improve marketing ROI by 150%',
          icon: <ChartBarIcon className="h-6 w-6" />,
        },
      ],
    },
  ]

  const industries: IndustrySolution[] = [
    {
      name: 'Manufacturing',
      icon: <CogIcon className="h-12 w-12" />,
      description: 'Streamline production, optimize supply chain, and ensure quality control',
      features: [
        'Production Planning',
        'Quality Control',
        'Supply Chain Management',
        'Equipment Maintenance',
      ],
      results: [
        '30% reduction in production costs',
        '95% on-time delivery',
        '50% less inventory waste',
      ],
    },
    {
      name: 'Professional Services',
      icon: <BuildingOfficeIcon className="h-12 w-12" />,
      description: 'Manage projects, track time, and optimize resource allocation',
      features: ['Project Management', 'Time Tracking', 'Resource Planning', 'Client Portal'],
      results: [
        '40% increase in billable hours',
        '60% faster project delivery',
        '35% higher profit margins',
      ],
    },
    {
      name: 'Retail & E-commerce',
      icon: <GlobeAltIcon className="h-12 w-12" />,
      description: 'Manage inventory, analyze customer behavior, and optimize sales',
      features: [
        'Inventory Management',
        'Customer Analytics',
        'Multi-channel Sales',
        'Automated Reordering',
      ],
      results: [
        '25% increase in sales',
        '40% reduction in stockouts',
        '30% improvement in customer satisfaction',
      ],
    },
  ]

  const customerStories: CustomerStory[] = [
    {
      company: 'TechFlow Manufacturing',
      industry: 'Manufacturing',
      challenge: 'Manual processes causing delays and quality issues',
      solution: 'Implemented CoreFlow360 operations and quality modules',
      results: [
        { metric: 'Production Efficiency', improvement: '+45%' },
        { metric: 'Quality Defects', improvement: '-90%' },
        { metric: 'On-time Delivery', improvement: '+95%' },
      ],
      quote:
        "CoreFlow360 transformed our manufacturing operations. We've eliminated quality issues and increased efficiency by 45% in just 6 months.",
      author: 'Sarah Johnson',
      position: 'Operations Director',
      avatar: '/avatars/sarah-johnson.jpg',
    },
    {
      company: 'Apex Consulting',
      industry: 'Professional Services',
      challenge: 'Poor project visibility and resource allocation',
      solution: 'Deployed CoreFlow360 project management and CRM',
      results: [
        { metric: 'Project Profitability', improvement: '+60%' },
        { metric: 'Client Satisfaction', improvement: '+40%' },
        { metric: 'Resource Utilization', improvement: '+35%' },
      ],
      quote:
        'Our project profitability increased 60% after implementing CoreFlow360. The visibility into our operations is game-changing.',
      author: 'Michael Chen',
      position: 'CEO',
      avatar: '/avatars/michael-chen.jpg',
    },
  ]

  const faqs: FAQ[] = [
    {
      question: 'What is the best business management software for small businesses in 2024?',
      answer:
        'CoreFlow360 is rated as the #1 business management software for small businesses, offering integrated CRM, Finance, HR, Operations, and Marketing automation. With a 4.9/5 star rating from 1200+ businesses and starting at $45/user/month, it provides the best value and functionality for growing companies.',
      targetSnippet: 'best business management software small business',
    },
    {
      question: 'How much does business management software cost?',
      answer:
        'Business management software costs vary widely. Basic solutions start at $10-20/user/month, while comprehensive platforms like CoreFlow360 cost $45-65/user/month. Enterprise solutions can cost $100-300/user/month. CoreFlow360 provides the most value with all modules included in one affordable price.',
      targetSnippet: 'business management software cost',
    },
    {
      question: "What's the difference between ERP and business management software?",
      answer:
        'ERP (Enterprise Resource Planning) traditionally refers to large, complex systems for big companies. Modern business management software like CoreFlow360 provides ERP functionality in a simpler, more affordable package designed specifically for small to medium businesses. The terms are often used interchangeably today.',
      targetSnippet: 'difference between ERP and business management software',
    },
    {
      question: 'How long does it take to implement business management software?',
      answer:
        'Implementation time varies by company size and complexity. With CoreFlow360, most small businesses are fully operational within 2-4 weeks. Our guided setup process, data migration assistance, and dedicated support team ensure a smooth transition from your current systems.',
      targetSnippet: 'business management software implementation time',
    },
  ]

  // ROI Calculations
  const calculations = {
    timeSavings: employees * hoursLostPerWeek * 52 * 25,
    softwareSavings: currentSoftwareCost * 12 * 0.6,
    productivityGains: employees * 2000,
    totalSavings: 0,
  }

  calculations.totalSavings =
    calculations.timeSavings + calculations.softwareSavings + calculations.productivityGains

  const coreflowCost = employees * 45 * 12
  const netSavings = calculations.totalSavings - coreflowCost
  const roi = ((netSavings / coreflowCost) * 100).toFixed(0)

  return (
    <>
      <Head>
        <title>Best Business Management Software 2024 | CoreFlow360 ERP</title>
        <meta
          name="description"
          content="#1 Rated Business Management Software. CRM, Finance, HR, Operations & Marketing in one platform. 30-day free trial. 4.9/5 stars from 1000+ businesses."
        />
        <meta
          name="keywords"
          content="business management software, small business ERP, CRM software, financial management, business automation, all in one business software, operations management, marketing automation"
        />
        <link rel="canonical" href="https://coreflow360.com/business-solutions" />

        <meta property="og:title" content="Best Business Management Software 2024 | CoreFlow360" />
        <meta
          property="og:description"
          content="Transform your business with CoreFlow360's complete ERP platform. Used by 10,000+ businesses worldwide."
        />
        <meta
          property="og:image"
          content="https://coreflow360.com/images/og-business-solutions.jpg"
        />
        <meta property="og:url" content="https://coreflow360.com/business-solutions" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'CoreFlow360 Business Management Software',
            description:
              'Complete business management platform with CRM, Finance, HR, Operations, and Marketing automation',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web Browser, iOS, Android',
            offers: {
              '@type': 'Offer',
              price: '45',
              priceCurrency: 'USD',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                billingIncrement: 'Monthly',
                price: '45',
                priceCurrency: 'USD',
                unitText: 'per user',
              },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '1247',
            },
          })}
        </script>
      </Head>

      <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        {/* Animated Background */}
        <motion.div className="fixed inset-0 opacity-30" style={{ y: backgroundY }}>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-cyan-600/20 to-emerald-600/20" />
          <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-cyan-600/10 blur-3xl delay-1000" />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 animate-pulse rounded-full bg-emerald-600/10 blur-3xl delay-2000" />
        </motion.div>

        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-6xl text-center"
          >
            <motion.div style={{ y: textY }} className="mb-8">
              <h1 className="mb-6 bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
                Transform Your Business with CoreFlow360
              </h1>
              <p className="mx-auto mb-8 max-w-4xl text-xl text-gray-300 md:text-2xl">
                The #1 rated all-in-one business management platform. CRM, Finance, HR, Operations &
                Marketing automation in one powerful system.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <button className="transform rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:from-violet-700 hover:to-purple-700 hover:shadow-xl">
                Start Free 30-Day Trial
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-gray-400 bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:border-white">
                <PlayCircleIcon className="h-5 w-5" />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid grid-cols-2 gap-8 text-center md:grid-cols-4"
            >
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-emerald-400">10,000+</div>
                <div className="text-gray-300">Businesses Trust Us</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-cyan-400">4.9/5</div>
                <div className="text-gray-300">Customer Rating</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-violet-400">300%</div>
                <div className="text-gray-300">Average ROI</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-pink-400">24/7</div>
                <div className="text-gray-300">Expert Support</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Business Pain Points */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Stop Losing Money to These Common Problems
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-300">
                Every day you delay solving these issues costs your business thousands in lost
                revenue and wasted time.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />,
                  title: 'Scattered Business Data',
                  problem: 'Information trapped in spreadsheets, emails, and disconnected tools',
                  cost: '$50,000+ annually in lost productivity',
                },
                {
                  icon: <ClockIcon className="h-12 w-12 text-orange-400" />,
                  title: 'Manual Repetitive Tasks',
                  problem: 'Staff spending hours on data entry and routine processes',
                  cost: '15-20 hours per employee per week wasted',
                },
                {
                  icon: <CurrencyDollarIcon className="h-12 w-12 text-yellow-400" />,
                  title: 'Poor Financial Visibility',
                  problem: 'No real-time view of cash flow and financial position',
                  cost: '40% of businesses fail due to cash flow issues',
                },
                {
                  icon: <ArrowTrendingUpIcon className="h-12 w-12 text-green-400" />,
                  title: 'Lost Sales Opportunities',
                  problem: 'Leads falling through cracks, missed follow-ups',
                  cost: '35% of potential revenue lost annually',
                },
                {
                  icon: <CogIcon className="h-12 w-12 text-blue-400" />,
                  title: 'Inefficient Operations',
                  problem: 'Unknown bottlenecks and undefined processes',
                  cost: '25% higher operational costs',
                },
                {
                  icon: <UserGroupIcon className="h-12 w-12 text-purple-400" />,
                  title: 'Team Misalignment',
                  problem: 'Poor communication and collaboration',
                  cost: '60% higher employee turnover',
                },
              ].map((pain, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-gray-700 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-500"
                >
                  <div className="mb-4">{pain.icon}</div>
                  <h3 className="mb-3 text-xl font-bold text-white">{pain.title}</h3>
                  <p className="mb-4 text-gray-300">{pain.problem}</p>
                  <div className="font-semibold text-red-400">{pain.cost}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Module Solutions */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-6 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Complete Business Solutions
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-300">
                Five powerful modules that work together to transform every aspect of your business
                operations.
              </p>
            </motion.div>

            {/* Module Navigation */}
            <div className="mb-12 flex flex-wrap justify-center gap-4">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
                    activeModule === module.id
                      ? `bg-gradient-to-r ${module.gradient} text-white shadow-lg`
                      : 'bg-white/10 text-gray-300 backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  {module.icon}
                  {module.name}
                </button>
              ))}
            </div>

            {/* Active Module Content */}
            <AnimatePresence mode="wait">
              {modules.map(
                (module) =>
                  activeModule === module.id && (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                      className={`bg-gradient-to-br backdrop-blur-sm ${module.gradient}/20 rounded-2xl border border-gray-700 p-8`}
                    >
                      <div className="mb-8 flex items-center gap-4">
                        <div className={`rounded-xl bg-gradient-to-r p-4 ${module.gradient}`}>
                          {module.icon}
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-white">{module.name}</h3>
                          <p className="text-gray-300">
                            Transform your business operations with intelligent automation
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {module.benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="rounded-xl border border-gray-600 bg-white/10 p-6 backdrop-blur-sm"
                          >
                            <div className="flex items-start gap-4">
                              <div className="rounded-lg bg-red-500/20 p-3">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="mb-2 font-semibold text-red-400">Problem:</h4>
                                <p className="mb-4 text-gray-300">{benefit.problem}</p>

                                <div className="flex items-start gap-4">
                                  <div className="rounded-lg bg-green-500/20 p-3">
                                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="mb-2 font-semibold text-green-400">
                                      CoreFlow360 Solution:
                                    </h4>
                                    <p className="mb-4 text-gray-300">{benefit.solution}</p>

                                    <div className="rounded-lg border-l-4 border-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4">
                                      <div className="mb-2 flex items-center gap-2">
                                        {benefit.icon}
                                        <h5 className="font-semibold text-green-400">
                                          Measurable Result:
                                        </h5>
                                      </div>
                                      <p className="font-medium text-green-300">{benefit.result}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-8 text-center">
                        <button
                          className={`bg-gradient-to-r ${module.gradient} transform rounded-lg px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                        >
                          Try {module.name} Free for 30 Days
                        </button>
                      </div>
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Industry Solutions */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-white">Industry Solutions</h2>
              <p className="text-xl text-gray-300">Tailored for your industry needs</p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export default SEOBusinessSolutions
