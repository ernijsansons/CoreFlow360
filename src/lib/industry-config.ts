export interface CustomFieldConfig {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'file'
  options?: string[]
  required?: boolean
  defaultValue?: string | number | boolean
  validationRules?: Record<string, unknown>
  group?: string
}

export interface WorkflowStep {
  id: string
  name: string
  description: string
  requiredFields?: string[]
  nextSteps?: string[]
  automations?: string[]
}

export interface WorkflowConfig {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  triggers?: string[]
}

export interface TemplateConfig {
  id: string
  name: string
  type: string
  content: string | Record<string, unknown> | { items?: string[]; categories?: string[] }
  variables?: string[] | Record<string, unknown>
}

export interface AIAgentConfig {
  id: string
  name: string
  type: 'sdr' | 'account_executive' | 'customer_success' | 'support'
  knowledge: {
    topics?: string[]
    equipment?: string[]
    brands?: string[]
    commonIssues?: string[]
    procedures?: string[]
  }
  scripts: {
    greeting?: string
    troubleshooting?: string
    scheduling?: string
    closing?: string
  }
  tools: {
    [key: string]: boolean
  }
  specializations?: string[]
  certifications?: string[]
}

export interface ComplianceConfig {
  id: string
  name: string
  type: string
  requirements: string[]
  deadlines?: {
    [key: string]: string
  }
  documentation?: string[]
}

export interface IntegrationConfig {
  id: string
  name: string
  provider: string
  type: string
  features?: string[]
  requiredFields?: string[]
}

export interface IndustryFeatures {
  crm: boolean
  projectManagement: boolean
  scheduling: boolean
  inventory: boolean
  accounting: boolean
  hr: boolean
  documentManagement: boolean
  compliance: boolean
  analytics: boolean
  mobileApp: boolean
  fieldService: boolean
  equipment?: boolean
  warranty?: boolean
  permits?: boolean
  subcontractors?: boolean
  patients?: boolean
  prescriptions?: boolean
  caseManagement?: boolean
  timeTracking?: boolean
  trustAccounting?: boolean
  emergencyDispatch?: boolean
}

export interface IndustryConfig {
  id: string
  name: string
  icon: string
  description: string
  color: string
  subTypes?: string[]
  features: IndustryFeatures
  customFields: CustomFieldConfig[]
  workflows: WorkflowConfig[]
  templates: TemplateConfig[]
  aiAgents: AIAgentConfig[]
  compliance: ComplianceConfig[]
  integrations: IntegrationConfig[]
}

