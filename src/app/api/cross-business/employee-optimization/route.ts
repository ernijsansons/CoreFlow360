import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Input validation schema
const OptimizationRequestSchema = z.object({
  businessIds: z.array(z.string()).min(1),
  timeframe: z.enum(['week', 'month', 'quarter']).default('month'),
  includeTraining: z.boolean().default(true),
  maxCostPerHour: z.number().positive().optional(),
  skillRequirements: z.array(z.string()).optional()
})

// Mock employee data structure
interface Employee {
  id: string
  name: string
  primaryBusinessId: string
  primaryBusinessName: string
  skills: string[]
  currentUtilization: number
  maxHoursPerWeek: number
  crossBusinessRate: number
  aiEfficiencyScore: number
  availableHours: number
}

interface OptimizationOpportunity {
  type: 'REALLOCATION' | 'CROSS_TRAINING' | 'SKILL_SHARING' | 'TEMPORARY_ASSIGNMENT'
  employeeId: string
  employeeName: string
  sourceBusinessId: string
  sourceBusinessName: string
  targetBusinessId: string
  targetBusinessName: string
  hoursPerWeek: number
  role: string
  skills: string[]
  potentialRevenue: number
  confidence: number
  requirements: string[]
  benefits: string[]
  risks: string[]
  implementation: {
    timeToStart: string
    duration: string
    trainingRequired: boolean
    trainingCost?: number
    trainingDuration?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessIds, timeframe, includeTraining, maxCostPerHour, skillRequirements } = 
      OptimizationRequestSchema.parse(body)

