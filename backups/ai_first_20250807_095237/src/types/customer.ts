import { Customer, Tenant } from '@prisma/client'

export interface CustomerWithTenant extends Customer {
  tenant: Tenant
}

export interface HVACCustomerData {
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

export interface FormattedCustomer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  industryType: string
  createdAt: Date
}