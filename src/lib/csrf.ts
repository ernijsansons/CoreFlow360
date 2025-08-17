/**
 * CoreFlow360 - CSRF Protection
 * Generates and validates CSRF tokens for secure state-changing operations
 */

import * as crypto from 'crypto'
import { cookies } from 'next/headers'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = '__Host-csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export interface CSRFTokenPair {
  token: string
  cookieValue: string
}

/**
 * Generate a secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Create a CSRF token pair (token and hashed cookie value)
 */
export function createCSRFTokenPair(secret: string): CSRFTokenPair {
  const token = generateCSRFToken()
  const cookieValue = crypto
    .createHmac('sha256', secret)
    .update(token)
    .digest('hex')
  
  return { token, cookieValue }
}

/**
 * Validate a CSRF token against the cookie value
 */
export function validateCSRFToken(
  token: string | null,
  cookieValue: string | null,
  secret: string
): boolean {
  if (!token || !cookieValue) return false
  
  const expectedCookieValue = crypto
    .createHmac('sha256', secret)
    .update(token)
    .digest('hex')
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieValue),
    Buffer.from(expectedCookieValue)
  )
}

/**
 * Set CSRF cookie with secure options
 */
export async function setCSRFCookie(cookieValue: string) {
  const cookieStore = await cookies()
  
  cookieStore.set(CSRF_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    // Use __Host- prefix for additional security in production
    ...(process.env.NODE_ENV === 'production' && {
      domain: undefined, // Required for __Host- prefix
    })
  })
}

/**
 * Get CSRF cookie value
 */
export async function getCSRFCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromHeaders(headers: Headers): string | null {
  return headers.get(CSRF_HEADER_NAME)
}

/**
 * Middleware to validate CSRF tokens for state-changing operations
 */
export async function validateCSRFMiddleware(
  request: Request,
  secret: string = process.env.API_KEY_SECRET || 'default-secret'
): Promise<boolean> {
  // Skip CSRF validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true
  }
  
  const token = getCSRFTokenFromHeaders(request.headers)
  const cookieValue = await getCSRFCookie()
  
  return validateCSRFToken(token, cookieValue, secret)
}

/**
 * Generate and set a new CSRF token for a session
 */
export async function initializeCSRFProtection(
  secret: string = process.env.API_KEY_SECRET || 'default-secret'
): Promise<string> {
  const { token, cookieValue } = createCSRFTokenPair(secret)
  await setCSRFCookie(cookieValue)
  return token
}












