import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeFilename } from '@/lib/utils'
import { put } from '@vercel/blob'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/zip',
]

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const documents = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        continue // Skip oversized files
      }

      // Check MIME type
      const isAllowedType = ALLOWED_TYPES.some((type) => file.type === type || file.type.includes(type.split('/')[1]))
      
      // Also check file extension as fallback (for cases where MIME type might be missing)
      let isAllowedExt = false
      if (file.name) {
        const ext = file.name.split('.').pop()?.toLowerCase()
        const allowedExts = ['pdf', 'docx', 'txt', 'csv', 'zip']
        isAllowedExt = ext ? allowedExts.includes(ext) : false
      }
      
      if (!isAllowedType && !isAllowedExt) {
        continue // Skip disallowed types
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const sanitized = sanitizeFilename(file.name)
      const blobPath = `projects/${params.id}/${Date.now()}-${sanitized}`

      const blob = await put(blobPath, buffer, {
        access: 'public',
        contentType: file.type,
      })

      const document = await prisma.document.create({
        data: {
          projectId: params.id,
          filename: sanitized,
          originalName: file.name,
          blobUrl: blob.url,
          fileSize: file.size,
          mimeType: file.type,
          status: 'PENDING',
        },
      })

      documents.push(document)
    }

    return NextResponse.json({ documents }, { status: 201 })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
