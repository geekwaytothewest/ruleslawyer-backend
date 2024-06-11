import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  Collection,
  Convention,
  ConventionType,
  Organization,
  Prisma,
} from '@prisma/client';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionService } from '../../services/convention/convention.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { OrganizationWriteGuard } from '../../guards/organization/organization-write.guard';
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
import { SuperAdminGuard } from 'src/guards/superAdmin/superAdmin.guard';

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
  @Post()
  async createOrganization(
    @Body() organizationData: { name: string },
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
  @Get(':id')
  async organization(@Param('id') id: number): Promise<Organization | null> {
    return this.organizationService.organization({ id: Number(id) }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @Post(':id/con')
  async createConvention(
    @Body() conventionData: Prisma.ConventionCreateInput,
    @Param('id') id: number,
  ): Promise<Convention> {
    conventionData.organization = {
      connect: {
        id: Number(id),
      },
    };

    return this.conventionService.createConvention(conventionData, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard, UploadGuard)
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

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard, CollectionWriteGuard)
  @Delete(':id/col/:colId')
  async deleteCollection(
    @Param('id') id: number,
    @Param('colId') colId: number,
  ) {
    return await this.collectionService.deleteCollection(colId, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard, CollectionWriteGuard)
  @Post(':id/col/:colId/copy')
  async createCopy(
    @Param('id') id: number,
    @Param('colId') colId: number,
    @Body() data: Prisma.CopyCreateInput,
  ) {
    data.collection = {
      connect: {
        id: Number(colId),
      },
    };

    data.organization = {
      connect: {
        id: Number(id),
      },
    };

    data.dateAdded = new Date();

    return await this.copyService.createCopy(data, this.ctx);
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
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
  @Post(':id/con/:conId/col/:colId/checkOut/:checkOutId')
  async submitPrizeEntry(
    @Param('id') id: number,
    @Param('conId') conId: number,
    @Param('colId') colId: number,
    @Param('checkOutId') checkOutId: number,
    @Body() players: Prisma.PlayerCreateManyInput[],
  ) {
    return await this.checkOutService.submitPrizeEntry(
      checkOutId,
      players,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @Post(':id/conventionType')
  async createConventionType(
    @Param('id') id: number,
    @Body()
    conventionTypeData: Prisma.ConventionTypeCreateInput,
  ): Promise<ConventionType | void> {
    conventionTypeData.organization = {
      connect: {
        id: Number(id),
      },
    };

    return this.conventionTypeService.createConventionType(
      conventionTypeData,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @Get(':id/conventionType')
  async getConventionTypes(
    @Param('id') id: number,
  ): Promise<ConventionType[] | void> {
    return this.conventionTypeService.conventionTypes(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @Get(':id/conventions')
  async getConventions(@Param('id') id: number): Promise<Convention[] | void> {
    return this.conventionService.conventionsByOrg(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @Get(':id/collections')
  async getCollections(@Param('id') id: number): Promise<Collection[] | void> {
    return this.collectionService.collectionsByOrg(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @Get(':id/games')
  async getGames(@Param('id') id: number) {
    return this.gameService.games(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
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

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @Post(':id/collections')
  async createCollection(
    @Param('id') id: number,
    @Body() collectionData: Prisma.CollectionCreateInput,
  ) {
    if (!collectionData.name || typeof collectionData.name !== 'string') {
      return Promise.reject('name not set');
    }

    if (
      collectionData.allowWinning === undefined ||
      typeof collectionData.allowWinning !== 'boolean'
    ) {
      return Promise.reject('allowWinning not set');
    }

    return this.collectionService.createCollection(
      id,
      collectionData.name,
      collectionData.allowWinning,
      this.ctx,
    );
  }
}
