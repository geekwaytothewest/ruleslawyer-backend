import { Injectable } from '@nestjs/common';
import { Game, Prisma } from '@prisma/client';
import { Context } from '../prisma/context';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import { BoardGameGeekService } from '../boardgamegeek/boardgamegeek.service';

@Injectable()
export class GameService {
  constructor(
    private readonly boardGameGeekService: BoardGameGeekService,
  ) {}

  sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

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
      return ctx.prisma.game.findUnique({
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
      return ctx.prisma.game.findMany({
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
      return ctx.prisma.game.findMany(where);
    } catch (ex) {
      this.logger.error(`Failed to search games, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async createGame(
    data: Prisma.GameCreateInput,
    ctx: Context,
  ): Promise<Game | null> {
    try {
      return ctx.prisma.game.create({ data });
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
      return ctx.prisma.game.update({ data, where });
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

  async bggUpdate(id, gameData, ctx) {
    const imageResponse = gameData?.thumbnail
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
          coverArt: imageResponse as Prisma.Bytes | null,
          lastBGGSync: new Date(),
        },
      });
  }

  async connectBGGGameByName(id: number, name: string, ctx: Context) {
    try {
      this.logger.log(
        `Connecting game with name=${name} from BoardGameGeek API...`,
      );

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

  async syncBGGGame(id: number, name: string, ctx: Context) {
    try {
      this.logger.log(
        `Syncing game with name=${name} from BoardGameGeek API...`,
      );

      const game = await ctx.prisma.game.findUnique({ where: { id: Number(id) } });

      if (!game?.bggId) {
        this.logger.warn(
          `Game with id=${id} does not have a BGG ID. Skipping sync.`,
        );
        return null;
      }

      const gameData = await this.boardGameGeekService.getBoardGameByBGGId(game.bggId) as any;

      return this.bggUpdate(id, gameData, ctx);
    } catch (error: any) {
      this.logger.error(
        `Error syncing game with name=${name} from BoardGameGeek API: ${error.message}`,
      );

      return Promise.reject(error);
    }
  }

  async syncAndConnectGamesWithBGG(orgId: number, ctx: Context) {
    try {
      this.logger.log(
        `Syncing and connecting games with BoardGameGeek API...`,
      );

      const gamesWithBGGId = await ctx.prisma.game.findMany({
        where: { organizationId: orgId, NOT: { bggId: null } },
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
        await this.sleep(1000);
        const gameDataBatch = await this.boardGameGeekService.getBoardGameBatchByBGGIds(batch.map((game) => game.bggId)) as any[];

        for (const game of batch) {
          const gameData = gameDataBatch.find((data) => data?.['@_id'] === game.bggId);

          if (gameData) {
            await this.bggUpdate(game.id, gameData, ctx);
          } else {
            this.logger.warn(
              `No boardgame found with bggId=${game.bggId} from BoardGameGeek API for game with id=${game.id}. Skipping sync.`,
            );
          }
        }
      }

      const gamesWithoutBGGId = await ctx.prisma.game.findMany({
        where: { organizationId: orgId, bggId: null },
      });

      for (const game of gamesWithoutBGGId) {
        await this.connectBGGGameByName(game.id, game.name, ctx);
        await this.sleep(1000);
      }
    } catch (error: any) {
      this.logger.error(
        `Error syncing and connecting games with BoardGameGeek API: ${error.message}`,
      );
      return Promise.reject(error);
    }
  }
}