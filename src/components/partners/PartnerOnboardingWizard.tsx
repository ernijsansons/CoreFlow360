'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronRight, ChevronLeft, Building2, User, Briefcase,
  Target, DollarSign, Award, CheckCircle, AlertCircle,
  FileText, Shield, Rocket, Globe, Users, TrendingUp,
  Calendar, Mail, Phone, MapPin, Link2, Star
} from 'lucide-react'

export default function PartnerOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
    yearsFounded: '',
    
    // Contact Information
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    primaryContactRole: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Business Details
    partnerType: '',
    targetMarket: '',
    currentClients: '',
    annualRevenue: '',
    certifiedStaff: '',
    
    // Experience & Capabilities
    previousPartnerships: '',
    technicalCapabilities: [],
    industryExpertise: [],
    serviceOfferings: [],
    
    // Goals & Expectations
    partnershipGoals: '',
    expectedMonthlyDeals: '',
    marketingBudget: '',
    dedicatedResources: '',
    
    // Agreement
    agreedToTerms: false,
    agreedToCommission: false,
    agreedToTraining: false,
    agreedToMinimums: false
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const totalSteps = 6

  const steps = [
    {
      number: 1,
      title: 'Company Information',
      description: 'Tell us about your organization',
      icon: Building2
    },
    {
      number: 2,
      title: 'Contact Details',
      description: 'Primary contact information',
      icon: User
    },
    {
      number: 3,
      title: 'Business Profile',
      description: 'Your business model and market',
      icon: Briefcase
    },
    {
      number: 4,
      title: 'Capabilities',
      description: 'Your expertise and offerings',
      icon: Award
    },
    {
      number: 5,
      title: 'Partnership Goals',
      description: 'What you want to achieve',
      icon: Target
    },
    {
      number: 6,
      title: 'Agreement',
      description: 'Review and accept terms',
      icon: FileText
    }
  ]

  const partnerTypes = [
    { value: 'consultant', label: 'Independent Consultant', description: 'Solo practitioner or small consulting firm' },
    { value: 'agency', label: 'Digital Agency', description: 'Full-service marketing or development agency' },
    { value: 'reseller', label: 'Software Reseller', description: 'VAR or software distribution company' },
    { value: 'integrator', label: 'Systems Integrator', description: 'Enterprise integration specialist' },
    { value: 'implementation', label: 'Implementation Partner', description: 'Deployment and training specialist' }
  ]

  const technicalCapabilitiesOptions = [
    'API Integration',
    'Data Migration',
    'Custom Development',
    'Cloud Infrastructure',
    'Security & Compliance',
    'Business Intelligence',
    'Workflow Automation',
    'Mobile Development'
  ]

  const industryExpertiseOptions = [
    'HVAC & Field Service',
    'Professional Services',
    'Construction & Trades',
    'Retail & E-commerce',
    'Healthcare',
    'Manufacturing',
    'Real Estate',
    'Hospitality'
  ]

  const serviceOfferingsOptions = [
    'Implementation Services',
    'Training & Education',
    'Ongoing Support',
    'Custom Development',
    'Data Migration',
    'Business Consulting',
    'Change Management',
    'Marketing Services'
  ]

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}
    
    switch(step) {
      case 1:
        if (!formData.companyName) errors.companyName = 'Company name is required'
        if (!formData.companyWebsite) errors.companyWebsite = 'Website is required'
        if (!formData.companySize) errors.companySize = 'Company size is required'
        break
      case 2:
        if (!formData.primaryContactName) errors.primaryContactName = 'Contact name is required'
        if (!formData.primaryContactEmail) errors.primaryContactEmail = 'Email is required'
        if (!formData.primaryContactPhone) errors.primaryContactPhone = 'Phone is required'
        break
      case 3:
        if (!formData.partnerType) errors.partnerType = 'Partner type is required'
        if (!formData.targetMarket) errors.targetMarket = 'Target market is required'
        break
      case 4:
        if (formData.technicalCapabilities.length === 0) errors.technicalCapabilities = 'Select at least one capability'
        if (formData.industryExpertise.length === 0) errors.industryExpertise = 'Select at least one industry'
        break
      case 5:
        if (!formData.partnershipGoals) errors.partnershipGoals = 'Partnership goals are required'
        if (!formData.expectedMonthlyDeals) errors.expectedMonthlyDeals = 'Expected deals is required'
        break
      case 6:
        if (!formData.agreedToTerms) errors.agreedToTerms = 'You must agree to terms'
        if (!formData.agreedToCommission) errors.agreedToCommission = 'You must agree to commission structure'
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      console.log('Submitting partner application:', formData)
      // API call would go here
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors }
      delete newErrors[field]
      setValidationErrors(newErrors)
    }
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Acme Consulting Group"
                  className={validationErrors.companyName ? 'border-red-500' : ''}
                />
                {validationErrors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.companyName}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="companyWebsite">Company Website *</Label>
                <Input
                  id="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={(e) => updateFormData('companyWebsite', e.target.value)}
                  placeholder="https://www.example.com"
                  className={validationErrors.companyWebsite ? 'border-red-500' : ''}
                />
                {validationErrors.companyWebsite && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.companyWebsite}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="companySize">Company Size *</Label>
                <Select value={formData.companySize} onValueChange={(value) => updateFormData('companySize', value)}>
                  <SelectTrigger className={validationErrors.companySize ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.companySize && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.companySize}</p>
                )}
              </div>

              <div>
                <Label htmlFor="industry">Primary Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yearsFounded">Years in Business</Label>
                <Input
                  id="yearsFounded"
                  type="number"
                  value={formData.yearsFounded}
                  onChange={(e) => updateFormData('yearsFounded', e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryContactName">Primary Contact Name *</Label>
                <Input
                  id="primaryContactName"
                  value={formData.primaryContactName}
                  onChange={(e) => updateFormData('primaryContactName', e.target.value)}
                  placeholder="John Smith"
                  className={validationErrors.primaryContactName ? 'border-red-500' : ''}
                />
                {validationErrors.primaryContactName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.primaryContactName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="primaryContactRole">Role/Title</Label>
                <Input
                  id="primaryContactRole"
                  value={formData.primaryContactRole}
                  onChange={(e) => updateFormData('primaryContactRole', e.target.value)}
                  placeholder="Partner Manager"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryContactEmail">Email Address *</Label>
                <Input
                  id="primaryContactEmail"
                  type="email"
                  value={formData.primaryContactEmail}
                  onChange={(e) => updateFormData('primaryContactEmail', e.target.value)}
                  placeholder="john@example.com"
                  className={validationErrors.primaryContactEmail ? 'border-red-500' : ''}
                />
                {validationErrors.primaryContactEmail && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.primaryContactEmail}</p>
                )}
              </div>

              <div>
                <Label htmlFor="primaryContactPhone">Phone Number *</Label>
                <Input
                  id="primaryContactPhone"
                  value={formData.primaryContactPhone}
                  onChange={(e) => updateFormData('primaryContactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={validationErrors.primaryContactPhone ? 'border-red-500' : ''}
                />
                {validationErrors.primaryContactPhone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.primaryContactPhone}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <Input
                id="businessAddress"
                value={formData.businessAddress}
                onChange={(e) => updateFormData('businessAddress', e.target.value)}
                placeholder="123 Main Street, Suite 100"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  placeholder="CA"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  placeholder="94105"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  placeholder="USA"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Partner Type *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {partnerTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      formData.partnerType === type.value 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateFormData('partnerType', type.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      {formData.partnerType === type.value && (
                        <CheckCircle className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {validationErrors.partnerType && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.partnerType}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetMarket">Target Market *</Label>
                <Select value={formData.targetMarket} onValueChange={(value) => updateFormData('targetMarket', value)}>
                  <SelectTrigger className={validationErrors.targetMarket ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smb">Small & Medium Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="startup">Startups</SelectItem>
                    <SelectItem value="nonprofit">Non-Profit</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.targetMarket && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.targetMarket}</p>
                )}
              </div>

              <div>
                <Label htmlFor="currentClients">Current Client Base</Label>
                <Input
                  id="currentClients"
                  type="number"
                  value={formData.currentClients}
                  onChange={(e) => updateFormData('currentClients', e.target.value)}
                  placeholder="25"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annualRevenue">Annual Revenue Range</Label>
                <Select value={formData.annualRevenue} onValueChange={(value) => updateFormData('annualRevenue', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-100k">$0 - $100K</SelectItem>
                    <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                    <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                    <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                    <SelectItem value="5m+">$5M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="certifiedStaff">Staff to be Certified</Label>
                <Input
                  id="certifiedStaff"
                  type="number"
                  value={formData.certifiedStaff}
                  onChange={(e) => updateFormData('certifiedStaff', e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Technical Capabilities *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {technicalCapabilitiesOptions.map((capability) => (
                  <div key={capability} className="flex items-center space-x-2">
                    <Checkbox
                      id={capability}
                      checked={formData.technicalCapabilities.includes(capability)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('technicalCapabilities', [...formData.technicalCapabilities, capability])
                        } else {
                          updateFormData('technicalCapabilities', formData.technicalCapabilities.filter(c => c !== capability))
                        }
                      }}
                    />
                    <Label htmlFor={capability} className="font-normal cursor-pointer">
                      {capability}
                    </Label>
                  </div>
                ))}
              </div>
              {validationErrors.technicalCapabilities && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.technicalCapabilities}</p>
              )}
            </div>

            <div>
              <Label>Industry Expertise *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {industryExpertiseOptions.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry}
                      checked={formData.industryExpertise.includes(industry)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('industryExpertise', [...formData.industryExpertise, industry])
                        } else {
                          updateFormData('industryExpertise', formData.industryExpertise.filter(i => i !== industry))
                        }
                      }}
                    />
                    <Label htmlFor={industry} className="font-normal cursor-pointer">
                      {industry}
                    </Label>
                  </div>
                ))}
              </div>
              {validationErrors.industryExpertise && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.industryExpertise}</p>
              )}
            </div>

            <div>
              <Label>Service Offerings</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {serviceOfferingsOptions.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.serviceOfferings.includes(service)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('serviceOfferings', [...formData.serviceOfferings, service])
                        } else {
                          updateFormData('serviceOfferings', formData.serviceOfferings.filter(s => s !== service))
                        }
                      }}
                    />
                    <Label htmlFor={service} className="font-normal cursor-pointer">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="previousPartnerships">Previous Technology Partnerships</Label>
              <Textarea
                id="previousPartnerships"
                value={formData.previousPartnerships}
                onChange={(e) => updateFormData('previousPartnerships', e.target.value)}
                placeholder="Tell us about your experience with other technology partnerships..."
                rows={3}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="partnershipGoals">Partnership Goals *</Label>
              <Textarea
                id="partnershipGoals"
                value={formData.partnershipGoals}
                onChange={(e) => updateFormData('partnershipGoals', e.target.value)}
                placeholder="What do you hope to achieve through this partnership?"
                rows={4}
                className={validationErrors.partnershipGoals ? 'border-red-500' : ''}
              />
              {validationErrors.partnershipGoals && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.partnershipGoals}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expectedMonthlyDeals">Expected Monthly Deals *</Label>
                <Select 
                  value={formData.expectedMonthlyDeals} 
                  onValueChange={(value) => updateFormData('expectedMonthlyDeals', value)}
                >
                  <SelectTrigger className={validationErrors.expectedMonthlyDeals ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 deals</SelectItem>
                    <SelectItem value="3-5">3-5 deals</SelectItem>
                    <SelectItem value="6-10">6-10 deals</SelectItem>
                    <SelectItem value="11-20">11-20 deals</SelectItem>
                    <SelectItem value="20+">20+ deals</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.expectedMonthlyDeals && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.expectedMonthlyDeals}</p>
                )}
              </div>

              <div>
                <Label htmlFor="marketingBudget">Monthly Marketing Budget</Label>
                <Select 
                  value={formData.marketingBudget} 
                  onValueChange={(value) => updateFormData('marketingBudget', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1k">$0 - $1K</SelectItem>
                    <SelectItem value="1k-5k">$1K - $5K</SelectItem>
                    <SelectItem value="5k-10k">$5K - $10K</SelectItem>
                    <SelectItem value="10k-25k">$10K - $25K</SelectItem>
                    <SelectItem value="25k+">$25K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dedicatedResources">Dedicated Resources</Label>
              <Textarea
                id="dedicatedResources"
                value={formData.dedicatedResources}
                onChange={(e) => updateFormData('dedicatedResources', e.target.value)}
                placeholder="What resources will you dedicate to this partnership? (staff, time, budget, etc.)"
                rows={3}
              />
            </div>

            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Partners who dedicate at least 2 full-time resources see 3x higher success rates and earn 
                50% more in commissions within their first year.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Partnership Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Company</p>
                  <p className="font-semibold">{formData.companyName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Partner Type</p>
                  <p className="font-semibold capitalize">{formData.partnerType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Primary Contact</p>
                  <p className="font-semibold">{formData.primaryContactName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expected Monthly Deals</p>
                  <p className="font-semibold">{formData.expectedMonthlyDeals}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Selected Capabilities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.technicalCapabilities.map((cap) => (
                    <Badge key={cap} variant="secondary">{cap}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => updateFormData('agreedToTerms', checked as boolean)}
                />
                <Label htmlFor="terms" className="font-normal cursor-pointer">
                  I agree to the CoreFlow360 Partner Program Terms and Conditions
                </Label>
              </div>
              {validationErrors.agreedToTerms && (
                <p className="text-red-500 text-sm ml-6">{validationErrors.agreedToTerms}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="commission"
                  checked={formData.agreedToCommission}
                  onCheckedChange={(checked) => updateFormData('agreedToCommission', checked as boolean)}
                />
                <Label htmlFor="commission" className="font-normal cursor-pointer">
                  I understand and accept the commission structure (15-30% based on tier)
                </Label>
              </div>
              {validationErrors.agreedToCommission && (
                <p className="text-red-500 text-sm ml-6">{validationErrors.agreedToCommission}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="training"
                  checked={formData.agreedToTraining}
                  onCheckedChange={(checked) => updateFormData('agreedToTraining', checked as boolean)}
                />
                <Label htmlFor="training" className="font-normal cursor-pointer">
                  I commit to completing the required training and certification programs
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="minimums"
                  checked={formData.agreedToMinimums}
                  onCheckedChange={(checked) => updateFormData('agreedToMinimums', checked as boolean)}
                />
                <Label htmlFor="minimums" className="font-normal cursor-pointer">
                  I understand there are minimum performance requirements to maintain partner status
                </Label>
              </div>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Upon approval, you'll receive access to the partner portal, training materials, and 
                marketing resources within 24-48 hours.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">Partner Onboarding</CardTitle>
              <CardDescription>Join the CoreFlow360 Partner Program</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center ${
                    step.number === currentStep 
                      ? 'text-purple-600' 
                      : step.number < currentStep 
                      ? 'text-green-600' 
                      : 'text-gray-400'
                  }`}
                >
                  <div className={`rounded-full p-2 ${
                    step.number === currentStep 
                      ? 'bg-purple-100' 
                      : step.number < currentStep 
                      ? 'bg-green-100' 
                      : 'bg-gray-100'
                  }`}>
                    {step.number < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs mt-1 hidden md:block">{step.title}</p>
                </div>
              )
            })}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{steps[currentStep - 1].title}</h3>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </div>
          
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === totalSteps ? (
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Rocket className="w-4 h-4 mr-2" />
                Submit Application
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}