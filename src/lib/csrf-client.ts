/**
 * CoreFlow360 - Client-side CSRF utilities
 * Client-safe CSRF token handling
 */

export class ClientCSRF {
  private static csrfToken: string | null = null

  /**
   * Get CSRF token from meta tag or local storage
   */
  static getToken(): string | null {
    // Check cached token first
    if (this.csrfToken) {
      return this.csrfToken
    }

    // Try to get from meta tag
    if (typeof window !== 'undefined') {
      const metaTag = document.querySelector('meta[name="csrf-token"]')
      if (metaTag) {
        this.csrfToken = metaTag.getAttribute('content')
        return this.csrfToken
      }

      // Try to get from cookie (client-readable cookies only)
      const match = document.cookie.match(/csrf-token=([^;]+)/)
      if (match) {
        this.csrfToken = match[1]
        return this.csrfToken
      }
    }

    return null
  }

  /**
   * Set CSRF token (usually from server response)
   */
  static setToken(token: string): void {
    this.csrfToken = token
    
    // Update meta tag if it exists
    if (typeof window !== 'undefined') {
      const metaTag = document.querySelector('meta[name="csrf-token"]')
      if (metaTag) {
        metaTag.setAttribute('content', token)
      }
    }
  }

  /**
   * Get headers with CSRF token
   */
  static getHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { 'x-csrf-token': token } : {}
  }
}