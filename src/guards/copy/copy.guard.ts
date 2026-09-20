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
    let copyId = context.getArgByIndex(0).params?.id;

    if (!user) {
      return false;
    }

    if (!copyId) {
      copyId = context.getArgByIndex(0).params?.copyId;
    }

    let copy: any;

    if (!copyId) {
      const barcodeLabel = context.getArgByIndex(0).params?.oldBarcodeLabel;
      const orgId = context.getArgByIndex(0).params?.orgId;

      if (!barcodeLabel) {
        return false;
      }

      if (!orgId) {
        return false;
      }

      copy = await this.copyService.copyWithCollection(
        {
          organizationId_barcodeLabel: {
            barcodeLabel: barcodeLabel,
            organizationId: Number(orgId),
          },
        },
        this.ctx,
      );
    }

    if (!copy) {
      copy = await this.copyService.copyWithCollection(
        {
          id: Number(copyId),
        },
        this.ctx,
      );
    }

    if (!copy) {
      return false;
    }

    if (copy.collection?.archived) {
      return false;
    }

    // A copy denormalizes organizationId alongside collectionId, so connecting
    // it to another org's collection leaves the row pointing at two different
    // orgs. That's a data-integrity break rather than a permission question, so
    // it's checked ahead of the superAdmin short-circuit. Guards run before the
    // ValidationPipe, so this reads the raw body the client actually sent.
    const requestedCollectionId = context.getArgByIndex(0).body?.collectionId;

    if (requestedCollectionId !== undefined && requestedCollectionId !== null) {
      const targetCollectionId = Number(requestedCollectionId);

      if (Number.isNaN(targetCollectionId)) {
        return false;
      }

      if (targetCollectionId !== copy.collectionId) {
        const targetCollection = await this.ctx.prisma.collection.findUnique({
          where: { id: targetCollectionId },
        });

        if (!targetCollection) {
          return false;
        }

        if (targetCollection.archived) {
          return false;
        }

        if (targetCollection.organizationId !== copy.organizationId) {
          return false;
        }
      }
    }

    if (user.superAdmin) {
      return true;
    }

    const organization = await this.organizationService.organizationWithUsers(
      {
        id: copy.organizationId,
      },
      this.ctx,
    );

    if (organization?.ownerId === user.id) {
      return true;
    }

    const users = organization?.users?.filter(
      (u) => u.userId === user.id && u.admin,
    );

    if (!users) {
      return false;
    }

    if (users.length > 0) {
      return true;
    }

    return false;
  }
}
