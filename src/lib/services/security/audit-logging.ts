/**
 * CoreFlow360 - Audit Logging
 * Comprehensive audit logging for security and compliance
 */

export interface AuditEvent {
  id: string
  timestamp: Date
  userId?: string
  tenantId?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  severity: 'info' | 'warn' | 'error' | 'critical'
  category: 'auth' | 'data' | 'system' | 'security' | 'compliance'
}

export interface AuditLoggerConfig {
  enableConsoleLogging: boolean
  enableDatabaseLogging: boolean
  enableFileLogging: boolean
  retentionDays: number
  sensitiveFields: string[]
}

export class AuditLogger {
  private static instance: AuditLogger
  private config: AuditLoggerConfig
  private events: AuditEvent[] = []

  constructor(config?: Partial<AuditLoggerConfig>) {
    this.config = {
      enableConsoleLogging: true,
      enableDatabaseLogging: true,
      enableFileLogging: false,
      retentionDays: 90,
      sensitiveFields: ['password', 'token', 'secret', 'key'],
      ...config
    }
  }

  static getInstance(config?: Partial<AuditLoggerConfig>): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger(config)
    }
    return AuditLogger.instance
  }

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      ...event
    }

    // Sanitize sensitive data
    auditEvent.metadata = this.sanitizeMetadata(auditEvent.metadata)

    // Store in memory (for development)
    this.events.push(auditEvent)
    
    // Keep only recent events to prevent memory leaks
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(auditEvent)
    }

    // Database logging would go here in production
    if (this.config.enableDatabaseLogging) {
      await this.logToDatabase(auditEvent)
    }

    // File logging would go here if needed
    if (this.config.enableFileLogging) {
      await this.logToFile(auditEvent)
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined

    const sanitized = { ...metadata }
    
    for (const field of this.config.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }

  private logToConsole(event: AuditEvent): void {
    const logMethod = {
      info: console.log,
      warn: console.warn,
      error: console.error,
      critical: console.error
    }[event.severity]

    logMethod(`[AUDIT] ${event.action} on ${event.resource}`, {
      id: event.id,
      userId: event.userId,
      tenantId: event.tenantId,
      timestamp: event.timestamp.toISOString(),
      metadata: event.metadata
    })
  }

  private async logToDatabase(event: AuditEvent): Promise<void> {
    // In production, this would save to database
    // For now, just simulate the async operation
    await new Promise(resolve => setTimeout(resolve, 1))
  }

  private async logToFile(event: AuditEvent): Promise<void> {
    // In production, this would write to file
    // For now, just simulate the async operation
    await new Promise(resolve => setTimeout(resolve, 1))
  }

  getEvents(filters?: {
    userId?: string
    tenantId?: string
    action?: string
    resource?: string
    severity?: string
    category?: string
    startDate?: Date
    endDate?: Date
  }): AuditEvent[] {
    let filteredEvents = [...this.events]

    if (filters) {
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === filters.userId)
      }
      if (filters.tenantId) {
        filteredEvents = filteredEvents.filter(e => e.tenantId === filters.tenantId)
      }
      if (filters.action) {
        filteredEvents = filteredEvents.filter(e => e.action.includes(filters.action!))
      }
      if (filters.resource) {
        filteredEvents = filteredEvents.filter(e => e.resource === filters.resource)
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(e => e.severity === filters.severity)
      }
      if (filters.category) {
        filteredEvents = filteredEvents.filter(e => e.category === filters.category)
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= filters.endDate!)
      }
    }

    return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  clearEvents(): void {
    this.events = []
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Convenience functions
export const logAuthEvent = (action: string, userId?: string, metadata?: Record<string, any>) => {
  return auditLogger.log({
    action,
    resource: 'authentication',
    userId,
    metadata,
    severity: 'info',
    category: 'auth'
  })
}

export const logDataEvent = (action: string, resource: string, resourceId?: string, userId?: string, tenantId?: string, metadata?: Record<string, any>) => {
  return auditLogger.log({
    action,
    resource,
    resourceId,
    userId,
    tenantId,
    metadata,
    severity: 'info',
    category: 'data'
  })
}

export const logSecurityEvent = (action: string, severity: 'warn' | 'error' | 'critical' = 'warn', metadata?: Record<string, any>) => {
  return auditLogger.log({
    action,
    resource: 'security',
    metadata,
    severity,
    category: 'security'
  })
}