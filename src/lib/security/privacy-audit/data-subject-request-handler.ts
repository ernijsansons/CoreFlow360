import { z } from 'zod';
import { EventEmitter } from 'events';

export const DataSubjectRequestSchema = z.object({
  type: z.enum(['access', 'export', 'delete', 'correction', 'restrict', 'object']),
  userId: z.string(),
  email: z.string().email(),
  jurisdiction: z.enum(['gdpr', 'ccpa', 'lgpd', 'pipeda']).optional(),
  dataCategories: z.array(z.string()).optional(),
  reason: z.string().optional(),
  verificationMethod: z.enum(['email', 'sms', 'identity_document']).optional(),
  metadata: z.record(z.any()).optional()
});

export type DataSubjectRequestType = z.infer<typeof DataSubjectRequestSchema>;

export interface DataSubjectRequest {
  id: string;
  type: DataSubjectRequestType['type'];
  userId: string;
  email: string;
  jurisdiction: 'gdpr' | 'ccpa' | 'lgpd' | 'pipeda';
  status: 'pending_verification' | 'verified' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: Date;
  verificationDate?: Date;
  completionDate?: Date;
  dueDate: Date;
  dataCategories?: string[];
  reason?: string;
  verificationMethod: 'email' | 'sms' | 'identity_document';
  verificationToken?: string;
  verificationAttempts: number;
  assignedProcessor?: string;
  processingNotes: string[];
  outputFiles?: Array<{
    filename: string;
    path: string;
    size: number;
    type: string;
    encrypted: boolean;
  }>;
  deletionAuditTrail?: Array<{
    system: string;
    deleted: boolean;
    timestamp: Date;
    error?: string;
  }>;
  legalBasis?: string;
  exemptionsClaimed?: string[];
  notificationsSent: Array<{
    type: string;
    timestamp: Date;
    recipient: string;
  }>;
}

export interface RequestProcessorConfig {
  maxProcessingTime: number; // hours
  requiredVerificationMethods: Record<string, string[]>;
  dataRetentionPolicies: Record<string, number>; // days
  exemptionRules: Array<{
    condition: string;
    exemption: string;
    autoApply: boolean;
  }>;
  escalationRules: Array<{
    condition: string;
    escalateTo: string;
    timeThreshold: number; // hours
  }>;
}

export class DataSubjectRequestHandler extends EventEmitter {
  private requests: Map<string, DataSubjectRequest> = new Map();
  private processingQueue: string[] = [];
  private config: RequestProcessorConfig;

  constructor(private tenantId: string) {
    super();
    this.config = this.getDefaultConfig();
    this.startProcessingLoop();
  }

