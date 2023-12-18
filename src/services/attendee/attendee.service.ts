import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Context } from '../prisma/context';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger'

@Injectable()
export class AttendeeService {
	private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(AttendeeService.name);
	constructor() { }

  async createAttendee(data: Prisma.AttendeeCreateInput, ctx: Context) {
		try {
			this.logger.log(`Creating attendee with data=${JSON.stringify(data)}`);
      return ctx.prisma.attendee.create({ data });
    } catch (ex) {
			this.logger.error(`Failed to create attendee with data=${JSON.stringify(data)}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async syncAttendee(data: Prisma.AttendeeCreateInput, ctx: Context) {
		try {
			this.logger.log(`Syncing attendee with data=${JSON.stringify(data)}`);
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
			this.logger.error(`Failed to sync attendee with data=${JSON.stringify(data)}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async attendee(data: Prisma.AttendeeWhereUniqueInput, ctx: Context) {
		try {
			this.logger.log(`Getting attendee with data=${JSON.stringify(data)}`);
      return ctx.prisma.attendee.findUnique({ where: data });
    } catch (ex) {
			this.logger.error(`Failed to get attendee with data=${JSON.stringify(data)}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async attendeeWithCheckouts(
    data: Prisma.AttendeeWhereUniqueInput,
    ctx: Context,
  ) {
		try {
			this.logger.log(`Getting attendee with checkouts with data=${JSON.stringify(data)}`);
      return ctx.prisma.attendee.findUnique({
				where: data,
        include: {
					checkOuts: true,
        },
      });
    } catch (ex) {
			this.logger.error(`Failed to get attendee with checkouts with data=${JSON.stringify(data)}, ex=${ex}`);
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
			this.logger.log(`Getting attendees for conventionId=${conventionId}`);
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
			this.logger.error(`Failed to get attendees for conventionId=${conventionId}, ex=${ex}`);
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
			this.logger.log(`Updating attendee with data=${JSON.stringify(data)}, where=${JSON.stringify(where)}`);
      return ctx.prisma.attendee.update({ data, where });
    } catch (ex) {
			this.logger.error(`Failed to update attendee with data=${JSON.stringify(data)}, where=${JSON.stringify(where)}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }
}
