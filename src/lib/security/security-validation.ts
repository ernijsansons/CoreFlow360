/**
 * CoreFlow360 - Security Validation Utilities
 * Comprehensive input validation and security checks for production safety
 */

import crypto from 'crypto'
import { z } from 'zod'

// Input validation schemas
export const SecuritySchemas = {
  // Tenant ID validation
  tenantId: z.string()
    .min(3, 'Tenant ID must be at least 3 characters')
    .max(50, 'Tenant ID must be at most 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Tenant ID contains invalid characters'),

  // User ID validation
  userId: z.string()
    .min(3, 'User ID must be at least 3 characters')
    .max(50, 'User ID must be at most 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'User ID contains invalid characters'),

  // API key validation
  apiKey: z.string()
    .min(20, 'API key too short')
    .max(200, 'API key too long')
    .regex(/^cf360_[a-zA-Z0-9-_]+$/, 'Invalid API key format'),

  // Email validation
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .transform(email => email.toLowerCase().trim()),

  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),

  // URL validation
  url: z.string()
    .url('Invalid URL format')
    .max(2048, 'URL too long')
    .refine(url => {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    }, 'Only HTTP(S) URLs allowed'),

  // SQL identifier validation
  sqlIdentifier: z.string()
    .min(1, 'Identifier cannot be empty')
    .max(63, 'Identifier too long')
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid SQL identifier'),

  // File path validation
  filePath: z.string()
    .min(1, 'File path cannot be empty')
    .max(4096, 'File path too long')
    .refine(path => {
      // Prevent directory traversal
      return !path.includes('../') && 
             !path.includes('..\\') && 
             !path.startsWith('/') &&
             !path.includes('\0')
    }, 'Invalid file path'),

  // JSON Web Token validation
  jwt: z.string()
    .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, 'Invalid JWT format'),

  // IP address validation
  ipAddress: z.string()
    .refine(ip => {
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      return ipv4Regex.test(ip) || ipv6Regex.test(ip)
    }, 'Invalid IP address format'),
}

// SQL injection prevention
export class SQLSecurityValidator {
  private static readonly DANGEROUS_PATTERNS = [
    /('|(\\\')|("|(\\\")|(`|(\\`))/gi, // Quote characters
    /(;|--|\/\*|\*\/)/gi, // SQL terminators and comments
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UNION|UPDATE)\b)/gi, // SQL keywords
    /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR|ONCLICK)\b)/gi, // Script injection
  ]

  static validateQuery(query: string): { valid: boolean; reason?: string } {
    if (!query || typeof query !== 'string') {
      return { valid: false, reason: 'Query must be a non-empty string' }
    }

    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(query)) {
        return { valid: false, reason: 'Query contains potentially dangerous patterns' }
      }
    }

    return { valid: true }
  }

  static escapeIdentifier(identifier: string): string {
    // Remove any characters that aren't alphanumeric or underscore
    return identifier.replace(/[^a-zA-Z0-9_]/g, '')
  }

  static validateTableName(tableName: string): boolean {
    const schema = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    return schema.safeParse(tableName).success
  }

  static validateColumnName(columnName: string): boolean {
    const schema = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    return schema.safeParse(columnName).success
  }
}

// XSS prevention
export class XSSSecurityValidator {
  private static readonly DANGEROUS_HTML_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*>/gi,
    /<link\b[^<]*>/gi,
    /<meta\b[^<]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi, // Event handlers
  ]

  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  }

  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') return ''

    // Remove dangerous patterns
    let sanitized = input
    for (const pattern of this.DANGEROUS_HTML_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }

    // Encode HTML entities
    return sanitized.replace(/[&<>"'`=/]/g, char => this.HTML_ENTITIES[char] || char)
  }

  static validateHTML(html: string): { valid: boolean; reason?: string } {
    if (!html || typeof html !== 'string') {
      return { valid: false, reason: 'HTML must be a non-empty string' }
    }

    for (const pattern of this.DANGEROUS_HTML_PATTERNS) {
      if (pattern.test(html)) {
        return { valid: false, reason: 'HTML contains potentially dangerous patterns' }
      }
    }

    return { valid: true }
  }

  static stripTags(input: string): string {
    return input.replace(/<[^>]*>/g, '')
  }
}

// Path traversal prevention
export class PathSecurityValidator {
  private static readonly DANGEROUS_PATH_PATTERNS = [
    /\.\./g, // Directory traversal
    /\0/g, // Null byte
    /[<>:"|?*]/g, // Windows invalid characters
    /^\/+/g, // Leading slashes (absolute paths)
    /\\+/g, // Backslashes
  ]

  static validatePath(path: string): { valid: boolean; reason?: string } {
    if (!path || typeof path !== 'string') {
      return { valid: false, reason: 'Path must be a non-empty string' }
    }

    for (const pattern of this.DANGEROUS_PATH_PATTERNS) {
      if (pattern.test(path)) {
        return { valid: false, reason: 'Path contains dangerous patterns' }
      }
    }

    // Additional checks
    if (path.length > 4096) {
      return { valid: false, reason: 'Path too long' }
    }

    if (path.startsWith('/') || path.includes('C:') || path.includes('\\\\')) {
      return { valid: false, reason: 'Absolute paths not allowed' }
    }

    return { valid: true }
  }

  static sanitizePath(path: string): string {
    // Remove dangerous characters and patterns
    let sanitized = path
    for (const pattern of this.DANGEROUS_PATH_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }
    
    // Normalize path separators
    sanitized = sanitized.replace(/[\\\/]+/g, '/')
    
    // Remove leading/trailing slashes
    sanitized = sanitized.replace(/^\/+|\/+$/g, '')
    
    return sanitized
  }
}

// Command injection prevention
export class CommandSecurityValidator {
  private static readonly DANGEROUS_COMMAND_PATTERNS = [
    /[;&|`$(){}[\]\\]/g, // Shell metacharacters
    /\b(rm|del|format|fdisk|mkfs|shutdown|reboot|halt|poweroff)\b/gi, // Dangerous commands
    /\b(curl|wget|nc|netcat|telnet|ssh|ftp)\b/gi, // Network commands
    /\b(eval|exec|system|passthru|shell_exec)\b/gi, // Execution functions
  ]

  static validateCommand(command: string): { valid: boolean; reason?: string } {
    if (!command || typeof command !== 'string') {
      return { valid: false, reason: 'Command must be a non-empty string' }
    }

    for (const pattern of this.DANGEROUS_COMMAND_PATTERNS) {
      if (pattern.test(command)) {
        return { valid: false, reason: 'Command contains dangerous patterns' }
      }
    }

    return { valid: true }
  }

  static sanitizeCommand(command: string): string {
    // Remove all dangerous characters
    return command.replace(/[;&|`$(){}[\]\\]/g, '')
  }
}

