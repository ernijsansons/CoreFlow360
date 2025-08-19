'use client'

import { useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { CustomerLocation } from '@/types/mapping'

interface GoogleMapsComponentProps {
  locations: CustomerLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onLocationClick?: (location: CustomerLocation) => void
  className?: string
  apiKey: string
  mapId?: string // For advanced styling
  features?: {
    traffic?: boolean
    transit?: boolean
    satellite?: boolean
    streetView?: boolean
    directions?: boolean
  }
}

export default function GoogleMapsComponent({
  locations,
  center = { lat: 39.8283, lng: -98.5795 }, // Geographic center of USA
  zoom = 4,
  height = '400px',
  onLocationClick,
  className = '',
  apiKey,
  mapId,
  features = {},
}: GoogleMapsComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is required')
      return
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      mapIds: mapId ? [mapId] : undefined,
    })

    loader
      .load()
      .then(() => {
        setIsLoaded(true)
      })
      .catch((err) => {
        setError('Failed to load Google Maps')
      })
  }, [apiKey, mapId])

  useEffect(() => {
    if (!isLoaded || !window.google) return

    const mapElement = document.getElementById('google-map')
    if (!mapElement) return

    // Calculate center if we have locations
    const mapCenter =
      locations.length > 0 ? { lat: locations[0].latitude, lng: locations[0].longitude } : center

    const mapZoom = locations.length > 1 ? 6 : zoom

    const mapOptions: google.maps.MapOptions = {
      center: mapCenter,
      zoom: mapZoom,
      mapId: mapId,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: features.streetView !== false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    }

    const newMap = new google.maps.Map(mapElement, mapOptions)

    // Add traffic layer if enabled
    if (features.traffic) {
      const trafficLayer = new google.maps.TrafficLayer()
      trafficLayer.setMap(newMap)
    }

    // Add transit layer if enabled
    if (features.transit) {
      const transitLayer = new google.maps.TransitLayer()
      transitLayer.setMap(newMap)
    }

    setMap(newMap)

    return () => {
      // Cleanup markers
      markers.forEach((marker) => marker.setMap(null))
      setMarkers([])
    }
  }, [isLoaded, locations, center, zoom, features])

  useEffect(() => {
    if (!map || !window.google) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    const newMarkers = locations.map((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        title: location.customer?.name || 'Customer Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getLocationColor(location.locationType),
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      })

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(location),
      })

      marker.addListener('click', () => {
        // Close other info windows
        markers.forEach((m) => {
          const iw = (m as unknown).infoWindow
          if (iw) iw.close()
        })

        infoWindow.open(map, marker)

        if (onLocationClick) {
          onLocationClick(location)
        }
      })

      // Store info window reference
      ;(marker as unknown).infoWindow = infoWindow

      return marker
    })

    setMarkers(newMarkers)

    // Adjust map bounds if we have multiple locations
    if (locations.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      locations.forEach((location) => {
        bounds.extend({ lat: location.latitude, lng: location.longitude })
      })
      map.fitBounds(bounds)
    }
  }, [map, locations, onLocationClick])

  const getLocationColor = (type: string): string => {
    switch (type) {
      case 'primary':
        return '#3b82f6'
      case 'billing':
        return '#10b981'
      case 'shipping':
        return '#f59e0b'
      case 'service':
        return '#8b5cf6'
      default:
        return '#6b7280'
    }
  }

  const createInfoWindowContent = (location: CustomerLocation): string => {
    return `
      <div style="min-width: 200px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #111827;">
          ${location.customer?.name || 'Customer'}
        </h3>
        <div style="font-size: 14px; color: #6b7280; line-height: 1.4;">
          <p style="margin: 0 0 4px 0;">${location.address}</p>
          <p style="margin: 0 0 8px 0;">${location.city}, ${location.state} ${location.zipCode}</p>
          ${location.territory ? `<p style="margin: 0 0 4px 0;"><strong>Territory:</strong> ${location.territory}</p>` : ''}
          ${location.salesRep ? `<p style="margin: 0 0 4px 0;"><strong>Sales Rep:</strong> ${location.salesRep}</p>` : ''}
          <p style="margin: 8px 0 0 0;">
            <span style="display: inline-block; padding: 2px 8px; font-size: 12px; border-radius: 12px; background-color: ${getLocationColor(location.locationType)}20; color: ${getLocationColor(location.locationType)};">
              ${location.locationType.charAt(0).toUpperCase() + location.locationType.slice(1)}
            </span>
          </p>
        </div>
      </div>
    `
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-red-200 bg-red-50 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="font-medium text-red-600">Google Maps Error</div>
          <div className="mt-1 text-sm text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">Loading Google Maps...</div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-gray-200 ${className}`}
      style={{ height }}
    >
      <div id="google-map" style={{ height: '100%', width: '100%' }} />

      {/* Premium Badge */}
      <div className="absolute right-2 bottom-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
        Premium Google Maps
      </div>

      {/* Layer Controls */}
      {(features.traffic || features.transit) && (
        <div className="absolute top-2 right-2 space-y-1 rounded-lg bg-white/90 p-2 shadow-lg backdrop-blur-sm">
          {features.traffic && <div className="text-xs text-gray-600">Traffic Layer Active</div>}
          {features.transit && <div className="text-xs text-gray-600">Transit Layer Active</div>}
        </div>
      )}
    </div>
  )
}
