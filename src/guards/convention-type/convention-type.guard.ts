//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConventionTypeService } from '../../services/convention-type/convention-type.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';

@Injectable()
export class ConventionTypeGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly conventionTypeService: ConventionTypeService,
    private readonly organizationService: OrganizationService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user?.user;
    let conTypeId = context.getArgByIndex(0).params?.id;

    if (!user) {
      return false;
    }

    if (user.superAdmin) {
      return true;
    }

    const conType = await this.conventionTypeService.conventionType(
      {
        id: Number(conTypeId),
      },
      this.ctx,
    );

    if (!conType) {
      return false;
    }

    const orgWithUsers = Prisma.validator<Prisma.OrganizationDefaultArgs>()({
      include: { users: true },
    });

    type OrgWithUsers = Prisma.OrganizationGetPayload<typeof orgWithUsers>;

    const org: OrgWithUsers =
      await this.organizationService.organizationWithUsers(
        {
          id: Number(conType?.organizationId),
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
