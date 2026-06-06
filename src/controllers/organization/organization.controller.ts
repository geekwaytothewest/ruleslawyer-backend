import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import {
  Collection,
  Convention,
  ConventionType,
  Organization,
  Prisma,
} from '@prisma/client';
import { OrganizationEntity } from '../../common/entities/organization.entity';
import { ConventionEntity } from '../../common/entities/convention.entity';
import { ConventionWithTypeEntity } from '../../common/entities/convention-with-type.entity';
import { ConventionTypeEntity } from '../../common/entities/convention-type.entity';
import { CollectionEntity } from '../../common/entities/collection.entity';
import { CopyEntity } from '../../common/entities/copy.entity';
import { CheckOutEntity } from '../../common/entities/check-out.entity';
import { GameEntity } from '../../common/entities/game.entity';
import { GameWithCopiesEntity } from '../../common/entities/game-with-copies.entity';
import { CollectionWithRelationsEntity } from '../../common/entities/collection-with-relations.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateConventionForOrgDto } from './dto/create-convention-for-org.dto';
import { CreateConventionTypeDto } from './dto/create-convention-type.dto';
import { SubmitPrizeEntryPlayerDto } from './dto/submit-prize-entry-player.dto';
import { CreateCopyDto } from '../copy/dto/create-copy.dto';
import { CreateCollectionDto } from '../collection/dto/create-collection.dto';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionService } from '../../services/convention/convention.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { ConventionTypeGuard } from '../../guards/convention-type/convention-type.guard';
import { OrganizationReadGuard } from '../../guards/organization/organization-read.guard';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import fastify = require('fastify');
import { UploadGuard } from '../../guards/upload/upload.guard';
import { CollectionService } from '../../services/collection/collection.service';
import { CollectionWriteGuard } from '../../guards/collection/collection-write.guard';
import { CopyService } from '../../services/copy/copy.service';
import { CheckOutService } from '../../services/check-out/check-out.service';
import { CheckOutGuard } from '../../guards/check-out/check-out.guard';
import { ConventionTypeService } from '../../services/convention-type/convention-type.service';
import { User } from '../../modules/authz/user.decorator';
import { GameService } from '../../services/game/game.service';
import { SuperAdminGuard } from '../../guards/superAdmin/superAdmin.guard';
import { OrganizationAdminGuard } from '../../guards/organization/organization-admin.guard';

