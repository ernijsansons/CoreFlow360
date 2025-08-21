'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  Bars3Icon,
  XMarkIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  CreditCardIcon,
  CubeIcon as Package,
} from '@heroicons/react/24/outline'
import { IndustryToggle } from '@/components/IndustryToggle'
import PerformanceTicker from '@/components/ui/PerformanceTicker'
import { BusinessSwitcher } from '@/components/business/BusinessSwitcher'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: string
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Leads', href: '/dashboard/leads', icon: UserPlusIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon },
  { name: 'Deals', href: '/dashboard/deals', icon: BriefcaseIcon },
  { name: 'Forecasting', href: '/dashboard/forecasting', icon: TrendingUpIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Workflows', href: '/dashboard/workflows', icon: BoltIcon },
  { name: 'HVAC', href: '/dashboard/hvac', icon: WrenchScrewdriverIcon, badge: 'New' },
  { name: 'SaaS', href: '/dashboard/saas', icon: CreditCardIcon, badge: 'New' },
  { name: 'AI Insights', href: '/dashboard/ai-insights', icon: SparklesIcon },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: Package },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCardIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      {/* Performance Ticker */}
      <PerformanceTicker />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="bg-opacity-75 fixed inset-0 bg-gray-600"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-xl font-bold text-blue-600">CoreFlow360</h1>
              </div>
              
              {/* Business Switcher - Mobile */}
              <div className="px-4 py-3">
                <div className="rounded-lg border-2 border-purple-500 p-2">
                  <BusinessSwitcher showPortfolioOption={true} />
                </div>
              </div>
              
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="space-y-1 px-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center justify-between rounded-md px-2 py-2 text-base font-medium ${
                          isActive
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`mr-4 h-6 w-6 flex-shrink-0 ${
                              isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          />
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
              <div className="border-t border-gray-200 px-4 py-4">
                <IndustryToggle />
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex w-64 flex-col">
            <div className="flex h-0 flex-1 flex-col">
              <div className="flex h-16 flex-shrink-0 items-center border-r border-gray-200 bg-white px-4">
                <h1 className="text-xl font-bold text-blue-600">CoreFlow360</h1>
              </div>
              
              {/* Business Switcher - Prominent Position */}
              <div className="border-r border-gray-200 bg-white px-4 py-3">
                <div className="rounded-lg border-2 border-purple-500 p-2">
                  <BusinessSwitcher showPortfolioOption={true} />
                </div>
              </div>
              
              <div className="flex flex-1 flex-col overflow-y-auto border-r border-gray-200 bg-white">
                <nav className="flex-1 space-y-1 px-2 py-4">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium ${
                          isActive
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`mr-3 h-5 w-5 flex-shrink-0 ${
                              isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          />
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
                <div className="border-t border-gray-200 px-2 py-4">
                  <IndustryToggle />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="border-b border-gray-200 bg-white pt-1 pl-1 sm:pt-3 sm:pl-3 md:hidden">
            <button
              type="button"
              className="-mt-0.5 -ml-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Page content */}
          <main className="relative flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
            <div className="py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
