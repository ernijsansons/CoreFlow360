/**
 * CoreFlow360 - Industry-Specific Conversation Templates
 * Chain of Thought conversation templates for different industries
 */

export interface ConversationTemplate {
  id: string
  name: string
  industry: string
  scenario: string
  openingScript: string
  qualificationCriteria: QualificationCriteria
  conversationFlow: ConversationFlow[]
  objectionHandling: ObjectionResponse[]
  appointmentQuestions: string[]
  closingScripts: Record<string, string>
  chainOfThoughtPrompts: ChainOfThoughtPrompts
}

interface QualificationCriteria {
  highValue: QualificationFactor[]
  mediumValue: QualificationFactor[]
  lowValue: QualificationFactor[]
  disqualifiers: string[]
}

interface QualificationFactor {
  factor: string
  weight: number
  indicators: string[]
  questions: string[]
}

interface ConversationFlow {
  state: string
  purpose: string
  questions: string[]
  expectedResponses: string[]
  nextStates: string[]
  failureHandling: string
}

interface ObjectionResponse {
  objection: string
  category: 'price' | 'timing' | 'trust' | 'need' | 'authority'
  responses: string[]
  followUp: string[]
}

interface ChainOfThoughtPrompts {
  systemContext: string
  qualificationLogic: string
  responseStrategies: string[]
  escalationTriggers: string[]
}

/**
 * HVAC Lead Qualification Template
 */
