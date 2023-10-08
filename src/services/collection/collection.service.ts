import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Context } from '../prisma/context';

@Injectable()
export class CollectionService {
  constructor() {}

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

      parse(csvData, { delimiter: ',' }, async (error, records) => {
        if (error) {
          return error;
        }

        for (const r of records) {
          await ctx.prisma.copy.create({
            data: {
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
        }

        resolve('imported');
      });
    });

    return promise;
  }
}
