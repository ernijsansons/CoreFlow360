/**
 * CoreFlow360 - Calendar Booking Integration
 * Google Calendar integration for AI-powered appointment booking
 */

import { google } from 'googleapis'
import { db } from '@/lib/db'

interface BookingRequest {
  serviceType: string
  urgency: string
  preferredTime: string
  customerInfo: {
    name: string
    phone: string
    email?: string
    id: string
  }
  duration?: number
  notes?: string
}

interface AvailableSlot {
  date: string
  time: string
  endTime: string
  calendarEventId?: string
}

interface BookingResult {
  success: boolean
  appointment?: {
    id: string
    date: string
    time: string
    duration: number
    confirmationNumber: string
  }
  error?: string
}

/**
 * Google Calendar appointment booking system
 */
export class AppointmentBooker {
  private calendar: any
  private isInitialized = false

  constructor() {
    this.initializeCalendar()
  }

  /**
   * Initialize Google Calendar API
   */
  private async initializeCalendar() {
    try {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      )

      // Set credentials (in production, use proper OAuth flow)
      auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        access_token: process.env.GOOGLE_ACCESS_TOKEN
      })

      this.calendar = google.calendar({ version: 'v3', auth })
      this.isInitialized = true
      
      console.log('✅ Google Calendar API initialized')

    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar:', error)
      this.isInitialized = false
    }
  }

  /**
   * Find available appointment slot based on preferences
   */
  async findAvailableSlot(request: BookingRequest): Promise<AvailableSlot | null> {
    if (!this.isInitialized) {
      await this.initializeCalendar()
    }

    if (!this.isInitialized) {
      throw new Error('Calendar service not available')
    }

    try {
      const duration = this.getServiceDuration(request.serviceType)
      const timeSlots = this.generateTimeSlots(request.urgency, request.preferredTime)
      
      // Check availability for each time slot
      for (const slot of timeSlots) {
        const isAvailable = await this.checkSlotAvailability(slot, duration)
        
        if (isAvailable) {
          return {
            date: slot.date,
            time: slot.time,
            endTime: this.calculateEndTime(slot.time, duration)
          }
        }
      }

      return null

    } catch (error) {
      console.error('Error finding available slot:', error)
      return null
    }
  }

  /**
   * Book appointment in calendar
   */
  async bookAppointment(request: BookingRequest, slot: AvailableSlot): Promise<BookingResult> {
    if (!this.isInitialized) {
      await this.initializeCalendar()
    }

    try {
      const duration = this.getServiceDuration(request.serviceType)
      const startDateTime = this.combineDateTime(slot.date, slot.time)
      const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 1000))

      // Create calendar event
      const event = {
        summary: `${request.serviceType} - ${request.customerInfo.name}`,
        description: this.buildEventDescription(request),
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/New_York'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/New_York'
        },
        attendees: request.customerInfo.email ? [
          { email: request.customerInfo.email }
        ] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day
            { method: 'popup', minutes: 30 }       // 30 minutes
          ]
        }
      }

      const response = await this.calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
        sendUpdates: 'all'
      })

      // Generate confirmation number
      const confirmationNumber = this.generateConfirmationNumber()

      // Store appointment in database
      const appointment = await this.storeAppointment({
        customerId: request.customerInfo.id,
        calendarEventId: response.data.id,
        serviceType: request.serviceType,
        scheduledAt: startDateTime,
        duration: duration,
        confirmationNumber: confirmationNumber,
        status: 'SCHEDULED',
        notes: request.notes
      })

      return {
        success: true,
        appointment: {
          id: appointment.id,
          date: slot.date,
          time: slot.time,
          duration: duration,
          confirmationNumber: confirmationNumber
        }
      }

    } catch (error) {
      console.error('Error booking appointment:', error)
      
      return {
        success: false,
        error: 'Failed to book appointment'
      }
    }
  }

  /**
   * Get service duration based on service type
   */
  private getServiceDuration(serviceType: string): number {
    const durations: Record<string, number> = {
      // HVAC durations (minutes)
      'HVAC Emergency': 120,
      'HVAC Repair': 90,
      'HVAC Maintenance': 60,
      'HVAC Installation': 240,
      
      // Auto repair durations
      'Auto Repair Estimate': 30,
      'Auto Body Repair': 480, // 8 hours
      'Auto Insurance Inspection': 45,
      
      // General business
      'Consultation': 60,
      'Demo': 45,
      'Follow-up Call': 30
    }

    return durations[serviceType] || 60 // Default 1 hour
  }

  /**
   * Generate time slots based on urgency and preferences
   */
  private generateTimeSlots(urgency: string, preferredTime: string): Array<{date: string, time: string}> {
    const slots: Array<{date: string, time: string}> = []
    const now = new Date()

    // Business hours: 8 AM - 6 PM
    const businessHours = {
      start: 8,
      end: 18
    }

    // Determine search window based on urgency
    const daysToSearch = this.getSearchWindow(urgency)
    
    for (let day = 0; day < daysToSearch; day++) {
      const date = new Date(now)
      date.setDate(now.getDate() + day)
      
      // Skip weekends for non-emergency services
      if (urgency !== 'emergency' && (date.getDay() === 0 || date.getDay() === 6)) {
        continue
      }

      // Generate hourly slots within business hours
      const hours = this.getPreferredHours(preferredTime, businessHours)
      
      for (const hour of hours) {
        // Skip past times for today
        if (day === 0 && hour <= now.getHours()) {
          continue
        }

        slots.push({
          date: date.toISOString().split('T')[0], // YYYY-MM-DD
          time: `${hour.toString().padStart(2, '0')}:00`
        })
      }
    }

    return slots
  }

  /**
   * Get search window in days based on urgency
   */
  private getSearchWindow(urgency: string): number {
    const windows: Record<string, number> = {
      'emergency': 1,    // Today only
      'high': 3,         // Next 3 days
      'medium': 7,       // Next week
      'low': 14          // Next 2 weeks
    }

    return windows[urgency] || 7
  }

  /**
   * Get preferred hours based on customer preference
   */
  private getPreferredHours(preferredTime: string, businessHours: {start: number, end: number}): number[] {
    const allHours = Array.from(
      { length: businessHours.end - businessHours.start }, 
      (_, i) => businessHours.start + i
    )

    switch (preferredTime.toLowerCase()) {
      case 'morning':
        return allHours.filter(h => h >= 8 && h < 12)
      case 'afternoon':
        return allHours.filter(h => h >= 12 && h < 17)
      case 'evening':
        return allHours.filter(h => h >= 17 && h < 19)
      default:
        return allHours
    }
  }

  /**
   * Check if time slot is available
   */
  private async checkSlotAvailability(slot: {date: string, time: string}, duration: number): Promise<boolean> {
    try {
      const startDateTime = this.combineDateTime(slot.date, slot.time)
      const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 1000))

      // Check for conflicts in calendar
      const response = await this.calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        singleEvents: true
      })

      // If no events found, slot is available
      return response.data.items.length === 0

    } catch (error) {
      console.error('Error checking slot availability:', error)
      return false
    }
  }

  /**
   * Combine date and time strings into Date object
   */
  private combineDateTime(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    
    return new Date(year, month - 1, day, hour, minute)
  }

  /**
   * Calculate end time
   */
  private calculateEndTime(startTime: string, duration: number): string {
    const [hour, minute] = startTime.split(':').map(Number)
    const startMinutes = hour * 60 + minute
    const endMinutes = startMinutes + duration
    
    const endHour = Math.floor(endMinutes / 60)
    const endMin = endMinutes % 60
    
    return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
  }

  /**
   * Build event description
   */
  private buildEventDescription(request: BookingRequest): string {
    return `
Service: ${request.serviceType}
Customer: ${request.customerInfo.name}
Phone: ${request.customerInfo.phone}
Email: ${request.customerInfo.email || 'Not provided'}
Urgency: ${request.urgency}
Notes: ${request.notes || 'None'}

Booked via CoreFlow360 AI Assistant
`.trim()
  }

  /**
   * Generate confirmation number
   */
  private generateConfirmationNumber(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `CF${timestamp}${random}`.toUpperCase()
  }

  /**
   * Store appointment in database
   */
  private async storeAppointment(data: {
    customerId: string
    calendarEventId: string
    serviceType: string
    scheduledAt: Date
    duration: number
    confirmationNumber: string
    status: string
    notes?: string
  }) {
    try {
      return await db.appointment.create({
        data: {
          customerId: data.customerId,
          calendarEventId: data.calendarEventId,
          serviceType: data.serviceType,
          scheduledAt: data.scheduledAt,
          duration: data.duration,
          confirmationNumber: data.confirmationNumber,
          status: data.status,
          notes: data.notes,
          createdAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error storing appointment:', error)
      throw error
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId }
      })

      if (!appointment) {
        return false
      }

      // Cancel calendar event
      if (appointment.calendarEventId) {
        await this.calendar.events.delete({
          calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
          eventId: appointment.calendarEventId,
          sendUpdates: 'all'
        })
      }

      // Update appointment status
      await db.appointment.update({
        where: { id: appointmentId },
        data: { 
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      })

      return true

    } catch (error) {
      console.error('Error cancelling appointment:', error)
      return false
    }
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(appointmentId: string, newSlot: AvailableSlot): Promise<BookingResult> {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: { customer: true }
      })

      if (!appointment) {
        return { success: false, error: 'Appointment not found' }
      }

      const duration = appointment.duration
      const startDateTime = this.combineDateTime(newSlot.date, newSlot.time)
      const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 1000))

      // Update calendar event
      if (appointment.calendarEventId) {
        await this.calendar.events.patch({
          calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
          eventId: appointment.calendarEventId,
          resource: {
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/New_York'
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/New_York'
            }
          },
          sendUpdates: 'all'
        })
      }

      // Update appointment in database
      await db.appointment.update({
        where: { id: appointmentId },
        data: { 
          scheduledAt: startDateTime,
          updatedAt: new Date()
        }
      })

      return {
        success: true,
        appointment: {
          id: appointmentId,
          date: newSlot.date,
          time: newSlot.time,
          duration: duration,
          confirmationNumber: appointment.confirmationNumber
        }
      }

    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      return { success: false, error: 'Failed to reschedule' }
    }
  }
}

// Export singleton instance
export const appointmentBooker = new AppointmentBooker()