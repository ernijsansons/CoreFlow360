/**
 * CoreFlow360 - API Landing Page
 * Provides links to API documentation and resources
 */

import { NextRequest, NextResponse } from 'next/server'
import { withShutdownHandling } from '@/lib/server-config'

const getAPILandingHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CoreFlow360 API</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .header {
      background: linear-gradient(135deg, #3f51b5 0%, #1976d2 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
      border-radius: 8px;
      margin-bottom: 3rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .header p {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .card h2 {
      color: #3f51b5;
      margin-bottom: 1rem;
    }
    
    .card p {
      margin-bottom: 1.5rem;
      color: #666;
    }
    
    .card a {
      display: inline-block;
      background: #3f51b5;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      transition: background 0.2s;
    }
    
    .card a:hover {
      background: #303f9f;
    }
    
    .info {
      background: #e3f2fd;
      border-left: 4px solid #3f51b5;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      margin-bottom: 2rem;
    }
    
    .info h3 {
      color: #1976d2;
      margin-bottom: 0.5rem;
    }
    
    .endpoints {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .endpoints h2 {
      color: #3f51b5;
      margin-bottom: 1.5rem;
    }
    
    .endpoint-group {
      margin-bottom: 1.5rem;
    }
    
    .endpoint-group h3 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }
    
    .endpoint-list {
      list-style: none;
      padding-left: 1rem;
    }
    
    .endpoint-list li {
      padding: 0.25rem 0;
      color: #666;
    }
    
    .endpoint-list code {
      background: #f5f5f5;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: Consolas, Monaco, monospace;
      font-size: 0.9rem;
    }
    
    .method {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 3px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-right: 0.5rem;
      text-transform: uppercase;
    }
    
    .method.get { background: #61affe; color: white; }
    .method.post { background: #49cc90; color: white; }
    .method.put { background: #fca130; color: white; }
    .method.delete { background: #f93e3e; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CoreFlow360 API</h1>
      <p>AI-Powered Multi-Industry CRM Platform</p>
    </div>
    
    <div class="info">
      <h3>Getting Started</h3>
      <p>Welcome to the CoreFlow360 API. Choose your preferred documentation format below to explore our endpoints.</p>
    </div>
    
    <div class="cards">
      <div class="card">
        <h2>Swagger UI</h2>
        <p>Interactive API documentation with a built-in testing interface. Try out endpoints directly from your browser.</p>
        <a href="/api/docs">Open Swagger UI →</a>
      </div>
      
      <div class="card">
        <h2>Redoc</h2>
        <p>Clean, responsive API reference documentation. Perfect for reading and understanding the API structure.</p>
        <a href="/api/docs/redoc">Open Redoc →</a>
      </div>
      
      <div class="card">
        <h2>OpenAPI Spec</h2>
        <p>Download the raw OpenAPI 3.0 specification in JSON format for use with your own tools.</p>
        <a href="/api/docs?format=json" download>Download JSON →</a>
      </div>
    </div>
    
    <div class="endpoints">
      <h2>Available Endpoints</h2>
      
      <div class="endpoint-group">
        <h3>Authentication</h3>
        <ul class="endpoint-list">
          <li><span class="method post">POST</span><code>/api/auth/register</code> - Register new user</li>
          <li><span class="method post">POST</span><code>/api/auth/login</code> - User login</li>
          <li><span class="method post">POST</span><code>/api/auth/logout</code> - User logout</li>
        </ul>
      </div>
      
      <div class="endpoint-group">
        <h3>Freemium Management</h3>
        <ul class="endpoint-list">
          <li><span class="method get">GET</span><code>/api/freemium/status</code> - Get subscription status</li>
          <li><span class="method post">POST</span><code>/api/freemium/select-agent</code> - Select AI agent</li>
          <li><span class="method post">POST</span><code>/api/freemium/track-usage</code> - Track feature usage</li>
        </ul>
      </div>
      
      <div class="endpoint-group">
        <h3>Customer Management</h3>
        <ul class="endpoint-list">
          <li><span class="method get">GET</span><code>/api/customers</code> - List customers</li>
          <li><span class="method post">POST</span><code>/api/customers</code> - Create customer</li>
          <li><span class="method get">GET</span><code>/api/customers/{id}</code> - Get customer</li>
          <li><span class="method put">PUT</span><code>/api/customers/{id}</code> - Update customer</li>
          <li><span class="method delete">DELETE</span><code>/api/customers/{id}</code> - Delete customer</li>
        </ul>
      </div>
      
      <div class="endpoint-group">
        <h3>Analytics & Metrics</h3>
        <ul class="endpoint-list">
          <li><span class="method get">GET</span><code>/api/metrics/live</code> - Live performance metrics</li>
          <li><span class="method get">GET</span><code>/api/dashboard/executive</code> - Executive dashboard</li>
          <li><span class="method post">POST</span><code>/api/conversion/track</code> - Track conversions</li>
        </ul>
      </div>
      
      <div class="endpoint-group">
        <h3>Real-time Updates</h3>
        <ul class="endpoint-list">
          <li><span class="method get">GET</span><code>/api/ws</code> - WebSocket connection</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>
`

/**
 * GET /api
 * API landing page with links to documentation
 */
export const GET = withShutdownHandling(async (request: NextRequest) => {
  return new NextResponse(getAPILandingHTML(), {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    }
  })
})