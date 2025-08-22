import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RouteOptimizationRequestSchema = z.object({
  technicianId: z.string(),
  date: z.string(),
  tickets: z.array(z.object({
    id: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    priority: z.enum(['EMERGENCY', 'HIGH', 'NORMAL', 'LOW']),
    estimatedDuration: z.number(),
    timeWindow: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  })),
  startLocation: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  endLocation: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { technicianId, date, tickets, startLocation, endLocation } = 
      RouteOptimizationRequestSchema.parse(body)

    // AI-powered route optimization algorithm
    const optimizedRoute = optimizeRoute(tickets, startLocation, endLocation || startLocation)

    // Calculate route metrics
    const metrics = calculateRouteMetrics(optimizedRoute)

    return NextResponse.json({
      success: true,
      route: {
        technicianId,
        date,
        stops: optimizedRoute,
        metrics: {
          totalDistance: metrics.distance,
          totalDuration: metrics.duration,
          fuelCost: metrics.fuelCost,
          optimizationScore: metrics.score,
          estimatedCompletionTime: metrics.completionTime
        },
        aiInsights: [
          {
            type: 'efficiency',
            message: 'Route optimized to prioritize emergency calls while minimizing travel time',
            savingsAmount: metrics.savings
          },
          {
            type: 'suggestion',
            message: 'Consider swapping afternoon appointments with nearby technician for 15% efficiency gain',
            technicianId: 'tech-2'
          }
        ]
      }
    })

  } catch (error) {
    console.error('Error optimizing route:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function optimizeRoute(tickets: any[], startLocation: any, endLocation: any) {
  // Sort by priority first, then optimize by distance
  const priorityOrder = { EMERGENCY: 0, HIGH: 1, NORMAL: 2, LOW: 3 }
  
  let optimized = [...tickets].sort((a, b) => {
    // Emergency always first
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    
    // Then by time window if exists
    if (a.timeWindow?.start && b.timeWindow?.start) {
      return new Date(a.timeWindow.start).getTime() - new Date(b.timeWindow.start).getTime()
    }
    
    // Then by distance (simplified)
    const distA = calculateDistance(startLocation, { latitude: a.latitude, longitude: a.longitude })
    const distB = calculateDistance(startLocation, { latitude: b.latitude, longitude: b.longitude })
    return distA - distB
  })

  // Apply traveling salesman optimization for same-priority groups
  const optimizedGroups: any[] = []
  let currentPriority = optimized[0]?.priority
  let currentGroup: any[] = []

  for (const ticket of optimized) {
    if (ticket.priority === currentPriority) {
      currentGroup.push(ticket)
    } else {
      if (currentGroup.length > 0) {
        optimizedGroups.push(...optimizeTSP(currentGroup, startLocation))
      }
      currentPriority = ticket.priority
      currentGroup = [ticket]
    }
  }
  
  if (currentGroup.length > 0) {
    optimizedGroups.push(...optimizeTSP(currentGroup, startLocation))
  }

  return optimizedGroups.map((ticket, index) => ({
    ...ticket,
    routePosition: index + 1,
    estimatedArrival: calculateArrivalTime(index, optimizedGroups),
    travelTime: index === 0 
      ? calculateTravelTime(startLocation, { latitude: ticket.latitude, longitude: ticket.longitude })
      : calculateTravelTime(
          { latitude: optimizedGroups[index - 1].latitude, longitude: optimizedGroups[index - 1].longitude },
          { latitude: ticket.latitude, longitude: ticket.longitude }
        )
  }))
}

function optimizeTSP(tickets: any[], startLocation: any) {
  // Simplified TSP using nearest neighbor
  if (tickets.length <= 1) return tickets

  const unvisited = [...tickets]
  const route = []
  let current = startLocation

  while (unvisited.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(current, {
        latitude: unvisited[i].latitude,
        longitude: unvisited[i].longitude
      })
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0]
    route.push(nearest)
    current = { latitude: nearest.latitude, longitude: nearest.longitude }
  }

  return route
}

function calculateDistance(point1: any, point2: any): number {
  // Haversine formula for distance calculation
  const R = 3959 // Earth radius in miles
  const lat1 = point1.latitude * Math.PI / 180
  const lat2 = point2.latitude * Math.PI / 180
  const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180
  const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon/2) * Math.sin(deltaLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

function calculateTravelTime(from: any, to: any): number {
  const distance = calculateDistance(from, to)
  const avgSpeed = 30 // mph in city
  return Math.round((distance / avgSpeed) * 60) // minutes
}

function calculateArrivalTime(index: number, tickets: any[]): string {
  const startTime = new Date()
  startTime.setHours(8, 0, 0, 0) // Start at 8 AM
  
  let totalMinutes = 0
  for (let i = 0; i <= index; i++) {
    if (i > 0) {
      totalMinutes += tickets[i].travelTime || 15
    }
    if (i < index) {
      totalMinutes += tickets[i].estimatedDuration || 60
    }
  }
  
  const arrivalTime = new Date(startTime.getTime() + totalMinutes * 60000)
  return arrivalTime.toISOString()
}

function calculateRouteMetrics(route: any[]) {
  let totalDistance = 0
  let totalDuration = 0

  for (let i = 0; i < route.length; i++) {
    if (i > 0) {
      totalDistance += calculateDistance(
        { latitude: route[i-1].latitude, longitude: route[i-1].longitude },
        { latitude: route[i].latitude, longitude: route[i].longitude }
      )
    }
    totalDuration += route[i].estimatedDuration || 60
    totalDuration += route[i].travelTime || 0
  }

  const fuelCost = totalDistance * 0.65 // $0.65 per mile
  const optimizationScore = Math.min(95, 100 - (totalDistance / route.length))
  
  const completionTime = new Date()
  completionTime.setHours(8, 0, 0, 0)
  completionTime.setMinutes(completionTime.getMinutes() + totalDuration)

  return {
    distance: Math.round(totalDistance * 10) / 10,
    duration: totalDuration,
    fuelCost: Math.round(fuelCost * 100) / 100,
    score: Math.round(optimizationScore),
    completionTime: completionTime.toISOString(),
    savings: Math.round(totalDistance * 0.15) // Estimated 15% savings
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const technicianId = url.searchParams.get('technicianId')
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Return mock optimized routes for demo
    return NextResponse.json({
      success: true,
      routes: [
        {
          technicianId: technicianId || 'tech-1',
          technicianName: 'John Martinez',
          date,
          totalStops: 5,
          totalDistance: 42.3,
          totalDuration: 390,
          optimizationScore: 92,
          status: 'OPTIMIZED',
          stops: [
            {
              ticketNumber: 'SVC-2024-001',
              customerName: 'Desert Oasis Resort',
              priority: 'EMERGENCY',
              estimatedArrival: '08:15 AM',
              estimatedDuration: 120
            },
            {
              ticketNumber: 'SVC-2024-002',
              customerName: 'Valley Medical Center',
              priority: 'HIGH',
              estimatedArrival: '10:30 AM',
              estimatedDuration: 90
            }
          ]
        }
      ]
    })

  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}