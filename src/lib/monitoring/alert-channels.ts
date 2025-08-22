/**
 * CoreFlow360 - Alert Channels System
 * Multiple notification channels for monitoring alerts
 */

export interface AlertChannel {
  id: string
  name: string
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'
  enabled: boolean
  config: Record<string, any>
  severityFilter: ('low' | 'medium' | 'high' | 'critical')[]
}

export interface AlertMessage {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: string
  metadata: Record<string, any>
}

export class AlertChannelManager {
  private channels: AlertChannel[] = []

  constructor() {
    this.initializeDefaultChannels()
  }

  private initializeDefaultChannels() {
    // Email channel
    if (process.env.SMTP_HOST) {
      this.addChannel({
        id: 'email-default',
        name: 'Email Notifications',
        type: 'email',
        enabled: true,
        config: {
          to: process.env.ALERT_EMAIL || 'admin@coreflow360.com',
          smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          }
        },
        severityFilter: ['high', 'critical']
      })
    }

    // Slack channel
    if (process.env.SLACK_WEBHOOK_URL) {
      this.addChannel({
        id: 'slack-default',
        name: 'Slack Notifications',
        type: 'slack',
        enabled: true,
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_CHANNEL || '#alerts',
          username: 'CoreFlow360 Monitor'
        },
        severityFilter: ['medium', 'high', 'critical']
      })
    }

    // Generic webhook
    if (process.env.MONITORING_WEBHOOK_URL) {
      this.addChannel({
        id: 'webhook-default',
        name: 'Generic Webhook',
        type: 'webhook',
        enabled: true,
        config: {
          url: process.env.MONITORING_WEBHOOK_URL,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.WEBHOOK_AUTH_HEADER
          }
        },
        severityFilter: ['high', 'critical']
      })
    }
  }

  addChannel(channel: Omit<AlertChannel, 'id'> & { id?: string }) {
    const newChannel: AlertChannel = {
      id: channel.id || `channel_${Date.now()}`,
      ...channel
    }
    this.channels.push(newChannel)
    return newChannel.id
  }

  async sendAlert(alert: AlertMessage) {
    const eligibleChannels = this.channels.filter(
      channel => channel.enabled && channel.severityFilter.includes(alert.severity)
    )

    const results = await Promise.allSettled(
      eligibleChannels.map(channel => this.sendToChannel(channel, alert))
    )

    // Log results
    results.forEach((result, index) => {
      const channel = eligibleChannels[index]
      if (result.status === 'rejected') {
        console.error(`Failed to send alert to ${channel.name}:`, result.reason)
      } else {
        console.log(`✅ Alert sent to ${channel.name}`)
      }
    })

    return {
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      channels: eligibleChannels.length
    }
  }

  private async sendToChannel(channel: AlertChannel, alert: AlertMessage) {
    switch (channel.type) {
      case 'email':
        return this.sendEmailAlert(channel, alert)
      case 'slack':
        return this.sendSlackAlert(channel, alert)
      case 'webhook':
        return this.sendWebhookAlert(channel, alert)
      case 'sms':
        return this.sendSMSAlert(channel, alert)
      case 'pagerduty':
        return this.sendPagerDutyAlert(channel, alert)
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`)
    }
  }

  private async sendEmailAlert(channel: AlertChannel, alert: AlertMessage) {
    // In production, use nodemailer or similar
    const emailBody = `
      🚨 CoreFlow360 Alert: ${alert.title}
      
      Severity: ${alert.severity.toUpperCase()}
      Time: ${alert.timestamp}
      
      Details:
      ${alert.message}
      
      Metadata: ${JSON.stringify(alert.metadata, null, 2)}
      
      --
      CoreFlow360 Monitoring System
    `

    // Simulate email sending
    console.log('📧 Email Alert:', {
      to: channel.config.to,
      subject: `[${alert.severity.toUpperCase()}] CoreFlow360 Alert: ${alert.title}`,
      body: emailBody
    })

    return { success: true, channel: 'email' }
  }

  private async sendSlackAlert(channel: AlertChannel, alert: AlertMessage) {
    const severityColors = {
      low: '#36a64f',      // green
      medium: '#ff9500',   // orange  
      high: '#ff6b6b',     // red
      critical: '#8b0000'  // dark red
    }

    const payload = {
      channel: channel.config.channel,
      username: channel.config.username,
      icon_emoji: ':rotating_light:',
      attachments: [{
        color: severityColors[alert.severity],
        title: `${alert.severity.toUpperCase()} Alert: ${alert.title}`,
        text: alert.message,
        fields: [
          { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
          { title: 'Time', value: alert.timestamp, short: true },
          ...Object.entries(alert.metadata).map(([key, value]) => ({
            title: key.charAt(0).toUpperCase() + key.slice(1),
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            short: true
          }))
        ],
        footer: 'CoreFlow360 Monitoring',
        ts: Math.floor(new Date(alert.timestamp).getTime() / 1000)
      }]
    }

    const response = await fetch(channel.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`)
    }

    return { success: true, channel: 'slack' }
  }

  private async sendWebhookAlert(channel: AlertChannel, alert: AlertMessage) {
    const payload = {
      alert,
      source: 'coreflow360-monitor',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }

    const response = await fetch(channel.config.url, {
      method: 'POST',
      headers: channel.config.headers || { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`)
    }

    return { success: true, channel: 'webhook' }
  }

  private async sendSMSAlert(channel: AlertChannel, alert: AlertMessage) {
    // In production, integrate with Twilio, AWS SNS, etc.
    const message = `CoreFlow360 ${alert.severity.toUpperCase()} Alert: ${alert.title} - ${alert.message}`

    console.log('📱 SMS Alert:', {
      to: channel.config.phoneNumber,
      message: message.substring(0, 160) // SMS length limit
    })

    return { success: true, channel: 'sms' }
  }

  private async sendPagerDutyAlert(channel: AlertChannel, alert: AlertMessage) {
    // PagerDuty Events API v2
    const payload = {
      routing_key: channel.config.integrationKey,
      event_action: 'trigger',
      dedup_key: alert.id,
      payload: {
        summary: `${alert.title} (${alert.severity})`,
        source: 'coreflow360-monitor',
        severity: alert.severity === 'critical' ? 'critical' : 
                 alert.severity === 'high' ? 'error' :
                 alert.severity === 'medium' ? 'warning' : 'info',
        custom_details: alert.metadata
      }
    }

    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`PagerDuty alert failed: ${response.statusText}`)
    }

    return { success: true, channel: 'pagerduty' }
  }

  getChannels(): AlertChannel[] {
    return [...this.channels]
  }

  getChannel(id: string): AlertChannel | undefined {
    return this.channels.find(channel => channel.id === id)
  }

  updateChannel(id: string, updates: Partial<AlertChannel>): boolean {
    const index = this.channels.findIndex(channel => channel.id === id)
    if (index === -1) return false

    this.channels[index] = { ...this.channels[index], ...updates }
    return true
  }

  removeChannel(id: string): boolean {
    const index = this.channels.findIndex(channel => channel.id === id)
    if (index === -1) return false

    this.channels.splice(index, 1)
    return true
  }

  testChannel(id: string): Promise<any> {
    const channel = this.getChannel(id)
    if (!channel) {
      throw new Error(`Channel not found: ${id}`)
    }

    const testAlert: AlertMessage = {
      id: `test_${Date.now()}`,
      severity: 'low',
      title: 'Test Alert',
      message: 'This is a test alert from CoreFlow360 monitoring system',
      timestamp: new Date().toISOString(),
      metadata: {
        test: true,
        channel: channel.name
      }
    }

    return this.sendToChannel(channel, testAlert)
  }
}

// Export singleton instance
export const alertChannelManager = new AlertChannelManager()