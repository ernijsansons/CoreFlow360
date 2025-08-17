/**
 * CoreFlow360 - Production Email Service
 * Email sending functionality for workflows and notifications
 * Supports SendGrid and Resend providers
 */

export interface EmailOptions {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  priority?: 'high' | 'normal' | 'low'
  trackingEnabled?: boolean
}

export interface EmailConfig {
  provider: 'sendgrid' | 'resend' | 'development'
  apiKey?: string
  fromEmail: string
  fromName: string
  trackingEnabled: boolean
}

/**
 * Get email configuration
 */
function getEmailConfig(): EmailConfig {
  const provider = process.env.EMAIL_PROVIDER as 'sendgrid' | 'resend' || 'development'
  
  return {
    provider,
    apiKey: process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY,
    fromEmail: process.env.EMAIL_FROM || 'noreply@coreflow360.com',
    fromName: process.env.EMAIL_FROM_NAME || 'CoreFlow360',
    trackingEnabled: process.env.EMAIL_TRACKING_ENABLED === 'true'
  }
}

/**
 * Send email using configured email provider
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const config = getEmailConfig()
  
  try {
    console.log(`Sending email via ${config.provider}:`, {
      to: options.to,
      subject: options.subject,
      provider: config.provider
    })

    if (config.provider === 'sendgrid') {
      await sendEmailViaSendGrid(options, config)
    } else if (config.provider === 'resend') {
      await sendEmailViaResend(options, config)
    } else {
      // Development mode - log email
      console.log('📧 EMAIL (Development Mode):', {
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        preview: options.html.substring(0, 200) + '...',
        timestamp: new Date().toISOString()
      })
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
  } catch (error) {
    console.error('Email sending error:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

/**
 * Send email via SendGrid
 */
async function sendEmailViaSendGrid(options: EmailOptions, config: EmailConfig): Promise<void> {
  if (!config.apiKey) {
    throw new Error('SendGrid API key not configured')
  }

  try {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(config.apiKey)

  const message = {
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    from: {
      email: config.fromEmail,
      name: config.fromName
    },
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments?.map(att => ({
      filename: att.filename,
      content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
      type: att.contentType || 'application/octet-stream'
    })),
    trackingSettings: {
      clickTracking: {
        enable: config.trackingEnabled && (options.trackingEnabled ?? true)
      },
      openTracking: {
        enable: config.trackingEnabled && (options.trackingEnabled ?? true)
      }
    }
  }

  await sgMail.send(message)
  } catch (error) {
    // If SendGrid module is not installed or other errors occur
    console.error('SendGrid email error:', error)
    throw new Error(`Failed to send email via SendGrid: ${error.message}`)
  }
}

/**
 * Send email via Resend
 */
async function sendEmailViaResend(options: EmailOptions, config: EmailConfig): Promise<void> {
  if (!config.apiKey) {
    throw new Error('Resend API key not configured')
  }

  try {
    const { Resend } = require('resend')
    const resend = new Resend(config.apiKey)

  const message = {
    from: `${config.fromName} <${config.fromEmail}>`,
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments?.map(att => ({
      filename: att.filename,
      content: att.content
    }))
  }

  await resend.emails.send(message)
  } catch (error) {
    // If Resend module is not installed or other errors occur
    console.error('Resend email error:', error)
    throw new Error(`Failed to send email via Resend: ${error.message}`)
  }
}

/**
 * Send templated email
 */
export async function sendTemplatedEmail(
  templateName: string,
  to: string[],
  variables: Record<string, any>
): Promise<void> {
  const template = await getEmailTemplate(templateName)
  const html = replaceTemplateVariables(template.html, variables)
  const subject = replaceTemplateVariables(template.subject, variables)
  
  await sendEmail({
    to,
    subject,
    html
  })
}

/**
 * Get email template
 */
async function getEmailTemplate(name: string): Promise<{ subject: string; html: string }> {
  // In production, fetch from database or template service
  const templates: Record<string, { subject: string; html: string }> = {
    retention_email_template: {
      subject: 'We value your partnership with {{companyName}}',
      html: `
        <h2>Dear {{customerName}},</h2>
        <p>We noticed it's been a while since we connected. Your success is our priority.</p>
        <p>Is there anything we can help you with? We'd love to schedule a call to discuss how we can better support your goals.</p>
        <p>Best regards,<br>Your Success Team</p>
      `
    },
    lead_nurture_template: {
      subject: 'Following up on your interest in {{productName}}',
      html: `
        <h2>Hi {{firstName}},</h2>
        <p>I wanted to follow up on your interest in {{productName}}.</p>
        <p>We've helped companies like yours achieve {{benefit}}. I'd love to show you how.</p>
        <p>Do you have 15 minutes this week for a quick call?</p>
        <p>Best,<br>{{senderName}}</p>
      `
    },
    welcome_template: {
      subject: 'Welcome to {{companyName}}!',
      html: `
        <h2>Welcome {{firstName}}!</h2>
        <p>We're thrilled to have you join {{companyName}}.</p>
        <p>Here's what happens next:</p>
        <ul>
          <li>Your account manager will reach out within 24 hours</li>
          <li>We'll schedule your onboarding session</li>
          <li>You'll receive your login credentials</li>
        </ul>
        <p>If you have any questions, don't hesitate to reach out.</p>
        <p>Best regards,<br>The {{companyName}} Team</p>
      `
    }
  }
  
  const template = templates[name]
  if (!template) {
    throw new Error(`Email template not found: ${name}`)
  }
  
  return template
}

/**
 * Replace template variables
 */
function replaceTemplateVariables(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
}