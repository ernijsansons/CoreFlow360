/**
 * CoreFlow360 - IoT Monitoring Widget
 * Real-time IoT device and sensor monitoring
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ThermometerSun,
  Droplets,
  Wind,
  Zap,
  AlertTriangle,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/auth'

interface IoTDevice {
  id: string
  name: string
  type: 'hvac' | 'sensor' | 'meter' | 'equipment'
  status: 'online' | 'offline' | 'warning'
  metrics: {
    label: string
    value: number
    unit: string
    trend?: 'up' | 'down' | 'stable'
    threshold?: { min?: number; max?: number }
  }[]
  location?: string
  lastUpdate: Date
}

interface IoTMonitoringWidgetProps {
  onRemove: () => void
  layout: 'grid' | 'list' | 'kanban'
}

export function IoTMonitoringWidget({ onRemove, layout }: IoTMonitoringWidgetProps) {
  const { user } = useAuth()
  const [devices, setDevices] = useState<IoTDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    loadDevices()
    // Set up real-time updates
    const interval = setInterval(updateDeviceMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadDevices = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockDevices: IoTDevice[] = [
      {
        id: 'hvac-01',
        name: 'Main Floor HVAC',
        type: 'hvac',
        status: 'online',
        location: 'Building A - Floor 1',
        metrics: [
          {
            label: 'Temperature',
            value: 72,
            unit: '°F',
            trend: 'stable',
            threshold: { min: 68, max: 76 },
          },
          { label: 'Humidity', value: 45, unit: '%', trend: 'up', threshold: { min: 30, max: 60 } },
          { label: 'Power', value: 3.2, unit: 'kW', trend: 'down' },
        ],
        lastUpdate: new Date(),
      },
      {
        id: 'sensor-01',
        name: 'Server Room Monitor',
        type: 'sensor',
        status: 'warning',
        location: 'Data Center',
        metrics: [
          {
            label: 'Temperature',
            value: 78,
            unit: '°F',
            trend: 'up',
            threshold: { min: 60, max: 75 },
          },
          {
            label: 'Humidity',
            value: 55,
            unit: '%',
            trend: 'stable',
            threshold: { min: 40, max: 60 },
          },
        ],
        lastUpdate: new Date(),
      },
      {
        id: 'meter-01',
        name: 'Main Power Meter',
        type: 'meter',
        status: 'online',
        location: 'Electrical Room',
        metrics: [
          { label: 'Current Usage', value: 45.7, unit: 'kW', trend: 'up' },
          { label: 'Daily Total', value: 892, unit: 'kWh' },
          { label: 'Peak Load', value: 62.3, unit: 'kW' },
        ],
        lastUpdate: new Date(),
      },
    ]

    // Add more devices for facility managers
    if (user?.role === UserRole.DEPARTMENT_MANAGER || user?.role === UserRole.ORG_ADMIN) {
      mockDevices.push({
        id: 'equipment-01',
        name: 'Production Line 1',
        type: 'equipment',
        status: 'online',
        location: 'Manufacturing Floor',
        metrics: [
          { label: 'Efficiency', value: 94, unit: '%', trend: 'up', threshold: { min: 85 } },
          { label: 'Units/Hour', value: 120, unit: 'units', trend: 'stable' },
          { label: 'Vibration', value: 0.8, unit: 'mm/s', threshold: { max: 1.5 } },
        ],
        lastUpdate: new Date(),
      })
    }

    setDevices(mockDevices)
    updateAlertCount(mockDevices)
    setLoading(false)
  }

  const updateDeviceMetrics = () => {
    setDevices((prevDevices) =>
      prevDevices.map((device) => ({
        ...device,
        metrics: device.metrics.map((metric) => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * 2,
          trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : metric.trend,
        })),
        lastUpdate: new Date(),
      }))
    )
  }

  const updateAlertCount = (devices: IoTDevice[]) => {
    const alerts = devices.reduce((count, device) => {
      const hasAlert =
        device.status === 'warning' ||
        device.metrics.some((metric) => {
          if (metric.threshold) {
            return (
              (metric.threshold.min && metric.value < metric.threshold.min) ||
              (metric.threshold.max && metric.value > metric.threshold.max)
            )
          }
          return false
        })
      return count + (hasAlert ? 1 : 0)
    }, 0)
    setAlertCount(alerts)
  }

  const getDeviceIcon = (type: IoTDevice['type']) => {
    switch (type) {
      case 'hvac':
        return ThermometerSun
      case 'sensor':
        return Activity
      case 'meter':
        return Zap
      case 'equipment':
        return Activity
    }
  }

  const getStatusColor = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50'
      case 'offline':
        return 'text-gray-600 bg-gray-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const checkThreshold = (metric: IoTDevice['metrics'][0]) => {
    if (!metric.threshold) return 'normal'
    if (metric.threshold.min && metric.value < metric.threshold.min) return 'low'
    if (metric.threshold.max && metric.value > metric.threshold.max) return 'high'
    return 'normal'
  }

  const containerClass =
    layout === 'list'
      ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
      : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">IoT Monitoring</h3>
          {alertCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">
              {alertCount} alert{alertCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="flex animate-pulse items-center space-x-2">
            <Activity className="h-6 w-6 text-blue-400" />
            <span className="text-gray-500">Connecting to devices...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type)
            const statusClass = getStatusColor(device.status)
            const hasAlert = device.metrics.some((m) => checkThreshold(m) !== 'normal')

            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-3 ${
                  hasAlert ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                } cursor-pointer transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-700`}
                onClick={() => setSelectedDevice(device)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`rounded-lg p-2 ${statusClass}`}>
                      <DeviceIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{device.location}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {device.metrics.slice(0, 2).map((metric, idx) => {
                          const status = checkThreshold(metric)
                          return (
                            <div key={idx} className="flex items-center space-x-1">
                              <span className="text-xs text-gray-600 dark:text-gray-300">
                                {metric.label}:
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  status === 'high'
                                    ? 'text-red-600'
                                    : status === 'low'
                                      ? 'text-blue-600'
                                      : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {metric.value.toFixed(1)}
                                {metric.unit}
                              </span>
                              {metric.trend === 'up' && (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              )}
                              {metric.trend === 'down' && (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center space-x-1 text-xs ${
                        device.status === 'online'
                          ? 'text-green-600'
                          : device.status === 'warning'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {device.status === 'online' && <CheckCircle className="h-3 w-3" />}
                      {device.status === 'warning' && <AlertTriangle className="h-3 w-3" />}
                      <span>{device.status}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Device detail modal */}
      {selectedDevice && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="m-4 w-full max-w-lg rounded-lg bg-white p-6 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedDevice.name}
              </h3>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Location</span>
                <span className="text-gray-900 dark:text-white">{selectedDevice.location}</span>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Real-time Metrics</h4>
                {selectedDevice.metrics.map((metric, idx) => {
                  const status = checkThreshold(metric)
                  return (
                    <div key={idx} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {metric.label}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-lg font-semibold ${
                              status === 'high'
                                ? 'text-red-600'
                                : status === 'low'
                                  ? 'text-blue-600'
                                  : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {metric.value.toFixed(1)}
                            {metric.unit}
                          </span>
                          {metric.trend === 'up' && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {metric.trend === 'down' && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      {metric.threshold && (
                        <div className="text-xs text-gray-500">
                          Range: {metric.threshold.min || '-'}–{metric.threshold.max || '-'}
                          {metric.unit}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {selectedDevice.lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
