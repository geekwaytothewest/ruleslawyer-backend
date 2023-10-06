//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConventionService } from '../services/convention/convention.service';
import { Context } from '../services/prisma/context';
import { PrismaService } from '../services/prisma/prisma.service';

@Injectable()
export class ConventionGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly conventionService: ConventionService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user.user;
    const conId = context.getArgByIndex(0).params.id;

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

    return false;
  }
}
