import { Client } from '@upstash/qstash'

let qstashClient: Client | null = null

export function getQStashClient(): Client {
  if (!qstashClient) {
    const token = process.env.QSTASH_TOKEN
    if (!token) {
      throw new Error('QSTASH_TOKEN is required')
    }
    qstashClient = new Client({ token })
  }
  return qstashClient
}

export async function enqueueBatch(
  url: string,
  payload: any,
  options?: {
    delay?: number
    retries?: number
    idempotencyKey?: string
  }
): Promise<void> {
  const client = getQStashClient()
  
  await client.publishJSON({
    url,
    body: payload,
    delay: options?.delay,
    retries: options?.retries || 3,
    headers: {
      'X-Worker-Secret': process.env.WORKER_SECRET || '',
      'Idempotency-Key': options?.idempotencyKey || `${Date.now()}-${Math.random()}`,
    },
  })
}
