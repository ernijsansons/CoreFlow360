import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  robots?: string
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
  schema?: unknown
}

export class SEOOptimizer {
  private baseUrl: string
  private siteName: string

  constructor(baseUrl = 'https://coreflow360.com', siteName = 'CoreFlow360') {
    this.baseUrl = baseUrl
    this.siteName = siteName
  }

  generateMetadata(config: SEOConfig): Metadata {
    const {
      title,
      description,
      keywords = [],
      canonical,
      robots = 'index,follow',
      ogImage = '/og-image.jpg',
      twitterCard = 'summary_large_image',
      schema,
    } = config

    const fullTitle = `${title} | ${this.siteName}`
    const canonicalUrl = canonical || this.baseUrl

    return {
      title: fullTitle,
      description,
      keywords: keywords.join(', '),
      robots,
      canonical: canonicalUrl,

      // Open Graph
      openGraph: {
        title: fullTitle,
        description,
        url: canonicalUrl,
        siteName: this.siteName,
        images: [
          {
            url: `${this.baseUrl}${ogImage}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },

      // Twitter
      twitter: {
        card: twitterCard,
        site: '@CoreFlow360',
        creator: '@CoreFlow360',
        title: fullTitle,
        description,
        images: [`${this.baseUrl}${ogImage}`],
      },

      // Additional meta tags
      other: {
        'application-name': this.siteName,
        'apple-mobile-web-app-title': this.siteName,
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'format-detection': 'telephone=no',
        'mobile-web-app-capable': 'yes',
        'msapplication-config': '/browserconfig.xml',
        'msapplication-TileColor': '#000000',
        'theme-color': '#000000',
      },

      // Verification
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        bing: process.env.BING_SITE_VERIFICATION,
      },

      // Schema.org structured data
      ...(schema && {
        other: {
          ...{
            'application-name': this.siteName,
            'apple-mobile-web-app-title': this.siteName,
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'black-translucent',
            'format-detection': 'telephone=no',
            'mobile-web-app-capable': 'yes',
            'msapplication-config': '/browserconfig.xml',
            'msapplication-TileColor': '#000000',
            'theme-color': '#000000',
          },
          'script:ld+json': JSON.stringify(schema),
        },
      }),
    }
  }

  // Predefined page configurations
  getHomePageSEO(): SEOConfig {
    return {
      title: 'Business Automation Software - Transform Your Operations',
      description:
        'Turn your business into a revenue machine with CoreFlow360. Automate operations, increase profits by 247%, and save 30+ hours weekly. Start free trial today.',
      keywords: [
        'business automation software',
        'ERP system',
        'business management platform',
        'workflow automation',
        'business intelligence',
        'CRM software',
        'accounting software',
        'project management',
        'inventory management',
        'business process automation',
      ],
      schema: this.getOrganizationSchema(),
    }
  }

  getPricingPageSEO(): SEOConfig {
    return {
      title: 'Pricing Plans - Affordable Business Automation Starting at $45/month',
      description:
        'Transparent pricing for business automation software. Compare plans starting at $45/user/month. No setup fees, 30-day money-back guarantee.',
      keywords: [
        'business software pricing',
        'ERP software cost',
        'affordable business automation',
        'business management software price',
        'small business software pricing',
      ],
      schema: this.getPricingSchema(),
    }
  }

  getHVACPageSEO(): SEOConfig {
    return {
      title: 'HVAC Business Management Software - Field Service Automation',
      description:
        'Complete HVAC business management solution. Smart scheduling, mobile field service, inventory tracking, and customer management. 847+ HVAC companies trust us.',
      keywords: [
        'HVAC software',
        'field service management',
        'HVAC scheduling software',
        'HVAC business management',
        'heating cooling software',
        'HVAC inventory management',
        'HVAC customer management',
      ],
      schema: this.getHVACSoftwareSchema(),
    }
  }

  getCompetitorPageSEO(): SEOConfig {
    return {
      title: 'CoreFlow360 vs Competitors - Why We Win Every Comparison',
      description:
        'See how CoreFlow360 beats legacy ERP systems, point solutions, and manual processes. Better features, faster implementation, lower cost.',
      keywords: [
        'business software comparison',
        'ERP software comparison',
        'vs Salesforce',
        'vs QuickBooks',
        'vs Microsoft Dynamics',
        'best business software',
        'ERP alternatives',
      ],
      schema: this.getComparisonSchema(),
    }
  }

  // Schema.org structured data generators
  private getOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CoreFlow360',
      description:
        'Business automation software that transforms operations and increases profitability',
      url: this.baseUrl,
      logo: `${this.baseUrl}/logo.png`,
      foundingDate: '2024',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-COREFLOW',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
      sameAs: [
        'https://twitter.com/CoreFlow360',
        'https://linkedin.com/company/coreflow360',
        'https://facebook.com/CoreFlow360',
      ],
    }
  }

  private getPricingSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'CoreFlow360 Business Automation Platform',
      description: 'Complete business automation and ERP solution',
      brand: {
        '@type': 'Brand',
        name: 'CoreFlow360',
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Smart Start',
          price: '45',
          priceCurrency: 'USD',
          billingIncrement: 'Monthly',
          description: 'Perfect for small businesses getting started with automation',
        },
        {
          '@type': 'Offer',
          name: 'Connected Business',
          price: '65',
          priceCurrency: 'USD',
          billingIncrement: 'Monthly',
          description: 'Complete business automation for growing companies',
        },
        {
          '@type': 'Offer',
          name: 'Intelligent Enterprise',
          price: '85',
          priceCurrency: 'USD',
          billingIncrement: 'Monthly',
          description: 'Advanced analytics and AI-powered insights',
        },
      ],
    }
  }

  private getHVACSoftwareSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'CoreFlow360 HVAC Management Software',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web-based, iOS, Android',
      description:
        'Complete HVAC business management solution with scheduling, field service, and customer management',
      offers: {
        '@type': 'Offer',
        price: '65',
        priceCurrency: 'USD',
        billingIncrement: 'Monthly',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '847',
        bestRating: '5',
      },
      featureList: [
        'Smart scheduling and dispatch',
        'Mobile field service app',
        'Inventory management',
        'Customer portal',
        'Financial reporting',
        'Maintenance contracts',
      ],
    }
  }

  private getComparisonSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'CoreFlow360 vs Competitors: Complete Business Software Comparison',
      description:
        'Comprehensive comparison of CoreFlow360 against legacy ERP systems, point solutions, and manual processes',
      author: {
        '@type': 'Organization',
        name: 'CoreFlow360',
      },
      publisher: {
        '@type': 'Organization',
        name: 'CoreFlow360',
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/logo.png`,
        },
      },
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}/vs-competitors`,
      },
    }
  }

  // Generate FAQ schema for rich snippets
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }
  }

  // Generate breadcrumb schema
  generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    }
  }

  // Generate review schema
  generateReviewSchema(
    reviews: Array<{
      author: string
      rating: number
      text: string
      date: string
    }>
  ) {
    return reviews.map((review) => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.text,
      datePublished: review.date,
    }))
  }

  // SEO checklist generator
  generateSEOChecklist(_url: string) {
    return {
      title: 'Check title length (50-60 characters)',
      description: 'Check meta description length (150-160 characters)',
      headings: 'Use proper heading hierarchy (H1, H2, H3)',
      keywords: 'Include target keywords naturally',
      images: 'Add alt text to all images',
      links: 'Check for broken links',
      speed: 'Optimize page loading speed',
      mobile: 'Ensure mobile responsiveness',
      schema: 'Add structured data markup',
      canonical: 'Set canonical URL',
      sitemap: 'Submit to Google Search Console',
      robots: 'Check robots.txt',
      ssl: 'Ensure HTTPS is enabled',
      gsc: 'Monitor Google Search Console',
      analytics: 'Set up Google Analytics',
    }
  }
}

export const seoOptimizer = new SEOOptimizer()
