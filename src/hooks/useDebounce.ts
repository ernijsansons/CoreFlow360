/**
 * CoreFlow360 - Debounce Hook
 * Delays updating a value until after a specified delay
 */

import { useEffect, useState } from 'react'

/**
 * Hook that delays updating a value until after the specified delay
 * Useful for search inputs to avoid excessive API calls
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}