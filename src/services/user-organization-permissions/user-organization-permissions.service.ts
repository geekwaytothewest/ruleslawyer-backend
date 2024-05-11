import { Injectable } from '@nestjs/common';
import { Prisma, UserOrganizationPermissions } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class UserOrganizationPermissionsService {
  constructor() {}

  async userOrganizationPermissions(
    id: number,
    ctx: Context,
  ): Promise<UserOrganizationPermissions[]> {
    try {
      return ctx.prisma.userOrganizationPermissions.findMany({
        where: {
          id: id,
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
