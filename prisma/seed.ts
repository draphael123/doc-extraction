import { PrismaClient } from '@prisma/client'
import { PUBLIC_USER_ID } from '../lib/public-user'

const prisma = new PrismaClient()

async function main() {
  // Create public user for unauthenticated access
  console.log('Creating public user...')
  
  try {
    await prisma.user.upsert({
      where: { id: PUBLIC_USER_ID },
      update: {},
      create: {
        id: PUBLIC_USER_ID,
        email: 'public@example.com',
      },
    })
    console.log('✓ Public user created successfully')
  } catch (error) {
    console.error('Error creating public user:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
