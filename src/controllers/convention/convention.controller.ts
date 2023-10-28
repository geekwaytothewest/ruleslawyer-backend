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
} from '@nestjs/common';
import { Convention, Prisma } from '@prisma/client';
import { ConventionService } from '../../services/convention/convention.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { SuperAdminGuard } from '../../guards/superAdmin/superAdmin.guard';
import { ConventionGuard } from '../../guards/convention/convention.guard';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';
import { AttendeeService } from '../../services/attendee/attendee.service';

@Controller()
export class ConventionController {
  ctx: Context;

  constructor(
    private readonly conventionService: ConventionService,
    private readonly prismaService: PrismaService,
    private readonly attendeeService: AttendeeService,
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

  @UseGuards(JwtAuthGuard, ConventionGuard)
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

  @UseGuards(JwtAuthGuard, ConventionGuard)
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

  @UseGuards(JwtAuthGuard, ConventionGuard)
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

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Get(':id/exportBadgeFile')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="badgeFile.csv"')
  async exportBadgeFile(@Param('id') id: number) {
    return await this.conventionService.exportBadgeFile(Number(id), this.ctx);
  }
}
