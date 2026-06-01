import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Cover-art image blobs (Game.coverArt, Copy.coverArtOverride) are large
    // Bytes columns stored inline in the database. Omitting them globally keeps
    // every list/read query from pulling image bytes into memory and
    // serializing them into JSON responses — the source of the heavy memory
    // use on the game/copy read paths. The only callers that need the bytes are
    // the dedicated cover-art streaming endpoints, which re-include them with an
    // explicit `select` (which overrides this global omit). Writes are
    // unaffected: omit only changes the shape of read results.
    super({
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
