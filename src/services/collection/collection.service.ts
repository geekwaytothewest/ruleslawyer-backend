import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Context } from '../prisma/context';
import { Collection, Prisma } from '@prisma/client';

@Injectable()
export class CollectionService {
  constructor() {}

  async collection(id: number, ctx: Context) {
    return await ctx.prisma.collection.findUnique({
      where: { id: Number(id) },
    });
  }

  async importCollection(
    orgId: number,
    fields: any,
    csvData: Buffer,
    ctx: Context,
  ) {
    const promise = new Promise(async (resolve, reject) => {
      if (!fields?.name) {
        reject('missing name');
        return;
      }

      if (fields?.type !== undefined) {
        if (
          fields?.type.value !== 'Door Prizes' &&
          fields?.type.value !== 'Play and Win'
        ) {
          reject('invalid type');
          return;
        }

        if (!fields?.conventionId) {
          reject('missing convention id');
          return;
        }
      }

      let collection: Collection | null = null;

      try {
        collection = await ctx.prisma.collection.create({
          data: {
            name: fields.name.value,
            organizationId: Number(orgId),
          },
        });
      } catch (ex) {
        if (ex instanceof Prisma.PrismaClientKnownRequestError) {
          switch (ex.code) {
            case 'P2002':
              reject('a collection already exists with that name');
              return;
              break;
          }
        }

        reject(ex.message);
        return;
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

      let importCount = 0;

      parse(csvData, { delimiter: ',' }, async (error, records) => {
        if (error) {
          reject(error);
          return;
        }

        for (const r of records) {
          await ctx.prisma.copy.create({
            data: {
              barcodeNumber: Number(r[1]),
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
              winnable: false,
              collections: {
                connect: {
                  id: Number(collection?.id),
                },
              },
            },
          });

          importCount++;
        }

        resolve({
          collectionId: collection?.id,
          importCount: importCount,
        });
      });
    });

    return promise;
  }

  async deleteCollection(id: number, ctx: Context) {
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
        collections: {
          some: {
            id: Number(id),
          },
        },
      },
      include: {
        collections: {},
      },
    });

    if (copies) {
      for (const c of copies) {
        const count = c.collections.filter((c) => c.id !== Number(id)).length;

        if (!count) {
          await ctx.prisma.copy.delete({
            where: {
              id: c.id,
            },
          });
        }
      }
    }

    await ctx.prisma.collection.delete({ where: { id: Number(id) } });

    return 'deleted';
  }
}
