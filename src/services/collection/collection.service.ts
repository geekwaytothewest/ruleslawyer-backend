import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Context } from '../prisma/context';
import { Collection, Prisma } from '@prisma/client';
import { CopyService } from '../copy/copy.service';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';

@Injectable()
export class CollectionService {
  constructor(private readonly copyService: CopyService) {}
  private readonly logger = new RuleslawyerLogger(CollectionService.name);
  async collection(id: number, ctx: Context): Promise<any> {
    const query: Prisma.CollectionFindUniqueArgs = {
      where: { id: Number(id) },
      include: {
        _count: true,
        conventions: true,
        copies: {
          include: {
            game: true,
            checkOuts: {
              orderBy: {
                checkOut: 'desc',
              },
            },
          },
          orderBy: {
            game: {
              name: 'asc',
            },
          },
        },
      },
    };

    return await ctx.prisma.collection.findUnique(query);
  }

  async collectionCopiesByGames(
    id: number,
    limit: number,
    filter: string,
    ctx: Context,
  ) {
    const query: Prisma.CollectionFindUniqueArgs = {
      where: {
        id: Number(id),
      },
    };

    const collection: any = await ctx.prisma.collection.findUnique(query);

    const gameQuery: Prisma.GameFindManyArgs = {
      include: {
        copies: {
          include: {
            checkOuts: true,
            game: true,
          },
          where: {
            collectionId: Number(id),
          },
        },
        _count: true,
      },
      where: {
        copies: {
          some: {
            collectionId: Number(id),
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    };

    if (limit && !Number.isNaN(Number(limit))) {
      gameQuery.take = Number(limit);
    }

    if (filter) {
      gameQuery.where = {
        AND: [
          {
            OR: [
              { name: { search: filter.split(' ').join(' <-> ') } },
              { name: { contains: filter, mode: 'insensitive' } },
              { name: { startsWith: filter, mode: 'insensitive' } },
            ],
          },
          {
            copies: {
              some: {
                collectionId: Number(id),
              },
            },
          },
        ],
      };
    }

    collection.games = await ctx.prisma.game.findMany(gameQuery);

    return collection;
  }

  async collectionsByOrgWithCopies(orgId: number, ctx: Context) {
    this.logger.log(`Getting collections for orgId=${orgId}`);
    return await ctx.prisma.collection.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        copies: {
          include: {
            checkOuts: {
              include: {
                attendee: true,
              },
            },
            collection: true,
            game: true,
          },
        },
        _count: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async collectionsByOrg(orgId: number, ctx: Context) {
    this.logger.log(`Getting collections for orgId=${orgId}`);
    return await ctx.prisma.collection.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        _count: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createCollection(
    orgId: number,
    name: string,
    allowWinning: boolean,
    ctx: Context,
  ) {
    try {
      this.logger.log(
        `Creating collection with name=${name}, orgId=${orgId}, allowWinning=${allowWinning}`,
      );
      return ctx.prisma.collection.create({
        data: {
          name: name,
          organizationId: Number(orgId),
          allowWinning: allowWinning,
        },
      });
    } catch (ex) {
      this.logger.error(
        `Failed to create collection with name=${name}, orgId=${orgId}, allowWinning=${allowWinning}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }

  async updateCollection(
    id: number,
    name: string,
    allowWinning: boolean,
    ctx: Context,
  ) {
    try {
      this.logger.log(
        `Updating collection with name=${name}, id=${id}, allowWinning=${allowWinning}`,
      );
      return await ctx.prisma.collection.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          allowWinning: allowWinning,
        },
      });
    } catch (ex) {
      this.logger.error(
        `Failed to update collection with name=${name}, id=${id}, allowWinning=${allowWinning}, ex=${ex}`,
      );
      return Promise.reject(ex);
    }
  }

  async importCollection(
    orgId: number,
    fields: any,
    csvData: Buffer,
    ctx: Context,
  ) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        this.logger.log(`Importing collection for orgId=${orgId}`);
        if (!fields?.name) {
          this.logger.error(`Missing name, ${JSON.stringify(fields)}`);
          return reject('missing name');
        }

        if (fields?.type !== undefined) {
          if (
            // I think this might want to be an || rather than an &&
            fields?.type.value !== 'Door Prizes' &&
            fields?.type.value !== 'Play and Win'
          ) {
            this.logger.error(
              `Invalid collection type, ${JSON.stringify(fields)}`,
            );
            return reject('invalid type');
          }

          if (!fields?.conventionId) {
            this.logger.error(
              `Missing conventionId, ${JSON.stringify(fields)}`,
            );
            return reject('missing convention id');
          }
        }

        let collection: Collection | null = null;

        try {
          this.logger.log(
            `Creating collection with name=${fields?.name.value} for orgId=${orgId}, allowWinning=${fields?.allowWinning?.value}`,
          );
          collection = await ctx.prisma.collection.create({
            data: {
              name: fields.name.value,
              organizationId: Number(orgId),
              allowWinning:
                fields?.allowWinning?.value === 'true' ? true : false,
            },
          });
        } catch (ex) {
          if (ex instanceof Prisma.PrismaClientKnownRequestError) {
            switch (ex.code) {
              case 'P2002':
                this.logger.error(
                  `Failed to import collection for orgId=${orgId}; a collection already exists with that name`,
                );
                return reject('a collection already exists with that name');
            }
          }

          this.logger.error(
            `Failed to import collection for orgId=${orgId}, ex=${ex}`,
          );
          return reject(ex.message);
        }

        if (!collection) {
          this.logger.error(
            `Attempted to create collection for orgId=${orgId}; creation failed`,
          );
          return reject('could not create collection');
        }

        this.logger.log(
          `Uploading copies for orgId=${orgId}, collectionId=${collection.id}`,
        );
        const copies = await this.uploadCopies(
          orgId,
          collection.id,
          csvData,
          ctx,
        );

        return resolve(copies);
      } catch (ex) {
        this.logger.log(`Importing collection for orgId=${orgId}, ex=${ex}`);
        return reject(ex);
      }
    });

    return promise;
  }

  async deleteCollection(id: number, ctx: Context) {
    try {
      const conventions = await ctx.prisma.convention.count({
        where: {
          collections: {
            some: {
              collectionId: id,
            },
          },
        },
      });

      if (conventions) {
        return 'cannot delete a collection tied to a convention';
      }

      const copies = await ctx.prisma.copy.findMany({
        where: {
          collection: {
            id: Number(id),
          },
        },
        include: {
          collection: {},
        },
      });

      if (copies) {
        for (const c of copies) {
          await ctx.prisma.copy.delete({
            where: {
              id: c.id,
            },
          });
        }
      }

      await ctx.prisma.collection.delete({ where: { id: Number(id) } });

      return 'deleted';
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async uploadCopies(
    orgId: number,
    collId: number,
    csvData: Buffer,
    ctx: Context,
  ) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        this.logger.log(
          `Uploading copies for orgId=${orgId}, collId=${collId}`,
        );
        this.logger.log(`Getting collection with collId=${collId}`);

        // what should happen if there is no collection here?
        const collection = await ctx.prisma.collection.findUnique({
          where: {
            id: Number(collId),
          },
        });

        let importCount = 0;

        parse(csvData, { delimiter: ',' }, async (error, records) => {
          if (error) {
            this.logger.error(`csv could not be parsed`);
            return reject('invalid csv file');
          }

          for (const r of records) {
            try {
              this.logger.log(`Creating copy with record=${r}`);
              await this.copyService.createCopy(
                {
                  barcodeLabel: r[1],
                  barcode: '*' + r[1].padStart(5, '0') + '*',
                  game: {
                    connectOrCreate: {
                      create: {
                        name: r[0],
                        organizationId: Number(orgId),
                        maxPlayers: r[2],
                      },
                      where: {
                        name: r[0],
                      },
                    },
                  },
                  dateAdded: new Date(),
                  winnable: collection?.allowWinning,
                  collection: {
                    connect: {
                      id: Number(collection?.id),
                    },
                  },
                  organization: {
                    connect: {
                      id: Number(orgId),
                    },
                  },
                },
                ctx,
              );

              importCount++;
            } catch (ex) {
              this.logger.error(
                `Failed to create copy with record=${r}; continuing to create remaining copies`,
              );
            }
          }

          this.logger.log(
            `Created ${importCount} copies in collection with collectionId=${collection?.id}`,
          );
          return resolve({
            collectionId: collection?.id,
            importCount: importCount,
          });
        });
      } catch (ex) {
        this.logger.error(
          `Failed to upload copies for orgId=${orgId}, collId=${collId}, ex=${ex}`,
        );
        return reject(ex);
      }
    });

    return promise;
  }
}
