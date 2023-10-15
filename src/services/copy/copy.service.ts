import { Injectable } from '@nestjs/common';
import { Copy, Prisma } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class CopyService {
  async copy(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<Copy | null> {
    return ctx.prisma.copy.findUnique({
      where: copyWhereUniqueInput,
    });
  }

  async copyWithCollection(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    return ctx.prisma.copy.findUnique({
      where: copyWhereUniqueInput,
      include: {
        collection: true,
      },
    });
  }

  async copyWithCheckouts(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    return ctx.prisma.copy.findUnique({
      where: copyWhereUniqueInput,
      include: {
        checkOuts: true,
      },
    });
  }

  async createCopy(
    data: Prisma.CopyCreateInput,
    ctx: Context,
  ): Promise<Copy | null> {
    return ctx.prisma.copy.create({ data });
  }

  async updateCopy(
    params: {
      where: Prisma.CopyWhereUniqueInput;
      data: Prisma.CopyUpdateInput;
    },
    ctx: Context,
  ) {
    const { where, data } = params;
    return ctx.prisma.copy.update({ data, where });
  }
}
