const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  console.log('DATABASE_URL prefix:', databaseUrl ? databaseUrl.substring(0, 15) + '...' : 'NOT SET')
  
  let prisma
  if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
    const adapter = new PrismaPg({ connectionString: databaseUrl })
    prisma = new PrismaClient({ adapter })
  } else {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl || 'file:./prisma/dev.db' })
    prisma = new PrismaClient({ adapter })
  }

  const email = process.env.ADMIN_EMAIL || 'admin@novaambiental.com.br'
  const password = process.env.ADMIN_PASSWORD || 'Nova@2024'
  const hash = await bcrypt.hash(password, 12)

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash },
  })

  console.log('Admin criado/atualizado:', admin.email)
  await prisma.$disconnect()
}

main().catch(e => { console.error('Seed error:', e); process.exit(1) })
