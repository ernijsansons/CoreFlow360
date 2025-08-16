import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import AuthProvider from '@/providers/SessionProvider'
import { auth } from '@/lib/auth'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { AuthErrorBoundary } from '@/components/error/AuthErrorBoundary'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoreFlow360 - AI-First ERP Platform | Autonomous Business Operations",
  description: "The world's first AI-orchestrated ERP platform. 8 integrated systems with specialized AI agents. 60% less expensive than NetSuite, infinitely smarter than traditional ERPs.",
  keywords: "AI ERP, Autonomous Operations, Business Intelligence, CRM AI, Financial AI, HR AI, Project Management AI, Manufacturing ERP, Legal ERP",
  authors: [{ name: "CoreFlow360" }],
  creator: "CoreFlow360",
  publisher: "CoreFlow360",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://coreflow360.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "CoreFlow360 - AI-First ERP Platform",
    description: "Transform your business with AI-orchestrated workflows. 8 ERP systems, infinite possibilities, autonomous operations.",
    url: '/',
    siteName: 'CoreFlow360',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CoreFlow360 - AI-First ERP Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CoreFlow360 - AI-First ERP Platform",
    description: "Transform your business with AI-orchestrated workflows. 8 ERP systems, infinite possibilities.",
    images: ['/og-image.png'],
    creator: '@coreflow360',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'business',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
  
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <AnalyticsProvider>
            <AuthProvider session={session}>
              <AuthErrorBoundary>
                {children}
                <AIAssistant />
                <FeedbackWidget />
              </AuthErrorBoundary>
            </AuthProvider>
          </AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
