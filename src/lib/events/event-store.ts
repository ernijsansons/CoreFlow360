/**
 * CoreFlow360 - Event Sourcing Store
 * 
 * Immutable event log system for complete audit trail, data reconstruction,
 * and business intelligence with CQRS pattern implementation
 */

import { EventEmitter } from 'events';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface DomainEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: Record<string, any>;
  metadata: EventMetadata;
  version: number;
  timestamp: Date;
  userId?: string;
  tenantId: string;
  checksum: string;
}

export interface EventMetadata {
  source: string;
  correlationId?: string;
  causationId?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  requestId?: string;
  tags?: string[];
  schemaVersion: string;
}

export interface EventStream {
  aggregateId: string;
  aggregateType: string;
  events: DomainEvent[];
  version: number;
  snapshotData?: any;
  snapshotVersion?: number;
}

export interface Snapshot {
  id: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  data: Record<string, any>;
  timestamp: Date;
  checksum: string;
}

export interface EventProjection {
  name: string;
  version: string;
  lastProcessedEventId?: string;
  lastProcessedTimestamp?: Date;
  position: number;
  isLive: boolean;
}

export interface QueryResult<T = any> {
  data: T;
  version: number;
  lastEventId: string;
  timestamp: Date;
}

export class EventStore extends EventEmitter {
  private readonly encryptionKey: string;
  private projections: Map<string, EventProjection> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();
  private snapshotThreshold = 10; // Create snapshot every N events

  constructor() {
    super();
    this.encryptionKey = process.env.EVENT_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || '';
    
    if (!this.encryptionKey) {
      console.warn('⚠️ Event Store: No encryption key provided - events will not be encrypted');
    }

    this.initializeProjections();
  }

  /**
   * Append event to the event store
   */
  async appendEvent(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    eventData: Record<string, any>,
    metadata: Partial<EventMetadata>,
    expectedVersion?: number
  ): Promise<DomainEvent> {
    try {
      // Get current version for optimistic concurrency control
      const currentVersion = await this.getCurrentVersion(aggregateId, aggregateType);
      
      if (expectedVersion !== undefined && expectedVersion !== currentVersion) {
        throw new Error(`Concurrency conflict. Expected version ${expectedVersion}, got ${currentVersion}`);
      }

      const event: DomainEvent = {
        id: uuidv4(),
        aggregateId,
        aggregateType,
        eventType,
        eventData: this.encryptSensitiveData(eventData),
        metadata: {
          source: 'coreflow360',
          correlationId: uuidv4(),
          schemaVersion: '1.0.0',
          ...metadata
        },
        version: currentVersion + 1,
        timestamp: new Date(),
        userId: metadata.userId,
        tenantId: metadata.tenantId!,
        checksum: ''
      };

      // Calculate checksum for integrity verification
      event.checksum = this.calculateChecksum(event);

      // Persist event
      await this.persistEvent(event);

      // Emit for real-time processing
      this.emit('eventAppended', event);

      // Update projections asynchronously
      this.updateProjections(event);

      // Check if snapshot is needed
      await this.checkSnapshotRequired(aggregateId, aggregateType, event.version);

      console.log(`📝 Event appended: ${eventType} for ${aggregateType}:${aggregateId} v${event.version}`);
      
      return event;

    } catch (error) {
      console.error('Failed to append event:', error);
      throw error;
    }
  }

  /**
   * Get event stream for an aggregate
   */
  async getEventStream(
    aggregateId: string,
    aggregateType: string,
    fromVersion?: number,
    toVersion?: number
  ): Promise<EventStream> {
    try {
      const events = await this.loadEvents(aggregateId, aggregateType, fromVersion, toVersion);
      
      // Load snapshot if available
      const snapshot = await this.loadLatestSnapshot(aggregateId, aggregateType);
      
      return {
        aggregateId,
        aggregateType,
        events: events.map(e => ({
          ...e,
          eventData: this.decryptSensitiveData(e.eventData)
        })),
        version: events.length > 0 ? Math.max(...events.map(e => e.version)) : 0,
        snapshotData: snapshot?.data,
        snapshotVersion: snapshot?.version
      };

    } catch (error) {
      console.error('Failed to get event stream:', error);
      throw error;
    }
  }

