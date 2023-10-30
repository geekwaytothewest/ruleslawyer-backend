import { Injectable } from '@nestjs/common';
import { Game, Prisma } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class GameService {
  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
    ctx: Context,
  ): Promise<Game | null> {
    return ctx.prisma.game.findUnique({ where: gameWhereUniqueInput });
  }

  async games(ctx: Context) {
    return ctx.prisma.game.findMany();
  }

  async createGame(
    data: Prisma.GameCreateInput,
    ctx: Context,
  ): Promise<Game | null> {
    return ctx.prisma.game.create({ data });
  }

  async updateGame(
    params: {
      where: Prisma.GameWhereUniqueInput;
      data: Prisma.GameUpdateInput;
    },
    ctx: Context,
  ) {
    const { where, data } = params;
    return ctx.prisma.game.update({ data, where });
  }
}
