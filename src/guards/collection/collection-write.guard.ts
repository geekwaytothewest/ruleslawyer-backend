//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrganizationService } from '../../services/organization/organization.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CollectionService } from '../../services/collection/collection.service';

@Injectable()
export class CollectionWriteGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly prismaService: PrismaService,
    private readonly collectionService: CollectionService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user?.user;
    const colId = context.getArgByIndex(0).params?.colId;

    if (!colId) {
      return false;
    }

    const collection = await this.collectionService.collection(
      colId,
      null,
      null,
      this.ctx,
    );
    const orgId = collection?.organizationId;

    if (!orgId) {
      return false;
    }

    if (collection?.organizationId !== Number(orgId)) {
      return false;
    }

    const orgWithUsers = Prisma.validator<Prisma.OrganizationDefaultArgs>()({
      include: { users: true },
    });

    type OrgWithUsers = Prisma.OrganizationGetPayload<typeof orgWithUsers>;

    const org: OrgWithUsers =
      await this.organizationService.organizationWithUsers(
        {
          id: Number(orgId),
        },
        this.ctx,
      );

    if (org?.ownerId == user.id) {
      return true;
    }

    if (org?.users?.filter((u) => u.userId === user.id && u.admin).length > 0) {
      return true;
    }

    return false;
  }
}
