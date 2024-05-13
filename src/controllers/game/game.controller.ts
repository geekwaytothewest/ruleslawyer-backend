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
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { SuperAdminGuard } from '../../guards/superAdmin/superAdmin.guard';
import { Game, Prisma } from '@prisma/client';
import { GameService } from '../../services/game/game.service';
import { CopyService } from 'src/services/copy/copy.service';

@Controller()
export class GameController {
  ctx: Context;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly gameService: GameService,
    private readonly copyService: CopyService,
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

  @UseGuards(JwtAuthGuard)
  @Get()
  async getGames() {
    return this.gameService.games(this.ctx);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('/withCopies')
  async getGamesWithCopies() {
    return this.gameService.search({ include: { copies: true } }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Put(':id')
  async updateGame(
    @Body() data: Prisma.GameUpdateInput,
    @Param('id') id: number,
  ): Promise<Game | null> {
    return this.gameService.updateGame(
      {
        data: data,
        where: {
          id: Number(id),
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getGame(@Param('id') id: number) {
    return this.gameService.game({ id: Number(id) }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get(':id/copies')
  async getCopies(@Param('id') id: number) {
    return this.copyService.searchCopies(
      {
        gameId: Number(id),
      },
      this.ctx,
    );
  }
}
