import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_USER_ID } from '@/lib/public-user'

// Process batches in the background (local mode)
async function processBatchesInBackground(
  jobId: string,
  templateId: string,
  batches: string[][]
) {
  const baseUrl = process.env.NEXTAUTH_URL ||
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                  'http://localhost:3000'

  const workerUrl = `${baseUrl}/api/worker/extract-batch`

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    
    try {
      // Call worker directly (no external queue)
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Worker-Secret': process.env.WORKER_SECRET || 'local-dev-secret',
        },
        body: JSON.stringify({
          jobId,
          templateId,
          documentIds: batch,
          batchIndex: i,
          totalBatches: batches.length,
        }),
      })

      if (!response.ok) {
        console.error(`Batch ${i} failed:`, await response.text())
      }
      
      // Small delay between batches to avoid overwhelming the system
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error(`Error processing batch ${i}:`, error)
    }
  }
}

export const dynamic = 'force-dynamic'

const BATCH_SIZE = 20 // Process 20 documents per batch

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

    // Get pending documents
    const documents = await prisma.document.findMany({
      where: {
        projectId,
        status: { in: ['PENDING', 'FAILED'] },
      },
      select: { id: true },
    })

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents to process' },
        { status: 400 }
      )
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        projectId,
        templateId,
        status: 'PENDING',
        progress: 0,
        totalDocs: documents.length,
        processedDocs: 0,
        failedDocs: 0,
      },
    })

    // Split into batches
    const batches: string[][] = []
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      batches.push(documents.slice(i, i + BATCH_SIZE).map((d) => d.id))
    }

    // Process batches in background (local mode - no external queue needed)
    processBatchesInBackground(job.id, templateId, batches).catch((error) => {
      console.error('Error processing batches in background:', error)
    })

    // Update job status
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'RUNNING' },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error starting extraction:', error)
    return NextResponse.json(
      { error: 'Failed to start extraction' },
      { status: 500 }
    )
  }
}
