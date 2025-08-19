/**
 * CoreFlow360 - Database Encryption Middleware
 * Automatic PII encryption/decryption for Prisma operations
 */

import { fieldEncryption } from '@/lib/encryption/field-encryption'

// PII fields that should be automatically encrypted
const PII_FIELDS = {
  Customer: ['email', 'phone', 'address'],
  User: ['email'],
  // Add other models as needed
}

/**
 * Prisma middleware for automatic PII encryption/decryption
 */
export const piiEncryptionMiddleware = async (params: unknown, next: unknown) => {
  const modelName = params.model
  const piiFields = PII_FIELDS[modelName as keyof typeof PII_FIELDS]

  if (!piiFields || piiFields.length === 0) {
    // No PII fields for this model, proceed normally
    return next(params)
  }

  // Encrypt PII on write operations
  if (params.action === 'create' || params.action === 'update' || params.action === 'upsert') {
    if (params.args.data) {
      params.args.data = encryptPIIFields(params.args.data, piiFields)
    }

    // Handle upsert update data
    if (params.action === 'upsert' && params.args.update) {
      params.args.update = encryptPIIFields(params.args.update, piiFields)
    }
  }

  // Handle updateMany operations
  if (params.action === 'updateMany' && params.args.data) {
    params.args.data = encryptPIIFields(params.args.data, piiFields)
  }

  // Execute the query
  const result = await next(params)

  // Decrypt PII on read operations
  if (
    result &&
    (params.action === 'findUnique' ||
      params.action === 'findFirst' ||
      params.action === 'findMany' ||
      params.action === 'create' ||
      params.action === 'update' ||
      params.action === 'upsert')
  ) {
    if (Array.isArray(result)) {
      return result.map((item) => decryptPIIFields(item, piiFields))
    } else if (result && typeof result === 'object') {
      return decryptPIIFields(result, piiFields)
    }
  }

  return result
}

/**
 * Encrypt PII fields in data object
 */
function encryptPIIFields(data: unknown, fields: string[]): unknown {
  if (!data || typeof data !== 'object') {
    return data
  }

  const encrypted = { ...data }

  for (const field of fields) {
    if (
      encrypted[field] &&
      typeof encrypted[field] === 'string' &&
      encrypted[field].trim() !== ''
    ) {
      // Only encrypt if not already encrypted
      if (!fieldEncryption.isEncrypted(encrypted[field])) {
        try {
          encrypted[field] = fieldEncryption.encrypt(encrypted[field])
        } catch (error) {
          // Keep original value if encryption fails
        }
      }
    }
  }

  return encrypted
}

/**
 * Decrypt PII fields in data object
 */
function decryptPIIFields(data: unknown, fields: string[]): unknown {
  if (!data || typeof data !== 'object') {
    return data
  }

  const decrypted = { ...data }

  for (const field of fields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      // Only decrypt if encrypted
      if (fieldEncryption.isEncrypted(decrypted[field])) {
        try {
          decrypted[field] = fieldEncryption.decrypt(decrypted[field])
        } catch (error) {
          // Keep encrypted value if decryption fails
        }
      }
    }
  }

  return decrypted
}

/**
 * Create a migration function to encrypt existing unencrypted PII data
 */
export async function migrateUnencryptedPIIData(prisma: unknown) {
  const batchSize = 100
  let processed = 0

  // Migrate Customer PII data
  const customerFields = PII_FIELDS.Customer
  let customerSkip = 0

  while (true) {
    const customers = await prisma.customer.findMany({
      skip: customerSkip,
      take: batchSize,
      select: {
        id: true,
        ...customerFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
      },
    })

    if (customers.length === 0) break

    for (const customer of customers) {
      const updates: unknown = {}
      let hasUpdates = false

      for (const field of customerFields) {
        if (
          customer[field] &&
          typeof customer[field] === 'string' &&
          !fieldEncryption.isEncrypted(customer[field])
        ) {
          updates[field] = fieldEncryption.encrypt(customer[field])
          hasUpdates = true
        }
      }

      if (hasUpdates) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: updates,
        })
        processed++
      }
    }

    customerSkip += batchSize
  }

  // Migrate User email data
  const userFields = PII_FIELDS.User
  let userSkip = 0

  while (true) {
    const users = await prisma.user.findMany({
      skip: userSkip,
      take: batchSize,
      select: {
        id: true,
        ...userFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
      },
    })

    if (users.length === 0) break

    for (const user of users) {
      const updates: unknown = {}
      let hasUpdates = false

      for (const field of userFields) {
        if (
          user[field] &&
          typeof user[field] === 'string' &&
          !fieldEncryption.isEncrypted(user[field])
        ) {
          updates[field] = fieldEncryption.encrypt(user[field])
          hasUpdates = true
        }
      }

      if (hasUpdates) {
        await prisma.user.update({
          where: { id: user.id },
          data: updates,
        })
        processed++
      }
    }

    userSkip += batchSize
  }
}
