//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';

@Injectable()
export class ConventionPermissionsSelfUpdateGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly userConventionPermissionsService: UserConventionPermissionsService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user?.user;
    const conventionPermissionId = context.getArgByIndex(0).params?.id;

    if (!conventionPermissionId) {
      return false;
    }

    if (!user) {
      return false;
    }

    if (user.superAdmin) {
      return true;
    }

    const conventionPermission = await this.userConventionPermissionsService.getPermission(
      Number(conventionPermissionId),
      this.ctx,
    );

    if (!conventionPermission) {
      return false;
    }

    if (conventionPermission.userId !== user.id) {
      return true;
    }

    return false;
  }
}
