import {
  Controller,
  Param,
  Get,
  UseGuards,
  NotFoundException,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { CollectionService } from '../../services/collection/collection.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { CollectionReadGuard } from '../../guards/collection/collection-read.guard';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { CollectionWriteGuard } from '../../guards/collection/collection-write.guard';
import { Prisma } from '@prisma/client';

@Controller()
export class CollectionController {
  ctx: Context;

  constructor(
    private readonly collectionService: CollectionService,
    private readonly prismaService: PrismaService,
    private readonly attendeeService: AttendeeService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, CollectionReadGuard)
  @Get(':colId')
  async collection(@Param('colId') colId: number) {
    const col = await this.collectionService
      .collection(Number(colId), this.ctx)
      .catch((error) => {
        return Promise.reject(error);
      });

    if (!col) {
      return Promise.reject(new NotFoundException());
    }

    return col;
  }

  @UseGuards(JwtAuthGuard, CollectionReadGuard)
  @Get(':colId/copiesByGames')
  async collectionCopiesByGames(
    @Param('colId') colId: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
  ) {
    const col = this.collectionService.collectionCopiesByGames(
      Number(colId),
      limit,
      filter,
      this.ctx,
    );

    if (!col) {
      return Promise.reject(new NotFoundException());
    }

    return col;
  }

  @UseGuards(JwtAuthGuard, CollectionWriteGuard)
  @Put(':colId')
  async updateCollection(
    @Param('colId') colId: number,
    @Body()
    collectionData: Prisma.CollectionUpdateInput,
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

    return await this.collectionService.updateCollection(
      Number(colId),
      collectionData.name,
      collectionData.allowWinning,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CollectionWriteGuard)
  @Delete(':colId')
  async deleteCollection(@Param('colId') colId: number) {
    const collection = await this.collectionService.collection(
      Number(colId),
      this.ctx,
    );

    if (!collection) {
      return Promise.reject('Collection not found');
    }

    if (collection?._count?.copies > 0) {
      return Promise.reject(
        'Collection still has copies and cannot be deleted.',
      );
    }

    if (collection?._count?.conventions > 0) {
      return Promise.reject(
        'Collection still has conventions and cannot be deleted.',
      );
    }

    return await this.collectionService.deleteCollection(
      Number(colId),
      this.ctx,
    );
  }
}
