import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Context } from '../prisma/context';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import { from } from 'rxjs';

@Injectable()
export class AttendeeService {
  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    AttendeeService.name,
  );
  constructor() {}

  async createAttendee(data: Prisma.AttendeeCreateInput, ctx: Context) {
    try {
      this.logger.log(`Creating attendee with data=${JSON.stringify(data)}`);
      return ctx.prisma.attendee.create({ data });
    } catch (ex) {
      this.logger.error(
        `Failed to create attendee with data=${JSON.stringify(data)}, ex=${ex}`,
      );
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
      this.logger.error(
        `Failed to sync attendee with data=${JSON.stringify(data)}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }

  async attendee(data: Prisma.AttendeeWhereUniqueInput, ctx: Context) {
    try {
      this.logger.log(`Getting attendee with data=${JSON.stringify(data)}`);
      return ctx.prisma.attendee.findUnique({ where: data });
    } catch (ex) {
      this.logger.error(
        `Failed to get attendee with data=${JSON.stringify(data)}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }

  async attendeeWithCheckouts(
    data: Prisma.AttendeeWhereUniqueInput,
    ctx: Context,
  ) {
    try {
      this.logger.log(
        `Getting attendee with checkouts with data=${JSON.stringify(data)}`,
      );
      return ctx.prisma.attendee.findUnique({
        where: data,
        include: {
          checkOuts: true,
        },
      });
    } catch (ex) {
      this.logger.error(
        `Failed to get attendee with checkouts with data=${JSON.stringify(
          data,
        )}, ex=${ex}`,
      );
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
      this.logger.error(
        `Failed to get attendees for conventionId=${conventionId}, ex=${ex}`,
      );
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
      this.logger.log(
        `Updating attendee with data=${JSON.stringify(
          data,
        )}, where=${JSON.stringify(where)}`,
      );
      return ctx.prisma.attendee.update({ data, where });
    } catch (ex) {
      this.logger.error(
        `Failed to update attendee with data=${JSON.stringify(
          data,
        )}, where=${JSON.stringify(where)}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }

  async badgeTransfer(conventionId: number, badgeTransferData: {
    fromBadgeNumber: string;
    newBadgeFirstName: string;
    newBadgeLastName: string;
    newBadgePronouns: string;
  }, ctx: Context) {
    try {
      this.logger.log(
        `Updating badge transfer for conventionId=${conventionId}, badgeTransferData=${JSON.stringify(
          badgeTransferData,
        )}`,
      );

      return ctx.prisma.attendee.update({
        where: {
          conventionId_badgeNumber: {
            conventionId: conventionId,
            badgeNumber: badgeTransferData.fromBadgeNumber,
          },
        },
        data: {
          badgeFirstName: badgeTransferData.newBadgeFirstName,
          badgeLastName: badgeTransferData.newBadgeLastName,
          legalName: badgeTransferData.newBadgeFirstName + ' ' + badgeTransferData.newBadgeLastName,
          badgeName: badgeTransferData.newBadgeFirstName + ' ' + badgeTransferData.newBadgeLastName,
          pronouns: {
            connectOrCreate: {
              create: {
                pronouns: badgeTransferData.newBadgePronouns
                  ? badgeTransferData.newBadgePronouns
                  : 'Prefer Not To Say',
              },
              where: {
                pronouns: badgeTransferData.newBadgePronouns
                  ? badgeTransferData.newBadgePronouns
                  : 'Prefer Not To Say',
              },
            },
          },
        }
      });
    } catch (ex) {
      this.logger.error(
        `Failed to update badge transfer for conventionId=${conventionId}, badgeTransferData=${JSON.stringify(
          badgeTransferData,
        )}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }

  async badgeReplacement(
    conventionId: number,
    badgeReplacementData: {
      fromBadgeNumber: string;
      toBadgeNumber: string;
    },
    ctx: Context
  ) {
    try {
      this.logger.log(
        `Updating badge replacement for conventionId=${conventionId}, badgeReplacementData=${JSON.stringify(
          badgeReplacementData,
        )}`,
      );

      return ctx.prisma.$transaction(async (prisma) => {
        const oldBadge = await prisma.attendee.findUnique({
          where: {
            conventionId_badgeNumber: {
              conventionId: conventionId,
              badgeNumber: badgeReplacementData.fromBadgeNumber,
            },
          },
        });

        const newBadge = await prisma.attendee.findUnique({
          where: {
            conventionId_badgeNumber: {
              conventionId: conventionId,
              badgeNumber: badgeReplacementData.toBadgeNumber,
            },
          },
        });

        if (!oldBadge) {
          throw new Error(`Attendee with badge number ${badgeReplacementData.fromBadgeNumber} not found for convention ${conventionId}`);
        }

        if (!newBadge) {
          throw new Error(`Attendee with badge number ${badgeReplacementData.fromBadgeNumber} not found for convention ${conventionId}`);
        }

        if (!newBadge.badgeName.startsWith('Attendee Blank')) {
          throw new Error(`Badge replacement can only be done to unassigned badges.`);
        }

        await prisma.attendee.update({
          where: {
            conventionId_badgeNumber: {
              conventionId: conventionId,
              badgeNumber: badgeReplacementData.fromBadgeNumber,
            },
          },
          data: {
            badgeLastName: oldBadge.badgeLastName + ' (Lost Badge)',
            badgeName: oldBadge.badgeName + ' (Lost Badge)',
            eligibleForPrizes: false,
            lostBadge: true
          }
        });

        await prisma.attendee.update({
          where: {
            conventionId_badgeNumber: {
              conventionId: conventionId,
              badgeNumber: badgeReplacementData.toBadgeNumber,
            },
          },
          data: {
            badgeFirstName: oldBadge.badgeFirstName,
            badgeLastName: oldBadge.badgeLastName,
            legalName: oldBadge.legalName,
            badgeName: oldBadge.badgeName,
            pronouns: {
              connect: {
                id: Number(oldBadge.pronounsId)
              }
            }
          }
        });

        await prisma.checkOut.updateMany({
          where: {
            attendeeId: oldBadge.id,
          },
          data: {
            attendeeId: newBadge?.id,
          }
        });
      });
    } catch (ex) {
      this.logger.error(
        `Failed to update badge replacement for conventionId=${conventionId}, badgeReplacementData=${JSON.stringify(
          badgeReplacementData,
        )}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }
}
