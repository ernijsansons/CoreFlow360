'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Target,
  Lightbulb,
  Rocket,
  Users,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Heart,
  ArrowRight,
  Sparkles,
  Eye,
  Building,
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground'
import { MetricCard } from '@/components/ui/MetricCard'

interface TimelineEvent {
  year: string
  quarter?: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  achievements?: string[]
}

interface TeamMember {
  name: string
  role: string
  bio: string
  expertise: string[]
  avatar: string
}

interface CoreValue {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

const timeline: TimelineEvent[] = [
  {
    year: '2019',
    quarter: 'Q1',
    title: 'The Vision Begins',
    description:
      'Founded on the belief that artificial intelligence should amplify human potential, not replace it.',
    icon: Lightbulb,
    gradient: 'from-yellow-500 to-orange-500',
    achievements: [
      'Initial AI research team assembled',
      'First prototype development',
      'Core algorithm design',
    ],
  },
  {
    year: '2020',
    quarter: 'Q3',
    title: 'AI Breakthrough',
    description:
      'Developed our proprietary multi-industry AI engine capable of learning business patterns across sectors.',
    icon: Brain,
    gradient: 'from-violet-500 to-purple-500',
    achievements: [
      'Patent-pending AI architecture',
      'First successful pilot deployments',
      '94% accuracy milestone achieved',
    ],
  },
  {
    year: '2021',
    quarter: 'Q2',
    title: 'Platform Launch',
    description:
      'CoreFlow360 officially launched, bringing AI-powered ERP to the first 100 forward-thinking businesses.',
    icon: Rocket,
    gradient: 'from-blue-500 to-cyan-500',
    achievements: [
      '100+ initial customers',
      '$1M+ collective savings generated',
      'First industry recognition',
    ],
  },
  {
    year: '2022',
    quarter: 'Q4',
    title: 'Market Expansion',
    description:
      'Expanded into healthcare, legal, and construction industries with specialized AI modules.',
    icon: Building,
    gradient: 'from-emerald-500 to-green-500',
    achievements: [
      '1,000+ active businesses',
      'Multi-industry AI adaptation',
      'Strategic partnerships formed',
    ],
  },
  {
    year: '2023',
    quarter: 'Q2',
    title: 'Global Intelligence',
    description: 'Launched global operations with AI processing centers on three continents.',
    icon: Globe,
    gradient: 'from-cyan-500 to-blue-500',
    achievements: [
      '10,000+ global users',
      'Sub-100ms response times globally',
      'Enterprise-grade compliance',
    ],
  },
  {
    year: '2024',
    quarter: 'Q1',
    title: 'Quantum Integration',
    description:
      'Pioneering quantum-enhanced AI processing for unprecedented business intelligence.',
    icon: Zap,
    gradient: 'from-orange-500 to-red-500',
    achievements: [
      'Quantum AI research lab opened',
      'Next-generation algorithms in development',
      'Industry leadership recognition',
    ],
  },
  {
    year: '2025',
    quarter: 'Future',
    title: 'Autonomous Business Era',
    description:
      'Launching fully autonomous business intelligence that thinks, learns, and evolves independently.',
    icon: Target,
    gradient: 'from-pink-500 to-violet-500',
    achievements: [
      'Self-evolving AI systems',
      'Autonomous decision frameworks',
      'Global AI BUSINESS INTELLIGENCE network',
    ],
  },
]

const coreValues: CoreValue[] = [
  {
    title: 'Intelligence Amplification',
    description:
      'We believe AI should amplify human intelligence, not replace it. Our technology enhances human decision-making and creativity.',
    icon: Brain,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Ethical AI Development',
    description:
      'Every AI model we create is built with transparency, fairness, and human oversight as foundational principles.',
    icon: Shield,
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    title: 'Continuous Evolution',
    description:
      'Like the businesses we serve, our AI never stops learning, adapting, and improving to meet tomorrow&apos;s challenges.',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Human-Centered Design',
    description:
      'Technology should serve humanity, not the other way around. Every feature is designed with human needs at the center.',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-500',
  },
]

const leadership: TeamMember[] = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Chief Executive Officer & Co-Founder',
    bio: "Former head of AI Research at Google, leading CoreFlow360's vision of human-amplified artificial intelligence.",
    expertise: ['Machine Learning', 'Business Strategy', 'AI Ethics'],
    avatar: '👩‍💼',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Chief Technology Officer & Co-Founder',
    bio: 'Ex-Tesla AI architect, building the SMART AUTOMATIONs that power next-generation business intelligence.',
    expertise: ['SMART AUTOMATIONs', 'Distributed Systems', 'Quantum Computing'],
    avatar: '👨‍💻',
  },
  {
    name: 'Dr. Amara Okafor',
    role: 'Chief AI Officer',
    bio: 'MIT AI researcher specializing in multi-industry learning algorithms and predictive business models.',
    expertise: ['Predictive Analytics', 'Multi-Domain AI', 'Algorithm Design'],
    avatar: '👩‍🔬',
  },
  {
    name: 'James Kim',
    role: 'Chief Product Officer',
    bio: 'Former VP of Product at Salesforce, obsessed with creating AI experiences that feel magical to users.',
    expertise: ['Product Strategy', 'User Experience', 'AI/UX Integration'],
    avatar: '👨‍🎨',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Vision Statement */}
      <section className="relative flex min-h-screen items-center">
        <NeuralNetworkBackground />

        <div className="container-fluid relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-5xl text-center"
          >
            <motion.h1
              className="heading-hero gradient-text-ai mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              The Future of Business
              <br />
              Thinks with AI
            </motion.h1>

            <motion.p
              className="text-body-large mx-auto mb-12 max-w-3xl text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We&apos;re not just building software. We&apos;re architecting the SMART AUTOMATIONs of
              tomorrow&apos;s businesses, where artificial intelligence amplifies human potential
              and creates unprecedented possibilities.
            </motion.p>

            {/* Mission Statement Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-16 grid gap-8 md:grid-cols-3"
            >
              <div className="glass-card p-6 text-center">
                <Eye className="mx-auto mb-4 h-12 w-12 text-violet-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Our Vision</h3>
                <p className="text-sm text-gray-400">
                  A world where every business operates with the intelligence of tomorrow, today.
                </p>
              </div>
              <div className="glass-card p-6 text-center">
                <Target className="mx-auto mb-4 h-12 w-12 text-cyan-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Our Mission</h3>
                <p className="text-sm text-gray-400">
                  Democratize artificial intelligence for businesses of every size and industry.
                </p>
              </div>
              <div className="glass-card p-6 text-center">
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Our Purpose</h3>
                <p className="text-sm text-gray-400">
                  Amplify human creativity and decision-making through intelligent automation.
                </p>
              </div>
            </motion.div>

            <GlowingButton href="#journey" size="xl">
              Explore Our Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </GlowingButton>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gray-950 py-24">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              Our <span className="gradient-text-ai">Core Values</span>
            </h2>
            <p className="text-body-large mx-auto max-w-3xl text-gray-400">
              The principles that guide every algorithm we write, every feature we build, and every
              partnership we form.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card group cursor-pointer p-8"
              >
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${value.gradient} mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                >
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-white">{value.title}</h3>
                <p className="leading-relaxed text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - The Journey */}
      <section id="journey" className="bg-black py-24">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              The Evolution <span className="gradient-text-ai">Timeline</span>
            </h2>
            <p className="text-body-large mx-auto max-w-3xl text-gray-400">
              From visionary concept to AI-powered reality. The milestones that shaped the future of
              intelligent business operations.
            </p>
          </motion.div>

          <div className="mx-auto max-w-6xl">
            {/* Timeline Line */}
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-8 hidden w-0.5 bg-gradient-to-b from-violet-500 via-cyan-500 to-emerald-500 lg:block" />

              <div className="space-y-12">
                {timeline.map((event, index) => (
                  <motion.div
                    key={`${event.year}-${event.quarter}`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`relative flex items-start gap-8 ${
                      index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Timeline Node */}
                    <div
                      className={`h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-r ${event.gradient} relative flex items-center justify-center lg:absolute lg:left-0 lg:-translate-x-1/2 lg:transform`}
                    >
                      <event.icon className="h-8 w-8 text-white" />
                      <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r opacity-50 blur-lg" />
                    </div>

                    {/* Content Card */}
                    <div
                      className={`flex-1 lg:max-w-lg ${index % 2 === 0 ? 'lg:ml-16' : 'lg:mr-16'}`}
                    >
                      <div className="glass-card group p-6 transition-all duration-300 hover:scale-105">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="gradient-text-ai text-2xl font-bold">{event.year}</div>
                          {event.quarter && (
                            <div className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300">
                              {event.quarter}
                            </div>
                          )}
                        </div>

                        <h3 className="mb-3 text-xl font-semibold text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent">
                          {event.title}
                        </h3>

                        <p className="mb-4 leading-relaxed text-gray-400">{event.description}</p>

                        {event.achievements && (
                          <div className="space-y-2">
                            {event.achievements.map((achievement, achIndex) => (
                              <div key={achIndex} className="flex items-center gap-2 text-sm">
                                <div
                                  className={`h-2 w-2 rounded-full bg-gradient-to-r ${event.gradient}`}
                                />
                                <span className="text-gray-300">{achievement}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="bg-gray-950 py-24">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              Visionary <span className="gradient-text-ai">Leadership</span>
            </h2>
            <p className="text-body-large mx-auto max-w-3xl text-gray-400">
              The minds architecting the future of artificial intelligence in business. Pioneers,
              researchers, and visionaries united by a single mission.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {leadership.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card group p-6 text-center"
              >
                <div className="mb-4 text-6xl transition-transform duration-300 group-hover:scale-110">
                  {member.avatar}
                </div>
                <h3 className="mb-1 text-xl font-semibold text-white">{member.name}</h3>
                <div className="mb-4 text-sm font-medium text-violet-400">{member.role}</div>
                <p className="mb-4 text-sm leading-relaxed text-gray-400">{member.bio}</p>

                <div className="flex flex-wrap justify-center gap-2">
                  {member.expertise.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="bg-black py-24">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              Impact <span className="gradient-text-ai">Metrics</span>
            </h2>
            <p className="text-body-large text-gray-400">
              Numbers that tell the story of our global transformation
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              value="50K+"
              label="Businesses Transformed"
              icon={Building}
              gradient="violet"
              delay={0.1}
            />
            <MetricCard
              value="$2.4B"
              label="Collective Savings Generated"
              icon={TrendingUp}
              trend={67}
              gradient="emerald"
              delay={0.2}
            />
            <MetricCard
              value="94%"
              label="Average AI Accuracy"
              icon={Target}
              gradient="cyan"
              delay={0.3}
            />
            <MetricCard
              value="0.1s"
              label="Average Response Time"
              icon={Zap}
              gradient="orange"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="bg-gradient-to-b from-gray-950 to-black py-24">
        <div className="container-fluid text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="heading-section mb-6 text-white">
              Industry <span className="gradient-text-ai">Recognition</span>
            </h2>
            <p className="text-body-large mx-auto max-w-2xl text-gray-400">
              Honored to be recognized as leaders in AI-powered business transformation
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {[
              { award: 'AI Innovation of the Year', org: 'TechCrunch 2024', icon: '🏆' },
              { award: 'Best Enterprise AI', org: 'Gartner Magic Quadrant', icon: '⭐' },
              { award: 'Fastest Growing AI Company', org: 'Forbes Cloud 100', icon: '🚀' },
              { award: 'Excellence in AI Ethics', org: 'MIT Technology Review', icon: '🎖️' },
              { award: 'Top AI Workplace', org: 'Glassdoor Choice Awards', icon: '💎' },
            ].map((recognition, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass-card group p-6 text-center"
              >
                <div className="mb-3 text-4xl transition-transform duration-300 group-hover:scale-110">
                  {recognition.icon}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{recognition.award}</h3>
                <p className="text-xs text-gray-400">{recognition.org}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-violet-950/30 to-cyan-950/30 py-24">
        <div className="container-fluid text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section mb-6 text-white">
              Join the <span className="gradient-text-ai">AI Revolution</span>
            </h2>
            <p className="text-body-large mx-auto mb-12 max-w-2xl text-gray-300">
              Be part of the story. Help us build the future where artificial intelligence amplifies
              human potential and transforms how business gets done.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <GlowingButton href="/demo" size="xl">
                Experience Our Vision
                <Eye className="ml-2 h-5 w-5" />
              </GlowingButton>

              <GlowingButton href="/contact" size="xl" variant="outline">
                Partner With Us
                <Users className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
