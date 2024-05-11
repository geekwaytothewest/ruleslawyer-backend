import { Injectable } from '@nestjs/common';
import { Prisma, UserOrganizationPermissions } from '@prisma/client';
import { Context } from '../prisma/context';
import { UserService } from '../user/user.service';

@Injectable()
export class UserOrganizationPermissionsService {
  constructor(private readonly userService: UserService) {}

  async userOrganizationCount(id: string, ctx: Context): Promise<number> {
    const userId = await this.userService.convertToUserId(id, ctx);

    return await ctx.prisma.userOrganizationPermissions.count({
      where: {
        userId: userId,
      },
    });
  }

  async userOrganizationPermissions(
    id: string,
    ctx: Context,
  ): Promise<UserOrganizationPermissions[]> {
    try {
      const userId = await this.userService.convertToUserId(id, ctx);

      return ctx.prisma.userOrganizationPermissions.findMany({
        where: {
          userId: userId,
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
