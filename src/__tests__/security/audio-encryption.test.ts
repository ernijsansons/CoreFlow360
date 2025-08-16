/**
 * CoreFlow360 - Audio Encryption Tests
 * Comprehensive test suite for AES-256 encryption
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { AudioEncryptionService } from '@/lib/security/audio-encryption'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

// Mock environment
process.env.AUDIO_ENCRYPTION_MASTER_KEY = 'test-master-key-must-be-32-characters-long!!'

describe('AudioEncryptionService', () => {
  let encryptionService: AudioEncryptionService
  let testAudioBuffer: Buffer
  let testTranscript: string

  beforeEach(() => {
    encryptionService = new AudioEncryptionService()
    // Create test audio buffer (simulate 1 second of audio)
    testAudioBuffer = crypto.randomBytes(16000)
    testTranscript = 'This is a test transcript for encryption.'
  })

  describe('Audio Encryption', () => {
    it('should encrypt audio buffer successfully', async () => {
      const metadata = { customerId: 'test-123', callId: 'call-456' }
      const encrypted = await encryptionService.encryptAudio(testAudioBuffer, metadata)

      expect(encrypted.data).toBeInstanceOf(Buffer)
      expect(encrypted.data).not.toEqual(testAudioBuffer)
      expect(encrypted.metadata.encrypted).toBe(true)
      expect(encrypted.metadata.algorithm).toBe('aes-256-gcm')
      expect(encrypted.metadata.iv).toBeDefined()
      expect(encrypted.metadata.salt).toBeDefined()
      expect(encrypted.metadata.tag).toBeDefined()
    })

    it('should decrypt audio buffer successfully', async () => {
      const metadata = { customerId: 'test-123' }
      const encrypted = await encryptionService.encryptAudio(testAudioBuffer, metadata)
      
      const decrypted = await encryptionService.decryptAudio(
        encrypted.data,
        encrypted.metadata,
        metadata
      )

      expect(decrypted.data).toEqual(testAudioBuffer)
      expect(decrypted.verified).toBe(true)
    })

    it('should fail decryption with tampered data', async () => {
      const encrypted = await encryptionService.encryptAudio(testAudioBuffer)
      
      // Tamper with encrypted data
      encrypted.data[0] = encrypted.data[0] ^ 0xFF

      await expect(
        encryptionService.decryptAudio(encrypted.data, encrypted.metadata)
      ).rejects.toThrow('Audio authentication failed')
    })

    it('should fail decryption with wrong metadata', async () => {
      const metadata = { customerId: 'test-123' }
      const encrypted = await encryptionService.encryptAudio(testAudioBuffer, metadata)
      
      // Try to decrypt with different metadata
      await expect(
        encryptionService.decryptAudio(
          encrypted.data,
          encrypted.metadata,
          { customerId: 'wrong-123' }
        )
      ).rejects.toThrow('Audio authentication failed')
    })
  })

  describe('Transcript Encryption', () => {
    it('should encrypt and decrypt transcript', async () => {
      const metadata = { noteId: 'note-789' }
      const encrypted = await encryptionService.encryptTranscript(testTranscript, metadata)
      
      expect(encrypted.data).toBeInstanceOf(Buffer)
      expect(encrypted.data.toString()).not.toEqual(testTranscript)

      const decrypted = await encryptionService.decryptTranscript(
        encrypted.data,
        encrypted.metadata,
        metadata
      )

      expect(decrypted).toEqual(testTranscript)
    })

    it('should handle unicode transcripts', async () => {
      const unicodeTranscript = 'Test with emojis 🎙️ and special chars: ñáéíóú'
      const encrypted = await encryptionService.encryptTranscript(unicodeTranscript)
      
      const decrypted = await encryptionService.decryptTranscript(
        encrypted.data,
        encrypted.metadata
      )

      expect(decrypted).toEqual(unicodeTranscript)
    })
  })

  describe('Streaming Encryption', () => {
    it('should create encryption stream', async () => {
      const metadata = { streamId: 'stream-123' }
      const { stream, getMetadata } = encryptionService.createEncryptionStream(metadata)

      expect(stream).toBeDefined()
      expect(getMetadata).toBeInstanceOf(Function)

      // Test stream encryption
      const chunks: Buffer[] = []
      stream.on('data', (chunk) => chunks.push(chunk))

      // Write test data
      stream.write(testAudioBuffer.slice(0, 1000))
      stream.write(testAudioBuffer.slice(1000, 2000))
      stream.end()

      await new Promise(resolve => stream.on('finish', resolve))

      const encryptedData = Buffer.concat(chunks)
      expect(encryptedData).toBeInstanceOf(Buffer)
      expect(encryptedData.length).toBeGreaterThan(0)

      const streamMetadata = getMetadata()
      expect(streamMetadata.tag).toBeDefined()
    })

    it('should decrypt streamed data', async () => {
      const metadata = { streamId: 'stream-456' }
      const { stream: encryptStream, getMetadata } = encryptionService.createEncryptionStream(metadata)

      // Encrypt data
      const encryptedChunks: Buffer[] = []
      encryptStream.on('data', (chunk) => encryptedChunks.push(chunk))
      encryptStream.end(testAudioBuffer)
      
      await new Promise(resolve => encryptStream.on('finish', resolve))

      const encryptedData = Buffer.concat(encryptedChunks)
      const encryptionMetadata = getMetadata()

      // Decrypt data
      const decryptStream = encryptionService.createDecryptionStream(encryptionMetadata, metadata)
      const decryptedChunks: Buffer[] = []
      decryptStream.on('data', (chunk) => decryptedChunks.push(chunk))
      decryptStream.end(encryptedData)

      await new Promise(resolve => decryptStream.on('finish', resolve))

      const decryptedData = Buffer.concat(decryptedChunks)
      expect(decryptedData).toEqual(testAudioBuffer)
    })
  })

  describe('File Encryption', () => {
    const testDir = path.join(__dirname, 'test-files')
    const testFile = path.join(testDir, 'test-audio.webm')

    beforeEach(async () => {
      // Create test directory and file
      await fs.mkdir(testDir, { recursive: true })
      await fs.writeFile(testFile, testAudioBuffer)
    })

    afterEach(async () => {
      // Clean up test files
      try {
        await fs.rm(testDir, { recursive: true, force: true })
      } catch (err) {
        // Ignore cleanup errors
      }
    })

    it('should encrypt file in place', async () => {
      const metadata = await encryptionService.encryptFile(testFile)

      expect(metadata.encrypted).toBe(true)
      expect(metadata.algorithm).toBe('aes-256-gcm')

      // Check that original file is replaced with encrypted version
      const encryptedContent = await fs.readFile(testFile)
      expect(encryptedContent).not.toEqual(testAudioBuffer)

      // Check metadata file exists
      const metadataPath = `${testFile}.meta`
      const metadataContent = await fs.readFile(metadataPath, 'utf8')
      const savedMetadata = JSON.parse(metadataContent)
      expect(savedMetadata).toEqual(metadata)
    })

    it('should decrypt file in place', async () => {
      // First encrypt the file
      await encryptionService.encryptFile(testFile)

      // Then decrypt it
      await encryptionService.decryptFile(testFile)

      // Check that file is back to original
      const decryptedContent = await fs.readFile(testFile)
      expect(decryptedContent).toEqual(testAudioBuffer)

      // Check metadata file is removed
      const metadataPath = `${testFile}.meta`
      await expect(fs.access(metadataPath)).rejects.toThrow()
    })
  })

  describe('Security Features', () => {
    it('should generate unique tenant keys', () => {
      const tenantKey1 = encryptionService.generateTenantKey('tenant-123')
      const tenantKey2 = encryptionService.generateTenantKey('tenant-456')
      const tenantKey3 = encryptionService.generateTenantKey('tenant-123')

      expect(tenantKey1).toHaveLength(32)
      expect(tenantKey2).toHaveLength(32)
      expect(tenantKey1).not.toEqual(tenantKey2)
      expect(tenantKey1).toEqual(tenantKey3) // Same tenant = same key
    })

    it('should verify data integrity', async () => {
      const hash = encryptionService.createAudioHash(testAudioBuffer)
      expect(hash).toHaveLength(64) // SHA-256 hex string

      const isValid = await encryptionService.verifyIntegrity(testAudioBuffer, hash)
      expect(isValid).toBe(true)

      // Tamper with data
      testAudioBuffer[0] = testAudioBuffer[0] ^ 0xFF
      const isInvalid = await encryptionService.verifyIntegrity(testAudioBuffer, hash)
      expect(isInvalid).toBe(false)
    })

    it('should use different encryption for same data', async () => {
      const encrypted1 = await encryptionService.encryptAudio(testAudioBuffer)
      const encrypted2 = await encryptionService.encryptAudio(testAudioBuffer)

      // Same input, different output (due to random IV/salt)
      expect(encrypted1.data).not.toEqual(encrypted2.data)
      expect(encrypted1.metadata.iv).not.toEqual(encrypted2.metadata.iv)
      expect(encrypted1.metadata.salt).not.toEqual(encrypted2.metadata.salt)

      // But both should decrypt to same data
      const decrypted1 = await encryptionService.decryptAudio(
        encrypted1.data,
        encrypted1.metadata
      )
      const decrypted2 = await encryptionService.decryptAudio(
        encrypted2.data,
        encrypted2.metadata
      )

      expect(decrypted1.data).toEqual(decrypted2.data)
    })
  })

  describe('Performance', () => {
    it('should handle large audio files efficiently', async () => {
      // Create 10MB audio buffer
      const largeBuffer = crypto.randomBytes(10 * 1024 * 1024)
      
      const startTime = Date.now()
      const encrypted = await encryptionService.encryptAudio(largeBuffer)
      const encryptTime = Date.now() - startTime

      expect(encryptTime).toBeLessThan(1000) // Should encrypt 10MB in < 1 second
      expect(encrypted.data.length).toBeCloseTo(largeBuffer.length, -100) // Size should be similar

      const decryptStart = Date.now()
      const decrypted = await encryptionService.decryptAudio(
        encrypted.data,
        encrypted.metadata
      )
      const decryptTime = Date.now() - decryptStart

      expect(decryptTime).toBeLessThan(1000) // Should decrypt 10MB in < 1 second
      expect(decrypted.data).toEqual(largeBuffer)
    })
  })

  describe('Error Handling', () => {
    it('should throw error for invalid master key', () => {
      process.env.AUDIO_ENCRYPTION_MASTER_KEY = 'too-short'
      expect(() => new AudioEncryptionService()).toThrow(
        'AUDIO_ENCRYPTION_MASTER_KEY must be set and at least 32 characters'
      )
    })

    it('should handle decryption with wrong algorithm', async () => {
      const encrypted = await encryptionService.encryptAudio(testAudioBuffer)
      encrypted.metadata.algorithm = 'aes-128-cbc' // Wrong algorithm

      await expect(
        encryptionService.decryptAudio(encrypted.data, encrypted.metadata)
      ).rejects.toThrow('Unsupported algorithm: aes-128-cbc')
    })

    it('should handle corrupted metadata gracefully', async () => {
      const encrypted = await encryptionService.encryptAudio(testAudioBuffer)
      encrypted.metadata.iv = 'invalid-hex' // Corrupt IV

      await expect(
        encryptionService.decryptAudio(encrypted.data, encrypted.metadata)
      ).rejects.toThrow('Failed to decrypt audio data')
    })
  })
})