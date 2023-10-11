import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserConventionPermissions } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { ConventionGuard } from '../../guards/convention/convention.guard';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';

@Controller()
export class UserConventionPermissionsController {
  ctx: Context;

  constructor(
    private readonly userConventionPermissionsService: UserConventionPermissionsService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Post()
  async createPermission(
    @Body()
    permissionData: {
      userId: number;
      conventionId: number;
      admin: boolean;
      geekGuide: boolean;
      attendee: boolean;
    },
  ): Promise<UserConventionPermissions> {
    return this.userConventionPermissionsService.createPermission(
      {
        user: {
          connect: {
            id: permissionData.userId,
          },
        },
        convention: {
          connect: {
            id: permissionData.conventionId,
          },
        },
        admin: permissionData.admin,
        geekGuide: permissionData.geekGuide,
        attendee: permissionData.attendee,
      },
      this.ctx,
    );
  }
}
