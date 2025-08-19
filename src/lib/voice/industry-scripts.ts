/**
 * CoreFlow360 - Industry-Specific Voice Scripts
 * AI conversation scripts for different industries
 */

export interface VoiceScript {
  id: string
  name: string
  industry: string
  instructions: string
  openingMessage: string
  qualificationQuestions: string[]
  objectionHandling: Record<string, string>
  closingMessage: string
  tools: Array<{
    name: string
    description: string
    parameters: unknown
  }>
}

/**
 * HVAC Service Script
 */
export const hvacServiceScript: VoiceScript = {
  id: 'hvac_service',
  name: 'HVAC Service Lead Qualification',
  industry: 'HVAC',
  instructions: `You are Sarah, a professional HVAC service coordinator at CoreFlow360. Your goal is to:

1. Qualify leads for HVAC service needs (repair, maintenance, installation)
2. Gather essential information: property type, system age, urgency level
3. Schedule service appointments for qualified leads
4. Be empathetic about comfort issues - HVAC problems cause real discomfort

Key points:
- Be warm and understanding about their HVAC issues
- Ask about urgency (no heat/AC is emergency)
- Qualify budget expectations early
- Offer same-day emergency service when needed
- Always end with next steps (appointment or follow-up)

Keep responses under 30 seconds. Speak clearly and professionally.`,

  openingMessage: `Hi, this is Sarah from CoreFlow360 HVAC Services. I'm calling because you recently inquired about HVAC services. I'd love to help you with your heating and cooling needs. Do you have a few minutes to discuss what's going on with your system?`,

  qualificationQuestions: [
    'What type of HVAC issue are you experiencing?',
    'How old is your current system?',
    'What type of property is this for - residential or commercial?',
    'Is this an urgent situation, or are you planning ahead?',
    'Have you had any recent service on this system?',
    "What's your approximate budget range for this work?",
  ],

  objectionHandling: {
    too_expensive:
      "I understand budget is important. We offer flexible financing options and free estimates. Many times, a small repair can extend your system's life significantly. Would you like me to schedule a free diagnostic?",
    need_to_think:
      "Absolutely, this is an important decision. How about I schedule you for a free estimate so you have all the information you need? There's no obligation, and you'll know exactly what you're dealing with.",
    already_have_someone:
      "That's great that you have a regular service provider. Sometimes it helps to get a second opinion, especially for major repairs. Our estimates are always free. Would that be helpful?",
    not_interested:
      "I understand. If your situation changes or you need emergency service, please keep us in mind. We're available 24/7 for HVAC emergencies. Have a great day!",
    call_back_later:
      'Of course! When would be a better time to reach you? I can schedule a quick callback at your convenience.',
  },

  closingMessage: `Perfect! I've scheduled your appointment for [DATE] at [TIME]. You'll receive a confirmation text shortly. Our technician will provide a free estimate and can often complete repairs the same day. Is there anything else I can help you with today?`,

  tools: [
    {
      name: 'schedule_hvac_appointment',
      description: 'Schedule HVAC service appointment',
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string' },
          phone: { type: 'string' },
          address: { type: 'string' },
          service_type: {
            type: 'string',
            enum: ['repair', 'maintenance', 'installation', 'emergency'],
          },
          urgency: {
            type: 'string',
            enum: ['emergency', 'urgent', 'routine'],
          },
          preferred_date: { type: 'string' },
          preferred_time: { type: 'string' },
          system_age: { type: 'string' },
          issue_description: { type: 'string' },
          property_type: { type: 'string', enum: ['residential', 'commercial'] },
        },
        required: ['customer_name', 'phone', 'service_type', 'urgency'],
      },
    },
  ],
}

/**
 * Auto Repair Insurance Script
 */
