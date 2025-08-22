// TODO: Install Sentry package in production: npm install @sentry/nextjs
// import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Exclude backup folders from webpack
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/.v0-deployed-backup/**', 
        '**/node_modules/**',
        '**/messaging-backup*/**'
      ],
    }
    return config
  },

  // Security headers - now handled by advanced security headers middleware
  // Keeping basic headers as fallback
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      // CSP reporting endpoint
      {
        source: '/api/security/csp-report',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST',
          },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // TypeScript configuration - strict mode enabled
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src', 'prisma'], // Focus linting on key directories
  },

  // Optimizations for Vercel
  swcMinify: true,
  generateEtags: false,
  poweredByHeader: false,
  compress: true,

  // Environment validation enabled for production safety
  env: {
    // Environment variables that should be available on the client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
}

// TODO: Enable Sentry in production
// const sentryWebpackPluginOptions = {
//   org: 'coreflow360',
//   project: 'javascript-nextjs',
//   silent: true,
//   widenClientFileUpload: true,
//   hideSourceMaps: true,
//   disableLogger: true,
//   automaticVercelMonitors: true,
// }

// export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)
export default nextConfig