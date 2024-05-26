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
import { User } from 'src/modules/authz/user.decorator';
import { RuleslawyerLogger } from 'src/utils/ruleslawyer.logger';

@Controller()
export class GameController {
  ctx: Context;

  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    GameController.name,
  );
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
  async getGame(@Param('id') id: number, @User() user: any) {
    return this.gameService.game(
      {
        id: Number(id),
      },
      this.ctx,
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/copies')
  async getCopies(@Param('id') id: number, @User() user: any) {
    return this.copyService.searchCopies(
      {
        AND: [
          { gameId: Number(id) },
          {
            OR: [
              {
                organization: {
                  OR: [
                    {
                      users: {
                        some: {
                          userId: user.id,
                        },
                      },
                    },
                    {
                      ownerId: user.id,
                    },
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
        ],
      },
      this.ctx,
    );
  }
}