export const autoRepairInsuranceScript: VoiceScript = {
  id: 'auto_insurance',
  name: 'Auto Repair Insurance Claims',
  industry: 'Auto Insurance',
  instructions: `You are Mike, an auto insurance claims specialist at CoreFlow360. Your goal is to:

1. Qualify auto repair insurance claims
2. Gather accident/damage details quickly and accurately
3. Schedule vehicle inspections
4. Explain the claims process clearly

Key points:
- Be empathetic - car accidents are stressful
- Ask about injuries first (safety priority)
- Get essential claim details: date, location, damage extent
- Offer immediate next steps to reduce stress
- Explain what happens next in the process

Keep responses under 30 seconds. Be professional but caring.`,

  openingMessage: `Hi, this is Mike from CoreFlow360 Insurance Claims. I'm calling about your recent auto insurance inquiry. I'm here to help you through the claims process and get your vehicle repaired as quickly as possible. Were you involved in an accident or do you have vehicle damage to report?`,

  qualificationQuestions: [
    'First, is everyone okay? Were there any injuries?',
    'When did the accident or damage occur?',
    'Can you describe what happened?',
    'Where is your vehicle located now?',
    'Is your vehicle drivable or does it need towing?',
    'Do you have photos of the damage?',
    'Have you filed a police report?',
    "What's your policy number?",
  ],

  objectionHandling: {
    not_at_fault:
      "I understand this wasn't your fault. We'll work with the other party's insurance to handle this properly. Let me get your claim started so we can protect your interests and get your car fixed.",
    deductible_concerns:
      "I know the deductible can be a concern. If the other party is at fault, their insurance should cover everything. Let's get the claim documented first, and we'll sort out the financial details.",
    prefer_own_shop:
      'Absolutely, you can choose your repair shop. We work with many quality shops in your area, or you can use your preferred location. The important thing is getting this claim started.',
    too_busy:
      "I understand you're dealing with a lot right now. This will only take a few minutes, and it'll actually save you time later. I can handle most of the paperwork for you.",
    minor_damage:
      "Even minor damage can be more expensive than it looks. It's always worth getting it properly inspected. The inspection is free and there's no obligation to proceed if the damage is minimal.",
  },

  closingMessage: `Great, I've opened claim #[CLAIM_NUMBER] for you. An inspector will contact you within 24 hours to schedule a convenient time to assess your vehicle. You'll receive a confirmation email shortly with all the details and your claim number. Is there anything else I can help you with regarding your claim?`,

  tools: [
    {
      name: 'create_insurance_claim',
      description: 'Create new auto insurance claim',
      parameters: {
        type: 'object',
        properties: {
          policy_number: { type: 'string' },
          customer_name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          incident_date: { type: 'string' },
          incident_location: { type: 'string' },
          incident_description: { type: 'string' },
          vehicle_make: { type: 'string' },
          vehicle_model: { type: 'string' },
          vehicle_year: { type: 'number' },
          damage_description: { type: 'string' },
          vehicle_drivable: { type: 'boolean' },
          police_report: { type: 'boolean' },
          injuries_reported: { type: 'boolean' },
          fault_determination: {
            type: 'string',
            enum: ['at_fault', 'not_at_fault', 'unknown'],
          },
        },
        required: ['customer_name', 'phone', 'incident_date', 'incident_description'],
      },
    },
    {
      name: 'schedule_vehicle_inspection',
      description: 'Schedule vehicle damage inspection',
      parameters: {
        type: 'object',
        properties: {
          claim_number: { type: 'string' },
          vehicle_location: { type: 'string' },
          preferred_date: { type: 'string' },
          preferred_time: { type: 'string' },
          contact_phone: { type: 'string' },
        },
        required: ['claim_number', 'vehicle_location', 'contact_phone'],
      },
    },
  ],
}

/**
 * General Lead Qualification Script
 */
export const generalLeadScript: VoiceScript = {
  id: 'general_lead',
  name: 'General Lead Qualification',
  industry: 'General',
  instructions: `You are Alex, a professional lead qualification specialist at CoreFlow360. Your goal is to:

1. Understand the prospect's business needs
2. Qualify budget and decision-making authority
3. Assess timeline and urgency
4. Schedule qualified prospects for sales calls

Key points:
- Be consultative, not pushy
- Ask open-ended questions to understand pain points
- Qualify BANT (Budget, Authority, Need, Timeline)
- Position CoreFlow360 as a solution, not just a product
- Always end with a clear next step

Keep responses under 30 seconds. Be professional and helpful.`,

  openingMessage: `Hi, this is Alex from CoreFlow360. I'm calling because you showed interest in our business automation platform. I'd love to understand your current challenges and see if we can help streamline your operations. Do you have a couple of minutes to chat about your business?`,

  qualificationQuestions: [
    "What's your biggest challenge with managing your current business operations?",
    'What systems are you currently using for customer management?',
    'How many people are on your team?',
    "What's driving you to look for a new solution now?",
    'What would success look like for you with a new system?',
    "What's your typical budget range for business software?",
    'Who else would be involved in this decision?',
  ],

  objectionHandling: {
    too_busy:
      "I completely understand - running a business keeps you swamped. That's exactly why automation tools like ours can be so valuable. What if I could show you how to get 10 hours back per week? Would 15 minutes be worth that?",
    happy_current_system:
      "That's great to hear! What do you like most about your current setup? I'm curious - are there any small frustrations or things you wish worked differently?",
    too_expensive:
      'I understand budget is always a consideration. Many of our clients find that CoreFlow360 actually saves them money by reducing manual work and preventing lost leads. What are you currently spending on business software monthly?',
    need_to_research:
      "Smart approach - this is an important decision. What specific areas would you like to research? I can send you some resources and maybe schedule a brief demo when you're ready to see it in action.",
    not_decision_maker:
      'I appreciate your honesty. Who typically handles software decisions at your company? Would it make sense to include them in our next conversation?',
  },

  closingMessage: `Excellent! I'll send you a calendar link to choose a time that works best for your schedule. The demo will be tailored specifically to your [INDUSTRY] business, and I'll show you exactly how other [INDUSTRY] companies are using CoreFlow360 to [SPECIFIC_BENEFIT]. You'll receive the meeting details shortly. Looking forward to speaking with you!`,

  tools: [
    {
      name: 'qualify_lead',
      description: 'Qualify and score business lead',
      parameters: {
        type: 'object',
        properties: {
          company_name: { type: 'string' },
          contact_name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          industry: { type: 'string' },
          company_size: { type: 'number' },
          current_system: { type: 'string' },
          pain_points: {
            type: 'array',
            items: { type: 'string' },
          },
          budget_range: { type: 'string' },
          decision_timeline: { type: 'string' },
          decision_makers: {
            type: 'array',
            items: { type: 'string' },
          },
          urgency_level: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
          },
          lead_score: {
            type: 'number',
            minimum: 0,
            maximum: 100,
          },
        },
        required: ['company_name', 'contact_name', 'phone'],
      },
    },
    {
      name: 'schedule_demo',
      description: 'Schedule product demonstration',
      parameters: {
        type: 'object',
        properties: {
          lead_id: { type: 'string' },
          preferred_date: { type: 'string' },
          preferred_time: { type: 'string' },
          demo_type: {
            type: 'string',
            enum: ['standard', 'industry_specific', 'technical'],
          },
          attendees: {
            type: 'array',
            items: { type: 'string' },
          },
          special_requirements: { type: 'string' },
        },
        required: ['lead_id', 'demo_type'],
      },
    },
  ],
}

