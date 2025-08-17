/**
 * Google Analytics 4 Integration Component (Free)
 * Based on successful SaaS implementations
 */

import Script from 'next/script'
import { GA_TRACKING_ID } from '@/lib/analytics'

export default function GoogleAnalytics() {
  if (!GA_TRACKING_ID) {
    return null
  }

  return (
    <>
      {/* Google Analytics 4 Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_TRACKING_ID.replace(/[<>'"]/g, '')}', {
              page_path: window.location.pathname,
              send_page_view: true,
              // Enhanced ecommerce for subscription tracking
              custom_map: {'custom_parameter': 'subscription_tier'},
              // Privacy-friendly settings
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });

            // Enhanced ecommerce configuration
            gtag('config', '${GA_TRACKING_ID.replace(/[<>'"]/g, '')}', {
              // Track subscription events as purchases
              enhanced_ecommerce: true,
              // Custom events for SaaS metrics
              custom_parameters: {
                subscription_tier: 'basic',
                module_count: 0,
                user_type: 'trial'
              }
            });
          `,
        }}
      />
    </>
  )
}

// Hook for tracking page views in App Router
export function usePageTracking() {
  if (typeof window !== 'undefined' && window.gtag) {
    // Track route changes
    const handleRouteChange = (url: string) => {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
      })
    }

    return handleRouteChange
  }
  
  return () => {}
}