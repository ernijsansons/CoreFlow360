/**
 * CoreFlow360 - Request Validation Middleware
 * Comprehensive request validation with security and performance checks
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export interface ValidationConfig {
  maxBodySize?: number        // Maximum request body size in bytes
  maxUrlLength?: number       // Maximum URL length
  maxHeaderSize?: number      // Maximum total header size
  allowedMethods?: string[]   // Allowed HTTP methods
  allowedContentTypes?: string[]  // Allowed content types
  requireContentType?: boolean    // Require Content-Type header
  maxQueryParams?: number     // Maximum number of query parameters
  maxFormFields?: number      // Maximum number of form fields
  blockedUserAgents?: RegExp[]    // Blocked user agents
  blockedIPs?: string[]       // Blocked IP addresses
  rateLimit?: {
    windowMs: number
    maxRequests: number
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  metadata?: Record<string, any>
}

// Default validation configurations for different endpoint types
export const validationConfigs = {
  public: {
    maxBodySize: 1024 * 1024,      // 1MB
    maxUrlLength: 2048,
    maxHeaderSize: 8192,           // 8KB
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    maxQueryParams: 20,
    blockedUserAgents: [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i
    ].filter(Boolean), // Remove empty entries
    requireContentType: false
  },

  api: {
    maxBodySize: 10 * 1024 * 1024, // 10MB
    maxUrlLength: 2048,
    maxHeaderSize: 16384,          // 16KB
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedContentTypes: [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ],
    maxQueryParams: 50,
    maxFormFields: 100,
    requireContentType: true
  },

  upload: {
    maxBodySize: 100 * 1024 * 1024, // 100MB
    maxUrlLength: 1024,
    maxHeaderSize: 8192,
    allowedMethods: ['POST', 'PUT', 'PATCH'],
    allowedContentTypes: [
      'multipart/form-data',
      'application/octet-stream'
    ],
    maxFormFields: 10,
    requireContentType: true
  },

  webhook: {
    maxBodySize: 5 * 1024 * 1024,  // 5MB
    maxUrlLength: 1024,
    maxHeaderSize: 16384,
    allowedMethods: ['POST'],
    allowedContentTypes: ['application/json'],
    maxQueryParams: 5,
    requireContentType: true
  }
} as const

/**
 * Validate request structure and security
 */
export async function validateRequest(
  request: NextRequest,
  config: ValidationConfig = validationConfigs.api
): Promise<ValidationResult> {
  const errors: string[] = []
  const metadata: Record<string, any> = {}

  try {
    // Validate HTTP method
    if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
      errors.push(`HTTP method ${request.method} not allowed`)
    }

    // Validate URL length
    if (config.maxUrlLength && request.url.length > config.maxUrlLength) {
      errors.push(`URL length exceeds maximum of ${config.maxUrlLength} characters`)
    }

    // Validate headers
    const totalHeaderSize = Array.from(request.headers.entries())
      .reduce((size, [key, value]) => size + key.length + value.length, 0)
    
    if (config.maxHeaderSize && totalHeaderSize > config.maxHeaderSize) {
      errors.push(`Total header size exceeds maximum of ${config.maxHeaderSize} bytes`)
    }

    // Validate Content-Type
    const contentType = request.headers.get('content-type')
    if (config.requireContentType && !contentType) {
      errors.push('Content-Type header is required')
    } else if (config.allowedContentTypes && contentType) {
      const baseContentType = contentType.split(';')[0].trim()
      if (!config.allowedContentTypes.includes(baseContentType)) {
        errors.push(`Content-Type ${baseContentType} not allowed`)
      }
    }

    // Validate query parameters
    const searchParams = new URL(request.url).searchParams
    const queryParamCount = Array.from(searchParams.keys()).length
    
    if (config.maxQueryParams && queryParamCount > config.maxQueryParams) {
      errors.push(`Too many query parameters: ${queryParamCount} > ${config.maxQueryParams}`)
    }

    metadata.queryParamCount = queryParamCount

    // Validate User-Agent
    const userAgent = request.headers.get('user-agent') || ''
    if (config.blockedUserAgents) {
      for (const blockedPattern of config.blockedUserAgents) {
        if (blockedPattern.test(userAgent)) {
          errors.push('User agent not allowed')
          break
        }
      }
    }

    // Validate IP address
    const clientIP = getClientIP(request)
    if (config.blockedIPs && config.blockedIPs.includes(clientIP)) {
      errors.push('IP address blocked')
    }

    metadata.clientIP = clientIP
    metadata.userAgent = userAgent

    // Validate body size (if present)
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const bodySize = parseInt(contentLength)
      if (config.maxBodySize && bodySize > config.maxBodySize) {
        errors.push(`Request body size exceeds maximum of ${config.maxBodySize} bytes`)
      }
      metadata.bodySize = bodySize
    }

    // Validate form data (for form submissions)
    if (contentType?.includes('multipart/form-data') || 
        contentType?.includes('application/x-www-form-urlencoded')) {
      
      try {
        const formData = await request.clone().formData()
        const fieldCount = Array.from(formData.keys()).length
        
        if (config.maxFormFields && fieldCount > config.maxFormFields) {
          errors.push(`Too many form fields: ${fieldCount} > ${config.maxFormFields}`)
        }
        
        metadata.formFieldCount = fieldCount
      } catch (error) {
        // If we can't parse form data, that's also an error
        errors.push('Invalid form data format')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      metadata
    }

  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      metadata
    }
  }
}

