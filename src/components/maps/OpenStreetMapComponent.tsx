'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CustomerLocation } from '@/types/mapping'

// Dynamic import to prevent SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
})
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
})
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

interface OpenStreetMapComponentProps {
  locations: CustomerLocation[]
  center?: [number, number]
  zoom?: number
  height?: string
  onLocationClick?: (location: CustomerLocation) => void
  className?: string
}


export default function OpenStreetMapComponent({
  locations,
  center = [39.8283, -98.5795], // Geographic center of USA
  zoom = 4,
  height = '400px',
  onLocationClick,
  className = '',
}: OpenStreetMapComponentProps) {
  const [isClient, setIsClient] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Load Leaflet CSS
    const loadLeafletCSS = () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
      setLeafletLoaded(true)
    }

    if (typeof window !== 'undefined') {
      loadLeafletCSS()
    }
  }, [])

  // Don't render map on server side or before Leaflet is loaded
  if (!isClient || !leafletLoaded) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  // Calculate map bounds if we have locations
  const mapCenter =
    locations.length > 0
      ? ([locations[0].latitude, locations[0].longitude] as [number, number])
      : center

  const mapZoom = locations.length > 1 ? 6 : zoom

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-gray-200 ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => {
          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              eventHandlers={{
                click: () => {
                  if (onLocationClick) {
                    onLocationClick(location)
                  }
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {location.customer?.name || 'Customer'}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{location.address}</p>
                    <p>
                      {location.city}, {location.state} {location.zipCode}
                    </p>
                    {location.territory && (
                      <p>
                        <span className="font-medium">Territory:</span> {location.territory}
                      </p>
                    )}
                    {location.salesRep && (
                      <p>
                        <span className="font-medium">Sales Rep:</span> {location.salesRep}
                      </p>
                    )}
                    <p>
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          location.locationType === 'primary'
                            ? 'bg-blue-100 text-blue-800'
                            : location.locationType === 'billing'
                              ? 'bg-green-100 text-green-800'
                              : location.locationType === 'shipping'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {location.locationType.charAt(0).toUpperCase() +
                          location.locationType.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Map Attribution */}
      <div className="absolute right-2 bottom-2 rounded bg-white/90 px-2 py-1 text-xs text-gray-600 backdrop-blur-sm">
        Free OpenStreetMap
      </div>
    </div>
  )
}
