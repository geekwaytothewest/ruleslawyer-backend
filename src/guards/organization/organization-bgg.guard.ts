//jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrganizationService } from '../../services/organization/organization.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';

@Injectable()
export class OrganizationBggGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    let orgId = context.getArgByIndex(0).params?.orgId;

    if (!orgId) {
      orgId = context.getArgByIndex(0).body?.organizationId;
    }

    if (!orgId) {
      return false;
    }

    const organizationArgs = Prisma.validator<Prisma.OrganizationDefaultArgs>()(
      {},
    );

    type Org = Prisma.OrganizationGetPayload<typeof organizationArgs>;

    const organization: Org | null =
      await this.organizationService.organization(
        {
          id: Number(orgId),
        },
        this.ctx,
      );

    if (!organization) {
      return false;
    }

    if (organization.enableBggSupport) {
      return true;
    }

    throw new ForbiddenException(
      'BGG support is not enabled for this organization.',
    );
  }
}
