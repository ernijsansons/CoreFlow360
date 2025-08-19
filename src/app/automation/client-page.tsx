/**
 * CoreFlow360 - Automation Page Client Component
 * Client-side wrapper for automation page
 */

'use client'

import React, { useState } from 'react'
import { AutomationBuilder } from '@/components/automation/AutomationBuilder'

export default function AutomationClientPage() {
  // Mock user profile - in real app would come from auth context
  const [userProfile] = useState({
    industry: 'Technology',
    companySize: 'Small Business (1-50 employees)',
    role: 'Business Owner',
    existingSystems: ['Gmail', 'Google Sheets', 'Slack', 'Stripe'],
  })

  return (
    <div className="min-h-screen bg-black">
      <AutomationBuilder userProfile={userProfile} />
    </div>
  )
}
