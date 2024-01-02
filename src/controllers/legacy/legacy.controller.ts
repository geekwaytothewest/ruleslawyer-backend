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
  Req,
  UseGuards,
} from '@nestjs/common';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
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
import fastify = require('fastify');
import { GameService } from '../../services/game/game.service';
import { SuperAdminGuard } from '../../guards/superAdmin/superAdmin.guard';
import { PrizeEntryGuard } from '../../guards/prize-entry/prize-entry.guard';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';

@Controller()
export class LegacyController {
  ctx: Context;
  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    LegacyController.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly collectionService: CollectionService,
    private readonly copyService: CopyService,
    private readonly attendeeService: AttendeeService,
    private readonly checkOutService: CheckOutService,
    private readonly conventionService: ConventionService,
    private readonly organizationService: OrganizationService,
    private readonly gameService: GameService,
    private readonly userConventionPermissionsService: UserConventionPermissionsService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Get('org/:orgId/con/:conId/copycollections')
  async getCopyCollections(@Param('orgId') orgId: number) {
    this.logger.log(`Getting collections for orgId=${orgId}`);
    const collections = await this.collectionService.collectionsByOrg(
      Number(orgId),
      this.ctx,
    );
    this.logger.log(
      `Retrieved ${collections?.length} collections for orgId=${orgId}`,
    );

    return {
      Errors: [],
      Result: collections.map((c) => {
        return {
          ID: c.id,
          Name: c.name,
          AllowWinning: c.allowWinning,
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
              Winnable: cp.winnable,
              Comments: cp.comments,
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
  @Put('org/:orgId/con/:conId/copies/:oldBarcodeLabel')
  async updateCopy(
    @Param('oldBarcodeLabel') oldBarcodeLabel: string,
    @Param('orgId') orgId: number,
    @Body()
    copy: {
      libraryId: string;
      collectionId: number;
      winnable: boolean;
      comments: string;
    },
  ) {
    this.logger.log(`Updating copy with libraryId=${copy.libraryId}`);
    return this.copyService.updateCopy(
      {
        where: {
          organizationId_barcodeLabel: {
            barcodeLabel: oldBarcodeLabel,
            organizationId: Number(orgId),
          },
        },
        data: {
          collection: {
            connect: {
              id: Number(copy.collectionId),
            },
          },
          barcodeLabel: copy.libraryId,
          barcode: '*' + copy.libraryId + '*',
          winnable: copy.winnable,
          comments: copy.comments,
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
      winnable: boolean;
      comments: string;
    },
  ) {
    this.logger.log(
      `Creating copy with libraryId=${copy.libraryId}, title=${copy.title}`,
    );
    return this.copyService.createCopy(
      {
        dateAdded: new Date(),
        barcode: copy.libraryId.toString(),
        barcodeLabel: copy.libraryId.toString(),
        comments: copy.comments,
        winnable: copy.winnable,
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

  @UseGuards(JwtAuthGuard, PrizeEntryGuard)
  @Get('org/:orgId/con/:conId/attendees')
  async getAttendees(
    @Param('conId') conId: number,
    @Query('search') search: string,
    @Req() request: any,
  ) {
    this.logger.log(`Getting attendees for conId=${conId}, search=${search}`);
    let attendees =
      await this.attendeeService.attendeesWithPronounsAndBadgeTypes(
        Number(conId),
        this.ctx,
      );
    this.logger.log(
      `Retrieved ${attendees?.length} attendees for conId=${conId}`,
    );

    if (search) {
      attendees = attendees.filter(
        (a) =>
          a.badgeName.toLowerCase().includes(search.toLowerCase()) ||
          a.badgeNumber === search,
      );
    } else {
      const user = request?.user?.user;

      // TODO: This can be moved to the top; if the user doesn't have permissions, we can just exit out without hitting the db
      // TODO: if the request doesn't have a logged in user, it seems like we should treat it like they don't have permission
      if (user) {
        const permissions =
          await this.userConventionPermissionsService.getPermission(
            {
              userId_conventionId: {
                userId: Number(user.id),
                conventionId: Number(conId),
              },
            },
            this.ctx,
          );

        if (
          permissions?.attendee &&
          !permissions.geekGuide &&
          !permissions.admin
        ) {
          this.logger.warn(
            `user ${user.id} does not have permission to view attendees`,
          );
          attendees = [];
        }
      }
    }

    return {
      Errors: [],
      Result: {
        Attendees: attendees.map((a) => {
          return {
            BadgeNumber: a.badgeNumber,
            ID: a.id,
            Name: a.badgeName,
            Pronouns: a.pronouns?.pronouns,
            TTEBadgeNumber: a.tteBadgeNumber,
            TTEBadgeID: a.tteBadgeId,
          };
        }),
      },
    };
  }

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Post('org/:orgId/con/:conId/attendees')
  async addAttendee(
    @Param('conId') conId: number,
    @Body() attendee: { badgeNumber: string; name: string; pronouns: string },
  ) {
    this.logger.log(
      `Creating attendee for conId=${conId}, badgeNumber=${attendee.badgeNumber}`,
    );
    const nameSplit = attendee.name.split(' ');
    const lastName = nameSplit.pop();
    const firstName = nameSplit.join(' ');
    this.logger.log(
      `Attendee name parsed as lastName=${lastName}, firstName=${firstName}`,
    );

    return this.attendeeService.createAttendee(
      {
        badgeName: attendee.name,
        badgeLastName: lastName ? lastName : '',
        badgeFirstName: firstName,
        legalName: attendee.name,
        badgeNumber: attendee.badgeNumber,
        pronouns: {
          connectOrCreate: {
            create: {
              pronouns: attendee.pronouns,
            },
            where: {
              pronouns: attendee.pronouns,
            },
          },
        },
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
    @Body() attendee: { badgeNumber: string; name: string; pronouns: string },
  ) {
    this.logger.log(
      `Updating attendee with badgeNumber=${attendee.badgeNumber}`,
    );
    const nameSplit = attendee.name.split(' ');
    const lastName = nameSplit.pop();
    const firstName = nameSplit.join(' ');
    this.logger.log(
      `Attendee name parsed as lastName=${lastName}, firstName=${firstName}`,
    );

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
          badgeFirstName: firstName,
          badgeLastName: lastName ? lastName : '',
          badgeNumber: attendee.badgeNumber,
          pronouns: {
            connectOrCreate: {
              create: {
                pronouns: attendee.pronouns,
              },
              where: {
                pronouns: attendee.pronouns,
              },
            },
          },
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
    this.logger.log(
      `Getting longest checkouts for orgId=${orgId}, conId=${conId}`,
    );
    const checkouts = await this.checkOutService.getLongestCheckouts(
      Number(conId),
      this.ctx,
    );
    this.logger.log(
      `Retrieved ${checkouts?.length} longest checkouts for orgId=${orgId}, conId=${conId}`,
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
    this.logger.log(`Getting recent checkouts for conId=${conId}`);
    const checkouts = await this.checkOutService.getRecentCheckouts(
      Number(conId),
      this.ctx,
    );
    this.logger.log(
      `Retrieved ${checkouts?.length} recent checkouts for conId=${conId}`,
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
    this.logger.log(`Getting copy with organizationId_barcode=${copyBarcode}`);
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
      this.logger.log(
        `Copy not found with organizationId_barcode=${copyBarcode}, searching with organizationId_barcodeLabel=${copyBarcode}`,
      );
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
      this.logger.error(
        `Copy not found with organizationId_barcode=${copyBarcode} or organizationId_barcodeLabel=${copyBarcode}`,
      );
      throw new NotFoundException({
        Errors: ['Could not find a copy with that ID'],
        Result: null,
      });
    }

    this.logger.log(
      `Retrieved copy with copyBarcode=${copyBarcode}, copyId=${copy.id}`,
    );
    this.logger.log(`Getting current checkout for copyId=${copy.id}`);
    const currentCheckout = copy.checkOuts.find((co) => co.checkIn === null);

    let currentCheckoutLength = 0;

    if (currentCheckout) {
      currentCheckoutLength =
        (currentCheckout.checkIn
          ? currentCheckout.checkIn.getTime()
          : new Date().getTime()) - currentCheckout.checkOut.getTime();
      this.logger.log(
        `Retrieved current checkout for copyId=${copy.id}, checkoutId=${currentCheckout.id}, checkout length=${currentCheckoutLength}`,
      );
    }

    const days = Math.floor(currentCheckoutLength / (1000 * 60 * 60 * 24));
    let diff = currentCheckoutLength - days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);

    if (currentCheckout) {
      this.logger.log(`Current checkout exists, returning current checkout`);
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

    this.logger.log(`No current checkout, returning copy`);
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
  ) {
    this.logger.log(`Searching copies for orgId=${orgId}, query=${query}`);
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
    this.logger.log(
      `Found ${copies.length} copies for orgId=${orgId}, query=${query}`,
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
    this.logger.log(
      `Checking out copy with libraryId=${body.libraryId} to attendeeBadgeNumber=${body.attendeeBadgeNumber}, overrideLimit=${body.overrideLimit}`,
    );
    this.logger.log(
      `Getting attendee with conventionId_barcode=${body.attendeeBadgeNumber}, conId=${conId}`,
    );
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
      this.logger.log(
        `Attendee not found with conventionId_barcode=${body.attendeeBadgeNumber}, conId=${conId}, getting attendee with conventionId_badgeNumber=${body.attendeeBadgeNumber}`,
      );
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
      this.logger.error(
        `Attendee with attendeeBadgeNumber=${body.attendeeBadgeNumber} not found`,
      );
      throw new BadRequestException({
        Errors: ['Attendee not found.'],
        Result: null,
      });
    }

    this.logger.log(
      `Attendee found with attendeeBadgeNumber=${body.attendeeBadgeNumber}, conId=${conId}`,
    );

    if (
      attendee.checkOuts.filter((co) => co.checkIn === null).length > 0 &&
      !body.overrideLimit
    ) {
      this.logger.error(
        `Attendee with attendeeBadgeNumber=${body.attendeeBadgeNumber} already has a game checked out`,
      );
      throw new BadRequestException({
        Errors: ['Attendee already has a game checked out.'],
        Result: null,
      });
    }

    this.logger.log(
      `Getting copy with organizationId_barcode=${body.libraryId}`,
    );

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
      this.logger.log(
        `Copy not found with organizationId_barcode=${body.libraryId}, getting copy with organizationId_barcodeLabel=${body.libraryId}`,
      );
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

    if (!copy) {
      this.logger.error(`Copy not found with libraryId=${body.libraryId}`);
      throw new NotFoundException({
        Errors: ['Copy not found.'],
        Result: null,
      });
    }

    this.logger.log(
      `Copy found with libraryId=${body.libraryId}, copy.id=${copy.id}`,
    );
    this.logger.log(
      `Checking out copy with libraryId=${body.libraryId} to attendee with attendeeBadgeNumber=${body.attendeeBadgeNumber}`,
    );
    const checkOut = await this.checkOutService.checkOut(
      copy?.collectionId,
      copy?.barcode,
      Number(conId),
      attendee.barcode,
      body.overrideLimit,
      this.ctx,
    );
    this.logger.log(
      `Copy with libraryId=${body.libraryId}, copy.id=${copy.id} successfully checked out to attendee with attendeeBadgeNumber=${body.attendeeBadgeNumber}, checkout.id=${checkOut.id}`,
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
    this.logger.log(`Checking in copy with copyBarcode=${copyBarcode}`);
    this.logger.log(`Getting copy with organizationId_barcode=${copyBarcode}`);
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
      this.logger.log(
        `Copy not found with organizationId_barcode=${copyBarcode}, getting copy with organizationId_barcodeLabel=${copyBarcode}`,
      );
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
      this.logger.error(
        `Copy not found with organizationId_barcode=${copyBarcode} or organizationId_barcodeLabel=${copyBarcode}`,
      );
      throw new NotFoundException({
        Errors: ['Could not find a copy with that ID.'],
        Result: null,
      });
    }

    this.logger.log(
      `Copy found with copyBarcode=${copyBarcode}, copy.id=${copy.id}`,
    );

    this.logger.log(
      `Checking in copy with copyBarcode=${copyBarcode}, copy.id=${copy.id}`,
    );
    let currentCheckoutLength = 0;
    const checkIn = await this.checkOutService.checkIn(
      copy.collectionId,
      copy.barcode,
      this.ctx,
    );
    let attendee;
    if (!checkIn) {
      this.logger.error(
        `Failed to check in copy with copyBarcode=${copyBarcode}, copy.id=${copy.id}`,
      );
    } else {
      currentCheckoutLength =
        (checkIn.checkIn ? checkIn.checkIn.getTime() : new Date().getTime()) -
        checkIn.checkOut.getTime();
      this.logger.log(
        `Copy with copyBarcode=${copyBarcode}, copy.id=${copy.id} checked in, checkout length=${currentCheckoutLength}`,
      );
      this.logger.log(
        `Getting attendee with attendeeId=${checkIn?.attendeeId}`,
      );
      attendee = await this.attendeeService.attendee(
        {
          id: checkIn.attendeeId,
        },
        this.ctx,
      );
      if (!attendee) {
        this.logger.error(
          `Attendee not found with attendeeId=${checkIn.attendeeId}`,
        );
      } else {
        this.logger.log(`Attendee found with attendee.id=${attendee.id}`);
      }
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

  @UseGuards(JwtAuthGuard, PrizeEntryGuard)
  @Get('org/:orgId/con/:conId/checkouts')
  async getPrizeEntries(@Query('badgeId') badgeId: string) {
    this.logger.log(`Getting prize entries for badgeId=${badgeId}`);
    const prizeEntries = await this.checkOutService.getAttendeePrizeEntries(
      badgeId,
      this.ctx,
    );
    this.logger.log(
      `${prizeEntries?.length} prize entries found for badgeId=${badgeId}`,
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

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Get('org/:orgId/con/:conId/plays')
  async getPlays(@Param('conId') conId: number) {
    this.logger.log(`Getting plays for conId=${conId}`);
    const plays = await this.checkOutService.getCheckOuts(conId, this.ctx);
    this.logger.log(`Got ${plays.length} plays for conId=${conId}`);

    return {
      Errors: [],
      Result: {
        Plays: plays.map((p) => {
          return {
            ID: p.id,
            CheckoutID: p.id,
            GameID: p.Copy?.gameId,
            GameName: p.Copy?.game.name,
            Collection: {
              ID: p.Copy?.collection?.id,
              Name: p.Copy?.collection?.name,
              AllowWinning: p.Copy?.collection?.allowWinning,
              Color: null,
            },
            Checkout: {
              ID: p.id,
              TimeOut: p.checkOut,
              TimeIn: p.checkIn,
            },
            Players: p.players?.map((player) => {
              return {
                ID: player.attendee.badgeNumber.toString(),
                Name: player.attendee.badgeName,
                WantsToWin: player.wantToWin,
                Rating: player.rating,
              };
            }),
          };
        }),
      },
    };
  }

  @UseGuards(JwtAuthGuard, PrizeEntryGuard)
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
    this.logger.log(
      `Submitting prize entry for checkoutId=${entry.checkoutId}`,
    );
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

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Post('org/:orgId/con/:conId/importCollection')
  async importCollection(
    @Req() request: fastify.FastifyRequest,
    @Param('orgId') orgId: number,
  ) {
    this.logger.log(`Importing collection for orgId=${orgId}`);
    this.logger.log(`Validating file input`);
    const file = await request.file();
    const buffer = await file?.toBuffer();

    if (buffer === undefined) {
      this.logger.error(`Missing file`);
      return Promise.reject('missing file');
    }

    const fields = file?.fields as any;
    this.logger.log(
      `File input validated; importing collection for orgId=${orgId}, fields=${JSON.stringify(
        fields,
      )}`,
    );

    return this.collectionService.importCollection(
      Number(orgId),
      fields,
      buffer,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Post('org/:orgId/con/:conId/addCollection')
  async addCollection(
    @Param('orgId') orgId: number,
    @Body()
    collection: {
      name: string;
      allowWinning: boolean;
    },
  ) {
    this.logger.log(
      `Creating collection with name=${collection.name}, allowWinning=${collection.allowWinning}`,
    );
    return this.collectionService.createCollection(
      Number(orgId),
      collection.name,
      collection.allowWinning,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Post('org/:orgId/con/:conId/collection/:colId')
  async updateCollection(
    @Param('orgId') orgId: number,
    @Param('colId') colId: number,
    @Body()
    collection: {
      name: string;
      allowWinning: boolean;
    },
  ) {
    this.logger.log(`Updating collection with orgId=${orgId}, colId=${colId}`);
    return this.collectionService.updateCollection(
      Number(colId),
      collection.name,
      collection.allowWinning,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('org/:orgId/con/:conId/games')
  async getGames(@Param('orgId') orgId: number) {
    this.logger.log(`Getting games for orgId=${orgId}`);
    const games = await this.gameService.games(this.ctx);
    this.logger.log(`${games?.length} games found for orgId=${orgId}`);
    this.logger.log(`Getting copies for orgId=${orgId}`);
    const copies = await this.copyService.searchCopies(
      {
        organizationId: Number(orgId),
      },
      this.ctx,
    );
    this.logger.log(`${copies?.length} copies found for orgId=${orgId}`);

    return {
      Errors: [],
      Result: {
        Games: games.map((g) => {
          return {
            ID: g.id,
            Name: g.name,
            Copies: copies
              .filter((c) => c.gameId === g.id)
              .map((c) => {
                return {
                  ID: c.barcodeLabel,
                  IsCheckedOut:
                    c.checkOuts.filter((co) => co.checkOut !== null).length > 0,
                  Title: c.game.name,
                  Winnable: c.winnable,
                  Collection: {
                    ID: c.collection?.id,
                    Name: c.collection?.name,
                    AllowWinning: c.collection?.allowWinning,
                    Color: null,
                  },
                  CurrentCheckout: c.checkOuts.filter(
                    (co) => co.checkOut === null,
                  )[0],
                  Game: {
                    ID: c.game.id,
                    Name: c.game.name,
                    Copies: null,
                  },
                };
              }),
          };
        }),
      },
    };
  }

  //This route is used by the legacy admin app's games page
  //It was renamed to gameList to not interfere with the pnwpicker code which uses 'games' as its route
  @UseGuards(JwtAuthGuard)
  @Get('org/:orgId/con/:conId/gameList')
  async getGameList() {
    this.logger.log(`Getting game list`);
    return this.gameService.games(this.ctx);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Put('org/:orgId/con/:conId/gameList/:gameId')
  async updateGame(
    @Param('gameId') gameId: number,
    @Body()
    game: {
      title: string;
    },
  ) {
    this.logger.log(`Updating game with gameId=${gameId}, title=${game.title}`);
    return this.gameService.updateGame(
      {
        where: {
          id: Number(gameId),
        },
        data: {
          name: game.title,
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Post('org/:orgId/con/:conId/copycollections/:collId/copies/upload')
  async uploadCopies(
    @Req() request: fastify.FastifyRequest,
    @Param('orgId') orgId: number,
    @Param('collId') collId: number,
  ) {
    this.logger.log(`Uploading copies with orgId=${orgId}, collId=${collId}`);
    this.logger.log(`Validating file input`);
    const file = await request.file();
    const buffer = await file?.toBuffer();

    if (buffer === undefined) {
      this.logger.error(`Missing file`);
      return Promise.reject('missing file');
    }
    this.logger.log(`Validated file input; uploading copies`);

    return this.collectionService.uploadCopies(
      Number(orgId),
      Number(collId),
      buffer,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Put('org/:orgId/con/:conId/attendees/sync/tabletopEvents')
  async syncTabletopEvents(
    @Param('conId') conId: number,
    @Body()
    userData: {
      userName: string;
      password: string;
      apiKey: string;
      tteBadgeNumber: number;
      tteBadgeId: string;
    },
  ) {
    this.logger.log(
      `Syncing attendees with Tabletop Events for conId=${conId}, username=${userData.userName}`,
    );
    return this.conventionService.importAttendees(
      userData,
      Number(conId),
      this.ctx,
    );
  }
}
