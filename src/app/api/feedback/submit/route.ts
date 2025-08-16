/**
 * Feedback Submission API
 * Handles all types of customer feedback with categorization and analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { successResponse, createdResponse, validationErrorResponse, errorResponse } from '@/lib/api-response'
import { feedbackSchema, surveyResponseSchema, interviewRequestSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'submit_feedback':
        return await handleFeedbackSubmission(data)
      case 'submit_survey':
        return await handleSurveyResponse(data)
      case 'request_interview':
        return await handleInterviewRequest(data)
      default:
        return validationErrorResponse(
          [{ message: 'Invalid action specified', path: ['action'] }],
          'Invalid action'
        )
    }
  } catch (error) {
    console.error('[Feedback API Error]', error)
    return errorResponse(error as Error)
  }
}

async function handleFeedbackSubmission(data: any) {
  try {
    const validatedData = feedbackSchema.parse(data)
    
    // Create feedback record
    const feedback = await prisma.$executeRaw`
      INSERT INTO customer_feedback (
        type, title, description, priority, category,
        user_email, user_id, tenant_id, metadata,
        reproduction_steps, expected_behavior, actual_behavior,
        browser_info, status, created_at
      ) VALUES (
        ${validatedData.type},
        ${validatedData.title},
        ${validatedData.description},
        ${validatedData.priority || 'medium'},
        ${validatedData.category || 'general'},
        ${validatedData.userEmail || null},
        ${validatedData.userId || null},
        ${validatedData.tenantId || null},
        ${JSON.stringify(validatedData.metadata || {})},
        ${validatedData.reproductionSteps || null},
        ${validatedData.expectedBehavior || null},
        ${validatedData.actualBehavior || null},
        ${validatedData.browserInfo || null},
        'open',
        NOW()
      )
    `

    // Track analytics event
    console.log('[Feedback Submitted]', {
      type: validatedData.type,
      category: validatedData.category,
      priority: validatedData.priority,
      hasEmail: !!validatedData.userEmail
    })

    // In production, this would:
    // 1. Send notification to product team
    // 2. Create ticket in issue tracking system
    // 3. Send confirmation email to user
    // 4. Update feature request board if applicable

    return createdResponse({
      id: Date.now().toString(), // In production, use actual ID
      status: 'received',
      estimatedResponseTime: getResponseTime(validatedData.type, validatedData.priority)
    }, 'Feedback submitted successfully')

  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors, 'Validation failed')
    }
    throw error
  }
}

async function handleSurveyResponse(data: any) {
  try {
    const validatedData = surveyResponseSchema.parse(data)
    
    // Create survey response record
    const response = await prisma.$executeRaw`
      INSERT INTO survey_responses (
        survey_id, survey_title, responses, user_id,
        user_email, completed_at, time_spent, metadata, created_at
      ) VALUES (
        ${validatedData.surveyId},
        ${validatedData.surveyTitle},
        ${JSON.stringify(validatedData.responses)},
        ${validatedData.userId || null},
        ${validatedData.userEmail || null},
        ${validatedData.completedAt ? new Date(validatedData.completedAt) : new Date()},
        ${validatedData.timeSpent || null},
        ${JSON.stringify(validatedData.metadata || {})},
        NOW()
      )
    `

    console.log('[Survey Completed]', {
      surveyId: validatedData.surveyId,
      responseCount: Object.keys(validatedData.responses).length,
      timeSpent: validatedData.timeSpent,
      hasEmail: !!validatedData.userEmail
    })

    return NextResponse.json({
      success: true,
      message: 'Survey response recorded successfully',
      data: {
        id: Date.now().toString(),
        completedSurveys: await getUserSurveyCount(validatedData.userId)
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors, 'Validation failed')
    }
    throw error
  }
}

async function handleInterviewRequest(data: any) {
  try {
    const validatedData = interviewRequestSchema.parse(data)
    
    // Create interview request record
    const request = await prisma.$executeRaw`
      INSERT INTO interview_requests (
        interview_type, preferred_dates, preferred_times, timezone,
        contact_email, contact_phone, company, role, experience,
        specific_topics, availability_notes, status, created_at
      ) VALUES (
        ${validatedData.interviewType},
        ${JSON.stringify(validatedData.preferredDates)},
        ${JSON.stringify(validatedData.preferredTimes)},
        ${validatedData.timezone},
        ${validatedData.contactEmail},
        ${validatedData.contactPhone || null},
        ${validatedData.company || null},
        ${validatedData.role || null},
        ${validatedData.experience || null},
        ${validatedData.specificTopics || null},
        ${validatedData.availabilityNotes || null},
        'pending',
        NOW()
      )
    `

    console.log('[Interview Requested]', {
      type: validatedData.interviewType,
      email: validatedData.contactEmail,
      company: validatedData.company,
      preferredDates: validatedData.preferredDates.length
    })

    // In production, this would:
    // 1. Send confirmation email to requestor
    // 2. Notify research team via Slack
    // 3. Create calendar invites for preferred slots
    // 4. Send calendar booking link

    return NextResponse.json({
      success: true,
      message: 'Interview request submitted successfully',
      data: {
        id: Date.now().toString(),
        status: 'pending',
        nextSteps: [
          'We will review your request within 24 hours',
          'You will receive a calendar booking link via email',
          'Confirmation call 1 day before scheduled interview'
        ],
        incentive: getInterviewIncentive(validatedData.interviewType)
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors, 'Validation failed')
    }
    throw error
  }
}

// Helper functions
function getResponseTime(type: string, priority?: string): string {
  if (type === 'bug_report' && priority === 'critical') return '< 2 hours'
  if (type === 'bug_report' && priority === 'high') return '< 24 hours'
  if (type === 'feature_request') return '3-5 business days'
  return '1-3 business days'
}

function getInterviewIncentive(type: string): string {
  const incentives = {
    'user_interview': '$50 Amazon gift card',
    'feature_feedback': 'Early access to new features',
    'industry_expert': '$100 Amazon gift card'
  }
  return incentives[type as keyof typeof incentives] || 'Thank you gift'
}

async function getUserSurveyCount(userId?: string): Promise<number> {
  if (!userId) return 1
  
  try {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM survey_responses WHERE user_id = ${userId}
    ` as any[]
    
    return parseInt(result[0]?.count || '1')
  } catch (error) {
    return 1
  }
}

// GET endpoint for feedback statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'stats') {
      // Get feedback statistics
      const stats = await prisma.$queryRaw`
        SELECT 
          type,
          COUNT(*) as count,
          AVG(CASE WHEN status = 'resolved' THEN 1.0 ELSE 0.0 END) as resolution_rate
        FROM customer_feedback 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY type
      `

      const surveyStats = await prisma.$queryRaw`
        SELECT 
          survey_id,
          survey_title,
          COUNT(*) as responses,
          AVG(time_spent) as avg_completion_time
        FROM survey_responses 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY survey_id, survey_title
      `

      return NextResponse.json({
        success: true,
        data: {
          feedback: stats,
          surveys: surveyStats,
          period: 'last_30_days'
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid request type'
    }, { status: 400 })

  } catch (error) {
    console.error('[Feedback Stats Error]', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics'
    }, { status: 500 })
  }
}