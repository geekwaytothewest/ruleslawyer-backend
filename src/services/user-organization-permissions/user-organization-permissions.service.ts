import { Injectable } from '@nestjs/common';
import { Prisma, UserOrganizationPermissions } from '@prisma/client';
import { Context } from '../prisma/context';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class UserOrganizationPermissionsService {
  constructor(
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
  ) {}

  async userOrganizationPermissionsWithOwned(
    id: string,
    authUser: any,
    ctx: Context,
  ): Promise<UserOrganizationPermissions[]> {
    let userOrgPermissions: any = [];
    let userOrgs: any = [];

    const numericId = await this.userService.convertToUserId(id, ctx);

    if (authUser?.superAdmin && authUser?.id === numericId) {
      userOrgs = await this.organizationService.allOrganizations(ctx);
    } else {
      userOrgPermissions = await this.userOrganizationPermissions(id, ctx);
      userOrgs = await this.organizationService.organizationByOwner(
        numericId,
        ctx,
      );
    }

    userOrgs.forEach((uo) => {
      const uop = userOrgPermissions.find(
        (uop) => uop.organizationId === uo.id,
      );

      if (uop) {
        uop.admin = true;
      } else {
        userOrgPermissions.push({
          id: -1,
          userId: numericId,
          organizationId: uo.id,
          admin: true,
          organization: uo,
        });
      }
    });

    return userOrgPermissions;
  }

  async userOrganizationCount(id: string, ctx: Context): Promise<number> {
    const userId = await this.userService.convertToUserId(id, ctx);

    return await ctx.prisma.userOrganizationPermissions.count({
      where: {
        userId: userId,
      },
    });
  }

  async getPermissionsBySearch(
    where: Prisma.UserOrganizationPermissionsWhereInput,
    ctx: Context,
  ): Promise<UserOrganizationPermissions[]> {
    try {
      return await ctx.prisma.userOrganizationPermissions.findMany({
        where: where,
        include: {
          user: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async userOrganizationPermissions(
    id: string,
    ctx: Context,
  ): Promise<UserOrganizationPermissions[]> {
    try {
      const userId = await this.userService.convertToUserId(id, ctx);

      return await ctx.prisma.userOrganizationPermissions.findMany({
        where: {
          userId: userId,
        },
        include: {
          organization: true,
          user: true,
        },
        orderBy: {
          organization: {
            name: 'asc',
          },
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
      return await ctx.prisma.userOrganizationPermissions.create({
        data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getPermission(
    id: Number,
    ctx: Context,
  ): Promise<UserOrganizationPermissions | null> {
    try {
      return await ctx.prisma.userOrganizationPermissions.findUnique({
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
  ): Promise<UserOrganizationPermissions | null> {
    try {
      return await ctx.prisma.userOrganizationPermissions.delete({
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
    data: Prisma.UserOrganizationPermissionsUpdateInput,
    ctx: Context,
  ): Promise<UserOrganizationPermissions> {
    try {
      return await ctx.prisma.userOrganizationPermissions.update({
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
