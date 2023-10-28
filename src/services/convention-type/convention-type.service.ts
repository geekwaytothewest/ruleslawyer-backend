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
    return ctx.prisma.conventionType.findUnique({
      where: conventionTypeWhereUniqueInput,
    });
  }
}
