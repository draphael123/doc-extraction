import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_USER_ID } from '@/lib/public-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const templateSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      fieldName: z.string(),
      description: z.string(),
      type: z.enum(['string', 'number', 'date', 'boolean']),
      required: z.boolean(),
      extractionMethod: z.enum(['regex', 'keyword+window', 'llm']),
      pattern: z.string().optional(),
      flags: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      windowSize: z.number().optional(),
      useLLM: z.boolean().optional(),
    })
  ),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    const templates = await prisma.extractionTemplate.findMany({
      where: {
        projectId,
        project: {
          userId: PUBLIC_USER_ID,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Parse JSON strings back to objects for API response
    const parsedTemplates = templates.map(t => ({
      ...t,
      fields: typeof t.fields === 'string' ? JSON.parse(t.fields) : t.fields,
    }))

    return NextResponse.json(parsedTemplates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = templateSchema.parse(body)

    // Verify project exists
    const project = await prisma.project.findFirst({
      where: {
        id: validated.projectId,
        userId: PUBLIC_USER_ID,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const template = await prisma.extractionTemplate.create({
      data: {
        projectId: validated.projectId,
        name: validated.name,
        description: validated.description,
        fields: JSON.stringify(validated.fields), // SQLite stores as JSON string
      },
    })

    // Parse JSON string back to object for API response
    const parsedTemplate = {
      ...template,
      fields: typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields,
    }

    return NextResponse.json(parsedTemplate, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
