'use client'

/**
 * Partner Resource Library
 * 
 * Comprehensive library of consciousness transformation resources,
 * tools, and materials for certified consultants.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// TODO: Re-enable Three.js when peer dependencies are resolved
// import { Canvas, useFrame } from '@react-three/fiber'
// import { Text3D, Float } from '@react-three/drei'
// import * as THREE from 'three'

interface Resource {
  id: string
  title: string
  type: 'guide' | 'template' | 'tool' | 'presentation' | 'case-study' | 'framework'
  category: string
  description: string
  consciousnessLevel: number
  certificationRequired: 'foundation' | 'advanced' | 'master' | 'transcendent'
  fileSize?: string
  duration?: string
  lastUpdated: Date
  downloads: number
  rating: number
  tags: string[]
  featured?: boolean
  preview?: string
}

interface ResourceCategory {
  id: string
  name: string
  icon: string
  description: string
  resourceCount: number
  color: string
}

interface PartnerResourceLibraryProps {
  partnerId?: string
  certificationLevel?: 'foundation' | 'advanced' | 'master' | 'transcendent'
  onResourceOpen?: (resource: Resource) => void
  className?: string
}

// Resource Categories
const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: 'assessment-tools',
    name: 'Assessment Tools',
    icon: '🔍',
    description: 'Intelligence gap analysis and consciousness measurement',
    resourceCount: 24,
    color: '#06B6D4'
  },
  {
    id: 'transformation-guides',
    name: 'Transformation Guides',
    icon: '📖',
    description: 'Step-by-step consciousness transformation playbooks',
    resourceCount: 18,
    color: '#8B5CF6'
  },
  {
    id: 'client-materials',
    name: 'Client Materials',
    icon: '👥',
    description: 'Presentation decks and consciousness education content',
    resourceCount: 42,
    color: '#10B981'
  },
  {
    id: 'implementation-templates',
    name: 'Implementation Templates',
    icon: '🛠️',
    description: 'Project plans and transformation roadmaps',
    resourceCount: 31,
    color: '#F59E0B'
  },
  {
    id: 'case-studies',
    name: 'Case Studies',
    icon: '📊',
    description: 'Success stories and transformation examples',
    resourceCount: 15,
    color: '#EC4899'
  },
  {
    id: 'advanced-frameworks',
    name: 'Advanced Frameworks',
    icon: '🧠',
    description: 'Consciousness emergence and multiplication strategies',
    resourceCount: 12,
    color: '#3B82F6'
  }
]

// Sample Resources
const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 'consciousness-assessment-toolkit',
    title: 'Complete Consciousness Assessment Toolkit',
    type: 'tool',
    category: 'assessment-tools',
    description: 'Comprehensive toolkit for measuring business consciousness levels across all departments',
    consciousnessLevel: 1,
    certificationRequired: 'foundation',
    fileSize: '45 MB',
    lastUpdated: new Date('2024-01-15'),
    downloads: 1247,
    rating: 4.8,
    tags: ['assessment', 'consciousness', 'measurement', 'foundation'],
    featured: true
  },
  {
    id: 'intelligence-multiplication-playbook',
    title: 'Intelligence Multiplication Playbook',
    type: 'guide',
    category: 'transformation-guides',
    description: 'Advanced strategies for achieving exponential intelligence growth',
    consciousnessLevel: 5,
    certificationRequired: 'advanced',
    fileSize: '28 MB',
    lastUpdated: new Date('2024-01-20'),
    downloads: 892,
    rating: 4.9,
    tags: ['multiplication', 'intelligence', 'advanced', 'strategy'],
    featured: true
  },
  {
    id: 'executive-consciousness-deck',
    title: 'Executive Consciousness Presentation',
    type: 'presentation',
    category: 'client-materials',
    description: 'C-suite ready presentation on business consciousness transformation',
    consciousnessLevel: 3,
    certificationRequired: 'foundation',
    fileSize: '15 MB',
    duration: '45 min',
    lastUpdated: new Date('2024-01-10'),
    downloads: 2103,
    rating: 4.7,
    tags: ['executive', 'presentation', 'consciousness', 'c-suite']
  },
  {
    id: 'transformation-roadmap-template',
    title: '90-Day Transformation Roadmap',
    type: 'template',
    category: 'implementation-templates',
    description: 'Customizable roadmap for consciousness transformation projects',
    consciousnessLevel: 2,
    certificationRequired: 'foundation',
    fileSize: '8 MB',
    lastUpdated: new Date('2024-01-05'),
    downloads: 1567,
    rating: 4.6,
    tags: ['roadmap', 'planning', 'transformation', 'template']
  },
  {
    id: 'manufacturing-consciousness-case',
    title: 'TechFlow Industries: From Linear to Exponential',
    type: 'case-study',
    category: 'case-studies',
    description: 'How a traditional manufacturer achieved 10x intelligence multiplication',
    consciousnessLevel: 4,
    certificationRequired: 'advanced',
    fileSize: '22 MB',
    lastUpdated: new Date('2023-12-20'),
    downloads: 634,
    rating: 4.9,
    tags: ['case-study', 'manufacturing', 'success', 'multiplication']
  },
  {
    id: 'consciousness-emergence-framework',
    title: 'Consciousness Emergence Architecture',
    type: 'framework',
    category: 'advanced-frameworks',
    description: 'Master framework for facilitating business consciousness emergence',
    consciousnessLevel: 7,
    certificationRequired: 'master',
    fileSize: '35 MB',
    lastUpdated: new Date('2023-12-15'),
    downloads: 287,
    rating: 5.0,
    tags: ['emergence', 'consciousness', 'master', 'architecture'],
    featured: true
  }
]

// 3D Resource Visualization
const ResourceVisualization: React.FC<{ 
  category: string 
  resourceCount: number 
  color: string 
}> = ({ category, resourceCount, color }) => {
  // TODO: Re-enable when Three.js is available
  // const meshRef = React.useRef<THREE.Mesh>(null)
  
  // useFrame((state) => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
  //     meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05
  //   }
  // })

  return (
    // TODO: Re-enable 3D visualization when Three.js is available
    <div className="w-24 h-24 mx-auto relative">
      <div
        className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-xl"
        style={{ backgroundColor: color }}
      >
        {resourceCount}
      </div>
      <div className="absolute -bottom-6 left-0 right-0 text-center text-sm text-gray-600">
        {category}
      </div>
    </div>
  )
}

const PartnerResourceLibrary: React.FC<PartnerResourceLibraryProps> = ({
  partnerId = 'demo-partner',
  certificationLevel = 'advanced',
  onResourceOpen,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest')
  const [showFilters, setShowFilters] = useState(false)
  const [resources, setResources] = useState<Resource[]>(SAMPLE_RESOURCES)
  const [loading, setLoading] = useState(false)

  // Filter resources based on certification level
  const accessibleResources = resources.filter(resource => {
    const levels = ['foundation', 'advanced', 'master', 'transcendent']
    const userLevelIndex = levels.indexOf(certificationLevel)
    const requiredLevelIndex = levels.indexOf(resource.certificationRequired)
    return userLevelIndex >= requiredLevelIndex
  })

  // Apply category and search filters
  const filteredResources = accessibleResources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return b.lastUpdated.getTime() - a.lastUpdated.getTime()
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'foundation': return '#10B981'
      case 'advanced': return '#3B82F6'
      case 'master': return '#8B5CF6'
      case 'transcendent': return '#EC4899'
      default: return '#6B7280'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return '📖'
      case 'template': return '📋'
      case 'tool': return '🛠️'
      case 'presentation': return '🎯'
      case 'case-study': return '📊'
      case 'framework': return '🧠'
      default: return '📄'
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-thin text-white">
          📚 Partner Resource Library
        </h2>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          Everything you need to guide businesses from unconscious automation to transcendent intelligence
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search resources, tools, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="latest">Latest Updated</option>
            <option value="popular">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-all"
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>
        </div>

        {/* Category Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All Resources
                </button>
                {RESOURCE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : undefined
                    }}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Overview */}
      {selectedCategory === 'all' && (
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {RESOURCE_CATEGORIES.map((category) => (
            <motion.div
              key={category.id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-all"
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-32 mb-4">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <ResourceVisualization
                    category={category.name}
                    resourceCount={category.resourceCount}
                    color={category.color}
                  />
                </Canvas>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-white text-sm">{category.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{category.resourceCount} resources</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resources Grid */}
      <div className="space-y-6">
        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-gray-400">
            Showing {sortedResources.length} of {resources.length} resources
          </div>
          <div className="text-sm text-gray-500">
            Your access level: <span className="font-semibold" style={{ color: getCertificationColor(certificationLevel) }}>
              {certificationLevel.charAt(0).toUpperCase() + certificationLevel.slice(1)}
            </span>
          </div>
        </div>

        {/* Featured Resources */}
        {selectedCategory === 'all' && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">⭐ Featured Resources</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {sortedResources.filter(r => r.featured).slice(0, 3).map((resource) => (
                <motion.div
                  key={resource.id}
                  className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-xl p-6 cursor-pointer hover:border-purple-600 transition-all"
                  onClick={() => onResourceOpen?.(resource)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{getTypeIcon(resource.type)}</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white font-semibold">{resource.rating}</span>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{resource.title}</h4>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{resource.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400">{resource.downloads.toLocaleString()} downloads</span>
                    <span 
                      className="px-2 py-1 rounded-full font-medium"
                      style={{ 
                        backgroundColor: getCertificationColor(resource.certificationRequired) + '33',
                        color: getCertificationColor(resource.certificationRequired)
                      }}
                    >
                      {resource.certificationRequired}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Resource List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResources.map((resource) => (
            <motion.div
              key={resource.id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-gray-600 transition-all"
              onClick={() => onResourceOpen?.(resource)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(resource.type)}</div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">{resource.type}</div>
                    <div className="text-xs text-gray-500">{resource.fileSize || resource.duration}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-white font-semibold text-sm">{resource.rating}</span>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-white mb-2">{resource.title}</h4>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{resource.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{resource.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">
                    {resource.downloads.toLocaleString()} downloads
                  </span>
                  <span className="text-gray-500">
                    Updated {resource.lastUpdated.toLocaleDateString()}
                  </span>
                </div>
                <span 
                  className="px-2 py-1 rounded-full font-medium"
                  style={{ 
                    backgroundColor: getCertificationColor(resource.certificationRequired) + '33',
                    color: getCertificationColor(resource.certificationRequired)
                  }}
                >
                  {resource.certificationRequired}
                </span>
              </div>

              {/* Consciousness Level Indicator */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Consciousness Level</span>
                  <span className="text-cyan-400 font-semibold">{resource.consciousnessLevel}</span>
                </div>
                <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1 rounded-full"
                    style={{ width: `${(resource.consciousnessLevel / 10) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {sortedResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Quick Access Tools */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Access Tools</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: 'Consciousness Calculator', icon: '🧮', time: '2 min' },
            { name: 'Intelligence Gap Analyzer', icon: '📊', time: '5 min' },
            { name: 'ROI Projection Tool', icon: '💰', time: '3 min' },
            { name: 'Transformation Readiness', icon: '✅', time: '4 min' }
          ].map((tool, index) => (
            <motion.button
              key={index}
              className="bg-black/30 rounded-lg p-4 text-left hover:bg-black/50 transition-all"
              whileHover={{ scale: 1.02 }}
              onClick={() => console.log(`Opening ${tool.name}`)}
            >
              <div className="text-2xl mb-2">{tool.icon}</div>
              <div className="text-white font-medium text-sm">{tool.name}</div>
              <div className="text-xs text-gray-400 mt-1">{tool.time} to complete</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PartnerResourceLibrary