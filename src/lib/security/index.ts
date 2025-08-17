/**
 * CoreFlow360 - Security Framework Exports
 * Comprehensive security operations with zero-trust architecture
 */

export {
  SecurityOperationsManager,
  SecurityViolationError,
  securityManager
} from './secure-operations'

export type {
  SecurityContext,
  SecurityPolicy,
  AuditLogEntry,
  SecurityViolation
} from './secure-operations'

// Re-export the main executeSecureOperation function for convenience
// Use lazy binding to avoid build-time initialization issues
export const executeSecureOperation = (...args: Parameters<typeof securityManager.executeSecureOperation>) => {
  return securityManager.executeSecureOperation(...args)
}

/*
// Integration Example:
// import { executeSecureOperation } from '@/lib/security'
// 
// const result = await executeSecureOperation(
//   context,
//   'user.updateProfile',
//   () => updateUserProfile(userId, data),
//   { requireAuthentication: true, requiredPermissions: ['user:update'] }
// )
*/