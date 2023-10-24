import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';

@Injectable()
export class CheckOutGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly conventionService: ConventionService,
    private readonly prismaService: PrismaService,
    private readonly organizationService: OrganizationService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user?.user;
    const organizationId = context.getArgByIndex(0).params?.id;
    const collectionId = context.getArgByIndex(0).params?.colId;
    const conventionId = context.getArgByIndex(0).params?.conId;

    if (!user) {
      return false;
    }

    if (!organizationId) {
      return false;
    }

    if (!conventionId) {
      return false;
    }

    if (!collectionId) {
      return false;
    }

    const convention = await this.conventionService.conventionWithUsers(
      {
        id: Number(conventionId),
      },
      this.ctx,
    );

    if (convention?.organizationId !== Number(organizationId)) {
      return false;
    }

    if (convention?.playAndWinCollectionId === Number(collectionId)) {
      if (convention?.ownerId === Number(user.id)) {
        return true;
      }

      const users = convention?.users?.filter(
        (u) => u.id === user.id && (u.admin || u.geekGuide),
      );

      if (users.length > 0) {
        return true;
      }
    }

    const organization = await this.organizationService.organizationWithUsers(
      {
        id: Number(organizationId),
      },
      this.ctx,
    );

    if (organization?.ownerId === user.id) {
      return true;
    }

    const orgUsers = organization.users.filter(
      (u) => u.id === user.id && (u.admin || u.geekGuide),
    );

    if (orgUsers.length > 0) {
      return true;
    }

    return false;
  }
}
