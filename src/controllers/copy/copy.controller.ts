import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCopyDto } from './dto/update-copy.dto';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { CopyGuard } from '../../guards/copy/copy.guard';
import { CopyService } from '../../services/copy/copy.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';

@ApiTags('copies')
@ApiBearerAuth('jwt')
@Controller()
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
  @Get(':id')
  async getCopy(@Param('id') id: number) {
    return await this.copyService.copy({ id: Number(id) }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @Get(':id/withCheckOuts')
  async getCopyWithCheckOuts(@Param('id') id: number) {
    return await this.copyService.copyWithCheckouts(
      { id: Number(id) },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Put(':id')
  async updateCopy(
    @Param('id') id: number,
    @Body() copy: UpdateCopyDto,
  ) {
    return await this.copyService.updateCopy(
      {
        where: {
          id: Number(id),
        },
        data: copy,
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @Delete(':id')
  async deleteCopy(@Param('id') id: number) {
    return await this.copyService.deleteCopy(Number(id), this.ctx);
  }
}
