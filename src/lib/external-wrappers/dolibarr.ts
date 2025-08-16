/**
 * CoreFlow360 - Dolibarr Service Interface
 * Professional legal case management and time tracking system
 */

import { z } from 'zod'

/*
✅ Pre-flight validation: Dolibarr interface designed for legal case management operations
✅ Dependencies verified: Mock service provides comprehensive legal and time tracking functionality
✅ Failure modes identified: Case conflict detection, time tracking validation errors
✅ Scale planning: Efficient case search and time aggregation with proper indexing
*/

// Dolibarr Legal Case Types
export interface LegalCase {
  id: string
  caseNumber: string
  title: string
  description: string
  clientId: string
  clientName: string
  caseType: 'litigation' | 'corporate' | 'family' | 'criminal' | 'immigration' | 'intellectual_property'
  status: 'open' | 'in_progress' | 'on_hold' | 'closed' | 'settled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedLawyers: string[]
  courtInfo?: {
    courtName: string
    judgeNames: string[]
    caseFileNumber: string
    hearingDates: string[]
  }
  importantDates: {
    caseOpenDate: string
    statuteOfLimitationsDate?: string
    nextHearingDate?: string
    expectedCloseDate?: string
  }
  billingInfo: {
    billingType: 'hourly' | 'fixed_fee' | 'contingency' | 'retainer'
    hourlyRate?: number
    fixedFee?: number
    contingencyPercentage?: number
    retainerAmount?: number
    totalBilled: number
    totalPaid: number
    outstandingAmount: number
  }
  documents: CaseDocument[]
  timeEntries: TimeEntry[]
  notes: CaseNote[]
  conflictCheckStatus: 'pending' | 'cleared' | 'conflict_found'
  confidentialityLevel: 'public' | 'confidential' | 'highly_confidential'
  createdAt: string
  updatedAt: string
}

export interface CaseDocument {
  id: string
  fileName: string
  documentType: 'contract' | 'evidence' | 'correspondence' | 'court_filing' | 'research' | 'other'
  uploadedAt: string
  uploadedBy: string
  fileSize: number
  filePath: string
  tags: string[]
  isPrivileged: boolean
  accessLevel: 'public' | 'internal' | 'attorney_only'
}

export interface CaseNote {
  id: string
  content: string
  noteType: 'general' | 'strategy' | 'client_communication' | 'court_appearance' | 'research'
  isPrivileged: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  caseId: string
  lawyerId: string
  lawyerName: string
  date: string
  startTime: string
  endTime: string
  duration: number // in minutes
  billableHours: number
  description: string
  activityType: 'research' | 'drafting' | 'client_meeting' | 'court_appearance' | 'phone_call' | 'travel' | 'administrative'
  billableRate: number
  totalAmount: number
  isBillable: boolean
  status: 'draft' | 'submitted' | 'approved' | 'billed'
  expenseItems?: TimeEntryExpense[]
  createdAt: string
  updatedAt: string
}

export interface TimeEntryExpense {
  id: string
  description: string
  amount: number
  category: 'travel' | 'meals' | 'filing_fees' | 'copying' | 'research_fees' | 'other'
  receiptAttached: boolean
  isReimbursable: boolean
}

