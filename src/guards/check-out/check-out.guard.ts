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

    const convention = await this.conventionService.conventionWithUsers(
      {
        id: conventionId,
      },
      this.ctx,
    );

    if (convention.playAndWinCollectionId === collectionId) {
      if (convention?.ownerId === user.id) {
        return true;
      }

      const users = convention?.users?.filter(
        (u) => u.id === user.id && (u.admin || u.geekGuide),
      );

      if (!users) {
        return false;
      }

      if (users.length > 0) {
        return true;
      }
    } else {
      const organization = await this.organizationService.organizationWithUsers(
        {
          id: organizationId,
        },
        this.ctx,
      );

      if (organization.ownerId === user.id) {
        return true;
      }

      const users = organization?.users?.filter(
        (u) => u.id === user.id && (u.admin || u.geekGuide),
      );

      if (!users) {
        return false;
      }

      if (users.length > 0) {
        return true;
      }
    }

    return false;
  }
}
