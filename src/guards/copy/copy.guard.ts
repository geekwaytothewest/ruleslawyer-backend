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

    if (user.superAdmin) {
      return true;
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
