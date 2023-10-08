import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Context } from '../prisma/context';

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
    name: string,
    csvData: Buffer,
    ctx: Context,
  ) {
    const promise = new Promise(async (resolve) => {
      const collection = await ctx.prisma.collection.create({
        data: {
          name: name,
          organizationId: Number(orgId),
        },
      });

      let importCount = 0;

      parse(csvData, { delimiter: ',' }, async (error, records) => {
        if (error) {
          return error;
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
                  id: collection.id,
                },
              },
            },
          });

          importCount++;
        }

        resolve(importCount);
      });
    });

    return promise;
  }

  async deleteCollection(id: number, ctx: Context) {
    const conventions = await ctx.prisma.convention.count({
      where: {
        OR: [{ doorPrizeCollectionId: id }, { playAndWinCollectionId: id }],
      },
    });

    if (conventions) {
      return 'cannot delete a collection tied to a convention.';
    }

    await ctx.prisma.collection.delete({ where: { id: Number(id) } });

    return 'deleted';
  }
}
