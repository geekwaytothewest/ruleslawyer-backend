import {
  ConflictException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { Convention, Prisma } from '@prisma/client';
import { AttendeeService } from '../attendee/attendee.service';
import { TabletopeventsService } from '../tabletopevents/tabletopevents.service';
import * as crypto from 'crypto';
import { Context } from '../prisma/context';
import { CheckOutService } from '../check-out/check-out.service';
import { stringify } from 'csv-stringify';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import { parse } from 'csv-parse';

// Convention type fields safe to embed in convention responses: every scalar
// except the logo/logoSquare Bytes blobs, which would bloat every list payload.
const conventionTypeSelect: Prisma.ConventionTypeSelect = {
  id: true,
  name: true,
  description: true,
  icon: true,
  content: true,
  organizationId: true,
};

@Injectable()
export class ConventionService {
  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    ConventionService.name,
  );
  // Guards against overlapping attendee imports (TTE or CSV). Both write
  // attendees to a convention, so only one may run at a time.
  private importInProgress = false;
  constructor(
    private readonly attendeeService: AttendeeService,
    private readonly tteService: TabletopeventsService,
    private readonly checkOutService: CheckOutService,
  ) {}

  async createConvention(
    data: Prisma.ConventionCreateInput,
    ctx: Context,
  ): Promise<Convention> {
    try {
      const con = await ctx.prisma.convention.create({
        data,
      });

      return con;
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async convention(
    conventionWhereUniqueInput: Prisma.ConventionWhereUniqueInput,
    ctx: Context,
  ): Promise<Convention | null> {
    try {
      return await ctx.prisma.convention.findUnique({
        where: conventionWhereUniqueInput,
        include: {
          type: { select: conventionTypeSelect },
          collections: {
            include: {
              collection: {
                include: {
                  _count: true,
                },
              },
            },
            orderBy: {
              collection: {
                name: 'asc',
              },
            },
          },
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async conventionWithUsers(
    conventionWhereUniqueInput: Prisma.ConventionWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    try {
      return await ctx.prisma.convention.findUnique({
        where: conventionWhereUniqueInput,
        include: {
          users: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async updateConvention(
    id: number,
    conventionUpdateInput: Prisma.ConventionUpdateInput,
    ctx: Context,
  ): Promise<any> {
    try {
      return await ctx.prisma.convention.update({
        where: {
          id: id,
        },
        data: conventionUpdateInput,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  /**
   * Launches importAttendees in the background and returns at once, so a
   * multi-minute run doesn't hold the HTTP request open (which trips client
   * IPC / proxy idle timeouts). Progress is visible in the server logs. A
   * second import while one is already running is rejected with 409.
   */
  startImportAttendees(userData, conventionId, ctx: Context) {
    if (this.importInProgress) {
      throw new ConflictException(
        'An attendee import is already running; wait for it to finish (watch the server logs).',
      );
    }

    this.importInProgress = true;
    this.logger.log('Attendee import (TTE) started in the background.');

    // Fire-and-forget: do NOT await. Errors are logged; the flag always clears.
    void this.importAttendees(userData, conventionId, ctx)
      .catch((error: any) =>
        this.logger.error(
          `Background attendee import (TTE) failed: ${error?.message ?? error}`,
        ),
      )
      .finally(() => {
        this.importInProgress = false;
        this.logger.log('Attendee import (TTE) finished.');
      });

    return {
      status: 'started',
      message: 'Attendee import started; monitor the server logs for progress.',
    };
  }

  /**
   * Background launcher for importAttendeesCSV. The controller must read the
   * uploaded file into a buffer before calling this (the request body can't be
   * read after we return). Mirrors startImportAttendees otherwise.
   */
  startImportAttendeesCSV(buffer, conventionId, ctx: Context) {
    if (this.importInProgress) {
      throw new ConflictException(
        'An attendee import is already running; wait for it to finish (watch the server logs).',
      );
    }

    this.importInProgress = true;
    this.logger.log('Attendee import (CSV) started in the background.');

    // Fire-and-forget: do NOT await. Errors are logged; the flag always clears.
    void this.importAttendeesCSV(buffer, conventionId, ctx)
      .catch((error: any) =>
        this.logger.error(
          `Background attendee import (CSV) failed: ${error?.message ?? error}`,
        ),
      )
      .finally(() => {
        this.importInProgress = false;
        this.logger.log('Attendee import (CSV) finished.');
      });

    return {
      status: 'started',
      message: 'Attendee import started; monitor the server logs for progress.',
    };
  }

  async importAttendeesCSV(userData, conventionId, ctx) {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log(`Importing attendees for conventionId=${conventionId}`);

        parse(userData, { delimiter: ',' }, async (error, records) => {
          if (error) {
            this.logger.error(`csv could not be parsed`);
            return reject('invalid csv file');
          }

          let importCount = 0;

          this.logger.log(`Getting attendees for ${records.length} badges`);

          const attendees = await Promise.all(
            records.map(async (b) => {
              const badgeNumber = b[2];

              return <Prisma.AttendeeCreateInput>{
                convention: {
                  connect: {
                    id: Number(conventionId),
                  },
                },
                badgeName: b[0] + ' ' + b[1],
                badgeFirstName: b[0],
                badgeLastName: b[1],
                legalName: b[0] + ' ' + b[1],
                registrationCode: crypto.randomUUID(),
                badgeNumber: badgeNumber,
                barcode: '*' + badgeNumber + '*',
                tteBadgeNumber: null,
                tteBadgeId: null,
                merch: null,
              };
            }),
          );

          this.logger.log(`Importing ${attendees?.length} attendees`);
          for (const a of attendees) {
            try {
              await this.attendeeService.createAttendee(a, ctx);
              importCount++;
            } catch (ex) {
              this.logger.error(
                `Failed to import attendee with badgeNumber=${a.badgeNumber}`,
              );
            }
          }

          this.logger.log(`Imported ${importCount} attendees`);
          return resolve(importCount);
        });
      } catch (ex) {
        this.logger.error(
          `Failed to import attendees for conventionId=${conventionId}`,
        );
        return reject(ex);
      }
    });
  }

  async importAttendees(userData, conventionId, ctx) {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log(`Importing attendees for conventionId=${conventionId}`);
        this.logger.log(`Getting convention with conventionId=${conventionId}`);
        const convention = await ctx.prisma.convention.findUnique({
          where: {
            id: Number(conventionId),
          },
          include: {
            type: { select: conventionTypeSelect },
          },
        });

        if (!convention?.tteConventionId) {
          this.logger.error(
            `Failed to get convention with conventionId=${conventionId}`,
          );
          return reject('Convention missing tteConventionId.');
        }

        this.logger.log(`Getting TTE session for user=${userData.userName}`);
        const session = await this.tteService.getSession(
          userData.userName,
          userData.password,
          userData.apiKey,
        );

        if (!session) {
          this.logger.error(
            `Failed to get TTE session for user=${userData.userName}`,
          );
          return reject('invalid tte session');
        }

        this.logger.log(
          `Getting badge types for convention with tteConventionId=${convention.tteConventionId}`,
        );
        const tteBadgeTypes = await this.tteService.getBadgeTypes(
          convention.tteConventionId,
          session,
        );

        if (tteBadgeTypes.length === 0) {
          this.logger.error(
            `No badge types found for convention with tteConventionId=${convention.tteConventionId}`,
          );
          return reject('no badge types found');
        }

        let tteBadges: any[] = [];

        if (userData.tteBadgeId) {
          this.logger.log(
            `Getting badge for tteBadgeId=${userData.tteBadgeId}`,
          );
          tteBadges.push(
            await this.tteService.getBadge(
              convention.tteConventionId,
              userData.tteBadgeNumber,
              userData.tteBadgeId,
              session,
            ),
          );
        } else {
          this.logger.log(
            `Getting badge list for tteConventionId=${convention.tteConventionId}`,
          );
          tteBadges = await this.tteService.getBadges(
            convention.tteConventionId,
            session,
          );
        }

        if (tteBadges.length === 0) {
          this.logger.error(
            `No badges found for tteBadgeId=${userData.tteBadgeId}, tteConventionId=${convention.tteConventionId}`,
          );
          return reject('no badges found');
        }

        // Fetch sold products up front and group them by badge. For a full
        // import this is one convention-wide paginated sweep (~30-90 requests)
        // instead of one request per badge (~3000). The single-badge path
        // still fetches just that badge's products.
        this.logger.log(
          `Getting sold products for ${tteBadges.length} badges`,
        );
        const soldProductsByBadge = new Map<string, any[]>();
        if (tteBadges.length === 1) {
          soldProductsByBadge.set(
            tteBadges[0].id,
            await this.tteService.getSoldProducts(tteBadges[0].id, session),
          );
        } else {
          const allSoldProducts =
            await this.tteService.getConventionSoldProducts(
              convention.tteConventionId,
              session,
            );
          for (const sp of allSoldProducts) {
            const list = soldProductsByBadge.get(sp.badge_id) ?? [];
            list.push(sp);
            soldProductsByBadge.set(sp.badge_id, list);
          }
        }

        this.logger.log(`Getting attendees for ${tteBadges.length} badges`);
        const attendees: Prisma.AttendeeCreateInput[] = [];
        let count = 0;
        for (const b of tteBadges) {
          count++;

          if (count % 100 === 0) {
            this.logger.log(`Status Update: Built attendees for badge ${count} of ${tteBadges.length}`);
          }

          const badgeNumber =
            convention.startDate.getFullYear().toString().substring(2) +
            convention.typeId +
            b.badge_number.toString().padStart(4, '0');

          const badgeType: string = tteBadgeTypes.filter(
            (bt) => bt.id === b.badgetype_id,
          )[0].name;

          const soldProducts = soldProductsByBadge.get(b.id) ?? [];

          const merchItems = soldProducts
            .map((s) => s.productvariant?.name)
            .filter(Boolean);

          if (badgeType.includes('Patron')) {
            merchItems.push('Patron');
          }

          const merch = merchItems.join(', ');

          attendees.push(<Prisma.AttendeeCreateInput>{
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
            tteBadgeId: b.id,
            pronouns: {
              connectOrCreate: {
                create: {
                  pronouns: b.custom_fields?.PreferredPronouns
                    ? b.custom_fields.PreferredPronouns
                    : 'Prefer Not To Say',
                },
                where: {
                  pronouns: b.custom_fields?.PreferredPronouns
                    ? b.custom_fields.PreferredPronouns
                    : 'Prefer Not To Say',
                },
              },
            },
            merch: merch,
          });
        }

        this.logger.log(`Syncing ${attendees?.length} attendees`);
        for (const a of attendees) {
          await this.attendeeService.syncAttendee(a, ctx);
        }

        this.logger.log(`Synced ${attendees?.length} attendees`);
        return resolve(attendees.length);
      } catch (ex) {
        let message = '';
        if (ex instanceof Error) {
          message = ex.message;
        }

        this.logger.error(
          `Failed to import attendees for conventionId=${conventionId} ${message}`,
        );
        return reject(ex);
      }
    });
  }

  async exportBadgeFile(conventionId: number, ctx: Context) {
    try {
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
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async checkOutGame(
    id: number,
    copyBarcode: string,
    attendeeBarcode: string,
    collectionId: number,
    ctx: Context,
    user: any,
  ) {
    try {
      return await this.checkOutService.checkOut(
        collectionId,
        copyBarcode,
        id,
        attendeeBarcode,
        false,
        ctx,
        user,
      );
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async conventionsByOrg(organizationId: number, ctx: Context) {
    try {
      return await ctx.prisma.convention.findMany({
        where: {
          organizationId: organizationId,
        },
        include: {
          type: { select: conventionTypeSelect },
        },
        orderBy: {
          startDate: 'desc',
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async conventions(user: any, ctx: Context) {
    try {
      return await ctx.prisma.convention.findMany({
        // Super admins can see every convention; everyone else is limited to
        // conventions in an organization they belong to or that they have a
        // direct permission on.
        where: user.superAdmin
          ? undefined
          : {
              OR: [
                {
                  organization: {
                    users: {
                      some: {
                        userId: user.id,
                      },
                    },
                  },
                },
                {
                  users: {
                    some: {
                      userId: user.id,
                    },
                  },
                },
              ],
            },
        include: {
          type: { select: conventionTypeSelect },
        },
        orderBy: {
          startDate: 'desc',
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async attachCollection(
    conventionId: number,
    collectionId: number,
    ctx: Context,
  ) {
    try {
      return await ctx.prisma.conventionCollections.create({
        data: {
          collectionId: Number(collectionId),
          conventionId: Number(conventionId),
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async detachCollection(
    conventionId: number,
    collectionId: number,
    ctx: Context,
  ) {
    try {
      return await ctx.prisma.conventionCollections.delete({
        where: {
          conventionId_collectionId: {
            collectionId: Number(collectionId),
            conventionId: Number(conventionId),
          },
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async addUserByEmail(
    conventionId: number,
    email: string,
    permissions: {
      admin: boolean;
      geekGuide: boolean;
      attendee: boolean;
    },
    ctx: Context,
  ) {
    try {
      let user = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            email,
          },
        });
      }

      return await ctx.prisma.userConventionPermissions.create({
        data: {
          userId: user.id,
          conventionId: Number(conventionId),
          admin: permissions.admin,
          geekGuide: permissions.geekGuide,
          attendee: permissions.attendee,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getAttendees(conventionId: number, limit: number, filter: string, page: number, ctx: Context) {
    try {
      let query: Prisma.AttendeeFindManyArgs = {
        where: {
          conventionId: conventionId,
        },
        include: {
          pronouns: true,
          badgeType: true,
        },
        orderBy: [{ badgeLastName: 'asc' }, { badgeFirstName: 'asc' }],
      };

      const MAX_ATTENDEE_LIMIT = 500;

      // Always bound the page size. Without a `take`, "All" (or any non-numeric
      // value) makes Prisma fetch every game with its nested copies/checkOuts,
      // producing a payload too large for JSON.stringify to serialize
      // (RangeError: Invalid string length). A numeric limit is clamped to the
      // cap; "All"/invalid falls back to the cap itself.
      const requested = Number(limit);
      const pageSize =
        limit && !Number.isNaN(requested)
          ? Math.min(requested, MAX_ATTENDEE_LIMIT)
          : MAX_ATTENDEE_LIMIT;

      // 1-based page number; anything missing/invalid/below 1 means the first page.
      const requestedPage = Number(page);
      const currentPage =
        page && !Number.isNaN(requestedPage) && requestedPage >= 1
          ? Math.floor(requestedPage)
          : 1;

      query.take = pageSize;
      query.skip = (currentPage - 1) * pageSize;

      const clauses: Prisma.AttendeeWhereInput[] = [
        { badgeName: { contains: filter, mode: 'insensitive' } },
        { badgeLastName: { contains: filter, mode: 'insensitive' } },
        { badgeFirstName: {contains: filter, mode: 'insensitive' }},
        { legalName: {contains: filter, mode: 'insensitive' }},
      ];

      const search = (filter ?? '')
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean)
        .join(' <-> ');

      if (search) {
        clauses.unshift({ badgeName: { search } });
        clauses.unshift({ badgeLastName: { search } });
        clauses.unshift({ badgeFirstName: { search } });
        clauses.unshift({ legalName: { search } });
      }

      if (filter) {
        // AND the name filter onto the existing where so the convention
        // scoping above is preserved. Merging into the top-level `OR` instead
        // would overwrite that scoping and search every attendee globally.
        query.where = {
          AND: [
            query.where!,
            {
              OR: clauses
            },
          ],
        };
      }

      const [data, total] = await ctx.prisma.$transaction([
        ctx.prisma.attendee.findMany(query),
        ctx.prisma.attendee.count({ where: query.where }),
      ]);

      return {
        data,
        total,
        page: currentPage,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore: currentPage * pageSize < total,
      };
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
