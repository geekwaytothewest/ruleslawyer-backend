import { ConflictException, Injectable } from '@nestjs/common';
import { Game, Prisma } from '@prisma/client';
import { Context } from '../prisma/context';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import {
  BoardGameGeekService,
  normalizeBggName,
} from '../boardgamegeek/boardgamegeek.service';

@Injectable()
export class GameService {
  constructor(
    private readonly boardGameGeekService: BoardGameGeekService,
  ) {}

  sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  // Guards against overlapping bulk syncs (one per process).
  private syncInProgress = false;

  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    GameService.name,
  );
  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
    ctx: Context,
    user: any,
  ): Promise<Game | null> {
    try {
      this.logger.log(
        `Getting game with where=${JSON.stringify(gameWhereUniqueInput)}`,
      );
      return await ctx.prisma.game.findUnique({
        where: gameWhereUniqueInput,
        include: {
          copies: {
            include: {
              checkOuts: true,
              game: true,
            },
            where: {
              OR: [
                {
                  organization: {
                    OR: [
                      {
                        users: {
                          some: { userId: user.id },
                        },
                      },
                      { ownerId: user.id },
                    ],
                  },
                },
                {
                  collection: {
                    AND: [
                      {
                        conventions: {
                          some: {
                            convention: {
                              users: {
                                some: { userId: user.id },
                              },
                            },
                          },
                        },
                      },
                      {
                        archived: false,
                      }
                    ]
                  },
                },
              ],
            },
          },
        },
      });
    } catch (ex) {
      this.logger.error(
        `Failed to get game with where=${JSON.stringify(
          gameWhereUniqueInput,
        )}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }

  async games(orgId: number, ctx: Context) {
    try {
      this.logger.log(`Getting games`);
      return await ctx.prisma.game.findMany({
        where: { organizationId: Number(orgId) },
        orderBy: { name: 'asc' },
      });
    } catch (ex) {
      this.logger.error(`Failed to get games, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async search(where: Prisma.GameFindManyArgs, ctx: Context) {
    try {
      this.logger.log(`Searching games`);
      return await ctx.prisma.game.findMany(where);
    } catch (ex) {
      this.logger.error(`Failed to search games, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  /**
   * Like {@link search}, but also returns the total number of games matching
   * the query's `where` clause (ignoring `take`/`skip`) so callers can build
   * pagination metadata. The list and count run in a single transaction for a
   * consistent snapshot.
   */
  async searchWithCount(query: Prisma.GameFindManyArgs, ctx: Context) {
    try {
      this.logger.log(`Searching games (paginated)`);
      const [data, total] = await ctx.prisma.$transaction([
        ctx.prisma.game.findMany(query),
        ctx.prisma.game.count({ where: query.where }),
      ]);
      return { data, total };
    } catch (ex) {
      this.logger.error(`Failed to search games (paginated), ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async createGame(
    data: Prisma.GameCreateInput,
    ctx: Context,
  ): Promise<Game | null> {
    try {
      return await ctx.prisma.game.create({ data });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async updateGame(
    params: {
      where: Prisma.GameWhereUniqueInput;
      data: Prisma.GameUpdateInput;
    },
    ctx: Context,
  ) {
    const { where, data } = params;

    try {
      this.logger.log(
        `Updating game with where=${JSON.stringify(
          where,
        )}, data=${JSON.stringify(data)}`,
      );

      return await ctx.prisma.game.update({ data, where });
    } catch (ex) {
      this.logger.error(
        `Failed to update game with where=${JSON.stringify(
          where,
        )}, data=${JSON.stringify(data)}, ex=${ex}`,
      );

      return Promise.reject(ex);
    }
  }

  async deleteGame(id: number, ctx: Context) {
    return ctx.prisma.game.delete({ where: { id: Number(id) } });
  }

  async bggUpdate(id, gameData, ctx, deferImage = false) {
    // When deferImage is true, the (slow) thumbnail download is skipped and
    // coverArt is left untouched, so a caller can fetch images separately with
    // bounded concurrency. Otherwise behaves as before (inline download).
    const imageResponse = !deferImage && gameData?.thumbnail
      ? await this.boardGameGeekService.getImage(gameData.thumbnail)
      : null;

    return ctx.prisma.game.update({
        where: { id: Number(id) },
        data: {
          bggId: gameData?.['@_id'] ? parseInt(gameData['@_id']) : null,
          minPlayers: gameData?.minplayers?.['@_value'] ? parseInt(gameData.minplayers['@_value']) : null,
          maxPlayers: gameData?.maxplayers?.['@_value'] ? parseInt(gameData.maxplayers['@_value']) : null,
          minTime: gameData?.minplaytime?.['@_value'] ? parseInt(gameData.minplaytime['@_value']) : null,
          maxTime: gameData?.maxplaytime?.['@_value'] ? parseInt(gameData.maxplaytime['@_value']) : null,
          longDescription: gameData?.description ?? null,
          publisher: gameData?.link?.filter((link: { '@_type': string; '@_value': string }) => link['@_type'] === 'boardgamepublisher').map((link: { '@_type': string; '@_value': string }) => link['@_value']).join(', ') || null,
          designer: gameData?.link?.filter((link: { '@_type': string; '@_value': string }) => link['@_type'] === 'boardgamedesigner').map((link: { '@_type': string; '@_value': string }) => link['@_value']).join(', ') || null,
          artist: gameData?.link?.filter((link: { '@_type': string; '@_value': string }) => link['@_type'] === 'boardgameartist').map((link: { '@_type': string; '@_value': string }) => link['@_value']).join(', ') || null,
          minAge: gameData?.minage?.['@_value'] ? parseInt(gameData.minage['@_value']) : null,
          weight: gameData?.statistics?.ratings?.averageweight?.['@_value'] ? parseFloat(gameData.statistics.ratings.averageweight['@_value']) : null,
          coverArt: deferImage ? undefined : (imageResponse as Prisma.Bytes | null),
          bggRank: (() => {
            const ranks = gameData?.statistics?.ratings?.ranks?.rank;
            if (!ranks) return undefined;

            // Fastxml-parser can return a single object or an array. Force an array format.
            const ranksArray = Array.isArray(ranks) ? ranks : [ranks];
            const boardgameRank = ranksArray.find((r: any) => r['@_name'] === 'boardgame')?.['@_value'];

            return boardgameRank && boardgameRank !== 'Not Ranked' ? parseInt(boardgameRank) : undefined;
          })(),
          bggRating:  gameData?.statistics?.ratings?.average?.['@_value']
            ? parseFloat(gameData.statistics.ratings.average['@_value'])
            : undefined,
          lastBGGSync: new Date(),
        },
      });
  }

  /**
   * Worker that drains the shared cover-art queue until the producer (the batch
   * loop) signals completion and the queue is empty. Several of these run
   * concurrently for bounded parallelism. Thumbnails come from the image CDN,
   * not the rate-limited xmlapi2, so these run alongside the BGG API loop.
   */
  private async drainCoverArtQueue(
    queue: { id: number; thumbnail: string }[],
    isProducerDone: () => boolean,
    ctx: Context,
  ) {
    while (!isProducerDone() || queue.length > 0) {
      const job = queue.shift();
      if (!job) {
        // Producer hasn't queued anything yet; wait briefly and re-check.
        await this.sleep(100);
        continue;
      }

      const image = await this.boardGameGeekService.getImage(job.thumbnail);
      if (image) {
        await ctx.prisma.game.update({
          where: { id: job.id },
          data: { coverArt: image as Prisma.Bytes },
        });
      }
    }
  }

  async connectBGGGameByName(id: number, name: string, ctx: Context) {
    try {
      this.logger.log(
        `Connecting game with name=${name} from BoardGameGeek API...`,
      );

      name = normalizeBggName(name);

      const game = await this.boardGameGeekService.getBoardGameIdByName(name);

      if (!game) {
        this.logger.warn(
          `No boardgame found with name=${name} from BoardGameGeek API.`,
        );
        return null;
      }

      const gameData = await this.boardGameGeekService.getBoardGameByBGGId(game) as any;

      return this.bggUpdate(id, gameData, ctx);
    } catch (error: any) {
      this.logger.error(
        `Error connecting game with name=${name} from BoardGameGeek API: ${error.message}`,
      );
      return Promise.reject(error);
    }
  }

  async syncBGGGame(id: number, ctx: Context) {
    try {
      this.logger.log(
        `Syncing game with id=${id} from BoardGameGeek API...`,
      );

      const game = await ctx.prisma.game.findUnique({ where: { id: Number(id) } });

      if (!game?.bggId) {
        this.logger.warn(
          `Game with id=${id} does not have a BGG ID. Skipping sync.`,
        );
        return null;
      }

      this.logger.log(
        `Syncing game with name=${game.name} from BoardGameGeek API...`,
      );

      const gameData = await this.boardGameGeekService.getBoardGameByBGGId(game.bggId) as any;

      return this.bggUpdate(id, gameData, ctx);
    } catch (error: any) {
      this.logger.error(
        `Error syncing game with id=${id} from BoardGameGeek API: ${error.message}`,
      );

      return Promise.reject(error);
    }
  }

  /**
   * Resolves bggIds for games that lack one by matching their names against the
   * BGG rank data dump locally, avoiding a per-game search API call. `dumpUrl`
   * is the signed, expiring download link from boardgamegeek.com/data_dumps/bg_ranks.
   * Returns the number of games newly matched.
   */
  async backfillBggIdsFromRankDump(
    orgId: number,
    ctx: Context,
    dumpUrl: string,
  ): Promise<number> {
    // Select only the columns this loop reads — avoids loading coverArt /
    // coverArtOverride (Bytes) and longDescription for every game at once.
    const games = await ctx.prisma.game.findMany({
      where: { organizationId: orgId, bggId: null },
      select: { id: true, name: true, yearPublished: true },
    });

    if (games.length === 0) {
      return 0;
    }

    const index = await this.boardGameGeekService.getRankDumpIndex(dumpUrl);

    let matched = 0;
    let ambiguous = 0;
    let unmatched = 0;

    for (const game of games) {
      const candidates = index.get(normalizeBggName(game.name));

      if (!candidates?.length) {
        unmatched++;
        continue;
      }

      let chosen = candidates[0];
      if (candidates.length > 1) {
        // Prefer a candidate whose year matches; among the pool, pick the most
        // popular (lowest rank number), treating unranked entries as least preferred.
        const byYear = game.yearPublished
          ? candidates.filter((c) => c.year === game.yearPublished)
          : [];
        const pool = byYear.length ? byYear : candidates;

        chosen = pool.reduce((best, c) => {
          if (c.rank == null) return best;
          if (best.rank == null) return c;
          return c.rank < best.rank ? c : best;
        }, pool[0]);

        ambiguous++;
        this.logger.warn(
          `Ambiguous rank-dump match for "${game.name}" (${candidates.length} candidates); chose bggId=${chosen.id}.`,
        );
      }

      await ctx.prisma.game.update({
        where: { id: game.id },
        data: { bggId: chosen.id },
      });
      matched++;
    }

    this.logger.log(
      `Rank-dump resolution: matched=${matched} (ambiguous=${ambiguous}), unmatched=${unmatched} of ${games.length}.`,
    );

    return matched;
  }

  /**
   * Launches syncAndConnectGamesWithBGG in the background and returns at once,
   * so a multi-minute run doesn't hold the HTTP request open (which trips client
   * IPC / proxy idle timeouts). Progress is visible in the server logs. A second
   * call while a sync is already running is rejected with 409.
   */
  startSyncAndConnect(orgId: number, ctx: Context, dumpUrl?: string) {
    if (this.syncInProgress) {
      throw new ConflictException(
        'A BGG sync is already running; wait for it to finish (watch the server logs).',
      );
    }

    this.syncInProgress = true;
    this.logger.log('BGG sync started in the background.');

    // Fire-and-forget: do NOT await. Errors are logged; the flag always clears.
    void this.syncAndConnectGamesWithBGG(orgId, ctx, dumpUrl)
      .catch((error: any) =>
        this.logger.error(`Background BGG sync failed: ${error.message}`),
      )
      .finally(() => {
        this.syncInProgress = false;
        this.logger.log('BGG sync finished.');
      });

    return {
      status: 'started',
      message: 'BGG sync started; monitor the server logs for progress.',
    };
  }

  async syncAndConnectGamesWithBGG(
    orgId: number,
    ctx: Context,
    dumpUrl?: string,
  ) {
    // Cover thumbnails are deferred during the batch loop and downloaded by a
    // pool of workers running concurrently with it. Thumbnails come from the
    // image CDN, not the rate-limited xmlapi2, so this overlaps cleanly and
    // hides the image phase behind the throttled API loop. These are hoisted
    // above the try so the finally can always signal completion and await the
    // workers — otherwise an error mid-run would leave them polling forever.
    const imageQueue: { id: number; thumbnail: string }[] = [];
    let producerDone = false;
    let coverArtWorkers: Promise<void>[] = [];

    try {
      this.logger.log(
        `Syncing and connecting games with BoardGameGeek API...`,
      );

      // Start each run from the baseline pace; the throttle adapts upward if
      // BGG starts returning 429s during this run.
      this.boardGameGeekService.resetThrottle();

      // Resolve missing bggIds locally from the rank dump first, so the work
      // below collapses into the fast batch path instead of per-game searches.
      if (dumpUrl) {
        await this.backfillBggIdsFromRankDump(orgId, ctx, dumpUrl);
      }

      const COVER_ART_CONCURRENCY = 15;
      coverArtWorkers = Array.from({ length: COVER_ART_CONCURRENCY }, () =>
        this.drainCoverArtQueue(imageQueue, () => producerDone, ctx),
      );

      // The batch loop only needs id (for bggUpdate) and bggId (for the request
      // + match). Skip coverArt/coverArtOverride (Bytes) and longDescription,
      // which would otherwise load every game's image blob into memory at once.
      const gamesWithBGGId = await ctx.prisma.game.findMany({
        where: { organizationId: orgId, NOT: { bggId: null } },
        select: { id: true, bggId: true },
      });

      const batches = gamesWithBGGId.reduce((resultArray: any[], item, index) => {
        const chunkIndex = Math.floor(index / 20);

        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = [];
        }

        resultArray[chunkIndex].push(item);
        return resultArray;
      }, []);

      for (const batch of batches) {
        // Adaptive pace: baseline 2s, raised automatically if BGG 429s mid-run.
        await this.sleep(this.boardGameGeekService.throttleDelayMs);

        const gameDataBatch = await this.boardGameGeekService.getBoardGameBatchByBGGIds(batch.map((game) => game.bggId)) as any[];

        // Persist the batch's games in parallel; each is an independent DB write.
        await Promise.all(
          batch.map(async (game: { id: number; bggId: number }) => {
            const gameData = gameDataBatch.find((data) => parseInt(data?.['@_id']) === game.bggId);

            if (gameData) {
              await this.bggUpdate(game.id, gameData, ctx, true);

              if (gameData?.thumbnail) {
                imageQueue.push({ id: game.id, thumbnail: gameData.thumbnail });
              }
            } else {
              this.logger.warn(
                `No boardgame found with bggId=${game.bggId} from BoardGameGeek API for game with id=${game.id}. Skipping sync.`,
              );
            }
          }),
        );
      }

      // Games still without a bggId could not be matched by the rank dump
      // (unranked/obscure titles, or no dumpUrl was supplied). This route does
      // NOT fall back to per-game BGG search — connect those individually via
      // the single-game connectBGGByName endpoint.
      const unresolved = await ctx.prisma.game.count({
        where: { organizationId: orgId, bggId: null },
      });

      if (unresolved > 0) {
        this.logger.log(
          `${unresolved} game(s) have no bggId after the rank dump${dumpUrl ? '' : ' (no dumpUrl was supplied)'} and were left unconnected; use the single-game connect endpoint for those.`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Error syncing and connecting games with BoardGameGeek API: ${error.message}`,
      );
      return Promise.reject(error);
    } finally {
      // Signal the workers no more jobs are coming and wait for the queue to
      // drain. Runs on both success and error so the workers always terminate.
      producerDone = true;
      await Promise.all(coverArtWorkers);
    }
  }

  /**
   * Fetches just a game's cover-art bytes for the streaming image endpoint. The
   * explicit `select` overrides the global `omit` of coverArt configured in
   * PrismaService, so this is the one read path that loads the blob.
   */
  async getCoverArt(id: number, ctx: Context): Promise<Buffer | null> {
    const game = await ctx.prisma.game.findUnique({
      where: { id: Number(id) },
      select: { coverArt: true },
    });
    return game?.coverArt ? Buffer.from(game.coverArt) : null;
  }

  async gameCopyCount(ctx: Context, gameId: number): Promise<number> {
    try {
      this.logger.log(`Getting copy count for gameId=${gameId}...`);

      const count = await ctx.prisma.copy.count({
        where: { gameId: Number(gameId) },
      });

      this.logger.log(`Copy count for gameId=${gameId}: ${count}`);

      return count;
    } catch (error: any) {
      this.logger.error(
        `Error getting copy count for gameId=${gameId}: ${error.message}`,
      );
      return Promise.reject(error);
    }
  }
}