  /**
   * Replay events to rebuild aggregate state
   */
  async replayEvents<T>(
    aggregateId: string,
    aggregateType: string,
    reducer: (state: T, event: DomainEvent) => T,
    initialState: T,
    toVersion?: number
  ): Promise<{ state: T; version: number }> {
    const stream = await this.getEventStream(aggregateId, aggregateType, undefined, toVersion);
    
    let state = initialState;
    
    // Start from snapshot if available
    if (stream.snapshotData && stream.snapshotVersion) {
      state = stream.snapshotData;
      // Only replay events after snapshot
      const eventsToReplay = stream.events.filter(e => e.version > stream.snapshotVersion!);
      
      for (const event of eventsToReplay) {
        state = reducer(state, event);
      }
    } else {
      // Replay all events
      for (const event of stream.events) {
        state = reducer(state, event);
      }
    }

    return {
      state,
      version: stream.version
    };
  }

  /**
   * Query events with filters
   */
  async queryEvents(filters: {
    aggregateType?: string;
    eventType?: string;
    tenantId?: string;
    userId?: string;
    startTime?: Date;
    endTime?: Date;
    correlationId?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{
    events: DomainEvent[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const {
        aggregateType,
        eventType,
        tenantId,
        userId,
        startTime,
        endTime,
        correlationId,
        tags,
        limit = 100,
        offset = 0
      } = filters;

      const whereClause: any = {};

      if (aggregateType) whereClause.aggregateType = aggregateType;
      if (eventType) whereClause.eventType = eventType;
      if (tenantId) whereClause.tenantId = tenantId;
      if (userId) whereClause.userId = userId;
      if (correlationId) whereClause.metadata = { path: ['correlationId'], equals: correlationId };
      
      if (startTime || endTime) {
        whereClause.timestamp = {};
        if (startTime) whereClause.timestamp.gte = startTime;
        if (endTime) whereClause.timestamp.lte = endTime;
      }

      if (tags && tags.length > 0) {
        whereClause.metadata = { path: ['tags'], array_contains: tags };
      }

      const [events, totalCount] = await Promise.all([
        prisma.domainEvent.findMany({
          where: whereClause,
          orderBy: { timestamp: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.domainEvent.count({ where: whereClause })
      ]);

      return {
        events: events.map(this.mapEventFromDb),
        totalCount,
        hasMore: offset + events.length < totalCount
      };

    } catch (error) {
      console.error('Failed to query events:', error);
      throw error;
    }
  }

  /**
   * Create snapshot of aggregate state
   */
  async createSnapshot(
    aggregateId: string,
    aggregateType: string,
    version: number,
    state: Record<string, any>
  ): Promise<Snapshot> {
    try {
      const snapshot: Snapshot = {
        id: uuidv4(),
        aggregateId,
        aggregateType,
        version,
        data: this.encryptSensitiveData(state),
        timestamp: new Date(),
        checksum: ''
      };

      snapshot.checksum = this.calculateSnapshotChecksum(snapshot);

      await prisma.eventSnapshot.create({
        data: {
          id: snapshot.id,
          aggregateId: snapshot.aggregateId,
          aggregateType: snapshot.aggregateType,
          version: snapshot.version,
          data: snapshot.data,
          timestamp: snapshot.timestamp,
          checksum: snapshot.checksum
        }
      });

      console.log(`📸 Snapshot created for ${aggregateType}:${aggregateId} v${version}`);
      
      return snapshot;

    } catch (error) {
      console.error('Failed to create snapshot:', error);
      throw error;
    }
  }

  /**
   * Register event handler for real-time processing
   */
  onEvent(eventType: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Register projection
   */
  registerProjection(projection: EventProjection): void {
    this.projections.set(projection.name, projection);
    this.emit('projectionRegistered', projection);
  }

  /**
   * Get event statistics
   */
  async getStatistics(tenantId?: string): Promise<{
    totalEvents: number;
    eventsToday: number;
    topAggregateTypes: Array<{ type: string; count: number }>;
    topEventTypes: Array<{ type: string; count: number }>;
    eventsByHour: Array<{ hour: string; count: number }>;
    averageEventsPerDay: number;
  }> {
    try {
      const whereClause = tenantId ? { tenantId } : {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalEvents,
        eventsToday,
        aggregateTypeStats,
        eventTypeStats
      ] = await Promise.all([
        prisma.domainEvent.count({ where: whereClause }),
        prisma.domainEvent.count({
          where: {
            ...whereClause,
            timestamp: { gte: today }
          }
        }),
        prisma.domainEvent.groupBy({
          by: ['aggregateType'],
          where: whereClause,
          _count: true,
          orderBy: { _count: { aggregateType: 'desc' } },
          take: 10
        }),
        prisma.domainEvent.groupBy({
          by: ['eventType'],
          where: whereClause,
          _count: true,
          orderBy: { _count: { eventType: 'desc' } },
          take: 10
        })
      ]);

      // Calculate events by hour for today
      const eventsByHour = await this.getEventsByHour(today, tenantId);

      // Calculate average events per day (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const eventsLast30Days = await prisma.domainEvent.count({
        where: {
          ...whereClause,
          timestamp: { gte: thirtyDaysAgo }
        }
      });

      return {
        totalEvents,
        eventsToday,
        topAggregateTypes: aggregateTypeStats.map(stat => ({
          type: stat.aggregateType,
          count: stat._count
        })),
        topEventTypes: eventTypeStats.map(stat => ({
          type: stat.eventType,
          count: stat._count
        })),
        eventsByHour,
        averageEventsPerDay: Math.round(eventsLast30Days / 30)
      };

    } catch (error) {
      console.error('Failed to get event statistics:', error);
      throw error;
    }
  }

  /**
   * Verify event integrity
   */
  async verifyEventIntegrity(eventId: string): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    try {
      const event = await this.loadEventById(eventId);
      
      if (!event) {
        return { valid: false, issues: ['Event not found'] };
      }

      const issues: string[] = [];

      // Verify checksum
      const calculatedChecksum = this.calculateChecksum({
        ...event,
        checksum: '' // Exclude checksum from calculation
      });

      if (calculatedChecksum !== event.checksum) {
        issues.push('Checksum mismatch - event may have been tampered with');
      }

      // Verify sequential version numbers
      if (event.version > 1) {
        const previousEvent = await this.loadEventByVersion(
          event.aggregateId,
          event.aggregateType,
          event.version - 1
        );

        if (!previousEvent) {
          issues.push('Missing previous event in sequence');
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };

    } catch (error) {
      console.error('Failed to verify event integrity:', error);
      return {
        valid: false,
        issues: [`Verification error: ${error.message}`]
      };
    }
  }

  private async getCurrentVersion(aggregateId: string, aggregateType: string): Promise<number> {
    const lastEvent = await prisma.domainEvent.findFirst({
      where: { aggregateId, aggregateType },
      orderBy: { version: 'desc' },
      select: { version: true }
    });

    return lastEvent?.version || 0;
  }

  private async persistEvent(event: DomainEvent): Promise<void> {
    await prisma.domainEvent.create({
      data: {
        id: event.id,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: event.eventData,
        metadata: event.metadata,
        version: event.version,
        timestamp: event.timestamp,
        userId: event.userId,
        tenantId: event.tenantId,
        checksum: event.checksum
      }
    });
  }

  private async loadEvents(
    aggregateId: string,
    aggregateType: string,
    fromVersion?: number,
    toVersion?: number
  ): Promise<DomainEvent[]> {
    const whereClause: any = { aggregateId, aggregateType };

    if (fromVersion !== undefined || toVersion !== undefined) {
      whereClause.version = {};
      if (fromVersion !== undefined) whereClause.version.gte = fromVersion;
      if (toVersion !== undefined) whereClause.version.lte = toVersion;
    }

    const events = await prisma.domainEvent.findMany({
      where: whereClause,
      orderBy: { version: 'asc' }
    });

    return events.map(this.mapEventFromDb);
  }

  private async loadEventById(eventId: string): Promise<DomainEvent | null> {
    const event = await prisma.domainEvent.findUnique({
      where: { id: eventId }
    });

    return event ? this.mapEventFromDb(event) : null;
  }

  private async loadEventByVersion(
    aggregateId: string,
    aggregateType: string,
    version: number
  ): Promise<DomainEvent | null> {
    const event = await prisma.domainEvent.findFirst({
      where: { aggregateId, aggregateType, version }
    });

    return event ? this.mapEventFromDb(event) : null;
  }

  private async loadLatestSnapshot(
    aggregateId: string,
    aggregateType: string
  ): Promise<Snapshot | null> {
    const snapshot = await prisma.eventSnapshot.findFirst({
      where: { aggregateId, aggregateType },
      orderBy: { version: 'desc' }
    });

    if (!snapshot) return null;

    return {
      id: snapshot.id,
      aggregateId: snapshot.aggregateId,
      aggregateType: snapshot.aggregateType,
      version: snapshot.version,
      data: this.decryptSensitiveData(snapshot.data as Record<string, any>),
      timestamp: snapshot.timestamp,
      checksum: snapshot.checksum
    };
  }

  private mapEventFromDb(dbEvent: any): DomainEvent {
    return {
      id: dbEvent.id,
      aggregateId: dbEvent.aggregateId,
      aggregateType: dbEvent.aggregateType,
      eventType: dbEvent.eventType,
      eventData: dbEvent.eventData,
      metadata: dbEvent.metadata,
      version: dbEvent.version,
      timestamp: dbEvent.timestamp,
      userId: dbEvent.userId,
      tenantId: dbEvent.tenantId,
      checksum: dbEvent.checksum
    };
  }

  private calculateChecksum(event: Omit<DomainEvent, 'checksum'>): string {
    const eventString = JSON.stringify({
      id: event.id,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      eventType: event.eventType,
      eventData: event.eventData,
      version: event.version,
      timestamp: event.timestamp.toISOString()
    });

    return crypto.createHash('sha256').update(eventString).digest('hex');
  }

  private calculateSnapshotChecksum(snapshot: Omit<Snapshot, 'checksum'>): string {
    const snapshotString = JSON.stringify({
      id: snapshot.id,
      aggregateId: snapshot.aggregateId,
      aggregateType: snapshot.aggregateType,
      version: snapshot.version,
      data: snapshot.data,
      timestamp: snapshot.timestamp.toISOString()
    });

    return crypto.createHash('sha256').update(snapshotString).digest('hex');
  }

  private encryptSensitiveData(data: Record<string, any>): Record<string, any> {
    if (!this.encryptionKey) return data;

    // Clone the data to avoid mutations
    const encrypted = JSON.parse(JSON.stringify(data));
    
    // Define sensitive fields that should be encrypted
    const sensitiveFields = ['email', 'phone', 'ssn', 'creditCard', 'password', 'apiKey'];
    
    const encryptField = (obj: any, path: string[] = []): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];
        
        if (sensitiveFields.includes(key) && typeof value === 'string') {
          obj[key] = this.encrypt(value);
        } else if (typeof value === 'object' && value !== null) {
          encryptField(value, currentPath);
        }
      }
    };

    encryptField(encrypted);
    return encrypted;
  }

  private decryptSensitiveData(data: Record<string, any>): Record<string, any> {
    if (!this.encryptionKey) return data;

    // Clone the data to avoid mutations
    const decrypted = JSON.parse(JSON.stringify(data));
    
    const sensitiveFields = ['email', 'phone', 'ssn', 'creditCard', 'password', 'apiKey'];
    
    const decryptField = (obj: any): void => {
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.includes(key) && typeof value === 'string') {
          try {
            obj[key] = this.decrypt(value);
          } catch {
            // If decryption fails, leave as is (might not be encrypted)
          }
        } else if (typeof value === 'object' && value !== null) {
          decryptField(value);
        }
      }
    };

