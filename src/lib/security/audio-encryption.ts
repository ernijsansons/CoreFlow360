/**
 * CoreFlow360 - AES-256 Audio Encryption Middleware
 * Military-grade encryption for voice recordings and transcripts
 */

import crypto from 'crypto'
import { Readable, Transform } from 'stream'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 32
const TAG_LENGTH = 16
const PBKDF2_ITERATIONS = 100000
const KEY_LENGTH = 32

export interface EncryptionMetadata {
  algorithm: string
  iv: string
  salt: string
  tag: string
  encrypted: boolean
  version: string
  timestamp: Date
  keyDerivation: {
    method: string
    iterations: number
    length: number
  }
}

export interface EncryptedData {
  data: Buffer
  metadata: EncryptionMetadata
}

export interface DecryptedData {
  data: Buffer
  verified: boolean
  metadata: EncryptionMetadata
}

/**
 * AES-256 Audio Encryption Service
 */
export class AudioEncryptionService {
  private readonly masterKey: string
  private readonly pbkdf2 = promisify(crypto.pbkdf2)

  constructor() {
    // Check if we're in build time
    const isBuildTime = process.env.VERCEL_ENV || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build'
    
    // Master key from environment - MUST be 32+ characters
    this.masterKey = process.env.AUDIO_ENCRYPTION_MASTER_KEY || (isBuildTime ? 'build-time-placeholder-key-32-characters-long' : '')
    
    if (!isBuildTime && (!this.masterKey || this.masterKey.length < 32)) {
      throw new Error('AUDIO_ENCRYPTION_MASTER_KEY must be set and at least 32 characters')
    }
  }

