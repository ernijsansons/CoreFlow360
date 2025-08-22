/**
 * CoreFlow360 - Secure Operations
 * Security-focused operation execution with validation and logging
 */

export interface SecureOperationConfig {
  requiresAuthentication: boolean
  requiredPermissions: string[]
  enableAuditLogging: boolean
  enableEncryption: boolean
  rateLimitKey?: string
}

export interface SecureOperationContext {
  userId?: string
  tenantId?: string
  permissions?: string[]
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

export interface SecureOperationResult<T = any> {
  success: boolean
  data?: T
  error?: string
  auditId?: string
  warnings?: string[]
}

export class SecureOperations {
  static async execute<T>(
    operation: () => Promise<T>,
    config: SecureOperationConfig,
    context: SecureOperationContext
  ): Promise<SecureOperationResult<T>> {
    try {
      // Validate authentication
      if (config.requiresAuthentication && !context.userId) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      // Validate permissions
      if (config.requiredPermissions.length > 0) {
        const hasPermissions = config.requiredPermissions.every(
          permission => context.permissions?.includes(permission)
        )
        
        if (!hasPermissions) {
          return {
            success: false,
            error: 'Insufficient permissions'
          }
        }
      }

      // Execute operation
      const result = await operation()

      // Log success if enabled
      if (config.enableAuditLogging) {
        console.log('Secure operation completed', {
          userId: context.userId,
          tenantId: context.tenantId,
          timestamp: new Date().toISOString()
        })
      }

      return {
        success: true,
        data: result
      }

    } catch (error) {
      // Log error if enabled
      if (config.enableAuditLogging) {
        console.error('Secure operation failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: context.userId,
          tenantId: context.tenantId,
          timestamp: new Date().toISOString()
        })
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed'
      }
    }
  }
}