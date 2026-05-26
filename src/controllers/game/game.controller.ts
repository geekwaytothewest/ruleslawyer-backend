import {
  Body,
  Controller,
  UseGuards,
  Post,
  Put,
  Get,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { SuperAdminGuard } from '../../guards/superAdmin/superAdmin.guard';
import { Game, Prisma } from '@prisma/client';
import { GameService } from '../../services/game/game.service';
import { CopyService } from '../../services/copy/copy.service';
import { User } from '../../modules/authz/user.decorator';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import { GameGuard } from '../../guards/game/game.guard';
import { OrganizationWriteGuard } from '../../guards/organization/organization-write.guard';

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

  @UseGuards(JwtAuthGuard, GameGuard)
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
  @Get()
  async getGames(
    @User() user: any,
    @Query('orgId') orgId: string,
  ) {
    return this.gameService.search(
      {
        include: {
          copies: {
            include: {
              checkOuts: {
                orderBy: {
                  checkOut: 'desc',
                }
              }
            },
            where: {
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
                    AND: [
                      orgId && !Number.isNaN(Number(orgId))
                        ? { id: Number(orgId) }
                        : { id: { in: [] } },
                    ],
                  },
                },
                {
                  collection: {
                    conventions: {
                      some: {
                      convention: {
                        AND: [
                          {
                            users: {
                              some: { userId: user.id },
                            },
                          },
                          orgId && !Number.isNaN(Number(orgId))
                            ? { organizationId: Number(orgId) }
                            : { id: { in: [] } },
                        ],
                      },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
        where: {
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
                AND: [
                  orgId && !Number.isNaN(Number(orgId))
                  ? { id: Number(orgId) }
                  : { id: { in: [] } },
                ],
              },
            },
            {
              copies: {
                some: {
                  collection: {
                    conventions: {
                      some: {
                        convention: {
                          users: {
                            some: {
                              userId: user.id,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        orderBy: {
          name: 'asc',
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/withCopies')
  async getGamesWithCopies(
    @User() user: any,
    @Query('limit') limit: string,
    @Query('filter') filter: string,
    @Query('orgId') orgId: string,
  ) {
    const query: Prisma.GameFindManyArgs = {
      include: {
        copies: {
          include: {
            game: true,
            checkOuts: true,
          },
        },
      },
      where: {
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
              AND: [
                orgId && !Number.isNaN(Number(orgId))
                  ? { id: Number(orgId) }
                  : { id: { in: [] } },
              ],
            },
          },
          {
            copies: {
              some: {
                collection: {
                  conventions: {
                    some: {
                      convention: {
                        AND: [
                          {
                            users: {
                              some: { userId: user.id },
                            },
                          },
                          orgId && !Number.isNaN(Number(orgId))
                            ? { organizationId: Number(orgId) }
                            : { id: { in: [] } },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: {
        name: 'asc',
      },
    };

    if (limit && !Number.isNaN(Number(limit))) {
      query.take = Number(limit);
    }

    if (filter) {
      query.where = {
        ...query.where,
        ...{
          OR: [
            { name: { search: filter.split(' ').join(' <-> ') } },
            { name: { contains: filter, mode: 'insensitive' } },
            { name: { startsWith: filter, mode: 'insensitive' } },
          ],
        },
      };
    }

    return this.gameService.search(query, this.ctx);
  }

  @UseGuards(JwtAuthGuard, GameGuard)
  @Delete(':id')
  async deleteGame(@Param('id') id: number) {
    return this.gameService.deleteGame(id, this.ctx);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/copies')
  async getCopies(
    @Param('id') id: number,
    @Query('orgId') orgId: string,
    @User() user: any
  ) {
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
                  AND: [
                    ...(orgId && !Number.isNaN(Number(orgId))
                      ? [{ id: Number(orgId) }]
                      : []),
                  ],
                },
              },
              {
                collection: {
                  conventions: {
                    some: {
                      convention: {
                        AND: [
                          {
                            users: {
                              some: { userId: user.id },
                            },
                          },
                          orgId && !Number.isNaN(Number(orgId))
                            ? { organizationId: Number(orgId) }
                            : { id: { in: [] } },
                        ],
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

  @UseGuards(JwtAuthGuard, GameGuard)
  @Put(':id/connectBGGByName')
  async connectBGGGameByName(
    @Param('id') id: number,
    @User() user: any,
  ) {
    const game = await this.gameService.game(
      {
        id: Number(id),
      },
      this.ctx,
      user,
    );

    if (!game) {
      this.logger.warn(
        `Game with id=${id} not found.`,
      );
      return null;
    }

    return this.gameService.connectBGGGameByName(id, game.name, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @Put(':orgId/syncAndConnectGamesWithBGG')
  async syncAndConnectGamesWithBGG(
    @Param('orgId') orgId: number,
    @Body('dumpUrl') dumpUrl?: string,
  ) {
    return this.gameService.syncAndConnectGamesWithBGG(
      Number(orgId),
      this.ctx,
      dumpUrl,
    );
  }
}
