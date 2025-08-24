'use client'

import { useState } from 'react'

const demoTypes = [
  {
    id: 'industry',
    name: 'Industry-Specific Demo',
    duration: '15 minutes',
    description: 'See CoreFlow360 configured for your specific industry',
    icon: '🎯',
    color: 'blue'
  },
  {
    id: 'portfolio',
    name: 'Multi-Business Portfolio Demo',
    duration: '20 minutes',
    description: 'Perfect for business owners with multiple locations',
    icon: '🏰',
    color: 'purple'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Solution Demo',
    duration: '30 minutes',
    description: 'Custom solutions for large business empires',
    icon: '👑',
    color: 'pink'
  }
]

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
]

const industries = [
  'HVAC', 'Legal Services', 'Construction', 'Professional Services',
  'Restaurants', 'Retail', 'Healthcare', 'Real Estate', 'Manufacturing',
  'Transportation', 'Education', 'Other'
]

export default function V0DemoBooking() {
  const [selectedDemo, setSelectedDemo] = useState('industry')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    industry: '',
    businessCount: '1',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    specificNeeds: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle demo booking submission
    console.log('Demo booking:', { demoType: selectedDemo, ...formData })
    alert('Demo booked successfully! You will receive a confirmation email shortly.')
  }

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6">
            <div className="bg-black px-6 py-2 rounded-2xl">
              <span className="text-lg font-semibold text-white">📅 Live Demo Booking</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            See Your <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">Business Empire</span> In Action
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Book a personalized demo and see exactly how CoreFlow360 will transform your business. 
            Our experts will show you the AI employees that match your industry and goals.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Demo Type Selection */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Choose Your Demo Experience</h3>
                
                <div className="space-y-4">
                  {demoTypes.map((demo) => {
                    const colorClasses = {
                      blue: 'from-blue-600/20 to-blue-800/20 border-blue-500/30',
                      purple: 'from-purple-600/20 to-purple-800/20 border-purple-500/30',
                      pink: 'from-pink-600/20 to-pink-800/20 border-pink-500/30'
                    }

                    return (
                      <button
                        key={demo.id}
                        onClick={() => setSelectedDemo(demo.id)}
                        className={`w-full p-6 bg-gradient-to-br ${colorClasses[demo.color as keyof typeof colorClasses]} backdrop-blur-sm rounded-2xl border text-left transition-all duration-300 ${
                          selectedDemo === demo.id 
                            ? 'ring-2 ring-purple-500 transform scale-105' 
                            : 'hover:transform hover:scale-102'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{demo.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-bold text-white">{demo.name}</h4>
                              <span className="text-sm text-gray-400">{demo.duration}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{demo.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* What You'll See */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
                <h4 className="text-xl font-bold text-white mb-4">What You'll See in Your Demo</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Your industry-specific AI employees in action</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Real-time automation workflows</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Portfolio management dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Custom ROI calculation for your business</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Progressive pricing and empire discounts</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">Book Your Demo</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Industry *</label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select Industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Number of Businesses</label>
                    <select
                      value={formData.businessCount}
                      onChange={(e) => handleInputChange('businessCount', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="1">1 Business</option>
                      <option value="2-3">2-3 Businesses</option>
                      <option value="4-6">4-6 Businesses</option>
                      <option value="7-10">7-10 Businesses</option>
                      <option value="10+">10+ Businesses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Preferred Date</label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Preferred Time</label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Specific Needs or Questions</label>
                  <textarea
                    rows={4}
                    value={formData.specificNeeds}
                    onChange={(e) => handleInputChange('specificNeeds', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Tell us about your specific challenges or what you'd like to see in the demo..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Book My Demo Now
                </button>

                <div className="text-center text-sm text-gray-400">
                  ✅ No commitment required • ✅ Free 30-minute session • ✅ Expert guidance included
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}