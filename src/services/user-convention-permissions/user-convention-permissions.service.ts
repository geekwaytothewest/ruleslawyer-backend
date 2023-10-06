import { Injectable } from '@nestjs/common';
import { Prisma, UserConventionPermissions } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class UserConventionPermissionsService {
  constructor() {}

  async createPermission(
    data: Prisma.UserConventionPermissionsCreateInput,
    ctx: Context,
  ): Promise<UserConventionPermissions> {
    return ctx.prisma.userConventionPermissions.create({
      data,
    });
  }
}
