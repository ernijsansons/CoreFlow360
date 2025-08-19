/**
 * CoreFlow360 - Audio Encryption Middleware
 * Automatic encryption/decryption for voice recordings in API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { audioEncryption } from '@/lib/security/audio-encryption'
import multer from 'multer'
import { Readable } from 'stream'
import { db } from '@/lib/db'

export interface EncryptedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
  encrypted: boolean
  encryptionMetadata?: unknown
}

/**
 * Middleware to automatically encrypt uploaded audio files
 */
export async function encryptAudioMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Check if this is a multipart upload with audio
    const contentType = req.headers.get('content-type') || ''

    if (!contentType.includes('multipart/form-data')) {
      return handler(req)
    }

    // Get form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return handler(req)
    }

    // Check if file is audio
    if (!audioFile.type.startsWith('audio/')) {
      return handler(req)
    }

    // Get tenant ID from auth
    const tenantId = req.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required for audio encryption' },
        { status: 401 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create metadata for encryption
    const metadata = {
      tenantId,
      originalName: audioFile.name,
      mimeType: audioFile.type,
      size: audioFile.size,
      uploadedAt: new Date().toISOString(),
    }

    // Encrypt the audio
    const encrypted = await audioEncryption.encryptAudio(buffer, metadata)

    // Create new FormData with encrypted audio
    const encryptedFormData = new FormData()

    // Add encrypted audio as blob
    const encryptedBlob = new Blob([encrypted.data], { type: 'application/octet-stream' })
    encryptedFormData.set('audio', encryptedBlob, audioFile.name)

    // Add encryption metadata
    encryptedFormData.set('encryptionMetadata', JSON.stringify(encrypted.metadata))

    // Copy other form fields
    for (const [key, value] of formData.entries()) {
      if (key !== 'audio') {
        encryptedFormData.set(key, value)
      }
    }

    // Create new request with encrypted data
    const encryptedRequest = new NextRequest(req.url, {
      method: req.method,
      headers: req.headers,
      body: encryptedFormData,
    })

    // Log encryption event
    await logEncryptionEvent({
      action: 'AUDIO_ENCRYPTED',
      tenantId,
      fileSize: audioFile.size,
      encryptedSize: encrypted.data.length,
      fileName: audioFile.name,
    })

    return handler(encryptedRequest)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to encrypt audio' }, { status: 500 })
  }
}

/**
 * Middleware to automatically decrypt audio for playback
 */
export async function decryptAudioMiddleware(
  req: NextRequest,
  audioData: Buffer,
  encryptionMetadata: unknown
): Promise<Buffer> {
  try {
    // Get tenant ID from auth
    const tenantId = req.headers.get('x-tenant-id')
    if (!tenantId) {
      throw new Error('Tenant ID required for audio decryption')
    }

    // Verify tenant access
    if (encryptionMetadata.tenantId !== tenantId) {
      throw new Error('Unauthorized access to encrypted audio')
    }

    // Decrypt the audio
    const decrypted = await audioEncryption.decryptAudio(
      audioData,
      encryptionMetadata,
      { tenantId } // Additional authenticated data
    )

    // Log decryption event
    await logEncryptionEvent({
      action: 'AUDIO_DECRYPTED',
      tenantId,
      fileSize: decrypted.data.length,
      verified: decrypted.verified,
    })

    return decrypted.data
  } catch (error) {
    throw error
  }
}

/**
 * Stream encryption for real-time audio
 */
export function createEncryptedAudioStream(tenantId: string, metadata?: Record<string, unknown>) {
  const fullMetadata = {
    tenantId,
    streamStarted: new Date().toISOString(),
    ...metadata,
  }

  return audioEncryption.createEncryptionStream(fullMetadata)
}

/**
 * Stream decryption for real-time audio playback
 */
export function createDecryptedAudioStream(tenantId: string, encryptionMetadata: unknown) {
  // Verify tenant access
  if (encryptionMetadata.tenantId !== tenantId) {
    throw new Error('Unauthorized access to encrypted audio stream')
  }

  return audioEncryption.createDecryptionStream(encryptionMetadata, { tenantId })
}

/**
 * Encrypt transcript middleware
 */
export async function encryptTranscriptMiddleware(
  tenantId: string,
  transcript: string,
  metadata?: Record<string, unknown>
) {
  const fullMetadata = {
    tenantId,
    type: 'transcript',
    timestamp: new Date().toISOString(),
    ...metadata,
  }

  const encrypted = await audioEncryption.encryptTranscript(transcript, fullMetadata)

  // Store encrypted transcript
  return {
    encryptedData: encrypted.data.toString('base64'),
    encryptionMetadata: encrypted.metadata,
  }
}

/**
 * Decrypt transcript middleware
 */
export async function decryptTranscriptMiddleware(
  tenantId: string,
  encryptedData: string,
  encryptionMetadata: unknown
): Promise<string> {
  // Verify tenant access
  if (encryptionMetadata.tenantId !== tenantId) {
    throw new Error('Unauthorized access to encrypted transcript')
  }

  const buffer = Buffer.from(encryptedData, 'base64')
  return audioEncryption.decryptTranscript(buffer, encryptionMetadata, { tenantId })
}

/**
 * Log encryption/decryption events for audit
 */
async function logEncryptionEvent(event: {
  action: string
  tenantId: string
  fileSize?: number
  encryptedSize?: number
  fileName?: string
  verified?: boolean
}) {
  try {
    await db.auditLog.create({
      data: {
        action: event.action,
        entityType: 'AUDIO_ENCRYPTION',
        entityId: event.fileName,
        tenantId: event.tenantId,
        metadata: {
          fileSize: event.fileSize,
          encryptedSize: event.encryptedSize,
          verified: event.verified,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      },
    })
  } catch (error) {}
}

/**
 * Express middleware factory for audio encryption
 */
export function createAudioEncryptionMiddleware() {
  return async (req: unknown, res: unknown, next: unknown) => {
    // Skip if not audio upload
    if (!req.file || !req.file.mimetype.startsWith('audio/')) {
      return next()
    }

    try {
      // Get tenant ID
      const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant ID required' })
      }

      // Encrypt audio buffer
      const metadata = {
        tenantId,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      }

      const encrypted = await audioEncryption.encryptAudio(req.file.buffer, metadata)

      // Replace file buffer with encrypted data
      req.file.buffer = encrypted.data
      req.file.encryptionMetadata = encrypted.metadata
      req.file.encrypted = true
      req.file.mimetype = 'application/octet-stream'

      next()
    } catch (error) {
      res.status(500).json({ error: 'Failed to encrypt audio' })
    }
  }
}

/**
 * Multer storage engine with encryption
 */
export const encryptedStorage = multer.memoryStorage()

export const encryptedUpload = multer({
  storage: encryptedStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only audio files are allowed'))
    }
  },
})