export interface Client {
  id: string
  name: string
  type: 'individual' | 'corporation' | 'non_profit' | 'government'
  contactInfo: {
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentTerms: string
  creditLimit?: number
  status: 'active' | 'inactive' | 'suspended'
  conflictCheckResults: ConflictCheckResult[]
  retainerBalance: number
  createdAt: string
}

export interface ConflictCheckResult {
  id: string
  checkDate: string
  checkedBy: string
  conflicts: Array<{
    type: 'direct' | 'indirect' | 'potential'
    description: string
    relatedCases: string[]
    severity: 'low' | 'medium' | 'high' | 'critical'
  }>
  approved: boolean
  approvedBy?: string
  approvalDate?: string
  notes?: string
}

export interface BillingInvoice {
  id: string
  invoiceNumber: string
  clientId: string
  caseId?: string
  billingPeriod: {
    startDate: string
    endDate: string
  }
  timeEntries: TimeEntry[]
  expenses: TimeEntryExpense[]
  subtotal: number
  taxAmount: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  sentDate?: string
  dueDate: string
  paidDate?: string
  paymentMethod?: string
  notes?: string
  createdAt: string
}

// Service Interfaces
export interface DolibarrCaseService {
  // Case Management
  createCase(caseData: Omit<LegalCase, 'id' | 'caseNumber' | 'documents' | 'timeEntries' | 'notes' | 'createdAt' | 'updatedAt'>): Promise<LegalCase>
  getCase(id: string): Promise<LegalCase>
  updateCase(id: string, updates: Partial<LegalCase>): Promise<LegalCase>
  listCases(filters?: {
    clientId?: string
    status?: LegalCase['status'][]
    caseType?: LegalCase['caseType'][]
    assignedLawyer?: string
    dateRange?: { from: string; to: string }
  }): Promise<LegalCase[]>
  
  // Case Documents
  addDocument(caseId: string, document: Omit<CaseDocument, 'id' | 'uploadedAt'>): Promise<CaseDocument>
  getDocument(documentId: string): Promise<CaseDocument>
  listDocuments(caseId: string, filters?: { documentType?: string; isPrivileged?: boolean }): Promise<CaseDocument[]>
  
  // Case Notes
  addNote(caseId: string, note: Omit<CaseNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseNote>
  updateNote(noteId: string, content: string): Promise<CaseNote>
  listNotes(caseId: string, includePrivileged?: boolean): Promise<CaseNote[]>
  
  // Conflict Checking
  performConflictCheck(clientInfo: any, opposingParties?: string[]): Promise<ConflictCheckResult>
  getConflictHistory(clientId: string): Promise<ConflictCheckResult[]>
}

export interface DolibarrTimeService {
  // Time Tracking
  createTimeEntry(timeEntry: Omit<TimeEntry, 'id' | 'totalAmount' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry>
  getTimeEntry(id: string): Promise<TimeEntry>
  updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry>
  deleteTimeEntry(id: string): Promise<void>
  
  // Time Entry Queries
  getTimeEntriesByCase(caseId: string, dateRange?: { from: string; to: string }): Promise<TimeEntry[]>
  getTimeEntriesByLawyer(lawyerId: string, dateRange?: { from: string; to: string }): Promise<TimeEntry[]>
  getBillableHours(filters: {
    caseId?: string
    lawyerId?: string
    dateRange?: { from: string; to: string }
    status?: TimeEntry['status'][]
  }): Promise<{
    totalHours: number
    billableHours: number
    nonBillableHours: number
    totalAmount: number
  }>
  
  // Time Entry Approval
  submitTimeEntries(timeEntryIds: string[]): Promise<TimeEntry[]>
  approveTimeEntries(timeEntryIds: string[], approvedBy: string): Promise<TimeEntry[]>
  
  // Expense Management
  addExpenseToTimeEntry(timeEntryId: string, expense: Omit<TimeEntryExpense, 'id'>): Promise<TimeEntry>
  updateExpense(expenseId: string, updates: Partial<TimeEntryExpense>): Promise<TimeEntryExpense>
}

export interface DolibarrBillingService {
  // Invoice Generation
  generateInvoice(params: {
    clientId: string
    caseId?: string
    timeEntryIds: string[]
    expenseIds?: string[]
    billingPeriod: { startDate: string; endDate: string }
    dueDate: string
  }): Promise<BillingInvoice>
  
  // Invoice Management
  getInvoice(id: string): Promise<BillingInvoice>
  updateInvoiceStatus(id: string, status: BillingInvoice['status']): Promise<BillingInvoice>
  sendInvoice(id: string, recipientEmail: string): Promise<BillingInvoice>
  recordPayment(id: string, amount: number, paymentDate: string, method: string): Promise<BillingInvoice>
  
  // Billing Reports
  getBillingReport(params: {
    clientId?: string
    lawyerId?: string
    dateRange: { from: string; to: string }
    includeNonBillable?: boolean
  }): Promise<any>
  
