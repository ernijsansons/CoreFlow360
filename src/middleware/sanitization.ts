/**
 * CoreFlow360 - Input Sanitization Middleware
 * Provides comprehensive XSS protection and input validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { sanitizeObject, sanitizeHtml, sanitizeString } from '@/utils/security/sanitization'
import { z } from 'zod'

// Field length limits to prevent DoS attacks
const FIELD_LIMITS = {
  name: 100,
  email: 255,
  phone: 50,
  address: 500,
  company: 200,
  description: 2000,
  title: 200,
  general: 1000, // Default for unknown fields
}

// Common validation schemas
const sanitizationSchemas = {
  // String fields that should be HTML-escaped
  htmlFields: ['description', 'notes', 'message', 'content', 'bio', 'about'],
  
  // Fields that should have special characters removed
  alphanumericFields: ['code', 'slug', 'identifier'],
  
  // Fields that should be treated as plain text (no HTML)
  plainTextFields: ['name', 'firstName', 'lastName', 'company', 'title', 'address'],
}

/**
 * Sanitize input data recursively
 */
export function sanitizeInput(data: any, path: string = ''): any {
  if (data === null || data === undefined) {
    return data
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item, index) => sanitizeInput(item, `${path}[${index}]`))
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(data)) {
      const fieldPath = path ? `${path}.${key}` : key
      
      // Skip sensitive fields that shouldn't be in requests
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('secret')) {
        continue
      }
      
      sanitized[key] = sanitizeInput(value, fieldPath)
    }
    
    return sanitized
  }

  // Handle strings
  if (typeof data === 'string') {
    let sanitized = data
    
    // Get field name from path
    const fieldName = path.split('.').pop() || ''
    
    // Apply length limits
    const limit = FIELD_LIMITS[fieldName as keyof typeof FIELD_LIMITS] || FIELD_LIMITS.general
    if (sanitized.length > limit) {
      sanitized = sanitized.substring(0, limit)
    }
    
    // Remove null bytes and control characters
    sanitized = sanitizeString(sanitized)
    
    // Apply field-specific sanitization
    if (sanitizationSchemas.htmlFields.includes(fieldName)) {
      // Allow basic HTML but escape dangerous tags
      sanitized = sanitizeHtml(sanitized)
    } else if (sanitizationSchemas.alphanumericFields.includes(fieldName)) {
      // Remove non-alphanumeric characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9\-_]/g, '')
    } else if (sanitizationSchemas.plainTextFields.includes(fieldName)) {
      // Escape all HTML
      sanitized = sanitizeHtml(sanitized)
    } else {
      // Default: escape HTML
      sanitized = sanitizeHtml(sanitized)
    }
    
    return sanitized
  }

  // Return other types as-is (numbers, booleans, etc.)
  return data
}

/**
 * Middleware to sanitize request body
 */
export async function sanitizationMiddleware(request: NextRequest) {
  // Only process requests with body
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return NextResponse.next()
  }

  try {
    // Clone the request to read body
    const clonedRequest = request.clone()
    
    // Skip if no content-type or not JSON
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.next()
    }
    
    // Parse body
    let body
    try {
      body = await clonedRequest.json()
    } catch {
      // If body parsing fails, continue without modification
      return NextResponse.next()
    }
    
    // Sanitize the body
    const sanitizedBody = sanitizeInput(body)
    
    // Create new request with sanitized body
    const sanitizedRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(sanitizedBody),
    })
    
    // Copy over NextRequest specific properties
    Object.setPrototypeOf(sanitizedRequest, NextRequest.prototype)
    
    return NextResponse.next({
      request: sanitizedRequest
    })
    
  } catch (error) {
    console.error('Sanitization middleware error:', error)
    // On error, continue with original request
    return NextResponse.next()
  }
}

/**
 * Route handler wrapper for input sanitization
 */
export function withSanitization<T extends (...args: any[]) => any>(
  handler: T
): T {
  return (async (req: NextRequest, ...args: any[]) => {
    // Sanitize query parameters
    const url = new URL(req.url)
    const sanitizedParams = new URLSearchParams()
    
    url.searchParams.forEach((value, key) => {
      const sanitizedValue = sanitizeString(value)
      if (sanitizedValue.length <= 100) { // Limit query param length
        sanitizedParams.set(key, sanitizedValue)
      }
    })
    
    // Update URL with sanitized params
    url.search = sanitizedParams.toString()
    
    // For body requests, sanitize the body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        const body = await req.json()
        const sanitizedBody = sanitizeInput(body)
        
        // Create new request with sanitized data
        const sanitizedReq = new NextRequest(url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(sanitizedBody),
        })
        
        return handler(sanitizedReq, ...args)
      } catch {
        // If body parsing fails, continue with original request
      }
    }
    
    return handler(req, ...args)
  }) as T
}

/**
 * Validate and sanitize specific data types
 */
export const validators = {
  email: (email: string) => {
    const sanitized = sanitizeString(email).toLowerCase().trim()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(sanitized) ? sanitized : null
  },
  
  phone: (phone: string) => {
    const sanitized = sanitizeString(phone).replace(/[^\d\s\-\+\(\)]/g, '')
    return sanitized.length >= 10 && sanitized.length <= 20 ? sanitized : null
  },
  
  url: (url: string) => {
    try {
      const sanitized = sanitizeString(url).trim()
      const parsed = new URL(sanitized)
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null
      }
      return parsed.toString()
    } catch {
      return null
    }
  },
  
  alphanumeric: (str: string) => {
    return sanitizeString(str).replace(/[^a-zA-Z0-9]/g, '')
  },
  
  slug: (str: string) => {
    return sanitizeString(str)
      .toLowerCase()
      .replace(/[^a-z0-9\-]/g, '-')
      .replace(/\-+/g, '-')
      .replace(/^\-|\-$/g, '')
  }
}