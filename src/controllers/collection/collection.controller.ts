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
  UsePipes,
  ValidationPipe,
  HttpCode,
  Req
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiAcceptedResponse,
} from '@nestjs/swagger';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionEntity } from '../../common/entities/collection.entity';
import { CollectionWithRelationsEntity } from '../../common/entities/collection-with-relations.entity';
import { CollectionService } from '../../services/collection/collection.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { CollectionReadGuard } from '../../guards/collection/collection-read.guard';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { CollectionWriteGuard } from '../../guards/collection/collection-write.guard';
import { CheckOutService } from '../../services/check-out/check-out.service';
import { stringify } from 'csv-stringify/sync';
import fastify = require('fastify');

@ApiTags('collections')
@ApiBearerAuth('jwt')
@Controller()
export class CollectionController {
  ctx: Context;

  constructor(
    private readonly collectionService: CollectionService,
    private readonly checkOutService: CheckOutService,
    private readonly prismaService: PrismaService,
    private readonly attendeeService: AttendeeService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, CollectionReadGuard)
  @ApiOkResponse({ type: CollectionWithRelationsEntity })
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
  @ApiOkResponse({
    description: 'Paginated copies for the collection, grouped by game.',
  })
  @Get(':colId/copiesByGames')
  async collectionCopiesByGames(
    @Param('colId') colId: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('page') page: number,
  ) {
    const col = this.collectionService.collectionCopiesByGames(
      Number(colId),
      limit,
      filter,
      this.ctx,
      page,
    );

    if (!col) {
      return Promise.reject(new NotFoundException());
    }

    return col;
  }

  @UseGuards(JwtAuthGuard, CollectionWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CollectionEntity })
  @Put(':colId')
  async updateCollection(
    @Param('colId') colId: number,
    @Body() collectionData: UpdateCollectionDto,
  ) {
    return await this.collectionService.updateCollection(
      Number(colId),
      collectionData.name,
      collectionData.allowWinning,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CollectionWriteGuard)
  @ApiOkResponse({
    description:
      'The deleted collection, or a message explaining why it could not be deleted.',
  })
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

  @UseGuards(JwtAuthGuard, CollectionWriteGuard)
  @ApiOkResponse({ type: CollectionEntity })
  @Put(':colId/archive')
  async archiveCollection(@Param('colId') colId: number) {
    return await this.collectionService.archiveCollection(
      Number(colId),
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CollectionReadGuard)
  @ApiOkResponse({
    description: 'CSV text of plays plus the collection name.',
    schema: {
      type: 'object',
      properties: {
        csvText: { type: 'string', example: 'Wingspan,A123,Jane Doe,...' },
        collectionName: { type: 'string', example: 'Main Library' },
      },
    },
  })
  @Get(':id/exportPlays')
  async exportPlaysByCollectionId(@Param('id') collId: number) {
    const checkOuts = await this.checkOutService.getCheckOutsByCollectionId(
      undefined,
      Number(collId),
      this.ctx,
    );

    const collName = checkOuts[0].copy?.collection.name;

    const csv = stringify([
      ['Game', 'Barcode', 'Badge Name', 'Checked Out', 'Checked In'],
      ...checkOuts.map((co) => {
        return [
          co.copy?.game.name,
          co.copy?.barcodeLabel,
          co.attendee.badgeName,
          co.checkOut.toISOString(),
          co.checkIn?.toISOString() ?? '',
        ];
      }),
    ]);

    return {
      csvText: csv,
      collectionName: collName,
    };
  }

  @UseGuards(JwtAuthGuard, CollectionWriteGuard)
  @HttpCode(202)
  @ApiAcceptedResponse({
    description:
      'Import started in the background; progress is in the server logs.',
  })
  @Put(':id/importCopies')
  async importCopies(
    @Req() request: fastify.FastifyRequest,
    @Param('id') id: number,
  ) {
    const file = await request.file();
    const buffer = await file?.toBuffer();

    if (buffer === undefined) {
      return Promise.reject('missing file');
    }

    const collection = await this.collectionService.collection(id, this.ctx);

    // Long-running: launch in the background and return 202 immediately so the
    // client (and any proxy) isn't holding a request open for minutes.
    return this.collectionService.uploadCopies(collection.organizationId, id, buffer, this.ctx);
  }
}
