'use client'

import { useState } from 'react'
import Link from 'next/link'

const companyStats = [
  { number: "2021", label: "Founded", description: "Started with a vision" },
  { number: "2,847+", label: "Business Empires", description: "Across 50+ industries" },
  { number: "$2.3B+", label: "Customer Savings", description: "Generated through AI" },
  { number: "98%", label: "Satisfaction", description: "Customer success rate" }
]

const timeline = [
  {
    year: "2021",
    title: "The Vision",
    description: "Founded with the mission to democratize AI for business empires",
    details: "Started by a team of AI researchers and business automation experts who saw the potential for intelligent business orchestration."
  },
  {
    year: "2022", 
    title: "First AI Employees",
    description: "Launched industry-specific AI employees for HVAC and construction",
    details: "Developed Mason AI, Dakota AI, and Blake AI - our first specialized AI employees that could handle complex business processes."
  },
  {
    year: "2023",
    title: "Empire Scaling",
    description: "Introduced portfolio management and progressive pricing",
    details: "Created the empire building platform that allows businesses to scale across multiple locations with increasing discounts and shared AI intelligence."
  },
  {
    year: "2024",
    title: "Global Expansion", 
    description: "Reached 2,000+ businesses and launched enterprise solutions",
    details: "Expanded to serve multi-billion dollar enterprises while maintaining our focus on helping smaller businesses build their empires."
  },
  {
    year: "2025",
    title: "The Future",
    description: "Next-generation AI that learns and evolves with your business",
    details: "Developing advanced AI that doesn't just automate - it innovates, predicts, and grows your empire beyond what's possible today."
  }
]

const team = [
  {
    name: "Alex Chen",
    role: "CEO & Co-Founder",
    background: "Former Google AI, 15+ years building intelligent systems",
    image: "👨‍💼",
    quote: "We're not just building software - we're creating the foundation for autonomous business empires."
  },
  {
    name: "Dr. Sarah Mitchell",
    role: "CTO & Co-Founder", 
    background: "PhD AI/ML from Stanford, former Tesla Autopilot team",
    image: "👩‍💻",
    quote: "Our AI employees aren't tools - they're digital teammates that grow smarter with every business they serve."
  },
  {
    name: "Marcus Johnson",
    role: "Chief Product Officer",
    background: "Former Salesforce, built products for 100M+ users",
    image: "👨‍🎨",
    quote: "Every feature we build asks: 'How does this help someone build their business empire?' That's our north star."
  },
  {
    name: "Lisa Rodriguez",
    role: "Head of Customer Success",
    background: "15+ years helping businesses scale operations",
    image: "👩‍💼",
    quote: "Our customers don't just grow their revenue - they transform into empire builders. That transformation is everything."
  }
]

const values = [
  {
    icon: "🚀",
    title: "Empire Builder First",
    description: "Every decision starts with: 'How does this help someone build their empire?'"
  },
  {
    icon: "🤖", 
    title: "Intelligence That Grows",
    description: "Our AI doesn't just automate - it learns, adapts, and becomes smarter with every interaction."
  },
  {
    icon: "🏰",
    title: "Scale Without Limits", 
    description: "Whether you have 1 business or 100, our platform scales with your ambitions."
  },
  {
    icon: "✨",
    title: "Radical Transparency",
    description: "Open about our AI capabilities, pricing, and roadmap. No hidden fees, no surprises."
  }
]

const awards = [
  {
    title: "AI Innovation Award 2024",
    organization: "TechCrunch Disrupt",
    description: "Revolutionary AI employee technology"
  },
  {
    title: "Best B2B Platform 2024", 
    organization: "SaaS Awards",
    description: "Outstanding business automation platform"
  },
  {
    title: "Top 50 AI Companies 2024",
    organization: "Forbes",
    description: "Leading AI transformation in business"
  },
  {
    title: "Customer Choice Award 2024",
    organization: "G2 Crowd", 
    description: "Highest customer satisfaction rating"
  }
]

export default function V0About() {
  const [selectedYear, setSelectedYear] = useState(0)

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6">
            <div className="bg-black px-6 py-2 rounded-2xl">
              <span className="text-lg font-semibold text-white">🏢 About CoreFlow360</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The Future of <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">Business Intelligence</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            We're building the world's first Autonomous Business Operating System - transforming how 
            entrepreneurs and enterprises build, scale, and manage their business empires.
          </p>
        </div>

        {/* Company Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {companyStats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-purple-400 font-semibold mb-2">{stat.label}</div>
              <div className="text-gray-400 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-12 rounded-3xl border border-purple-500/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              "We believe every entrepreneur deserves access to the same AI-powered automation that fortune 500 companies use. 
              Our mission is to democratize business intelligence and help anyone build, scale, and optimize their business empire - 
              regardless of size, industry, or technical expertise."
            </p>
          </div>
        </div>

        {/* Company Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Journey</h2>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
            {timeline.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedYear(index)}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  selectedYear === index
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white transform scale-105'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {item.year}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  selectedYear === index ? 'opacity-100 block' : 'opacity-0 hidden'
                }`}
              >
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20 text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">{item.year}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-lg text-gray-300 mb-6">{item.description}</p>
                  <p className="text-gray-400">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Meet Our Team</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700"
              >
                <div className="flex items-start gap-6">
                  <div className="text-4xl">{member.image}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <div className="text-purple-400 font-semibold mb-3">{member.role}</div>
                    <p className="text-gray-400 text-sm mb-4">{member.background}</p>
                    <blockquote className="text-gray-300 italic">
                      "{member.quote}"
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{value.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Awards & Recognition</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((award, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm rounded-2xl border border-yellow-500/20"
              >
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-white font-bold mb-2">{award.title}</h3>
                <div className="text-yellow-400 text-sm font-semibold mb-2">{award.organization}</div>
                <p className="text-gray-400 text-xs">{award.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Philosophy */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-sm p-12 rounded-3xl border border-blue-500/20">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Our Technology Philosophy</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-white mb-3">AI That Learns</h3>
                <p className="text-gray-400 text-sm">Our AI doesn't just execute - it learns from every interaction and becomes smarter with each business it serves.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🔗</div>
                <h3 className="text-xl font-bold text-white mb-3">Seamless Integration</h3>
                <p className="text-gray-400 text-sm">Built API-first to integrate with any system. Your existing tools become more powerful, not replaced.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-3">Security First</h3>
                <p className="text-gray-400 text-sm">Enterprise-grade security with SOC 2, HIPAA, and GDPR compliance. Your data is protected at every level.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Join Our Mission */}
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-blue-900/20 rounded-3xl border border-purple-500/20 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Mission</h2>
            <p className="text-gray-300 mb-8">
              Whether you're building your first business or scaling your 100th location, 
              we're here to help you create the empire you've always envisioned.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300"
              >
                Start Building Your Empire
              </Link>
              <Link 
                href="/contact"
                className="px-8 py-4 border-2 border-purple-500 hover:border-purple-400 text-white text-lg font-bold rounded-xl transition-all duration-300"
              >
                Join Our Team
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              ✅ 30-day free trial • ✅ No credit card required • ✅ Expert support included
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}