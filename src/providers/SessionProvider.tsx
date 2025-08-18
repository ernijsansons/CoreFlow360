/**
 * CoreFlow360 - Session Provider
 * NextAuth session provider with error handling
 */

'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

interface Props {
  children: React.ReactNode
  session?: Session | null | any
}

export default function AuthProvider({ children, session }: Props) {
  // Validate session before passing to SessionProvider
  let validSession: Session | null = null
  
  if (session && typeof session === 'object' && 'user' in session) {
    // Valid session object
    validSession = session as Session
  } else if (session && typeof session === 'object' && 'error' in session) {
    // Error object passed as session - log and use null
    console.warn('[SessionProvider] Received error instead of session:', session)
    validSession = null
  }
  
  return (
    <SessionProvider 
      session={validSession}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}