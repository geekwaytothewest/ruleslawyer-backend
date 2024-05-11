import { Injectable } from '@nestjs/common';
import { Prisma, UserConventionPermissions } from '@prisma/client';
import { Context } from '../prisma/context';
import { UserService } from '../user/user.service';

@Injectable()
export class UserConventionPermissionsService {
  constructor(private readonly userService: UserService) {}

  async userConventionPermissions(
    id: string,
    ctx: Context,
  ): Promise<UserConventionPermissions[]> {
    try {
      const userId = await this.userService.convertToUserId(id, ctx);

      return ctx.prisma.userConventionPermissions.findMany({
        where: {
          userId: userId,
        },
        include: {
          convention: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async userConventionCount(id: string, ctx: Context): Promise<number> {
    const userId = await this.userService.convertToUserId(id, ctx);

    return await ctx.prisma.userConventionPermissions.count({
      where: {
        userId: userId,
      },
    });
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
