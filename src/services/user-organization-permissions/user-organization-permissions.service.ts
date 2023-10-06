import { Injectable } from '@nestjs/common';
import { Prisma, UserOrganizationPermissions } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class UserOrganizationPermissionsService {
  constructor() {}

  async createPermission(
    data: Prisma.UserOrganizationPermissionsCreateInput,
    ctx: Context,
  ): Promise<UserOrganizationPermissions> {
    return ctx.prisma.userOrganizationPermissions.create({
      data,
    });
  }
}
