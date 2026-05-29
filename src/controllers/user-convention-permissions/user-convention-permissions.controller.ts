import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserConventionPermissions } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserGuard } from '../../guards/user/user.guard';
import { ConventionPermissionsSelfUpdateGuard } from '../../guards/permissions/convention-permissions-self-update.guard';
import { ConventionPermissionsGuard } from '../../guards/permissions/convention-permissions.guard';
import { ConventionCreatePermissionsGuard } from '../../guards/permissions/convention-create-permissions.guard';

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

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id')
  async getUserConventionPermissions(
    @Param('id') id: string,
  ): Promise<UserConventionPermissions[]> {
    return this.userConventionPermissionsService.userConventionPermissions(
      id,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id/count')
  async getUserConventionCount(@Param('id') id: string): Promise<number> {
    return await this.userConventionPermissionsService.userConventionCount(
      id,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionCreatePermissionsGuard)
  @Post()
  async createConventionPermission(
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

  @UseGuards(JwtAuthGuard, ConventionPermissionsGuard, ConventionPermissionsSelfUpdateGuard)
  @Delete(':id')
  async deleteConventionPermission(@Param('id') id: string) {
    return await this.userConventionPermissionsService.deletePermission(
      Number(id),
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionPermissionsGuard, ConventionPermissionsSelfUpdateGuard)
  @Put(':id')
  async updateConventionPermission(
    @Param('id') id: string,
    @Body() permissionData: {
      admin: boolean;
      geekGuide: boolean;
      attendee: boolean;
    },
  ) {
    return await this.userConventionPermissionsService.updatePermission(
      Number(id),
      permissionData,
      this.ctx,
    );
  }
}