// Cryptographic validation
export class CryptoSecurityValidator {
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length)
      password += charset[randomIndex]
    }
    
    return password
  }

  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512').toString('hex')
    return { hash, salt: actualSalt }
  }

  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const expectedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))
  }

  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('base64url')
  }

  static validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) return false
    return crypto.timingSafeEqual(
      Buffer.from(token, 'base64url'),
      Buffer.from(expectedToken, 'base64url')
    )
  }

  static generateAPIKey(tenantId: string): string {
    const random = crypto.randomBytes(16).toString('hex')
    const secret = process.env.API_KEY_SECRET || 'fallback-secret'
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`cf360_${tenantId}_${random}`)
      .digest('hex')
      .substring(0, 16)
    
    return `cf360_${tenantId}_${random}_${signature}`
  }

  static validateAPIKey(apiKey: string): { valid: boolean; tenantId?: string } {
    try {
      const result = SecuritySchemas.apiKey.safeParse(apiKey)
      if (!result.success) return { valid: false }

      const parts = apiKey.split('_')
      if (parts.length !== 4) return { valid: false }

      const [prefix, tenantId, random, signature] = parts
      const secret = process.env.API_KEY_SECRET || 'fallback-secret'
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${prefix}_${tenantId}_${random}`)
        .digest('hex')
        .substring(0, 16)

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )

      return { valid: isValid, tenantId: isValid ? tenantId : undefined }
    } catch (error) {
      return { valid: false }
    }
  }
}

// Rate limiting validation
export class RateLimitSecurityValidator {
  private static readonly DEFAULT_WINDOWS = {
    STRICT: 60 * 1000, // 1 minute
    MODERATE: 5 * 60 * 1000, // 5 minutes
    RELAXED: 15 * 60 * 1000, // 15 minutes
  }

  private static readonly DEFAULT_LIMITS = {
    AUTH: 5, // 5 attempts per window
    API: 100, // 100 requests per window
    UPLOAD: 10, // 10 uploads per window
    EXPORT: 3, // 3 exports per window
  }

  static calculateRemainingTime(lastAttempt: number, windowMs: number): number {
    const now = Date.now()
    const windowEnd = lastAttempt + windowMs
    return Math.max(0, windowEnd - now)
  }

  static shouldApplyBackoff(attemptCount: number, maxAttempts: number): boolean {
    return attemptCount >= maxAttempts
  }

  static calculateBackoffDelay(attemptCount: number): number {
    const baseDelay = 1000 // 1 second
    const maxDelay = 60000 // 1 minute
    return Math.min(baseDelay * Math.pow(2, attemptCount), maxDelay)
  }
}

// Comprehensive security validator
export class ComprehensiveSecurityValidator {
  static validateInput(input: unknown, type: keyof typeof SecuritySchemas): { valid: boolean; data?: any; error?: string } {
    try {
      const schema = SecuritySchemas[type]
      const result = schema.safeParse(input)
      
      if (result.success) {
        return { valid: true, data: result.data }
      } else {
        return { 
          valid: false, 
          error: result.error.errors.map(e => e.message).join(', ') 
        }
      }
    } catch (error) {
      return { valid: false, error: 'Validation error' }
    }
  }

  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = {} as T
    
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = XSSSecurityValidator.sanitizeHTML(key)
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey as keyof T] = XSSSecurityValidator.sanitizeHTML(value) as T[keyof T]
      } else if (Array.isArray(value)) {
        sanitized[sanitizedKey as keyof T] = value.map(item => 
          typeof item === 'string' ? XSSSecurityValidator.sanitizeHTML(item) : item
        ) as T[keyof T]
      } else if (value && typeof value === 'object') {
        sanitized[sanitizedKey as keyof T] = this.sanitizeObject(value)
      } else {
        sanitized[sanitizedKey as keyof T] = value
      }
    }
    
    return sanitized
  }

  static validateAndSanitize(input: unknown, type: keyof typeof SecuritySchemas): { valid: boolean; data?: any; error?: string } {
    // First validate
    const validation = this.validateInput(input, type)
    if (!validation.valid) {
      return validation
    }

    // Then sanitize if it's a string
    if (typeof validation.data === 'string') {
      return {
        valid: true,
        data: XSSSecurityValidator.sanitizeHTML(validation.data)
      }
    }

    return validation
  }
}

// Export utility functions
export {
  SQLSecurityValidator as SQLValidator,
  XSSSecurityValidator as XSSValidator,
  PathSecurityValidator as PathValidator,
  CommandSecurityValidator as CommandValidator,
  CryptoSecurityValidator as CryptoValidator,
  RateLimitSecurityValidator as RateLimitValidator,
  ComprehensiveSecurityValidator as SecurityValidator,
}