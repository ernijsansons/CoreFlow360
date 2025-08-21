/**
 * CoreFlow360 - Operational Transform Engine
 *
 * Real-time collaborative editing with conflict resolution for concurrent modifications
 * Implements OT algorithms for text, JSON objects, and arrays with causality preservation
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'

export interface Operation {
  id: string
  type:
    | 'insert'
    | 'delete'
    | 'retain'
    | 'set'
    | 'unset'
    | 'array_insert'
    | 'array_delete'
    | 'array_move'
  position?: number
  length?: number
  content?: unknown
  path?: string[]
  oldValue?: unknown
  newValue?: unknown
  fromIndex?: number
  toIndex?: number
  timestamp: number
  userId: string
  clientId: string
  revision: number
}

export interface TransformResult {
  clientOp: Operation
  serverOp: Operation
}

export interface DocumentState {
  id: string
  type: 'text' | 'json' | 'array'
  content: unknown
  revision: number
  lastModified: Date
  activeUsers: Set<string>
}

export interface OperationHistory {
  operations: Operation[]
  revisions: Map<number, Operation[]>
  lastRevision: number
}

export class OperationalTransform extends EventEmitter {
  private documents: Map<string, DocumentState> = new Map()
  private history: Map<string, OperationHistory> = new Map()
  private pendingOperations: Map<string, Operation[]> = new Map()
  private userStates: Map<string, { documentId: string; revision: number }> = new Map()

  constructor() {
    super()
    this.startCleanupTimer()
  }

  /**
   * Create or get document
   */
  getDocument(
    docId: string,
    type: 'text' | 'json' | 'array',
    initialContent?: unknown
  ): DocumentState {
    if (!this.documents.has(docId)) {
      const doc: DocumentState = {
        id: docId,
        type,
        content: initialContent || (type === 'text' ? '' : type === 'json' ? {} : []),
        revision: 0,
        lastModified: new Date(),
        activeUsers: new Set(),
      }

      this.documents.set(docId, doc)
      this.history.set(docId, {
        operations: [],
        revisions: new Map(),
        lastRevision: 0,
      })
    }

    return this.documents.get(docId)!
  }

  /**
   * Apply operation to document with transformation
   */
  async applyOperation(
    docId: string,
    operation: Operation
  ): Promise<{
    success: boolean
    transformedOp?: Operation
    newRevision: number
    conflicts?: Operation[]
  }> {
    try {
      const doc = this.documents.get(docId)
      if (!doc) {
        throw new Error(`Document ${docId} not found`)
      }

      const history = this.history.get(docId)!

      // Transform operation against all operations since the client's revision
      const transformedOp = await this.transformOperation(operation, doc, history)

      // Apply the transformed operation
      const newContent = this.applyOperationToContent(doc.content, transformedOp, doc.type)

      // Update document state
      doc.content = newContent
      doc.revision++
      doc.lastModified = new Date()

      // Store operation in history
      transformedOp.revision = doc.revision
      history.operations.push(transformedOp)

      if (!history.revisions.has(doc.revision)) {
        history.revisions.set(doc.revision, [])
      }
      history.revisions.get(doc.revision)!.push(transformedOp)
      history.lastRevision = doc.revision

      // Update user state
      this.userStates.set(operation.userId, {
        documentId: docId,
        revision: doc.revision,
      })

      // Emit operation for real-time sync
      this.emit('operationApplied', {
        documentId: docId,
        operation: transformedOp,
        newRevision: doc.revision,
        userId: operation.userId,
      })

      return {
        success: true,
        transformedOp,
        newRevision: doc.revision,
      }
    } catch (error) {
      return {
        success: false,
        newRevision: this.documents.get(docId)?.revision || 0,
      }
    }
  }

  /**
   * Transform operation against concurrent operations
   */
  private async transformOperation(
    operation: Operation,
    doc: DocumentState,
    history: OperationHistory
  ): Promise<Operation> {
    let transformedOp = { ...operation }

    // Get all operations that happened after the client's revision
    const concurrentOps = history.operations.filter(
      (op) => op.revision > operation.revision && op.userId !== operation.userId
    )

    // Transform against each concurrent operation
    for (const concurrentOp of concurrentOps) {
      const transformResult = this.transformOperationPair(transformedOp, concurrentOp, doc.type)
      transformedOp = transformResult.clientOp
    }

    return transformedOp
  }

  /**
   * Transform two operations against each other
   */
  private transformOperationPair(
    clientOp: Operation,
    serverOp: Operation,
    docType: string
  ): TransformResult {
    switch (docType) {
      case 'text':
        return this.transformTextOperations(clientOp, serverOp)
      case 'json':
        return this.transformJsonOperations(clientOp, serverOp)
      case 'array':
        return this.transformArrayOperations(clientOp, serverOp)
      default:
        throw new Error(`Unsupported document type: ${docType}`)
    }
  }

  /**
   * Transform text operations
   */
  private transformTextOperations(clientOp: Operation, serverOp: Operation): TransformResult {
    const client = { ...clientOp }
    const server = { ...serverOp }

    if (client.type === 'insert' && server.type === 'insert') {
      // Both insertions
      if (client.position! <= server.position!) {
        server.position! += client.content.length
      } else {
        client.position! += server.content.length
      }
    } else if (client.type === 'insert' && server.type === 'delete') {
      // Client insert, server delete
      if (client.position! <= server.position!) {
        server.position! += client.content.length
      } else if (client.position! < server.position! + server.length!) {
        // Insert position is within deleted range
        client.position! = server.position!
      } else {
        client.position! -= server.length!
      }
    } else if (client.type === 'delete' && server.type === 'insert') {
      // Client delete, server insert
      if (server.position! <= client.position!) {
        client.position! += server.content.length
      } else if (server.position! < client.position! + client.length!) {
        // Insert position is within deleted range
        server.position! = client.position!
      } else {
        server.position! -= client.length!
      }
    } else if (client.type === 'delete' && server.type === 'delete') {
      // Both deletions
      if (client.position! + client.length! <= server.position!) {
        // Non-overlapping: client before server
        server.position! -= client.length!
      } else if (server.position! + server.length! <= client.position!) {
        // Non-overlapping: server before client
        client.position! -= server.length!
      } else {
        // Overlapping deletions - merge them
        const start = Math.min(client.position!, server.position!)
        const end = Math.max(client.position! + client.length!, server.position! + server.length!)

        client.position! = start
        client.length! = end - start

        // Server operation becomes a no-op
        server.type = 'retain'
        server.length = 0
      }
    }

    return { clientOp: client, serverOp: server }
  }

  /**
   * Transform JSON operations
   */
  private transformJsonOperations(clientOp: Operation, serverOp: Operation): TransformResult {
    const client = { ...clientOp }
    const server = { ...serverOp }

    const clientPath = client.path?.join('.') || ''
    const serverPath = server.path?.join('.') || ''

    // If operations target different paths, no transformation needed
    if (clientPath !== serverPath) {
      return { clientOp: client, serverOp: server }
    }

    // Same path operations
    if (client.type === 'set' && server.type === 'set') {
      // Concurrent sets - use timestamp for conflict resolution
      if (client.timestamp > server.timestamp) {
        // Client wins, server becomes no-op
        server.type = 'retain'
      } else {
        // Server wins, client becomes no-op
        client.type = 'retain'
      }
    } else if (client.type === 'unset' && server.type === 'set') {
      // Client unset vs server set - server wins
      client.type = 'retain'
    } else if (client.type === 'set' && server.type === 'unset') {
      // Client set vs server unset - client wins
      server.type = 'retain'
    }

    return { clientOp: client, serverOp: server }
  }

  /**
   * Transform array operations
   */
  private transformArrayOperations(clientOp: Operation, serverOp: Operation): TransformResult {
    let client = { ...clientOp }
    let server = { ...serverOp }

    if (client.type === 'array_insert' && server.type === 'array_insert') {
      // Both insertions
      if (client.position! <= server.position!) {
        server.position!++
      } else {
        client.position!++
      }
    } else if (client.type === 'array_insert' && server.type === 'array_delete') {
      // Client insert, server delete
      if (client.position! <= server.position!) {
        server.position!++
      } else {
        client.position!--
      }
    } else if (client.type === 'array_delete' && server.type === 'array_insert') {
      // Client delete, server insert
      if (server.position! <= client.position!) {
        client.position!++
      } else {
        server.position!--
      }
    } else if (client.type === 'array_delete' && server.type === 'array_delete') {
      // Both deletions
      if (client.position! < server.position!) {
        server.position!--
      } else if (client.position! > server.position!) {
        client.position!--
      } else {
        // Same position - one becomes no-op
        server.type = 'retain'
      }
    } else if (client.type === 'array_move' && server.type === 'array_move') {
      // Both moves - complex transformation
      client = this.transformMove(client, server)
      server = this.transformMove(server, { ...clientOp })
    }

    return { clientOp: client, serverOp: server }
  }

  /**
   * Transform array move operation
   */
  private transformMove(moveOp: Operation, otherOp: Operation): Operation {
    const transformed = { ...moveOp }

    if (otherOp.type === 'array_move') {
      // Two moves
      const from1 = moveOp.fromIndex!
      const to1 = moveOp.toIndex!
      const from2 = otherOp.fromIndex!
      const to2 = otherOp.toIndex!

      // Complex move transformation logic
      if (from1 === from2) {
        // Moving same element - use timestamp for conflict resolution
        if (moveOp.timestamp <= otherOp.timestamp) {
          transformed.type = 'retain'
        }
      } else {
        // Adjust indices based on the other move
        if (from2 < from1 && to2 >= from1) {
          transformed.fromIndex!--
        } else if (from2 > from1 && to2 <= from1) {
          transformed.fromIndex!++
        }

        if (from2 < to1 && to2 >= to1) {
          transformed.toIndex!--
        } else if (from2 > to1 && to2 <= to1) {
          transformed.toIndex!++
        }
      }
    }

    return transformed
  }

  /**
   * Apply operation to content
   */
  private applyOperationToContent(
    content: unknown,
    operation: Operation,
    docType: string
  ): unknown {
    switch (docType) {
      case 'text':
        return this.applyTextOperation(content, operation)
      case 'json':
        return this.applyJsonOperation(content, operation)
      case 'array':
        return this.applyArrayOperation(content, operation)
      default:
        return content
    }
  }

  /**
   * Apply text operation
   */
  private applyTextOperation(text: string, operation: Operation): string {
    switch (operation.type) {
      case 'insert':
        return (
          text.slice(0, operation.position!) + operation.content + text.slice(operation.position!)
        )

      case 'delete':
        return (
          text.slice(0, operation.position!) + text.slice(operation.position! + operation.length!)
        )

      case 'retain':
        return text

      default:
        return text
    }
  }

  /**
   * Apply JSON operation
   */
  private applyJsonOperation(obj: unknown, operation: Operation): unknown {
    if (operation.type === 'retain') return obj

    const result = JSON.parse(JSON.stringify(obj)) // Deep clone

    if (!operation.path || operation.path.length === 0) {
      return result
    }

    let current = result
    const path = operation.path

    // Navigate to parent
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {}
      }
      current = current[path[i]]
    }

    const key = path[path.length - 1]

    switch (operation.type) {
      case 'set':
        current[key] = operation.newValue
        break

      case 'unset':
        delete current[key]
        break
    }

    return result
  }

  /**
   * Apply array operation
   */
  private applyArrayOperation(arr: unknown[], operation: Operation): unknown[] {
    const result = [...arr]

    switch (operation.type) {
      case 'array_insert':
        result.splice(operation.position!, 0, operation.content)
        break

      case 'array_delete':
        result.splice(operation.position!, 1)
        break

      case 'array_move':
        const element = result.splice(operation.fromIndex!, 1)[0]
        result.splice(operation.toIndex!, 0, element)
        break

      case 'retain':
        break
    }

    return result
  }

  /**
   * Get document synchronization state for client
   */
  getDocumentSync(
    docId: string,
    userId: string
  ): {
    document: DocumentState | null
    userRevision: number
    pendingOps: Operation[]
  } {
    const doc = this.documents.get(docId)
    const userState = this.userStates.get(userId)
    const pending = this.pendingOperations.get(`${docId}:${userId}`) || []

    return {
      document: doc || null,
      userRevision: userState?.revision || 0,
      pendingOps: pending,
    }
  }

  /**
   * Join user to document collaboration
   */
  joinDocument(docId: string, userId: string): DocumentState {
    const doc = this.getDocument(docId, 'text') // Default to text, should be specified
    doc.activeUsers.add(userId)

    this.userStates.set(userId, {
      documentId: docId,
      revision: doc.revision,
    })

    this.emit('userJoined', { documentId: docId, userId, activeUsers: Array.from(doc.activeUsers) })

    return doc
  }

  /**
   * Leave document collaboration
   */
  leaveDocument(docId: string, userId: string): void {
    const doc = this.documents.get(docId)
    if (doc) {
      doc.activeUsers.delete(userId)
      this.emit('userLeft', { documentId: docId, userId, activeUsers: Array.from(doc.activeUsers) })
    }

    this.userStates.delete(userId)
    this.pendingOperations.delete(`${docId}:${userId}`)
  }

  /**
   * Get operations since revision
   */
  getOperationsSince(docId: string, revision: number): Operation[] {
    const history = this.history.get(docId)
    if (!history) return []

    return history.operations.filter((op) => op.revision > revision)
  }

  /**
   * Create operation builders for different types
   */
  static createTextInsert(
    position: number,
    content: string,
    userId: string,
    clientId: string
  ): Operation {
    return {
      id: uuidv4(),
      type: 'insert',
      position,
      content,
      timestamp: Date.now(),
      userId,
      clientId,
      revision: 0,
    }
  }

  static createTextDelete(
    position: number,
    length: number,
    userId: string,
    clientId: string
  ): Operation {
    return {
      id: uuidv4(),
      type: 'delete',
      position,
      length,
      timestamp: Date.now(),
      userId,
      clientId,
      revision: 0,
    }
  }

  static createJsonSet(
    path: string[],
    newValue: unknown,
    userId: string,
    clientId: string
  ): Operation {
    return {
      id: uuidv4(),
      type: 'set',
      path,
      newValue,
      timestamp: Date.now(),
      userId,
      clientId,
      revision: 0,
    }
  }

  static createArrayInsert(
    position: number,
    content: unknown,
    userId: string,
    clientId: string
  ): Operation {
    return {
      id: uuidv4(),
      type: 'array_insert',
      position,
      content,
      timestamp: Date.now(),
      userId,
      clientId,
      revision: 0,
    }
  }

  /**
   * Cleanup old history and inactive documents
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupOldHistory()
    }, 60000) // Cleanup every minute
  }

  private cleanupOldHistory(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000

    for (const [docId, doc] of this.documents.entries()) {
      // Remove inactive documents (no active users for 1 hour)
      if (doc.activeUsers.size === 0 && doc.lastModified.getTime() < oneHourAgo) {
        this.documents.delete(docId)
        this.history.delete(docId)
      }
    }

    // Clean up old operations (keep last 1000 per document)
    for (const [docId, history] of this.history.entries()) {
      if (history.operations.length > 1000) {
        const keepCount = 500
        history.operations = history.operations.slice(-keepCount)

        // Update revision map
        const oldRevisions = Array.from(history.revisions.keys()).filter(
          (rev) => rev <= history.lastRevision - keepCount
        )

        for (const rev of oldRevisions) {
          history.revisions.delete(rev)
        }
      }
    }
  }

  /**
   * Get collaboration statistics
   */
  getStatistics(): {
    activeDocuments: number
    totalUsers: number
    totalOperations: number
    documentsInfo: Array<{
      id: string
      type: string
      revision: number
      activeUsers: number
      lastModified: Date
    }>
  } {
    const totalOperations = Array.from(this.history.values()).reduce(
      (sum, h) => sum + h.operations.length,
      0
    )

    const documentsInfo = Array.from(this.documents.values()).map((doc) => ({
      id: doc.id,
      type: doc.type,
      revision: doc.revision,
      activeUsers: doc.activeUsers.size,
      lastModified: doc.lastModified,
    }))

    return {
      activeDocuments: this.documents.size,
      totalUsers: this.userStates.size,
      totalOperations,
      documentsInfo,
    }
  }
}

// Global OT engine instance
export const otEngine = new OperationalTransform()
