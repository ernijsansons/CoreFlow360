/**
 * CoreFlow360 - Voice Notes API
 * Store and retrieve voice notes with transcriptions
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'
import { 
  encryptAudioMiddleware,
  decryptAudioMiddleware,
  encryptTranscriptMiddleware,
  decryptTranscriptMiddleware 
} from '@/middleware/audio-encryption.middleware'
import { audioEncryption } from '@/lib/security/audio-encryption'

/**
 * GET /api/voice-notes
 * Retrieve voice notes for a customer or lead
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const customerId = url.searchParams.get('customerId')
    const leadId = url.searchParams.get('leadId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    if (!customerId && !leadId) {
      return NextResponse.json(
        { error: 'customerId or leadId required' },
        { status: 400 }
      )
    }

    // Build query conditions
    const where: any = {
      userId: session.user.id,
      deletedAt: null
    }

    if (customerId) where.customerId = customerId
    if (leadId) where.leadId = leadId

    // Fetch voice notes
    const [notes, total] = await Promise.all([
      db.voiceNote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          transcript: true,
          transcriptEncrypted: true,
          transcriptEncryptionMetadata: true,
          title: true,
          summary: true,
          duration: true,
          confidence: true,
          sentiment: true,
          priority: true,
          category: true,
          tags: true,
          createdAt: true,
          audioUrl: true
        }
      }),
      db.voiceNote.count({ where })
    ])

    // Get tenant ID for decryption
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    })

    // Decrypt transcripts
    const decryptedNotes = await Promise.all(
      notes.map(async (note) => {
        let decryptedTranscript = note.transcript

        // If transcript is encrypted, decrypt it
        if (note.transcriptEncrypted && note.transcriptEncryptionMetadata) {
          try {
            decryptedTranscript = await decryptTranscriptMiddleware(
              user!.tenantId!,
              note.transcript,
              note.transcriptEncryptionMetadata
            )
          } catch (error) {
            console.error('Failed to decrypt transcript:', error)
            decryptedTranscript = '[Decryption failed]'
          }
        }

        return {
          id: note.id,
          transcript: decryptedTranscript,
          title: note.title,
          summary: note.summary,
          duration: note.duration,
          confidence: note.confidence,
          sentiment: note.sentiment,
          priority: note.priority,
          category: note.category,
          tags: note.tags,
          createdAt: note.createdAt,
          audioUrl: note.audioUrl
        }
      })
    )

    return NextResponse.json({
      notes: decryptedNotes,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    })

  } catch (error) {
    console.error('Error fetching voice notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voice notes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/voice-notes
 * Create a new voice note
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const transcript = formData.get('transcript') as string
    const duration = parseInt(formData.get('duration') as string)
    const confidence = parseFloat(formData.get('confidence') as string)
    const customerId = formData.get('customerId') as string | null
    const leadId = formData.get('leadId') as string | null

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript required' },
        { status: 400 }
      )
    }

    // Get tenant ID
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    })

    if (!user?.tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      )
    }

    let audioUrl: string | null = null
    let audioSize: number | null = null
    let audioEncryptionMetadata: any = null

    // Save audio file if provided
    if (audioFile && audioFile.size > 0) {
      try {
        const buffer = Buffer.from(await audioFile.arrayBuffer())
        
        // Encrypt audio before saving
        const metadata = {
          tenantId: user.tenantId,
          originalName: audioFile.name,
          mimeType: audioFile.type,
          size: audioFile.size,
          uploadedAt: new Date().toISOString()
        }
        
        const encrypted = await audioEncryption.encryptAudio(buffer, metadata)
        audioSize = encrypted.data.length
        audioEncryptionMetadata = encrypted.metadata

        // Create file hash for unique filename
        const hash = createHash('md5').update(encrypted.data).digest('hex')
        const filename = `voice_note_${Date.now()}_${hash}.enc`

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'uploads', 'voice-notes', user.tenantId)
        await mkdir(uploadDir, { recursive: true })

        // Save encrypted file
        const filePath = join(uploadDir, filename)
        await writeFile(filePath, encrypted.data)

        // Save encryption metadata
        const metaPath = join(uploadDir, `${filename}.meta`)
        await writeFile(metaPath, JSON.stringify(encrypted.metadata, null, 2))

        // Store relative URL
        audioUrl = `/uploads/voice-notes/${user.tenantId}/${filename}`
        
      } catch (err) {
        console.error('Error saving audio file:', err)
        // Continue without audio file
      }
    }

    // Analyze transcript for insights
    const analysis = analyzeTranscript(transcript)

    // Encrypt transcript
    const encryptedTranscript = await encryptTranscriptMiddleware(
      user.tenantId,
      transcript,
      {
        customerId,
        leadId,
        confidence,
        duration
      }
    )

    // Create voice note
    const voiceNote = await db.voiceNote.create({
      data: {
        tenantId: user.tenantId,
        userId: session.user.id,
        customerId,
        leadId,
        transcript: encryptedTranscript.encryptedData,
        transcriptEncrypted: true,
        transcriptEncryptionMetadata: encryptedTranscript.encryptionMetadata,
        confidence,
        duration,
        audioUrl,
        audioSize,
        audioFormat: audioFile?.type || 'audio/webm',
        audioEncrypted: audioEncryptionMetadata ? true : false,
        audioEncryptionMetadata,
        title: analysis.title,
        summary: analysis.summary,
        keywords: analysis.keywords,
        sentiment: analysis.sentiment,
        priority: analysis.priority,
        category: analysis.category,
        tags: analysis.tags,
        status: 'COMPLETED',
        metadata: {
          userAgent: request.headers.get('user-agent'),
          platform: detectPlatform(request.headers.get('user-agent') || ''),
          encryptionVersion: '1.0'
        }
      }
    })

    // Update customer/lead activity
    if (customerId) {
      await db.customer.update({
        where: { id: customerId },
        data: { 
          lastActivityAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    if (leadId) {
      await db.lead.update({
        where: { id: leadId },
        data: { 
          lastActivityAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Return sanitized voice note
    const sanitizedNote = {
      id: voiceNote.id,
      transcript: voiceNote.transcript,
      title: voiceNote.title,
      summary: voiceNote.summary,
      duration: voiceNote.duration,
      confidence: voiceNote.confidence,
      sentiment: voiceNote.sentiment,
      priority: voiceNote.priority,
      category: voiceNote.category,
      tags: voiceNote.tags,
      audioUrl: voiceNote.audioUrl,
      createdAt: voiceNote.createdAt
    }

    return NextResponse.json(sanitizedNote, { status: 201 })

  } catch (error) {
    console.error('Error creating voice note:', error)
    return NextResponse.json(
      { error: 'Failed to create voice note' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/voice-notes/[id]
 * Update voice note (e.g., edit transcript, add tags)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    const data = await request.json()

    // Verify ownership
    const note = await db.voiceNote.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Update allowed fields
    const updateData: any = {}
    
    if (data.transcript !== undefined) {
      updateData.transcript = data.transcript
      // Re-analyze if transcript changed
      const analysis = analyzeTranscript(data.transcript)
      updateData.title = analysis.title
      updateData.summary = analysis.summary
      updateData.keywords = analysis.keywords
      updateData.sentiment = analysis.sentiment
    }

    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.category !== undefined) updateData.category = data.category
    if (data.tags !== undefined) updateData.tags = data.tags

    const updatedNote = await db.voiceNote.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      id: updatedNote.id,
      transcript: updatedNote.transcript,
      title: updatedNote.title,
      summary: updatedNote.summary,
      priority: updatedNote.priority,
      category: updatedNote.category,
      tags: updatedNote.tags,
      updatedAt: updatedNote.updatedAt
    })

  } catch (error) {
    console.error('Error updating voice note:', error)
    return NextResponse.json(
      { error: 'Failed to update voice note' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/voice-notes/[id]
 * Soft delete a voice note
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    // Verify ownership
    const note = await db.voiceNote.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Soft delete
    await db.voiceNote.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting voice note:', error)
    return NextResponse.json(
      { error: 'Failed to delete voice note' },
      { status: 500 }
    )
  }
}

/**
 * Analyze transcript for insights
 */
