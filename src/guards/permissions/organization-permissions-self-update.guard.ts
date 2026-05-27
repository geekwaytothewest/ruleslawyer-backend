//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';

@Injectable()
export class OrganizationPermissionsSelfUpdateGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly userOrganizationPermissionsService: UserOrganizationPermissionsService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user?.user;
    const organizationPermissionId = context.getArgByIndex(0).params?.id;

    if (!organizationPermissionId) {
      return false;
    }

    if (!user) {
      return false;
    }

    if (user.superAdmin) {
      return true;
    }

    const organizationPermission = await this.userOrganizationPermissionsService.getPermission(
      Number(organizationPermissionId),
      this.ctx,
    );

    if (!organizationPermission) {
      return false;
    }

    if (organizationPermission.userId !== user.id) {
      return true;
    }

    return false;
  }
}
