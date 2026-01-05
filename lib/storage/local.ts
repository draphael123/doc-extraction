import { writeFile, readFile, unlink, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface BlobAdapter {
  upload(file: Buffer, filename: string, contentType?: string): Promise<string>
  getUrl(blobUrl: string): string
  delete(blobUrl: string): Promise<void>
  exists(blobUrl: string): Promise<boolean>
}

export class LocalFileAdapter implements BlobAdapter {
  private storageDir: string

  constructor(storageDir?: string) {
    this.storageDir = storageDir || join(process.cwd(), 'storage', 'files')
    // Ensure storage directory exists
    if (!existsSync(this.storageDir)) {
      mkdir(this.storageDir, { recursive: true }).catch(() => {})
    }
  }

  async upload(file: Buffer, filename: string, contentType?: string): Promise<string> {
    // Create directory structure: storage/files/YYYY/MM/DD/filename
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dirPath = join(this.storageDir, String(year), month, day)
    
    // Ensure directory exists
    await mkdir(dirPath, { recursive: true })
    
    // Create unique filename with timestamp
    const timestamp = Date.now()
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = join(dirPath, `${timestamp}-${sanitized}`)
    
    // Write file
    await writeFile(filePath, file)
    
    // Return relative path as "URL" (we'll serve it via API)
    const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/')
    return `/api/files${relativePath}`
  }

  getUrl(blobUrl: string): string {
    // If it's already a full URL, return it
    if (blobUrl.startsWith('http')) {
      return blobUrl
    }
    // Otherwise, it's a local path - return as-is for API serving
    return blobUrl
  }

  async delete(blobUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const filePath = blobUrl.replace('/api/files', '').replace(/\//g, process.platform === 'win32' ? '\\' : '/')
      const fullPath = join(process.cwd(), filePath)
      
      if (existsSync(fullPath)) {
        await unlink(fullPath)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      // Don't throw - file might not exist
    }
  }

  async exists(blobUrl: string): Promise<boolean> {
    try {
      const filePath = blobUrl.replace('/api/files', '').replace(/\//g, process.platform === 'win32' ? '\\' : '/')
      const fullPath = join(process.cwd(), filePath)
      await access(fullPath)
      return true
    } catch {
      return false
    }
  }
}

