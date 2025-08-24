'use client'

import { useState } from 'react'

const contactReasons = [
  {
    id: 'sales',
    title: 'Sales & Partnerships',
    description: 'Learn about CoreFlow360 for your business empire',
    icon: '💼',
    email: 'sales@coreflow360.com',
    responseTime: '< 2 hours'
  },
  {
    id: 'support',
    title: 'Customer Support',
    description: 'Get help with your existing CoreFlow360 account',
    icon: '🛟',
    email: 'support@coreflow360.com',
    responseTime: '< 30 minutes'
  },
  {
    id: 'enterprise',
    title: 'Enterprise Solutions',
    description: 'Custom solutions for large business empires',
    icon: '🏰',
    email: 'enterprise@coreflow360.com',
    responseTime: '< 4 hours'
  },
  {
    id: 'partners',
    title: 'Channel Partners',
    description: 'Become a CoreFlow360 implementation partner',
    icon: '🤝',
    email: 'partners@coreflow360.com',
    responseTime: '< 24 hours'
  }
]

const offices = [
  {
    city: 'San Francisco',
    address: '123 Empire Tower\nSan Francisco, CA 94105',
    phone: '+1 (555) 123-4567',
    timezone: 'PST'
  },
  {
    city: 'New York',
    address: '456 Business Plaza\nNew York, NY 10001', 
    phone: '+1 (555) 234-5678',
    timezone: 'EST'
  },
  {
    city: 'Chicago',
    address: '789 Growth Center\nChicago, IL 60601',
    phone: '+1 (555) 345-6789',
    timezone: 'CST'
  }
]

export default function V0Contact() {
  const [selectedReason, setSelectedReason] = useState('sales')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    businessCount: '1',
    phone: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form:', { reason: selectedReason, ...formData })
    alert('Message sent successfully! We will get back to you soon.')
  }

  const selectedContact = contactReasons.find(r => r.id === selectedReason)

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6">
            <div className="bg-black px-6 py-2 rounded-2xl">
              <span className="text-lg font-semibold text-white">📞 Get in Touch</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Build Your <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">Business Empire?</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Our empire building experts are here to help. Whether you're starting with one business 
            or managing dozens, we'll show you how CoreFlow360 can transform your operations.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Reasons */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold text-white mb-6">How can we help?</h3>
              
              <div className="space-y-4">
                {contactReasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full p-6 rounded-2xl border text-left transition-all duration-300 ${
                      selectedReason === reason.id
                        ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/50 transform scale-105'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{reason.icon}</div>
                      <div>
                        <h4 className="text-white font-bold mb-2">{reason.title}</h4>
                        <p className="text-gray-400 text-sm mb-3">{reason.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 text-sm">{reason.email}</span>
                          <span className="text-green-400 text-xs">{reason.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Office Locations */}
              <div className="mt-12">
                <h4 className="text-xl font-bold text-white mb-6">Our Offices</h4>
                <div className="space-y-6">
                  {offices.map((office, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                      <h5 className="text-white font-semibold mb-2">{office.city} ({office.timezone})</h5>
                      <div className="text-gray-400 text-sm mb-2 whitespace-pre-line">{office.address}</div>
                      <div className="text-blue-400 text-sm">{office.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-3xl">{selectedContact?.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedContact?.title}</h3>
                    <p className="text-gray-400">{selectedContact?.description}</p>
                  </div>
                </div>
                
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

                  <div className="grid md:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="How can we help you build your empire?"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Message *</label>
                    <textarea
                      rows={6}
                      required
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Tell us about your business goals, current challenges, and how we can help you build your empire..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Send Message to {selectedContact?.title}
                  </button>

                  <div className="text-center text-sm text-gray-400">
                    ✅ Expected response: {selectedContact?.responseTime} • ✅ Direct to expert team • ✅ No spam, ever
                  </div>
                </form>
              </div>

              {/* Quick Contact Options */}
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                  <div className="text-2xl mb-2">📧</div>
                  <h4 className="text-white font-semibold mb-1">Email Us</h4>
                  <p className="text-blue-400 text-sm">hello@coreflow360.com</p>
                </div>
                <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="text-white font-semibold mb-1">Call Us</h4>
                  <p className="text-green-400 text-sm">+1 (800) EMPIRE-1</p>
                </div>
                <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                  <div className="text-2xl mb-2">💬</div>
                  <h4 className="text-white font-semibold mb-1">Live Chat</h4>
                  <p className="text-purple-400 text-sm">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <h4 className="text-white font-bold mb-3">How quickly can I get started?</h4>
              <p className="text-gray-400 text-sm">Most businesses are up and running within 24-48 hours. Enterprise setups may take 1-2 weeks.</p>
            </div>
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <h4 className="text-white font-bold mb-3">Do you support my industry?</h4>
              <p className="text-gray-400 text-sm">We have specialized AI employees for 50+ industries, with custom solutions for unique businesses.</p>
            </div>
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <h4 className="text-white font-bold mb-3">What's the empire discount?</h4>
              <p className="text-gray-400 text-sm">Save 10-25% based on business count: 2-3 (10%), 4-6 (15%), 7+ (25%). The more you build, the more you save.</p>
            </div>
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <h4 className="text-white font-bold mb-3">Is there a free trial?</h4>
              <p className="text-gray-400 text-sm">Yes! 30-day free trial with full access to AI employees and all features. No credit card required.</p>
            </div>
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <h4 className="text-white font-bold mb-3">Can I migrate existing data?</h4>
              <p className="text-gray-400 text-sm">Our migration team handles everything. We support 200+ integrations and custom data imports.</p>
            </div>
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <h4 className="text-white font-bold mb-3">What about training and support?</h4>
              <p className="text-gray-400 text-sm">24/7 support, dedicated success manager, comprehensive training, and ongoing optimization included.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}