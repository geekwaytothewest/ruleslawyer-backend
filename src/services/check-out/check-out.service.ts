import { Injectable } from '@nestjs/common';
import { CopyService } from '../copy/copy.service';
import { Context } from '../prisma/context';
import { AttendeeService } from '../attendee/attendee.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CheckOutService {
  constructor(
    private readonly copyService: CopyService,
    private readonly attendeeService: AttendeeService,
  ) {}

  async getLongestCheckouts(conventionId: number, ctx: Context) {
    try {
      return ctx.prisma.checkOut.findMany({
        where: {
          checkIn: null,
        },
        orderBy: {
          checkOut: 'desc',
        },
        take: 10,
        include: {
          attendee: true,
          Copy: {
            include: {
              collection: true,
              game: true,
            },
          },
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getRecentCheckouts(conventionId: number, ctx: Context) {
    try {
      return ctx.prisma.checkOut.findMany({
        where: {
          checkIn: null,
        },
        orderBy: {
          checkOut: 'asc',
        },
        take: 10,
        include: {
          attendee: true,
          Copy: {
            include: {
              collection: true,
              game: true,
            },
          },
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async checkOut(
    collectionId: number,
    copyBarcode: string,
    conventionId: number,
    attendeeBarcode: string,
    overrideLimit: boolean,
    ctx: Context,
  ) {
    try {
      const copy = await this.copyService.copyWithCheckouts(
        {
          collectionId_barcode: {
            collectionId: collectionId,
            barcode: copyBarcode,
          },
        },
        ctx,
      );

      if (!copy) {
        return Promise.reject('copy not found');
      }

      if (copy.checkOuts.filter((co) => !co.checkIn).length > 0) {
        return Promise.reject('already checked out');
      }

      const attendee = await this.attendeeService.attendeeWithCheckouts(
        {
          conventionId_barcode: {
            conventionId: conventionId,
            barcode: attendeeBarcode,
          },
        },
        ctx,
      );

      if (!attendee) {
        return Promise.reject('attendee not found');
      }

      if (
        attendee.checkOuts.filter((co) => !co.checkIn).length > 0 &&
        !overrideLimit
      ) {
        return Promise.reject('attendee already has a game checked out');
      }

      return await ctx.prisma.checkOut.create({
        data: {
          copyId: copy.id,
          checkOut: new Date(),
          attendeeId: attendee.id,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async checkIn(collectionId: number, copyBarcode: string, ctx: Context) {
    try {
      const copy = await this.copyService.copyWithCheckouts(
        {
          collectionId_barcode: {
            collectionId: Number(collectionId),
            barcode: copyBarcode,
          },
        },
        ctx,
      );

      if (!copy) {
        return Promise.reject('copy not found');
      }

      const checkOuts = copy.checkOuts.filter((co) => !co.checkIn);

      if (checkOuts.length === 0) {
        return Promise.reject('already checked in');
      }

      const checkOut = checkOuts[0];

      return await ctx.prisma.checkOut.update({
        where: {
          id: checkOut.id,
        },
        data: {
          checkIn: new Date(),
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async submitPrizeEntry(
    checkOutId: number,
    players: Prisma.PlayerCreateManyInput[],
    ctx: Context,
  ) {
    try {
      const checkOut = await ctx.prisma.checkOut.findUnique({
        where: {
          id: checkOutId,
        },
      });

      if (!checkOut?.checkIn) {
        return Promise.reject('not checked in');
      }

      if (checkOut.submitted) {
        return Promise.reject('already submitted');
      }

      if (!players.length) {
        return Promise.reject('no players');
      }

      for (const p of players) {
        p.checkOutId = checkOutId;

        if (p.rating && p.rating > 5) {
          return Promise.reject('invalid rating');
        }
      }

      try {
        await ctx.prisma.player.createMany({
          data: [...players],
        });
      } catch ({ name, message }) {
        return Promise.reject('failed creating players');
      }

      return await ctx.prisma.checkOut.update({
        where: {
          id: checkOutId,
        },
        data: {
          submitted: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getAttendeePrizeEntries(attendeeBadgeNumber: string, ctx: Context) {
    try {
      return ctx.prisma.checkOut.findMany({
        include: {
          attendee: true,
          Copy: {
            include: {
              collection: true,
              game: true,
            },
          },
        },
        where: {
          AND: [
            {
              attendee: {
                badgeNumber: attendeeBadgeNumber,
              },
            },
            {
              Copy: {
                collection: {
                  allowWinning: true,
                },
              },
            },
            {
              checkIn: {
                not: null,
              },
            },
            {
              submitted: false,
            },
          ],
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
