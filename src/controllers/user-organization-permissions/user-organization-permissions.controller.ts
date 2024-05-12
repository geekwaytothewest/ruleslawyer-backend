import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserOrganizationPermissions } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { OrganizationWriteGuard } from '../../guards/organization/organization-write.guard';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserGuard } from '../../guards/user/user.guard';

@Controller()
export class UserOrganizationPermissionsController {
  ctx: Context;

  constructor(
    private readonly userOrganizationPermissionsService: UserOrganizationPermissionsService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id')
  async getUserOrganizationPermissions(
    @Param('id') id: string,
  ): Promise<UserOrganizationPermissions[]> {
    return this.userOrganizationPermissionsService.userOrganizationPermissions(
      id,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @Post()
  async createPermission(
    @Body()
    permissionData: {
      userId: number;
      organizationId: number;
      admin: boolean;
      geekGuide: boolean;
      readOnly: boolean;
    },
  ): Promise<UserOrganizationPermissions> {
    return this.userOrganizationPermissionsService.createPermission(
      {
        user: {
          connect: {
            id: permissionData.userId,
          },
        },
        organization: {
          connect: {
            id: permissionData.organizationId,
          },
        },
        admin: permissionData.admin,
        geekGuide: permissionData.geekGuide,
        readOnly: permissionData.readOnly,
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id/count')
  async getUserConventionCount(@Param('id') id: string): Promise<number> {
    return await this.userOrganizationPermissionsService.userOrganizationCount(
      id,
      this.ctx,
    );
  }
}
