"use client"

import { useState } from "react"
import { getIndustryCustomFields } from "@/lib/industry-config"

interface HVACCustomerData {
  name: string
  email?: string
  phone?: string
  address?: string
  // HVAC-specific fields
  equipment_type?: string
  equipment_brand?: string
  model_number?: string
  serial_number?: string
  installation_date?: string
  warranty_expiry?: string
  refrigerant_type?: string
  seer_rating?: number
  service_frequency?: string
  last_service_date?: string
  emergency_contact?: string
  permit_number?: string
}

interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'date' | 'boolean' | 'file' | 'multiselect'
  required?: boolean
  group?: string
  options?: string[]
}

interface HVACCustomerFormProps {
  customer?: HVACCustomerData
  onSubmit: (data: HVACCustomerData) => void
  onCancel: () => void
}

export function HVACCustomerForm({ customer, onSubmit, onCancel }: HVACCustomerFormProps) {
  const [formData, setFormData] = useState<HVACCustomerData>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    equipment_type: customer?.equipment_type || '',
    equipment_brand: customer?.equipment_brand || '',
    model_number: customer?.model_number || '',
    serial_number: customer?.serial_number || '',
    installation_date: customer?.installation_date || '',
    warranty_expiry: customer?.warranty_expiry || '',
    refrigerant_type: customer?.refrigerant_type || '',
    seer_rating: customer?.seer_rating || undefined,
    service_frequency: customer?.service_frequency || '',
    last_service_date: customer?.last_service_date || '',
    emergency_contact: customer?.emergency_contact || '',
    permit_number: customer?.permit_number || '',
  })

  const hvacFields = getIndustryCustomFields('hvac')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name as keyof HVACCustomerData]

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value as string || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'number':
        return (
          <input
            type="number"
            value={value as number || ''}
            onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={field.required}
          />
        )
      case 'date':
        return (
          <input
            type="date"
            value={value as string || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={field.required}
          />
        )
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={Boolean(value) || false}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        )
      default:
        return (
          <input
            type="text"
            value={value as string || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={field.required}
          />
        )
    }
  }

  // Group fields by category
  const groupedFields = hvacFields.reduce((groups, field) => {
    const group = field.group || 'General'
    if (!groups[group]) groups[group] = []
    groups[group].push(field)
    return groups
  }, {} as Record<string, FieldConfig[]>)

  // Add basic fields to General group
  const basicFields: FieldConfig[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, group: 'General' },
    { name: 'email', label: 'Email', type: 'email', required: false, group: 'General' },
    { name: 'phone', label: 'Phone', type: 'tel', required: false, group: 'General' },
    { name: 'address', label: 'Address', type: 'textarea', required: false, group: 'General' },
  ]

  if (!groupedFields.General) groupedFields.General = []
  groupedFields.General = [...basicFields, ...groupedFields.General]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onCancel} />
        <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              {customer ? 'Edit Customer' : 'Add New HVAC Customer'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.entries(groupedFields).map(([groupName, fields]) => (
                <div key={groupName} className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2">
                    {groupName}
                  </h3>
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.name === 'address' ? (
                        <textarea
                          value={formData.address || ''}
                          onChange={(e) => handleChange('address', e.target.value)}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      ) : (
                        renderField(field)
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {customer ? 'Update Customer' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}