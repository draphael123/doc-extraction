import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_USER_ID } from '@/lib/public-user'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { getBlobAdapter } from '@/lib/storage/blob'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, templateId } = body

    if (!projectId || !templateId) {
      return NextResponse.json(
        { error: 'projectId and templateId are required' },
        { status: 400 }
      )
    }

    // Verify project exists
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: PUBLIC_USER_ID,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const template = await prisma.extractionTemplate.findFirst({
      where: {
        id: templateId,
        projectId,
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get all extraction results
    const results = await prisma.extractionResult.findMany({
      where: {
        templateId,
        document: {
          projectId,
        },
      },
      include: {
        document: true,
      },
      orderBy: {
        document: {
          createdAt: 'asc',
        },
      },
    })

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No extraction results found' },
        { status: 400 }
      )
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fields = template.fields as any[]

    let currentPage = pdfDoc.addPage([612, 792]) // Letter size
    let yPosition = 750
    const pageHeight = 792
    const margin = 50
    const lineHeight = 20
    const sectionSpacing = 30

    // Cover page
    currentPage.drawText(project.name, {
      x: margin,
      y: yPosition,
      size: 24,
      font: boldFont,
    })
    yPosition -= 40

    currentPage.drawText(`Template: ${template.name}`, {
      x: margin,
      y: yPosition,
      size: 18,
      font: font,
    })
    yPosition -= 30

    currentPage.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: font,
    })
    yPosition -= 60

    // Table of contents placeholder (we'll update page numbers later)
    currentPage.drawText('Table of Contents', {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
    })
    yPosition -= 30

    const tocEntries: Array<{ title: string; pageNumber: number }> = []

    for (const result of results) {
      const docTitle = result.document.originalName
      tocEntries.push({ title: docTitle, pageNumber: 0 }) // Will update later

      if (yPosition < 100) {
        currentPage = pdfDoc.addPage([612, 792])
        yPosition = 750
      }

      // Document section header
      currentPage.drawText(docTitle, {
        x: margin,
        y: yPosition,
        size: 16,
        font: boldFont,
      })
      yPosition -= lineHeight * 1.5

      const fieldResults = result.fieldResults as any[]

      // Two-column layout for fields
      let leftColumn = margin
      let rightColumn = 350
      let columnY = yPosition

      for (const fieldResult of fieldResults) {
        const field = fields.find((f) => f.fieldName === fieldResult.fieldName)
        if (!field) continue

        const label = `${field.fieldName}:`
        const value = fieldResult.value !== null && fieldResult.value !== undefined
          ? String(fieldResult.value)
          : 'N/A'

        // Check if we need a new page
        if (columnY < 100) {
          currentPage = pdfDoc.addPage([612, 792])
          columnY = 750
          leftColumn = margin
          rightColumn = 350
        }

        // Draw label (bold)
        currentPage.drawText(label, {
          x: leftColumn,
          y: columnY,
          size: 10,
          font: boldFont,
          maxWidth: 250,
        })

                        // Draw value
                        currentPage.drawText(value, {
                          x: leftColumn + 10,
                          y: columnY - 12,
                          size: 10,
                          font: font,
                          maxWidth: 240,
                        })

                        // Estimate height (rough calculation: ~12px per line)
                        const estimatedLines = Math.ceil(value.length / 40) || 1
                        const valueHeight = estimatedLines * 12
                        columnY -= valueHeight + 20

        // Switch columns if needed
        if (columnY < 100 && leftColumn === margin) {
          columnY = yPosition
          leftColumn = rightColumn
        }
      }

      yPosition = columnY - sectionSpacing
    }

    // Update TOC with page numbers (simplified - would need proper page tracking)
    // For now, we'll just note that TOC page numbers would need more sophisticated tracking

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()
    const blobAdapter = getBlobAdapter()
    const blobPath = `projects/${projectId}/master-pdf-${Date.now()}.pdf`
    const blobUrl = await blobAdapter.upload(
      Buffer.from(pdfBytes),
      blobPath,
      'application/pdf'
    )

    // Return the URL - for local storage, this will be an API route
    const url = blobUrl.startsWith('http') ? blobUrl : `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}${blobUrl}`
    return NextResponse.json({
      url,
      filename: `master-${project.name}-${template.name}.pdf`,
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
