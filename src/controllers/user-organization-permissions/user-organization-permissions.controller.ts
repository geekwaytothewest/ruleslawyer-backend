import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserOrganizationPermissions } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { OrganizationGuard } from '../../guards/organization/organization.guard';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';

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

  @UseGuards(JwtAuthGuard, OrganizationGuard)
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
}