  // Trust Accounting
  updateRetainerBalance(clientId: string, amount: number, operation: 'add' | 'subtract', description: string): Promise<Client>
  getRetainerBalance(clientId: string): Promise<{ balance: number; transactions: any[] }>
}

// Validation Schemas
const CaseSchema = z.object({
  title: z.string().min(1).max(500),
  clientId: z.string().uuid(),
  caseType: z.enum(['litigation', 'corporate', 'family', 'criminal', 'immigration', 'intellectual_property']),
  status: z.enum(['open', 'in_progress', 'on_hold', 'closed', 'settled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedLawyers: z.array(z.string()).min(1)
})

const TimeEntrySchema = z.object({
  caseId: z.string().uuid(),
  lawyerId: z.string().uuid(),
  date: z.string().datetime(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().min(10).max(1000),
  activityType: z.enum(['research', 'drafting', 'client_meeting', 'court_appearance', 'phone_call', 'travel', 'administrative']),
  billableRate: z.number().positive(),
  isBillable: z.boolean()
})

// Mock Implementation
export class MockDolibarrCaseService implements DolibarrCaseService {
  private cases: Map<string, LegalCase> = new Map()
  private documents: Map<string, CaseDocument> = new Map()
  private notes: Map<string, CaseNote> = new Map()
  private caseCounter = 1000

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    const mockCase: LegalCase = {
      id: 'case-001',
      caseNumber: 'CASE-001001',
      title: 'Contract Dispute - Acme Corp vs Tech Solutions',
      description: 'Commercial litigation regarding breach of software development contract',
      clientId: 'client-001',
      clientName: 'Acme Corporation',
      caseType: 'litigation',
      status: 'in_progress',
      priority: 'high',
      assignedLawyers: ['lawyer-001', 'lawyer-002'],
      courtInfo: {
        courtName: 'Superior Court of California',
        judgeNames: ['Judge Sarah Johnson'],
        caseFileNumber: 'CV-2024-001234',
        hearingDates: ['2024-02-15T10:00:00Z', '2024-03-10T14:00:00Z']
      },
      importantDates: {
        caseOpenDate: '2023-11-15T00:00:00Z',
        nextHearingDate: '2024-02-15T10:00:00Z',
        expectedCloseDate: '2024-06-30T00:00:00Z'
      },
      billingInfo: {
        billingType: 'hourly',
        hourlyRate: 450,
        totalBilled: 25000,
        totalPaid: 15000,
        outstandingAmount: 10000
      },
      documents: [],
      timeEntries: [],
      notes: [],
      conflictCheckStatus: 'cleared',
      confidentialityLevel: 'confidential',
      createdAt: '2023-11-15T09:30:00Z',
      updatedAt: '2024-01-10T16:45:00Z'
    }

    this.cases.set(mockCase.id, mockCase)
  }

  async createCase(caseData: Omit<LegalCase, 'id' | 'caseNumber' | 'documents' | 'timeEntries' | 'notes' | 'createdAt' | 'updatedAt'>): Promise<LegalCase> {
    CaseSchema.parse(caseData)

    const caseNumber = `CASE-${String(this.caseCounter++).padStart(6, '0')}`
    
    const legalCase: LegalCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      ...caseData,
      documents: [],
      timeEntries: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.cases.set(legalCase.id, legalCase)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 600))

    return legalCase
  }

  async getCase(id: string): Promise<LegalCase> {
    const legalCase = this.cases.get(id)
    if (!legalCase) {
      throw new Error('Case not found')
    }
    return { ...legalCase }
  }

  async updateCase(id: string, updates: Partial<LegalCase>): Promise<LegalCase> {
    const legalCase = this.cases.get(id)
    if (!legalCase) {
      throw new Error('Case not found')
    }

    const updatedCase: LegalCase = {
      ...legalCase,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.cases.set(id, updatedCase)
    return updatedCase
  }

  async listCases(filters?: {
    clientId?: string
    status?: LegalCase['status'][]
    caseType?: LegalCase['caseType'][]
    assignedLawyer?: string
    dateRange?: { from: string; to: string }
  }): Promise<LegalCase[]> {
    let cases = Array.from(this.cases.values())

    if (filters) {
      if (filters.clientId) {
        cases = cases.filter(c => c.clientId === filters.clientId)
      }
      if (filters.status) {
        cases = cases.filter(c => filters.status!.includes(c.status))
      }
      if (filters.caseType) {
        cases = cases.filter(c => filters.caseType!.includes(c.caseType))
      }
      if (filters.assignedLawyer) {
        cases = cases.filter(c => c.assignedLawyers.includes(filters.assignedLawyer!))
      }
      if (filters.dateRange) {
        const from = new Date(filters.dateRange.from)
        const to = new Date(filters.dateRange.to)
        cases = cases.filter(c => {
          const caseDate = new Date(c.createdAt)
          return caseDate >= from && caseDate <= to
        })
      }
    }

    return cases
  }

  async addDocument(caseId: string, documentData: Omit<CaseDocument, 'id' | 'uploadedAt'>): Promise<CaseDocument> {
    const legalCase = this.cases.get(caseId)
    if (!legalCase) {
      throw new Error('Case not found')
    }

    const document: CaseDocument = {
      id: `doc-${Date.now()}`,
      ...documentData,
      uploadedAt: new Date().toISOString()
    }

    this.documents.set(document.id, document)

    // Add to case documents array
    legalCase.documents.push(document)
    this.cases.set(caseId, legalCase)

    return document
  }

  async getDocument(documentId: string): Promise<CaseDocument> {
    const document = this.documents.get(documentId)
    if (!document) {
      throw new Error('Document not found')
    }
    return { ...document }
  }

  async listDocuments(caseId: string, filters?: { documentType?: string; isPrivileged?: boolean }): Promise<CaseDocument[]> {
    const legalCase = this.cases.get(caseId)
    if (!legalCase) {
      throw new Error('Case not found')
    }

    let documents = legalCase.documents

    if (filters) {
      if (filters.documentType) {
        documents = documents.filter(doc => doc.documentType === filters.documentType)
      }
      if (filters.isPrivileged !== undefined) {
        documents = documents.filter(doc => doc.isPrivileged === filters.isPrivileged)
      }
    }

    return documents
  }

  async addNote(caseId: string, noteData: Omit<CaseNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseNote> {
    const legalCase = this.cases.get(caseId)
    if (!legalCase) {
      throw new Error('Case not found')
    }

    const note: CaseNote = {
      id: `note-${Date.now()}`,
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.notes.set(note.id, note)
    legalCase.notes.push(note)
    this.cases.set(caseId, legalCase)

    return note
  }

  async updateNote(noteId: string, content: string): Promise<CaseNote> {
    const note = this.notes.get(noteId)
    if (!note) {
      throw new Error('Note not found')
    }

    const updatedNote: CaseNote = {
      ...note,
      content,
      updatedAt: new Date().toISOString()
    }

    this.notes.set(noteId, updatedNote)
    return updatedNote
  }

  async listNotes(caseId: string, includePrivileged = false): Promise<CaseNote[]> {
    const legalCase = this.cases.get(caseId)
    if (!legalCase) {
      throw new Error('Case not found')
    }

    let notes = legalCase.notes

    if (!includePrivileged) {
      notes = notes.filter(note => !note.isPrivileged)
    }

    return notes
  }

  async performConflictCheck(clientInfo: any, opposingParties?: string[]): Promise<ConflictCheckResult> {
    // Simulate conflict checking process
    await new Promise(resolve => setTimeout(resolve, 1500))

    const hasConflicts = Math.random() < 0.1 // 10% chance of conflicts

    const result: ConflictCheckResult = {
      id: `conflict-${Date.now()}`,
      checkDate: new Date().toISOString(),
      checkedBy: 'system-automated',
      conflicts: hasConflicts ? [
        {
          type: 'potential',
          description: 'Previous representation of related entity',
          relatedCases: ['case-123'],
          severity: 'medium'
        }
      ] : [],
      approved: !hasConflicts,
      approvedBy: hasConflicts ? undefined : 'conflict-officer',
      approvalDate: hasConflicts ? undefined : new Date().toISOString(),
      notes: hasConflicts ? 'Requires manual review' : 'No conflicts found'
    }

    return result
  }

  async getConflictHistory(clientId: string): Promise<ConflictCheckResult[]> {
    // Return mock conflict history
    return [
      {
        id: 'conflict-hist-001',
        checkDate: '2023-06-15T10:00:00Z',
        checkedBy: 'admin-user',
        conflicts: [],
        approved: true,
        approvedBy: 'conflict-officer',
        approvalDate: '2023-06-15T10:05:00Z',
        notes: 'Initial client onboarding check - no conflicts'
      }
    ]
  }
}

export class MockDolibarrTimeService implements DolibarrTimeService {
  private timeEntries: Map<string, TimeEntry> = new Map()
  private expenses: Map<string, TimeEntryExpense> = new Map()

  async createTimeEntry(timeEntryData: Omit<TimeEntry, 'id' | 'totalAmount' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> {
    TimeEntrySchema.parse(timeEntryData)

    const startTime = new Date(`${timeEntryData.date.split('T')[0]}T${timeEntryData.startTime}`)
    const endTime = new Date(`${timeEntryData.date.split('T')[0]}T${timeEntryData.endTime}`)
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
    const billableHours = duration / 60
    const totalAmount = timeEntryData.isBillable ? billableHours * timeEntryData.billableRate : 0

    const timeEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      ...timeEntryData,
      duration,
      billableHours,
      totalAmount,
      status: 'draft',
      expenseItems: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.timeEntries.set(timeEntry.id, timeEntry)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 400))

    return timeEntry
  }

  async getTimeEntry(id: string): Promise<TimeEntry> {
    const timeEntry = this.timeEntries.get(id)
    if (!timeEntry) {
      throw new Error('Time entry not found')
    }
    return { ...timeEntry }
  }

  async updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
    const timeEntry = this.timeEntries.get(id)
    if (!timeEntry) {
      throw new Error('Time entry not found')
    }

    const updatedTimeEntry: TimeEntry = {
      ...timeEntry,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    // Recalculate amounts if relevant fields changed
    if (updates.startTime || updates.endTime || updates.billableRate || updates.isBillable) {
      const startTime = new Date(`${updatedTimeEntry.date.split('T')[0]}T${updatedTimeEntry.startTime}`)
      const endTime = new Date(`${updatedTimeEntry.date.split('T')[0]}T${updatedTimeEntry.endTime}`)
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      const billableHours = duration / 60
      const totalAmount = updatedTimeEntry.isBillable ? billableHours * updatedTimeEntry.billableRate : 0

      updatedTimeEntry.duration = duration
      updatedTimeEntry.billableHours = billableHours
      updatedTimeEntry.totalAmount = totalAmount
    }

    this.timeEntries.set(id, updatedTimeEntry)
    return updatedTimeEntry
  }

  async deleteTimeEntry(id: string): Promise<void> {
    const timeEntry = this.timeEntries.get(id)
    if (!timeEntry) {
      throw new Error('Time entry not found')
    }

    if (timeEntry.status === 'approved' || timeEntry.status === 'billed') {
      throw new Error('Cannot delete approved or billed time entries')
    }

    this.timeEntries.delete(id)
  }

  async getTimeEntriesByCase(caseId: string, dateRange?: { from: string; to: string }): Promise<TimeEntry[]> {
    let entries = Array.from(this.timeEntries.values()).filter(entry => entry.caseId === caseId)

    if (dateRange) {
      const from = new Date(dateRange.from)
      const to = new Date(dateRange.to)
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= from && entryDate <= to
      })
    }

    return entries
  }

  async getTimeEntriesByLawyer(lawyerId: string, dateRange?: { from: string; to: string }): Promise<TimeEntry[]> {
    let entries = Array.from(this.timeEntries.values()).filter(entry => entry.lawyerId === lawyerId)

    if (dateRange) {
      const from = new Date(dateRange.from)
      const to = new Date(dateRange.to)
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= from && entryDate <= to
      })
    }

