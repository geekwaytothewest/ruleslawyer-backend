// Prisma 7 connects through a driver adapter instead of a bundled engine, so
// the seed (run via `node dist/prisma/seed.js`) must construct PrismaClient with
// the pg adapter, just like PrismaService does. dotenv is loaded here so
// DATABASE_URL is available when the script is run directly.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
