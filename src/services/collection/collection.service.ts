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
          return reject('invalid csv file');
        }

        for (const r of records) {
          await ctx.prisma.copy.create({
            data: {
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
              winnable: false,
              collection: {
                connect: {
                  id: Number(collection?.id),
                },
              },
            },
          });

          importCount++;
        }

        return resolve({
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
  }
}
