import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ConventionTypeService } from '../../services/convention-type/convention-type.service';
import { ConventionType as ConventionTypeModel } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { ConventionTypeGuard } from '../../guards/convention-type/convention-type.guard';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { ConventionTypeEntity } from '../../common/entities/convention-type.entity';
import { UpdateConventionTypeDto } from './dto/update-convention-type.dto';

@ApiTags('users')
@ApiBearerAuth('jwt')
@Controller()
export class ConventionTypeController {
  ctx: Context;

  constructor(
    private readonly conventionTypeService: ConventionTypeService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, ConventionTypeGuard)
  @ApiOkResponse({ type: ConventionTypeEntity })
  @Get(':id')
  async getConventionType(@Param('id') id: string): Promise<ConventionTypeModel | null> {
    let conventionType: ConventionTypeModel | null = null;

    if (!isNaN(Number(id))) {
      conventionType = await this.conventionTypeService.conventionType(
        {
          id: Number(id),
        },
        this.ctx,
      );
    }

    if (!conventionType) {
      return Promise.reject(new NotFoundException());
    }

    return conventionType
  }

  @UseGuards(JwtAuthGuard, ConventionTypeGuard)
  @ApiOkResponse({ type: ConventionTypeEntity })
  @Put(':id')
  async updateConventionType(
      @Param('id') id: string,
      @Body() data: UpdateConventionTypeDto
    ): Promise<ConventionTypeModel | null> {
    let conventionType: ConventionTypeModel | null = null;

    if (!isNaN(Number(id))) {
      conventionType = await this.conventionTypeService.updateConventionType(
        Number(id),
        data,
        this.ctx
      )
    }

    if (!conventionType) {
      return Promise.reject(new NotFoundException());
    }

    return conventionType;
  }
}
