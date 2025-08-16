import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const downloadTemplateSchema = z.object({
  templateId: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId } = downloadTemplateSchema.parse(body)

    // Track download
    await prisma.templateDownload.create({
      data: {
        templateId,
        userId: session.user.id,
        tenantId: session.user.tenantId,
        downloadedAt: new Date()
      }
    })

    // Generate download package based on template type
    const downloadData = await generateDownloadPackage(templateId)

    // Return as blob for download
    return new NextResponse(downloadData.content, {
      status: 200,
      headers: {
        'Content-Type': downloadData.mimeType,
        'Content-Disposition': `attachment; filename="${downloadData.filename}"`,
        'Content-Length': downloadData.size.toString()
      }
    })
  } catch (error) {
    console.error('Error downloading template:', error)
    return NextResponse.json(
      { error: 'Failed to download template' },
      { status: 500 }
    )
  }
}

async function generateDownloadPackage(templateId: string) {
  // In production, this would fetch the actual template files
  // and create a proper download package
  
  const templateFormats: Record<string, any> = {
    'executive-impact-proposal': {
      format: 'video',
      mimeType: 'video/mp4',
      filename: 'executive-impact-proposal.mp4',
      size: 25 * 1024 * 1024 // 25MB
    },
    'innovation-showcase': {
      format: 'pdf',
      mimeType: 'application/pdf',
      filename: 'innovation-showcase.pdf',
      size: 5 * 1024 * 1024 // 5MB
    },
    'growth-story-deck': {
      format: 'html',
      mimeType: 'application/zip',
      filename: 'growth-story-deck.zip',
      size: 10 * 1024 * 1024 // 10MB
    },
    'decision-impact-visual': {
      format: 'image',
      mimeType: 'image/png',
      filename: 'decision-impact-visual.png',
      size: 2 * 1024 * 1024 // 2MB
    },
    'ceo-message-video': {
      format: 'video',
      mimeType: 'video/mp4',
      filename: 'ceo-message.mp4',
      size: 50 * 1024 * 1024 // 50MB
    },
    'viral-success-story': {
      format: 'video',
      mimeType: 'video/mp4',
      filename: 'viral-success-story.mp4',
      size: 15 * 1024 * 1024 // 15MB
    },
    'roi-calculator-interactive': {
      format: 'web',
      mimeType: 'application/zip',
      filename: 'roi-calculator.zip',
      size: 8 * 1024 * 1024 // 8MB
    }
  }

  const templateData = templateFormats[templateId] || {
    format: 'generic',
    mimeType: 'application/octet-stream',
    filename: 'template.zip',
    size: 1024 * 1024 // 1MB
  }

  // Generate dummy content for demo
  // In production, this would be the actual file content
  const buffer = Buffer.alloc(templateData.size)
  
  return {
    content: buffer,
    mimeType: templateData.mimeType,
    filename: templateData.filename,
    size: templateData.size
  }
}