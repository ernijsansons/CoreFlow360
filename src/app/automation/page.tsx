/**
 * CoreFlow360 - Automation Page
 * Main entry point for the super easy automation builder
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AutomationBuilder } from '@/components/automation/AutomationBuilder'

export default function AutomationPage() {
  // Mock user profile - in real app would come from auth context
  const [userProfile] = useState({
    industry: 'Technology',
    companySize: 'Small Business (1-50 employees)',
    role: 'Business Owner',
    existingSystems: [
      'Gmail',
      'Google Sheets',
      'Slack',
      'Stripe'
    ]
  })

  return (
    <div className="min-h-screen bg-black">
      <AutomationBuilder userProfile={userProfile} />
    </div>
  )
}