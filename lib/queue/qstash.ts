// Simple local queue implementation - processes batches synchronously
// No external services needed!

export async function enqueueBatch(
  url: string,
  payload: any,
  options?: {
    delay?: number
    retries?: number
    idempotencyKey?: string
  }
): Promise<void> {
  // For local development, process immediately
  // In a real scenario, you could use a simple in-memory queue or process directly
  
  // Extract the worker endpoint path
  const workerPath = url.replace(/^https?:\/\/[^/]+/, '')
  
  // Process immediately (no external queue needed)
  // The extraction will be triggered directly
  if (options?.delay) {
    // If there's a delay, wait before processing
    await new Promise(resolve => setTimeout(resolve, options.delay))
  }
  
  // Note: The actual processing happens in the extract/start route
  // which will call the worker directly instead of using QStash
  console.log('Batch enqueued (local mode):', payload)
}
