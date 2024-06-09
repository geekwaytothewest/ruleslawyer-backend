import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GameService } from '../../services/game/game.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';

@Injectable()
export class GameGuard implements CanActivate {
  ctx: Context;

  constructor(
    private readonly gameService: GameService,
    private readonly prismaService: PrismaService,
    private readonly organizationService: OrganizationService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user?.user;
    let gameId = context.getArgByIndex(0).params?.id;

    if (!gameId) {
      gameId = context.getArgByIndex(0).params?.gameId;
    }

    const game = await this.gameService.game(
      { id: Number(gameId) },
      this.ctx,
      user,
    );

    if (!game) {
      return false;
    }

    const organization = await this.organizationService.organizationWithUsers(
      {
        id: game.organizationId,
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
