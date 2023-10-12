import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Convention, Organization, Prisma } from '@prisma/client';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionService } from '../../services/convention/convention.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { OrganizationGuard } from '../../guards/organization/organization.guard';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import fastify = require('fastify');
import { UploadGuard } from '../../guards/upload/upload.guard';
import { CollectionService } from '../../services/collection/collection.service';
import { CollectionGuard } from '../../guards/collection/collection.guard';
import { CopyService } from '../../services/copy/copy.service';

@Controller()
export class OrganizationController {
  ctx: Context;

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly conventionService: ConventionService,
    private readonly prismaService: PrismaService,
    private readonly collectionService: CollectionService,
    private readonly copyService: CopyService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard, OrganizationGuard)
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

  @UseGuards(JwtAuthGuard, OrganizationGuard, UploadGuard)
  @Post(':id/col')
  async importCollection(
    @Req() request: fastify.FastifyRequest,
    @Param('id') id: number,
  ) {
    const file = await request.file();
    const buffer = await file?.toBuffer();

    if (buffer === undefined) {
      return 'missing file';
    }

    const fields = file?.fields as any;

    return await this.collectionService.importCollection(
      id,
      fields,
      buffer,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard, CollectionGuard)
  @Delete(':id/col/:colId')
  async deleteCollection(
    @Param('id') id: number,
    @Param('colId') colId: number,
  ) {
    return await this.collectionService.deleteCollection(colId, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard, CollectionGuard)
  @Post(':id/col/:colId/copy')
  async createCopy(
    @Param('id') id: number,
    @Param('colId') colId: number,
    @Body() data: Prisma.CopyCreateInput,
  ) {
    data.collections = {
      connect: {
        id: Number(colId),
      },
    };

    data.dateAdded = new Date();

    return await this.copyService.createCopy(data, this.ctx);
  }
}
