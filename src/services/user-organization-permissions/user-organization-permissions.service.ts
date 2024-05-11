import { Injectable } from '@nestjs/common';
import { Prisma, UserOrganizationPermissions } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class UserOrganizationPermissionsService {
  constructor() {}

  async userOrganizationPermissions(
    id: string,
    ctx: Context,
  ): Promise<UserOrganizationPermissions[]> {
    try {
      let userId: number = Number(id);

      if (!Number.isInteger(userId)) {
        const user = await ctx.prisma.user.findUnique({
          where: { id: Number(id) },
        });

        userId = Number(user?.id);
      }

      return ctx.prisma.userOrganizationPermissions.findMany({
        where: {
          id: userId,
        },
        include: {
          organization: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
  async createPermission(
    data: Prisma.UserOrganizationPermissionsCreateInput,
    ctx: Context,
  ): Promise<UserOrganizationPermissions> {
    try {
      return ctx.prisma.userOrganizationPermissions.create({
        data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
