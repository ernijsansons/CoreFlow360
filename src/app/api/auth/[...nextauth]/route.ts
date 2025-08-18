/**
 * CoreFlow360 - NextAuth.js API Route Handler
 * Production-ready authentication endpoint
 */

import { handlers } from '@/lib/auth'

// Re-export handlers with error handling
export const GET = async (req: Request) => {
  try {
    return await handlers.GET(req)
  } catch (error) {
    console.error('[Auth Route] GET error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication service error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const POST = async (req: Request) => {
  try {
    return await handlers.POST(req)
  } catch (error) {
    console.error('[Auth Route] POST error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication service error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}