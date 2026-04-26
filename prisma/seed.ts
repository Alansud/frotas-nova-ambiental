import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import path from 'path'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

function createClient() {
  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    const { PrismaPg } = require('@prisma/adapter-pg')
    const adapter = new PrismaPg({ connectionString: databaseUrl })
    return new PrismaClient({ adapter })
  } else {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const dbPath = databaseUrl.replace(/^file:/, '')
    const resolvedPath = path.isAbsolute(dbPath)
      ? dbPath
      : path.join(process.cwd(), dbPath)
    const adapter = new PrismaBetterSqlite3({ url: `file:${resolvedPath}` })
    return new PrismaClient({ adapter })
  }
}

const prisma = createClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@novaambiental.com.br'
  const password = process.env.ADMIN_PASSWORD || 'Nova@2024'
  const hash = await bcrypt.hash(password, 12)

  await prisma.admin.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash },
  })

  console.log(`Admin criado/atualizado: ${email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