export const hvacLeadTemplate: ConversationTemplate = {
  id: 'hvac_lead_qualification',
  name: 'HVAC Lead Qualification',
  industry: 'HVAC',
  scenario: 'Customer inquiry about HVAC repair/replacement',
  
  openingScript: `Hi {customerName}, this is Sarah from CoreFlow360 HVAC Services. I'm calling about your inquiry regarding {serviceType}. I hope I'm catching you at a good time? I'd love to help you get your comfort issue resolved quickly.`,
  
  qualificationCriteria: {
    highValue: [
      {
        factor: 'urgency',
        weight: 25,
        indicators: ['no heat', 'no cooling', 'emergency', 'broken down', 'not working'],
        questions: ['When did this issue start?', 'Is your home comfortable right now?']
      },
      {
        factor: 'decision_maker',
        weight: 20,
        indicators: ['I own', 'my home', 'I can decide', 'I\'ll schedule'],
        questions: ['Are you the homeowner?', 'Will you be making the decision on repairs?']
      },
      {
        factor: 'budget_authority',
        weight: 20,
        indicators: ['whatever it takes', 'need it fixed', 'cost isn\'t issue'],
        questions: ['Have you budgeted for this repair?', 'Are you looking for financing options?']
      },
      {
        factor: 'system_age',
        weight: 15,
        indicators: ['old system', '10+ years', 'frequent repairs'],
        questions: ['How old is your current system?', 'Have you needed repairs recently?']
      }
    ],
    mediumValue: [
      {
        factor: 'maintenance_due',
        weight: 10,
        indicators: ['tune-up', 'maintenance', 'check-up'],
        questions: ['When was your last service?', 'Are you looking for preventive care?']
      }
    ],
    lowValue: [
      {
        factor: 'price_shopping',
        weight: 5,
        indicators: ['comparing quotes', 'best price', 'cheapest'],
        questions: ['Are you getting multiple estimates?', 'What\'s most important to you?']
      }
    ],
    disqualifiers: [
      'renting', 'landlord decision', 'just looking', 'not ready', 'no budget'
    ]
  },

  conversationFlow: [
    {
      state: 'greeting',
      purpose: 'Establish rapport and confirm availability',
      questions: [
        'I hope I\'m catching you at a good time?',
        'I see you inquired about {serviceType} - is that correct?'
      ],
      expectedResponses: ['yes', 'good time', 'that\'s right', 'correct'],
      nextStates: ['problem_identification', 'objection_handling'],
      failureHandling: 'Ask when would be a better time to call'
    },
    {
      state: 'problem_identification',
      purpose: 'Understand the specific HVAC issue',
      questions: [
        'Can you tell me what\'s happening with your heating and cooling system?',
        'When did you first notice this problem?',
        'Is your home comfortable right now?'
      ],
      expectedResponses: ['not working', 'no heat', 'no cooling', 'strange noise'],
      nextStates: ['urgency_assessment', 'information_gathering'],
      failureHandling: 'Ask more specific diagnostic questions'
    },
    {
      state: 'urgency_assessment',
      purpose: 'Determine timeline and urgency level',
      questions: [
        'How urgent is this for you and your family?',
        'Are you without heat or cooling completely?',
        'When would you like this resolved?'
      ],
      expectedResponses: ['urgent', 'emergency', 'asap', 'today', 'this week'],
      nextStates: ['authority_qualification', 'appointment_booking'],
      failureHandling: 'Clarify comfort level and family needs'
    },
    {
      state: 'authority_qualification',
      purpose: 'Confirm decision-making authority',
      questions: [
        'Are you the homeowner?',
        'Will you be making the decision on any repairs needed?',
        'Is there anyone else who would need to approve this service?'
      ],
      expectedResponses: ['yes', 'I own', 'I decide', 'it\'s my house'],
      nextStates: ['budget_discussion', 'appointment_booking'],
      failureHandling: 'Ask when decision maker would be available'
    }
  ],

  objectionHandling: [
    {
      objection: 'too expensive',
      category: 'price',
      responses: [
        'I understand cost is a concern. The good news is we offer flexible financing options with payments as low as $49/month.',
        'Let me ask - what would it be worth to have your family comfortable again? We can work within your budget.'
      ],
      followUp: [
        'Would you like me to explain our financing options?',
        'What budget range were you thinking?'
      ]
    },
    {
      objection: 'need to think about it',
      category: 'timing',
      responses: [
        'I completely understand - this is an important decision. What specific concerns do you have that I might be able to address?',
        'While you\'re thinking it over, would it help to have a free estimate so you know exactly what you\'re dealing with?'
      ],
      followUp: [
        'What information would help you make this decision?',
        'When would be a good time to follow up with you?'
      ]
    },
    {
      objection: 'want to get other quotes',
      category: 'price',
      responses: [
        'That makes perfect sense - you want to make sure you\'re making the right choice. Most of our customers did the same thing.',
        'I respect that approach. What I can offer is a free diagnostic visit so you have accurate information to compare.'
      ],
      followUp: [
        'What factors are most important to you besides price?',
        'Would it help to have our expert assessment first?'
      ]
    }
  ],

  appointmentQuestions: [
    'What days work best for you - weekdays or weekends?',
    'Do you prefer morning or afternoon appointments?',
    'Will someone be home during business hours?',
    'Do you have any scheduling constraints I should know about?'
  ],

  closingScripts: {
    appointment_scheduled: 'Perfect! I have you scheduled for {date} at {time}. Our technician will call 30 minutes before arrival. You\'ll receive a confirmation email shortly. Is there anything else I can help you with today?',
    callback_requested: 'I understand you\'d like some time to think about it. I\'ll have one of our specialists call you back in {timeframe} to answer any questions you might have. Sound good?',
    not_qualified: 'I appreciate your time today. Based on what you\'ve shared, it sounds like you\'re still in the early stages of exploring your options. Feel free to call us when you\'re ready to move forward.',
    human_handoff: 'Let me connect you with one of our senior HVAC specialists who can give you more detailed information. Please hold for just a moment.'
  },

  chainOfThoughtPrompts: {
    systemContext: `You are an expert HVAC service representative with 10+ years of experience. You understand that HVAC issues can be emergencies affecting family comfort and safety. Your goal is to help customers quickly while qualifying genuine service needs.`,
    
    qualificationLogic: `
    HIGH VALUE INDICATORS (8-10 score):
    - Emergency situations (no heat/cooling)
    - Homeowner with decision authority
    - System 10+ years old or frequent repairs
    - Willing to invest in proper solution
    
    MEDIUM VALUE (5-7 score):
    - Maintenance or tune-up needs  
    - Some urgency but not emergency
    - Budget-conscious but realistic
    
    LOW VALUE (1-4 score):
    - Just price shopping
    - No urgency or timeline
    - Renters or no authority
    `,
    
    responseStrategies: [
      'Emergency situations: Show urgency and same-day availability',
      'Budget concerns: Focus on financing and value proposition',
      'Multiple quotes: Emphasize quality, warranty, and expertise',
      'Maintenance: Position as preventive investment'
    ],
    
    escalationTriggers: [
      'Customer seems confused about technical details',
      'Complex system issues requiring diagnosis',
      'Budget over $5000 for major replacement',
      'Multiple failed attempts to qualify'
    ]
  }
}

/**
 * Auto Repair Insurance Approval Template
 */
