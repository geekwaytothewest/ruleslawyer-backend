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
    let organizationId = context.getArgByIndex(0).params?.id;
    const collectionId = context.getArgByIndex(0).params?.colId;
    const conventionId = context.getArgByIndex(0).params?.conId;

    if (!user) {
      return false;
    }

    if (!organizationId) {
      organizationId = context.getArgByIndex(0).params?.orgId;
    }

    if (!organizationId) {
      return false;
    }

    if (!conventionId) {
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

    if (
      collectionId &&
      convention?.playAndWinCollectionId === Number(collectionId)
    ) {
      const users = convention?.users?.filter(
        (u) => u.id === user.id && (u.admin || u.geekGuide),
      );

      if (users && users.length > 0) {
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

    const orgUsers = organization?.users?.filter(
      (u) => u.userId === user.id && (u.admin || u.geekGuide),
    );

    if (orgUsers && orgUsers.length > 0) {
      return true;
    }

    return false;
  }
}
