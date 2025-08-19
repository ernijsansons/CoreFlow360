/**
 * CoreFlow360 - Automation Page
 * Main entry point for the super easy automation builder
 */

import AutomationClientPage from './client-page'

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

export default function AutomationPage() {
  return <AutomationClientPage />
}
