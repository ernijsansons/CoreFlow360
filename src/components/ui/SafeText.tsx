/**
 * CoreFlow360 - Safe Text Component
 * Prevents XSS by safely rendering user-generated content
 */

import React from 'react'

interface SafeTextProps {
  children: string | null | undefined
  className?: string
  as?: keyof JSX.IntrinsicElements
  truncate?: number
}

/**
 * Component to safely render user-generated text content
 * Prevents XSS attacks by using React's built-in escaping
 */
export function SafeText({ children, className, as: Component = 'span', truncate }: SafeTextProps) {
  if (!children) {
    return null
  }

  let text = children

  // Truncate text if needed
  if (truncate && text.length > truncate) {
    text = text.substring(0, truncate) + '...'
  }

  // React automatically escapes text content, preventing XSS
  return <Component className={className}>{text}</Component>
}

/**
 * Hook to sanitize text for safe display
 */
export function useSafeText(text: string | null | undefined): string {
  if (!text) return ''

  // Basic sanitization - remove any obvious script tags
  // React will handle the rest when rendering
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

/**
 * Utility to get safe initials from names
 */
export function getSafeInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim().charAt(0).toUpperCase() || ''
  const last = lastName?.trim().charAt(0).toUpperCase() || ''
  return first + last
}

/**
 * Utility to safely display customer name
 */
export function getSafeCustomerName(customer: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  email?: string | null
}): string {
  if (customer.firstName || customer.lastName) {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
  }
  if (customer.name) {
    return customer.name
  }
  if (customer.email) {
    return customer.email.split('@')[0]
  }
  return 'Unknown Customer'
}
