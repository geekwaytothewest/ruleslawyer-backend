//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrganizationService } from 'src/services/organization/organization.service';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private readonly organizationService: OrganizationService) {}

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user.user;
    let orgId = context.getArgByIndex(0).params.id;

    if (!orgId) {
      orgId = context.getArgByIndex(0).body.organizationId;
    }

    if (!orgId) {
      return false;
    }

    const orgWithUsers = Prisma.validator<Prisma.OrganizationDefaultArgs>()({
      include: { users: true },
    });

    type OrgWithUsers = Prisma.OrganizationGetPayload<typeof orgWithUsers>;

    const org: OrgWithUsers =
      await this.organizationService.organizationWithUsers({
        id: Number(orgId),
      });

    if (org.ownerId == user.id) {
      return true;
    }

    if (org.users?.filter((u) => u.id === user.id && u.admin).length > 0) {
      return true;
    }

    return false;
  }
}
