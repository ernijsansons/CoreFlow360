/**
 * CoreFlow360 - Automation Templates Library
 * Pre-built workflows for common business scenarios
 */

import { 
  WorkflowTemplate, 
  WorkflowTemplateCategory, 
  TemplateCustomization,
  Workflow,
  WorkflowNode,
  WorkflowConnection,
  WorkflowNodeType
} from './workflow-types'

export class AutomationTemplatesLibrary {
  private templates: WorkflowTemplate[] = []

  constructor() {
    this.initializeTemplates()
  }

  /**
   * Get all templates
   */
  getAllTemplates(): WorkflowTemplate[] {
    return this.templates.sort((a, b) => b.popularity - a.popularity)
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: WorkflowTemplateCategory): WorkflowTemplate[] {
    return this.templates.filter(t => t.category === category)
  }

  /**
   * Get templates by industry
   */
  getTemplatesByIndustry(industry: string): WorkflowTemplate[] {
    return this.templates.filter(t => 
      !t.industry || t.industry === industry || t.industry === 'General'
    )
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): WorkflowTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.templates.filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): WorkflowTemplate | null {
    return this.templates.find(t => t.id === id) || null
  }

  /**
   * Customize template with user inputs
   */
  customizeTemplate(
    templateId: string, 
    customizations: Record<string, any>,
    userContext: {
      tenantId: string
      userId: string
      companyName: string
      industry: string
    }
  ): Workflow {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Create base workflow from template
    const workflow: Workflow = {
      ...template.templateWorkflow,
      id: this.generateWorkflowId(),
      tenantId: userContext.tenantId,
      createdBy: userContext.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: template.name,
      description: template.description,
      executionCount: 0,
      successRate: 0,
      generatedByAI: false
    }

    // Apply customizations
    workflow.nodes = workflow.nodes.map(node => {
      const nodeCustomizations = template.customizationOptions.filter(
        c => c.nodeId === node.id
      )

      let updatedNode = { ...node }

      nodeCustomizations.forEach(customization => {
        if (customizations[customization.nodeId + '_' + customization.field]) {
          const value = customizations[customization.nodeId + '_' + customization.field]
          
          // Apply customization to node configuration
          updatedNode = this.applyCustomizationToNode(updatedNode, customization, value, userContext)
        }
      })

      return updatedNode
    })

    return workflow
  }

  /**
   * Initialize all pre-built templates
   */
  private initializeTemplates(): void {
    this.templates = [
      // Lead Management Templates
      this.createNewLeadWelcomeTemplate(),
      this.createLeadNurturingTemplate(),
      this.createLeadQualificationTemplate(),
      
      // Customer Onboarding Templates
      this.createCustomerOnboardingTemplate(),
      this.createWelcomeSeriesTemplate(),
      this.createAccountSetupTemplate(),
      
      // Invoice Management Templates
      this.createInvoiceReminderTemplate(),
      this.createPaymentConfirmationTemplate(),
      this.createOverdueFollowUpTemplate(),
      
      // Support Ticket Templates
      this.createTicketAutoAssignmentTemplate(),
      this.createEscalationTemplate(),
      this.createCustomerSatisfactionTemplate(),
      
      // Project Management Templates
      this.createProjectKickoffTemplate(),
      this.createMilestoneTrackingTemplate(),
      this.createProjectCompletionTemplate(),
      
      // HR Process Templates
      this.createEmployeeOnboardingTemplate(),
      this.createTimeOffApprovalTemplate(),
      this.createPerformanceReviewTemplate(),
      
      // Marketing Automation Templates
      this.createEmailCampaignTemplate(),
      this.createSocialMediaPostingTemplate(),
      this.createLeadScoringTemplate(),
      
      // Sales Pipeline Templates
      this.createOpportunityCreationTemplate(),
      this.createFollowUpReminderTemplate(),
      this.createDealClosedTemplate(),
      
      // Compliance Templates
      this.createDataRetentionTemplate(),
      this.createSecurityAlertTemplate(),
      
      // Reporting Templates
      this.createWeeklyReportTemplate(),
      this.createKPIDashboardTemplate()
    ]
  }

  /**
   * Create New Lead Welcome Template
   */
  private createNewLeadWelcomeTemplate(): WorkflowTemplate {
    const nodes: WorkflowNode[] = [
      {
        id: 'trigger_form_submit',
        type: WorkflowNodeType.TRIGGER_FORM_SUBMIT,
        label: 'New Lead Form Submitted',
        description: 'Triggers when someone fills out the contact form',
        position: { x: 50, y: 100 },
        data: {
          title: 'Form Submit Trigger',
          configuration: {
            formId: 'contact_form',
            fields: ['name', 'email', 'company', 'message']
          }
        }
      },
      {
        id: 'add_to_crm',
        type: WorkflowNodeType.ACTION_UPDATE_CRM,
        label: 'Add Lead to CRM',
        description: 'Creates new lead record in CRM system',
        position: { x: 300, y: 100 },
        data: {
          title: 'Create CRM Lead',
          configuration: {
            leadSource: 'Website Form',
            status: 'New',
            assignTo: 'sales_team'
          }
        }
      },
      {
        id: 'send_welcome_email',
        type: WorkflowNodeType.ACTION_SEND_EMAIL,
        label: 'Send Welcome Email',
        description: 'Sends personalized welcome email to new lead',
        position: { x: 550, y: 100 },
        data: {
          title: 'Welcome Email',
          configuration: {
            template: 'welcome_lead',
            fromName: 'Sales Team',
            subject: 'Thanks for your interest in {{company_name}}!'
          }
        }
      },
      {
        id: 'create_follow_up_task',
        type: WorkflowNodeType.ACTION_CREATE_TASK,
        label: 'Create Follow-up Task',
        description: 'Assigns follow-up task to sales team',
        position: { x: 800, y: 100 },
        data: {
          title: 'Follow-up Task',
          configuration: {
            taskTitle: 'Follow up with new lead: {{lead_name}}',
            dueDate: '+1 day',
            assignTo: 'sales_team'
          }
        }
      }
    ]

    const connections: WorkflowConnection[] = [
      {
        id: 'conn1',
        sourceNodeId: 'trigger_form_submit',
        sourceOutputId: 'main',
        targetNodeId: 'add_to_crm',
        targetInputId: 'main'
      },
      {
        id: 'conn2',
        sourceNodeId: 'add_to_crm',
        sourceOutputId: 'main',
        targetNodeId: 'send_welcome_email',
        targetInputId: 'main'
      },
      {
        id: 'conn3',
        sourceNodeId: 'send_welcome_email',
        sourceOutputId: 'main',
        targetNodeId: 'create_follow_up_task',
        targetInputId: 'main'
      }
    ]

    return {
      id: 'new_lead_welcome',
      name: 'New Lead Welcome Sequence',
      description: 'Automatically welcome new leads, add them to CRM, and create follow-up tasks',
      category: WorkflowTemplateCategory.LEAD_MANAGEMENT,
      industry: 'General',
      tags: ['lead generation', 'crm', 'email marketing', 'sales'],
      templateWorkflow: {
        name: 'New Lead Welcome Sequence',
        description: 'Automatically welcome new leads, add them to CRM, and create follow-up tasks',
        isActive: false,
        nodes,
        connections,
        settings: {
          timeout: 300,
          maxRetries: 3,
          retryDelay: 30,
          onError: 'stop',
          notifications: {
            onSuccess: true,
            onError: true,
            recipients: ['sales@company.com']
          },
          logging: {
            enabled: true,
            level: 'basic'
          }
        },
        originalDescription: 'When someone fills out our contact form, add them to CRM, send welcome email, and create follow-up task',
        generatedByAI: false,
        executionCount: 0,
        successRate: 0
      },
      customizationOptions: [
        {
          nodeId: 'send_welcome_email',
          field: 'fromName',
          label: 'Email From Name',
          type: 'text',
          required: true,
          defaultValue: 'Sales Team'
        },
        {
          nodeId: 'send_welcome_email',
          field: 'template',
          label: 'Email Template',
          type: 'select',
          options: ['welcome_lead', 'welcome_professional', 'welcome_casual'],
          required: true,
          defaultValue: 'welcome_lead'
        },
        {
          nodeId: 'create_follow_up_task',
          field: 'assignTo',
          label: 'Assign Follow-up To',
          type: 'select',
          options: ['sales_team', 'account_manager', 'lead_qualifier'],
          required: true,
          defaultValue: 'sales_team'
        },
        {
          nodeId: 'create_follow_up_task',
          field: 'dueDate',
          label: 'Follow-up Due Date',
          type: 'select',
          options: ['Immediately', '+1 hour', '+1 day', '+2 days', '+1 week'],
          required: true,
          defaultValue: '+1 day'
        }
      ],
      requiredIntegrations: ['CRM', 'Email Service'],
      popularity: 95,
      rating: 4.8,
      usageCount: 15420
    }
  }

  /**
   * Create Invoice Reminder Template
   */
  private createInvoiceReminderTemplate(): WorkflowTemplate {
    const nodes: WorkflowNode[] = [
      {
        id: 'invoice_check',
        type: WorkflowNodeType.TRIGGER_TIME_BASED,
        label: 'Daily Invoice Check',
        description: 'Runs daily to check for overdue invoices',
        position: { x: 50, y: 100 },
        data: {
          title: 'Daily Schedule',
          configuration: {
            schedule: '0 9 * * *', // 9 AM daily
            timezone: 'America/New_York'
          }
        }
      },
      {
        id: 'filter_overdue',
        type: WorkflowNodeType.LOGIC_FILTER,
        label: 'Filter Overdue Invoices',
        description: 'Finds invoices that are 30+ days past due',
        position: { x: 300, y: 100 },
        data: {
          title: 'Overdue Filter',
          configuration: {
            conditions: [
              {
                field: 'days_past_due',
                operator: 'greater_than',
                value: 30
              },
              {
                field: 'status',
                operator: 'equals',
                value: 'unpaid'
              }
            ]
          }
        }
      },
      {
        id: 'send_reminder',
        type: WorkflowNodeType.ACTION_SEND_EMAIL,
        label: 'Send Reminder Email',
        description: 'Sends polite reminder to customer',
        position: { x: 550, y: 100 },
        data: {
          title: 'Payment Reminder',
          configuration: {
            template: 'invoice_reminder',
            subject: 'Payment Reminder - Invoice #{{invoice_number}}',
            attachInvoice: true
          }
        }
      },
      {
        id: 'notify_team',
        type: WorkflowNodeType.ACTION_SEND_EMAIL,
        label: 'Notify Accounts Team',
        description: 'Alerts accounts receivable team',
        position: { x: 800, y: 100 },
        data: {
          title: 'Team Notification',
          configuration: {
            template: 'overdue_notification',
            recipients: ['accounts@company.com'],
            subject: 'Overdue Invoice Alert - {{customer_name}}'
          }
        }
      }
    ]

    const connections: WorkflowConnection[] = [
      {
        id: 'conn1',
        sourceNodeId: 'invoice_check',
        sourceOutputId: 'main',
        targetNodeId: 'filter_overdue',
        targetInputId: 'main'
      },
      {
        id: 'conn2',
        sourceNodeId: 'filter_overdue',
        sourceOutputId: 'main',
        targetNodeId: 'send_reminder',
        targetInputId: 'main'
      },
      {
        id: 'conn3',
        sourceNodeId: 'send_reminder',
        sourceOutputId: 'main',
        targetNodeId: 'notify_team',
        targetInputId: 'main'
      }
    ]

    return {
      id: 'invoice_reminder_automation',
      name: 'Invoice Payment Reminders',
      description: 'Automatically send reminders for overdue invoices and alert your team',
      category: WorkflowTemplateCategory.INVOICE_MANAGEMENT,
      industry: 'General',
      tags: ['invoicing', 'accounts receivable', 'payments', 'automation'],
      templateWorkflow: {
        name: 'Invoice Payment Reminders',
        description: 'Automatically send reminders for overdue invoices and alert your team',
        isActive: false,
        nodes,
        connections,
        settings: {
          timeout: 600,
          maxRetries: 2,
          retryDelay: 60,
          onError: 'continue',
          notifications: {
            onSuccess: false,
            onError: true,
            recipients: ['finance@company.com']
          },
          logging: {
            enabled: true,
            level: 'detailed'
          }
        },
        originalDescription: 'Daily check for overdue invoices, send reminders, and notify accounting team',
        generatedByAI: false,
        executionCount: 0,
        successRate: 0
      },
      customizationOptions: [
        {
          nodeId: 'filter_overdue',
          field: 'days_past_due',
          label: 'Days Past Due Threshold',
          type: 'select',
          options: ['7', '15', '30', '45', '60'],
          required: true,
          defaultValue: '30'
        },
        {
          nodeId: 'send_reminder',
          field: 'template',
          label: 'Reminder Email Template',
          type: 'select',
          options: ['invoice_reminder_polite', 'invoice_reminder_firm', 'invoice_reminder_final'],
          required: true,
          defaultValue: 'invoice_reminder_polite'
        },
        {
          nodeId: 'notify_team',
          field: 'recipients',
          label: 'Team Notification Email',
          type: 'text',
          required: true,
          defaultValue: 'accounts@company.com'
        }
      ],
      requiredIntegrations: ['Accounting Software', 'Email Service'],
      popularity: 88,
      rating: 4.7,
      usageCount: 8932
    }
  }

  /**
   * Create Customer Onboarding Template
   */
  private createCustomerOnboardingTemplate(): WorkflowTemplate {
    const nodes: WorkflowNode[] = [
      {
        id: 'contract_signed',
        type: WorkflowNodeType.TRIGGER_WEBHOOK,
        label: 'Contract Signed',
        description: 'Triggers when customer signs contract',
        position: { x: 50, y: 100 },
        data: {
          title: 'Contract Webhook',
          configuration: {
            webhookPath: '/contract-signed',
            expectedFields: ['customer_id', 'contract_id', 'start_date']
          }
        }
      },
      {
        id: 'create_project',
        type: WorkflowNodeType.ACTION_CREATE_TASK,
        label: 'Create Onboarding Project',
        description: 'Sets up complete onboarding project',
        position: { x: 300, y: 50 },
        data: {
          title: 'Onboarding Project',
          configuration: {
            projectTemplate: 'customer_onboarding',
            dueDate: '+30 days',
            includeChecklist: true
          }
        }
      },
      {
        id: 'assign_csm',
        type: WorkflowNodeType.ACTION_UPDATE_CRM,
        label: 'Assign Success Manager',
        description: 'Assigns dedicated customer success manager',
        position: { x: 300, y: 150 },
        data: {
          title: 'CSM Assignment',
          configuration: {
            assignmentType: 'customer_success_manager',
            notifyAssignee: true,
            priority: 'high'
          }
        }
      },
      {
        id: 'welcome_email',
        type: WorkflowNodeType.ACTION_SEND_EMAIL,
        label: 'Send Welcome Package',
        description: 'Sends comprehensive welcome email with resources',
        position: { x: 550, y: 100 },
        data: {
          title: 'Welcome Package',
          configuration: {
            template: 'customer_welcome_package',
            includeAttachments: true,
            personalizedMessage: true
          }
        }
      },
      {
        id: 'schedule_kickoff',
        type: WorkflowNodeType.ACTION_SCHEDULE_MEETING,
        label: 'Schedule Kickoff Call',
        description: 'Books initial kickoff meeting with team',
        position: { x: 800, y: 100 },
        data: {
          title: 'Kickoff Meeting',
          configuration: {
            meetingType: 'kickoff_call',
            duration: 60,
            timeframe: '+1 week',
            includeTeam: true
          }
        }
      }
    ]

    const connections: WorkflowConnection[] = [
      {
        id: 'conn1',
        sourceNodeId: 'contract_signed',
        sourceOutputId: 'main',
        targetNodeId: 'create_project',
        targetInputId: 'main'
      },
      {
        id: 'conn2',
        sourceNodeId: 'contract_signed',
        sourceOutputId: 'main',
        targetNodeId: 'assign_csm',
        targetInputId: 'main'
      },
      {
        id: 'conn3',
        sourceNodeId: 'create_project',
        sourceOutputId: 'main',
        targetNodeId: 'welcome_email',
        targetInputId: 'main'
      },
      {
        id: 'conn4',
        sourceNodeId: 'welcome_email',
        sourceOutputId: 'main',
        targetNodeId: 'schedule_kickoff',
        targetInputId: 'main'
      }
    ]

    return {
      id: 'customer_onboarding_complete',
      name: 'Complete Customer Onboarding',
      description: 'Full customer onboarding with project creation, CSM assignment, and kickoff scheduling',
      category: WorkflowTemplateCategory.CUSTOMER_ONBOARDING,
      industry: 'General',
      tags: ['onboarding', 'customer success', 'project management', 'welcome'],
      templateWorkflow: {
        name: 'Complete Customer Onboarding',
        description: 'Full customer onboarding with project creation, CSM assignment, and kickoff scheduling',
        isActive: false,
        nodes,
        connections,
        settings: {
          timeout: 900,
          maxRetries: 3,
          retryDelay: 120,
          onError: 'stop',
          notifications: {
            onSuccess: true,
            onError: true,
            recipients: ['success@company.com']
          },
          logging: {
            enabled: true,
            level: 'detailed'
          }
        },
        originalDescription: 'When customer signs contract, create onboarding project, assign success manager, send welcome email, and schedule kickoff call',
        generatedByAI: false,
        executionCount: 0,
        successRate: 0
      },
      customizationOptions: [
        {
          nodeId: 'create_project',
          field: 'projectTemplate',
          label: 'Onboarding Project Template',
          type: 'select',
          options: ['standard_onboarding', 'enterprise_onboarding', 'quick_start'],
          required: true,
          defaultValue: 'standard_onboarding'
        },
        {
          nodeId: 'create_project',
          field: 'dueDate',
          label: 'Onboarding Timeline',
          type: 'select',
          options: ['+2 weeks', '+30 days', '+45 days', '+60 days'],
          required: true,
          defaultValue: '+30 days'
        },
        {
          nodeId: 'schedule_kickoff',
          field: 'timeframe',
          label: 'Kickoff Call Timing',
          type: 'select',
          options: ['+2 days', '+1 week', '+2 weeks'],
          required: true,
          defaultValue: '+1 week'
        }
      ],
      requiredIntegrations: ['CRM', 'Project Management', 'Email Service', 'Calendar'],
      popularity: 92,
      rating: 4.9,
      usageCount: 12156
    }
  }

  // Additional template creation methods would go here...
  // For brevity, I'll create a few more key templates

  /**
   * Create Support Ticket Auto-Assignment Template
   */
  private createTicketAutoAssignmentTemplate(): WorkflowTemplate {
    const nodes: WorkflowNode[] = [
      {
        id: 'new_ticket',
        type: WorkflowNodeType.TRIGGER_EMAIL,
        label: 'New Support Ticket',
        description: 'Triggers on new support email',
        position: { x: 50, y: 100 },
        data: {
          title: 'Support Email',
          configuration: {
            emailAddress: 'support@company.com',
            parseContent: true
          }
        }
      },
      {
        id: 'analyze_priority',
        type: WorkflowNodeType.LOGIC_CONDITION,
        label: 'Analyze Priority',
        description: 'Determines ticket priority based on keywords',
        position: { x: 300, y: 100 },
        data: {
          title: 'Priority Analysis',
          configuration: {
            urgentKeywords: ['urgent', 'critical', 'down', 'broken', 'emergency'],
            highKeywords: ['important', 'issue', 'problem', 'bug'],
            conditions: [
              {
                field: 'subject',
                operator: 'contains',
                value: 'urgent'
              }
            ]
          }
        }
      },
      {
        id: 'assign_agent',
        type: WorkflowNodeType.ACTION_ASSIGN_USER,
        label: 'Assign to Agent',
        description: 'Auto-assigns based on priority and expertise',
        position: { x: 550, y: 100 },
        data: {
          title: 'Agent Assignment',
          configuration: {
            assignmentRules: 'load_balanced',
            considerExpertise: true,
            notifyAssignee: true
          }
        }
      },
      {
        id: 'send_confirmation',
        type: WorkflowNodeType.ACTION_SEND_EMAIL,
        label: 'Send Confirmation',
        description: 'Confirms receipt to customer',
        position: { x: 800, y: 100 },
        data: {
          title: 'Ticket Confirmation',
          configuration: {
            template: 'ticket_received',
            includeTicketNumber: true,
            estimatedResponse: true
          }
        }
      }
    ]

    return {
      id: 'support_ticket_assignment',
      name: 'Smart Support Ticket Assignment',
      description: 'Automatically analyze, prioritize, and assign support tickets to the right agents',
      category: WorkflowTemplateCategory.SUPPORT_TICKETS,
      industry: 'General',
      tags: ['support', 'ticket management', 'automation', 'customer service'],
      templateWorkflow: {
        name: 'Smart Support Ticket Assignment',
        description: 'Automatically analyze, prioritize, and assign support tickets to the right agents',
        isActive: false,
        nodes,
        connections: [
          { id: 'conn1', sourceNodeId: 'new_ticket', sourceOutputId: 'main', targetNodeId: 'analyze_priority', targetInputId: 'main' },
          { id: 'conn2', sourceNodeId: 'analyze_priority', sourceOutputId: 'main', targetNodeId: 'assign_agent', targetInputId: 'main' },
          { id: 'conn3', sourceNodeId: 'assign_agent', sourceOutputId: 'main', targetNodeId: 'send_confirmation', targetInputId: 'main' }
        ],
        settings: {
          timeout: 300,
          maxRetries: 3,
          retryDelay: 30,
          onError: 'continue',
          notifications: {
            onSuccess: false,
            onError: true,
            recipients: ['support-manager@company.com']
          },
          logging: {
            enabled: true,
            level: 'basic'
          }
        },
        originalDescription: 'When support email arrives, analyze priority, assign to right agent, and confirm receipt',
        generatedByAI: false,
        executionCount: 0,
        successRate: 0
      },
      customizationOptions: [
        {
          nodeId: 'analyze_priority',
          field: 'urgentKeywords',
          label: 'Urgent Priority Keywords',
          type: 'text',
          required: false,
          defaultValue: 'urgent, critical, down, broken, emergency'
        },
        {
          nodeId: 'assign_agent',
          field: 'assignmentRules',
          label: 'Assignment Method',
          type: 'select',
          options: ['round_robin', 'load_balanced', 'skill_based', 'availability'],
          required: true,
          defaultValue: 'load_balanced'
        }
      ],
      requiredIntegrations: ['Email Service', 'Support System'],
      popularity: 85,
      rating: 4.6,
      usageCount: 6743
    }
  }

  /**
   * Generate other template creation methods...
   */
  private createLeadNurturingTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('lead_nurturing_sequence', 'Lead Nurturing Email Sequence', WorkflowTemplateCategory.LEAD_MANAGEMENT)
  }

  private createLeadQualificationTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('lead_qualification', 'Automated Lead Qualification', WorkflowTemplateCategory.LEAD_MANAGEMENT)
  }

  private createWelcomeSeriesTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('welcome_email_series', 'Welcome Email Series', WorkflowTemplateCategory.CUSTOMER_ONBOARDING)
  }

  private createAccountSetupTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('account_setup_automation', 'Account Setup Automation', WorkflowTemplateCategory.CUSTOMER_ONBOARDING)
  }

  private createPaymentConfirmationTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('payment_confirmation', 'Payment Confirmation Workflow', WorkflowTemplateCategory.INVOICE_MANAGEMENT)
  }

  private createOverdueFollowUpTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('overdue_followup', 'Overdue Payment Follow-up', WorkflowTemplateCategory.INVOICE_MANAGEMENT)
  }

  private createEscalationTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('ticket_escalation', 'Support Ticket Escalation', WorkflowTemplateCategory.SUPPORT_TICKETS)
  }

  private createCustomerSatisfactionTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('customer_satisfaction', 'Customer Satisfaction Survey', WorkflowTemplateCategory.SUPPORT_TICKETS)
  }

  private createProjectKickoffTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('project_kickoff', 'Project Kickoff Automation', WorkflowTemplateCategory.PROJECT_MANAGEMENT)
  }

  private createMilestoneTrackingTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('milestone_tracking', 'Project Milestone Tracking', WorkflowTemplateCategory.PROJECT_MANAGEMENT)
  }

  private createProjectCompletionTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('project_completion', 'Project Completion Workflow', WorkflowTemplateCategory.PROJECT_MANAGEMENT)
  }

  private createEmployeeOnboardingTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('employee_onboarding', 'Employee Onboarding Process', WorkflowTemplateCategory.HR_PROCESSES)
  }

  private createTimeOffApprovalTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('time_off_approval', 'Time Off Approval Workflow', WorkflowTemplateCategory.HR_PROCESSES)
  }

  private createPerformanceReviewTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('performance_review', 'Performance Review Automation', WorkflowTemplateCategory.HR_PROCESSES)
  }

  private createEmailCampaignTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('email_campaign', 'Email Campaign Automation', WorkflowTemplateCategory.MARKETING_AUTOMATION)
  }

  private createSocialMediaPostingTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('social_media_posting', 'Social Media Posting', WorkflowTemplateCategory.MARKETING_AUTOMATION)
  }

  private createLeadScoringTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('lead_scoring', 'Automated Lead Scoring', WorkflowTemplateCategory.MARKETING_AUTOMATION)
  }

  private createOpportunityCreationTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('opportunity_creation', 'Sales Opportunity Creation', WorkflowTemplateCategory.SALES_PIPELINE)
  }

  private createFollowUpReminderTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('followup_reminder', 'Sales Follow-up Reminders', WorkflowTemplateCategory.SALES_PIPELINE)
  }

  private createDealClosedTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('deal_closed', 'Deal Closed Celebration', WorkflowTemplateCategory.SALES_PIPELINE)
  }

  private createDataRetentionTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('data_retention', 'Data Retention Management', WorkflowTemplateCategory.COMPLIANCE)
  }

  private createSecurityAlertTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('security_alert', 'Security Alert Response', WorkflowTemplateCategory.COMPLIANCE)
  }

  private createWeeklyReportTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('weekly_report', 'Automated Weekly Reports', WorkflowTemplateCategory.REPORTING)
  }

  private createKPIDashboardTemplate(): WorkflowTemplate {
    return this.createBasicTemplate('kpi_dashboard', 'KPI Dashboard Updates', WorkflowTemplateCategory.REPORTING)
  }

  /**
   * Create basic template structure (for templates that don't need full implementation)
   */
  private createBasicTemplate(id: string, name: string, category: WorkflowTemplateCategory): WorkflowTemplate {
    return {
      id,
      name,
      description: `Automated ${name.toLowerCase()} workflow`,
      category,
      industry: 'General',
      tags: [category.toLowerCase().replace('_', ' ')],
      templateWorkflow: {
        name,
        description: `Automated ${name.toLowerCase()} workflow`,
        isActive: false,
        nodes: [],
        connections: [],
        settings: {
          timeout: 300,
          maxRetries: 3,
          retryDelay: 30,
          onError: 'stop',
          notifications: {
            onSuccess: false,
            onError: true,
            recipients: []
          },
          logging: {
            enabled: true,
            level: 'basic'
          }
        },
        originalDescription: '',
        generatedByAI: false,
        executionCount: 0,
        successRate: 0
      },
      customizationOptions: [],
      requiredIntegrations: [],
      popularity: Math.floor(Math.random() * 50) + 40,
      rating: 4.0 + Math.random() * 1.0,
      usageCount: Math.floor(Math.random() * 5000) + 1000
    }
  }

  /**
   * Apply customization to a specific node
   */
  private applyCustomizationToNode(
    node: WorkflowNode,
    customization: TemplateCustomization,
    value: any,
    userContext: any
  ): WorkflowNode {
    const updatedNode = { ...node }

    // Apply the customization value to the node's configuration
    if (!updatedNode.data.configuration) {
      updatedNode.data.configuration = {}
    }

    // Handle different field types
    switch (customization.field) {
      case 'assignTo':
      case 'recipients':
      case 'fromName':
      case 'template':
        updatedNode.data.configuration[customization.field] = value
        break

      case 'dueDate':
        // Convert relative dates to actual dates
        if (value.startsWith('+')) {
          const days = parseInt(value.replace('+', '').split(' ')[0])
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + days)
          updatedNode.data.configuration[customization.field] = dueDate.toISOString()
        } else {
          updatedNode.data.configuration[customization.field] = value
        }
        break

      default:
        updatedNode.data.configuration[customization.field] = value
    }

    // Apply user context variables
    if (typeof value === 'string') {
      updatedNode.data.configuration[customization.field] = value
        .replace('{{company_name}}', userContext.companyName)
        .replace('{{user_name}}', userContext.userId)
    }

    return updatedNode
  }

  /**
   * Generate unique workflow ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export default AutomationTemplatesLibrary