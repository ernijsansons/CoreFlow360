/**
 * CoreFlow360 - Secure Audio Streaming API
 * Stream encrypted audio with on-the-fly decryption
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { audioEncryption } from '@/lib/security/audio-encryption'
import { createReadStream } from 'fs'
import { pipeline } from 'stream/promises'

/**
 * GET /api/voice-notes/[id]/audio
 * Stream encrypted audio file with decryption
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get voice note
    const voiceNote = await db.voiceNote.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      select: {
        audioUrl: true,
        audioEncrypted: true,
        audioEncryptionMetadata: true,
        audioFormat: true,
        tenantId: true,
      },
    })

    if (!voiceNote || !voiceNote.audioUrl) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 })
    }

    // Get user tenant ID
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    // Verify tenant access
    if (user?.tenantId !== voiceNote.tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build file path
    const filename = voiceNote.audioUrl.split('/').pop()!
    const filePath = join(process.cwd(), 'uploads', 'voice-notes', voiceNote.tenantId, filename)

    // Check if audio is encrypted
    if (voiceNote.audioEncrypted && voiceNote.audioEncryptionMetadata) {
      // Stream with decryption
      const encryptedData = await readFile(filePath)

      // Decrypt audio
      const decrypted = await audioEncryption.decryptAudio(
        encryptedData,
        voiceNote.audioEncryptionMetadata,
        { tenantId: voiceNote.tenantId }
      )

      // Return decrypted audio
      return new NextResponse(decrypted.data, {
        headers: {
          'Content-Type': voiceNote.audioFormat || 'audio/webm',
          'Content-Length': decrypted.data.length.toString(),
          'Cache-Control': 'private, max-age=3600',
          'X-Content-Type-Options': 'nosniff',
          'X-Audio-Encrypted': 'true',
          'X-Audio-Verified': decrypted.verified.toString(),
        },
      })
    } else {
      // Stream unencrypted audio
      const audioData = await readFile(filePath)

      return new NextResponse(audioData, {
        headers: {
          'Content-Type': voiceNote.audioFormat || 'audio/webm',
          'Content-Length': audioData.length.toString(),
          'Cache-Control': 'private, max-age=3600',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to stream audio' }, { status: 500 })
  }
}

/**
 * POST /api/voice-notes/[id]/audio/encrypt
 * Encrypt existing unencrypted audio
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get voice note
    const voiceNote = await db.voiceNote.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!voiceNote || !voiceNote.audioUrl) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 })
    }

    if (voiceNote.audioEncrypted) {
      return NextResponse.json({ error: 'Audio already encrypted' }, { status: 400 })
    }

    // Build file path
    const filename = voiceNote.audioUrl.split('/').pop()!
    const filePath = join(process.cwd(), 'uploads', 'voice-notes', voiceNote.tenantId, filename)

    // Encrypt file in place
    const encryptionMetadata = await audioEncryption.encryptFile(filePath)

    // Update database
    await db.voiceNote.update({
      where: { id: params.id },
      data: {
        audioEncrypted: true,
        audioEncryptionMetadata: encryptionMetadata,
        audioUrl: voiceNote.audioUrl.replace(/\.[^.]+$/, '.enc'),
      },
    })

    // Log encryption event
    await db.auditLog.create({
      data: {
        action: 'AUDIO_ENCRYPTED_RETROACTIVELY',
        entityType: 'VOICE_NOTE',
        entityId: params.id,
        tenantId: voiceNote.tenantId,
        userId: session.user.id,
        metadata: {
          originalFile: filename,
          encryptionVersion: encryptionMetadata.version,
        },
        timestamp: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      encrypted: true,
      encryptionMetadata,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to encrypt audio' }, { status: 500 })
  }
}
