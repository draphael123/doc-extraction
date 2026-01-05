import { put, list, head, del } from '@vercel/blob'
import type { PutBlobResult } from '@vercel/blob'

export interface BlobAdapter {
  upload(file: Buffer, filename: string, contentType?: string): Promise<string>
  getUrl(blobUrl: string): string
  delete(blobUrl: string): Promise<void>
  exists(blobUrl: string): Promise<boolean>
}

export class VercelBlobAdapter implements BlobAdapter {
  private token: string

  constructor(token?: string) {
    this.token = token || process.env.VERCEL_BLOB_READ_WRITE_TOKEN || ''
    if (!this.token) {
      throw new Error('VERCEL_BLOB_READ_WRITE_TOKEN is required')
    }
  }

  async upload(file: Buffer, filename: string, contentType?: string): Promise<string> {
    const blob = await put(filename, file, {
      access: 'public',
      contentType,
      token: this.token,
    })
    return blob.url
  }

  getUrl(blobUrl: string): string {
    return blobUrl
  }

  async delete(blobUrl: string): Promise<void> {
    await del(blobUrl, { token: this.token })
  }

  async exists(blobUrl: string): Promise<boolean> {
    try {
      await head(blobUrl, { token: this.token })
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
let blobAdapter: BlobAdapter | null = null

export function getBlobAdapter(): BlobAdapter {
  if (!blobAdapter) {
    blobAdapter = new VercelBlobAdapter()
  }
  return blobAdapter
}