/**
 * Script manager for dynamic selection
 */
export class VoiceScriptManager {
  private scripts: Map<string, VoiceScript> = new Map()

  constructor() {
    // Register default scripts
    this.registerScript(hvacServiceScript)
    this.registerScript(autoRepairInsuranceScript)
    this.registerScript(generalLeadScript)
  }

  /**
   * Register a new script
   */
  registerScript(script: VoiceScript): void {
    this.scripts.set(script.id, script)
  }

  /**
   * Get script by ID
   */
  getScript(scriptId: string): VoiceScript | undefined {
    return this.scripts.get(scriptId)
  }

  /**
   * Get script by industry
   */
  getScriptByIndustry(industry: string): VoiceScript | undefined {
    for (const script of this.scripts.values()) {
      if (script.industry.toLowerCase() === industry.toLowerCase()) {
        return script
      }
    }
    return this.getScript('general_lead') // Fallback to general script
  }

  /**
   * Get all available scripts
   */
  getAllScripts(): VoiceScript[] {
    return Array.from(this.scripts.values())
  }

  /**
   * Select best script based on lead data
   */
  selectScript(leadData: {
    industry?: string
    leadSource?: string
    urgency?: string
    serviceType?: string
  }): VoiceScript {
    // Industry-based selection
    if (leadData.industry) {
      const industryScript = this.getScriptByIndustry(leadData.industry)
      if (industryScript) return industryScript
    }

    // Service type-based selection
    if (leadData.serviceType?.toLowerCase().includes('hvac')) {
      return this.getScript('hvac_service') || this.getScript('general_lead')!
    }

    if (leadData.serviceType?.toLowerCase().includes('insurance')) {
      return this.getScript('auto_insurance') || this.getScript('general_lead')!
    }

    // Default to general lead qualification
    return this.getScript('general_lead')!
  }

  /**
   * Customize script for specific lead
   */
  customizeScript(
    baseScript: VoiceScript,
    customizations: {
      companyName?: string
      contactName?: string
      specificNeed?: string
      referralSource?: string
    }
  ): VoiceScript {
    const customScript = { ...baseScript }

    // Customize opening message
    let openingMessage = customScript.openingMessage

    if (customizations.contactName) {
      openingMessage = openingMessage.replace(
        "I'm calling because you recently inquired",
        `I'm calling for ${customizations.contactName} because you recently inquired`
      )
    }

    if (customizations.referralSource) {
      openingMessage += ` I understand you were referred to us by ${customizations.referralSource}.`
    }

    if (customizations.specificNeed) {
      openingMessage += ` I see you're specifically interested in ${customizations.specificNeed}.`
    }

    customScript.openingMessage = openingMessage

    // Customize instructions with lead context
    if (customizations.companyName || customizations.specificNeed) {
      customScript.instructions += `\n\nSpecific context for this call:`

      if (customizations.companyName) {
        customScript.instructions += `\n- Company: ${customizations.companyName}`
      }

      if (customizations.specificNeed) {
        customScript.instructions += `\n- Specific interest: ${customizations.specificNeed}`
      }
    }

    return customScript
  }
}

// Export singleton instance
export const scriptManager = new VoiceScriptManager()
