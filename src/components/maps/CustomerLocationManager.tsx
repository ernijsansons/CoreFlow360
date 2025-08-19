'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import OpenStreetMapComponent from './OpenStreetMapComponent'
import { CustomerLocation } from '@/types/mapping'

interface CustomerLocationManagerProps {
  customerId?: string
  onLocationSelect?: (location: CustomerLocation) => void
  showMap?: boolean
  className?: string
}

export default function CustomerLocationManager({
  customerId,
  onLocationSelect,
  showMap = true,
  className = '',
}: CustomerLocationManagerProps) {
  const [locations, setLocations] = useState<CustomerLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<CustomerLocation | null>(null)
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomerLocations()
  }, [customerId])

  const loadCustomerLocations = async () => {
    try {
      setLoading(true)

      // Mock data for demonstration
      const mockLocations: CustomerLocation[] = [
        {
          id: '1',
          customerId: customerId || '1',
          customer: {
            id: customerId || '1',
            name: 'Acme Corporation',
            email: 'contact@acmecorp.com',
            phone: '+1 (555) 123-4567',
          },
          address: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          latitude: 40.7589,
          longitude: -73.9851,
          locationType: 'primary',
          isVerified: true,
          lastVerifiedAt: '2024-08-09T10:00:00Z',
          territory: 'Northeast',
          salesRep: 'Alex Morgan',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-08-09T10:00:00Z',
        },
        {
          id: '2',
          customerId: customerId || '1',
          customer: {
            id: customerId || '1',
            name: 'Acme Corporation',
            email: 'billing@acmecorp.com',
          },
          address: '456 Finance St',
          city: 'Albany',
          state: 'NY',
          zipCode: '12203',
          country: 'US',
          latitude: 42.6803,
          longitude: -73.837,
          locationType: 'billing',
          isVerified: false,
          territory: 'Northeast',
          salesRep: 'Alex Morgan',
          createdAt: '2024-02-01T14:20:00Z',
          updatedAt: '2024-08-09T10:00:00Z',
        },
        {
          id: '3',
          customerId: customerId || '2',
          customer: {
            id: '2',
            name: 'TechStart Inc',
            email: 'info@techstart.io',
          },
          address: '789 Innovation Blvd',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'US',
          latitude: 37.7749,
          longitude: -122.4194,
          locationType: 'primary',
          isVerified: true,
          lastVerifiedAt: '2024-08-08T15:30:00Z',
          territory: 'West Coast',
          salesRep: 'Jordan Lee',
          createdAt: '2024-03-10T09:15:00Z',
          updatedAt: '2024-08-08T15:30:00Z',
        },
      ]

      // Filter by customerId if provided
      const filteredLocations = customerId
        ? mockLocations.filter((loc) => loc.customerId === customerId)
        : mockLocations

      setLocations(filteredLocations)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.territory?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || location.locationType === filterType

    return matchesSearch && matchesType
  })

  const handleLocationClick = (location: CustomerLocation) => {
    setSelectedLocation(location)
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'primary':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'billing':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'shipping':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'service':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center text-xl font-semibold text-gray-900">
            <MapPinIcon className="mr-2 h-6 w-6 text-blue-600" />
            Customer Locations
          </h2>
          <p className="mt-1 text-gray-600">Manage customer addresses and territories</p>
        </div>
        <button
          onClick={() => setIsAddingLocation(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Location
        </button>
      </div>

      {/* Map */}
      {showMap && (
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900">Location Map</h3>
            <p className="mt-1 text-sm text-gray-600">
              Showing {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="p-4">
            <OpenStreetMapComponent
              locations={filteredLocations}
              onLocationClick={handleLocationClick}
              height="400px"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Search locations..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="primary">Primary</option>
              <option value="billing">Billing</option>
              <option value="shipping">Shipping</option>
              <option value="service">Service</option>
            </select>

            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <FunnelIcon className="mr-2 h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Location List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          {filteredLocations.length === 0 ? (
            <div className="py-12 text-center">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first location.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLocations.map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`cursor-pointer rounded-lg border bg-gray-50 p-4 transition-colors hover:bg-gray-100 ${
                    selectedLocation?.id === location.id
                      ? 'border-blue-500 ring-2 ring-blue-500'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <MapPinIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {location.customer?.name || 'Unknown Customer'}
                          </h4>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getLocationTypeColor(location.locationType)}`}
                          >
                            {location.locationType.charAt(0).toUpperCase() +
                              location.locationType.slice(1)}
                          </span>
                          <div className="flex items-center">
                            {location.isVerified ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-500" />
                            )}
                            <span className="ml-1 text-xs text-gray-500">
                              {location.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{location.address}</p>
                          <p>
                            {location.city}, {location.state} {location.zipCode}
                          </p>
                          <div className="flex items-center space-x-4">
                            {location.territory && (
                              <span>
                                <strong>Territory:</strong> {location.territory}
                              </span>
                            )}
                            {location.salesRep && (
                              <span>
                                <strong>Sales Rep:</strong> {location.salesRep}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-blue-600" title="Edit Location">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600" title="Delete Location">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
