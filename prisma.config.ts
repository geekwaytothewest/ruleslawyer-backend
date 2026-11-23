// Prisma 7 moved connection config out of schema.prisma and into this file.
// It is used by the Prisma CLI (migrate, db, generate). The running app does
// NOT use this — it connects through the pg driver adapter in PrismaService.
//
// Prisma 7 also stopped auto-loading .env, so we load it explicitly here for
// local/CI runs of the CLI. dotenv-expand resolves nested ${VAR} references
// (e.g. DATABASE_URL is composed from POSTGRES_USER/PASSWORD/HOST) — plain
// dotenv passes those through literally. In deployed environments DATABASE_URL
// is already present in the process environment and this is a no-op.
import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
expand(dotenv.config());
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    // Previously declared as `prisma.seed` in package.json (removed in the
    // Prisma 7 migration); seed config lives here now.
    seed: 'node dist/prisma/seed.js',
  },
});