  /**
   * Encrypt audio buffer with AES-256-GCM
   */
  async encryptAudio(audioBuffer: Buffer, metadata?: Record<string, any>): Promise<EncryptedData> {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(SALT_LENGTH)
      const iv = crypto.randomBytes(IV_LENGTH)

      // Derive key from master key using PBKDF2
      const key = await this.deriveKey(this.masterKey, salt)

      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

      // Add additional authenticated data (AAD) if metadata provided
      if (metadata) {
        cipher.setAAD(Buffer.from(JSON.stringify(metadata), 'utf8'))
      }

      // Encrypt the audio data
      const encrypted = Buffer.concat([
        cipher.update(audioBuffer),
        cipher.final()
      ])

      // Get the authentication tag
      const tag = cipher.getAuthTag()

      // Create encryption metadata
      const encryptionMetadata: EncryptionMetadata = {
        algorithm: ALGORITHM,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex'),
        encrypted: true,
        version: '1.0',
        timestamp: new Date(),
        keyDerivation: {
          method: 'pbkdf2',
          iterations: PBKDF2_ITERATIONS,
          length: KEY_LENGTH
        }
      }

      return {
        data: encrypted,
        metadata: encryptionMetadata
      }

    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt audio data')
    }
  }

  /**
   * Decrypt audio buffer with AES-256-GCM
   */
  async decryptAudio(
    encryptedData: Buffer,
    metadata: EncryptionMetadata,
    additionalData?: Record<string, any>
  ): Promise<DecryptedData> {
    try {
      // Validate metadata
      if (metadata.algorithm !== ALGORITHM) {
        throw new Error(`Unsupported algorithm: ${metadata.algorithm}`)
      }

      // Parse hex values
      const salt = Buffer.from(metadata.salt, 'hex')
      const iv = Buffer.from(metadata.iv, 'hex')
      const tag = Buffer.from(metadata.tag, 'hex')

      // Derive key from master key
      const key = await this.deriveKey(this.masterKey, salt)

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
      decipher.setAuthTag(tag)

      // Add AAD if provided
      if (additionalData) {
        decipher.setAAD(Buffer.from(JSON.stringify(additionalData), 'utf8'))
      }

      // Decrypt the data
      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
      ])

      return {
        data: decrypted,
        verified: true,
        metadata
      }

    } catch (error) {
      console.error('Decryption error:', error)
      
      // Check if authentication failed
      if (error.message.includes('Unsupported state or unable to authenticate data')) {
        throw new Error('Audio authentication failed - data may be tampered')
      }
      
      throw new Error('Failed to decrypt audio data')
    }
  }

  /**
   * Encrypt transcript text
   */
  async encryptTranscript(transcript: string, metadata?: Record<string, any>): Promise<EncryptedData> {
    const transcriptBuffer = Buffer.from(transcript, 'utf8')
    return this.encryptAudio(transcriptBuffer, metadata)
  }

  /**
   * Decrypt transcript text
   */
  async decryptTranscript(
    encryptedData: Buffer,
    metadata: EncryptionMetadata,
    additionalData?: Record<string, any>
  ): Promise<string> {
    const decrypted = await this.decryptAudio(encryptedData, metadata, additionalData)
    return decrypted.data.toString('utf8')
  }

  /**
   * Create encryption stream for real-time audio
   */
  createEncryptionStream(metadata?: Record<string, any>): {
    stream: Transform
    getMetadata: () => EncryptionMetadata
  } {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    let cipher: crypto.CipherGCM
    let tag: Buffer

    const encryptStream = new Transform({
      async transform(chunk: Buffer, encoding, callback) {
        try {
          if (!cipher) {
            // Initialize cipher on first chunk
            const key = await this.deriveKey(this.masterKey, salt)
            cipher = crypto.createCipheriv(ALGORITHM, key, iv)
            
            if (metadata) {
              cipher.setAAD(Buffer.from(JSON.stringify(metadata), 'utf8'))
            }
          }

          const encrypted = cipher.update(chunk)
          callback(null, encrypted)

        } catch (error) {
          callback(error)
        }
      },

      flush(callback) {
        try {
          if (cipher) {
            const final = cipher.final()
            tag = cipher.getAuthTag()
            callback(null, final)
          } else {
            callback()
          }
        } catch (error) {
          callback(error)
        }
      }
    })

    const getMetadata = (): EncryptionMetadata => ({
      algorithm: ALGORITHM,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag: tag ? tag.toString('hex') : '',
      encrypted: true,
      version: '1.0',
      timestamp: new Date(),
      keyDerivation: {
        method: 'pbkdf2',
        iterations: PBKDF2_ITERATIONS,
        length: KEY_LENGTH
      }
    })

    return { stream: encryptStream, getMetadata }
  }

  /**
   * Create decryption stream for real-time audio
   */
  createDecryptionStream(
    metadata: EncryptionMetadata,
    additionalData?: Record<string, any>
  ): Transform {
    const salt = Buffer.from(metadata.salt, 'hex')
    const iv = Buffer.from(metadata.iv, 'hex')
    const tag = Buffer.from(metadata.tag, 'hex')
    let decipher: crypto.DecipherGCM

    return new Transform({
      async transform(chunk: Buffer, encoding, callback) {
        try {
          if (!decipher) {
            // Initialize decipher on first chunk
            const key = await this.deriveKey(this.masterKey, salt)
            decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
            decipher.setAuthTag(tag)
            
            if (additionalData) {
              decipher.setAAD(Buffer.from(JSON.stringify(additionalData), 'utf8'))
            }
          }

          const decrypted = decipher.update(chunk)
          callback(null, decrypted)

        } catch (error) {
          callback(error)
        }
      },

      flush(callback) {
        try {
          if (decipher) {
            const final = decipher.final()
            callback(null, final)
          } else {
            callback()
          }
        } catch (error) {
          callback(error)
        }
      }
    })
  }

  /**
   * Encrypt file in place
   */
  async encryptFile(filePath: string): Promise<EncryptionMetadata> {
    try {
      // Read file
      const data = await fs.readFile(filePath)
      
      // Get file metadata
      const stats = await fs.stat(filePath)
      const fileMetadata = {
        originalName: path.basename(filePath),
        size: stats.size,
        modified: stats.mtime
      }

      // Encrypt data
      const encrypted = await this.encryptAudio(data, fileMetadata)

      // Write encrypted file
      const encryptedPath = `${filePath}.enc`
      await fs.writeFile(encryptedPath, encrypted.data)

      // Write metadata
      const metadataPath = `${filePath}.meta`
      await fs.writeFile(metadataPath, JSON.stringify(encrypted.metadata, null, 2))

      // Securely delete original file
      await this.secureDelete(filePath)

      // Rename encrypted file to original name
      await fs.rename(encryptedPath, filePath)

      return encrypted.metadata

    } catch (error) {
      console.error('File encryption error:', error)
      throw new Error(`Failed to encrypt file: ${filePath}`)
    }
  }

  /**
   * Decrypt file in place
   */
  async decryptFile(filePath: string, metadataPath?: string): Promise<void> {
    try {
      // Read metadata
      const metaPath = metadataPath || `${filePath}.meta`
      const metadataJson = await fs.readFile(metaPath, 'utf8')
      const metadata: EncryptionMetadata = JSON.parse(metadataJson)

      // Read encrypted file
      const encryptedData = await fs.readFile(filePath)

      // Decrypt data
      const decrypted = await this.decryptAudio(encryptedData, metadata)

      // Write decrypted file
      const decryptedPath = `${filePath}.dec`
      await fs.writeFile(decryptedPath, decrypted.data)

      // Replace original with decrypted
      await fs.rename(decryptedPath, filePath)

      // Remove metadata file
      await fs.unlink(metaPath)

    } catch (error) {
      console.error('File decryption error:', error)
      throw new Error(`Failed to decrypt file: ${filePath}`)
    }
  }

  /**
   * Derive encryption key using PBKDF2
   */
  private async deriveKey(masterKey: string, salt: Buffer): Promise<Buffer> {
    return this.pbkdf2(masterKey, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256')
  }

  /**
   * Securely delete file by overwriting with random data
   */
  private async secureDelete(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath)
      const size = stats.size

      // Overwrite with random data 3 times
      for (let i = 0; i < 3; i++) {
        const randomData = crypto.randomBytes(size)
        await fs.writeFile(filePath, randomData)
      }

      // Finally delete the file
      await fs.unlink(filePath)

    } catch (error) {
      console.error('Secure delete error:', error)
      // Fall back to regular delete
      await fs.unlink(filePath)
    }
  }

  /**
   * Generate encryption key for a tenant
   */
  generateTenantKey(tenantId: string): string {
    // Create deterministic key for tenant
    const hash = crypto.createHmac('sha256', this.masterKey)
      .update(tenantId)
      .digest('hex')
    
    return hash.substring(0, 32) // Use first 32 chars as key
  }

  /**
   * Verify data integrity
   */
  async verifyIntegrity(
    data: Buffer,
    expectedHash: string,
    algorithm: string = 'sha256'
  ): Promise<boolean> {
    const hash = crypto.createHash(algorithm).update(data).digest('hex')
    return hash === expectedHash
  }

  /**
   * Create secure hash of audio data
   */
  createAudioHash(audioBuffer: Buffer): string {
    return crypto.createHash('sha256').update(audioBuffer).digest('hex')
  }
}

// Export singleton instance
export const audioEncryption = new AudioEncryptionService()