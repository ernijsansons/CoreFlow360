/**
 * CoreFlow360 - Module Marketplace
 * Browse and activate business modules
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Filter,
  Package,
  Check,
  Lock,
  Star,
  Download,
  ExternalLink,
  ArrowRight,
  Zap,
  DollarSign,
  Users,
  BarChart3,
  Cog,
  Bot,
} from 'lucide-react'

interface Module {
  id: string
  name: string
  description: string
  longDescription: string
  category: string
  accessible: boolean
  popularity: number
  rating: number
  reviews: number
  features: string[]
  pricing: {
    tier: string
    included: boolean
    requiresUpgrade: boolean
  }
  integration: {
    connectionType: string
    deploymentType: string
    setupDifficulty: 'easy' | 'medium' | 'hard'
  }
  vendor: {
    name: string
    verified: boolean
  }
}

const CATEGORIES = [
  { id: 'all', name: 'All Modules', icon: Package },
  { id: 'accounting', name: 'Accounting & Finance', icon: DollarSign },
  { id: 'crm', name: 'CRM & Sales', icon: Users },
  { id: 'operations', name: 'Operations', icon: Cog },
  { id: 'ai', name: 'AI & Analytics', icon: Bot },
  { id: 'erp', name: 'Enterprise ERP', icon: BarChart3 },
]

export default function MarketplacePage() {
  const { data: session } = useSession()
  const [modules, setModules] = useState<Module[]>([])
  const [filteredModules, setFilteredModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'name'>('popularity')

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    filterModules()
  }, [modules, searchQuery, selectedCategory, sortBy])

  const fetchModules = async () => {
    try {
      // Fetch module data
      const [modulesResponse, accessResponse] = await Promise.all([
        fetch('/api/marketplace/modules'),
        fetch('/api/modules', { method: 'POST' }),
      ])

      const modulesData = await modulesResponse.json()
      const accessData = await accessResponse.json()

      if (modulesData.success && accessData.success) {
        const accessibleModules = accessData.data.accessibleModules.map((m: unknown) => m.id)

        // Combine data
        const combinedModules = modulesData.data.map((module: unknown) => ({
          ...module,
          accessible: accessibleModules.includes(module.id),
        }))

        setModules(combinedModules)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const filterModules = () => {
    let filtered = [...modules]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (module) =>
          module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.features.some((feature) =>
            feature.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((module) => module.category === selectedCategory)
    }

    // Sort modules
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'rating':
          return b.rating - a.rating
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredModules(filtered)
  }

  const handleInstallModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/install`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        // Refresh modules list
        fetchModules()
      } else {
      }
    } catch (error) {}
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find((cat) => cat.id === categoryId)
    const Icon = category?.icon || Package
    return <Icon className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Module Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and activate business modules to expand your capabilities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search modules, features, or capabilities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as unknown)}
          className="rounded-md border px-3 py-2"
        >
          <option value="popularity">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${
                    selectedCategory === category.id ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredModules.map((module) => (
              <Card key={module.id} className="relative overflow-hidden">
                {/* Access Status Badge */}
                <div className="absolute top-4 right-4">
                  {module.accessible ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="mr-1 h-3 w-3" />
                      Accessible
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Lock className="mr-1 h-3 w-3" />
                      Requires Upgrade
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      {getCategoryIcon(module.category)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {module.category}
                        </Badge>
                        {module.vendor.verified && (
                          <Badge variant="outline" className="bg-blue-50 text-xs text-blue-700">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-3">{module.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating and Stats */}
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{module.rating}</span>
                      <span>({module.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{module.popularity.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Key Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {module.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {module.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{module.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Integration Info */}
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Setup: {module.integration.setupDifficulty}</span>
                    <span>{module.integration.deploymentType}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {module.accessible ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleInstallModule(module.id)}
                      >
                        <Cog className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => (window.location.href = '/dashboard/subscription')}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade to Access
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="py-12 text-center">
              <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">No modules found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse different categories
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Featured Section */}
      <div className="mt-12">
        <Card className="from-primary/10 to-primary/5 bg-gradient-to-r">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-2 text-xl font-semibold">Need a Custom Integration?</h3>
                <p className="text-muted-foreground">
                  Our team can help you connect any business system to CoreFlow360
                </p>
              </div>
              <Button>
                Contact Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
