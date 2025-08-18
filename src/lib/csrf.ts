/**
 * CoreFlow360 - CSRF Protection
 * Generates and validates CSRF tokens for secure state-changing operations
 * Edge-compatible implementation using Web Crypto API
 */

import { cookies } from 'next/headers'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = '__Host-csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export interface CSRFTokenPair {
  token: string
  cookieValue: string
}

/**
 * Generate a secure CSRF token using Web Crypto API (Edge-compatible)
 */
export function generateCSRFToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array)
  } else {
    // Fallback for environments without Web Crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create HMAC using Web Crypto API (Edge-compatible)
 */
async function createHMAC(secret: string, data: string): Promise<string> {
  // Convert strings to Uint8Array
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const dataArray = encoder.encode(data)
  
  // Import the key
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  // Create HMAC
  const signature = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    dataArray
  )
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Create a CSRF token pair (token and hashed cookie value)
 */
export async function createCSRFTokenPair(secret: string): Promise<CSRFTokenPair> {
  const token = generateCSRFToken()
  const cookieValue = await createHMAC(secret, token)
  
  return { token, cookieValue }
}

/**
 * Constant-time string comparison (Edge-compatible)
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Validate a CSRF token against the cookie value
 */
export async function validateCSRFToken(
  token: string | null,
  cookieValue: string | null,
  secret: string
): Promise<boolean> {
  if (!token || !cookieValue) return false
  
  const expectedCookieValue = await createHMAC(secret, token)
  
  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(cookieValue, expectedCookieValue)
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
  
  return await validateCSRFToken(token, cookieValue, secret)
}

/**
 * Generate and set a new CSRF token for a session
 */
export async function initializeCSRFProtection(
  secret: string = process.env.API_KEY_SECRET || 'default-secret'
): Promise<string> {
  const { token, cookieValue } = await createCSRFTokenPair(secret)
  await setCSRFCookie(cookieValue)
  return token
}


