    // Mock employee data - in production, this would come from database
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'Sarah Mitchell',
        primaryBusinessId: 'phoenix-hvac',
        primaryBusinessName: 'Phoenix HVAC Services',
        skills: ['Commercial HVAC', 'Troubleshooting', 'Preventive Maintenance', 'Customer Service'],
        currentUtilization: 80,
        maxHoursPerWeek: 40,
        crossBusinessRate: 75,
        aiEfficiencyScore: 92,
        availableHours: 8
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        primaryBusinessId: 'valley-maintenance',
        primaryBusinessName: 'Valley Maintenance Co',
        skills: ['Team Leadership', 'Equipment Repair', 'Project Management', 'Safety Training'],
        currentUtilization: 87.5,
        maxHoursPerWeek: 40,
        crossBusinessRate: 68,
        aiEfficiencyScore: 87,
        availableHours: 5
      },
      {
        id: '3',
        name: 'Jessica Chen',
        primaryBusinessId: 'phoenix-hvac',
        primaryBusinessName: 'Phoenix HVAC Services',
        skills: ['Customer Relations', 'Sales Support', 'Account Management', 'Data Analysis'],
        currentUtilization: 100,
        maxHoursPerWeek: 40,
        crossBusinessRate: 55,
        aiEfficiencyScore: 96,
        availableHours: 0
      },
      {
        id: '4',
        name: 'David Park',
        primaryBusinessId: 'desert-air',
        primaryBusinessName: 'Desert Air Solutions',
        skills: ['Residential HVAC', 'Installation', 'Customer Service', 'Digital Tools'],
        currentUtilization: 75,
        maxHoursPerWeek: 40,
        crossBusinessRate: 65,
        aiEfficiencyScore: 89,
        availableHours: 10
      }
    ]

    // Generate optimization opportunities
    const opportunities: OptimizationOpportunity[] = []

    // Algorithm 1: Direct Reallocation Opportunities
    mockEmployees.forEach(employee => {
      if (employee.availableHours > 0) {
        // Find businesses that could benefit from this employee's skills
        const targetBusinesses = businessIds.filter(id => id !== employee.primaryBusinessId)
        
        targetBusinesses.forEach(targetId => {
          const targetBusiness = getBusinessName(targetId)
          const matchingSkills = getBusinessSkillNeeds(targetId)
            .filter(skill => employee.skills.includes(skill))

          if (matchingSkills.length > 0) {
            const hoursNeeded = Math.min(employee.availableHours, 15) // Max 15 hours for cross-business
            const potentialRevenue = hoursNeeded * employee.crossBusinessRate * 
              (timeframe === 'week' ? 1 : timeframe === 'month' ? 4 : 12)

            opportunities.push({
              type: 'REALLOCATION',
              employeeId: employee.id,
              employeeName: employee.name,
              sourceBusinessId: employee.primaryBusinessId,
              sourceBusinessName: employee.primaryBusinessName,
              targetBusinessId: targetId,
              targetBusinessName: targetBusiness,
              hoursPerWeek: hoursNeeded,
              role: generateRoleForSkills(matchingSkills),
              skills: matchingSkills,
              potentialRevenue,
              confidence: calculateConfidence(employee, matchingSkills),
              requirements: [
                'Manager approval from both businesses',
                'Clear performance metrics definition',
                'Regular progress reviews'
              ],
              benefits: [
                `${employee.primaryBusinessName} maintains ${employee.name} while generating additional revenue`,
                `${targetBusiness} gains expert ${matchingSkills.join(', ')} support`,
                'Improved resource utilization across portfolio'
              ],
              risks: [
                'Potential context switching overhead',
                'Need for clear communication protocols',
                'Performance monitoring across businesses'
              ],
              implementation: {
                timeToStart: '1-2 weeks',
                duration: 'Ongoing',
                trainingRequired: false
              }
            })
          }
        })
      }
    })

    // Algorithm 2: Cross-Training Opportunities
    if (includeTraining) {
      mockEmployees.forEach(employee => {
        if (employee.currentUtilization === 100 && employee.aiEfficiencyScore > 90) {
          // Look for skill gaps this employee could fill with training
          const targetBusinesses = businessIds.filter(id => id !== employee.primaryBusinessId)
          
          targetBusinesses.forEach(targetId => {
            const targetBusiness = getBusinessName(targetId)
            const skillGaps = getBusinessSkillGaps(targetId)
            const trainableSkills = skillGaps.filter(skill => 
              isSkillTrainable(employee.skills, skill)
            )

            if (trainableSkills.length > 0) {
              const trainingCost = trainableSkills.length * 800 // $800 per skill
              const trainingDuration = `${trainableSkills.length * 2} weeks`
              const potentialHours = 10
              const potentialRevenue = potentialHours * (employee.crossBusinessRate + 10) * 
                (timeframe === 'week' ? 1 : timeframe === 'month' ? 4 : 12)

              if (!maxCostPerHour || (trainingCost / (potentialHours * 4)) <= maxCostPerHour) {
                opportunities.push({
                  type: 'CROSS_TRAINING',
                  employeeId: employee.id,
                  employeeName: employee.name,
                  sourceBusinessId: employee.primaryBusinessId,
                  sourceBusinessName: employee.primaryBusinessName,
                  targetBusinessId: targetId,
                  targetBusinessName: targetBusiness,
                  hoursPerWeek: potentialHours,
                  role: generateRoleForSkills(trainableSkills),
                  skills: trainableSkills,
                  potentialRevenue,
                  confidence: calculateTrainingConfidence(employee, trainableSkills),
                  requirements: [
                    'Training program completion',
                    'Skills assessment and certification',
                    'Mentor assignment in target business'
                  ],
                  benefits: [
                    `${employee.name} gains valuable cross-functional skills`,
                    `${targetBusiness} fills critical skill gaps`,
                    'Increased overall portfolio capability',
                    'Better employee retention through development'
                  ],
                  risks: [
                    'Training time investment',
                    'Uncertain skill transfer success',
                    'Potential performance dip during transition'
                  ],
                  implementation: {
                    timeToStart: '2-4 weeks',
                    duration: 'Ongoing after training',
                    trainingRequired: true,
                    trainingCost,
                    trainingDuration
                  }
                })
              }
            }
          })
        }
      })
    }

    // Algorithm 3: Skill Sharing (Knowledge Transfer)
    mockEmployees.forEach(expert => {
      if (expert.aiEfficiencyScore > 85) {
        expert.skills.forEach(skill => {
          // Find employees in other businesses who could benefit from this skill
          const potentialMentees = mockEmployees.filter(emp => 
            emp.primaryBusinessId !== expert.primaryBusinessId &&
            !emp.skills.includes(skill) &&
            businessIds.includes(emp.primaryBusinessId) &&
            isSkillRelevantToBusiness(skill, emp.primaryBusinessId)
          )

          if (potentialMentees.length > 0) {
            potentialMentees.forEach(mentee => {
              opportunities.push({
                type: 'SKILL_SHARING',
                employeeId: expert.id,
                employeeName: expert.name,
                sourceBusinessId: expert.primaryBusinessId,
                sourceBusinessName: expert.primaryBusinessName,
                targetBusinessId: mentee.primaryBusinessId,
                targetBusinessName: getBusinessName(mentee.primaryBusinessId),
                hoursPerWeek: 2, // 2 hours per week for mentoring
                role: `${skill} Mentor`,
                skills: [skill],
                potentialRevenue: 2 * expert.crossBusinessRate * 
                  (timeframe === 'week' ? 1 : timeframe === 'month' ? 4 : 12),
                confidence: 95,
                requirements: [
                  'Mentoring program structure',
                  'Regular knowledge transfer sessions',
                  'Progress tracking system'
                ],
                benefits: [
                  `${getBusinessName(mentee.primaryBusinessId)} team upskills in ${skill}`,
                  `${expert.name} develops leadership and teaching skills`,
                  'Knowledge preservation and multiplication',
                  'Stronger cross-business relationships'
                ],
                risks: [
                  'Time commitment for expert',
                  'Learning curve for mentee',
                  'Need for structured program'
                ],
                implementation: {
                  timeToStart: '1 week',
                  duration: '8-12 weeks',
                  trainingRequired: false
                }
              })
            })
          }
        })
      }
    })

    // Sort opportunities by confidence and potential revenue
    opportunities.sort((a, b) => 
      (b.confidence * b.potentialRevenue) - (a.confidence * a.potentialRevenue)
    )

    // Filter by skill requirements if provided
    const filteredOpportunities = skillRequirements && skillRequirements.length > 0
      ? opportunities.filter(opp => 
          skillRequirements.some(req => opp.skills.includes(req))
        )
      : opportunities

    // Calculate summary metrics
    const totalPotentialRevenue = filteredOpportunities.reduce((sum, opp) => sum + opp.potentialRevenue, 0)
    const averageConfidence = filteredOpportunities.length > 0 
      ? filteredOpportunities.reduce((sum, opp) => sum + opp.confidence, 0) / filteredOpportunities.length
      : 0

    const response = {
      success: true,
      summary: {
        totalOpportunities: filteredOpportunities.length,
        totalPotentialRevenue,
        averageConfidence: Math.round(averageConfidence),
        timeframe,
        opportunityTypes: {
          reallocation: filteredOpportunities.filter(opp => opp.type === 'REALLOCATION').length,
          crossTraining: filteredOpportunities.filter(opp => opp.type === 'CROSS_TRAINING').length,
          skillSharing: filteredOpportunities.filter(opp => opp.type === 'SKILL_SHARING').length,
          temporaryAssignment: filteredOpportunities.filter(opp => opp.type === 'TEMPORARY_ASSIGNMENT').length
        }
      },
      opportunities: filteredOpportunities.slice(0, 20), // Return top 20 opportunities
      recommendations: [
        'Focus on high-confidence reallocation opportunities for immediate impact',
        'Invest in cross-training for long-term capability building',
        'Implement skill-sharing programs to multiply expertise across the portfolio'
      ]
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in employee optimization API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input parameters',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getBusinessName(businessId: string): string {
  const businessNames = {
    'phoenix-hvac': 'Phoenix HVAC Services',
    'desert-air': 'Desert Air Solutions',
    'valley-maintenance': 'Valley Maintenance Co'
  }
  return businessNames[businessId as keyof typeof businessNames] || 'Unknown Business'
}

