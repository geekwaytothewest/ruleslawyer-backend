import {
  Controller,
  Param,
  Get,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CollectionService } from '../../services/collection/collection.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { CollectionGuard } from '../../guards/collection/collection.guard';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';
import { AttendeeService } from '../../services/attendee/attendee.service';

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

  @UseGuards(JwtAuthGuard, CollectionGuard)
  @Get(':colId')
  async collection(@Param('colId') colId: number) {
    const con = await this.collectionService
      .collection(Number(colId), this.ctx)
      .catch((error) => {
        return Promise.reject(error);
      });

    if (!con) {
      return Promise.reject(new NotFoundException());
    }

    return con;
  }
}