    decryptField(decrypted);
    return decrypted;
  }

  private encrypt(text: string): string {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const algorithm = 'aes-256-gcm';
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private async updateProjections(event: DomainEvent): Promise<void> {
    // Process event handlers
    const handlers = this.eventHandlers.get(event.eventType) || [];
    const allHandlers = this.eventHandlers.get('*') || [];
    
    for (const handler of [...handlers, ...allHandlers]) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Event handler error for ${event.eventType}:`, error);
      }
    }

    // Update projections
    for (const projection of this.projections.values()) {
      try {
        await this.updateProjection(projection, event);
      } catch (error) {
        console.error(`Projection update error for ${projection.name}:`, error);
      }
    }
  }

  private async updateProjection(projection: EventProjection, event: DomainEvent): Promise<void> {
    // Update projection position
    projection.lastProcessedEventId = event.id;
    projection.lastProcessedTimestamp = event.timestamp;
    projection.position++;

    // Persist projection state
    await prisma.eventProjection.upsert({
      where: { name: projection.name },
      update: {
        lastProcessedEventId: projection.lastProcessedEventId,
        lastProcessedTimestamp: projection.lastProcessedTimestamp,
        position: projection.position
      },
      create: {
        name: projection.name,
        version: projection.version,
        lastProcessedEventId: projection.lastProcessedEventId,
        lastProcessedTimestamp: projection.lastProcessedTimestamp,
        position: projection.position,
        isLive: projection.isLive
      }
    });
  }

  private async checkSnapshotRequired(
    aggregateId: string,
    aggregateType: string,
    currentVersion: number
  ): Promise<void> {
    if (currentVersion % this.snapshotThreshold === 0) {
      // Auto-create snapshot every N events
      // This would need to be implemented with aggregate-specific logic
      console.log(`📸 Snapshot threshold reached for ${aggregateType}:${aggregateId} v${currentVersion}`);
    }
  }

  private async getEventsByHour(startDate: Date, tenantId?: string): Promise<Array<{ hour: string; count: number }>> {
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const whereClause: any = {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    };

    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    // This is a simplified implementation - in production, you'd use proper time bucketing
    const events = await prisma.domainEvent.findMany({
      where: whereClause,
      select: { timestamp: true }
    });

    const hourlyStats = new Map<string, number>();
    
    for (let hour = 0; hour < 24; hour++) {
      const hourKey = hour.toString().padStart(2, '0') + ':00';
      hourlyStats.set(hourKey, 0);
    }

    events.forEach(event => {
      const hour = event.timestamp.getHours().toString().padStart(2, '0') + ':00';
      hourlyStats.set(hour, (hourlyStats.get(hour) || 0) + 1);
    });

    return Array.from(hourlyStats.entries()).map(([hour, count]) => ({ hour, count }));
  }

  private initializeProjections(): void {
    // Initialize built-in projections
    this.registerProjection({
      name: 'customer-read-model',
      version: '1.0.0',
      position: 0,
      isLive: true
    });

    this.registerProjection({
      name: 'subscription-analytics',
      version: '1.0.0',
      position: 0,
      isLive: true
    });
  }
}

// Global event store instance
export const eventStore = new EventStore();