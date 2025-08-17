/**
 * CoreFlow360 - Tenant Isolation Security Module
 * 
 * Comprehensive tenant isolation enforcement for all database operations
 * to prevent cross-tenant data access and manipulation vulnerabilities
 */

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

export interface TenantSecurityContext {
  tenantId: string
  userId?: string
  operation: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'
  entityType: string
  entityId?: string
}

export interface SecureDatabaseResult<T = any> {
  success: boolean
  data?: T
  error?: string
  securityViolation?: boolean
}

/**
 * Secure database operations with automatic tenant isolation
 */
export class TenantSecureDatabase {
  /**
   * Secure FIND operation with mandatory tenant constraint
   */
  static async findUnique<T extends Record<string, any>>(
    model: any,
    params: {
      where: any
      select?: any
      include?: any
    },
    context: TenantSecurityContext
  ): Promise<SecureDatabaseResult<T>> {
    try {
      // Enforce tenant constraint in where clause
      const secureWhere = this.enforceTenantConstraint(params.where, context.tenantId)
      
      const result = await model.findUnique({
        where: secureWhere,
        select: params.select,
        include: params.include
      })

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: `Secure find operation failed: ${error.message}`,
        securityViolation: this.isSecurityViolation(error)
      }
    }
  }

  /**
   * Secure FIND MANY operation with mandatory tenant constraint
   */
  static async findMany<T extends Record<string, any>>(
    model: any,
    params: {
      where?: any
      select?: any
      include?: any
      orderBy?: any
      take?: number
      skip?: number
    },
    context: TenantSecurityContext
  ): Promise<SecureDatabaseResult<T[]>> {
    try {
      // Enforce tenant constraint in where clause
      const secureWhere = this.enforceTenantConstraint(params.where || {}, context.tenantId)
      
      const result = await model.findMany({
        where: secureWhere,
        select: params.select,
        include: params.include,
        orderBy: params.orderBy,
        take: params.take,
        skip: params.skip
      })

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: `Secure find many operation failed: ${error.message}`,
        securityViolation: this.isSecurityViolation(error)
      }
    }
  }

  /**
   * Secure CREATE operation with automatic tenant assignment
   */
  static async create<T extends Record<string, any>>(
    model: any,
    params: {
      data: any
      select?: any
      include?: any
    },
    context: TenantSecurityContext
  ): Promise<SecureDatabaseResult<T>> {
    try {
      // Automatically inject tenant ID into create data
      const secureData = {
        ...params.data,
        tenantId: context.tenantId
      }
      
      const result = await model.create({
        data: secureData,
        select: params.select,
        include: params.include
      })

      // Log creation for audit
      await this.logSecureOperation(context, 'CREATE', result)

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: `Secure create operation failed: ${error.message?.replace(/[<>'"]/g, '') || 'Unknown error'}`,
        securityViolation: this.isSecurityViolation(error)
      }
    }
  }

  /**
   * Secure UPDATE operation with tenant verification
   */
  static async update<T extends Record<string, any>>(
    model: any,
    params: {
      where: any
      data: any
      select?: any
      include?: any
    },
    context: TenantSecurityContext
  ): Promise<SecureDatabaseResult<T>> {
    try {
      // First verify the record exists and belongs to tenant
      const existingRecord = await model.findFirst({
        where: this.enforceTenantConstraint(params.where, context.tenantId),
        select: { id: true, tenantId: true }
      })

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found or access denied',
          securityViolation: true
        }
      }

      // Verify tenant ownership
      if (existingRecord.tenantId !== context.tenantId) {
        await this.logSecurityViolation(context, 'UPDATE_TENANT_BYPASS_ATTEMPT', {
          recordTenantId: existingRecord.tenantId,
          attemptedTenantId: context.tenantId
        })
        
        return {
          success: false,
          error: 'Access denied: Cross-tenant operation attempted',
          securityViolation: true
        }
      }

      // Enforce tenant constraint in where clause
      const secureWhere = this.enforceTenantConstraint(params.where, context.tenantId)
      
      const result = await model.update({
        where: secureWhere,
        data: params.data,
        select: params.select,
        include: params.include
      })

      // Log update for audit
      await this.logSecureOperation(context, 'UPDATE', result)

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: `Secure update operation failed: ${error.message?.replace(/[<>'"]/g, '') || 'Unknown error'}`,
        securityViolation: this.isSecurityViolation(error)
      }
    }
  }

  /**
   * Secure DELETE operation with mandatory tenant verification
   */
  static async delete<T extends Record<string, any>>(
    model: any,
    params: {
      where: any
    },
    context: TenantSecurityContext
  ): Promise<SecureDatabaseResult<T>> {
    try {
      // First verify the record exists and belongs to tenant
      const existingRecord = await model.findFirst({
        where: this.enforceTenantConstraint(params.where, context.tenantId)
      })

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found or access denied',
          securityViolation: true
        }
      }

      // Double-check tenant ownership
      if (existingRecord.tenantId !== context.tenantId) {
        await this.logSecurityViolation(context, 'DELETE_TENANT_BYPASS_ATTEMPT', {
          recordTenantId: existingRecord.tenantId,
          attemptedTenantId: context.tenantId
        })
        
        return {
          success: false,
          error: 'Access denied: Cross-tenant delete attempted',
          securityViolation: true
        }
      }

      // CRITICAL: Use compound where clause with BOTH id AND tenantId
      const secureWhere = this.enforceTenantConstraint(params.where, context.tenantId)
      
      const result = await model.delete({
        where: secureWhere
      })

      // Log deletion for audit
      await this.logSecureOperation(context, 'DELETE', existingRecord)

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: `Secure delete operation failed: ${error.message?.replace(/[<>'"]/g, '') || 'Unknown error'}`,
        securityViolation: this.isSecurityViolation(error)
      }
    }
  }

  /**
   * Secure soft delete operation
   */
  static async softDelete<T extends Record<string, any>>(
    model: any,
    params: {
      where: any
      data?: any
    },
    context: TenantSecurityContext
  ): Promise<SecureDatabaseResult<T>> {
    const softDeleteData = {
      isActive: false,
      deletedAt: new Date(),
      ...params.data
    }

    return this.update(model, {
      where: params.where,
      data: softDeleteData
    }, context)
  }

  /**
   * Transaction with tenant isolation
   */
  static async transaction<T>(
    operations: ((tx: any) => Promise<T>)[],
    context: TenantSecurityContext
  ): Promise<SecureDatabaseResult<T[]>> {
    try {
      const results = await prisma.$transaction(async (tx) => {
        const operationResults = []
        
        for (const operation of operations) {
          const result = await operation(tx)
          operationResults.push(result)
        }
        
        return operationResults
      })

      // Log transaction for audit
      await this.logSecureOperation(context, 'TRANSACTION', { operationCount: operations.length })

      return { success: true, data: results }
    } catch (error) {
      return {
        success: false,
        error: `Secure transaction failed: ${error.message}`,
        securityViolation: this.isSecurityViolation(error)
      }
    }
  }

  /**
   * Enforce tenant constraint in where clauses
   */
  private static enforceTenantConstraint(where: any, tenantId: string): any {
    // Always add tenantId constraint
    return {
      ...where,
      tenantId
    }
  }

  /**
   * Check if error indicates a security violation
   */
  private static isSecurityViolation(error: any): boolean {
    const securityIndicators = [
      'P2025', // Record not found (Prisma)
      'P2002', // Unique constraint violation
      'access denied',
      'permission denied',
      'unauthorized'
    ]

    const errorMessage = error.message?.toLowerCase() || ''
    const errorCode = error.code || ''

    return securityIndicators.some(indicator => 
      errorMessage.includes(indicator.toLowerCase()) || 
      errorCode === indicator
    )
  }

  /**
   * Log secure database operations for audit
   */
  private static async logSecureOperation(
    context: TenantSecurityContext,
    operation: string,
    data: any
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: operation as any,
          entityType: context.entityType,
          entityId: context.entityId || data?.id,
          tenantId: context.tenantId,
          userId: context.userId,
          newValues: JSON.stringify(data),
          metadata: JSON.stringify({
            secureOperation: true,
            operationType: operation,
            timestamp: new Date().toISOString()
          })
        }
      })
    } catch (error) {
      console.error('Failed to log secure operation:', error)
      // Don't throw - logging failure shouldn't break the operation
    }
  }

  /**
   * Log security violations for monitoring
   */
  private static async logSecurityViolation(
    context: TenantSecurityContext,
    violationType: string,
    details: any
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: 'SECURITY_EVENT' as any,
          entityType: 'SECURITY_VIOLATION',
          entityId: context.entityId || 'unknown',
          tenantId: context.tenantId,
          userId: context.userId,
          metadata: JSON.stringify({
            violationType,
            details,
            timestamp: new Date().toISOString(),
            severity: 'CRITICAL'
          })
        }
      })

      // Also log to console for immediate attention
      console.error('🚨 CRITICAL SECURITY VIOLATION:', {
        type: violationType,
        tenantId: context.tenantId,
        userId: context.userId,
        entityType: context.entityType,
        details
      })
    } catch (error) {
      console.error('Failed to log security violation:', error)
    }
  }
}

