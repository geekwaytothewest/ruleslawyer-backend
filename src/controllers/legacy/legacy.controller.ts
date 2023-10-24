import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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

@Controller()
export class LegacyController {
  ctx: Context;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly collectionService: CollectionService,
    private readonly copyService: CopyService,
    private readonly attendeeService: AttendeeService,
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
            const currentCheckout = cp.checkOuts.find((co) => !co.checkIn);
            const currentCheckoutLength =
              (currentCheckout?.checkIn
                ? currentCheckout.checkIn.getTime()
                : new Date().getTime()) -
              (currentCheckout?.checkOut
                ? currentCheckout?.checkOut?.getTime()
                : new Date().getTime());

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
              ID: cp.id,
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
                      Name: currentCheckout.attendee.name,
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
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Get('org/:orgId/con/:conId/attendees')
  async getAttendees(@Param('conId') conId: number) {
    const attendees = await this.attendeeService.attendees(
      Number(conId),
      this.ctx,
    );

    return {
      Errors: [],
      Result: {
        Attendees: attendees.map((a) => {
          return {
            BadgeNumber: a.badgeNumber,
            ID: a.id,
            Name: a.name,
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
        name: attendee.name,
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
          name: attendee.name,
          badgeNumber: attendee.badgeNumber,
          barcode: '*' + attendee.badgeNumber.toString().padStart(6, '0') + '*',
        },
      },
      this.ctx,
    );
  }
}
