import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const UpdateBrandingSchema = z.object({
  partnerId: z.string(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().optional(),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  customCSS: z.string().optional(),
  emailTemplate: z.enum(['default', 'modern', 'minimal', 'branded']).optional()
})

const BrandingPreviewSchema = z.object({
  partnerId: z.string(),
  previewType: z.enum(['LOGIN', 'DASHBOARD', 'EMAIL', 'MOBILE']).optional().default('DASHBOARD'),
  brandingData: UpdateBrandingSchema.omit({ partnerId: true })
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')
    
    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Mock branding data - in production, fetch from database
    const branding = await getPartnerBranding(partnerId)
    
    if (!branding) {
      return NextResponse.json(
        { success: false, error: 'Partner branding not found' },
        { status: 404 }
      )
    }

    // Generate CSS variables and preview
    const cssVariables = generateCSSVariables(branding)
    const previewHTML = generatePreviewHTML(branding)

    return NextResponse.json({
      success: true,
      data: {
        branding,
        cssVariables,
        previewHTML,
        brandingGuide: generateBrandingGuide(branding)
      }
    })

  } catch (error) {
    console.error('Get branding error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch branding' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = UpdateBrandingSchema.parse(body)

    // Validate partner exists
    const partner = await getPartnerById(validatedData.partnerId)
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Update branding
    const updatedBranding = await updatePartnerBranding(validatedData)

    // Generate updated CSS and preview
    const cssVariables = generateCSSVariables(updatedBranding)
    const previewHTML = generatePreviewHTML(updatedBranding)

    // Trigger branding deployment
    await deployBrandingChanges(validatedData.partnerId, updatedBranding)

    return NextResponse.json({
      success: true,
      data: {
        branding: updatedBranding,
        cssVariables,
        previewHTML,
        deploymentStatus: 'INITIATED'
      },
      message: 'Branding updated successfully'
    })

  } catch (error) {
    console.error('Update branding error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid branding data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update branding' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    if (action === 'preview') {
      const validatedData = BrandingPreviewSchema.parse(body.data)
      const preview = await generateBrandingPreview(validatedData)
      
      return NextResponse.json({
        success: true,
        data: preview
      })
      
    } else if (action === 'reset') {
      const { partnerId } = body.data
      const defaultBranding = await resetToDefaultBranding(partnerId)
      
      return NextResponse.json({
        success: true,
        data: defaultBranding,
        message: 'Branding reset to defaults'
      })
      
    } else if (action === 'export') {
      const { partnerId, format } = body.data
      const exportData = await exportBrandingConfig(partnerId, format)
      
      return NextResponse.json({
        success: true,
        data: exportData
      })
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Branding action error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process branding request' },
      { status: 500 }
    )
  }
}

async function getPartnerById(partnerId: string) {
  // Mock partner lookup - in production, fetch from database
  const mockPartners = {
    'partner-001': { id: 'partner-001', partnerName: 'TechFlow Solutions', isActive: true },
    'partner-002': { id: 'partner-002', partnerName: 'Business Pro Suite', isActive: true }
  }
  
  return mockPartners[partnerId as keyof typeof mockPartners] || null
}

async function getPartnerBranding(partnerId: string) {
  // Mock branding data - in production, fetch from database
  const mockBrandings = {
    'partner-001': {
      id: 'branding-001',
      partnerId: 'partner-001',
      primaryColor: '#2563EB',
      secondaryColor: '#1D4ED8',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter, sans-serif',
      logoUrl: 'https://example.com/logo.png',
      faviconUrl: 'https://example.com/favicon.ico',
      customCSS: '.custom-header { border-bottom: 2px solid var(--primary-color); }',
      emailTemplate: 'branded',
      isActive: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-10')
    },
    'partner-002': {
      id: 'branding-002',
      partnerId: 'partner-002',
      primaryColor: '#059669',
      secondaryColor: '#047857',
      accentColor: '#DC2626',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
      fontFamily: 'Roboto, sans-serif',
      logoUrl: null,
      faviconUrl: null,
      customCSS: '',
      emailTemplate: 'modern',
      isActive: true,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-05')
    }
  }
  
  return mockBrandings[partnerId as keyof typeof mockBrandings] || null
}

async function updatePartnerBranding(data: z.infer<typeof UpdateBrandingSchema>) {
  // In production, update database record
  const existing = await getPartnerBranding(data.partnerId)
  
  if (!existing) {
    throw new Error('Branding configuration not found')
  }

  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date()
  }

  return updated
}

function generateCSSVariables(branding: any) {
  return {
    ':root': {
      '--primary-color': branding.primaryColor,
      '--secondary-color': branding.secondaryColor,
      '--accent-color': branding.accentColor,
      '--background-color': branding.backgroundColor,
      '--text-color': branding.textColor,
      '--font-family': branding.fontFamily
    },
    cssString: `
:root {
  --primary-color: ${branding.primaryColor};
  --secondary-color: ${branding.secondaryColor};
  --accent-color: ${branding.accentColor};
  --background-color: ${branding.backgroundColor};
  --text-color: ${branding.textColor};
  --font-family: ${branding.fontFamily};
}

${branding.customCSS || ''}
    `.trim()
  }
}

function generatePreviewHTML(branding: any) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Branding Preview</title>
  <style>
    :root {
      --primary-color: ${branding.primaryColor};
      --secondary-color: ${branding.secondaryColor};
      --accent-color: ${branding.accentColor};
      --background-color: ${branding.backgroundColor};
      --text-color: ${branding.textColor};
      --font-family: ${branding.fontFamily};
    }
    
    body {
      font-family: var(--font-family);
      background-color: var(--background-color);
      color: var(--text-color);
      margin: 0;
      padding: 20px;
    }
    
    .header {
      background-color: var(--primary-color);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .button-primary {
      background-color: var(--primary-color);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      margin-right: 10px;
    }
    
    .button-secondary {
      background-color: var(--secondary-color);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      margin-right: 10px;
    }
    
    .accent-text {
      color: var(--accent-color);
      font-weight: bold;
    }
    
    ${branding.customCSS || ''}
  </style>
</head>
<body>
  <div class="header">
    <h1>Your Platform Preview</h1>
    <p>This is how your white-label platform will look</p>
  </div>
  
  <div>
    <h2>Sample Content</h2>
    <p>This is regular text using your custom styling.</p>
    <p class="accent-text">This is accent text highlighting important information.</p>
    
    <div style="margin: 20px 0;">
      <button class="button-primary">Primary Action</button>
      <button class="button-secondary">Secondary Action</button>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateBrandingGuide(branding: any) {
  return {
    colorPalette: {
      primary: {
        hex: branding.primaryColor,
        usage: 'Main brand color for buttons, links, and key UI elements'
      },
      secondary: {
        hex: branding.secondaryColor,
        usage: 'Supporting color for secondary actions and accents'
      },
      accent: {
        hex: branding.accentColor,
        usage: 'Highlighting important information and call-to-actions'
      },
      background: {
        hex: branding.backgroundColor,
        usage: 'Main background color for pages and containers'
      },
      text: {
        hex: branding.textColor,
        usage: 'Primary text color for readability'
      }
    },
    typography: {
      fontFamily: branding.fontFamily,
      guidelines: [
        'Use consistent font weights throughout the interface',
        'Maintain proper contrast ratios for accessibility',
        'Apply appropriate line spacing for readability'
      ]
    },
    assets: {
      logo: branding.logoUrl ? {
        url: branding.logoUrl,
        guidelines: ['Use on light backgrounds', 'Maintain aspect ratio', 'Minimum size: 120px width']
      } : null,
      favicon: branding.faviconUrl ? {
        url: branding.faviconUrl,
        guidelines: ['16x16 and 32x32 pixel versions', 'ICO format preferred']
      } : null
    },
    implementation: {
      cssVariables: generateCSSVariables(branding).cssString,
      customizations: branding.customCSS ? 'Custom CSS rules applied' : 'No custom CSS'
    }
  }
}

async function generateBrandingPreview(data: z.infer<typeof BrandingPreviewSchema>) {
  const mockBranding = {
    id: 'preview',
    partnerId: data.partnerId,
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter, sans-serif',
    logoUrl: null,
    faviconUrl: null,
    customCSS: '',
    emailTemplate: 'default',
    ...data.brandingData
  }

  const preview = {
    previewType: data.previewType,
    html: generatePreviewHTML(mockBranding),
    css: generateCSSVariables(mockBranding).cssString,
    responsive: {
      mobile: generateMobilePreview(mockBranding),
      tablet: generateTabletPreview(mockBranding),
      desktop: generateDesktopPreview(mockBranding)
    }
  }

  return preview
}

function generateMobilePreview(branding: any) {
  return {
    viewport: '375x667',
    adaptations: [
      'Simplified navigation menu',
      'Touch-friendly button sizes',
      'Optimized typography scale'
    ]
  }
}

function generateTabletPreview(branding: any) {
  return {
    viewport: '768x1024',
    adaptations: [
      'Two-column layout where appropriate',
      'Medium-sized touch targets',
      'Balanced content density'
    ]
  }
}

function generateDesktopPreview(branding: any) {
  return {
    viewport: '1920x1080',
    adaptations: [
      'Full navigation and sidebar',
      'Multi-column layouts',
      'Dense information display'
    ]
  }
}

async function resetToDefaultBranding(partnerId: string) {
  const defaultBranding = {
    id: `branding-${partnerId}`,
    partnerId,
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter, sans-serif',
    logoUrl: null,
    faviconUrl: null,
    customCSS: '',
    emailTemplate: 'default',
    isActive: true,
    updatedAt: new Date()
  }

  // In production, update database record
  return defaultBranding
}

async function exportBrandingConfig(partnerId: string, format: string) {
  const branding = await getPartnerBranding(partnerId)
  
  if (!branding) {
    throw new Error('Branding configuration not found')
  }

  switch (format) {
    case 'css':
      return {
        format: 'CSS',
        content: generateCSSVariables(branding).cssString,
        filename: `branding-${partnerId}.css`
      }
    
    case 'json':
      return {
        format: 'JSON',
        content: JSON.stringify(branding, null, 2),
        filename: `branding-${partnerId}.json`
      }
    
    case 'scss':
      return {
        format: 'SCSS',
        content: generateSCSSVariables(branding),
        filename: `branding-${partnerId}.scss`
      }
    
    default:
      throw new Error('Unsupported export format')
  }
}

function generateSCSSVariables(branding: any) {
  return `
// Partner Branding Variables
$primary-color: ${branding.primaryColor};
$secondary-color: ${branding.secondaryColor};
$accent-color: ${branding.accentColor};
$background-color: ${branding.backgroundColor};
$text-color: ${branding.textColor};
$font-family: ${branding.fontFamily};

// Custom styles
${branding.customCSS || '// No custom CSS defined'}
  `.trim()
}

async function deployBrandingChanges(partnerId: string, branding: any) {
  // In production, trigger deployment pipeline
  console.log(`Deploying branding changes for partner ${partnerId}`)
  
  // Example deployment steps:
  // 1. Generate CSS files
  // 2. Update CDN assets
  // 3. Invalidate cache
  // 4. Notify partner subdomain
  // 5. Update SSL certificates if needed
  
  return {
    deploymentId: `deploy-${partnerId}-${Date.now()}`,
    status: 'INITIATED',
    estimatedTime: '5-10 minutes',
    steps: [
      'Generating CSS assets',
      'Updating CDN distribution',
      'Invalidating cache',
      'Applying changes to partner subdomain'
    ]
  }
}