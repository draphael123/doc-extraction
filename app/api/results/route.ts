import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_USER_ID } from '@/lib/public-user'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const templateId = searchParams.get('templateId')

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

    const results = await prisma.extractionResult.findMany({
      where: {
        templateId,
        document: {
          projectId,
        },
      },
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
          },
        },
      },
      orderBy: {
        document: {
          createdAt: 'asc',
        },
      },
    })

    // Parse JSON strings back to objects for API response
    const parsedResults = results.map(r => ({
      ...r,
      fieldResults: typeof r.fieldResults === 'string' 
        ? JSON.parse(r.fieldResults) 
        : r.fieldResults,
    }))

    return NextResponse.json(parsedResults)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}
