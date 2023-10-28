import { Injectable, StreamableFile } from '@nestjs/common';
import { Convention, Prisma } from '@prisma/client';
import { OrganizationService } from '../organization/organization.service';
import { AttendeeService } from '../attendee/attendee.service';
import { TabletopeventsService } from '../tabletopevents/tabletopevents.service';
import * as crypto from 'crypto';
import { Context } from '../prisma/context';
import { CheckOutService } from '../check-out/check-out.service';
import { stringify } from 'csv-stringify';

@Injectable()
export class ConventionService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly attendeeService: AttendeeService,
    private readonly tteService: TabletopeventsService,
    private readonly checkOutService: CheckOutService,
  ) {}

  async createConvention(
    data: Prisma.ConventionCreateInput,
    ctx: Context,
  ): Promise<Convention> {
    const org = await this.organizationService.organizationWithUsers(
      {
        id: data.organization.connect?.id,
      },
      ctx,
    );

    const userPermissions = org.users.map((u) => {
      return {
        userId: u.userId,
        admin: true,
        geekGuide: false,
        attendee: false,
      };
    });

    data.users = {
      create: [
        {
          userId: org.owner.id,
          admin: true,
          geekGuide: false,
          attendee: false,
        },
        ...userPermissions,
      ],
    };

    const con = await ctx.prisma.convention.create({
      data,
    });

    return con;
  }

  async convention(
    conventionWhereUniqueInput: Prisma.ConventionWhereUniqueInput,
    ctx: Context,
  ): Promise<Convention | null> {
    return ctx.prisma.convention.findUnique({
      where: conventionWhereUniqueInput,
    });
  }

  async conventionWithUsers(
    conventionWhereUniqueInput: Prisma.ConventionWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    return ctx.prisma.convention.findUnique({
      where: conventionWhereUniqueInput,
      include: {
        users: true,
      },
    });
  }

  async updateConvention(
    id: number,
    conventionUpdateInput: Prisma.ConventionUpdateInput,
    ctx: Context,
  ): Promise<any> {
    return ctx.prisma.convention.update({
      where: {
        id: id,
      },
      data: conventionUpdateInput,
    });
  }

  async importAttendees(userData, conventionId, ctx) {
    return new Promise(async (resolve, rejects) => {
      await this.attendeeService.truncate(conventionId, ctx);

      const convention = await ctx.prisma.convention.findUnique({
        where: {
          id: Number(conventionId),
        },
        include: {
          type: true,
        },
      });

      if (!convention?.tteConventionId) {
        return rejects('Convention missing tteConventionId.');
      }

      const session = await this.tteService.getSession(
        userData.userName,
        userData.password,
        userData.apiKey,
      );

      if (!session) {
        return rejects('invalid tte session');
      }

      const tteBadgeTypes = await this.tteService.getBadgeTypes(
        convention.tteConventionId,
        session,
      );

      if (tteBadgeTypes.length === 0) {
        return rejects('no badge types found');
      }

      const tteBadges = await this.tteService.getBadges(
        convention.tteConventionId,
        session,
      );

      if (tteBadges.length === 0) {
        return rejects('no badges found');
      }

      const attendees = await Promise.all(
        tteBadges.map(async (b) => {
          const badgeNumber =
            convention.startDate.getFullYear().toString().substring(2) +
            convention.typeId +
            b.badge_number.toString().padStart(4, '0');

          const badgeType: string = tteBadgeTypes.filter(
            (bt) => bt.id === b.badgetype_id,
          )[0].name;

          const soldProducts = await this.tteService.getSoldProducts(
            b.id,
            session,
          );

          if (badgeType.includes('Patron')) {
            soldProducts.push('Patron');
          }

          const merch = soldProducts
            .map((s) => s.productvariant?.name)
            .join(', ');

          return <Prisma.AttendeeCreateInput>{
            convention: {
              connect: {
                id: Number(conventionId),
              },
            },
            badgeName: b.name,
            badgeFirstName: b.firstname,
            badgeLastName: b.lastname,
            legalName: b.custom_fields.LegalName
              ? b.custom_fields.LegalName
              : b.name,
            badgeType: {
              connectOrCreate: {
                create: {
                  name: badgeType,
                },
                where: {
                  name: badgeType,
                },
              },
            },
            registrationCode: crypto.randomUUID(),
            email: b.email,
            badgeNumber: badgeNumber,
            barcode: '*' + badgeNumber + '*',
            tteBadgeNumber: b.badge_number,
            pronouns: {
              connectOrCreate: {
                create: {
                  pronouns: b.custom_fields.PreferredPronouns,
                },
                where: {
                  pronouns: b.custom_fields.PreferredPronouns,
                },
              },
            },
            merch: merch,
          };
        }),
      );

      for (const a of attendees) {
        await this.attendeeService.createAttendee(a, ctx);
      }

      return resolve(attendees.length);
    });
  }

  async exportBadgeFile(conventionId: number, ctx: Context) {
    const attendees =
      await this.attendeeService.attendeesWithPronounsAndBadgeTypes(
        conventionId,
        ctx,
      );

    const chunks: any[] = [];

    for await (const chunk of stringify(
      attendees.map((a) => {
        return {
          'Badge Name': a.badgeName,
          'Badge Type': a.badgeType?.name,
          'Badge Number': a.badgeNumber,
          Barcode: a.barcode,
          Pronouns: a.pronouns?.pronouns,
          Merch: a.merch,
        };
      }),
      { header: true },
    )) {
      chunks.push(Buffer.from(chunk));
    }

    return new StreamableFile(Buffer.concat(chunks));
  }

  async checkOutGame(
    id: number,
    copyBarcode: string,
    attendeeBarcode: string,
    collectionId: number,
    ctx: Context,
  ) {
    return await this.checkOutService.checkOut(
      collectionId,
      copyBarcode,
      id,
      attendeeBarcode,
      false,
      ctx,
    );
  }
}