export const autoRepairInsuranceTemplate: ConversationTemplate = {
  id: 'auto_repair_insurance',
  name: 'Auto Repair Insurance Approval',
  industry: 'Auto Repair',
  scenario: 'Calling insurance company to approve repair estimate',
  
  openingScript: `Good {timeOfDay}, this is Mike from CoreFlow360 Auto Body. I'm calling regarding claim #{claimNumber} for your insured, {customerName}. I have the repair estimate ready for approval.`,
  
  qualificationCriteria: {
    highValue: [
      {
        factor: 'claim_approved',
        weight: 30,
        indicators: ['approved', 'authorized', 'go ahead', 'proceed'],
        questions: ['Is this claim approved for repair?', 'What\'s the authorization amount?']
      },
      {
        factor: 'preferred_shop',
        weight: 25,
        indicators: ['preferred', 'network', 'direct pay'],
        questions: ['Are we a preferred provider?', 'Is this direct pay?']
      },
      {
        factor: 'estimate_accuracy',
        weight: 20,
        indicators: ['matches', 'accurate', 'complete'],
        questions: ['Does our estimate match your assessment?', 'Any supplements needed?']
      }
    ],
    mediumValue: [
      {
        factor: 'supplement_needed',
        weight: 15,
        indicators: ['additional', 'supplement', 'more damage'],
        questions: ['Will you need a supplement for additional damage?', 'When can adjuster re-inspect?']
      }
    ],
    lowValue: [
      {
        factor: 'dispute_estimate',
        weight: 10,
        indicators: ['too high', 'question', 'dispute'],
        questions: ['Which line items are you questioning?', 'Can we discuss the discrepancies?']
      }
    ],
    disqualifiers: [
      'claim denied', 'not covered', 'fraud investigation', 'customer responsible'
    ]
  },

  conversationFlow: [
    {
      state: 'claim_verification',
      purpose: 'Verify claim details and status',
      questions: [
        'I\'m calling about claim #{claimNumber} - can you confirm the status?',
        'I have {customerName} as the insured - is that correct?',
        'What\'s the current authorization amount?'
      ],
      expectedResponses: ['confirmed', 'correct', 'approved', 'authorized'],
      nextStates: ['estimate_review', 'claim_issues'],
      failureHandling: 'Request to speak with claims adjuster'
    },
    {
      state: 'estimate_review',
      purpose: 'Review repair estimate line by line',
      questions: [
        'I\'m showing a total estimate of ${total} - does that match your records?',
        'Are there any line items you\'d like me to explain?',
        'Do you need any additional documentation?'
      ],
      expectedResponses: ['matches', 'looks good', 'approved', 'questions about'],
      nextStates: ['approval_confirmation', 'estimate_dispute'],
      failureHandling: 'Offer to email detailed breakdown'
    }
  ],

  objectionHandling: [
    {
      objection: 'estimate too high',
      category: 'price',
      responses: [
        'I understand your concern. Let me walk you through the estimate line by line to show you how we arrived at these figures.',
        'Our estimates are based on current market rates and OEM parts. Would you like me to explain any specific items?'
      ],
      followUp: [
        'Which specific line items would you like me to clarify?',
        'Are you seeing different labor rates in your system?'
      ]
    },
    {
      objection: 'need second estimate',
      category: 'trust',
      responses: [
        'That\'s completely reasonable. We want to make sure everyone is comfortable with the repair scope.',
        'Would you prefer to have your adjuster take another look, or should we get an independent estimate?'
      ],
      followUp: [
        'What timeline works for the second inspection?',
        'Should I coordinate with your preferred estimator?'
      ]
    }
  ],

  appointmentQuestions: [
    'When can you schedule the repair to begin?',
    'How long do you need for the approval process?',
    'Should I coordinate directly with your adjuster?',
    'What\'s the customer\'s preferred timeline?'
  ],

  closingScripts: {
    approved: 'Excellent! I have approval for ${amount} to proceed with the repairs. We\'ll begin work on {date} and complete by {completionDate}. I\'ll send you photos of the completed work.',
    supplement_needed: 'I\'ll document the additional damage and submit a supplement request. Once approved, we can complete all the work together. What\'s your typical supplement turnaround time?',
    disputed: 'I understand your concerns about the estimate. Let me work with your adjuster to resolve these line items. Who should I contact to discuss the details?',
    claim_issues: 'It sounds like there may be some claim issues to resolve first. Should I wait for your call back, or is there someone else I should speak with about this claim?'
  },

  chainOfThoughtPrompts: {
    systemContext: `You are an experienced auto body shop manager dealing with insurance companies daily. You understand insurance processes, claim procedures, and how to professionally advocate for proper repairs while maintaining good relationships with adjusters.`,
    
    qualificationLogic: `
    HIGH VALUE (Approved Claims):
    - Claim is approved and authorized
    - Shop is preferred provider
    - Estimate matches adjuster assessment
    - Clear timeline for completion
    
    MEDIUM VALUE (Needs Resolution):
    - Supplements needed for hidden damage
    - Minor estimate discrepancies
    - Timeline or process questions
    
    LOW VALUE (Problematic):
    - Significant estimate disputes
    - Claim coverage issues  
    - Customer payment problems
    `,
    
    responseStrategies: [
      'Approved claims: Focus on timeline and quality completion',
      'Estimate disputes: Stay factual, offer detailed explanations',
      'Supplements: Document thoroughly, follow proper procedures',
      'Delays: Be flexible but maintain professional standards'
    ],
    
    escalationTriggers: [
      'Claims adjusters challenging standard procedures',
      'Disputes over OEM vs aftermarket parts',
      'Supplements over $1000',
      'Customer satisfaction issues'
    ]
  }
}

