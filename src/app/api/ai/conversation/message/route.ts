/**
 * Process Conversation Message API
 * POST /api/ai/conversation/message
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromSession, getUserFromSession } from '@/lib/auth/tenant-utils'
import { aiConversationInterface } from '@/lib/ai/conversation-interface'
import { aiProviderDB } from '@/lib/ai/ai-provider-db'
import { z } from 'zod'

const requestSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1).max(1000),
})

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantFromSession(request)
    const user = await getUserFromSession()

    const body = await request.json()
    const { sessionId, message } = requestSchema.parse(body)

    // Check if AI providers are configured
    const providers = await aiProviderDB.getProviders(tenantId)
    const hasConfiguredProvider = providers.some(p => p.isEnabled && p.isConfigured)

    if (!hasConfiguredProvider) {
      return NextResponse.json({
        userMessage: {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date(),
        },
        assistantMessage: {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I\'m currently unable to process requests because no AI providers are configured. Please ask your administrator to configure AI providers in the admin panel.',
          timestamp: new Date(),
          metadata: {
            intent: 'unknown',
            confidence: 0,
          },
        },
      })
    }

    // Process message through AI
    const response = await aiConversationInterface.processMessage(sessionId, message)

    // Get the conversation context to return full messages
    const conversation = aiConversationInterface.getConversation(sessionId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Return the last two messages (user and assistant)
    const messages = conversation.history.slice(-2)
    
    return NextResponse.json({
      userMessage: messages[0],
      assistantMessage: messages[1] || response,
      suggestedActions: response.metadata?.actions,
    })

  } catch (error) {
    console.error('Conversation message error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}