import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { CollectionService } from '../../services/collection/collection.service';
import { OrganizationGuard } from '../../guards/organization/organization.guard';
import { CopyService } from '../../services/copy/copy.service';
import { CopyGuard } from '../../guards/copy/copy.guard';
import { CollectionGuard } from '../../guards/collection/collection.guard';
import { ConventionGuard } from '../../guards/convention/convention.guard';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { CheckOutGuard } from '../../guards/check-out/check-out.guard';
import { CheckOutService } from '../../services/check-out/check-out.service';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';

@Controller()
export class LegacyController {
  ctx: Context;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly collectionService: CollectionService,
    private readonly copyService: CopyService,
    private readonly attendeeService: AttendeeService,
    private readonly checkOutService: CheckOutService,
    private readonly conventionService: ConventionService,
    private readonly organizationService: OrganizationService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Get('org/:orgId/con/:conId/copycollections')
  async getCopyCollections(@Param('orgId') orgId: number) {
    const collections = await this.collectionService.collectionsByOrg(
      Number(orgId),
      this.ctx,
    );

    return {
      Errors: [],
      Result: collections.map((c) => {
        return {
          ID: c.id,
          Name: c.name,
          Copies: c.copies.map((cp) => {
            const currentCheckout = cp.checkOuts.find(
              (co) => co.checkIn === null,
            );

            let currentCheckoutLength = 0;

            if (currentCheckout) {
              currentCheckoutLength =
                (currentCheckout.checkIn
                  ? currentCheckout.checkIn.getTime()
                  : new Date().getTime()) - currentCheckout.checkOut.getTime();
            }

            const days = Math.floor(
              currentCheckoutLength / (1000 * 60 * 60 * 24),
            );
            let diff = currentCheckoutLength - days * (1000 * 60 * 60 * 24);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            diff -= hours * 1000 * 60 * 60;
            const minutes = Math.floor(diff / (1000 * 60));
            diff -= minutes * 1000 * 60;
            const seconds = Math.floor(diff / 1000);

            return {
              ID: cp.barcodeLabel,
              Title: cp.game.name,
              Collection: {
                ID: c.id,
                Name: c.name,
              },
              Game: {
                ID: cp.game.id,
                Name: cp.game.name,
              },
              CurrentCheckout: currentCheckout
                ? {
                    ID: currentCheckout?.id,
                    Attendee: {
                      ID: currentCheckout.attendee.id,
                      BadgeNumber: currentCheckout.attendee.badgeNumber,
                      Name: currentCheckout.attendee.badgeName,
                    },
                    TimeOut: currentCheckout.checkOut,
                    TimeIn: currentCheckout.checkIn,
                    Length: {
                      Days: days,
                      Hours: hours,
                      Minutes: minutes,
                      Seconds: seconds,
                    },
                  }
                : null,
            };
          }),
        };
      }),
    };
  }

