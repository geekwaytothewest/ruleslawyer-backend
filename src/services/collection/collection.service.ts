import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Context } from '../prisma/context';
import { Collection, Prisma } from '@prisma/client';
import { CopyService } from '../copy/copy.service';

@Injectable()
export class CollectionService {
  constructor(private readonly copyService: CopyService) {}

  async collection(id: number, ctx: Context) {
    return await ctx.prisma.collection.findUnique({
      where: { id: Number(id) },
    });
  }

  async collectionsByOrg(orgId: number, ctx: Context) {
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
    return ctx.prisma.collection.create({
      data: {
        name: name,
        organizationId: Number(orgId),
        allowWinning: allowWinning,
      },
    });
  }

  async updateCollection(
    id: number,
    name: string,
    allowWinning: boolean,
    ctx: Context,
  ) {
    try {
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
        if (!fields?.name) {
          return reject('missing name');
        }

        if (fields?.type !== undefined) {
          if (
            fields?.type.value !== 'Door Prizes' &&
            fields?.type.value !== 'Play and Win'
          ) {
            return reject('invalid type');
          }

          if (!fields?.conventionId) {
            return reject('missing convention id');
          }
        }

        let collection: Collection | null = null;

        try {
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
                return reject('a collection already exists with that name');
            }
          }

          return reject(ex.message);
        }

        if (!collection) {
          return reject('could not create collection');
        }

        if (fields?.type?.value === 'Door Prizes') {
          await ctx.prisma.convention.update({
            where: {
              id: Number(fields.conventionId.value),
              organizationId: Number(orgId),
            },
            data: {
              doorPrizeCollectionId: Number(collection?.id),
            },
          });
        } else if (fields?.type?.value === 'Play and Win') {
          await ctx.prisma.convention.update({
            where: {
              id: Number(fields.conventionId.value),
              organizationId: Number(orgId),
            },
            data: {
              playAndWinCollectionId: Number(collection?.id),
            },
          });
        }

        const copies = await this.uploadCopies(
          orgId,
          collection.id,
          csvData,
          ctx,
        );

        return resolve(copies);
      } catch (ex) {
        return reject(ex);
      }
    });

    return promise;
  }

  async deleteCollection(id: number, ctx: Context) {
    try {
      const conventions = await ctx.prisma.convention.count({
        where: {
          OR: [
            { doorPrizeCollectionId: Number(id) },
            { playAndWinCollectionId: Number(id) },
          ],
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
        const collection = await ctx.prisma.collection.findUnique({
          where: {
            id: Number(collId),
          },
        });

        let importCount = 0;

        parse(csvData, { delimiter: ',' }, async (error, records) => {
          if (error) {
            return reject('invalid csv file');
          }

          for (const r of records) {
            try {
              await this.copyService.createCopy(
                {
                  barcodeLabel: r[1],
                  barcode: '*' + r[1].padStart(5, '0') + '*',
                  game: {
                    connectOrCreate: {
                      create: {
                        name: r[0],
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
            } catch (ex) {}
          }

          return resolve({
            collectionId: collection?.id,
            importCount: importCount,
          });
        });
      } catch (ex) {
        return reject(ex);
      }
    });

    return promise;
  }
}
