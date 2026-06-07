import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiAcceptedResponse,
} from '@nestjs/swagger';
import { LegacyResponseDto } from './dto/legacy-response.dto';
import { CopyEntity } from '../../common/entities/copy.entity';
import { AttendeeEntity } from '../../common/entities/attendee.entity';
import { CollectionEntity } from '../../common/entities/collection.entity';
import { CheckOutEntity } from '../../common/entities/check-out.entity';
import { GameEntity } from '../../common/entities/game.entity';
import { LegacyUpdateCopyDto } from './dto/update-copy.dto';
import { LegacyAddCopyDto } from './dto/add-copy.dto';
import { LegacyAttendeeDto } from './dto/attendee.dto';
import { LegacyCheckoutCopyDto } from './dto/checkout-copy.dto';
import { LegacySubmitPrizeEntryDto } from './dto/submit-prize-entry.dto';
import { LegacyGameDto } from './dto/game.dto';
import { LegacySyncTabletopEventsDto } from './dto/sync-tabletop-events.dto';
import { LegacyBadgeTransferDto } from './dto/badge-transfer.dto';
import { LegacyBadgeReplacementDto } from './dto/badge-replacement.dto';
import { CreateCollectionDto } from '../collection/dto/create-collection.dto';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { CollectionService } from '../../services/collection/collection.service';
import { OrganizationWriteGuard } from '../../guards/organization/organization-write.guard';
import { OrganizationReadGuard } from '../../guards/organization/organization-read.guard';
import { CopyService } from '../../services/copy/copy.service';
import { CopyGuard } from '../../guards/copy/copy.guard';
import { CollectionWriteGuard } from '../../guards/collection/collection-write.guard';
import { ConventionReadGuard } from '../../guards/convention/convention-read.guard';
import { ConventionWriteGuard } from '../../guards/convention/convention-write.guard';
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
import { User } from '../../modules/authz/user.decorator';
import { stringify } from 'csv-stringify/sync';
import { CollectionReadGuard } from '../../guards/collection/collection-read.guard';