export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  general: {
    id: 'general',
    name: 'General Business',
    icon: '🏢',
    description: 'Standard CRM functionality for any business',
    color: 'bg-gray-500',
    features: {
      crm: true,
      projectManagement: true,
      scheduling: true,
      inventory: false,
      accounting: true,
      hr: true,
      documentManagement: true,
      compliance: false,
      analytics: true,
      mobileApp: true,
      fieldService: false,
    },
    customFields: [
      {
        name: 'industry',
        label: 'Industry',
        type: 'text',
        required: false,
      },
      {
        name: 'company_size',
        label: 'Company Size',
        type: 'select',
        options: ['1-10', '11-50', '51-200', '201-500', '500+'],
        required: false,
      },
    ],
    workflows: [
      {
        id: 'sales_pipeline',
        name: 'Sales Pipeline',
        description: 'Standard sales workflow',
        steps: [
          {
            id: 'lead',
            name: 'Lead',
            description: 'New lead entered',
            nextSteps: ['qualified'],
          },
          {
            id: 'qualified',
            name: 'Qualified',
            description: 'Lead has been qualified',
            nextSteps: ['proposal', 'disqualified'],
          },
          {
            id: 'proposal',
            name: 'Proposal',
            description: 'Proposal sent',
            nextSteps: ['negotiation', 'lost'],
          },
          {
            id: 'negotiation',
            name: 'Negotiation',
            description: 'In negotiation',
            nextSteps: ['won', 'lost'],
          },
          {
            id: 'won',
            name: 'Won',
            description: 'Deal closed',
          },
          {
            id: 'lost',
            name: 'Lost',
            description: 'Deal lost',
          },
          {
            id: 'disqualified',
            name: 'Disqualified',
            description: 'Lead disqualified',
          },
        ],
      },
    ],
    templates: [
      {
        id: 'welcome_email',
        name: 'Welcome Email',
        type: 'email',
        content: "Welcome to {{company_name}}! We're excited to have you as a customer.",
        variables: ['company_name', 'customer_name'],
      },
    ],
    aiAgents: [
      {
        id: 'general_sdr',
        name: 'Sales Development Rep',
        type: 'sdr',
        knowledge: {
          topics: ['General business', 'Sales', 'Customer service'],
        },
        scripts: {
          greeting: "Hello! I'm here to help you learn more about our services.",
          closing: 'Thank you for your interest. A team member will follow up shortly.',
        },
        tools: {
          leadQualification: true,
          appointmentScheduling: true,
          emailAutomation: true,
        },
      },
    ],
    compliance: [],
    integrations: [
      {
        id: 'google_workspace',
        name: 'Google Workspace',
        provider: 'Google',
        type: 'productivity',
        features: ['Calendar sync', 'Email integration', 'Drive storage'],
      },
    ],
  },
  hvac: {
    id: 'hvac',
    name: 'HVAC Services',
    icon: '❄️',
    description: 'Heating, ventilation, and air conditioning service management',
    color: 'bg-blue-500',
    subTypes: ['Residential', 'Commercial', 'Industrial'],
    features: {
      crm: true,
      projectManagement: true,
      scheduling: true,
      inventory: true,
      accounting: true,
      hr: true,
      documentManagement: true,
      compliance: true,
      analytics: true,
      mobileApp: true,
      fieldService: true,
      equipment: true,
      warranty: true,
      permits: true,
      emergencyDispatch: true,
    },
    customFields: [
      {
        name: 'equipment_type',
        label: 'Equipment Type',
        type: 'select',
        options: ['Furnace', 'Air Conditioner', 'Heat Pump', 'Boiler', 'Ductless Mini-Split'],
        required: true,
        group: 'Equipment',
      },
      {
        name: 'equipment_brand',
        label: 'Equipment Brand',
        type: 'select',
        options: ['Carrier', 'Trane', 'Lennox', 'Rheem', 'Goodman', 'American Standard'],
        required: true,
        group: 'Equipment',
      },
      {
        name: 'model_number',
        label: 'Model Number',
        type: 'text',
        required: true,
        group: 'Equipment',
      },
      {
        name: 'serial_number',
        label: 'Serial Number',
        type: 'text',
        required: true,
        group: 'Equipment',
      },
      {
        name: 'installation_date',
        label: 'Installation Date',
        type: 'date',
        required: false,
        group: 'Equipment',
      },
      {
        name: 'warranty_expiry',
        label: 'Warranty Expiry',
        type: 'date',
        required: false,
        group: 'Equipment',
      },
      {
        name: 'refrigerant_type',
        label: 'Refrigerant Type',
        type: 'select',
        options: ['R-410A', 'R-22', 'R-32', 'R-134a'],
        required: false,
        group: 'Technical',
      },
      {
        name: 'seer_rating',
        label: 'SEER Rating',
        type: 'number',
        required: false,
        group: 'Technical',
      },
      {
        name: 'service_frequency',
        label: 'Service Frequency',
        type: 'select',
        options: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'As Needed'],
        required: false,
        group: 'Service',
      },
      {
        name: 'last_service_date',
        label: 'Last Service Date',
        type: 'date',
        required: false,
        group: 'Service',
      },
      {
        name: 'emergency_contact',
        label: 'Emergency Contact',
        type: 'text',
        required: false,
        group: 'Contact',
      },
      {
        name: 'permit_number',
        label: 'Permit Number',
        type: 'text',
        required: false,
        group: 'Compliance',
      },
    ],
    workflows: [
      {
        id: 'service_call',
        name: 'Service Call Workflow',
        description: 'Standard HVAC service call process',
        steps: [
          {
            id: 'call_received',
            name: 'Call Received',
            description: 'Customer service request received',
            nextSteps: ['scheduled'],
            automations: ['send_confirmation_email'],
          },
          {
            id: 'scheduled',
            name: 'Scheduled',
            description: 'Appointment scheduled',
            nextSteps: ['dispatched'],
            requiredFields: ['appointment_date', 'technician'],
          },
          {
            id: 'dispatched',
            name: 'Technician Dispatched',
            description: 'Technician on the way',
            nextSteps: ['in_progress'],
            automations: ['notify_customer'],
          },
          {
            id: 'in_progress',
            name: 'Service In Progress',
            description: 'Technician working on equipment',
            nextSteps: ['completed'],
          },
          {
            id: 'completed',
            name: 'Service Completed',
            description: 'Work completed',
            nextSteps: ['invoiced'],
            requiredFields: ['work_performed', 'parts_used'],
          },
          {
            id: 'invoiced',
            name: 'Invoice Sent',
            description: 'Invoice sent to customer',
            nextSteps: ['paid'],
            automations: ['generate_invoice', 'send_invoice'],
          },
          {
            id: 'paid',
            name: 'Payment Received',
            description: 'Payment collected',
            automations: ['schedule_follow_up'],
          },
        ],
        triggers: ['emergency_call', 'scheduled_maintenance', 'customer_request'],
      },
      {
        id: 'maintenance_plan',
        name: 'Preventive Maintenance',
        description: 'Scheduled maintenance workflow',
        steps: [
          {
            id: 'maintenance_due',
            name: 'Maintenance Due',
            description: 'System alerts maintenance is due',
            nextSteps: ['scheduled'],
            automations: ['notify_customer', 'schedule_appointment'],
          },
          {
            id: 'scheduled',
            name: 'Scheduled',
            description: 'Maintenance appointment scheduled',
            nextSteps: ['performed'],
          },
          {
            id: 'performed',
            name: 'Maintenance Performed',
            description: 'Preventive maintenance completed',
            nextSteps: ['report_generated'],
            requiredFields: ['checklist_completed', 'findings'],
          },
          {
            id: 'report_generated',
            name: 'Report Generated',
            description: 'Maintenance report created',
            automations: ['send_report', 'schedule_next_maintenance'],
          },
        ],
      },
    ],
    templates: [
      {
        id: 'service_agreement',
        name: 'Service Agreement',
        type: 'document',
        content: 'HVAC Service Agreement template with terms and conditions',
        variables: ['customer_name', 'address', 'equipment_details', 'service_plan'],
      },
      {
        id: 'maintenance_checklist',
        name: 'Maintenance Checklist',
        type: 'checklist',
        content: {
          items: [
            'Check thermostat operation',
            'Inspect air filters',
            'Check refrigerant levels',
            'Test safety controls',
            'Clean condensate drain',
            'Inspect electrical connections',
            'Check blower components',
            'Measure temperature differential',
          ],
        },
      },
      {
        id: 'invoice_template',
        name: 'Service Invoice',
        type: 'invoice',
        content: 'HVAC service invoice with labor and parts breakdown',
        variables: ['job_details', 'parts_list', 'labor_hours', 'total_cost'],
      },
    ],
    aiAgents: [
      {
        id: 'hvac_service_agent',
        name: 'HVAC Service Assistant',
        type: 'customer_success',
        knowledge: {
          equipment: ['Furnace', 'Air Conditioner', 'Heat Pump', 'Boiler', 'Ductless Mini-Split'],
          brands: ['Carrier', 'Trane', 'Lennox', 'Rheem', 'Goodman', 'American Standard'],
          commonIssues: [
            'No cooling',
            'No heating',
            'Poor airflow',
            'Strange noises',
            'High energy bills',
            'Thermostat issues',
            'Frozen coils',
            'Refrigerant leaks',
          ],
          procedures: [
            'Filter replacement',
            'Thermostat troubleshooting',
            'Basic maintenance',
            'Emergency shutdown',
          ],
        },
        scripts: {
          greeting:
            "Hello! I'm your HVAC service assistant. How can I help you with your heating and cooling system today?",
          troubleshooting:
            "Let me help you troubleshoot your {{equipment_type}}. First, let's check if the thermostat is set correctly. Is it set to {{mode}} mode and is the temperature set appropriately?",
          scheduling:
            'I can help you schedule a service appointment. What type of service do you need? Regular maintenance, repair, or emergency service?',
          closing: 'Is there anything else I can help you with regarding your HVAC system?',
        },
        tools: {
          diagnosticChecklist: true,
          maintenanceReminders: true,
          warrantyLookup: true,
          permitChecker: true,
          energyCalculator: true,
          equipmentDatabase: true,
          weatherIntegration: true,
        },
        specializations: [
          'Residential HVAC',
          'Commercial HVAC',
          'Emergency Service',
          'Energy Efficiency',
        ],
        certifications: ['EPA 608', 'NATE Certification', 'State HVAC License'],
      },
      {
        id: 'hvac_dispatcher',
        name: 'Dispatch Coordinator',
        type: 'support',
        knowledge: {
          topics: [
            'Route optimization',
            'Emergency prioritization',
            'Technician skills',
            'Service areas',
          ],
        },
        scripts: {
          greeting:
            'Dispatch coordinator here. Let me help you route this service call efficiently.',
        },
        tools: {
          routeOptimization: true,
          technicianTracking: true,
          emergencyPrioritization: true,
          inventoryCheck: true,
        },
      },
    ],
    compliance: [
      {
        id: 'epa_608',
        name: 'EPA 608 Certification',
        type: 'certification',
        requirements: [
          'Technicians must be EPA 608 certified',
          'Maintain certification records',
          'Follow refrigerant handling procedures',
          'Submit annual compliance reports',
        ],
        documentation: ['Certification copies', 'Training records', 'Refrigerant logs'],
      },
      {
        id: 'state_license',
        name: 'State HVAC License',
        type: 'license',
        requirements: [
          'Maintain active state license',
          'Complete continuing education',
          'Renew license annually',
          'Display license number on documents',
        ],
        deadlines: {
          renewal: 'Annual',
          continuing_education: '24 hours per year',
        },
      },
      {
        id: 'permit_compliance',
        name: 'Building Permits',
        type: 'regulatory',
        requirements: [
          'Obtain permits for installations',
          'Schedule inspections',
          'Maintain permit records',
          'Close out permits timely',
        ],
      },
    ],
    integrations: [
      {
        id: 'service_titan',
        name: 'ServiceTitan',
        provider: 'ServiceTitan',
        type: 'field_service',
        features: ['Dispatch', 'Mobile app', 'Customer portal'],
      },
      {
        id: 'coolcloud',
        name: 'CoolCloud HVAC',
        provider: 'Emerson',
        type: 'equipment_monitoring',
        features: ['Remote diagnostics', 'Performance tracking', 'Alerts'],
        requiredFields: ['equipment_serial', 'customer_consent'],
      },
      {
        id: 'weather_api',
        name: 'Weather Integration',
        provider: 'NOAA',
        type: 'data',
        features: ['Temperature forecasts', 'Extreme weather alerts', 'Seasonal planning'],
      },
    ],
  },
  construction: {
    id: 'construction',
    name: 'Construction',
    icon: '🏗️',
    description: 'Construction project and contractor management',
    color: 'bg-orange-500',
    subTypes: ['Residential', 'Commercial', 'Infrastructure'],
    features: {
      crm: true,
      projectManagement: true,
      scheduling: true,
      inventory: true,
      accounting: true,
      hr: true,
      documentManagement: true,
      compliance: true,
      analytics: true,
      mobileApp: true,
      fieldService: true,
      permits: true,
      subcontractors: true,
    },
    customFields: [
      {
        name: 'project_type',
        label: 'Project Type',
        type: 'select',
        options: ['New Construction', 'Renovation', 'Addition', 'Demolition'],
        required: true,
        group: 'Project',
      },
      {
        name: 'square_footage',
        label: 'Square Footage',
        type: 'number',
        required: true,
        group: 'Project',
      },
      {
        name: 'project_phase',
        label: 'Current Phase',
        type: 'select',
        options: [
          'Planning',
          'Permits',
          'Foundation',
          'Framing',
          'Mechanical',
          'Finishing',
          'Inspection',
          'Complete',
        ],
        required: true,
        group: 'Project',
      },
      {
        name: 'permit_number',
        label: 'Building Permit Number',
        type: 'text',
        required: false,
        group: 'Compliance',
      },
      {
        name: 'architect',
        label: 'Architect',
        type: 'text',
        required: false,
        group: 'Team',
      },
      {
        name: 'general_contractor',
        label: 'General Contractor',
        type: 'text',
        required: false,
        group: 'Team',
      },
      {
        name: 'subcontractors',
        label: 'Subcontractors',
        type: 'multiselect',
        options: [
          'Electrical',
          'Plumbing',
          'HVAC',
          'Roofing',
          'Flooring',
          'Painting',
          'Landscaping',
        ],
        required: false,
        group: 'Team',
      },
      {
        name: 'completion_date',
        label: 'Expected Completion',
        type: 'date',
        required: true,
        group: 'Schedule',
      },
      {
        name: 'inspection_dates',
        label: 'Inspection Dates',
        type: 'text',
        required: false,
        group: 'Compliance',
      },
    ],
    workflows: [
      {
        id: 'construction_project',
        name: 'Construction Project',
        description: 'Full construction project lifecycle',
        steps: [
          {
            id: 'site_survey',
            name: 'Site Survey',
            description: 'Initial site assessment',
            nextSteps: ['design'],
            requiredFields: ['site_address', 'lot_size'],
          },
          {
            id: 'design',
            name: 'Design & Planning',
            description: 'Architectural design and planning',
            nextSteps: ['permits'],
            requiredFields: ['architect', 'blueprints'],
          },
          {
            id: 'permits',
            name: 'Permit Application',
            description: 'Apply for building permits',
            nextSteps: ['site_prep'],
            requiredFields: ['permit_type', 'application_date'],
          },
          {
            id: 'site_prep',
            name: 'Site Preparation',
            description: 'Clear and prepare site',
            nextSteps: ['foundation'],
          },
          {
            id: 'foundation',
            name: 'Foundation',
            description: 'Pour foundation',
            nextSteps: ['framing'],
            requiredFields: ['concrete_vendor', 'inspection_date'],
          },
          {
            id: 'framing',
            name: 'Framing',
            description: 'Structural framing',
            nextSteps: ['mechanical'],
          },
          {
            id: 'mechanical',
            name: 'Mechanical Installation',
            description: 'Plumbing, electrical, HVAC',
            nextSteps: ['insulation'],
            requiredFields: ['subcontractors'],
          },
          {
            id: 'insulation',
            name: 'Insulation & Drywall',
            description: 'Install insulation and drywall',
            nextSteps: ['finishing'],
          },
          {
            id: 'finishing',
            name: 'Finishing Work',
            description: 'Flooring, painting, fixtures',
            nextSteps: ['final_inspection'],
          },
          {
            id: 'final_inspection',
            name: 'Final Inspection',
            description: 'Final building inspection',
            nextSteps: ['completion'],
            requiredFields: ['inspection_date', 'inspector'],
          },
          {
            id: 'completion',
            name: 'Project Completion',
            description: 'Project handover',
            requiredFields: ['completion_date', 'final_walkthrough'],
          },
        ],
      },
      {
        id: 'change_order',
        name: 'Change Order Process',
        description: 'Handle project change requests',
        steps: [
          {
            id: 'request',
            name: 'Change Request',
            description: 'Client requests change',
            nextSteps: ['evaluation'],
          },
          {
            id: 'evaluation',
            name: 'Evaluate Impact',
            description: 'Assess cost and schedule impact',
            nextSteps: ['approval', 'rejection'],
            requiredFields: ['cost_impact', 'schedule_impact'],
          },
          {
            id: 'approval',
            name: 'Client Approval',
            description: 'Client approves change',
            nextSteps: ['implementation'],
            requiredFields: ['approval_date', 'approved_amount'],
          },
          {
            id: 'implementation',
            name: 'Implement Change',
            description: 'Execute the change order',
          },
          {
            id: 'rejection',
            name: 'Change Rejected',
            description: 'Client rejects change',
          },
        ],
      },
    ],
    templates: [
      {
        id: 'construction_contract',
        name: 'Construction Contract',
        type: 'document',
        content: 'Standard construction contract template',
        variables: ['project_details', 'payment_schedule', 'completion_date'],
      },
      {
        id: 'punch_list',
        name: 'Punch List',
        type: 'checklist',
        content: {
          categories: ['Exterior', 'Interior', 'Mechanical', 'Electrical', 'Plumbing'],
        },
      },
      {
        id: 'safety_checklist',
        name: 'Safety Inspection Checklist',
        type: 'checklist',
        content: {
          items: [
            'Hard hats required',
            'Safety barriers in place',
            'Proper scaffolding',
            'Electrical safety',
            'Fall protection',
          ],
        },
      },
    ],
    aiAgents: [
      {
        id: 'construction_pm',
        name: 'Project Manager Assistant',
        type: 'support',
        knowledge: {
          topics: ['Project phases', 'Building codes', 'Safety regulations', 'Scheduling'],
          procedures: [
            'Permit applications',
            'Inspection scheduling',
            'Change orders',
            'Progress reporting',
          ],
        },
        scripts: {
          greeting:
            "I'm your construction project assistant. How can I help with your project today?",
        },
        tools: {
          ganttCharts: true,
          permitTracker: true,
          weatherMonitoring: true,
          safetyCompliance: true,
          costTracking: true,
        },
        specializations: [
          'Residential Construction',
          'Commercial Construction',
          'Project Scheduling',
        ],
      },
    ],
    compliance: [
      {
        id: 'building_codes',
        name: 'Building Code Compliance',
        type: 'regulatory',
        requirements: [
          'Follow local building codes',
          'Schedule required inspections',
          'Maintain code compliance documentation',
          'Address violations promptly',
        ],
      },
      {
        id: 'osha_safety',
        name: 'OSHA Safety Compliance',
        type: 'safety',
        requirements: [
          'Maintain safety program',
          'Conduct safety training',
          'Report accidents',
          'Keep safety records',
        ],
        documentation: ['Safety plans', 'Training records', 'Incident reports'],
      },
    ],
    integrations: [
      {
        id: 'procore',
        name: 'Procore',
        provider: 'Procore',
        type: 'project_management',
        features: ['Document management', 'RFIs', 'Submittals', 'Daily logs'],
      },
      {
        id: 'planswift',
        name: 'PlanSwift',
        provider: 'ConstructConnect',
        type: 'estimating',
        features: ['Takeoff', 'Estimating', 'Blueprint viewing'],
      },
    ],
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    description: 'Medical practice and patient management',
    color: 'bg-red-500',
    subTypes: ['General Practice', 'Specialist', 'Dental', 'Mental Health'],
    features: {
      crm: true,
      projectManagement: false,
      scheduling: true,
      inventory: true,
      accounting: true,
      hr: true,
      documentManagement: true,
      compliance: true,
      analytics: true,
      mobileApp: true,
      fieldService: false,
      patients: true,
      prescriptions: true,
    },
    customFields: [
      {
        name: 'patient_id',
        label: 'Patient ID',
        type: 'text',
        required: true,
        group: 'Patient',
      },
      {
        name: 'date_of_birth',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        group: 'Patient',
      },
      {
        name: 'insurance_provider',
        label: 'Insurance Provider',
        type: 'select',
        options: [
          'Medicare',
          'Medicaid',
          'Blue Cross',
          'Aetna',
          'United Health',
          'Cigna',
          'Self-Pay',
        ],
        required: true,
        group: 'Insurance',
      },
      {
        name: 'policy_number',
        label: 'Policy Number',
        type: 'text',
        required: false,
        group: 'Insurance',
      },
      {
        name: 'primary_physician',
        label: 'Primary Physician',
        type: 'text',
        required: false,
        group: 'Care Team',
      },
      {
        name: 'medical_conditions',
        label: 'Medical Conditions',
        type: 'multiselect',
        options: [
          'Diabetes',
          'Hypertension',
          'Asthma',
          'Heart Disease',
          'Arthritis',
          'Depression',
          'Anxiety',
        ],
        required: false,
        group: 'Medical History',
      },
      {
        name: 'allergies',
        label: 'Allergies',
        type: 'text',
        required: false,
        group: 'Medical History',
      },
      {
        name: 'medications',
        label: 'Current Medications',
        type: 'text',
        required: false,
        group: 'Medical History',
      },
      {
        name: 'emergency_contact',
        label: 'Emergency Contact',
        type: 'text',
        required: true,
        group: 'Contact',
      },
      {
        name: 'blood_type',
        label: 'Blood Type',
        type: 'select',
        options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: false,
        group: 'Medical Info',
      },
    ],
    workflows: [
      {
        id: 'patient_visit',
        name: 'Patient Visit Workflow',
        description: 'Standard patient visit process',
        steps: [
          {
            id: 'check_in',
            name: 'Patient Check-In',
            description: 'Patient arrives and checks in',
            nextSteps: ['vitals'],
            requiredFields: ['arrival_time', 'insurance_verification'],
          },
          {
            id: 'vitals',
            name: 'Vital Signs',
            description: 'Nurse takes vital signs',
            nextSteps: ['examination'],
            requiredFields: ['blood_pressure', 'temperature', 'weight'],
          },
          {
            id: 'examination',
            name: 'Doctor Examination',
            description: 'Doctor examines patient',
            nextSteps: ['treatment_plan'],
            requiredFields: ['chief_complaint', 'examination_notes'],
          },
          {
            id: 'treatment_plan',
            name: 'Treatment Plan',
            description: 'Develop treatment plan',
            nextSteps: ['prescriptions', 'labs', 'checkout'],
            requiredFields: ['diagnosis', 'treatment_notes'],
          },
          {
            id: 'prescriptions',
            name: 'Prescriptions',
            description: 'Write prescriptions if needed',
            nextSteps: ['checkout'],
            requiredFields: ['medication', 'dosage', 'duration'],
          },
          {
            id: 'labs',
            name: 'Lab Orders',
            description: 'Order lab tests if needed',
            nextSteps: ['checkout'],
            requiredFields: ['test_type', 'lab_facility'],
          },
          {
            id: 'checkout',
            name: 'Check Out',
            description: 'Patient checks out',
            nextSteps: ['follow_up'],
            requiredFields: ['payment_collected', 'next_appointment'],
          },
          {
            id: 'follow_up',
            name: 'Follow Up',
            description: 'Schedule follow-up if needed',
            automations: ['send_visit_summary', 'schedule_follow_up'],
          },
        ],
      },
      {
        id: 'prescription_refill',
        name: 'Prescription Refill',
        description: 'Handle prescription refill requests',
        steps: [
          {
            id: 'refill_request',
            name: 'Refill Request',
            description: 'Patient requests refill',
            nextSteps: ['review'],
          },
          {
            id: 'review',
            name: 'Provider Review',
            description: 'Provider reviews request',
            nextSteps: ['approve', 'deny', 'appointment_needed'],
            requiredFields: ['medication', 'last_refill_date'],
          },
          {
            id: 'approve',
            name: 'Approve Refill',
            description: 'Refill approved',
            nextSteps: ['pharmacy_notification'],
            automations: ['send_to_pharmacy', 'notify_patient'],
          },
          {
            id: 'deny',
            name: 'Deny Refill',
            description: 'Refill denied',
            automations: ['notify_patient_denial'],
          },
          {
            id: 'appointment_needed',
            name: 'Appointment Required',
            description: 'Patient needs appointment',
            automations: ['schedule_appointment_request'],
          },
          {
            id: 'pharmacy_notification',
            name: 'Pharmacy Notified',
            description: 'Prescription sent to pharmacy',
          },
        ],
      },
    ],
    templates: [
      {
        id: 'patient_intake',
        name: 'Patient Intake Form',
        type: 'form',
        content: 'Comprehensive patient intake form',
        variables: ['patient_info', 'medical_history', 'insurance_info'],
      },
      {
        id: 'visit_summary',
        name: 'Visit Summary',
        type: 'document',
        content: 'After-visit summary for patients',
        variables: ['visit_date', 'diagnosis', 'treatment_plan', 'follow_up'],
      },
      {
        id: 'hipaa_consent',
        name: 'HIPAA Consent Form',
        type: 'document',
        content: 'HIPAA privacy consent form',
        variables: ['patient_name', 'date', 'authorized_parties'],
      },
    ],
    aiAgents: [
      {
        id: 'patient_care_coordinator',
        name: 'Patient Care Coordinator',
        type: 'customer_success',
        knowledge: {
          topics: [
            'Appointment scheduling',
            'Insurance verification',
            'Patient education',
            'Medication adherence',
          ],
          procedures: [
            'Check-in process',
            'Insurance claims',
            'Prescription refills',
            'Lab results',
          ],
        },
        scripts: {
          greeting:
            "Hello! I'm your patient care coordinator. How can I assist you with your healthcare needs today?",
          scheduling: 'I can help you schedule an appointment. What type of visit do you need?',
        },
        tools: {
          appointmentScheduling: true,
          insuranceVerification: true,
          medicationReminders: true,
          labResultsLookup: true,
          patientPortal: true,
        },
        specializations: ['Patient Support', 'Insurance Navigation', 'Appointment Coordination'],
        certifications: ['HIPAA Compliance', 'Patient Privacy'],
      },
      {
        id: 'medical_assistant_ai',
        name: 'Medical Assistant AI',
        type: 'support',
        knowledge: {
          topics: [
            'Vital signs',
            'Common symptoms',
            'Medication information',
            'Pre-visit preparation',
          ],
          commonIssues: [
            'Appointment preparation',
            'Test instructions',
            'Medication questions',
            'Follow-up care',
          ],
        },
        scripts: {
          greeting:
            "I'm your medical assistant. I can help you prepare for your visit or answer general health questions.",
        },
        tools: {
          symptomChecker: true,
          medicationDatabase: true,
          testPreparation: true,
          vitalSignsTracking: true,
        },
      },
    ],
    compliance: [
      {
        id: 'hipaa',
        name: 'HIPAA Compliance',
        type: 'regulatory',
        requirements: [
          'Protect patient privacy',
          'Secure electronic health records',
          'Train staff on HIPAA',
          'Report breaches within 60 days',
          'Maintain audit logs',
        ],
        documentation: [
          'Privacy policies',
          'Security assessments',
          'Training records',
          'Breach notifications',
        ],
      },
      {
        id: 'meaningful_use',
        name: 'Meaningful Use',
        type: 'certification',
        requirements: [
          'Use certified EHR technology',
          'E-prescribing',
          'Record demographics',
          'Record vital signs',
          'Provide patient portal',
        ],
      },
      {
        id: 'clinical_quality',
        name: 'Clinical Quality Measures',
        type: 'quality',
        requirements: [
          'Report quality measures',
          'Track patient outcomes',
          'Preventive care metrics',
          'Chronic disease management',
        ],
      },
    ],
    integrations: [
      {
        id: 'epic_ehr',
        name: 'Epic EHR',
        provider: 'Epic Systems',
        type: 'ehr',
        features: ['Patient records', 'E-prescribing', 'Lab integration', 'Billing'],
      },
      {
        id: 'surescripts',
        name: 'Surescripts',
        provider: 'Surescripts',
        type: 'e-prescribing',
        features: ['E-prescribing', 'Medication history', 'Prior authorization'],
      },
      {
        id: 'quest_diagnostics',
        name: 'Quest Diagnostics',
        provider: 'Quest',
        type: 'laboratory',
        features: ['Lab orders', 'Results delivery', 'Patient portal'],
      },
    ],
  },
  legal: {
    id: 'legal',
    name: 'Legal Services',
    icon: '⚖️',
    description: 'Law firm and case management',
    color: 'bg-purple-500',
    subTypes: ['Corporate', 'Criminal', 'Family', 'Personal Injury', 'Real Estate'],
    features: {
      crm: true,
      projectManagement: true,
      scheduling: true,
      inventory: false,
      accounting: true,
      hr: true,
      documentManagement: true,
      compliance: true,
      analytics: true,
      mobileApp: true,
      fieldService: false,
      caseManagement: true,
      timeTracking: true,
      trustAccounting: true,
    },
    customFields: [
      {
        name: 'case_number',
        label: 'Case Number',
        type: 'text',
        required: true,
        group: 'Case',
      },
      {
        name: 'case_type',
        label: 'Case Type',
        type: 'select',
        options: [
          'Litigation',
          'Contract',
          'Real Estate',
          'Criminal Defense',
          'Family Law',
          'Personal Injury',
          'Corporate',
        ],
        required: true,
        group: 'Case',
      },
      {
        name: 'jurisdiction',
        label: 'Jurisdiction',
        type: 'text',
        required: true,
        group: 'Case',
      },
      {
        name: 'opposing_counsel',
        label: 'Opposing Counsel',
        type: 'text',
        required: false,
        group: 'Case',
      },
      {
        name: 'court',
        label: 'Court',
        type: 'text',
        required: false,
        group: 'Case',
      },
      {
        name: 'judge',
        label: 'Judge',
        type: 'text',
        required: false,
        group: 'Case',
      },
      {
        name: 'filing_date',
        label: 'Filing Date',
        type: 'date',
        required: false,
        group: 'Dates',
      },
      {
        name: 'statute_limitations',
        label: 'Statute of Limitations',
        type: 'date',
        required: false,
        group: 'Dates',
      },
      {
        name: 'retainer_amount',
        label: 'Retainer Amount',
        type: 'number',
        required: false,
        group: 'Billing',
      },
      {
        name: 'billing_type',
        label: 'Billing Type',
        type: 'select',
        options: ['Hourly', 'Flat Fee', 'Contingency', 'Retainer'],
        required: true,
        group: 'Billing',
      },
      {
        name: 'conflict_check',
        label: 'Conflict Check Completed',
        type: 'boolean',
        required: true,
        defaultValue: false,
        group: 'Compliance',
      },
    ],
    workflows: [
      {
        id: 'new_matter',
        name: 'New Matter Intake',
        description: 'New legal matter intake process',
        steps: [
          {
            id: 'initial_consultation',
            name: 'Initial Consultation',
            description: 'Meet with potential client',
            nextSteps: ['conflict_check'],
            requiredFields: ['client_name', 'matter_type'],
          },
          {
            id: 'conflict_check',
            name: 'Conflict Check',
            description: 'Check for conflicts of interest',
            nextSteps: ['engagement_letter', 'decline'],
            requiredFields: ['parties_involved', 'conflict_search'],
          },
          {
            id: 'engagement_letter',
            name: 'Engagement Letter',
            description: 'Prepare and send engagement letter',
            nextSteps: ['retainer'],
            requiredFields: ['scope_of_work', 'fee_structure'],
          },
          {
            id: 'retainer',
            name: 'Retainer Collection',
            description: 'Collect retainer payment',
            nextSteps: ['matter_opened'],
            requiredFields: ['retainer_amount', 'payment_received'],
          },
          {
            id: 'matter_opened',
            name: 'Matter Opened',
            description: 'Legal matter officially opened',
            automations: ['create_matter_folder', 'notify_team'],
          },
          {
            id: 'decline',
            name: 'Decline Representation',
            description: 'Decline to represent',
            automations: ['send_declination_letter'],
          },
        ],
      },
      {
        id: 'litigation',
        name: 'Litigation Workflow',
        description: 'Civil litigation process',
        steps: [
          {
            id: 'pleadings',
            name: 'Pleadings',
            description: 'File initial pleadings',
            nextSteps: ['discovery'],
            requiredFields: ['complaint', 'filing_date'],
          },
          {
            id: 'discovery',
            name: 'Discovery',
            description: 'Discovery phase',
            nextSteps: ['motions'],
            requiredFields: ['discovery_deadline', 'depositions_scheduled'],
          },
          {
            id: 'motions',
            name: 'Motions',
            description: 'Pre-trial motions',
            nextSteps: ['trial_prep'],
          },
          {
            id: 'trial_prep',
            name: 'Trial Preparation',
            description: 'Prepare for trial',
            nextSteps: ['trial', 'settlement'],
          },
          {
            id: 'trial',
            name: 'Trial',
            description: 'Court trial',
            nextSteps: ['verdict'],
          },
          {
            id: 'settlement',
            name: 'Settlement',
            description: 'Case settled',
            nextSteps: ['case_closed'],
          },
          {
            id: 'verdict',
            name: 'Verdict',
            description: 'Trial verdict',
            nextSteps: ['appeal', 'case_closed'],
          },
          {
            id: 'appeal',
            name: 'Appeal',
            description: 'Appeal process',
            nextSteps: ['case_closed'],
          },
          {
            id: 'case_closed',
            name: 'Case Closed',
            description: 'Matter concluded',
            automations: ['final_billing', 'archive_files'],
          },
        ],
      },
    ],
    templates: [
      {
        id: 'engagement_letter',
        name: 'Engagement Letter',
        type: 'document',
        content: 'Standard engagement letter template',
        variables: ['client_name', 'matter_description', 'fee_arrangement', 'scope_of_services'],
      },
      {
        id: 'retainer_agreement',
        name: 'Retainer Agreement',
        type: 'document',
        content: 'Retainer agreement template',
        variables: ['client_name', 'retainer_amount', 'billing_rate', 'payment_terms'],
      },
      {
        id: 'conflict_waiver',
        name: 'Conflict Waiver',
        type: 'document',
        content: 'Conflict of interest waiver',
        variables: ['parties', 'conflict_description', 'waiver_terms'],
      },
    ],
    aiAgents: [
      {
        id: 'legal_research_assistant',
        name: 'Legal Research Assistant',
        type: 'support',
        knowledge: {
          topics: ['Case law', 'Statutes', 'Legal procedures', 'Court rules', 'Legal terminology'],
          procedures: ['Legal research', 'Citation formatting', 'Brief writing', 'Document review'],
        },
        scripts: {
          greeting:
            "I'm your legal research assistant. How can I help with your legal research today?",
        },
        tools: {
          caseSearch: true,
          statuteDatabase: true,
          citationChecker: true,
          briefAnalyzer: true,
          deadlineCalculator: true,
        },
        specializations: ['Legal Research', 'Document Review', 'Citation Analysis'],
        certifications: ['Legal Research Certification'],
      },
      {
        id: 'intake_coordinator',
        name: 'Client Intake Coordinator',
        type: 'sdr',
        knowledge: {
          topics: [
            'Initial consultations',
            'Conflict checking',
            'Fee arrangements',
            'Client onboarding',
          ],
        },
        scripts: {
          greeting:
            'Welcome to our law firm. I can help you with initial consultation scheduling and intake.',
          scheduling:
            'I can schedule a consultation with one of our attorneys. What type of legal matter do you need help with?',
        },
        tools: {
          conflictChecker: true,
          appointmentScheduling: true,
          intakeFormGenerator: true,
          feeCalculator: true,
        },
      },
    ],
    compliance: [
      {
        id: 'bar_rules',
        name: 'Bar Association Rules',
        type: 'professional',
        requirements: [
          'Maintain attorney licenses',
          'Complete CLE requirements',
          'Follow ethical rules',
          'Avoid conflicts of interest',
          'Maintain client confidentiality',
        ],
        documentation: ['Bar licenses', 'CLE certificates', 'Conflict checks'],
      },
      {
        id: 'trust_accounting',
        name: 'Trust Account Compliance',
        type: 'financial',
        requirements: [
          'Separate client funds',
          'Monthly reconciliations',
          'Detailed record keeping',
          'No commingling of funds',
          'Regular audits',
        ],
        deadlines: {
          reconciliation: 'Monthly',
          audit: 'Annual',
        },
      },
      {
        id: 'data_retention',
        name: 'Document Retention',
        type: 'records',
        requirements: [
          'Retain client files for 7 years',
          'Secure document storage',
          'Client notification before destruction',
          'Maintain confidentiality',
        ],
      },
    ],
    integrations: [
      {
        id: 'clio',
        name: 'Clio',
        provider: 'Clio',
        type: 'practice_management',
        features: ['Case management', 'Time tracking', 'Billing', 'Document management'],
      },
      {
        id: 'westlaw',
        name: 'Westlaw',
        provider: 'Thomson Reuters',
        type: 'legal_research',
        features: ['Case law search', 'Statutes', 'Legal analytics', 'Brief analysis'],
      },
      {
        id: 'docusign',
        name: 'DocuSign',
        provider: 'DocuSign',
        type: 'e-signature',
        features: ['Electronic signatures', 'Document tracking', 'Audit trail'],
      },
    ],
  },
  consulting: {
    id: 'consulting',
    name: 'Consulting',
    icon: '💼',
    description: 'Professional services and consulting',
    color: 'bg-indigo-500',
    subTypes: ['Management', 'IT', 'HR', 'Financial', 'Marketing'],
    features: {
      crm: true,
      projectManagement: true,
      scheduling: true,
      inventory: false,
      accounting: true,
      hr: true,
      documentManagement: true,
      compliance: false,
      analytics: true,
      mobileApp: true,
      fieldService: false,
      timeTracking: true,
    },
    customFields: [
      {
        name: 'engagement_type',
        label: 'Engagement Type',
        type: 'select',
        options: ['Strategy', 'Implementation', 'Assessment', 'Training', 'Interim Management'],
        required: true,
        group: 'Engagement',
      },
      {
        name: 'project_duration',
        label: 'Project Duration',
        type: 'select',
        options: ['< 1 month', '1-3 months', '3-6 months', '6-12 months', '> 12 months'],
        required: true,
        group: 'Engagement',
      },
      {
        name: 'client_industry',
        label: 'Client Industry',
        type: 'select',
        options: [
          'Technology',
          'Healthcare',
          'Finance',
          'Retail',
          'Manufacturing',
          'Government',
          'Non-profit',
        ],
        required: true,
        group: 'Client',
      },
      {
        name: 'team_size',
        label: 'Consulting Team Size',
        type: 'number',
        required: true,
        group: 'Team',
      },
      {
        name: 'deliverables',
        label: 'Key Deliverables',
        type: 'text',
        required: true,
        group: 'Deliverables',
      },
      {
        name: 'success_metrics',
        label: 'Success Metrics',
        type: 'text',
        required: false,
        group: 'Metrics',
      },
      {
        name: 'billing_rate',
        label: 'Billing Rate (per hour)',
        type: 'number',
        required: true,
        group: 'Billing',
      },
      {
        name: 'budget',
        label: 'Total Budget',
        type: 'number',
        required: false,
        group: 'Billing',
      },
    ],
    workflows: [
      {
        id: 'consulting_engagement',
        name: 'Consulting Engagement',
        description: 'Full consulting project lifecycle',
        steps: [
          {
            id: 'opportunity',
            name: 'Opportunity',
            description: 'New opportunity identified',
            nextSteps: ['proposal'],
            requiredFields: ['client_name', 'opportunity_value'],
          },
          {
            id: 'proposal',
            name: 'Proposal Development',
            description: 'Develop project proposal',
            nextSteps: ['presentation'],
            requiredFields: ['scope', 'timeline', 'budget'],
          },
          {
            id: 'presentation',
            name: 'Client Presentation',
            description: 'Present proposal to client',
            nextSteps: ['negotiation', 'lost'],
          },
          {
            id: 'negotiation',
            name: 'Contract Negotiation',
            description: 'Negotiate terms',
            nextSteps: ['contract_signed', 'lost'],
            requiredFields: ['final_terms', 'sow'],
          },
          {
            id: 'contract_signed',
            name: 'Contract Signed',
            description: 'Engagement confirmed',
            nextSteps: ['kickoff'],
            automations: ['create_project', 'assign_team'],
          },
          {
            id: 'kickoff',
            name: 'Project Kickoff',
            description: 'Initial client meeting',
            nextSteps: ['execution'],
            requiredFields: ['kickoff_date', 'attendees'],
          },
          {
            id: 'execution',
            name: 'Project Execution',
            description: 'Deliver consulting services',
            nextSteps: ['review'],
            requiredFields: ['progress_updates', 'deliverables'],
          },
          {
            id: 'review',
            name: 'Client Review',
            description: 'Review deliverables with client',
            nextSteps: ['completion', 'revision'],
          },
          {
            id: 'revision',
            name: 'Revisions',
            description: 'Make requested changes',
            nextSteps: ['review'],
          },
          {
            id: 'completion',
            name: 'Project Completion',
            description: 'Project successfully completed',
            nextSteps: ['closeout'],
            automations: ['final_invoice', 'request_testimonial'],
          },
          {
            id: 'closeout',
            name: 'Project Closeout',
            description: 'Administrative closeout',
            automations: ['archive_files', 'team_feedback'],
          },
          {
            id: 'lost',
            name: 'Opportunity Lost',
            description: 'Did not win engagement',
            automations: ['loss_analysis'],
          },
        ],
      },
      {
        id: 'knowledge_management',
        name: 'Knowledge Capture',
        description: 'Capture and share project learnings',
        steps: [
          {
            id: 'project_complete',
            name: 'Project Complete',
            description: 'Project has been delivered',
            nextSteps: ['lessons_learned'],
          },
          {
            id: 'lessons_learned',
            name: 'Lessons Learned',
            description: 'Document key learnings',
            nextSteps: ['knowledge_base'],
            requiredFields: ['key_learnings', 'best_practices', 'challenges'],
          },
          {
            id: 'knowledge_base',
            name: 'Update Knowledge Base',
            description: 'Add to firm knowledge repository',
            automations: ['tag_content', 'notify_practice_area'],
          },
        ],
      },
    ],
    templates: [
      {
        id: 'consulting_proposal',
        name: 'Consulting Proposal',
        type: 'document',
        content: 'Standard consulting proposal template',
        variables: ['client_name', 'project_scope', 'timeline', 'team', 'investment'],
      },
      {
        id: 'sow',
        name: 'Statement of Work',
        type: 'document',
        content: 'Detailed statement of work',
        variables: ['deliverables', 'timeline', 'assumptions', 'exclusions'],
      },
      {
        id: 'status_report',
        name: 'Project Status Report',
        type: 'document',
        content: 'Weekly/monthly status report',
        variables: ['period', 'accomplishments', 'upcoming', 'risks', 'budget_status'],
      },
    ],
    aiAgents: [
      {
        id: 'proposal_assistant',
        name: 'Proposal Development Assistant',
        type: 'support',
        knowledge: {
          topics: ['Proposal writing', 'Pricing strategies', 'Scope definition', 'Risk assessment'],
          procedures: ['Win themes', 'Value proposition', 'Competitive analysis', 'Pricing models'],
        },
        scripts: {
          greeting:
            'I can help you develop winning consulting proposals. What type of engagement are you proposing?',
        },
        tools: {
          proposalTemplates: true,
          pricingCalculator: true,
          winRateAnalysis: true,
          competitorIntelligence: true,
          scopeBuilder: true,
        },
        specializations: ['Proposal Development', 'Pricing Strategy', 'Competitive Intelligence'],
      },
      {
        id: 'project_assistant',
        name: 'Project Management Assistant',
        type: 'support',
        knowledge: {
          topics: [
            'Project planning',
            'Resource allocation',
            'Risk management',
            'Stakeholder management',
          ],
        },
        scripts: {
          greeting:
            "I'm your project management assistant. I can help with planning, tracking, and reporting.",
        },
        tools: {
          ganttCharts: true,
          resourcePlanning: true,
          budgetTracking: true,
          riskRegister: true,
          statusReporting: true,
        },
      },
    ],
    compliance: [],
    integrations: [
      {
        id: 'monday',
        name: 'Monday.com',
        provider: 'Monday',
        type: 'project_management',
        features: ['Task management', 'Team collaboration', 'Time tracking', 'Reporting'],
      },
      {
        id: 'harvest',
        name: 'Harvest',
        provider: 'Harvest',
        type: 'time_tracking',
        features: ['Time tracking', 'Expense tracking', 'Invoicing', 'Reports'],
      },
      {
        id: 'slack',
        name: 'Slack',
        provider: 'Slack',
        type: 'communication',
        features: ['Team chat', 'File sharing', 'Video calls', 'Integrations'],
      },
    ],
  },
}

