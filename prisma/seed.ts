import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Example seed data - customize as needed
  console.log('Seed script - add your seed data here')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
