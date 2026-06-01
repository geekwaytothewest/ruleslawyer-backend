import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Put,
  StreamableFile,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { detectImageMime } from '../../utils/image-mime';
import { UpdateCopyDto } from './dto/update-copy.dto';
import { CopyEntity } from '../../common/entities/copy.entity';
import { CopyWithRelationsEntity } from '../../common/entities/copy-with-relations.entity';
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
  @ApiOkResponse({ type: CopyWithRelationsEntity })
  @Get(':id')
  async getCopy(@Param('id') id: number) {
    return await this.copyService.copy({ id: Number(id) }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @ApiOkResponse({ type: CopyWithRelationsEntity })
  @Get(':id/withCheckOuts')
  async getCopyWithCheckOuts(@Param('id') id: number) {
    return await this.copyService.copyWithCheckouts(
      { id: Number(id) },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CopyEntity })
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

  // Public (no JwtAuthGuard): per-copy cover-art override is non-sensitive
  // imagery, served from a dedicated URL so the frontend can lazy-load it via
  // <img src> rather than inlining the blob into copy JSON payloads. The blob is
  // omitted from all other read paths (see PrismaService), so this is the only
  // route that loads it — one image at a time.
  @ApiProduces('image/png', 'image/jpeg', 'image/gif', 'image/webp')
  @ApiOkResponse({
    description:
      "The copy's cover-art override image, or 404 if none is set.",
  })
  @Header('Cache-Control', 'public, max-age=86400')
  @Get(':id/cover')
  async getCover(@Param('id') id: number): Promise<StreamableFile> {
    const image = await this.copyService.getCoverArtOverride(
      Number(id),
      this.ctx,
    );
    if (!image) {
      throw new NotFoundException(
        `No cover-art override set for copy ${id}.`,
      );
    }
    return new StreamableFile(image, { type: detectImageMime(image) });
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @ApiOkResponse({ type: CopyEntity })
  @Delete(':id')
  async deleteCopy(@Param('id') id: number) {
    return await this.copyService.deleteCopy(Number(id), this.ctx);
  }
}
