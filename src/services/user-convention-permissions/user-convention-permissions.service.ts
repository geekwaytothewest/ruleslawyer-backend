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

      return await ctx.prisma.userConventionPermissions.findMany({
        where: {
          userId: userId,
        },
        include: {
          convention: true,
        },
        orderBy: {
          convention: {
            startDate: 'desc',
          },
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
      return await ctx.prisma.userConventionPermissions.create({
        data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getPermission(
    id: Number,
    ctx: Context,
  ): Promise<UserConventionPermissions | null> {
    try {
      return await ctx.prisma.userConventionPermissions.findUnique({
        where: {
          id: Number(id),
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async deletePermission(
    id: Number,
    ctx: Context,
  ): Promise<UserConventionPermissions | null> {
    try {
      return await ctx.prisma.userConventionPermissions.delete({
        where: {
          id: Number(id),
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async updatePermission(
    id: Number,
    data: Prisma.UserConventionPermissionsUpdateInput,
    ctx: Context,
  ) {
    try {
      return await ctx.prisma.userConventionPermissions.update({
        where: {
          id: Number(id),
        },
        data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
