import { Injectable } from '@nestjs/common';
import { Game, Prisma } from '@prisma/client';
import { Context } from '../prisma/context';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';

@Injectable()
export class GameService {
  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    GameService.name,
  );
  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
    ctx: Context,
  ): Promise<Game | null> {
    try {
      this.logger.log(
        `Getting game with where=${JSON.stringify(gameWhereUniqueInput)}`,
      );
      return ctx.prisma.game.findUnique({ where: gameWhereUniqueInput });
    } catch (ex) {
      this.logger.error(
        `Failed to get game with where=${JSON.stringify(
          gameWhereUniqueInput,
        )}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }

  async games(ctx: Context) {
    try {
      this.logger.log(`Getting games`);
      return ctx.prisma.game.findMany();
    } catch (ex) {
      this.logger.error(`Failed to get games, ex=${ex}`);
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
}