function getBusinessSkillNeeds(businessId: string): string[] {
  const skillNeeds = {
    'phoenix-hvac': ['Commercial HVAC', 'Customer Service', 'Sales Support'],
    'desert-air': ['Residential HVAC', 'Installation', 'Digital Tools'],
    'valley-maintenance': ['Equipment Repair', 'Project Management', 'Safety Training']
  }
  return skillNeeds[businessId as keyof typeof skillNeeds] || []
}

function getBusinessSkillGaps(businessId: string): string[] {
  const skillGaps = {
    'phoenix-hvac': ['Digital Marketing', 'Advanced Diagnostics'],
    'desert-air': ['Commercial HVAC', 'Team Leadership'],
    'valley-maintenance': ['Customer Relations', 'HVAC Troubleshooting']
  }
  return skillGaps[businessId as keyof typeof skillGaps] || []
}

function generateRoleForSkills(skills: string[]): string {
  if (skills.includes('Team Leadership')) return 'Team Lead Consultant'
  if (skills.includes('Customer Service')) return 'Customer Success Specialist'
  if (skills.includes('HVAC')) return 'HVAC Technical Consultant'
  if (skills.includes('Project Management')) return 'Project Coordination Specialist'
  return 'Cross-Business Specialist'
}

function calculateConfidence(employee: Employee, matchingSkills: string[]): number {
  const baseConfidence = 70
  const efficiencyBonus = (employee.aiEfficiencyScore - 80) / 2
  const skillMatch = (matchingSkills.length / employee.skills.length) * 20
  const utilizationPenalty = employee.currentUtilization > 90 ? -10 : 0
  
  return Math.min(95, Math.max(50, baseConfidence + efficiencyBonus + skillMatch + utilizationPenalty))
}