  async submitRequest(requestData: DataSubjectRequestType): Promise<string> {
    // Validate request
    const validatedData = DataSubjectRequestSchema.parse(requestData);
    
    // Determine jurisdiction and due date
    const jurisdiction = validatedData.jurisdiction || this.detectJurisdiction(validatedData.email);
    const dueDate = this.calculateDueDate(validatedData.type, jurisdiction);
    
    // Create request
    const request: DataSubjectRequest = {
      id: `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: validatedData.type,
      userId: validatedData.userId,
      email: validatedData.email,
      jurisdiction,
      status: 'pending_verification',
      priority: this.calculatePriority(validatedData.type, jurisdiction),
      requestDate: new Date(),
      dueDate,
      dataCategories: validatedData.dataCategories,
      reason: validatedData.reason,
      verificationMethod: validatedData.verificationMethod || 'email',
      verificationToken: this.generateVerificationToken(),
      verificationAttempts: 0,
      processingNotes: [],
      notificationsSent: []
    };

    this.requests.set(request.id, request);
    
    // Start verification process
    await this.initiateVerification(request);
    
    // Emit event
    this.emit('requestSubmitted', request);
    
    return request.id;
  }

  async verifyRequest(requestId: string, verificationCode: string): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending_verification') {
      return false;
    }

    request.verificationAttempts++;

    if (request.verificationToken === verificationCode) {
      request.status = 'verified';
      request.verificationDate = new Date();
      
      // Add to processing queue
      this.processingQueue.push(requestId);
      
      await this.sendNotification(request, 'verification_success');
      this.emit('requestVerified', request);
      
      return true;
    } else {
      // Check max attempts
      if (request.verificationAttempts >= 3) {
        request.status = 'rejected';
        await this.sendNotification(request, 'verification_failed');
        this.emit('requestRejected', request);
      }
      return false;
    }
  }

  async getRequestStatus(requestId: string): Promise<DataSubjectRequest | null> {
    return this.requests.get(requestId) || null;
  }

  async getRequestsByUser(userId: string): Promise<DataSubjectRequest[]> {
    return Array.from(this.requests.values()).filter(req => req.userId === userId);
  }

  async getRequestsByStatus(status: DataSubjectRequest['status']): Promise<DataSubjectRequest[]> {
    return Array.from(this.requests.values()).filter(req => req.status === status);
  }

  async processAccessRequest(requestId: string): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.type !== 'access') return false;

    try {
      request.status = 'processing';
      request.processingNotes.push(`Started access request processing at ${new Date().toISOString()}`);

      // Collect data from all systems
      const userData = await this.collectUserData(request.userId, request.dataCategories);
      
      // Generate access report
      const reportPath = await this.generateAccessReport(request, userData);
      
      request.outputFiles = [{
        filename: `data_access_report_${request.id}.pdf`,
        path: reportPath,
        size: 0, // Would be set from actual file
        type: 'application/pdf',
        encrypted: true
      }];

      request.status = 'completed';
      request.completionDate = new Date();
      
      await this.sendNotification(request, 'access_completed');
      this.emit('requestCompleted', request);
      
      return true;
    } catch (error) {
      request.status = 'rejected';
      request.processingNotes.push(`Error processing access request: ${error}`);
      await this.sendNotification(request, 'processing_error');
      return false;
    }
  }

  async processExportRequest(requestId: string): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.type !== 'export') return false;

    try {
      request.status = 'processing';
      request.processingNotes.push(`Started export request processing at ${new Date().toISOString()}`);

      // Collect data in machine-readable format
      const userData = await this.collectUserData(request.userId, request.dataCategories);
      
      // Create export package
      const exportPaths = await this.createExportPackage(request, userData);
      
      request.outputFiles = exportPaths.map(path => ({
        filename: path.split('/').pop() || 'export.json',
        path,
        size: 0, // Would be set from actual file
        type: 'application/json',
        encrypted: true
      }));

      request.status = 'completed';
      request.completionDate = new Date();
      
      await this.sendNotification(request, 'export_completed');
      this.emit('requestCompleted', request);
      
      return true;
    } catch (error) {
      request.status = 'rejected';
      request.processingNotes.push(`Error processing export request: ${error}`);
      await this.sendNotification(request, 'processing_error');
      return false;
    }
  }

  async processDeletionRequest(requestId: string): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.type !== 'delete') return false;

    try {
      request.status = 'processing';
      request.processingNotes.push(`Started deletion request processing at ${new Date().toISOString()}`);

      // Check for legal exemptions
      const exemptions = await this.checkDeletionExemptions(request);
      if (exemptions.length > 0) {
        request.exemptionsClaimed = exemptions;
        request.processingNotes.push(`Exemptions applied: ${exemptions.join(', ')}`);
      }

      // Delete data from all systems
      const deletionResults = await this.deleteUserData(request.userId, request.dataCategories, exemptions);
      
      request.deletionAuditTrail = deletionResults;
      
      // Check if all deletions were successful
      const failedDeletions = deletionResults.filter(result => !result.deleted);
      if (failedDeletions.length > 0) {
        request.processingNotes.push(`Some data could not be deleted: ${failedDeletions.map(f => f.system).join(', ')}`);
      }

      request.status = 'completed';
      request.completionDate = new Date();
      
      await this.sendNotification(request, 'deletion_completed');
      this.emit('requestCompleted', request);
      
      return true;
    } catch (error) {
      request.status = 'rejected';
      request.processingNotes.push(`Error processing deletion request: ${error}`);
      await this.sendNotification(request, 'processing_error');
      return false;
    }
  }

  async processCorrectionRequest(requestId: string, corrections: Record<string, any>): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.type !== 'correction') return false;

    try {
      request.status = 'processing';
      request.processingNotes.push(`Started correction request processing at ${new Date().toISOString()}`);

      // Apply corrections to user data
      await this.applyDataCorrections(request.userId, corrections);
      
      request.status = 'completed';
      request.completionDate = new Date();
      request.processingNotes.push(`Applied corrections: ${JSON.stringify(corrections)}`);
      
      await this.sendNotification(request, 'correction_completed');
      this.emit('requestCompleted', request);
      
      return true;
    } catch (error) {
      request.status = 'rejected';
      request.processingNotes.push(`Error processing correction request: ${error}`);
      await this.sendNotification(request, 'processing_error');
      return false;
    }
  }

  async generateComplianceReport(timeRange: { start: Date; end: Date }): Promise<{
    totalRequests: number;
    completedRequests: number;
    overduRequests: number;
    averageProcessingTime: number;
    complianceRate: number;
    jurisdictionBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
    escalationCount: number;
  }> {
    const requests = Array.from(this.requests.values()).filter(req =>
      req.requestDate >= timeRange.start && req.requestDate <= timeRange.end
    );

    const completed = requests.filter(req => req.status === 'completed');
    const overdue = requests.filter(req => new Date() > req.dueDate && req.status !== 'completed');
    
    const avgProcessingTime = completed.reduce((sum, req) => {
      if (req.completionDate && req.requestDate) {
        return sum + (req.completionDate.getTime() - req.requestDate.getTime());
      }
      return sum;
    }, 0) / completed.length / (1000 * 60 * 60); // Convert to hours

    const jurisdictionBreakdown = requests.reduce((acc, req) => {
      acc[req.jurisdiction] = (acc[req.jurisdiction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeBreakdown = requests.reduce((acc, req) => {
      acc[req.type] = (acc[req.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests: requests.length,
      completedRequests: completed.length,
      overduRequests: overdue.length,
      averageProcessingTime: avgProcessingTime,
      complianceRate: requests.length > 0 ? (completed.length / requests.length) * 100 : 100,
      jurisdictionBreakdown,
      typeBreakdown,
      escalationCount: requests.filter(req => req.priority === 'urgent').length
    };
  }

  private getDefaultConfig(): RequestProcessorConfig {
    return {
      maxProcessingTime: 720, // 30 days
      requiredVerificationMethods: {
        'access': ['email'],
        'export': ['email'],
        'delete': ['email', 'sms'],
        'correction': ['email']
      },
      dataRetentionPolicies: {
        'account_data': 2555, // 7 years
        'usage_data': 730, // 2 years
        'communication_data': 1095, // 3 years
        'voice_data': 30 // 30 days
      },
      exemptionRules: [
        {
          condition: 'legal_obligation',
          exemption: 'Cannot delete data required for legal compliance',
          autoApply: true
        },
        {
          condition: 'pending_legal_action',
          exemption: 'Data retention required for ongoing legal proceedings',
          autoApply: false
        }
      ],
      escalationRules: [
        {
          condition: 'overdue_critical',
          escalateTo: 'data_protection_officer',
          timeThreshold: 672 // 28 days
        }
      ]
    };
  }

  private startProcessingLoop(): void {
    setInterval(async () => {
      if (this.processingQueue.length > 0) {
        const requestId = this.processingQueue.shift();
        if (requestId) {
          await this.processRequest(requestId);
        }
      }
      
      // Check for overdue requests
      await this.checkOverdueRequests();
    }, 30000); // Check every 30 seconds
  }

  private async processRequest(requestId: string): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'verified') return;

    switch (request.type) {
      case 'access':
        await this.processAccessRequest(requestId);
        break;
      case 'export':
        await this.processExportRequest(requestId);
        break;
      case 'delete':
        await this.processDeletionRequest(requestId);
        break;
      case 'correction':
        // Correction requests need additional data
        break;
    }
  }

  private async checkOverdueRequests(): Promise<void> {
    const now = new Date();
    const overdueRequests = Array.from(this.requests.values()).filter(req =>
      req.dueDate < now && !['completed', 'cancelled', 'rejected'].includes(req.status)
    );

    for (const request of overdueRequests) {
      request.priority = 'urgent';
      await this.sendNotification(request, 'overdue_alert');
      this.emit('requestOverdue', request);
    }
  }

  private detectJurisdiction(email: string): 'gdpr' | 'ccpa' | 'lgpd' | 'pipeda' {
    // Simple jurisdiction detection based on email domain
    // In real implementation, use IP geolocation and user profile data
    const domain = email.split('@')[1];
    if (domain.endsWith('.eu') || domain.endsWith('.de') || domain.endsWith('.fr')) return 'gdpr';
    if (domain.endsWith('.br')) return 'lgpd';
    if (domain.endsWith('.ca')) return 'pipeda';
    return 'ccpa'; // Default to CCPA
  }

  private calculateDueDate(type: string, jurisdiction: string): Date {
    const baseDays = {
      gdpr: 30,
      ccpa: 45,
      lgpd: 15,
      pipeda: 30
    }[jurisdiction] || 30;

    const urgentTypes = ['delete'];
    const days = urgentTypes.includes(type) ? Math.min(baseDays, 15) : baseDays;
    
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private calculatePriority(type: string, jurisdiction: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (type === 'delete') return 'high';
    if (jurisdiction === 'gdpr' && ['access', 'export'].includes(type)) return 'medium';
    return 'low';
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private async initiateVerification(request: DataSubjectRequest): Promise<void> {
    await this.sendNotification(request, 'verification_required');
  }

  private async sendNotification(request: DataSubjectRequest, type: string): Promise<void> {
    // Mock notification sending
    request.notificationsSent.push({
      type,
      timestamp: new Date(),
      recipient: request.email
    });
    
    this.emit('notificationSent', { request, type });
  }

  private async collectUserData(userId: string, categories?: string[]): Promise<any> {
    // Mock data collection from various systems
    return {
      account: { id: userId, email: 'user@example.com', name: 'John Doe' },
      usage: { pageViews: 1500, sessions: 200 },
      communications: { messages: 50, supportTickets: 3 }
    };
  }

  private async generateAccessReport(request: DataSubjectRequest, userData: any): Promise<string> {
    // Mock report generation
    return `/tmp/reports/access_${request.id}.pdf`;
  }

  private async createExportPackage(request: DataSubjectRequest, userData: any): Promise<string[]> {
    // Mock export package creation
    return [`/tmp/exports/user_data_${request.id}.json`];
  }

  private async checkDeletionExemptions(request: DataSubjectRequest): Promise<string[]> {
    // Check for legal exemptions to deletion
    const exemptions: string[] = [];
    
    // Mock exemption checks
    if (request.reason?.includes('legal')) {
      exemptions.push('legal_obligation');
    }
    
    return exemptions;
  }

  private async deleteUserData(
    userId: string, 
    categories?: string[], 
    exemptions: string[] = []
  ): Promise<Array<{ system: string; deleted: boolean; timestamp: Date; error?: string }>> {
    // Mock data deletion from various systems
    const systems = ['database', 'file_storage', 'backup_system', 'analytics'];
    
    return systems.map(system => ({
      system,
      deleted: !exemptions.includes('legal_obligation') || system !== 'backup_system',
      timestamp: new Date(),
      error: exemptions.includes('legal_obligation') && system === 'backup_system' 
        ? 'Retention required for legal compliance' 
        : undefined
    }));
  }

  private async applyDataCorrections(userId: string, corrections: Record<string, any>): Promise<void> {
    // Mock data correction application
    console.log(`Applying corrections for user ${userId}:`, corrections);
  }

  destroy(): void {
    this.removeAllListeners();
  }
}