function analyzeTranscript(transcript: string): {
  title: string
  summary: string
  keywords: string[]
  sentiment: number
  priority: string
  category: string
  tags: string[]
} {
  // Generate title (first sentence or 50 chars)
  const firstSentence = transcript.split(/[.!?]/)[0]
  const title = firstSentence.length > 50 
    ? firstSentence.substring(0, 47) + '...'
    : firstSentence

  // Generate summary (first 2-3 sentences)
  const sentences = transcript.split(/[.!?]/).filter(s => s.trim().length > 0)
  const summary = sentences.slice(0, 3).join('. ') + '.'

  // Extract keywords (basic implementation)
  const words = transcript.toLowerCase().split(/\s+/)
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for'])
  const wordFreq: Record<string, number> = {}
  
  words.forEach(word => {
    const cleaned = word.replace(/[^a-z0-9]/g, '')
    if (cleaned.length > 3 && !stopWords.has(cleaned)) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1
    }
  })

  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)

  // Analyze sentiment (basic positive/negative word detection)
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'perfect', 'love', 'amazing']
  const negativeWords = ['bad', 'poor', 'terrible', 'unhappy', 'disappointed', 'hate', 'awful', 'problem']
  
  let sentimentScore = 0
  const lowerTranscript = transcript.toLowerCase()
  
  positiveWords.forEach(word => {
    if (lowerTranscript.includes(word)) sentimentScore += 0.1
  })
  
  negativeWords.forEach(word => {
    if (lowerTranscript.includes(word)) sentimentScore -= 0.1
  })

  const sentiment = Math.max(-1, Math.min(1, sentimentScore))

  // Determine priority based on keywords
  let priority = 'MEDIUM'
  if (lowerTranscript.includes('urgent') || lowerTranscript.includes('asap') || lowerTranscript.includes('emergency')) {
    priority = 'HIGH'
  } else if (lowerTranscript.includes('whenever') || lowerTranscript.includes('no rush')) {
    priority = 'LOW'
  }

  // Categorize based on content
  let category = 'General'
  if (lowerTranscript.includes('meeting') || lowerTranscript.includes('appointment')) {
    category = 'Meeting'
  } else if (lowerTranscript.includes('follow') || lowerTranscript.includes('check')) {
    category = 'Follow-up'
  } else if (lowerTranscript.includes('issue') || lowerTranscript.includes('problem')) {
    category = 'Issue'
  } else if (lowerTranscript.includes('opportunity') || lowerTranscript.includes('deal')) {
    category = 'Opportunity'
  }

  // Extract tags from common patterns
  const tags: string[] = []
  
  // Phone numbers
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
  if (phoneRegex.test(transcript)) tags.push('phone-number')
  
  // Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  if (emailRegex.test(transcript)) tags.push('email')
  
  // Dates
  const dateRegex = /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})\b/gi
  if (dateRegex.test(transcript)) tags.push('date-mentioned')

  // Action items
  if (lowerTranscript.includes('todo') || lowerTranscript.includes('action') || lowerTranscript.includes('need to')) {
    tags.push('action-item')
  }

  return {
    title,
    summary,
    keywords,
    sentiment,
    priority,
    category,
    tags
  }
}

/**
 * Detect platform from user agent
 */
function detectPlatform(userAgent: string): string {
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
  if (/Android/.test(userAgent)) return 'Android'
  if (/Windows Phone/.test(userAgent)) return 'Windows Phone'
  if (/Macintosh/.test(userAgent)) return 'macOS'
  if (/Windows/.test(userAgent)) return 'Windows'
  if (/Linux/.test(userAgent)) return 'Linux'
  return 'Unknown'
}