import { describe, it, expect } from 'vitest'
import { customerCreateSchema, hvacDataSchema } from '@/lib/validations/customer'

describe('Authentication Validation', () => {
  describe('Customer Creation Schema', () => {
    it('should validate correct customer data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        address: '123 Main St'
      }
      
      const result = customerCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe'
      }
      
      const result = customerCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['firstName'],
            message: 'First name is required'
          })
        )
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      }
      
      const result = customerCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Invalid email'
          })
        )
      }
    })
  })

  describe('HVAC Data Schema', () => {
    it('should validate HVAC specific fields', () => {
      const validHVACData = {
        equipment_type: 'Central Air',
        equipment_brand: 'Carrier',
        seer_rating: 16,
        refrigerant_type: 'R-410A'
      }
      
      const result = hvacDataSchema.safeParse(validHVACData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid SEER rating', () => {
      const invalidData = {
        seer_rating: 0
      }
      
      const result = hvacDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})