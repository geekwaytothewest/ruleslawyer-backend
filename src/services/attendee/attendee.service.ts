import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class AttendeeService {
  constructor() {}

  async createAttendee(data: Prisma.AttendeeCreateInput, ctx: Context) {
    return ctx.prisma.attendee.create({ data });
  }

  async truncate(conventionId: number, ctx: Context) {
    return ctx.prisma.attendee.deleteMany({
      where: {
        conventionId: Number(conventionId),
      },
    });
  }

  async attendee(data: Prisma.AttendeeWhereUniqueInput, ctx: Context) {
    return ctx.prisma.attendee.findUnique({ where: data });
  }

  async attendeeWithCheckouts(
    data: Prisma.AttendeeWhereUniqueInput,
    ctx: Context,
  ) {
    return ctx.prisma.attendee.findUnique({
      where: data,
      include: {
        checkOuts: true,
      },
    });
  }
}
