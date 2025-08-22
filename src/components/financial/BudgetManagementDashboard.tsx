'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'

export function BudgetManagementDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Budget Management</h1>
          <p className="text-gray-600">Track and manage budgets across your portfolio</p>
        </div>
        <Button>Create Budget</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$2.5M</p>
            <p className="text-sm text-gray-600">Annual portfolio budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">68%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">-8.2%</p>
            <p className="text-sm text-gray-600">Under budget YTD</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Business Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Phoenix HVAC', budget: 1200000, spent: 780000, variance: -35 },
              { name: 'Valley Maintenance', budget: 800000, spent: 620000, variance: -22.5 },
              { name: 'Desert Air', budget: 500000, spent: 380000, variance: -24 }
            ].map((business) => (
              <div key={business.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{business.name}</p>
                  <p className="text-sm text-gray-600">
                    Budget: ${(business.budget / 1000).toFixed(0)}k | Spent: ${(business.spent / 1000).toFixed(0)}k
                  </p>
                </div>
                <Badge className={business.variance < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {business.variance > 0 ? '+' : ''}{business.variance}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}