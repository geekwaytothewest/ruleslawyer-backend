import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class AttendeeService {
  constructor() {}

  async createAttendee(data: Prisma.AttendeeCreateInput, ctx: Context) {
    try {
      return ctx.prisma.attendee.create({ data });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async syncAttendee(data: Prisma.AttendeeCreateInput, ctx: Context) {
    try {
      return ctx.prisma.attendee.upsert({
        where: {
          conventionId_tteBadgeNumber: {
            conventionId: Number(data.convention.connect?.id),
            tteBadgeNumber: Number(data.tteBadgeNumber),
          },
        },
        create: data,
        update: data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async attendee(data: Prisma.AttendeeWhereUniqueInput, ctx: Context) {
    try {
      return ctx.prisma.attendee.findUnique({ where: data });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async attendeeWithCheckouts(
    data: Prisma.AttendeeWhereUniqueInput,
    ctx: Context,
  ) {
    try {
      return ctx.prisma.attendee.findUnique({
        where: data,
        include: {
          checkOuts: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async attendees(conventionId: number, ctx: Context) {
    try {
      return ctx.prisma.attendee.findMany({
        where: {
          conventionId: conventionId,
        },
        orderBy: [
          {
            badgeLastName: 'asc',
          },
          {
            badgeFirstName: 'asc',
          },
        ],
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async attendeesWithPronounsAndBadgeTypes(conventionId: number, ctx: Context) {
    try {
      return ctx.prisma.attendee.findMany({
        where: {
          conventionId: conventionId,
        },
        include: {
          pronouns: true,
          badgeType: true,
        },
        orderBy: [
          {
            badgeLastName: 'asc',
          },
          {
            badgeFirstName: 'asc',
          },
        ],
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async updateAttendee(
    params: {
      where: Prisma.AttendeeWhereUniqueInput;
      data: Prisma.AttendeeUpdateInput;
    },
    ctx: Context,
  ) {
    const { where, data } = params;

    try {
      return ctx.prisma.attendee.update({ data, where });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
