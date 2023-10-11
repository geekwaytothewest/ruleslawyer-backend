import {
  Body,
  Controller,
  UseGuards,
  Post,
  Put,
  Get,
  Param,
} from '@nestjs/common';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { SuperAdminGuard } from '../../guards/superAdmin/superAdmin.guard';
import { Game, Prisma } from '@prisma/client';
import { GameService } from '../../services/game/game.service';

@Controller()
export class GameController {
  ctx: Context;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly gameService: GameService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async createGame(@Body() game: Prisma.GameCreateInput): Promise<Game | null> {
    return this.gameService.createGame(game, this.ctx);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Put()
  async updateGame(
    @Body()
    params: {
      data: Prisma.GameUpdateInput;
      where: Prisma.GameWhereUniqueInput;
    },
  ): Promise<Game | null> {
    return this.gameService.updateGame(
      {
        data: params.data,
        where: params.where,
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async game(@Param('id') id: string) {
    return this.gameService.game({ id: Number(id) }, this.ctx);
  }
}
