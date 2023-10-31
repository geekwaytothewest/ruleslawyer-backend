import { Injectable } from '@nestjs/common';
import { Copy, Prisma } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class CopyService {
  async copy(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<Copy | null> {
    try {
      return ctx.prisma.copy.findUnique({
        where: copyWhereUniqueInput,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async copyWithCollection(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    try {
      return ctx.prisma.copy.findUnique({
        where: copyWhereUniqueInput,
        include: {
          collection: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async copyWithCheckouts(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    try {
      return ctx.prisma.copy.findUnique({
        where: copyWhereUniqueInput,
        include: {
          checkOuts: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async copyWithCheckOutsGameAndCollection(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    try {
      return ctx.prisma.copy.findUnique({
        where: copyWhereUniqueInput,
        include: {
          collection: true,
          checkOuts: {
            include: {
              attendee: true,
            },
          },
          game: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async createCopy(
    data: Prisma.CopyCreateInput,
    ctx: Context,
  ): Promise<Copy | null> {
    try {
      return ctx.prisma.copy.create({ data });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async updateCopy(
    params: {
      where: Prisma.CopyWhereUniqueInput;
      data: Prisma.CopyUpdateInput;
    },
    ctx: Context,
  ) {
    const { where, data } = params;

    try {
      return ctx.prisma.copy.update({ data, where });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async searchCopies(where: Prisma.CopyWhereInput, ctx: Context) {
    try {
      return ctx.prisma.copy.findMany({
        where: where,
        include: {
          collection: {
            include: {
              organization: true,
            },
          },
          game: true,
          checkOuts: {
            include: {
              attendee: true,
            },
          },
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