@ApiTags('legacy')
@ApiBearerAuth('jwt')
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

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @ApiOkResponse({ type: LegacyResponseDto })
  @Get('org/:orgId/con/:conId/copycollections')
  async getCopyCollections(@Param('orgId') orgId: number, @Param('conId') conId: number) {
    this.logger.log(`Getting collections for orgId=${orgId} and conId=${conId}`);
    const collections = await this.collectionService.collectionsByOrgAndConWithCopies(
      Number(orgId),
      Number(conId),
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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CopyEntity })
  @Put('org/:orgId/con/:conId/copies/:oldBarcodeLabel')
  async updateCopy(
    @Param('oldBarcodeLabel') oldBarcodeLabel: string,
    @Param('orgId') orgId: number,
    @Body() copy: LegacyUpdateCopyDto,
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

  @UseGuards(JwtAuthGuard, CollectionWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CopyEntity })
  @Post('org/:orgId/con/:conId/copycollections/:colId/copies')
  async addCopy(
    @Param('orgId') orgId: number,
    @Param('colId') colId: number,
    @Body() copy: LegacyAddCopyDto,
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
              organizationId: Number(orgId),
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
  @ApiOkResponse({ type: LegacyResponseDto })
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
      const MIN_SEARCH_LENGTH = 3;
      const MAX_RESULTS = 25;
      const query = search.trim().toLowerCase();

      // Exact badge-number lookup is always allowed and precise.
      const byBadgeNumber = attendees.filter((a) => a.badgeNumber === search);

      let matches = byBadgeNumber;
      if (!byBadgeNumber.length && query.length >= MIN_SEARCH_LENGTH) {
        // Token-prefix match: a name word must START with the query, rather
        // than the query appearing anywhere. Keeps "I know their name"
        // working while a single broad term no longer matches everyone.
        matches = attendees.filter((a) =>
          a.badgeName
            .toLowerCase()
            .split(/\s+/)
            .some((word) => word.startsWith(query)),
        );
      }

      // Anti-enumeration: refuse to return overly broad result sets so no
      // single query can pull a large slice of the attendee list.
      if (matches.length > MAX_RESULTS) {
        this.logger.warn(
          `Attendee search for conId=${conId} matched ${matches.length} (> ${MAX_RESULTS}); refusing as too broad`,
        );
        return {
          Errors: [],
          Result: {
            Attendees: [],
            TooBroad: true,
          },
        };
      }

      attendees = matches;
    } else {
      const user = request?.user?.user;

      if (user) {
        const permissions =
          await this.userConventionPermissionsService.getPermissionsBySearch(
            {
              conventionId: Number(conId),
              userId: user.id
            },
            this.ctx,
          );

        if (
          permissions[0]?.attendee &&
          !permissions[0]?.geekGuide &&
          !permissions[0]?.admin
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

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: AttendeeEntity })
  @Post('org/:orgId/con/:conId/attendees')
  async addAttendee(
    @Param('conId') conId: number,
    @Body() attendee: LegacyAttendeeDto,
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

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: AttendeeEntity })
  @Put('org/:orgId/con/:conId/attendees/:badgeNumber')
  async updateAttendee(
    @Param('badgeNumber') badgeNumber: string,
    @Param('conId') conId: number,
    @Body() attendee: LegacyAttendeeDto,
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
  @ApiOkResponse({ type: LegacyResponseDto })
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
              ID: c.copy?.collection?.id,
              Name: c.copy?.collection?.name,
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
              ID: c.copy?.game.id,
              Name: c.copy?.game.name,
            },
            ID: c.copy?.barcodeLabel,
            IsCheckedOut: true,
            Title: c.copy?.game.name,
            Winnable: c.copy?.winnable,
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
  @ApiOkResponse({ type: LegacyResponseDto })
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
              ID: c.copy?.collection?.id,
              Name: c.copy?.collection?.name,
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
              ID: c.copy?.game.id,
              Name: c.copy?.game.name,
            },
            ID: c.copy?.barcodeLabel,
            IsCheckedOut: true,
            Title: c.copy?.game.name,
            Winnable: c.copy?.winnable,
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
  @ApiOkResponse({ type: LegacyResponseDto })
  @Get('org/:orgId/con/:conId/copies/:copyBarcode')
  async getCopy(
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
    @Param('copyBarcode') copyBarcode: string,
  ) {
    const copyBarcodeStrippedZeroes = Number(copyBarcode)?.toString();
    this.logger.log(
      `Retrieving with organizationId_barcode=${copyBarcodeStrippedZeroes}`,
    );
    let copy = await this.copyService.copyWithCheckOutsGameAndCollection(
      {
        organizationId_barcode: {
          organizationId: Number(orgId),
          barcode: copyBarcodeStrippedZeroes,
        },
      },
      this.ctx,
    );

    if (!copy) {
      this.logger.log(
        `Copy not found with organizationId_barcode=${copyBarcodeStrippedZeroes}, searching with organizationId_barcodeLabel=${copyBarcodeStrippedZeroes}`,
      );
      copy = await this.copyService.copyWithCheckOutsGameAndCollection(
        {
          organizationId_barcodeLabel: {
            organizationId: Number(orgId),
            barcodeLabel: copyBarcodeStrippedZeroes,
          },
        },
        this.ctx,
      );
    }

    if (!copy) {
      this.logger.error(
        `Copy not found with organizationId_barcode=${copyBarcodeStrippedZeroes} or organizationId_barcodeLabel=${copyBarcodeStrippedZeroes}`,
      );

      this.logger.log(`Getting copy with barcode=${copyBarcode} without stripped zeroes.`);
      copy = await this.copyService.copyWithCheckOutsGameAndCollection(
        {
          organizationId_barcode: {
            organizationId: Number(orgId),
            barcode: copyBarcode,
          },
        },
        this.ctx,
      );

      if (!copy) {
        this.logger.log(`Getting copy using barcode label with barcode=${copyBarcode} without stripped zeroes.`);
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
    }

    this.logger.log(
      `Retrieved copy with barcode=${copyBarcode}, copyId=${copy.id}`,
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
  @ApiOkResponse({ type: LegacyResponseDto })
  @Get('org/:orgId/con/:conId/copies')
  async searchCopies(
    @Query('query') query: string,
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
  ) {
    this.logger.log(`Searching copies for orgId=${orgId}, query=${query}`);
    const copies = await this.copyService.searchCopies(
      {
        AND: [
          {
            collection: {
              organizationId: Number(orgId),
              conventions: {
                some: {
                  conventionId: Number(conId),
                },
              },
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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: LegacyResponseDto })
  @Post('org/:orgId/con/:conId/checkouts')
  async checkoutCopy(
    @Body() body: LegacyCheckoutCopyDto,
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
    @User() user: any,
  ) {
    this.logger.log(
      `Checkout requested for barcode=${body.libraryId}, attendeeBadgeNumber=${body.attendeeBadgeNumber}, overrideLimit=${body.overrideLimit}`,
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

    const attendeeCheckouts = attendee.checkOuts.filter((co) => !co.checkIn);

    let checkoutString = '';

    if (attendeeCheckouts.length > 0 && !body.overrideLimit) {
      if (attendeeCheckouts[0].copyId) {
        const checkoutCopy = await this.copyService.copy(
          { id: attendeeCheckouts[0].copyId },
          this.ctx,
        );

        const game = await this.gameService.game(
          { id: checkoutCopy?.gameId, organizationId: Number(orgId) },
          this.ctx,
          user,
        );

        checkoutString = `Game: ${game?.name}, Barcode: ${checkoutCopy?.barcodeLabel}`;
      }

      this.logger.error(
        `Attendee with attendeeBadgeNumber=${body.attendeeBadgeNumber} already has a game checked out`,
      );
      throw new BadRequestException({
        Errors: [`Attendee already has a game checked out. ${checkoutString}`],
        Result: null,
      });
    }

    const copyBarcodeStrippedZeroes = Number(body.libraryId)?.toString();
    this.logger.log(
      `Getting copy with organizationId_barcode=${copyBarcodeStrippedZeroes}`,
    );

    let copy = await this.copyService.copyWithCheckOutsGameAndCollection(
      {
        organizationId_barcode: {
          organizationId: Number(orgId),
          barcode: copyBarcodeStrippedZeroes,
        },
      },
      this.ctx,
    );

    if (!copy) {
      this.logger.log(
        `Copy not found with organizationId_barcode=${copyBarcodeStrippedZeroes}, getting copy with organizationId_barcodeLabel=${copyBarcodeStrippedZeroes}`,
      );
      copy = await this.copyService.copyWithCheckOutsGameAndCollection(
        {
          organizationId_barcodeLabel: {
            organizationId: Number(orgId),
            barcodeLabel: copyBarcodeStrippedZeroes,
          },
        },
        this.ctx,
      );
    }

    if (!copy) {
      this.logger.error(
        `Copy not found with copyId=${copyBarcodeStrippedZeroes}`,
      );
      throw new NotFoundException({
        Errors: ['Copy not found.'],
        Result: null,
      });
    }

    this.logger.log(
      `Copy found with barcode=${body.libraryId}, copy.id=${copy.id}`,
    );
    this.logger.log(
      `Checking out copy with copyId=${copy.id} to attendee with attendeeBadgeNumber=${body.attendeeBadgeNumber}`,
    );
    const checkOut = await this.checkOutService.checkOut(
      copy?.collectionId,
      copy?.barcode,
      Number(conId),
      attendee.barcode,
      body.overrideLimit,
      this.ctx,
      user,
    );
    this.logger.log(
      `Copy with copyId=${copy.id} successfully checked out to attendee with attendeeBadgeNumber=${body.attendeeBadgeNumber}, checkout.id=${checkOut.id}`,
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
  @ApiOkResponse({ type: LegacyResponseDto })
  @Put('org/:orgId/con/:conId/checkouts/checkin/:copyBarcode')
  async checkinCopy(
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
    @Param('copyBarcode') copyBarcode: string,
  ) {
    const copyBarcodeStrippedZeroes = Number(copyBarcode)?.toString();
    this.logger.log(
      `Checking in copy with copyBarcode=${copyBarcode}, copyId=${copyBarcodeStrippedZeroes}`,
    );
    this.logger.log(
      `Getting copy with organizationId_barcode=${copyBarcodeStrippedZeroes}`,
    );
    let copy = await this.copyService.copyWithCheckOutsGameAndCollection(
      {
        organizationId_barcode: {
          organizationId: Number(orgId),
          barcode: copyBarcodeStrippedZeroes,
        },
      },
      this.ctx,
    );

    if (!copy) {
      this.logger.log(
        `Copy not found with organizationId_barcode=${copyBarcodeStrippedZeroes}, getting copy with organizationId_barcodeLabel=${copyBarcodeStrippedZeroes}`,
      );
      copy = await this.copyService.copyWithCheckOutsGameAndCollection(
        {
          organizationId_barcodeLabel: {
            organizationId: Number(orgId),
            barcodeLabel: copyBarcodeStrippedZeroes,
          },
        },
        this.ctx,
      );
    }

    if (!copy) {
      this.logger.error(
        `Copy not found with organizationId_barcode=${copyBarcodeStrippedZeroes} or organizationId_barcodeLabel=${copyBarcodeStrippedZeroes}`,
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
  @ApiOkResponse({ type: LegacyResponseDto })
  @Get('org/:orgId/con/:conId/prizeEntryCheckouts')
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
              ID: e.copy?.game.id,
              Name: e.copy?.game.name,
              MaxPlayers: e.copy?.game.maxPlayers,
            },
            Collection: {
              ID: e.copy?.collection?.id,
              Name: e.copy?.collection?.name,
              AllowWinning: e.copy?.collection?.allowWinning,
            },
            ID: e.copy?.id,
            Title: e.copy?.game.name,
            Winnable: e.copy?.winnable,
          },
          ID: e.id,
        };
      }),
    };
  }

  @UseGuards(JwtAuthGuard, ConventionReadGuard)
  @ApiOkResponse({ type: LegacyResponseDto })
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
            GameID: p.copy?.gameId,
            GameName: p.copy?.game.name,
            Collection: {
              ID: p.copy?.collection?.id,
              Name: p.copy?.collection?.name,
              AllowWinning: p.copy?.collection?.allowWinning,
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
  @UseGuards(JwtAuthGuard, ConventionReadGuard)
  @ApiOkResponse({ type: LegacyResponseDto })
  @Get('org/:orgId/con/:conId/coll/:collId/plays')
  async getCollPlays(
    @Param('conId') conId: number,
    @Param('collId') collId: number,
  ) {
    this.logger.log(`Getting plays for conId=${conId}`);
    const plays = await this.checkOutService.getCheckOutsByCollectionId(
      Number(conId),
      Number(collId),
      this.ctx,
    );
    this.logger.log(`Got ${plays.length} plays for conId=${conId}`);

    return {
      Errors: [],
      Result: {
        Plays: plays.map((p) => {
          return {
            ID: p.id,
            CheckoutID: p.id,
            GameID: p.copy?.gameId,
            GameName: p.copy?.game.name,
            Collection: {
              ID: p.copy?.collection?.id,
              Name: p.copy?.collection?.name,
              AllowWinning: p.copy?.collection?.allowWinning,
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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CheckOutEntity })
  @Post('org/:orgId/con/:conId/plays')
  async submitPrizeEntry(@Body() entry: LegacySubmitPrizeEntryDto) {
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

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @ApiOkResponse({ type: CopyEntity, isArray: true })
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
      `File input validated; importing collection for orgId=${orgId}}`,
    );

    return this.collectionService.importCollection(
      Number(orgId),
      fields,
      buffer,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CollectionEntity })
  @Post('org/:orgId/con/:conId/addCollection')
  async addCollection(
    @Param('orgId') orgId: number,
    @Param('conId') conId: number,
    @Body() collection: CreateCollectionDto,
  ) {
    this.logger.log(
      `Creating collection with name=${collection.name}, allowWinning=${collection.allowWinning}`,
    );
    return this.collectionService.createCollection(
      Number(orgId),
      Number(conId),
      collection.name,
      collection.allowWinning,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: CollectionEntity })
  @Post('org/:orgId/con/:conId/collection/:colId')
  async updateCollection(
    @Param('orgId') orgId: number,
    @Param('colId') colId: number,
    @Body() collection: CreateCollectionDto,
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
  @ApiOkResponse({ type: LegacyResponseDto })
  @Get('org/:orgId/con/:conId/games')
  async getGames(@Param('orgId') orgId: number) {
    this.logger.log(`Getting games for orgId=${orgId}`);
    const games = await this.gameService.games(orgId, this.ctx);
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

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: LegacyResponseDto })
  @Get('org/:orgId/con/:conId/coll/:collId/games')
  async getGamesByCollectionId(
    @Param('orgId') orgId: number,
    @Param('collId') collId: number,
  ) {
    this.logger.log(`Getting games for orgId=${orgId}`);
    const games = await this.gameService.games(orgId, this.ctx);
    this.logger.log(`${games?.length} games found for orgId=${orgId}`);
    this.logger.log(`Getting copies for orgId=${orgId}`);
    const copies = await this.copyService.searchCopies(
      {
        organizationId: Number(orgId),
        collectionId: Number(collId),
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
  @ApiOkResponse({ type: GameEntity, isArray: true })
  @Get('org/:orgId/con/:conId/gameList')
  async getGameList(@Param('orgId') orgId: number) {
    this.logger.log(`Getting game list`);
    return this.gameService.games(orgId, this.ctx);
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: GameEntity })
  @Post('org/:orgId/con/:conId/gameList')
  async addGame(
    @Param('orgId') orgId: number,
    @Body() game: LegacyGameDto,
  ) {
    this.logger.log(`Adding game with title ${game.title}`);

    return this.gameService.createGame({
      name: game.title,
      organization: {
        connect: {
          id: orgId,
        }
      }
    }, this.ctx)
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: GameEntity })
  @Put('org/:orgId/con/:conId/gameList/:gameId')
  async updateGame(
    @Param('orgId') orgId: number,
    @Param('gameId') gameId: number,
    @Body() game: LegacyGameDto,
  ) {
    this.logger.log(`Updating game with gameId=${gameId}, title=${game.title}`);
    return this.gameService.updateGame(
      {
        where: {
          id: Number(gameId),
          organizationId: Number(orgId),
        },
        data: {
          name: game.title,
        },
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @ApiOkResponse({
    type: CopyEntity,
    isArray: true,
    description: 'The copies created from the uploaded file.',
  })
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

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @HttpCode(202)
  @ApiAcceptedResponse({
    description: 'Import started in the background; progress is in the server logs.',
  })
  @Put('org/:orgId/con/:conId/attendees/import')
  async importAttendees(
    @Req() request: fastify.FastifyRequest,
    @Param('conId') conId: number,
  ) {
    this.logger.log(`Importing attendees for conId=${conId}`);
    this.logger.log(`Validating file input`);
    const file = await request.file();
    const buffer = await file?.toBuffer();

    if (buffer === undefined) {
      this.logger.error(`Missing file`);
      return Promise.reject('missing file');
    }

    this.logger.log(
      `File input validated; importing collection for orgId=${conId}}`,
    );

    // Long-running: launch in the background and return 202 immediately so the
    // client (and any proxy) isn't holding a request open for minutes.
    return this.conventionService.startImportAttendeesCSV(
      buffer,
      Number(conId),
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @HttpCode(202)
  @ApiAcceptedResponse({
    description: 'Sync started in the background; progress is in the server logs.',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Put('org/:orgId/con/:conId/attendees/sync/tabletopEvents')
  async syncTabletopEvents(
    @Param('conId') conId: number,
    @Body() userData: LegacySyncTabletopEventsDto,
  ) {
    this.logger.log(
      `Syncing attendees with Tabletop Events for conId=${conId}, username=${userData.userName}`,
    );
    // Long-running: launch in the background and return 202 immediately so the
    // client (and any proxy) isn't holding a request open for minutes.
    return this.conventionService.startSyncTabletopEventsAttendees(
      userData,
      Number(conId),
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, CollectionReadGuard)
  @ApiOkResponse({
    description: 'CSV text of plays plus the collection name.',
    schema: {
      type: 'object',
      properties: {
        csvText: { type: 'string', example: 'Wingspan,A123,Jane Doe,...' },
        collectionName: { type: 'string', example: 'Main Library' },
      },
    },
  })
  @Get('org/:orgId/con/:conId/coll/:collId/exportPlays')
  async exportPlaysByCollectionId(
    @Param('conId') conId: number,
    @Param('collId') collId: number,
  ) {
    const checkOuts = await this.checkOutService.getCheckOutsByCollectionId(
      Number(conId),
      Number(collId),
      this.ctx,
    );

    const collName = checkOuts[0].copy?.collection.name;

    const csv = stringify(
      checkOuts.map((co) => {
        return [
          co.copy?.game.name,
          co.copy?.barcodeLabel,
          co.attendee.badgeName,
          co.checkOut,
          co.checkIn,
        ];
      }),
    );

    return {
      csvText: csv,
      collectionName: collName,
    };
  }

  @UseGuards(JwtAuthGuard, ConventionReadGuard)
  @ApiOkResponse({ type: AttendeeEntity })
  @Get('org/:orgId/con/:conId/attendees/badgeNumber/:badgeNumber')
  async getAttendeeByBadgeNumber(
    @Param('conId') conId: number,
    @Param('badgeNumber') badgeNumber: string
  ) {
    return this.attendeeService.attendee(
      {
        conventionId_badgeNumber: {
          badgeNumber: badgeNumber,
          conventionId: Number(conId),
        },
      },
      this.ctx
    );
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: AttendeeEntity })
  @Put('org/:orgId/con/:conId/attendees/badgeTransfer')
  async badgeTransfer(
    @Param('conId') conId: number,
    @Body() body: LegacyBadgeTransferDto,
  ) {
    this.logger.log(`Transferring badge ${body.fromBadgeNumber} to ${body.newBadgeFirstName} ${body.newBadgeLastName} for conId=${conId}`);
    return this.attendeeService.transferBadge(
      Number(conId),
      body,
      this.ctx
    );
  }

  @UseGuards(JwtAuthGuard, ConventionWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: AttendeeEntity })
  @Put('org/:orgId/con/:conId/attendees/badgeReplacement')
  async badgeReplacement(
    @Param('conId') conId: number,
    @Body() body: LegacyBadgeReplacementDto,
  ) {
    this.logger.log(`Replacing badge from ${body.fromBadgeNumber} to ${body.toBadgeNumber} for conId=${conId}`);
    return this.attendeeService.replaceBadge(
      Number(conId),
      body,
      this.ctx
    );
  }
}
