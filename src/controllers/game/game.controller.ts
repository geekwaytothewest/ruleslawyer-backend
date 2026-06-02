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
  Header,
  HttpCode,
  StreamableFile,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiAcceptedResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { detectImageMime } from '../../utils/image-mime';
import { gameNameSearchClauses } from '../../utils/game-name-search';
import { GameEntity } from '../../common/entities/game.entity';
import { GameWithCopiesEntity } from '../../common/entities/game-with-copies.entity';
import { CopyWithRelationsEntity } from '../../common/entities/copy-with-relations.entity';
import { PaginatedGamesDto } from './dto/paginated-games.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
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
import { OrganizationBggGuard } from '../../guards/organization/organization-bgg.guard';

// Upper bound on rows returned by the withCopies endpoint, including when the
// client asks for "All". Prevents oversized responses that fail to serialize.
const MAX_GAMES_LIMIT = 1000;

@ApiTags('games')
@ApiBearerAuth('jwt')
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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: GameEntity })
  @Post()
  async createGame(@Body() game: CreateGameDto): Promise<Game | null> {
    return this.gameService.createGame(game, this.ctx);
  }

  @UseGuards(JwtAuthGuard, GameGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: GameEntity })
  @Put(':id')
  async updateGame(
    @Body() data: UpdateGameDto,
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
  @ApiOkResponse({ type: GameWithCopiesEntity })
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
  @ApiOkResponse({ type: GameWithCopiesEntity, isArray: true })
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
  @ApiOkResponse({ type: Number, description: 'Number of copies of the game.' })
  @Get(':id/copyCount')
  async getCopyCount(@Param('id') id: number) {
    return this.gameService.gameCopyCount(this.ctx, id);
  }

  // Public (no JwtAuthGuard): cover art is non-sensitive BGG imagery, and
  // serving it from a dedicated URL lets the frontend lazy-load images via
  // <img src> (which can't attach an Authorization header) instead of inlining
  // the blob into every game JSON payload. The image blob is omitted from all
  // other read paths (see PrismaService), so this is the only route that loads
  // it — and only one image at a time.
  @ApiProduces('image/png', 'image/jpeg', 'image/gif', 'image/webp')
  @ApiOkResponse({
    description: "The game's cover-art image, or 404 if none is set.",
  })
  @Header('Cache-Control', 'public, max-age=86400')
  @Get(':id/cover')
  async getCover(@Param('id') id: number): Promise<StreamableFile> {
    const image = await this.gameService.getCoverArt(Number(id), this.ctx);
    if (!image) {
      throw new NotFoundException(`No cover art set for game ${id}.`);
    }
    return new StreamableFile(image, { type: detectImageMime(image) });
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: PaginatedGamesDto })
  @Get('/withCopies')
  async getGamesWithCopies(
    @User() user: any,
    @Query('limit') limit: string,
    @Query('filter') filter: string,
    @Query('orgId') orgId: string,
    @Query('page') page: string,
  ) {
    const query: Prisma.GameFindManyArgs = {
      include: {
        copies: {
          include: {
            game: true,
            checkOuts: true,
          },
          where: {
            collection: {
              archived: false,
            }
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
                  AND: [
                    {
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
                    {
                      archived: false,
                    }
                  ]
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

    // Always bound the page size. Without a `take`, "All" (or any non-numeric
    // value) makes Prisma fetch every game with its nested copies/checkOuts,
    // producing a payload too large for JSON.stringify to serialize
    // (RangeError: Invalid string length). A numeric limit is clamped to the
    // cap; "All"/invalid falls back to the cap itself.
    const requested = Number(limit);
    const pageSize =
      limit && !Number.isNaN(requested)
        ? Math.min(requested, MAX_GAMES_LIMIT)
        : MAX_GAMES_LIMIT;

    // 1-based page number; anything missing/invalid/below 1 means the first page.
    const requestedPage = Number(page);
    const currentPage =
      page && !Number.isNaN(requestedPage) && requestedPage >= 1
        ? Math.floor(requestedPage)
        : 1;

    query.take = pageSize;
    query.skip = (currentPage - 1) * pageSize;

    if (filter) {
      // AND the name filter onto the existing where so the permission/org
      // scoping above is preserved. Merging into the top-level `OR` instead
      // would overwrite that scoping and search every game globally.
      query.where = {
        AND: [
          query.where!,
          {
            OR: gameNameSearchClauses(filter),
          },
        ],
      };
    }

    const { data, total } = await this.gameService.searchWithCount(
      query,
      this.ctx,
    );

    return {
      data,
      total,
      page: currentPage,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: currentPage * pageSize < total,
    };
  }

  @UseGuards(JwtAuthGuard, GameGuard)
  @ApiOkResponse({ type: GameEntity })
  @Delete(':id')
  async deleteGame(@Param('id') id: number) {
    return this.gameService.deleteGame(id, this.ctx);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: CopyWithRelationsEntity, isArray: true })
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

  @UseGuards(JwtAuthGuard, OrganizationBggGuard, GameGuard)
  @ApiOkResponse({ type: GameEntity })
  @Put(':id/orgId/:orgId/connectBGGByName')
  async connectBGGGameByName(
    @Param('id') id: number,
    @Param('orgId') orgId: number,
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

  @UseGuards(JwtAuthGuard, OrganizationBggGuard, OrganizationWriteGuard)
  @HttpCode(202)
  @ApiAcceptedResponse({
    description: 'Sync started in the background; progress is in the server logs.',
  })
  @Put(':orgId/syncAndConnectGamesWithBGG')
  async syncAndConnectGamesWithBGG(
    @Param('orgId') orgId: number,
    @Body('dumpUrl') dumpUrl?: string,
  ) {
    // Long-running: launch in the background and return 202 immediately so the
    // client (and any proxy) isn't holding a request open for minutes.
    return this.gameService.startSyncAndConnect(Number(orgId), this.ctx, dumpUrl);
  }

  @UseGuards(JwtAuthGuard, OrganizationBggGuard, GameGuard)
  @ApiOkResponse({ type: GameEntity })
  @Put(':id/orgId/:orgId/syncWithBGG')
  async syncBGGGame(
    @Param('id') id: number,
    @Param('orgId') orgId: number,
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

      throw new NotFoundException('Game not found.');
    }

    if (!game.bggId) {
      this.logger.warn(
        `Game with id=${id} does not have a bggId, cannot sync.`,
      );

      throw new BadRequestException(
        'This game has no BoardGameGeek ID to sync.',
      );
    }

    return this.gameService.syncBGGGame(id, this.ctx);
  }
}
