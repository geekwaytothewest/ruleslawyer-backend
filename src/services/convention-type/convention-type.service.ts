import { Injectable } from '@nestjs/common';
import { Context } from '../prisma/context';
import { ConventionType, Prisma } from '@prisma/client';

@Injectable()
export class ConventionTypeService {
  async createConventionType(
    data: Prisma.ConventionTypeCreateInput,
    ctx: Context,
  ) {
    return ctx.prisma.conventionType.create({ data: data });
  }

  async conventionType(
    conventionTypeWhereUniqueInput: Prisma.ConventionTypeWhereUniqueInput,
    ctx: Context,
  ): Promise<ConventionType | null> {
    try {
      return ctx.prisma.conventionType.findUnique({
        where: conventionTypeWhereUniqueInput,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async conventionTypes(
    organizationId: number,
    ctx: Context,
  ): Promise<ConventionType[]> {
    try {
      return ctx.prisma.conventionType.findMany({
        where: {
          organizationId: organizationId,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
