import { PrismaClient } from '@prisma/client'
import { join } from 'path'
import { existsSync } from 'fs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is set (fallback for local development)
if (!process.env.DATABASE_URL) {
  // Use absolute path to avoid path resolution issues
  const dbPath = join(process.cwd(), 'dev.db')
  process.env.DATABASE_URL = `file:${dbPath}`
  
  // Ensure database file exists (SQLite needs the file to exist or be creatable)
  if (!existsSync(dbPath)) {
    // Create empty file - SQLite will initialize it
    const fs = require('fs')
    fs.writeFileSync(dbPath, '')
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
