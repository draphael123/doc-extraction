import { LocalFileAdapter, type BlobAdapter } from './local'

// Singleton instance
let blobAdapter: BlobAdapter | null = null

export function getBlobAdapter(): BlobAdapter {
  if (!blobAdapter) {
    // Use local file storage by default (no external services needed)
    blobAdapter = new LocalFileAdapter()
  }
  return blobAdapter
}

// Export the interface and adapter for potential future use
export type { BlobAdapter }
export { LocalFileAdapter }