@ApiTags('organizations')
@ApiBearerAuth('jwt')
@Controller()
export class OrganizationController {
  ctx: Context;

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly conventionService: ConventionService,
    private readonly prismaService: PrismaService,
    private readonly collectionService: CollectionService,
    private readonly copyService: CopyService,
    private readonly checkOutService: CheckOutService,
    private readonly conventionTypeService: ConventionTypeService,
    private readonly gameService: GameService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: OrganizationEntity })
  @Post()
  async createOrganization(
    @Body() organizationData: CreateOrganizationDto,
    @Req() request: Request,
  ): Promise<Organization> {
    const ownerId = request['user'].user.id;
    return this.organizationService.createOrganization(
      organizationData.name,
      ownerId,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @ApiOkResponse({ type: OrganizationEntity })
  @Get(':id')
  async organization(@Param('id') id: number): Promise<Organization | null> {
    return this.organizationService.organization({ id: Number(id) }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: ConventionEntity })
  @Post(':id/con')
  async createConvention(
    @Body() conventionData: CreateConventionForOrgDto,
    @Param('id') id: number,
  ): Promise<Convention> {
    const data: Prisma.ConventionCreateInput = {
      ...conventionData,
      organization: {
        connect: {
          id: Number(id),
        },
      },
    };

    return this.conventionService.createConvention(data, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationAdminGuard, UploadGuard)
  @ApiOkResponse({
    type: CopyEntity,
    isArray: true,
    description: 'The copies created from the imported collection file.',
  })
  @Post(':id/col')
  async importCollection(
    @Req() request: fastify.FastifyRequest,
    @Param('id') id: number,
  ) {
    const file = await request.file();
    const buffer = await file?.toBuffer();

    if (buffer === undefined) {
      return Promise.reject('missing file');
    }

    const fields = file?.fields as any;

    return this.collectionService.importCollection(
      id,
      fields,
      buffer,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationAdminGuard, CollectionWriteGuard)
  @ApiOkResponse({
    description:
      'The deleted collection, or a message explaining why it could not be deleted (e.g. tied to a convention).',
  })
  @Delete(':id/col/:colId')
  async deleteCollection(
    @Param('id') id: number,
    @Param('colId') colId: number,
  ) {
    return await this.collectionService.deleteCollection(colId, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationAdminGuard, CollectionWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CopyEntity })
  @Post(':id/col/:colId/copy')
  async createCopy(
    @Param('id') id: number,
    @Param('colId') colId: number,
    @Body() copyData: CreateCopyDto,
  ) {
    const data: Prisma.CopyCreateInput = {
      ...copyData,
      collection: {
        connect: {
          id: Number(colId),
        },
      },
      organization: {
        connect: {
          id: Number(id),
        },
      },
      dateAdded: new Date(),
    };

    return await this.copyService.createCopy(data, this.ctx);
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @ApiOkResponse({ type: CheckOutEntity })
  @Post(':id/con/:conId/col/:colId/copy/:copyBarcode/checkOut/:attendeeBarcode')
  async checkOutCopy(
    @Param('id') id: number,
    @Param('conId') conId: number,
    @Param('colId') colId: number,
    @Param('copyBarcode') copyBarcode: string,
    @Param('attendeeBarcode') attendeeBarcode: string,
    @User() user: any,
  ) {
    return await this.checkOutService.checkOut(
      Number(colId),
      copyBarcode,
      Number(id),
      attendeeBarcode,
      false,
      this.ctx,
      user,
    );
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @ApiOkResponse({ type: CheckOutEntity })
  @Post(':id/con/:conId/col/:colId/copy/:copyBarcode/checkIn')
  async checkInCopy(
    @Param('id') id: number,
    @Param('conId') conId: number,
    @Param('colId') colId: number,
    @Param('copyBarcode') copyBarcode: string,
  ) {
    return await this.checkOutService.checkIn(colId, copyBarcode, this.ctx);
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @ApiOkResponse({ type: CheckOutEntity })
  @Post(':id/con/:conId/col/:colId/checkOut/:checkOutId')
  async submitPrizeEntry(
    @Param('id') id: number,
    @Param('conId') conId: number,
    @Param('colId') colId: number,
    @Param('checkOutId') checkOutId: number,
    @Body(
      new ParseArrayPipe({
        items: SubmitPrizeEntryPlayerDto,
        whitelist: true,
      }),
    )
    players: SubmitPrizeEntryPlayerDto[],
  ) {
    return await this.checkOutService.submitPrizeEntry(
      checkOutId,
      // checkOutId is filled in by the service from the route param.
      players as Prisma.PlayerCreateManyInput[],
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: ConventionTypeEntity })
  @Post(':id/conventionType')
  async createConventionType(
    @Param('id') id: number,
    @Body() conventionTypeData: CreateConventionTypeDto,
  ): Promise<ConventionType | void> {
    const data: Prisma.ConventionTypeCreateInput = {
      ...conventionTypeData,
      organization: {
        connect: {
          id: Number(id),
        },
      },
    };

    return this.conventionTypeService.createConventionType(data, this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionTypeGuard)
  @ApiOkResponse({ type: ConventionTypeEntity, isArray: true })
  @Get(':id/conventionTypes')
  async getConventionTypes(
    @Param('id') id: number,
  ): Promise<ConventionType[] | void> {
    return this.conventionTypeService.conventionTypes(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @ApiOkResponse({ type: ConventionWithTypeEntity, isArray: true })
  @Get(':id/conventions')
  async getConventions(@Param('id') id: number): Promise<Convention[] | void> {
    return this.conventionService.conventionsByOrg(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @ApiOkResponse({ type: CollectionWithRelationsEntity, isArray: true })
  @Get(':id/collections')
  async getCollections(@Param('id') id: number): Promise<Collection[] | void> {
    return this.collectionService.collectionsByOrg(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @ApiOkResponse({ type: GameEntity, isArray: true })
  @Get(':id/games')
  async getGames(@Param('id') id: number) {
    return this.gameService.games(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @ApiOkResponse({ type: GameWithCopiesEntity, isArray: true })
  @Get(':id/games/withCopies')
  async getGamesWithCopies(@Param('id') id: number, @User() user: any) {
    return this.gameService.search(
      {
        where: {
          organizationId: Number(id),
        },
        include: {
          copies: {
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
                  },
                },
                {
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
              ],
            },
            include: {
              checkOuts: true,
              game: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @ApiOkResponse({ type: GameEntity, isArray: true })
  @Get(':id/games/search/:gameName')
  async searchGames(@Param('gameName') gameName: string) {
    return this.gameService.search(
      {
        where: { name: { contains: gameName, mode: 'insensitive' } },
        orderBy: { name: 'asc' },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @ApiOkResponse({
    description: 'Up to 10 id/name pairs for autocomplete.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 42 },
          name: { type: 'string', example: 'Wingspan' },
        },
      },
    },
  })
  @Get(':id/games/autocomplete/:gameName')
  async autocompleteGames(@Param('gameName') gameName: string) {
    return this.gameService.search(
      {
        select: { name: true, id: true },
        where: { name: { contains: gameName, mode: 'insensitive' } },
        orderBy: { name: 'asc' },
        take: 10,
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CollectionEntity })
  @Post(':id/collections')
  async createCollection(
    @Param('id') id: number,
    @Body() collectionData: CreateCollectionDto,
  ) {
    return this.collectionService.createCollection(
      id,
      undefined,
      collectionData.name,
      collectionData.allowWinning,
      this.ctx,
    );
  }
}
