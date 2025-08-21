/**
 * CoreFlow360 - User Theme Preferences API
 * Handles saving and retrieving user theme preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const themePreferencesSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']),
  consciousnessTheme: z.enum(['neural', 'synaptic', 'autonomous', 'transcendent']),
  accessibilityMode: z.enum(['standard', 'high-contrast', 'reduced-motion', 'enhanced-focus']),
  customColors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
    })
    .optional(),
  animations: z.boolean(),
  autoThemeSwitch: z.boolean(),
  scheduleStart: z.string().optional(),
  scheduleEnd: z.string().optional(),
  respectSystemPreference: z.boolean(),
  contrastRatio: z.number().min(1.0).max(3.0),
})

const requestSchema = z.object({
  userId: z.string(),
  preferences: themePreferencesSchema,
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user preferences from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        themePreferences: true,
      },
    })

    if (!user || !user.themePreferences) {
      return NextResponse.json(null)
    }

    return NextResponse.json(user.themePreferences)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    if (validatedData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Save theme preferences to database
    await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        themePreferences: validatedData.preferences,
        updatedAt: new Date(),
      },
    })

    // Log theme change for analytics
    await prisma.auditLog.create({
      data: {
        userId: validatedData.userId,
        action: 'theme_preferences_updated',
        details: {
          previousTheme: 'unknown', // Could be enhanced to track previous state
          newTheme: validatedData.preferences.mode,
          consciousnessTheme: validatedData.preferences.consciousnessTheme,
          accessibilityMode: validatedData.preferences.accessibilityMode,
        },
        ipAddress:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Reset theme preferences to null (will use defaults)
    await prisma.user.update({
      where: { id: userId },
      data: {
        themePreferences: null,
        updatedAt: new Date(),
      },
    })

    // Log theme reset for analytics
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'theme_preferences_reset',
        details: {
          resetToDefaults: true,
        },
        ipAddress:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
