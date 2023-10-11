import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { CopyGuard } from '../../guards/copy/copy.guard';
import { CopyService } from '../../services/copy/copy.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';

@Controller('copy')
export class CopyController {
  ctx: Context;

  constructor(
    private readonly copyService: CopyService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @Post()
  async createCopy(@Body() copy: Prisma.CopyCreateInput) {
    return await this.copyService.createCopy(copy, this.ctx);
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @Get(':id')
  async getCopy(@Param('id') id: number) {
    return await this.copyService.copy({ id: id }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @Put(':id')
  async updateCopy(
    @Param('id') id: number,
    @Body() copy: Prisma.CopyUpdateInput,
  ) {
    return await this.copyService.updateCopy(
      {
        where: {
          id: id,
        },
        data: copy,
      },
      this.ctx,
    );
  }
}
