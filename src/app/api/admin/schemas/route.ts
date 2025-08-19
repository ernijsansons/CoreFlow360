/**
 * CoreFlow360 - API Schema Management
 * Admin endpoint for managing API schemas and evolution
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { withSignatureValidation } from '@/middleware/request-signature'
import { schemaRegistry } from '@/lib/api/schema-registry'

async function getHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:schemas')

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    const method = searchParams.get('method')
    const version = searchParams.get('version')
    const action = searchParams.get('action') || 'list'

    switch (action) {
      case 'list':
        return handleListSchemas(endpoint, method)

      case 'get':
        return handleGetSchema(endpoint!, method!, version)

      case 'versions':
        return handleGetVersions(endpoint!, method!)

      case 'evolution':
        return handleGetEvolution(endpoint!, method!)

      case 'compatibility':
        const fromVersion = searchParams.get('from')
        const toVersion = searchParams.get('to')
        return handleCheckCompatibility(endpoint!, method!, fromVersion!, toVersion!)

      case 'openapi':
        return handleGenerateOpenAPI()

      case 'stats':
        return handleGetStatistics()

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to process schema request' }, { status: 500 })
  }
}

async function postHandler(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission('admin:schemas')

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'register':
        return handleRegisterSchema(data)

      case 'validate':
        return handleValidateData(data)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json({ error: 'Failed to process schema request' }, { status: 500 })
  }
}

async function handleListSchemas(endpoint?: string, method?: string) {
  const schemas = new Map()

  // This is a simplified implementation - in production, you'd iterate through the registry
  const mockSchemas = [
    { endpoint: '/api/customers', method: 'GET', version: '1.0.0', description: 'List customers' },
    {
      endpoint: '/api/customers',
      method: 'POST',
      version: '1.0.0',
      description: 'Create customer',
    },
    {
      endpoint: '/api/customers/{id}',
      method: 'GET',
      version: '1.0.0',
      description: 'Get customer',
    },
    {
      endpoint: '/api/admin/webhook-dlq/metrics',
      method: 'GET',
      version: '1.0.0',
      description: 'DLQ metrics',
    },
    {
      endpoint: '/api/subscriptions/current',
      method: 'GET',
      version: '1.0.0',
      description: 'Current subscription',
    },
  ]

  let filteredSchemas = mockSchemas

  if (endpoint) {
    filteredSchemas = filteredSchemas.filter((s) => s.endpoint === endpoint)
  }

  if (method) {
    filteredSchemas = filteredSchemas.filter((s) => s.method.toLowerCase() === method.toLowerCase())
  }

  return NextResponse.json({
    success: true,
    schemas: filteredSchemas,
    total: filteredSchemas.length,
  })
}

async function handleGetSchema(endpoint: string, method: string, version?: string) {
  const schema = schemaRegistry.getSchema(endpoint, method, version)

  if (!schema) {
    return NextResponse.json({ error: 'Schema not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    schema: {
      version: schema.version,
      endpoint: schema.endpoint,
      method: schema.method,
      deprecated: schema.deprecated,
      deprecationDate: schema.deprecationDate,
      replacementEndpoint: schema.replacementEndpoint,
      breaking: schema.breaking,
      description: schema.description,
      examples: schema.examples,
      metadata: schema.metadata,
    },
  })
}

async function handleGetVersions(endpoint: string, method: string) {
  const versions = schemaRegistry.getVersions(endpoint, method)

  return NextResponse.json({
    success: true,
    endpoint,
    method,
    versions,
    latest: versions[0] || null,
  })
}

async function handleGetEvolution(endpoint: string, method: string) {
  const evolution = schemaRegistry.getEvolutionHistory(endpoint, method)

  return NextResponse.json({
    success: true,
    endpoint,
    method,
    evolution,
  })
}

async function handleCheckCompatibility(
  endpoint: string,
  method: string,
  fromVersion: string,
  toVersion: string
) {
  const issues = schemaRegistry.checkCompatibility(endpoint, method, fromVersion, toVersion)

  const breaking = issues.some((issue) => issue.type === 'breaking')
  const warnings = issues.filter((issue) => issue.type === 'warning')

  return NextResponse.json({
    success: true,
    compatible: !breaking,
    breaking,
    issues,
    summary: {
      breaking: issues.filter((i) => i.type === 'breaking').length,
      warnings: warnings.length,
      info: issues.filter((i) => i.type === 'info').length,
    },
  })
}

async function handleGenerateOpenAPI() {
  const spec = schemaRegistry.generateOpenAPISpec()

  return NextResponse.json({
    success: true,
    spec,
  })
}

async function handleGetStatistics() {
  const stats = schemaRegistry.getStatistics()

  return NextResponse.json({
    success: true,
    statistics: stats,
  })
}

async function handleRegisterSchema(data: unknown) {
  try {
    // Validate required fields
    if (!data.version || !data.endpoint || !data.method) {
      return NextResponse.json(
        { error: 'Missing required fields: version, endpoint, method' },
        { status: 400 }
      )
    }

    schemaRegistry.registerSchema(data)

    return NextResponse.json({
      success: true,
      message: 'Schema registered successfully',
      schema: {
        version: data.version,
        endpoint: data.endpoint,
        method: data.method,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to register schema: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleValidateData(data: unknown) {
  try {
    const { endpoint, method, payload, type, version } = data

    if (!endpoint || !method || !payload || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: endpoint, method, payload, type' },
        { status: 400 }
      )
    }

    const result = schemaRegistry.validateData(endpoint, method, payload, type, version)

    return NextResponse.json({
      success: true,
      validation: result,
    })
  } catch (error) {
    return NextResponse.json({ error: `Validation failed: ${error.message}` }, { status: 400 })
  }
}

// Apply high security signature validation to schema management endpoints
export const GET = withSignatureValidation(getHandler, {
  highSecurity: true,
  skipInDevelopment: false,
})

export const POST = withSignatureValidation(postHandler, {
  highSecurity: true,
  skipInDevelopment: false,
})