  @UseGuards(JwtAuthGuard, CopyGuard)
  @Put('org/:orgId/con/:conId/copies/:copyId')
  async updateCopy(
    @Param('copyId') copyId: number,
    @Body()
    copy: {
      collectionId: number;
      libraryId: number;
      title: string;
      winnable: boolean;
    },
  ) {
    return this.copyService.updateCopy(
      {
        where: {
          id: Number(copyId),
        },
        data: {
          collection: {
            connect: {
              id: copy.collectionId,
            },
          },
          game: {
            connectOrCreate: {
              create: {
                name: copy.title,
              },
              where: {
                name: copy.title,
              },
            },
          },
          winnable: copy.winnable,
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CollectionGuard)
  @Post('org/:orgId/con/:conId/copycollections/:colId/copies')
  async addCopy(
    @Param('orgId') orgId: number,
    @Param('colId') colId: number,
    @Body()
    copy: {
      libraryId: number;
      title: string;
    },
  ) {
    return this.copyService.createCopy(
      {
        dateAdded: new Date(),
        barcode: copy.libraryId.toString(),
        barcodeLabel: copy.libraryId.toString(),
        collection: {
          connect: {
            id: Number(colId),
          },
        },
        game: {
          connectOrCreate: {
            where: {
              name: copy.title,
            },
            create: {
              name: copy.title,
            },
          },
        },
        organization: {
          connect: {
            id: Number(orgId),
          },
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Get('org/:orgId/con/:conId/attendees')
  async getAttendees(
    @Param('conId') conId: number,
    @Query('search') search: string,
  ) {
    let attendees = await this.attendeeService.attendees(
      Number(conId),
      this.ctx,
    );

    if (search) {
      attendees = attendees.filter(
        (a) =>
          a.badgeName.toLowerCase().includes(search.toLowerCase()) ||
          a.badgeNumber === search,
      );
    }

    return {
      Errors: [],
      Result: {
        Attendees: attendees.map((a) => {
          return {
            BadgeNumber: a.badgeNumber,
            ID: a.id,
            Name: a.badgeName,
          };
        }),
      },
    };
  }

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Post('org/:orgId/con/:conId/attendees')
  async addAttendee(
    @Param('conId') conId: number,
    @Body() attendee: { badgeNumber: string; name: string },
  ) {
    return this.attendeeService.createAttendee(
      {
        badgeName: attendee.name,
        badgeFirstName: attendee.name.split(' ', 1)[0],
        badgeLastName: attendee.name.split(' ', 1)[1],
        legalName: attendee.name,
        badgeNumber: attendee.badgeNumber,
        barcode: '*' + attendee.badgeNumber.toString().padStart(6, '0') + '*',
        convention: {
          connect: {
            id: Number(conId),
          },
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Put('org/:orgId/con/:conId/attendees/:badgeNumber')
  async updateAttendee(
    @Param('badgeNumber') badgeNumber: string,
    @Param('conId') conId: number,
    @Body() attendee: { badgeNumber: string; name: string },
  ) {
    return this.attendeeService.updateAttendee(
      {
        where: {
          conventionId_badgeNumber: {
            badgeNumber: badgeNumber,
            conventionId: Number(conId),
          },
        },
        data: {
          badgeName: attendee.name,
          badgeNumber: attendee.badgeNumber,
          barcode: '*' + attendee.badgeNumber.toString().padStart(6, '0') + '*',
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @Get('org/:orgId/con/:conId/checkouts/checkedOutLongest')
  async getLongestCheckouts(
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
  ) {
    const checkouts = await this.checkOutService.getLongestCheckouts(
      Number(conId),
      this.ctx,
    );

    return {
      Errors: [],
      Result: checkouts.map((c) => {
        let currentCheckoutLength = 0;

        if (c) {
          currentCheckoutLength =
            (c.checkIn ? c.checkIn.getTime() : new Date().getTime()) -
            c.checkOut.getTime();
        }

        const days = Math.floor(currentCheckoutLength / (1000 * 60 * 60 * 24));
        let diff = currentCheckoutLength - days * (1000 * 60 * 60 * 24);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * 1000 * 60;
        const seconds = Math.floor(diff / 1000);

        return {
          Attendee: {
            BadgeNumber: c.attendee.badgeNumber,
            ID: c.attendee.id,
            Name: c.attendee.badgeName,
          },
          Copy: {
            Collection: {
              ID: c.Copy?.collection?.id,
              Name: c.Copy?.collection?.name,
            },
            CurrentCheckout: {
              Attendee: {
                BadgeNumber: c.attendee.badgeNumber,
                ID: c.attendee.id,
                Name: c.attendee.badgeName,
              },
              ID: c.id,
              TimeIn: c.checkIn,
              TimeOut: c.checkOut,
              Length: {
                Days: days,
                Hours: hours,
                Minutes: minutes,
                Seconds: seconds,
              },
            },
            Game: {
              ID: c.Copy?.game.id,
              Name: c.Copy?.game.name,
            },
            ID: c.Copy?.barcodeLabel,
            IsCheckedOut: true,
            Title: c.Copy?.game.name,
            Winnable: c.Copy?.winnable,
          },
          ID: c.id,
          Length: {
            Days: days,
            Hours: hours,
            Minutes: minutes,
            Seconds: seconds,
          },
          TimeIn: c.checkIn,
          TimeOut: c.checkOut,
        };
      }),
    };
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @Get('org/:orgId/con/:conId/checkouts/recentCheckouts')
  async getRecentCheckouts(
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
  ) {
    const checkouts = await this.checkOutService.getRecentCheckouts(
      Number(conId),
      this.ctx,
    );

    return {
      Errors: [],
      Result: checkouts.map((c) => {
        let currentCheckoutLength = 0;

        if (c) {
          currentCheckoutLength =
            (c.checkIn ? c.checkIn.getTime() : new Date().getTime()) -
            c.checkOut.getTime();
        }

        const days = Math.floor(currentCheckoutLength / (1000 * 60 * 60 * 24));
        let diff = currentCheckoutLength - days * (1000 * 60 * 60 * 24);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * 1000 * 60;
        const seconds = Math.floor(diff / 1000);

        return {
          Attendee: {
            BadgeNumber: c.attendee.badgeNumber,
            ID: c.attendee.id,
            Name: c.attendee.badgeName,
          },
          Copy: {
            Collection: {
              ID: c.Copy?.collection?.id,
              Name: c.Copy?.collection?.name,
            },
            CurrentCheckout: {
              Attendee: {
                BadgeNumber: c.attendee.badgeNumber,
                ID: c.attendee.id,
                Name: c.attendee.badgeName,
              },
              ID: c.id,
              TimeIn: c.checkIn,
              TimeOut: c.checkOut,
              Length: {
                Days: days,
                Hours: hours,
                Minutes: minutes,
                Seconds: seconds,
              },
            },
            Game: {
              ID: c.Copy?.game.id,
              Name: c.Copy?.game.name,
            },
            ID: c.Copy?.barcodeLabel,
            IsCheckedOut: true,
            Title: c.Copy?.game.name,
            Winnable: c.Copy?.winnable,
          },
          ID: c.id,
          Length: {
            Days: days,
            Hours: hours,
            Minutes: minutes,
            Seconds: seconds,
          },
          TimeIn: c.checkIn,
          TimeOut: c.checkOut,
        };
      }),
    };
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @Get('org/:orgId/con/:conId/copies/:copyBarcode')
  async getCopy(
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
    @Param('copyBarcode') copyBarcode: string,
  ) {
    let copy = await this.copyService.copyWithCheckOutsGameAndCollection(
      {
        organizationId_barcode: {
          organizationId: Number(orgId),
          barcode: copyBarcode,
        },
      },
      this.ctx,
    );

    if (!copy) {
      copy = await this.copyService.copyWithCheckOutsGameAndCollection(
        {
          organizationId_barcodeLabel: {
            organizationId: Number(orgId),
            barcodeLabel: copyBarcode,
          },
        },
        this.ctx,
      );
    }

    if (!copy) {
      throw new NotFoundException({
        Errors: ['Could not find a copy with that ID'],
        Result: null,
      });
    }

    const currentCheckout = copy.checkOuts.find((co) => co.checkIn === null);

    let currentCheckoutLength = 0;

    if (currentCheckout) {
      currentCheckoutLength =
        (currentCheckout.checkIn
          ? currentCheckout.checkIn.getTime()
          : new Date().getTime()) - currentCheckout.checkOut.getTime();
    }

    const days = Math.floor(currentCheckoutLength / (1000 * 60 * 60 * 24));
    let diff = currentCheckoutLength - days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);

    if (currentCheckout) {
      return {
        Errors: [],
        Result: {
          Collection: {
            ID: copy.collection.id,
            Name: copy.collection.name,
          },
          CurrentCheckout: {
            Attendee: {
              BadgeNumber: currentCheckout.attendee.badgeNumber,
              ID: currentCheckout.attendee.id,
              Name: currentCheckout.attendee.name,
            },
            ID: currentCheckout.id,
            Length: {
              Days: days,
              Hours: hours,
              Minutes: minutes,
              Seconds: seconds,
            },
            TimeIn: currentCheckout.checkIn,
            TimeOut: currentCheckout.checkOut,
          },
          Game: {
            ID: copy.game.id,
            Name: copy.game.name,
          },
          ID: copy.barcodeLabel,
          IsCheckedOut: true,
          Title: copy.game.name,
          Winnable: copy.winnable,
        },
      };
    }

    return {
      Errors: [],
      Result: {
        Collection: {
          ID: copy.collection.id,
          Name: copy.collection.name,
        },
        CurrentCheckout: null,
        Game: {
          ID: copy.game.id,
          Name: copy.game.name,
        },
        ID: copy.barcodeLabel,
        IsCheckedOut: false,
        Title: copy.game.name,
        Winnable: copy.winnable,
      },
    };
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @Get('org/:orgId/con/:conId/copies')
  async searchCopies(
    @Query('query') query: string,
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
  ) {
    const copies = await this.copyService.searchCopies(
      {
        AND: [
          {
            collection: {
              organizationId: Number(orgId),
            },
          },
          {
            OR: [
              {
                game: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
              {
                barcodeLabel: query,
              },
            ],
          },
        ],
      },
      this.ctx,
    );

    return {
      Errors: [],
      Result: copies.map((c) => {
        const currentCheckout = c.checkOuts.find((co) => co.checkIn === null);

        let currentCheckoutLength = 0;

        if (currentCheckout) {
          currentCheckoutLength =
            (currentCheckout.checkIn
              ? currentCheckout.checkIn.getTime()
              : new Date().getTime()) - currentCheckout.checkOut?.getTime();
        }

        const days = Math.floor(currentCheckoutLength / (1000 * 60 * 60 * 24));
        let diff = currentCheckoutLength - days * (1000 * 60 * 60 * 24);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * 1000 * 60;
        const seconds = Math.floor(diff / 1000);

        return {
          Collection: {
            ID: c.collection?.id,
            Name: c.collection?.name,
          },
          CurrentCheckout: {
            Attendee: {
              BadgeNumber: currentCheckout?.attendee.badgeNumber,
              ID: currentCheckout?.attendee.id,
              Name: currentCheckout?.attendee.badgeName,
            },
            ID: currentCheckout?.id,
            Length: {
              Days: days,
              Hours: hours,
              Minutes: minutes,
              seconds: seconds,
            },
            TimeIn: currentCheckout?.checkIn,
            TimeOut: currentCheckout?.checkOut,
          },
          Game: {
            ID: c.game.id,
            Name: c.game.name,
          },
          ID: c.barcodeLabel,
          IsCheckedOut: currentCheckout ? true : false,
          Title: c.game.name,
          Winnable: c.winnable,
        };
      }),
    };
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @Post('org/:orgId/con/:conId/checkouts')
  async checkoutCopy(
    @Body()
    body: {
      attendeeBadgeNumber: string;
      libraryId: string;
      overrideLimit: boolean;
    },
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
  ) {
    let attendee = await this.attendeeService.attendeeWithCheckouts(
      {
        conventionId_barcode: {
          conventionId: Number(conId),
          barcode: body.attendeeBadgeNumber,
        },
      },
      this.ctx,
    );

    if (!attendee) {
      attendee = await this.attendeeService.attendeeWithCheckouts(
        {
          conventionId_badgeNumber: {
            conventionId: Number(conId),
            badgeNumber: body.attendeeBadgeNumber,
          },
        },
        this.ctx,
      );
    }

    if (!attendee) {
      throw new BadRequestException({
        Errors: ['Attendee not found.'],
        Result: null,
      });
    }

    if (
      attendee.checkOuts.filter((co) => co.checkIn === null).length > 0 &&
      !body.overrideLimit
    ) {
      throw new BadRequestException({
        Errors: ['Attendee already has a game checked out.'],
        Result: null,
      });
    }

    let copy = await this.copyService.copyWithCheckOutsGameAndCollection(
      {
        organizationId_barcode: {
          organizationId: Number(orgId),
          barcode: body.libraryId,
        },
      },
      this.ctx,
    );

    if (!copy) {
      copy = await this.copyService.copyWithCheckOutsGameAndCollection(
        {
          organizationId_barcodeLabel: {
            organizationId: Number(orgId),
            barcodeLabel: body.libraryId,
          },
        },
        this.ctx,
      );
    }

    const checkOut = await this.checkOutService.checkOut(
      copy?.collectionId,
      copy?.barcode,
      Number(conId),
      attendee.barcode,
      body.overrideLimit,
      this.ctx,
    );

    return {
      Errors: [],
      Result: {
        Attendee: {
          BadgeNumber: attendee?.badgeNumber,
          ID: attendee?.id,
          Name: attendee?.badgeName,
        },
        Copy: {
          Collection: {
            ID: copy.collectionId,
            Name: copy.collection.name,
          },
          CurrentCheckout: {
            Attendee: {
              BadgeNumber: attendee?.badgeNumber,
              ID: attendee?.id,
              Name: attendee?.badgeName,
            },
            ID: checkOut.id,
            Length: {
              Days: 0,
              Hours: 0,
              Minutes: 0,
              Seconds: 0,
            },
            TimeIn: null,
            TimeOut: checkOut.checkOut,
          },
          Game: {
            ID: copy.game.id,
            Name: copy.game.name,
          },
          ID: checkOut.id,
          IsCheckedOut: true,
          Title: copy.game.name,
          Winnable: copy.winnable,
        },
        ID: checkOut.id,
        Length: {
          Days: 0,
          Hours: 0,
          Minutes: 0,
          Seconds: 0,
        },
        TimeIn: null,
        TimeOut: checkOut.checkOut,
      },
    };
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @Put('org/:orgId/con/:conId/checkouts/checkin/:copyBarcode')
  async checkinCopy(
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
    @Param('copyBarcode') copyBarcode: string,
  ) {
    let copy = await this.copyService.copyWithCheckOutsGameAndCollection(
      {
        organizationId_barcode: {
          organizationId: Number(orgId),
          barcode: copyBarcode,
        },
      },
      this.ctx,
    );

    if (!copy) {
      copy = await this.copyService.copyWithCheckOutsGameAndCollection(
        {
          organizationId_barcodeLabel: {
            organizationId: Number(orgId),
            barcodeLabel: copyBarcode,
          },
        },
        this.ctx,
      );
    }

    if (!copy) {
      throw new NotFoundException({
        Errors: ['Could not find a copy with that ID'],
        Result: null,
      });
    }

    const checkIn = await this.checkOutService.checkIn(
      copy.collectionId,
      copy.barcode,
      this.ctx,
    );

    const attendee = await this.attendeeService.attendee(
      {
        id: checkIn.attendeeId,
      },
      this.ctx,
    );

    let currentCheckoutLength = 0;

    if (checkIn) {
      currentCheckoutLength =
        (checkIn.checkIn ? checkIn.checkIn.getTime() : new Date().getTime()) -
        checkIn.checkOut.getTime();
    }

    const days = Math.floor(currentCheckoutLength / (1000 * 60 * 60 * 24));
    let diff = currentCheckoutLength - days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);

    return {
      Errors: [],
      Result: {
        Attendee: {
          BadgeNumber: attendee?.badgeNumber,
          ID: attendee?.id,
          Name: attendee?.badgeName,
        },
        Copy: {
          Collection: {
            ID: copy.collection.id,
            Name: copy.collection.name,
          },
          CurrentCheckout: null,
          Game: {
            ID: copy.game.id,
            Name: copy.game.name,
          },
          ID: copy.barcodeLabel,
          IsCheckedOut: false,
          Title: copy.game.name,
          Winnable: copy.winnable,
        },
        ID: checkIn.id,
        Length: {
          Days: days,
          Hours: hours,
          Minutes: minutes,
          Seconds: seconds,
        },
        TimeIn: checkIn.checkIn,
        TimeOut: checkIn.checkOut,
      },
    };
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @Get('org/:orgId/con/:conId/checkouts')
  async getPrizeEntries(@Query('badgeId') badgeId: string) {
    const prizeEntries = await this.checkOutService.getAttendeePrizeEntries(
      badgeId,
      this.ctx,
    );

    return {
      Errors: [],
      Result: prizeEntries.map((e) => {
        return {
          Attendee: {
            ID: e.attendee.id,
            Name: e.attendee.badgeName,
            BadgeNumber: e.attendee.badgeNumber,
          },
          Copy: {
            Game: {
              ID: e.Copy?.game.id,
              Name: e.Copy?.game.name,
            },
            Collection: {
              ID: e.Copy?.collection?.id,
              Name: e.Copy?.collection?.name,
              AllowWinning: e.Copy?.collection?.allowWinning,
            },
            ID: e.Copy?.id,
            Title: e.Copy?.game.name,
            Winnable: e.Copy?.winnable,
          },
          ID: e.id,
        };
      }),
    };
  }

  @UseGuards(JwtAuthGuard, CheckOutGuard)
  @Post('org/:orgId/con/:conId/plays')
  async submitPrizeEntry(
    @Body()
    entry: {
      checkoutId: number;
      players: {
        id: number;
        name: string;
        rating: number | null;
        wantsToWin: boolean;
      }[];
    },
  ) {
    return this.checkOutService.submitPrizeEntry(
      entry.checkoutId,
      entry.players.map((p) => {
        return {
          checkOutId: entry.checkoutId,
          attendeeId: p.id,
          rating: p.rating,
          wantToWin: p.wantsToWin,
        };
      }),
      this.ctx,
    );
  }
}
