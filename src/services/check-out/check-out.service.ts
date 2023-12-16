import { Injectable } from '@nestjs/common';
import { CopyService } from '../copy/copy.service';
import { Context } from '../prisma/context';
import { AttendeeService } from '../attendee/attendee.service';
import { Prisma } from '@prisma/client';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';

@Injectable()
export class CheckOutService {
	private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(CheckOutService.name);
  constructor(
    private readonly copyService: CopyService,
    private readonly attendeeService: AttendeeService,
  ) {}

  async getLongestCheckouts(conventionId: number, ctx: Context) {
		try {
			this.logger.log(`Getting longest checkouts for conventionId=${conventionId}`);
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
			this.logger.error(`Getting longest checkouts for conventionId=${conventionId}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async getRecentCheckouts(conventionId: number, ctx: Context) {
		try {
			this.logger.log(`Getting recent checkouts for conventionId=${conventionId}`);
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
			this.logger.error(`Failed to get recent checkouts for conventionId=${conventionId}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

	getCheckOuts(conId: number, ctx: Context) {
		this.logger.log(`Getting checkouts for conId=${conId}`);
    try {
			return ctx.prisma.checkOut.findMany({
				include: {
					Copy: {
						include: {
							collection: true,
              game: true,
            },
          },
          players: {
						include: {
							attendee: true,
            },
          },
        },
      });
    } catch (ex) {
			this.logger.error(`Failed to get checkouts for conId=${conId}, ex=${ex}`);
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
			this.logger.log(`Checking out copy with collectionId=${collectionId}, copyBarcode=${copyBarcode}, conventionId=${conventionId}, attendeeBarcode=${attendeeBarcode}, overrideLimit=${overrideLimit}`);
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
				this.logger.error(`Copy not found with collectionId=${collectionId}, copyBarcode=${copyBarcode}`);
        return Promise.reject('copy not found');
      }
			
      if (copy.checkOuts.filter((co) => !co.checkIn).length > 0) {
				this.logger.error(`Copy already checked out with collectionId=${collectionId}, copyBarcode=${copyBarcode}`);
        return Promise.reject('already checked out');
      }
			
			this.logger.log(`Getting attendee with checkouts with conventionId=${conventionId}, attendeeBarcode=${attendeeBarcode}`);
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
				this.logger.error(`Attendee not found with conventionId=${conventionId}, attendeeBarcode=${attendeeBarcode}`)
        return Promise.reject('attendee not found');
      }
			
      if (
				attendee.checkOuts.filter((co) => !co.checkIn).length > 0 &&
        !overrideLimit
				) {
				this.logger.error(`Attendee with conventionId=${conventionId}, attendeeBarcode=${attendeeBarcode} already has a game checked out`);
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
			this.logger.error(`Error checking out copy with collectionId=${collectionId}, copyBarcode=${copyBarcode}, conventionId=${conventionId}, attendeeBarcode=${attendeeBarcode}, overrideLimit=${overrideLimit}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async checkIn(collectionId: number, copyBarcode: string, ctx: Context) {
		try {
			this.logger.log(`Checking in copy with collectionId=${collectionId}, copyBarcode=${copyBarcode}`);
			this.logger.log(`Getting copy with collectionId=${collectionId}, copyBarcode=${copyBarcode}`);
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
					this.logger.error(`Copy not found with collectionId=${collectionId}, copyBarcode=${copyBarcode}`);
					return Promise.reject('copy not found');
				}
				this.logger.log(`Copy found with collectionId=${collectionId}, copyBarcode=${copyBarcode}, copyId=${copy.id}`);
				
				const checkOuts = copy.checkOuts.filter((co) => !co.checkIn);
				
				if (checkOuts.length === 0) {
					this.logger.error(`Copy is already checked in with collectionId=${collectionId}, copyBarcode=${copyBarcode}, copyId=${copy.id}`);
					return Promise.reject('already checked in');
				}
				
				const checkOut = checkOuts[0];
				
				this.logger.log(`Checking in copy with collectionId=${collectionId}, copyBarcode=${copyBarcode}, copyId=${copy.id}`);
				return await ctx.prisma.checkOut.update({
					where: {
						id: checkOut.id,
					},
					data: {
						checkIn: new Date(),
					},
				});
			} catch (ex) {
				this.logger.error(`Failed to check in copy with collectionId=${collectionId}, copyBarcode=${copyBarcode}`);
				return Promise.reject(ex);
			}
  }

  async submitPrizeEntry(
    checkOutId: number,
    players: Prisma.PlayerCreateManyInput[],
    ctx: Context,
  ) {
		try {
			this.logger.log(`Submitting prize entry for checkoutId=${checkOutId}`);
			this.logger.log(`Getting checkout with checkoutId=${checkOutId}`);
      const checkOut = await ctx.prisma.checkOut.findUnique({
        where: {
          id: checkOutId,
        },
      });

			if (!checkOut?.checkIn) {
				this.logger.error(`Play with checkoutId=${checkOutId} is not checked in`)
        return Promise.reject('not checked in');
      }
			
      if (checkOut.submitted) {
				this.logger.error(`Play with checkoutId=${checkOutId} is already submitted`)
        return Promise.reject('already submitted');
      }
			
      if (!players.length) {
				this.logger.error(`Attempt to submit play with checkoutId=${checkOutId} with no players`)
        return Promise.reject('no players');
      }
			
      for (const p of players) {
				p.checkOutId = checkOutId;
				
        if (p.rating && p.rating > 5) {
					this.logger.error(`Attempt to submit play with checkoutId=${checkOutId} with invalid rating=${p.rating}`)
          return Promise.reject('invalid rating');
        }
      }

			try {
				this.logger.log(`Creating players for checkoutId=${checkOutId} with players=${[...players]}`);
        await ctx.prisma.player.createMany({
					data: [...players],
        });
      } catch ({ name, message }) {
				this.logger.error(`Failed to create players for checkoutId=${checkOutId} with players=${[...players]}`);
				return Promise.reject('failed creating players');
      }

			this.logger.log(`Updating checkout with checkoutId=${checkOutId}`);
      return await ctx.prisma.checkOut.update({
        where: {
          id: checkOutId,
        },
        data: {
          submitted: true,
        },
      });
		} catch (ex) {
			this.logger.error(`Failed to submit prize entry for checkoutId=${checkOutId}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async getAttendeePrizeEntries(attendeeBadgeNumber: string, ctx: Context) {
		try {
			this.logger.log(`Getting attendee prize entries with attendeeBadgeNumber=${attendeeBadgeNumber}`);
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
			this.logger.error(`Failed to get attendee prize entries with attendeeBadgeNumber=${attendeeBadgeNumber}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }
}
