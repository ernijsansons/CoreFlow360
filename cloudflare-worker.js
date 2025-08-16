/**
 * CoreFlow360 - Cloudflare Worker for DDoS Protection
 * 
 * Edge-based protection with advanced threat detection
 */

// Configuration
const CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Threat scoring
  BLOCK_THRESHOLD: 90,
  CAPTCHA_THRESHOLD: 60,
  CHALLENGE_THRESHOLD: 30,
  
  // API Protection
  API_RATE_LIMIT: 1000, // per hour
  API_BURST_LIMIT: 50, // per minute
  
  // Cache settings
  CACHE_TTL: 300, // 5 minutes
  
  // Suspicious patterns
  SUSPICIOUS_PATHS: [
    '/admin', '/wp-admin', '/phpmyadmin', '/.env', '/config',
    '/backup', '/.git', '/api/admin', '/graphql'
  ],
  
  // Allowed origins for CORS
  ALLOWED_ORIGINS: [
    'https://coreflow360.com',
    'https://www.coreflow360.com',
    'https://app.coreflow360.com'
  ]
}

// KV namespaces (configure in Cloudflare dashboard)
// RATE_LIMIT_KV - for rate limiting data
// BLOCKED_IPS_KV - for blocked IPs
// API_KEYS_KV - for API key validation

/**
 * Main request handler
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event))
})

/**
 * Handle incoming requests
 */
