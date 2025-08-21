'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building, 
  DollarSign, 
  Users, 
  ArrowRight, 
  Check, 
  Sparkles,
  TrendingDown,
  Calculator,
  Shield
} from 'lucide-react'

interface AddBusinessWizardProps {
  currentBusinessCount?: number
}

export function AddBusinessWizard({ currentBusinessCount = 3 }: AddBusinessWizardProps) {
  const [step, setStep] = useState(1)
  const [businessData, setBusinessData] = useState({
    name: '',
    industry: '',
    users: 10,
    employees: 50,
    revenue: 500000,
    modules: [] as string[]
  })
  
  // Calculate discount based on business count
  const getDiscount = (count: number) => {
    if (count === 1) return { rate: 0, label: 'No discount', color: 'gray' }
    if (count === 2) return { rate: 0.20, label: '20% off', color: 'green' }
    if (count === 3) return { rate: 0.35, label: '35% off', color: 'green' }
    if (count === 4) return { rate: 0.45, label: '45% off', color: 'green' }
    if (count >= 5) return { rate: 0.50, label: '50% off (MAX)', color: 'green' }
    return { rate: 0, label: 'No discount', color: 'gray' }
  }
  
  const currentDiscount = getDiscount(currentBusinessCount + 1)
  const basePrice = 59 + (businessData.users * 12) // Professional tier base
  const discountedPrice = Math.round(basePrice * (1 - currentDiscount.rate))
  const monthlySavings = basePrice - discountedPrice
  const annualSavings = monthlySavings * 12
  
  const modules = [
    { id: 'crm', name: 'CRM & Sales', price: 25 },
    { id: 'accounting', name: 'Accounting & Finance', price: 35 },
    { id: 'inventory', name: 'Inventory Management', price: 20 },
    { id: 'hr', name: 'HR & Payroll', price: 30 },
    { id: 'projects', name: 'Project Management', price: 25 },
    { id: 'territory', name: 'Territory Management', price: 40 }
  ]
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Add Your {currentBusinessCount + 1}th Business</h1>
        <p className="text-gray-600 mb-4">
          Expand your portfolio and unlock greater savings with progressive pricing
        </p>
        <div className="flex justify-center items-center space-x-4">
          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 text-lg">
            <Sparkles className="h-4 w-4 mr-2" />
            {currentDiscount.label} - Save ${monthlySavings}/month
          </Badge>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-12">
          <span className="text-sm text-gray-600">Business Info</span>
          <span className="text-sm text-gray-600">Select Modules</span>
          <span className="text-sm text-gray-600">Review & Save</span>
        </div>
      </div>
      
      {/* Step 1: Business Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Tell us about your new business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-name">Business Name*</Label>
                <Input
                  id="business-name"
                  placeholder="Enter business name"
                  value={businessData.name}
                  onChange={(e) => setBusinessData({...businessData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry*</Label>
                <Select 
                  value={businessData.industry}
                  onValueChange={(value) => setBusinessData({...businessData, industry: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hvac">HVAC Services</SelectItem>
                    <SelectItem value="professional">Professional Services</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="users">Number of Users*</Label>
                <Input
                  id="users"
                  type="number"
                  min="1"
                  value={businessData.users}
                  onChange={(e) => setBusinessData({...businessData, users: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div>
                <Label htmlFor="employees">Total Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  value={businessData.employees}
                  onChange={(e) => setBusinessData({...businessData, employees: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={businessData.revenue}
                  onChange={(e) => setBusinessData({...businessData, revenue: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                As your {currentBusinessCount + 1}th business, you automatically qualify for {currentDiscount.label} on all modules and users.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={!businessData.name || !businessData.industry}
              >
                Continue to Modules
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Module Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Modules</CardTitle>
            <CardDescription>Choose the modules you need for {businessData.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {modules.map((module) => {
                const isSelected = businessData.modules.includes(module.id)
                const discountedModulePrice = Math.round(module.price * (1 - currentDiscount.rate))
                
                return (
                  <div
                    key={module.id}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => {
                      setBusinessData({
                        ...businessData,
                        modules: isSelected 
                          ? businessData.modules.filter(m => m !== module.id)
                          : [...businessData.modules, module.id]
                      })
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
                        `}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium">{module.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500 line-through">${module.price}</span>
                            <span className="text-sm font-semibold text-green-600">${discountedModulePrice}/mo</span>
                            <Badge variant="secondary" className="text-xs">
                              Save ${module.price - discountedModulePrice}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={businessData.modules.length === 0}
              >
                Review & Save
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Review and Pricing */}
      {step === 3 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Review Your New Business</CardTitle>
              <CardDescription>Confirm details and see your progressive pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Business Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{businessData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium">{businessData.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{businessData.users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modules:</span>
                      <span className="font-medium">{businessData.modules.length} selected</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Selected Modules</h4>
                  <div className="space-y-1">
                    {businessData.modules.map(moduleId => {
                      const module = modules.find(m => m.id === moduleId)
                      return module ? (
                        <div key={moduleId} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{module.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Pricing Card */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle>Your Progressive Pricing</CardTitle>
              <CardDescription>Business #{currentBusinessCount + 1} with {currentDiscount.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <span>Base Platform Fee</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 line-through">${basePrice}</span>
                    <span className="font-semibold">${discountedPrice}</span>
                  </div>
                </div>
                
                {businessData.modules.map(moduleId => {
                  const module = modules.find(m => m.id === moduleId)
                  if (!module) return null
                  const discountedModulePrice = Math.round(module.price * (1 - currentDiscount.rate))
                  
                  return (
                    <div key={moduleId} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{module.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 line-through">${module.price}</span>
                        <span>${discountedModulePrice}</span>
                      </div>
                    </div>
                  )
                })}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Progressive Discount ({currentDiscount.label})</span>
                    <span className="font-semibold text-green-600">-${monthlySavings}/mo</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Monthly Cost</span>
                    <span className="text-green-600">${discountedPrice}/mo</span>
                  </div>
                  <div className="text-center mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      Annual Savings: ${annualSavings}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Add Business & Save ${monthlySavings}/month
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  Back to Modules
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Next Business Preview */}
          <Alert className="mt-6 bg-blue-50 border-blue-200">
            <Calculator className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Planning ahead?</strong> Your 5th business will qualify for the maximum 50% discount, 
              saving you an additional ${Math.round(basePrice * 0.5)}/month!
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  )
}