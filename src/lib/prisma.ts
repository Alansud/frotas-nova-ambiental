import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    // PostgreSQL adapter — produção (Render.com, etc.)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require('@prisma/adapter-pg')
    const adapter = new PrismaPg({ connectionString: databaseUrl })
    return new PrismaClient({ adapter })
  } else {
    // SQLite adapter — desenvolvimento local
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const dbPath = databaseUrl.replace(/^file:/, '')
    const resolvedPath = path.isAbsolute(dbPath)
      ? dbPath
      : path.join(process.cwd(), dbPath)
    const adapter = new PrismaBetterSqlite3({ url: `file:${resolvedPath}` })
    return new PrismaClient({ adapter })
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
