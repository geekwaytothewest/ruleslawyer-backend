import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CopyService } from '../../services/copy/copy.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';

@Injectable()
export class CopyGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly copyService: CopyService,
    private readonly prismaService: PrismaService,
    private readonly organizationService: OrganizationService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user?.user;
    const copyId = context.getArgByIndex(0).params?.id;
    const copy = await this.copyService.copyWithCollection(
      {
        id: Number(copyId),
      },
      this.ctx,
    );

    if (!copy) {
      return false;
    }

    const organization = await this.organizationService.organizationWithUsers(
      {
        id: copy.collection.organizationId,
      },
      this.ctx,
    );

    if (organization?.ownerId === user.id) {
      return true;
    }

    const users = organization?.users?.filter(
      (u) => u.id === user.id && u.admin,
    );

    if (!users) {
      return false;
    }

    if (users.length > 0) {
      return true;
    } else {
      return false;
    }

    return false;
  }
}
