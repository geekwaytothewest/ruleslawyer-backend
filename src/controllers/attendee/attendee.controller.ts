import {
  Controller,
  Get,
  Param,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Attendee as AttendeeModel, Prisma } from '@prisma/client';
import { UserEntity } from '../../common/entities/user.entity';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { AttendeeGuard } from '../../guards/attendee/attendee.guard';
import { AttendeeEntity } from '../../common/entities/attendee.entity';
import { PronounsEntity } from 'src/common/entities/pronouns.entity';

@ApiTags('users')
@ApiBearerAuth('jwt')
@Controller()
export class AttendeeController {
  ctx: Context;

  constructor(
    private readonly attendeeService: AttendeeService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, AttendeeGuard)
  @ApiOkResponse({ type: UserEntity })
  @Get(':id')
  async getAttendeeById(@Param('id') id: string): Promise<AttendeeModel | null> {
    return this.attendeeService.attendee(
      {
        id: Number(id),
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, AttendeeGuard)
  @ApiOkResponse({ type: AttendeeEntity })
  @Post(':id')
  async updateAttendee(
    @Param('id') id: string,
    @Body() data: Prisma.AttendeeUpdateInput,
  ): Promise<AttendeeModel | null> {
    return this.attendeeService.updateAttendee(
      {
        where: {
          id: Number(id),
        },
        data: data,
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: PronounsEntity, isArray: true })
  @Get('pronouns')
  async getPronouns() {
    return this.attendeeService.getPronouns(this.ctx);
  }

  @UseGuards(JwtAuthGuard, AttendeeGuard)
  @ApiOkResponse({ type: AttendeeEntity })
  @Post(':id/transferBadge')
  async transferBadge(@Param('id') id: string) {
    return this.attendeeService.transferBadge(Number(id), {
      fromBadgeNumber: "",
      newBadgeFirstName: "",
      newBadgeLastName: "",
      newBadgePronouns: "",
      newBadgeEmail: "",
      newBadgeName: "",
      newBadgeLegalName: "",
      newBadgePronounsId: null,
    }, this.ctx);
  }

  @UseGuards(JwtAuthGuard, AttendeeGuard)
  @ApiOkResponse({ type: AttendeeEntity })
  @Post(':id/replaceBadge')
  async replaceBadge(@Param('id') id: string, @Body() data: { toBadgeNumber: string, fromBadgeNumber: string }) {
    return this.attendeeService.replaceBadge(Number(id), {
      toBadgeNumber: data.toBadgeNumber,
      fromBadgeNumber: data.fromBadgeNumber
    }, this.ctx);
  }
}
