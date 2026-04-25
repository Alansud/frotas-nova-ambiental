import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import 'dotenv/config'

const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
const dbPath = dbUrl.replace(/^file:/, '')
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(process.cwd(), dbPath)

const adapter = new PrismaBetterSqlite3({ url: `file:${resolvedPath}` })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

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
