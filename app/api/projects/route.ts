import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_USER_ID } from '@/lib/public-user'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection is working
    await prisma.$connect()
    
    const projects = await prisma.project.findMany({
      where: { userId: PUBLIC_USER_ID },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            documents: true,
            templates: true,
          },
        },
      },
    })

    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection is working
    await prisma.$connect()
    
    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    // Ensure public user exists - handle potential unique constraint on email
    try {
      await prisma.user.upsert({
        where: { id: PUBLIC_USER_ID },
        update: {},
        create: {
          id: PUBLIC_USER_ID,
          email: 'public@example.com',
        },
      })
    } catch (userError: any) {
      // If email unique constraint fails, try without email
      if (userError.code === 'P2002' && userError.meta?.target?.includes('email')) {
        try {
          await prisma.user.upsert({
            where: { id: PUBLIC_USER_ID },
            update: {},
            create: {
              id: PUBLIC_USER_ID,
              // Don't set email if it causes conflict
            },
          })
        } catch (retryError) {
          console.error('Error creating public user (retry):', retryError)
          // Continue anyway - user might already exist
        }
      } else {
        console.error('Error creating public user:', userError)
        // Continue anyway - user might already exist
      }
    }

    // Verify user exists before creating project
    const user = await prisma.user.findUnique({
      where: { id: PUBLIC_USER_ID },
    })

    if (!user) {
      // Last resort: create user without email
      await prisma.user.create({
        data: {
          id: PUBLIC_USER_ID,
        },
      })
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: PUBLIC_USER_ID,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create project'
    
    if (error.code === 'P2002') {
      errorMessage = 'A project with this name already exists'
    } else if (error.code === 'P2003') {
      errorMessage = 'Database constraint violation. Please ensure the public user exists.'
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}
