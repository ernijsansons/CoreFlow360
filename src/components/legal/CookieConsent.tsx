'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    savePreferences(allAccepted)
  }

  const acceptSelected = () => {
    savePreferences(preferences)
  }

  const rejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    savePreferences(essentialOnly)
  }

  const savePreferences = (prefs: typeof preferences) => {
    // Save to localStorage
    localStorage.setItem('cookie_consent', JSON.stringify({
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }))

    // Set cookie for server-side access
    document.cookie = `cookie_consent=${JSON.stringify(prefs)}; path=/; max-age=31536000; SameSite=Lax`

    // Apply preferences (enable/disable analytics, etc.)
    applyPreferences(prefs)

    // Hide banner
    setShowBanner(false)
    setShowDetails(false)
  }

  const applyPreferences = (prefs: typeof preferences) => {
    // Google Analytics
    if (prefs.analytics && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      })
    } else if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      })
    }

    // Marketing cookies
    if (prefs.marketing && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      })
    } else if (window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    }

    // Trigger custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: prefs,
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                🍪 We use cookies
              </h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                By continuing to use our site, you consent to our use of cookies.{' '}
                <Link href="/cookies" className="text-blue-600 hover:underline">
                  Learn more
                </Link>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Customize
              </button>
              <button
                onClick={rejectNonEssential}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>

          {/* Detailed Preferences */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Customize Cookie Preferences
              </h4>
              
              <div className="space-y-3">
                {/* Essential Cookies */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="essential"
                    checked={preferences.essential}
                    disabled
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-not-allowed opacity-50"
                  />
                  <label htmlFor="essential" className="ml-2 flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Essential Cookies (Required)
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Necessary for the website to function. Cannot be disabled.
                    </p>
                  </label>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="functional"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="functional" className="ml-2 flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Functional Cookies
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Remember your preferences and personalization choices.
                    </p>
                  </label>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="analytics"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="analytics" className="ml-2 flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Analytics Cookies
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Help us understand how you use our platform to improve it.
                    </p>
                  </label>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="marketing" className="ml-2 flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Marketing Cookies
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Used to show relevant advertisements and measure campaign effectiveness.
                    </p>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={acceptSelected}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setShowDetails(false)}
        />
      )}
    </>
  )
}

// Type declarations for window object
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    va?: (...args: unknown[]) => void
  }
}