/**
 * General Business Lead Template
 */
export const generalBusinessTemplate: ConversationTemplate = {
  id: 'general_business_lead',
  name: 'General Business Lead Qualification',
  industry: 'General Business',
  scenario: 'Qualifying general business service inquiry',
  
  openingScript: `Hi {customerName}, this is Alex from CoreFlow360. I'm following up on your inquiry about our {serviceType} services. I hope I'm catching you at a good time to discuss how we can help your business?`,
  
  qualificationCriteria: {
    highValue: [
      {
        factor: 'budget_authority',
        weight: 30,
        indicators: ['I make the decision', 'I have budget', 'I can approve'],
        questions: ['Are you involved in the decision-making process?', 'Have you budgeted for this project?']
      },
      {
        factor: 'timeline_urgency',
        weight: 25,
        indicators: ['need soon', 'urgent', 'this quarter', 'immediate'],
        questions: ['When are you looking to implement this?', 'What\'s driving the timeline?']
      },
      {
        factor: 'business_need',
        weight: 20,
        indicators: ['must have', 'critical', 'solving problem'],
        questions: ['What challenges are you trying to solve?', 'What happens if you don\'t address this?']
      },
      {
        factor: 'company_size',
        weight: 15,
        indicators: ['employees', 'revenue', 'locations'],
        questions: ['How many employees do you have?', 'Are you a single location or multi-location?']
      }
    ],
    mediumValue: [
      {
        factor: 'exploring_options',
        weight: 10,
        indicators: ['researching', 'exploring', 'investigating'],
        questions: ['Where are you in your research process?', 'What other solutions are you considering?']
      }
    ],
    lowValue: [
      {
        factor: 'just_curious',
        weight: 5,
        indicators: ['just looking', 'curious', 'maybe someday'],
        questions: ['What sparked your interest in this?', 'Is this a current priority?']
      }
    ],
    disqualifiers: [
      'no budget', 'not my decision', 'just browsing', 'student project'
    ]
  },

  conversationFlow: [
    {
      state: 'need_discovery',
      purpose: 'Understand business challenges and needs',
      questions: [
        'What challenges is your business facing that brought you to us?',
        'How are you currently handling {serviceArea}?',
        'What would an ideal solution look like for you?'
      ],
      expectedResponses: ['problem with', 'need to improve', 'looking for', 'want to'],
      nextStates: ['solution_fit', 'objection_handling'],
      failureHandling: 'Ask more specific questions about their industry/role'
    },
    {
      state: 'solution_fit',
      purpose: 'Determine if our solution matches their needs',
      questions: [
        'Based on what you\'ve shared, it sounds like our {solution} could help. Does that align with what you\'re looking for?',
        'What\'s most important to you in a solution - cost, speed, reliability?',
        'Have you worked with a service like ours before?'
      ],
      expectedResponses: ['sounds good', 'that could work', 'interested', 'tell me more'],
      nextStates: ['authority_budget', 'information_gathering'],
      failureHandling: 'Clarify their specific requirements'
    }
  ],

  objectionHandling: [
    {
      objection: 'too expensive',
      category: 'price',
      responses: [
        'I understand budget is important. Let me ask - what would it be worth to solve {businessProblem}?',
        'Many of our clients found that the cost of not addressing this issue was much higher. What\'s the cost of the status quo?'
      ],
      followUp: [
        'What budget range were you thinking?',
        'Would it help to see the ROI analysis?'
      ]
    },
    {
      objection: 'need to discuss internally',
      category: 'authority',
      responses: [
        'That makes complete sense. Who else would be involved in this decision?',
        'I\'d be happy to prepare information for your team. What questions would they likely have?'
      ],
      followUp: [
        'When would you have those discussions?',
        'Would it be helpful if I joined a team call?'
      ]
    }
  ],

  appointmentQuestions: [
    'Would you prefer a demo or a consultation first?',
    'What days typically work better for you - beginning or end of week?',
    'Should anyone else join our meeting?',
    'Would you prefer a call or in-person meeting?'
  ],

  closingScripts: {
    demo_scheduled: 'Perfect! I have us scheduled for a {meetingType} on {date} at {time}. I\'ll send you a calendar invitation with all the details. In the meantime, is there anything specific you\'d like me to prepare?',
    follow_up_scheduled: 'I understand you need to think it over. Let me follow up with you on {date} to answer any questions that come up. Does that work for you?',
    not_ready: 'I can see this isn\'t the right time for you. I appreciate your honesty. May I check back with you in {timeframe} to see if anything has changed?',
    qualified_handoff: 'Based on everything you\'ve shared, I think our senior consultant would be perfect to help you. Let me get you connected with them to dive deeper into your specific needs.'
  },

  chainOfThoughtPrompts: {
    systemContext: `You are a skilled business development representative with expertise in qualifying B2B leads. You understand business challenges, decision-making processes, and how to identify genuine opportunities while building professional relationships.`,
    
    qualificationLogic: `
    HIGH VALUE (8-10 score):
    - Decision maker with budget authority
    - Urgent business need or timeline  
    - Clear problem our solution solves
    - Established company with growth potential
    
    MEDIUM VALUE (5-7 score):
    - Influencer in decision process
    - Exploring solutions actively
    - Some urgency or business case
    - Mid-market company
    
    LOW VALUE (1-4 score):
    - No decision authority
    - No timeline or urgency
    - Just gathering information
    - Very small company or individual
    `,
    
    responseStrategies: [
      'High-value prospects: Focus on business outcomes and ROI',
      'Budget concerns: Emphasize value and cost of inaction',
      'Authority issues: Map decision-making process',
      'Timeline delays: Understand underlying drivers'
    ],
    
    escalationTriggers: [
      'Complex enterprise requirements',
      'Multi-stakeholder decision process',
      'Custom solution needs',
      'High-value opportunity over $50K'
    ]
  }
}

