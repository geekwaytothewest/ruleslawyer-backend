import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { AttendeeService } from '../../services/attendee/attendee.service';

@Injectable()
export class AttendeeGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly attendeeService: AttendeeService,
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
    let id = context.getArgByIndex(0).params?.id;

    const attendee = await this.attendeeService.attendee(
      {
        id: Number(id),
      },
      this.ctx
    );

    if (!attendee) {
      return false;
    }

    if (user.superAdmin) {
      return true;
    }

    if (user.id === attendee.userId) {
      return true;
    }

    const convention = await this.conventionService.conventionWithUsers(
      {
        id: Number(attendee.conventionId),
      },
      this.ctx,
    );

    const users = convention?.users?.filter(
      (u) => u.userId === user.id && (u.admin || u.geekGuide),
    );

    if (users && users.length > 0) {
      return true;
    }

    const organization = await this.organizationService.organizationWithUsers(
      {
        id: Number(convention?.organizationId),
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
