import {
  Body,
  Controller,
  Param,
  Get,
  Post,
  UseGuards,
  NotFoundException,
  Put,
  Header,
  HttpCode,
  Req,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiAcceptedResponse,
} from '@nestjs/swagger';
import { Convention } from '@prisma/client';
import { ConventionEntity } from '../../common/entities/convention.entity';
import { ConventionWithCollectionsEntity } from '../../common/entities/convention-with-collections.entity';
import { ConventionWithTypeEntity } from '../../common/entities/convention-with-type.entity';
import { AttendeeEntity } from '../../common/entities/attendee.entity';
import { CollectionEntity } from '../../common/entities/collection.entity';
import { ConventionCollectionsEntity } from '../../common/entities/convention-collections.entity';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';
import { ImportAttendeesDto } from './dto/import-attendees.dto';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { PaginatedAttendeesDto } from './dto/paginated-attendees.dto';
import { CreateCollectionDto } from '../collection/dto/create-collection.dto';
import { ConventionService } from '../../services/convention/convention.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { SuperAdminGuard } from '../../guards/superAdmin/superAdmin.guard';
import { ConventionWriteGuard } from '../../guards/convention/convention-write.guard';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';
import { AttendeeService } from '../../services/attendee/attendee.service';
import fastify = require('fastify');
import { CollectionWriteGuard } from '../../guards/collection/collection-write.guard';
import { CollectionService } from '../../services/collection/collection.service';
import { User } from '../../modules/authz/user.decorator';
import { ConventionAdminGuard } from '../../guards/convention/convention-admin.guard';

@ApiTags('conventions')
@ApiBearerAuth('jwt')
@Controller()
export class ConventionController {
  ctx: Context;

  constructor(
    private readonly conventionService: ConventionService,
    private readonly prismaService: PrismaService,
    private readonly attendeeService: AttendeeService,
    private readonly collectionService: CollectionService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: ConventionEntity })
  @Post()
  async createConvention(
    @Body() conventionData: CreateConventionDto,
  ): Promise<Convention | void> {
    return this.conventionService.createConvention(conventionData, this.ctx);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ConventionWithTypeEntity, isArray: true })
  @Get()
  async getConventions(@User() user: any) {
    return this.conventionService.conventions(user, this.ctx);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ConventionWithCollectionsEntity })
  @Get(':id')
  async getConvention(@Param('id') id: number) {
    const con = await this.conventionService
      .convention(
        {
          id: Number(id),
        },
        this.ctx,
      )
      .catch((error) => {
        return Promise.reject(error);
      });

    if (!con) {
      return Promise.reject(new NotFoundException());
    }

    return con;
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @ApiOkResponse({ type: PaginatedAttendeesDto })
  @Get(':id/attendees')
  async getAttendees(
    @Param('id') id: number,
    @Query('limit') limit: string,
    @Query('filter') filter: string,
    @Query('page') page: string,) {
      return this.conventionService.getAttendees(Number(id), Number(limit), filter, Number(page), this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionAdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: ConventionEntity })
  @Put(':id')
  async updateConvention(
    @Param('id') id: number,
    @Body() conventionData: UpdateConventionDto,
  ) {
    return this.conventionService.updateConvention(
      Number(id),
      conventionData,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionAdminGuard)
  @HttpCode(202)
  @ApiAcceptedResponse({
    description: 'Import started in the background; progress is in the server logs.',
  })
  @Post(':id/importAttendeesCSV')
  async importAttendeesCSV(
    @Req() request: fastify.FastifyRequest,
    @Param('id') id: number,
  ) {
    const file = await request.file();
    const buffer = await file?.toBuffer();

    if (buffer === undefined) {
      return Promise.reject('missing file');
    }

    // Long-running: launch in the background and return 202 immediately so the
    // client (and any proxy) isn't holding a request open for minutes.
    return this.conventionService.startImportAttendeesCSV(buffer, id, this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionAdminGuard)
  @HttpCode(202)
  @ApiAcceptedResponse({
    description: 'Import started in the background; progress is in the server logs.',
  })
  @Post(':id/syncTabletopEventsAttendees')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async syncTabletopEventsAttendees(
    @Param('id') id: number,
    @Body() userData: ImportAttendeesDto,
  ) {
    // Long-running: launch in the background and return 202 immediately so the
    // client (and any proxy) isn't holding a request open for minutes.
    return this.conventionService.startSyncTabletopEventsAttendees(userData, id, this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionAdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: AttendeeEntity })
  @Post(':id/attendee')
  async createAttendee(
    @Param('id') id: number,
    @Body() attendee: CreateAttendeeDto,
  ) {
    if (attendee.convention.connect.id !== Number(id)) {
      return Promise.reject('convention id mismatch');
    }

    return this.attendeeService.createAttendee(attendee, this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionAdminGuard)
  @Get(':id/exportBadgeFile')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="badgeFile.csv"')
  @ApiOkResponse({
    description: 'CSV badge file as an attachment.',
    content: { 'text/csv': { schema: { type: 'string' } } },
  })
  async exportBadgeFile(@Param('id') id: number) {
    return await this.conventionService.exportBadgeFile(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard, CollectionWriteGuard)
  @ApiOkResponse({ type: ConventionCollectionsEntity })
  @Post(':conId/conventionCollection/:colId')
  async attachCollection(
    @Param('conId') conId: number,
    @Param('colId') colId: any,
  ) {
    return await this.conventionService.attachCollection(
      conId,
      colId,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard, CollectionWriteGuard)
  @ApiOkResponse({ type: ConventionCollectionsEntity })
  @Delete(':conId/conventionCollection/:colId')
  async detachCollection(
    @Param('conId') conId: number,
    @Param('colId') colId: any,
  ) {
    return await this.conventionService.detachCollection(
      conId,
      colId,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @ApiOkResponse({ type: AttendeeEntity })
  @Put(':id/transferBadge')
  async transferBadge(@Param('id') id: string, @Body() data: {
    fromBadgeNumber: string,
    newBadgeFirstName: string,
    newBadgeLastName: string,
    newBadgePronouns: string,
    newBadgeEmail: string,
    newBadgeLegalName: string,
    newBadgePronounsId: number
    newBadgeName: string,
  }) {
    return this.attendeeService.transferBadge(Number(id), {
      fromBadgeNumber: data.fromBadgeNumber,
      newBadgeFirstName: data.newBadgeFirstName,
      newBadgeLastName: data.newBadgeLastName,
      newBadgePronouns: data.newBadgePronouns,
      newBadgeEmail: data.newBadgeEmail,
      newBadgeName: data.newBadgeName,
      newBadgeLegalName: data.newBadgeLegalName,
      newBadgePronounsId: data.newBadgePronounsId,
    }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @ApiOkResponse({ type: AttendeeEntity })
  @Put(':id/replaceBadge')
  async replaceBadge(@Param('id') id: string, @Body() data: { toBadgeNumber: string, fromBadgeNumber: string }) {
    return this.attendeeService.replaceBadge(Number(id), {
      toBadgeNumber: data.toBadgeNumber,
      fromBadgeNumber: data.fromBadgeNumber
    }, this.ctx);
  }
}
