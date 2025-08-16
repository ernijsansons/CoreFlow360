/**
 * CoreFlow360 - Sustainability Metrics Dashboard
 * Real-time carbon footprint tracking and green computing optimization
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf,
  Battery,
  Server,
  Monitor,
  Zap,
  CloudRain,
  TrendingDown,
  TrendingUp,
  Target,
  Award,
  Calculator,
  BarChart3,
  PieChart,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConsciousnessTheme } from '@/contexts/ThemeContext'

interface SustainabilityMetrics {
  carbonFootprint: {
    total: number // kg CO2e
    frontend: number
    backend: number
    infrastructure: number
    ai: number
  }
  performance: {
    bundleSize: number // KB
    loadTime: number // ms
    renderTime: number // ms
    energyPerPageView: number // mWh
  }
  greenFeatures: {
    darkModeUsage: number // percentage
    reducedMotionUsage: number // percentage
    cacheHitRate: number // percentage
    cdnUsage: number // percentage
  }
  efficiency: {
    score: number // 0-100
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    improvements: string[]
  }
  targets: {
    carbonReduction: number // percentage target
    efficiencyImprovement: number // percentage target
    greenUserAdoption: number // percentage target
  }
  achievements: {
    id: string
    title: string
    description: string
    achieved: boolean
    progress: number
  }[]
}

interface CarbonCalculation {
  category: string
  value: number
  unit: string
  calculation: string
}

export default function SustainabilityDashboard() {
  const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [showCalculator, setShowCalculator] = useState(false)
  const { theme, intensity, consciousnessLevel } = useConsciousnessTheme()

  useEffect(() => {
    fetchSustainabilityMetrics()
  }, [selectedPeriod])

  const fetchSustainabilityMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sustainability/metrics?period=${selectedPeriod}`)
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to fetch sustainability metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 60) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case 'B':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'C':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'D':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'F':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-consciousness-neural"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load sustainability metrics</p>
        <Button onClick={fetchSustainabilityMetrics} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Leaf className="text-emerald-600" />
            Sustainability Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your environmental impact and optimize for green computing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <Button
            variant="outline"
            onClick={() => setShowCalculator(!showCalculator)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculator
          </Button>
        </div>
      </div>

      {/* Efficiency Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sustainability Score</CardTitle>
              <CardDescription>
                Overall environmental efficiency rating
              </CardDescription>
            </div>
            <Badge className={getGradeColor(metrics.efficiency.grade)}>
              Grade {metrics.efficiency.grade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-consciousness-neural">
                {metrics.efficiency.score}
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <Progress value={metrics.efficiency.score} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {metrics.carbonFootprint.total.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">kg CO₂e</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {(metrics.performance.bundleSize / 1024).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">MB Bundle</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.performance.loadTime}
                </p>
                <p className="text-sm text-muted-foreground">ms Load Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.greenFeatures.cacheHitRate}%
                </p>
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Carbon Footprint */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
                <CloudRain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.carbonFootprint.total.toFixed(2)} kg CO₂e</div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Frontend</span>
                    <span>{metrics.carbonFootprint.frontend.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Backend</span>
                    <span>{metrics.carbonFootprint.backend.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Infrastructure</span>
                    <span>{metrics.carbonFootprint.infrastructure.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>AI Processing</span>
                    <span>{metrics.carbonFootprint.ai.toFixed(2)} kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Bundle Size</span>
                      <span>{(metrics.performance.bundleSize / 1024).toFixed(1)} MB</span>
                    </div>
                    <Progress value={Math.min(100, (metrics.performance.bundleSize / 10240) * 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Load Time</span>
                      <span>{metrics.performance.loadTime} ms</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (metrics.performance.loadTime / 50))} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Energy/View</span>
                      <span>{metrics.performance.energyPerPageView.toFixed(3)} mWh</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (metrics.performance.energyPerPageView * 10))} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Green Features */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Green Features</CardTitle>
                <Battery className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Dark Mode Usage</span>
                      <span>{metrics.greenFeatures.darkModeUsage}%</span>
                    </div>
                    <Progress value={metrics.greenFeatures.darkModeUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reduced Motion</span>
                      <span>{metrics.greenFeatures.reducedMotionUsage}%</span>
                    </div>
                    <Progress value={metrics.greenFeatures.reducedMotionUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CDN Usage</span>
                      <span>{metrics.greenFeatures.cdnUsage}%</span>
                    </div>
                    <Progress value={metrics.greenFeatures.cdnUsage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Sustainability Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Carbon Reduction</h4>
                  <div className="text-2xl font-bold text-emerald-600">
                    {metrics.targets.carbonReduction}%
                  </div>
                  <p className="text-sm text-muted-foreground">Target by 2025</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Efficiency Improvement</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.targets.efficiencyImprovement}%
                  </div>
                  <p className="text-sm text-muted-foreground">Performance boost</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Green User Adoption</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.targets.greenUserAdoption}%
                  </div>
                  <p className="text-sm text-muted-foreground">Users using green features</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carbon Footprint Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Carbon Footprint Breakdown</CardTitle>
                <CardDescription>CO₂ emissions by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span>Frontend ({((metrics.carbonFootprint.frontend / metrics.carbonFootprint.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <span>{metrics.carbonFootprint.frontend.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Backend ({((metrics.carbonFootprint.backend / metrics.carbonFootprint.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <span>{metrics.carbonFootprint.backend.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Infrastructure ({((metrics.carbonFootprint.infrastructure / metrics.carbonFootprint.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <span>{metrics.carbonFootprint.infrastructure.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>AI Processing ({((metrics.carbonFootprint.ai / metrics.carbonFootprint.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <span>{metrics.carbonFootprint.ai.toFixed(2)} kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Impact</CardTitle>
                <CardDescription>How performance affects sustainability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Bundle Size Impact</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Every 1MB reduction saves ~0.5g CO₂ per page view
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Current: {(metrics.performance.bundleSize / 1024).toFixed(1)} MB</span>
                      <span>Potential saving: {((metrics.performance.bundleSize / 1024) * 0.5).toFixed(2)}g CO₂</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Load Time Impact</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Faster loading reduces device energy consumption
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Current: {metrics.performance.loadTime} ms</span>
                      <span>Energy: {metrics.performance.energyPerPageView.toFixed(3)} mWh</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                Actionable steps to improve your sustainability score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.efficiency.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-consciousness-neural rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">{improvement}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Green Computing Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Green Computing Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Frontend Optimization</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Use lazy loading for images and components</li>
                    <li>• Implement tree shaking to remove unused code</li>
                    <li>• Optimize images with modern formats (WebP, AVIF)</li>
                    <li>• Use efficient CSS animations</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">User Experience</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Promote dark mode for OLED devices</li>
                    <li>• Offer reduced motion options</li>
                    <li>• Implement efficient caching strategies</li>
                    <li>• Use CDN for static assets</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.achieved ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Award className={`w-5 h-5 ${achievement.achieved ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <CardTitle className="text-sm">{achievement.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                  {achievement.achieved && (
                    <Badge className="mt-2 bg-emerald-100 text-emerald-800">
                      Achieved!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Carbon Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCalculator(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Carbon Calculator</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Data Transfer (GB/month)</label>
                  <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="100" />
                </div>
                <div>
                  <label className="text-sm font-medium">Page Views (thousands/month)</label>
                  <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="50" />
                </div>
                <div>
                  <label className="text-sm font-medium">Server CPU Hours</label>
                  <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="720" />
                </div>
                <Button className="w-full">Calculate Impact</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}