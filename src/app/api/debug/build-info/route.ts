import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This endpoint helps diagnose build-time vs runtime issues

  const buildInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      CI: process.env.CI,
      NEXT_PHASE: process.env.NEXT_PHASE,
    },
    envVarsPresent: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      API_KEY_SECRET: !!process.env.API_KEY_SECRET,
      ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
      REDIS_URL: !!process.env.REDIS_URL,
      REDIS_HOST: !!process.env.REDIS_HOST,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    },
    runtime: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime?.() || 0,
    },
    headers: {
      host: request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-vercel-deployment-url': request.headers.get('x-vercel-deployment-url'),
    },
  }

  return NextResponse.json(buildInfo, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
