import { Injectable } from '@nestjs/common';
import { Prisma, UserConventionPermissions } from '@prisma/client';
import { Context } from '../prisma/context';
import { UserService } from '../user/user.service';

@Injectable()
export class UserConventionPermissionsService {
  constructor(private readonly userService: UserService) {}

  async userConventionPermissions(
    id: string,
    ctx: Context,
  ): Promise<UserConventionPermissions[]> {
    try {
      const userId = await this.userService.convertToUserId(id, ctx);

      return await ctx.prisma.userConventionPermissions.findMany({
        where: {
          userId: userId,
        },
        include: {
          convention: true,
        },
        orderBy: {
          convention: {
            startDate: 'desc',
          },
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  /**
   * Resolves which convention the play-and-win PWA should default to for this
   * user when no convention is encoded in the URL (e.g. the installed app
   * launched from its convention-agnostic start_url). Returns the "current"
   * convention plus the full picker list so the frontend can fall back to a
   * chooser when nothing is currently active.
   *
   * "current" = among the user's non-cancelled conventions whose endDate has
   * not passed, prefer one that is active now (startDate <= now <= endDate),
   * tie-broken by the most recent startDate; otherwise the soonest upcoming
   * convention. Null when the user has no active or upcoming convention.
   */
  async resolveConventions(
    userId: number,
    ctx: Context,
  ): Promise<{
    current: { organizationId: number; conventionId: number } | null;
    conventions: {
      organizationId: number;
      conventionId: number;
      name: string;
      annual: string;
      startDate: Date;
      endDate: Date;
    }[];
  }> {
    const permissions = await ctx.prisma.userConventionPermissions.findMany({
      where: { userId },
      include: { convention: true },
      orderBy: { convention: { startDate: 'desc' } },
    });

    const cons = permissions
      .map((p) => p.convention)
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    const now = new Date();
    const notEnded = cons.filter((c) => !c.cancelled && c.endDate >= now);
    const active = notEnded.filter((c) => c.startDate <= now);

    let chosen: (typeof cons)[number] | null = null;
    if (active.length > 0) {
      // Active now: the most recently started wins.
      chosen = active.reduce((a, b) => (b.startDate > a.startDate ? b : a));
    } else if (notEnded.length > 0) {
      // Only upcoming: the soonest to start wins.
      chosen = notEnded.reduce((a, b) => (b.startDate < a.startDate ? b : a));
    }

    return {
      current: chosen
        ? { organizationId: chosen.organizationId, conventionId: chosen.id }
        : null,
      conventions: cons.map((c) => ({
        organizationId: c.organizationId,
        conventionId: c.id,
        name: c.name,
        annual: c.annual,
        startDate: c.startDate,
        endDate: c.endDate,
      })),
    };
  }

  async userConventionCount(id: string, ctx: Context): Promise<number> {
    const userId = await this.userService.convertToUserId(id, ctx);

    return await ctx.prisma.userConventionPermissions.count({
      where: {
        userId: userId,
      },
    });
  }

  async createPermission(
    data: Prisma.UserConventionPermissionsCreateInput,
    ctx: Context,
  ): Promise<UserConventionPermissions> {
    try {
      return await ctx.prisma.userConventionPermissions.create({
        data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getPermissionsBySearch(
    where: Prisma.UserConventionPermissionsWhereInput,
    ctx: Context,
  ): Promise<UserConventionPermissions[]> {
    try {
      return await ctx.prisma.userConventionPermissions.findMany({
        where: where,
        include: {
          user: true,
        }
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getPermission(
    id: Number,
    ctx: Context,
  ): Promise<UserConventionPermissions | null> {
    try {
      return await ctx.prisma.userConventionPermissions.findUnique({
        where: {
          id: Number(id),
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async deletePermission(
    id: Number,
    ctx: Context,
  ): Promise<UserConventionPermissions | null> {
    try {
      return await ctx.prisma.userConventionPermissions.delete({
        where: {
          id: Number(id),
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async updatePermission(
    id: Number,
    data: Prisma.UserConventionPermissionsUpdateInput,
    ctx: Context,
  ) {
    try {
      return await ctx.prisma.userConventionPermissions.update({
        where: {
          id: Number(id),
        },
        data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
