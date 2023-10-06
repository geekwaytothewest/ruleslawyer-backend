import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class AttendeeService {
  constructor() {}

  async createAttendee(
    data: Prisma.AttendeeCreateInput,
    ctx: Context,
  ): Promise<boolean> {
    await ctx.prisma.attendee.create({ data });

    return true;
  }

  async truncate(conventionId: number, ctx: Context) {
    await ctx.prisma.attendee.deleteMany({
      where: {
        conventionId: Number(conventionId),
      },
    });
  }
}
