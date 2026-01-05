import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_USER_ID } from '@/lib/public-user'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const [totalProjects, totalDocuments, totalTemplates, recentActivity] = await Promise.all([
      prisma.project.count({
        where: { userId: PUBLIC_USER_ID },
      }),
      prisma.document.count({
        where: {
          project: {
            userId: PUBLIC_USER_ID,
          },
        },
      }),
      prisma.extractionTemplate.count({
        where: {
          project: {
            userId: PUBLIC_USER_ID,
          },
        },
      }),
      prisma.document.findMany({
        where: {
          project: {
            userId: PUBLIC_USER_ID,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          originalName: true,
          status: true,
          createdAt: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      }),
    ])

    // Calculate success rate
    const completedDocs = await prisma.document.count({
      where: {
        project: { userId: PUBLIC_USER_ID },
        status: 'COMPLETED',
      },
    })
    const successRate = totalDocuments > 0 ? (completedDocs / totalDocuments) * 100 : 0

    return NextResponse.json({
      totalProjects,
      totalDocuments,
      totalTemplates,
      successRate: Math.round(successRate),
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

