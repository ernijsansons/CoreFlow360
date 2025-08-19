'use client'

/**
 * CoreFlow360 - App Providers
 * Wraps the application with necessary providers and error boundaries
 */

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthErrorBoundary } from '@/components/error/AuthErrorBoundary'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <AuthErrorBoundary>{children}</AuthErrorBoundary>
      </ReactQueryProvider>
    </SessionProvider>
  )
}