export function getIndustryConfig(industryType: string): IndustryConfig {
  const config = INDUSTRY_CONFIGS[industryType]
  if (!config) {
    return INDUSTRY_CONFIGS.general as IndustryConfig
  }
  return config
}

export function getAllIndustries(): IndustryConfig[] {
  return Object.values(INDUSTRY_CONFIGS)
}

export function getIndustryFeatures(industryType: string): IndustryFeatures {
  const config = getIndustryConfig(industryType)
  return config.features
}

export function getIndustryCustomFields(
  industryType: string,
  entityType?: string
): CustomFieldConfig[] {
  const config = getIndustryConfig(industryType)
  if (entityType) {
    return config.customFields.filter(
      (field) => !field.group || field.group.toLowerCase() === entityType.toLowerCase()
    )
  }
  return config.customFields
}

export function getIndustryWorkflows(industryType: string): WorkflowConfig[] {
  const config = getIndustryConfig(industryType)
  return config.workflows
}

export function getIndustryAIAgents(industryType: string): AIAgentConfig[] {
  const config = getIndustryConfig(industryType)
  return config.aiAgents
}

export function getIndustryCompliance(industryType: string): ComplianceConfig[] {
  const config = getIndustryConfig(industryType)
  return config.compliance
}

export function getIndustryIntegrations(industryType: string): IntegrationConfig[] {
  const config = getIndustryConfig(industryType)
  return config.integrations
}

export function hasIndustryFeature(industryType: string, feature: keyof IndustryFeatures): boolean {
  const features = getIndustryFeatures(industryType)
  return !!features[feature]
}