/**
 * Validate JSON body against schema
 */
export async function validateJsonBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ isValid: boolean; data?: T; errors?: z.ZodError }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    
    if (result.success) {
      return { isValid: true, data: result.data }
    } else {
      return { isValid: false, errors: result.error }
    }
  } catch (error) {
    return { 
      isValid: false, 
      errors: new z.ZodError([{
        code: z.ZodIssueCode.custom,
        path: [],
        message: 'Invalid JSON body'
      }])
    }
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, options: {
  maxLength?: number
  allowHtml?: boolean
  stripControlChars?: boolean
} = {}): string {
  const { maxLength = 1000, allowHtml = false, stripControlChars = true } = options
  
  let sanitized = input

  // Trim whitespace
  sanitized = sanitized.trim()

  // Strip control characters
  if (stripControlChars) {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
  }

  // Remove HTML if not allowed
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Truncate if too long
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Validate file upload
 */
export async function validateFileUpload(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    allowedExtensions?: string[]
    requireSignatureCheck?: boolean
  } = {}
): Promise<ValidationResult> {
  const errors: string[] = []
  const metadata: Record<string, any> = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    lastModified: file.lastModified
  }

  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
    requireSignatureCheck = true
  } = options

  // Validate file size
  if (file.size > maxSize) {
    errors.push(`File size ${file.size} bytes exceeds maximum ${maxSize} bytes`)
  }

  // Validate MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed`)
  }

  // Validate file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (allowedExtensions.length > 0 && (!extension || !allowedExtensions.includes(extension))) {
    errors.push(`File extension ${extension} not allowed`)
  }

  // Validate filename
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push('Invalid filename: contains path traversal characters')
  }

  // Check file signature if required
  if (requireSignatureCheck && file.size > 0) {
    try {
      const buffer = await file.slice(0, 16).arrayBuffer()
      const signature = new Uint8Array(buffer)
      
      // Basic signature validation (this would be expanded based on allowed types)
      const isValidSignature = validateFileSignature(signature, file.type)
      if (!isValidSignature) {
        errors.push('File signature does not match declared type')
      }
      
      metadata.signature = Array.from(signature.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ')
    } catch (error) {
      errors.push('Failed to read file signature')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    metadata
  }
}

/**
 * Validate file signature against declared MIME type
 */
function validateFileSignature(signature: Uint8Array, declaredType: string): boolean {
  // Common file signatures
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    'audio/mpeg': [[0xFF, 0xFB], [0xFF, 0xF3], [0xFF, 0xF2]],
    'audio/wav': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    'audio/webm': [[0x1A, 0x45, 0xDF, 0xA3]],
    'video/mp4': [[0x66, 0x74, 0x79, 0x70]]
  }

  const expectedSignatures = signatures[declaredType]
  if (!expectedSignatures) {
    return true // Unknown type, assume valid
  }

  return expectedSignatures.some(expected =>
    expected.every((byte, index) => signature[index] === byte)
  )
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return request.ip || 'unknown'
}

/**
 * Validation middleware wrapper
 */
export function withValidation(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: ValidationConfig = validationConfigs.api
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = await validateRequest(request, config)
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
          metadata: process.env.NODE_ENV === 'development' ? validation.metadata : undefined
        },
        { status: 400 }
      )
    }
    
    return handler(request)
  }
}

/**
 * Schema validation middleware
 */
export function withSchemaValidation<T>(
  handler: (req: NextRequest, data: T) => Promise<NextResponse>,
  schema: z.ZodSchema<T>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = await validateJsonBody(request, schema)
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Schema validation failed',
          details: validation.errors?.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        },
        { status: 400 }
      )
    }
    
    return handler(request, validation.data!)
  }
}