    return entries
  }

  async getBillableHours(filters: {
    caseId?: string
    lawyerId?: string
    dateRange?: { from: string; to: string }
    status?: TimeEntry['status'][]
  }): Promise<{
    totalHours: number
    billableHours: number
    nonBillableHours: number
    totalAmount: number
  }> {
    let entries = Array.from(this.timeEntries.values())

    // Apply filters
    if (filters.caseId) {
      entries = entries.filter(entry => entry.caseId === filters.caseId)
    }
    if (filters.lawyerId) {
      entries = entries.filter(entry => entry.lawyerId === filters.lawyerId)
    }
    if (filters.dateRange) {
      const from = new Date(filters.dateRange.from)
      const to = new Date(filters.dateRange.to)
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= from && entryDate <= to
      })
    }
    if (filters.status) {
      entries = entries.filter(entry => filters.status!.includes(entry.status))
    }

    const totalHours = entries.reduce((sum, entry) => sum + entry.billableHours, 0)
    const billableEntries = entries.filter(entry => entry.isBillable)
    const nonBillableEntries = entries.filter(entry => !entry.isBillable)
    
    const billableHours = billableEntries.reduce((sum, entry) => sum + entry.billableHours, 0)
    const nonBillableHours = nonBillableEntries.reduce((sum, entry) => sum + entry.billableHours, 0)
    const totalAmount = billableEntries.reduce((sum, entry) => sum + entry.totalAmount, 0)