function calculateTrainingConfidence(employee: Employee, trainableSkills: string[]): number {
  const baseConfidence = 60
  const efficiencyBonus = (employee.aiEfficiencyScore - 80) / 3
  const skillComplexity = trainableSkills.length > 2 ? -10 : 0
  
  return Math.min(90, Math.max(40, baseConfidence + efficiencyBonus + skillComplexity))
}

function isSkillTrainable(currentSkills: string[], targetSkill: string): boolean {
  const skillSynergies = {
    'Digital Marketing': ['Customer Relations', 'Sales Support'],
    'Advanced Diagnostics': ['Troubleshooting', 'Commercial HVAC'],
    'Commercial HVAC': ['Residential HVAC', 'Equipment Repair'],
    'Team Leadership': ['Project Management', 'Safety Training']
  }
  
  const synergisticSkills = skillSynergies[targetSkill as keyof typeof skillSynergies] || []
  return synergisticSkills.some(skill => currentSkills.includes(skill))
}

function isSkillRelevantToBusiness(skill: string, businessId: string): boolean {
  const businessRelevance = {
    'phoenix-hvac': ['Commercial HVAC', 'Customer Service', 'Sales Support', 'Troubleshooting'],
    'desert-air': ['Residential HVAC', 'Installation', 'Digital Tools', 'Customer Service'],
    'valley-maintenance': ['Equipment Repair', 'Project Management', 'Safety Training', 'Team Leadership']
  }
  
  const relevantSkills = businessRelevance[businessId as keyof typeof businessRelevance] || []
  return relevantSkills.includes(skill)
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cross-business employee optimization API',
    version: '1.0.0',
    endpoints: {
      'POST /': 'Get optimization opportunities for specified businesses'
    },
    parameters: {
      businessIds: 'Array of business IDs to analyze',
      timeframe: 'Analysis timeframe (week, month, quarter)',
      includeTraining: 'Include cross-training opportunities',
      maxCostPerHour: 'Maximum cost per hour for training opportunities',
      skillRequirements: 'Filter by specific skill requirements'
    }
  })
}