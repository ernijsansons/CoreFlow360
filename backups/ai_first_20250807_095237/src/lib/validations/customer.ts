import { z } from 'zod'

export const customerBaseSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

export const hvacDataSchema = z.object({
  equipment_type: z.string().optional(),
  equipment_brand: z.string().optional(),
  model_number: z.string().optional(),
  serial_number: z.string().optional(),
  installation_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
  refrigerant_type: z.string().optional(),
  seer_rating: z.number().min(1).max(30).optional(),
  service_frequency: z.string().optional(),
  last_service_date: z.string().optional(),
  emergency_contact: z.string().optional(),
  permit_number: z.string().optional(),
})

export const customerCreateSchema = customerBaseSchema.extend({
  hvacData: hvacDataSchema.optional(),
})

export type CustomerCreateData = z.infer<typeof customerCreateSchema>
export type HVACData = z.infer<typeof hvacDataSchema>