import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserOrganizationPermissions } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { OrganizationWriteGuard } from '../../guards/organization/organization-write.guard';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserGuard } from '../../guards/user/user.guard';
import { OrganizationService } from '../../services/organization/organization.service';
import { User } from '../../modules/authz/user.decorator';

@Controller()
export class UserOrganizationPermissionsController {
  ctx: Context;

  constructor(
    private readonly userOrganizationPermissionsService: UserOrganizationPermissionsService,
    private readonly organizationService: OrganizationService,
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
    @User() user: any,
  ): Promise<UserOrganizationPermissions[]> {
    let userOrgPermissions: any = [];
    let userOrgs: any = [];

    if (user.superAdmin) {
      userOrgs = await this.organizationService.allOrganizations(this.ctx);
    } else {
      userOrgPermissions =
        await this.userOrganizationPermissionsService.userOrganizationPermissions(
          id,
          this.ctx,
        );

      userOrgs = await this.organizationService.organizationByOwner(
        Number(id),
        this.ctx,
      );
    }

    userOrgs.forEach((uo) => {
      const uop = userOrgPermissions.find(
        (uop) => uop.organizationId === uo.id,
      );

      if (uop) {
        uop.admin = true;
      } else {
        userOrgPermissions.push({
          id: -1,
          userId: id,
          organizationId: uo.id,
          admin: true,
          organization: uo,
        });
      }
    });

    return userOrgPermissions;
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
