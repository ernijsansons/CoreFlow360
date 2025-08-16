/**
 * CoreFlow360 - Email Service
 * Email sending functionality for workflows and notifications
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
}

/**
 * Send email using configured email provider
 * In production, this would integrate with SendGrid, AWS SES, or similar
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Log email for development
    console.log('Sending email:', {
      to: options.to,
      subject: options.subject,
      preview: options.html.substring(0, 100) + '...'
    })
    
    // In production, integrate with email service provider
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({
    //   to: options.to,
    //   from: process.env.EMAIL_FROM,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text
    // })
    
    // Simulate email sent
    await new Promise(resolve => setTimeout(resolve, 100))
    
  } catch (error) {
    console.error('Email sending error:', error)
    throw new Error('Failed to send email')
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