/**
 * Utility functions for tenant isolation
 */
export const TenantSecurity = {
  /**
   * Validate tenant access for a record
   */
  async validateTenantAccess(
    recordId: string,
    tenantId: string,
    tableName: string
  ): Promise<boolean> {
    try {
      const model = (prisma as any)[tableName]
      if (!model) {
        throw new Error(`Invalid table name: ${tableName}`)
      }

      const record = await model.findUnique({
        where: { id: recordId },
        select: { tenantId: true }
      })

      return record?.tenantId === tenantId
    } catch (error) {
      console.error('Tenant access validation failed:', error)
      return false
    }
  },

  /**
   * Create a tenant-safe where clause
   */
  createTenantWhereClause(where: any, tenantId: string): any {
    return {
      ...where,
      tenantId
    }
  },

  /**
   * Validate that all IDs in a list belong to the same tenant
   */
  async validateBulkTenantAccess(
    recordIds: string[],
    tenantId: string,
    tableName: string
  ): Promise<{ valid: boolean; invalidIds: string[] }> {
    try {
      const model = (prisma as any)[tableName]
      if (!model) {
        throw new Error(`Invalid table name: ${tableName}`)
      }

      const records = await model.findMany({
        where: {
          id: { in: recordIds }
        },
        select: { id: true, tenantId: true }
      })

      const invalidIds = records
        .filter(record => record.tenantId !== tenantId)
        .map(record => record.id)

      return {
        valid: invalidIds.length === 0,
        invalidIds
      }
    } catch (error) {
      console.error('Bulk tenant access validation failed:', error)
      return { valid: false, invalidIds: recordIds }
    }
  }
}

/**
 * Middleware for automatic tenant isolation
 */
export function withTenantIsolation<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    enforceStrict?: boolean
    logViolations?: boolean
  } = {}
): T {
  return (async (...args: any[]) => {
    const [request, context] = args
    
    // Extract tenant context from request/session
    const tenantId = context?.user?.tenantId || context?.tenantId
    
    if (!tenantId && options.enforceStrict !== false) {
      throw new Error('Tenant context required for this operation')
    }

    // Add tenant security context to all database operations
    const originalArgs = args.map(arg => {
      if (arg && typeof arg === 'object' && 'tenantId' in arg) {
        return { ...arg, tenantId }
      }
      return arg
    })

    try {
      return await handler(...originalArgs)
    } catch (error) {
      if (options.logViolations !== false) {
        console.warn('Potential tenant isolation violation:', {
          tenantId,
          error: error.message,
          handler: handler.name
        })
      }
      throw error
    }
  }) as T
}