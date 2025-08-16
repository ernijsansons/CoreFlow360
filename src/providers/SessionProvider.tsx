/**
 * CoreFlow360 - Session Provider
 * NextAuth session provider with tenant context
 */

'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

interface Props {
  children: React.ReactNode
  session?: Session | null
}

export default function AuthProvider({ children, session }: Props) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}