async function handleRequest(request, event) {
  try {
    // Extract request information
    const url = new URL(request.url)
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0'
    const country = request.headers.get('CF-IPCountry') || 'XX'
    const asn = request.cf?.asn || 0
    const threatScore = parseInt(request.cf?.threatScore || '0')
    
    // Check if IP is blocked
    const blockedUntil = await BLOCKED_IPS_KV.get(`blocked:${ip}`)
    if (blockedUntil && parseInt(blockedUntil) > Date.now()) {
      return blockedResponse('Your IP has been temporarily blocked')
    }
    
    // Check threat score
    if (threatScore >= CONFIG.BLOCK_THRESHOLD) {
      await blockIP(ip, 3600000) // Block for 1 hour
      return blockedResponse('Access denied due to high threat score')
    }
    
    // Rate limiting check
    const rateLimit = await checkRateLimit(ip, url.pathname)
    if (!rateLimit.allowed) {
      if (rateLimit.shouldBlock) {
        await blockIP(ip, 300000) // Block for 5 minutes
      }
      return rateLimitResponse()
    }
    
    // Check for suspicious patterns
    const suspiciousCheck = checkSuspiciousPatterns(request, url)
    if (suspiciousCheck.block) {
      await logSecurityEvent('suspicious_pattern', { ip, pattern: suspiciousCheck.pattern })
      return blockedResponse('Suspicious activity detected')
    }
    
    // API key validation for API routes
    if (url.pathname.startsWith('/api/')) {
      const apiCheck = await validateAPIRequest(request, ip)
      if (!apiCheck.valid) {
        return new Response(JSON.stringify({ error: apiCheck.error }), {
          status: apiCheck.status || 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    // Challenge based on threat score
    if (threatScore >= CONFIG.CAPTCHA_THRESHOLD) {
      return captchaChallenge()
    }
    
    if (threatScore >= CONFIG.CHALLENGE_THRESHOLD) {
      return jsChallenge()
    }
    
    // Add security headers and forward request
    const response = await fetch(request)
    return addSecurityHeaders(response)
    
  } catch (error) {
    console.error('Worker error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

/**
 * Check rate limiting
 */
async function checkRateLimit(ip, path) {
  const now = Date.now()
  const windowStart = now - CONFIG.RATE_LIMIT_WINDOW
  const key = `rate:${ip}`
  
  // Get current request log
  const requestLog = await RATE_LIMIT_KV.get(key, 'json') || []
  
  // Filter requests within window
  const recentRequests = requestLog.filter(timestamp => timestamp > windowStart)
  
  // Check if limit exceeded
  if (recentRequests.length >= CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      shouldBlock: recentRequests.length > CONFIG.RATE_LIMIT_MAX_REQUESTS * 1.5
    }
  }
  
  // Add current request
  recentRequests.push(now)
  
  // Update KV store
  await RATE_LIMIT_KV.put(key, JSON.stringify(recentRequests), {
    expirationTtl: 300 // 5 minutes
  })
  
  return { allowed: true }
}

/**
 * Check for suspicious patterns
 */
function checkSuspiciousPatterns(request, url) {
  // Check suspicious paths
  for (const path of CONFIG.SUSPICIOUS_PATHS) {
    if (url.pathname.includes(path)) {
      return { block: true, pattern: `suspicious_path:${path}` }
    }
  }
  
  // Check suspicious query parameters
  const query = url.searchParams.toString().toLowerCase()
  const suspiciousQueries = ['union select', 'script>', '../..', 'etc/passwd']
  
  for (const pattern of suspiciousQueries) {
    if (query.includes(pattern)) {
      return { block: true, pattern: `suspicious_query:${pattern}` }
    }
  }
  
  // Check suspicious headers
  const userAgent = request.headers.get('User-Agent') || ''
  const suspiciousAgents = ['sqlmap', 'nikto', 'havij', 'acunetix']
  
  for (const agent of suspiciousAgents) {
    if (userAgent.toLowerCase().includes(agent)) {
      return { block: true, pattern: `suspicious_agent:${agent}` }
    }
  }
  
  return { block: false }
}

/**
 * Validate API requests
 */
async function validateAPIRequest(request, ip) {
  // Check for API key
  const apiKey = request.headers.get('X-API-Key')
  if (!apiKey) {
    return { valid: false, error: 'API key required', status: 401 }
  }
  
  // Validate API key
  const keyData = await API_KEYS_KV.get(`key:${apiKey}`, 'json')
  if (!keyData || !keyData.active) {
    return { valid: false, error: 'Invalid API key', status: 401 }
  }
  
  // Check API rate limits
  const now = Date.now()
  const hourlyKey = `api:hour:${apiKey}`
  const minuteKey = `api:minute:${apiKey}`
  
  // Check hourly limit
  const hourlyCount = parseInt(await RATE_LIMIT_KV.get(hourlyKey) || '0')
  if (hourlyCount >= CONFIG.API_RATE_LIMIT) {
    return { valid: false, error: 'API rate limit exceeded', status: 429 }
  }
  
  // Check burst limit
  const minuteCount = parseInt(await RATE_LIMIT_KV.get(minuteKey) || '0')
  if (minuteCount >= CONFIG.API_BURST_LIMIT) {
    return { valid: false, error: 'API burst limit exceeded', status: 429 }
  }
  
  // Update counters
  await RATE_LIMIT_KV.put(hourlyKey, (hourlyCount + 1).toString(), {
    expirationTtl: 3600
  })
  await RATE_LIMIT_KV.put(minuteKey, (minuteCount + 1).toString(), {
    expirationTtl: 60
  })
  
  return { valid: true }
}

/**
 * Block an IP address
 */
async function blockIP(ip, duration) {
  const until = Date.now() + duration
  await BLOCKED_IPS_KV.put(`blocked:${ip}`, until.toString(), {
    expirationTtl: Math.ceil(duration / 1000)
  })
  await logSecurityEvent('ip_blocked', { ip, until })
}

/**
 * Log security events
 */
async function logSecurityEvent(type, data) {
  const event = {
    type,
    timestamp: new Date().toISOString(),
    ...data
  }
  
  // In production, send to logging service
  console.log('Security Event:', event)
}

/**
 * Response generators
 */
function blockedResponse(message) {
  return new Response(message, {
    status: 403,
    headers: {
      'Content-Type': 'text/plain',
      'X-Blocked-Reason': message
    }
  })
}

function rateLimitResponse() {
  return new Response('Too Many Requests', {
    status: 429,
    headers: {
      'Content-Type': 'text/plain',
      'Retry-After': '60',
      'X-RateLimit-Limit': CONFIG.RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Window': CONFIG.RATE_LIMIT_WINDOW.toString()
    }
  })
}

function jsChallenge() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Just a moment...</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
    .spinner { border: 3px solid #f3f3f3; border-radius: 50%; 
               border-top: 3px solid #3498db; width: 50px; height: 50px;
               animation: spin 2s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <h2>Checking your browser...</h2>
  <div class="spinner"></div>
  <p>This process is automatic. Your browser will redirect shortly.</p>
  <script>
    setTimeout(() => {
      // Simple challenge - in production use more sophisticated methods
      const answer = btoa(Date.now().toString()).substr(0, 8);
      document.cookie = 'cf_clearance=' + answer + '; path=/';
      window.location.reload();
    }, 3000);
  </script>
</body>
</html>
  `
  
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html' }
  })
}

function captchaChallenge() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Security Check</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
  </style>
</head>
<body>
  <h2>Security Verification Required</h2>
  <p>Please complete the security check to continue.</p>
  <div id="captcha-container">
    <!-- Cloudflare Turnstile or hCaptcha integration -->
    <p style="color: red;">CAPTCHA integration pending</p>
  </div>
</body>
</html>
  `
  
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html' }
  })
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response) {
  const headers = new Headers(response.headers)
  
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CORS headers for allowed origins
  const origin = headers.get('Origin')
  if (CONFIG.ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}