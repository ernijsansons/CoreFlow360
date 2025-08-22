'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Activity, Target, Zap } from 'lucide-react'

export function FinancialForecastDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Forecasting</h1>
          <p className="text-gray-600">AI-powered financial predictions and scenario planning</p>
        </div>
        <Button>Run Scenario</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              12-Month Revenue Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$28.5M</p>
            <p className="text-sm text-green-600">+32% growth projected</p>
            <Badge className="mt-2">87% confidence</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Profitability Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$9.4M</p>
            <p className="text-sm text-gray-600">33% net margin</p>
            <Badge className="mt-2">82% confidence</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Cash Position Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$2.8M</p>
            <p className="text-sm text-gray-600">End of year projection</p>
            <Badge className="mt-2">79% confidence</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Best Case Scenario</h4>
                <Badge className="bg-green-100 text-green-800">+45% growth</Badge>
              </div>
              <p className="text-sm text-gray-600">All deals close, market expansion succeeds</p>
              <p className="text-lg font-bold mt-2">$32.8M revenue | $11.2M profit</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Base Case Scenario</h4>
                <Badge className="bg-blue-100 text-blue-800">+32% growth</Badge>
              </div>
              <p className="text-sm text-gray-600">Expected performance based on current trends</p>
              <p className="text-lg font-bold mt-2">$28.5M revenue | $9.4M profit</p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Worst Case Scenario</h4>
                <Badge className="bg-yellow-100 text-yellow-800">+18% growth</Badge>
              </div>
              <p className="text-sm text-gray-600">Economic downturn, customer churn increases</p>
              <p className="text-lg font-bold mt-2">$24.2M revenue | $6.8M profit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}