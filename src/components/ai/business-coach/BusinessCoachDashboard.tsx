'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, AlertCircle, Lightbulb, Target } from 'lucide-react'

export function BusinessCoachDashboard() {
  const [question, setQuestion] = useState('')
  const [insights, setInsights] = useState([
    {
      type: 'opportunity',
      icon: TrendingUp,
      title: 'Revenue Opportunity Identified',
      description: 'Your HVAC service calls have 15% higher profit margins on Thursdays. Consider promoting maintenance packages mid-week.',
      impact: 'High',
      action: 'Review Thursday scheduling patterns'
    },
    {
      type: 'alert',
      icon: AlertCircle, 
      title: 'Customer Churn Risk',
      description: '3 customers have reduced service frequency by 40%. Proactive outreach recommended.',
      impact: 'Medium',
      action: 'Schedule check-in calls'
    },
    {
      type: 'suggestion',
      icon: Lightbulb,
      title: 'Efficiency Improvement',
      description: 'Route optimization could save 2.5 hours weekly. Enable auto-routing for technician dispatches.',
      impact: 'Medium',
      action: 'Enable auto-routing feature'
    }
  ])
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Business Coach</h1>
        <p className="text-gray-600">Get personalized insights and recommendations for your business</p>
      </div>
      
      {/* Quick Questions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ask Your Business Coach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="How can I improve my profit margins?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1"
            />
            <Button>Get Insight</Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Button variant="outline" size="sm">Improve cash flow</Button>
            <Button variant="outline" size="sm">Reduce costs</Button>
            <Button variant="outline" size="sm">Grow revenue</Button>
            <Button variant="outline" size="sm">Optimize routes</Button>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Insights */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Today's Insights</h2>
        
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <insight.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{insight.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      insight.impact === 'High' ? 'bg-red-100 text-red-800' : 
                      insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{insight.description}</p>
                  <Button variant="outline" size="sm">
                    {insight.action}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}