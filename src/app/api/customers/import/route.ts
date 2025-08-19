/**
 * Customer Import API
 * POST /api/customers/import
 * Bulk import customers from CSV/JSON
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { CustomerStatus } from '@prisma/client'

const importSchema = z.object({
  customers: z.array(z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    industry: z.string().optional(),
    address: z.string().optional(),
    status: z.nativeEnum(CustomerStatus).optional().default(CustomerStatus.LEAD),
    source: z.string().optional().default('import'),
  })),
  options: z.object({
    skipDuplicates: z.boolean().optional().default(true),
    updateExisting: z.boolean().optional().default(false),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    const body = await request.json()
    const { customers, options } = importSchema.parse(body)

    const results = {
      imported: 0,
      skipped: 0,
      updated: 0,
      errors: [] as Array<{ row: number; error: string; data?: any }>,
    }

    // Process customers in batches
    const batchSize = 50
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (customerData, index) => {
          const rowIndex = i + index + 1
          
          try {
            // Check for existing customer by email
            let existingCustomer = null
            if (customerData.email) {
              existingCustomer = await prisma.customer.findFirst({
                where: {
                  tenantId,
                  email: customerData.email,
                },
              })
            }

            if (existingCustomer) {
              if (options?.skipDuplicates) {
                results.skipped++
                return
              }
              
              if (options?.updateExisting) {
                await prisma.customer.update({
                  where: { id: existingCustomer.id },
                  data: {
                    ...customerData,
                    name: customerData.name || `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim(),
                  },
                })
                results.updated++
                return
              }
            }

            // Create new customer
            await prisma.customer.create({
              data: {
                ...customerData,
                name: customerData.name || `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || 'Unnamed Customer',
                tenantId,
                assigneeId: user.id,
              },
            })
            results.imported++
            
          } catch (error) {
            results.errors.push({
              row: rowIndex,
              error: error instanceof Error ? error.message : 'Unknown error',
              data: customerData,
            })
          }
        })
      )
    }

    // Log import activity
    await prisma.activity.create({
      data: {
        type: 'customers_imported',
        description: `Imported ${results.imported} customers`,
        userId: user.id,
        tenantId,
        metadata: {
          imported: results.imported,
          skipped: results.skipped,
          updated: results.updated,
          errors: results.errors.length,
        },
      },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      summary: {
        total: customers.length,
        imported: results.imported,
        skipped: results.skipped,
        updated: results.updated,
        failed: results.errors.length,
      },
      errors: results.errors.slice(0, 10), // Return first 10 errors
      message: `Successfully processed ${results.imported + results.updated} customers`,
    })

  } catch (error) {
    console.error('Customer import error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid import data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to import customers' },
      { status: 500 }
    )
  }
}