/**
 * CoreFlow360 - API Documentation Route
 * Serves OpenAPI/Swagger documentation
 */

import { NextRequest, NextResponse } from 'next/server'
import { openAPISpec } from '@/lib/api-docs/openapi'

// Swagger UI HTML template
const getSwaggerHTML = (specUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CoreFlow360 API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      display: none;
    }
    .swagger-ui .info {
      margin: 20px 0;
    }
    .swagger-ui .info .title {
      color: #3f51b5;
    }
    .swagger-ui .scheme-container {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        validatorUrl: null
      });
    }
  </script>
</body>
</html>
`

// API routes that should be excluded from documentation in production
const EXCLUDED_ROUTES_PRODUCTION = ['/api/super-admin', '/api/test', '/api/debug']

/**
 * GET /api/docs
 * Serves the Swagger UI documentation
 */
export async function GET(request: NextRequest) {
  // Check if docs are enabled
  const docsEnabled = process.env.ENABLE_API_DOCS !== 'false'

  if (!docsEnabled && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'API documentation is disabled' }, { status: 404 })
  }

  // Get the host URL
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  // Check for JSON format request
  const acceptHeader = request.headers.get('accept') || ''
  const isJsonRequest =
    acceptHeader.includes('application/json') ||
    request.nextUrl.searchParams.get('format') === 'json'

  if (isJsonRequest) {
    // Return the OpenAPI spec as JSON
    const spec = { ...openAPISpec }

    // Filter out excluded routes in production
    if (process.env.NODE_ENV === 'production') {
      spec.paths = Object.fromEntries(
        Object.entries(spec.paths).filter(
          ([path]) => !EXCLUDED_ROUTES_PRODUCTION.some((excluded) => path.startsWith(excluded))
        )
      )
    }

    // Update server URL
    spec.servers[0].url = `${baseUrl}`

    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Return Swagger UI HTML
  const html = getSwaggerHTML(`${baseUrl}/api/docs?format=json`)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

/**
 * OPTIONS /api/docs
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  })
}
