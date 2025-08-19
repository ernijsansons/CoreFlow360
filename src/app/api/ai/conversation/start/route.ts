/**
 * Start Conversation API
 * POST /api/ai/conversation/start
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { aiConversationInterface } from '@/lib/ai/conversation-interface'
import { z } from 'zod'

const requestSchema = z.object({
  sessionId: z.string(),
  department: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    const body = await request.json()
    const { sessionId, department } = requestSchema.parse(body)

    // Start conversation
    const conversationContext = aiConversationInterface.startConversation(
      sessionId,
      user.id,
      tenantId,
      department
    )

    // Get suggested prompts
    const suggestedPrompts = aiConversationInterface.getSuggestedPrompts(conversationContext)

    return NextResponse.json({
      success: true,
      sessionId,
      suggestedPrompts,
      message: 'Conversation started successfully',
    })

  } catch (error) {
    console.error('Conversation start error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to start conversation' },
      { status: 500 }
    )
  }
}