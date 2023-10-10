import {
  Body,
  Controller,
  Param,
  Get,
  Post,
  UseGuards,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { Convention, Prisma } from '@prisma/client';
import { ConventionService } from '../../services/convention/convention.service';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { SuperAdminGuard } from '../../guards/superAdmin/superAdmin.guard';
import { ConventionGuard } from '../../guards/convention/convention.guard';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';

@Controller()
export class ConventionController {
  ctx: Context;

  constructor(
    private readonly conventionService: ConventionService,
    private readonly prismaService: PrismaService,
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
  ): Promise<Convention> {
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
        return error;
      });

    if (!con) {
      throw new NotFoundException();
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
    return this.conventionService
      .updateConvention(Number(id), conventionData, this.ctx)
      .catch((error) => {
        return error;
      });
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
    return this.conventionService
      .importAttendees(userData, id, this.ctx)
      .catch((error) => {
        return error;
      });
  }
}
