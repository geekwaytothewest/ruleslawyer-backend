//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConventionService } from '../../services/convention/convention.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';

@Injectable()
export class ConventionAdminGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly conventionService: ConventionService,
    private readonly organizationService: OrganizationService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user?.user;
    let conId = context.getArgByIndex(0).params?.id;

    if (!user) {
      return false;
    }

    if (user.superAdmin) {
      return true;
    }

    if (!conId) {
      conId = context.getArgByIndex(0).params?.conId;

      if (!conId) {
        return false;
      }
    }

    const conWithUsers = Prisma.validator<Prisma.ConventionDefaultArgs>()({
      include: { users: true },
    });

    type ConWithUsers = Prisma.ConventionGetPayload<typeof conWithUsers>;

    const con: ConWithUsers = await this.conventionService.conventionWithUsers(
      {
        id: Number(conId),
      },
      this.ctx,
    );

    if (con?.users?.filter((u) => u.userId === user.id && u.admin).length > 0) {
      return true;
    }

    const orgWithUsers = Prisma.validator<Prisma.OrganizationDefaultArgs>()({
      include: { users: true },
    });

    type OrgWithUsers = Prisma.OrganizationGetPayload<typeof orgWithUsers>;

    const org: OrgWithUsers =
      await this.organizationService.organizationWithUsers(
        {
          id: Number(con?.organizationId),
        },
        this.ctx,
      );

    if (org?.ownerId == user.id) {
      return true;
    }

    if (org?.users?.filter((u) => u.userId === user.id && (u.admin)).length > 0) {
      return true;
    }

    return false;
  }
}
