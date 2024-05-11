import { Injectable } from '@nestjs/common';
import { Prisma, UserConventionPermissions } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class UserConventionPermissionsService {
  constructor() {}

  async userConventionPermissions(
    id: string,
    ctx: Context,
  ): Promise<UserConventionPermissions[]> {
    try {
      let userId: number = Number(id);

      if (!Number.isInteger(Number(id))) {
        const user = await ctx.prisma.user.findUnique({
          where: { id: Number(id) },
        });

        userId = Number(user?.id);
      }

      return ctx.prisma.userConventionPermissions.findMany({
        where: {
          id: userId,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async createPermission(
    data: Prisma.UserConventionPermissionsCreateInput,
    ctx: Context,
  ): Promise<UserConventionPermissions> {
    try {
      return ctx.prisma.userConventionPermissions.create({
        data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getPermission(
    where: Prisma.UserConventionPermissionsWhereUniqueInput,
    ctx: Context,
  ) {
    try {
      return ctx.prisma.userConventionPermissions.findUnique({
        where: where,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
