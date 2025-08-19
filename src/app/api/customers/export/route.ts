/**
 * Customer Export API
 * GET /api/customers/export
 * Export customers to CSV/JSON format
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { CustomerStatus } from '@prisma/client'

const querySchema = z.object({
  format: z.enum(['json', 'csv']).optional().default('json'),
  status: z.nativeEnum(CustomerStatus).optional(),
  includeDeals: z.string().optional().default('false').transform(val => val === 'true'),
  includeInvoices: z.string().optional().default('false').transform(val => val === 'true'),
})

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const { format, status, includeDeals, includeInvoices } = querySchema.parse(searchParams)

    // Build query
    const where: any = {
      tenantId,
      ...(status && { status }),
    }

    // Fetch customers with optional relations
    const customers = await prisma.customer.findMany({
      where,
      include: {
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        ...(includeDeals && {
          deals: {
            select: {
              id: true,
              title: true,
              value: true,
              stage: true,
              createdAt: true,
            },
          },
        }),
        ...(includeInvoices && {
          invoices: {
            select: {
              id: true,
              number: true,
              amount: true,
              status: true,
              dueDate: true,
              paidDate: true,
            },
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format data for export
    const exportData = customers.map(customer => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      industry: customer.industry,
      address: customer.address,
      status: customer.status,
      source: customer.source,
      totalRevenue: customer.totalRevenue,
      aiScore: customer.aiScore,
      aiChurnRisk: customer.aiChurnRisk,
      aiLifetimeValue: customer.aiLifetimeValue,
      assigneeName: customer.assignee?.name,
      assigneeEmail: customer.assignee?.email,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      ...(includeDeals && {
        dealsCount: customer.deals?.length || 0,
        totalDealsValue: customer.deals?.reduce((sum, deal) => sum + deal.value, 0) || 0,
      }),
      ...(includeInvoices && {
        invoicesCount: customer.invoices?.length || 0,
        totalInvoiced: customer.invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0,
        paidInvoices: customer.invoices?.filter(inv => inv.status === 'PAID').length || 0,
      }),
    }))

    // Log export activity
    await prisma.activity.create({
      data: {
        type: 'customers_exported',
        description: `Exported ${customers.length} customers`,
        userId: user.id,
        tenantId,
        metadata: {
          format,
          count: customers.length,
          filters: { status },
        },
      },
    }).catch(console.error)

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(exportData[0] || {})
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value ?? ''
          }).join(',')
        ),
      ]
      
      const csv = csvRows.join('\n')
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Return JSON
    return NextResponse.json({
      customers: exportData,
      metadata: {
        count: exportData.length,
        exportedAt: new Date().toISOString(),
        filters: { status },
      },
    })

  } catch (error) {
    console.error('Customer export error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid export parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to export customers' },
      { status: 500 }
    )
  }
}