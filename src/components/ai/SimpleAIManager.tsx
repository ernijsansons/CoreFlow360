'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

export function SimpleAIManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Business Assistant Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Daily Business Insights</h3>
            <p className="text-sm text-gray-600">Receive daily recommendations for your business</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Smart Route Optimization</h3>
            <p className="text-sm text-gray-600">Automatically optimize technician routes</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Customer Risk Alerts</h3>
            <p className="text-sm text-gray-600">Get notified about at-risk customers</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI Usage This Month</span>
            <Badge variant="secondary">2,847 insights generated</Badge>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Saving you approximately 12 hours of analysis time
          </div>
        </div>
      </CardContent>
    </Card>
  )
}