/**
 * Template registry for easy access
 */
export const conversationTemplates: Record<string, ConversationTemplate> = {
  'hvac_lead_qualification': hvacLeadTemplate,
  'auto_repair_insurance': autoRepairInsuranceTemplate,
  'general_business_lead': generalBusinessTemplate
}

/**
 * Get conversation template by industry and scenario
 */
export function getConversationTemplate(industry: string, scenario?: string): ConversationTemplate {
  // Default mappings by industry
  const industryDefaults: Record<string, string> = {
    'HVAC': 'hvac_lead_qualification',
    'Auto Repair': 'auto_repair_insurance',
    'General': 'general_business_lead'
  }
  
  const templateId = industryDefaults[industry] || 'general_business_lead'
  return conversationTemplates[templateId] || conversationTemplates['general_business_lead']
}

/**
 * Calculate qualification score based on template criteria
 */
export function calculateQualificationScore(
  template: ConversationTemplate,
  extractedData: Record<string, any>
): number {
  let totalScore = 0
  let maxPossibleScore = 0
  
  // Check high value factors
  for (const factor of template.qualificationCriteria.highValue) {
    maxPossibleScore += factor.weight
    
    for (const indicator of factor.indicators) {
      const dataValue = JSON.stringify(extractedData).toLowerCase()
      if (dataValue.includes(indicator.toLowerCase())) {
        totalScore += factor.weight
        break
      }
    }
  }
  
  // Check medium value factors
  for (const factor of template.qualificationCriteria.mediumValue) {
    maxPossibleScore += factor.weight
    
    for (const indicator of factor.indicators) {
      const dataValue = JSON.stringify(extractedData).toLowerCase()
      if (dataValue.includes(indicator.toLowerCase())) {
        totalScore += factor.weight
        break
      }
    }
  }
  
  // Check disqualifiers
  for (const disqualifier of template.qualificationCriteria.disqualifiers) {
    const dataValue = JSON.stringify(extractedData).toLowerCase()
    if (dataValue.includes(disqualifier.toLowerCase())) {
      return 1 // Disqualified
    }
  }
  
  // Convert to 1-10 scale
  if (maxPossibleScore === 0) return 5 // Neutral if no criteria matched
  
  const scorePercentage = totalScore / maxPossibleScore
  return Math.max(1, Math.min(10, Math.round(scorePercentage * 10)))
}