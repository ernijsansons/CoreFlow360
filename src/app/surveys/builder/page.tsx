/**
 * Survey Builder Page
 * Free survey creation tool for customer feedback
 */

'use client'

import { SurveyBuilder } from '@/components/surveys/SurveyBuilder'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function SurveyBuilderPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <SurveyBuilder />
      </div>
      
      <Footer />
    </div>
  )
}