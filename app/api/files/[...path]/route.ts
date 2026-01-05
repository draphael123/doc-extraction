import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the file path
    const filePath = join(process.cwd(), 'storage', 'files', ...params.path)
    
    // Security: Ensure the path is within storage directory
    const storageDir = join(process.cwd(), 'storage', 'files')
    const resolvedPath = join(storageDir, ...params.path)
    
    if (!resolvedPath.startsWith(storageDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
    }
    
    if (!existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    const fileBuffer = await readFile(resolvedPath)
    
    // Determine content type from file extension
    const ext = params.path[params.path.length - 1]?.split('.').pop()?.toLowerCase()
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      csv: 'text/csv',
      zip: 'application/zip',
    }
    
    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream'
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${params.path[params.path.length - 1]}"`,
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}

