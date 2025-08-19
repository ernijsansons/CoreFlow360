/**
 * CoreFlow360 - Redoc API Documentation
 * Alternative API documentation with Redoc
 */

import { NextRequest, NextResponse } from 'next/server'
import { openAPISpec } from '@/lib/api-docs/openapi'

// Redoc HTML template
const getRedocHTML = (specUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>CoreFlow360 API Reference</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Inter:300,400,600,700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #redoc-container {
      position: relative;
    }
    .api-header {
      background: linear-gradient(135deg, #3f51b5 0%, #1976d2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .api-header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 600;
    }
    .api-header p {
      margin: 0.5rem 0 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }
    .version-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div id="redoc-container">
    <div class="api-header">
      <h1>CoreFlow360 API</h1>
      <p>AI-Powered Multi-Industry CRM Platform</p>
      <span class="version-badge">v1.0.0</span>
    </div>
    <redoc spec-url="${specUrl}" 
           hide-download-button
           theme='{
             "colors": {
               "primary": {
                 "main": "#3f51b5"
               }
             },
             "typography": {
               "fontSize": "15px",
               "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
               "code": {
                 "fontFamily": "Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace"
               }
             },
             "sidebar": {
               "backgroundColor": "#fafafa",
               "textColor": "#333"
             }
           }'></redoc>
  </div>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
`

/**
 * GET /api/docs/redoc
 * Serves the Redoc documentation interface
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

  // Return Redoc HTML
  const html = getRedocHTML(`${baseUrl}/api/docs?format=json`)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
