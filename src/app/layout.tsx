import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './tailwind.css'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import AuthProvider from '@/providers/SessionProvider'
import { getSession } from '@/lib/auth-wrapper'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { AuthErrorBoundary } from '@/components/error/AuthErrorBoundary'
import { MobileOptimizer } from '@/components/mobile/MobileOptimizer'
import { ABTestProvider } from '@/components/ab-testing/ABTestProvider'
import { ExperimentDebugger } from '@/components/ab-testing/ExperimentDebugger'
import { FloatingAIAssistant } from '@/components/ai/FloatingAIAssistant'
import CookieConsent from '@/components/legal/CookieConsent'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CoreFlow360 - HVAC Business Empire Platform | Scale From 1 to 100+ Locations',
  description:
    'The only platform built for ambitious HVAC contractors ready to dominate their market. Manage multiple businesses, territories, and teams from one intelligent platform. Scale from 1 to 100+ locations seamlessly.',
  keywords:
    'HVAC business software, HVAC management platform, multi-location HVAC software, HVAC empire building, HVAC business automation, HVAC contractor software, HVAC CRM, HVAC accounting, HVAC field service management',
  authors: [{ name: 'CoreFlow360' }],
  creator: 'CoreFlow360',
  publisher: 'CoreFlow360',
  applicationName: 'CoreFlow360',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://coreflow360.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: 'CoreFlow360 - The Business Platform That Grows With Your Empire',
    description:
      'Stop working IN your business. Start making money FROM your business. +247% average revenue increase. 30+ hours saved per week. Free 30-day trial.',
    url: 'https://coreflow360.com',
    siteName: 'CoreFlow360',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CoreFlow360 - Business Automation Software',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CoreFlow360',
    creator: '@CoreFlow360',
    title: 'CoreFlow360 - Turn Your Business Into a BUSINESS EMPIRE',
    description:
      'Stop working IN your business. Start making money FROM your business. +247% revenue increase, 30+ hours saved weekly. Free trial.',
    images: {
      url: '/og-image.png',
      alt: 'CoreFlow360 - Business Automation Software',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    bing: process.env.BING_SITE_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
  category: 'business',
  classification: 'Business Software',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CoreFlow360',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
    'format-detection': 'telephone=no',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Safely handle auth - prevent 500 errors during build/SSR
  const session = await getSession()

  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark light" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CoreFlow360" />
        <meta name="application-name" content="CoreFlow360" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'CoreFlow360',
            description:
              'Business automation software that transforms operations and increases profitability',
            url: 'https://coreflow360.com',
            logo: 'https://coreflow360.com/logo.png',
            foundingDate: '2024',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'US',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              availableLanguage: 'English',
            },
            sameAs: ['https://twitter.com/CoreFlow360', 'https://linkedin.com/company/coreflow360'],
          })}
        </script>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ErrorBoundary>
          <AnalyticsProvider>
            <ABTestProvider>
              <AuthProvider session={session}>
                <AuthErrorBoundary>
                  <MobileOptimizer />
                  {children}
                  <AIAssistant />
                  <FloatingAIAssistant />
                  <FeedbackWidget />
                  <ExperimentDebugger />
                  <CookieConsent />
                </AuthErrorBoundary>
              </AuthProvider>
            </ABTestProvider>
          </AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
