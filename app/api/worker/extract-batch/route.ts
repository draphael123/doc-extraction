import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTextExtractor } from '@/lib/extraction/text-extractors'
import { ExtractionEngine } from '@/lib/extraction/engine'
import { getBlobAdapter } from '@/lib/storage/blob'

const WORKER_SECRET = process.env.WORKER_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    // Verify worker secret
    const workerSecret = request.headers.get('X-Worker-Secret')
    if (workerSecret !== WORKER_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, templateId, documentIds, batchIndex, totalBatches } = body

    if (!jobId || !templateId || !documentIds || !Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Get template
    const template = await prisma.extractionTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const fields = template.fields as any[]
    const engine = new ExtractionEngine()
    const blobAdapter = getBlobAdapter()

    let processed = 0
    let failed = 0

    // Process each document in the batch
    for (const documentId of documentIds) {
      try {
        const document = await prisma.document.findUnique({
          where: { id: documentId },
        })

        if (!document) {
          failed++
          continue
        }

        // Update document status
        await prisma.document.update({
          where: { id: documentId },
          data: { status: 'PROCESSING' },
        })

        // Fetch file from blob storage
        const response = await fetch(document.blobUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Extract text
        const textExtractor = getTextExtractor(document.mimeType)
        const extractedText = await textExtractor.extract(buffer, document.mimeType)

        // Extract fields
        const fieldResults = await engine.extractFields(extractedText, fields)

        // Determine overall status
        const hasMissing = fieldResults.some((r) => r.status === 'missing')
        const hasNeedsReview = fieldResults.some((r) => r.status === 'needs_review')
        const status = hasMissing ? 'MISSING' : hasNeedsReview ? 'NEEDS_REVIEW' : 'OK'

        // Upsert extraction result
        await prisma.extractionResult.upsert({
          where: {
            documentId_templateId: {
              documentId,
              templateId,
            },
          },
          create: {
            documentId,
            templateId,
            fieldResults,
            status,
          },
          update: {
            fieldResults,
            status,
          },
        })

        // Update document status
        await prisma.document.update({
          where: { id: documentId },
          data: { status: 'COMPLETED' },
        })

        processed++
      } catch (error) {
        console.error(`Error processing document ${documentId}:`, error)
        
        await prisma.document.update({
          where: { id: documentId },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        })

        failed++
      }
    }

    // Update job progress
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (job) {
      const newProcessed = job.processedDocs + processed
      const newFailed = job.failedDocs + failed
      const progress = job.totalDocs > 0 ? newProcessed / job.totalDocs : 0
      const isComplete = newProcessed + newFailed >= job.totalDocs

      await prisma.job.update({
        where: { id: jobId },
        data: {
          processedDocs: newProcessed,
          failedDocs: newFailed,
          progress,
          status: isComplete ? 'COMPLETED' : 'RUNNING',
          completedAt: isComplete ? new Date() : undefined,
        },
      })
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      batchIndex,
      totalBatches,
    })
  } catch (error) {
    console.error('Error processing batch:', error)
    return NextResponse.json(
      { error: 'Failed to process batch', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
