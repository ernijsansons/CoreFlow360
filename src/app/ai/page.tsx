'use client'

import { useState } from 'react'
import { BusinessCoachDashboard } from '@/components/ai/business-coach/BusinessCoachDashboard'
import { SimpleAIManager } from '@/components/ai/SimpleAIManager'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AICommandCenter() {
  const [activeTab, setActiveTab] = useState('coach')
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">AI Business Intelligence Center</h1>
          <p className="text-xl text-gray-400">Your AI-powered business assistant</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coach">Business Coach</TabsTrigger>
            <TabsTrigger value="settings">AI Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="coach">
            <BusinessCoachDashboard />
          </TabsContent>
          
          <TabsContent value="settings">
            <SimpleAIManager />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}