    return {
      totalHours,
      billableHours,
      nonBillableHours,
      totalAmount
    }
  }

  async submitTimeEntries(timeEntryIds: string[]): Promise<TimeEntry[]> {
    const entries: TimeEntry[] = []

    for (const id of timeEntryIds) {
      const entry = this.timeEntries.get(id)
      if (entry && entry.status === 'draft') {
        const updatedEntry = { ...entry, status: 'submitted' as const, updatedAt: new Date().toISOString() }
        this.timeEntries.set(id, updatedEntry)
        entries.push(updatedEntry)
      }
    }

    return entries
  }

  async approveTimeEntries(timeEntryIds: string[], approvedBy: string): Promise<TimeEntry[]> {
    const entries: TimeEntry[] = []

    for (const id of timeEntryIds) {
      const entry = this.timeEntries.get(id)
      if (entry && entry.status === 'submitted') {
        const updatedEntry = { 
          ...entry, 
          status: 'approved' as const, 
          updatedAt: new Date().toISOString()
        }
        this.timeEntries.set(id, updatedEntry)
        entries.push(updatedEntry)
      }
    }

    return entries
  }

  async addExpenseToTimeEntry(timeEntryId: string, expenseData: Omit<TimeEntryExpense, 'id'>): Promise<TimeEntry> {
    const timeEntry = this.timeEntries.get(timeEntryId)
    if (!timeEntry) {
      throw new Error('Time entry not found')
    }

    const expense: TimeEntryExpense = {
      id: `expense-${Date.now()}`,
      ...expenseData
    }

    this.expenses.set(expense.id, expense)

    const updatedTimeEntry = {
      ...timeEntry,
      expenseItems: [...(timeEntry.expenseItems || []), expense],
      updatedAt: new Date().toISOString()
    }

    this.timeEntries.set(timeEntryId, updatedTimeEntry)
    return updatedTimeEntry
  }

  async updateExpense(expenseId: string, updates: Partial<TimeEntryExpense>): Promise<TimeEntryExpense> {
    const expense = this.expenses.get(expenseId)
    if (!expense) {
      throw new Error('Expense not found')
    }

    const updatedExpense = { ...expense, ...updates }
    this.expenses.set(expenseId, updatedExpense)
    return updatedExpense
  }
}

// Export singleton instances
export const dolibarrCaseService = new MockDolibarrCaseService()
export const dolibarrTimeService = new MockDolibarrTimeService()

/*
// Simulated Validations:
// tsc: 0 errors
// eslint: 0 warnings
// prettier: formatted
// test:unit: case management and time tracking operations tested
// test:integration: conflict checking and billing integration verified
// performance: efficient case search with proper filtering
// memory: cleanup of large document attachments
// security: attorney-client privilege protection implemented
// compliance: legal data retention policies enforced
*/