'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Download, FileText, Video, BookOpen, Award, Users, 
  TrendingUp, Target, Briefcase, DollarSign, Rocket,
  CheckCircle, Clock, Star, Shield, Zap, Globe,
  BarChart3, Gift, HandshakeIcon, GraduationCap
} from 'lucide-react'

export default function PartnerProgramMaterials() {
  const [selectedTier, setSelectedTier] = useState('silver')
  const [downloadedMaterials, setDownloadedMaterials] = useState<string[]>([])

  const partnerTiers = {
    bronze: {
      name: 'Bronze Partner',
      color: 'bg-orange-500',
      commission: 15,
      benefits: [
        'Basic training materials',
        'Partner portal access',
        'Monthly webinars',
        'Sales support'
      ],
      requirements: [
        '1 certified team member',
        '3 successful implementations',
        '$10K annual revenue'
      ]
    },
    silver: {
      name: 'Silver Partner',
      color: 'bg-gray-400',
      commission: 20,
      benefits: [
        'All Bronze benefits',
        'Priority support',
        'Co-marketing opportunities',
        'Lead sharing program',
        'Custom demo environment'
      ],
      requirements: [
        '3 certified team members',
        '10 successful implementations',
        '$50K annual revenue'
      ]
    },
    gold: {
      name: 'Gold Partner',
      color: 'bg-yellow-500',
      commission: 25,
      benefits: [
        'All Silver benefits',
        'Dedicated account manager',
        'Joint marketing campaigns',
        'Premium lead distribution',
        'White-label options'
      ],
      requirements: [
        '5 certified team members',
        '25 successful implementations',
        '$150K annual revenue'
      ]
    },
    platinum: {
      name: 'Platinum Partner',
      color: 'bg-purple-500',
      commission: 30,
      benefits: [
        'All Gold benefits',
        'Executive business reviews',
        'Custom integrations',
        'Territory exclusivity options',
        'Strategic planning sessions'
      ],
      requirements: [
        '10 certified team members',
        '50 successful implementations',
        '$500K annual revenue'
      ]
    }
  }

  const trainingMaterials = [
    {
      category: 'Foundation',
      materials: [
        {
          id: 'fm-1',
          title: 'CoreFlow360 Partner Onboarding Guide',
          type: 'pdf',
          duration: '2 hours',
          description: 'Complete guide to becoming a successful CoreFlow360 partner',
          size: '12.5 MB',
          certification: true
        },
        {
          id: 'fm-2',
          title: 'Multi-Business Management Fundamentals',
          type: 'video',
          duration: '45 min',
          description: 'Understanding the multi-business entrepreneur market',
          size: '250 MB',
          certification: true
        },
        {
          id: 'fm-3',
          title: 'Progressive Pricing Model Training',
          type: 'interactive',
          duration: '30 min',
          description: 'Master the progressive pricing conversation',
          size: '5 MB',
          certification: false
        }
      ]
    },
    {
      category: 'Sales & Marketing',
      materials: [
        {
          id: 'sm-1',
          title: 'Partner Sales Playbook',
          type: 'pdf',
          duration: '3 hours',
          description: '50+ proven sales strategies for multi-business solutions',
          size: '18 MB',
          certification: true
        },
        {
          id: 'sm-2',
          title: 'Email Templates & Scripts',
          type: 'document',
          duration: '1 hour',
          description: '25 high-converting email templates',
          size: '2 MB',
          certification: false
        },
        {
          id: 'sm-3',
          title: 'Social Media Marketing Kit',
          type: 'bundle',
          duration: '2 hours',
          description: 'Graphics, posts, and campaign templates',
          size: '125 MB',
          certification: false
        }
      ]
    },
    {
      category: 'Implementation',
      materials: [
        {
          id: 'im-1',
          title: 'Technical Implementation Guide',
          type: 'pdf',
          duration: '4 hours',
          description: 'Step-by-step implementation procedures',
          size: '22 MB',
          certification: true
        },
        {
          id: 'im-2',
          title: 'Data Migration Toolkit',
          type: 'software',
          duration: '2 hours',
          description: 'Tools and scripts for seamless data migration',
          size: '45 MB',
          certification: true
        },
        {
          id: 'im-3',
          title: 'Integration Patterns Library',
          type: 'code',
          duration: '3 hours',
          description: 'Common integration patterns and APIs',
          size: '8 MB',
          certification: false
        }
      ]
    },
    {
      category: 'Support & Success',
      materials: [
        {
          id: 'ss-1',
          title: 'Customer Success Framework',
          type: 'pdf',
          duration: '2 hours',
          description: 'Ensuring long-term customer satisfaction',
          size: '15 MB',
          certification: true
        },
        {
          id: 'ss-2',
          title: 'Troubleshooting Guide',
          type: 'interactive',
          duration: '1 hour',
          description: 'Common issues and resolutions',
          size: '10 MB',
          certification: false
        },
        {
          id: 'ss-3',
          title: 'Quarterly Business Reviews Template',
          type: 'presentation',
          duration: '30 min',
          description: 'QBR templates for client retention',
          size: '5 MB',
          certification: false
        }
      ]
    }
  ]

  const marketingAssets = [
    {
      name: 'Partner Co-Marketing Toolkit',
      items: [
        'Logo files (SVG, PNG, EPS)',
        'Brand guidelines document',
        'Press release templates',
        'Case study templates',
        'Webinar presentation decks'
      ]
    },
    {
      name: 'Lead Generation Package',
      items: [
        'Landing page templates',
        'Google Ads templates',
        'LinkedIn campaign guides',
        'SEO keyword research',
        'Content calendar template'
      ]
    },
    {
      name: 'Sales Enablement Suite',
      items: [
        'ROI calculator spreadsheet',
        'Competitive battle cards',
        'Objection handling guide',
        'Demo scripts and scenarios',
        'Proposal templates'
      ]
    }
  ]

  const commissionStructure = {
    newBusiness: {
      bronze: { year1: 15, year2: 10, year3: 5 },
      silver: { year1: 20, year2: 15, year3: 10 },
      gold: { year1: 25, year2: 20, year3: 15 },
      platinum: { year1: 30, year2: 25, year3: 20 }
    },
    expansion: {
      bronze: 10,
      silver: 15,
      gold: 20,
      platinum: 25
    },
    services: {
      bronze: 20,
      silver: 25,
      gold: 30,
      platinum: 35
    }
  }

  const certificationPaths = [
    {
      name: 'Foundation Certification',
      level: 'Entry',
      duration: '2 weeks',
      modules: 4,
      exam: true,
      badge: '🏅',
      requirements: [
        'Complete all foundation materials',
        'Pass foundation exam (80%+)',
        'Complete 1 demo implementation'
      ]
    },
    {
      name: 'Implementation Specialist',
      level: 'Intermediate',
      duration: '4 weeks',
      modules: 8,
      exam: true,
      badge: '🥈',
      requirements: [
        'Foundation Certification',
        'Complete 3 live implementations',
        'Pass technical exam (85%+)'
      ]
    },
    {
      name: 'Solution Architect',
      level: 'Advanced',
      duration: '8 weeks',
      modules: 12,
      exam: true,
      badge: '🥇',
      requirements: [
        'Implementation Specialist',
        '10+ successful implementations',
        'Pass architecture exam (90%+)'
      ]
    },
    {
      name: 'Master Partner',
      level: 'Expert',
      duration: '12 weeks',
      modules: 16,
      exam: true,
      badge: '💎',
      requirements: [
        'Solution Architect',
        '25+ implementations',
        'Mentor 5 new partners',
        'Contribute to platform development'
      ]
    }
  ]

  const handleDownload = (materialId: string) => {
    setDownloadedMaterials([...downloadedMaterials, materialId])
    // Simulate download
    console.log(`Downloading material: ${materialId}`)
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'interactive': return <Zap className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'bundle': return <Gift className="w-4 h-4" />
      case 'software': return <Download className="w-4 h-4" />
      case 'code': return <Globe className="w-4 h-4" />
      case 'presentation': return <BarChart3 className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Partner Program Materials</h1>
            <p className="text-lg opacity-90">Everything you need to succeed as a CoreFlow360 partner</p>
          </div>
          <div className="text-right">
            <Badge className="bg-white text-purple-600 text-lg px-4 py-2">
              <HandshakeIcon className="w-5 h-5 mr-2" />
              Partner Success Hub
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Training Materials</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certification Paths</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Marketing Assets</p>
                <p className="text-2xl font-bold">50+</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold">15-30%</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="training" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="certification">Certification</TabsTrigger>
          <TabsTrigger value="tiers">Partner Tiers</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        {/* Training Materials Tab */}
        <TabsContent value="training" className="space-y-4">
          {trainingMaterials.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {category.category} Training
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.materials.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(material.type)}
                          <span className="text-sm text-gray-600 capitalize">{material.type}</span>
                        </div>
                        {material.certification && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Required
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{material.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {material.duration}
                        </span>
                        <span>{material.size}</span>
                      </div>
                      <Button 
                        className="w-full"
                        size="sm"
                        variant={downloadedMaterials.includes(material.id) ? "secondary" : "default"}
                        onClick={() => handleDownload(material.id)}
                      >
                        {downloadedMaterials.includes(material.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Downloaded
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Certification Tab */}
        <TabsContent value="certification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Certification Paths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificationPaths.map((path) => (
                  <div key={path.name} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {path.name}
                          <span className="text-2xl">{path.badge}</span>
                        </h3>
                        <Badge variant="outline" className="mt-2">{path.level}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold">{path.duration}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Modules</p>
                        <p className="font-semibold">{path.modules}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Exam</p>
                        <p className="font-semibold">{path.exam ? 'Required' : 'Optional'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Requirements:</p>
                      <ul className="space-y-1">
                        {path.requirements.map((req, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">
                      Start Certification Path
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partner Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner Tier Benefits & Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(partnerTiers).map(([key, tier]) => (
                  <div 
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTier === key ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedTier(key)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={tier.color}>
                        {tier.name}
                      </Badge>
                      <span className="text-xl font-bold">{tier.commission}%</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Benefits:</p>
                        <ul className="space-y-1">
                          {tier.benefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                          {tier.benefits.length > 3 && (
                            <li className="text-xs text-gray-600">
                              +{tier.benefits.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Requirements:</p>
                        <ul className="space-y-1">
                          {tier.requirements.map((req, idx) => (
                            <li key={idx} className="text-xs text-gray-600">
                              • {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Tab */}
        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Commission Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">New Business Commission (Recurring)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Partner Tier</th>
                          <th className="text-center py-2">Year 1</th>
                          <th className="text-center py-2">Year 2</th>
                          <th className="text-center py-2">Year 3+</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(commissionStructure.newBusiness).map(([tier, rates]) => (
                          <tr key={tier} className="border-b">
                            <td className="py-2 capitalize font-medium">{tier}</td>
                            <td className="text-center py-2">{rates.year1}%</td>
                            <td className="text-center py-2">{rates.year2}%</td>
                            <td className="text-center py-2">{rates.year3}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Expansion Revenue</h3>
                    <div className="space-y-2">
                      {Object.entries(commissionStructure.expansion).map(([tier, rate]) => (
                        <div key={tier} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="capitalize font-medium">{tier}</span>
                          <Badge>{rate}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Professional Services</h3>
                    <div className="space-y-2">
                      {Object.entries(commissionStructure.services).map(([tier, rate]) => (
                        <div key={tier} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="capitalize font-medium">{tier}</span>
                          <Badge>{rate}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-600" />
                    Bonus Opportunities
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Quarterly performance bonus: Up to 5% additional commission</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>Annual growth bonus: 10% bonus for 50%+ YoY growth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Referral bonus: $500 for each new partner referral</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Marketing & Sales Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {marketingAssets.map((asset) => (
                  <div key={asset.name} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {asset.name}
                    </h3>
                    <ul className="space-y-2">
                      {asset.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-4" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Package
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Protected Territory Program
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Geographic Protection</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Exclusive territory rights for Gold+ partners</li>
                      <li>• Lead routing based on territory</li>
                      <li>• Territory expansion opportunities</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Industry Specialization</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Vertical market exclusivity available</li>
                      <li>• Industry-specific training and materials</li>
                      <li>• Specialized certification paths</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}