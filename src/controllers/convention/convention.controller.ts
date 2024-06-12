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
  Req,
  Delete,
} from '@nestjs/common';
import { Convention, Prisma } from '@prisma/client';
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
  @Post()
  async createConvention(
    @Body()
    conventionData: Prisma.ConventionCreateInput,
  ): Promise<Convention | void> {
    return this.conventionService.createConvention(conventionData, this.ctx);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getConventions(@User() user: any) {
    return this.conventionService.conventions(user, this.ctx);
  }

  @UseGuards(JwtAuthGuard)
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
  @Put(':id')
  async updateConvention(
    @Param('id') id: number,
    @Body()
    conventionData: Prisma.ConventionUpdateInput,
  ) {
    return this.conventionService.updateConvention(
      Number(id),
      conventionData,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
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

    return this.conventionService.importAttendeesCSV(buffer, id, this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @Post(':id/importAttendees')
  async importAttendees(
    @Param('id') id: number,
    @Body()
    userData: {
      userName: string;
      password: string;
      apiKey: string;
    },
  ) {
    return this.conventionService.importAttendees(userData, id, this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @Post(':id/attendee')
  async createAttendee(
    @Param('id') id: number,
    @Body() attendee: Prisma.AttendeeCreateInput,
  ) {
    if (attendee.convention.connect?.id !== id) {
      return Promise.reject('convention id mismatch');
    }

    return this.attendeeService.createAttendee(attendee, this.ctx);
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @Get(':id/exportBadgeFile')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="badgeFile.csv"')
  async exportBadgeFile(@Param('id') id: number) {
    return await this.conventionService.exportBadgeFile(Number(id), this.ctx);
  }

  @UseGuards(JwtAuthGuard, CollectionWriteGuard)
  @Post(':id/collection')
  async createCollection(@Param('id') id: number, @Body() collection: any) {
    return await this.collectionService.createCollection(
      id,
      collection.name,
      collection.allowWinning,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard, CollectionWriteGuard)
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
}
