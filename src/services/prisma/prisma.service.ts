import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Prisma 7 connects through a driver adapter instead of the bundled query
    // engine, so the connection string is read here (same DATABASE_URL the
    // engine used previously) and handed to the pg adapter. The adapter owns
    // its own connection pool; tune/SSL it via this PoolConfig if the deployed
    // Postgres needs it (e.g. ssl, max).
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

    // Cover-art image blobs (Game.coverArt, Copy.coverArtOverride) are large
    // Bytes columns stored inline in the database. Omitting them globally keeps
    // every list/read query from pulling image bytes into memory and
    // serializing them into JSON responses — the source of the heavy memory
    // use on the game/copy read paths. The only callers that need the bytes are
    // the dedicated cover-art streaming endpoints, which re-include them with an
    // explicit `select` (which overrides this global omit). Writes are
    // unaffected: omit only changes the shape of read results.
    super({
      adapter,
      omit: {
        game: { coverArt: true },
        copy: { coverArtOverride: true },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
