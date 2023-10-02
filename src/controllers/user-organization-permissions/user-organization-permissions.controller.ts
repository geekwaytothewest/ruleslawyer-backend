import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Prisma, UserOrganizationPermissions } from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { OrganizationGuard } from 'src/guards/organization.guard';
import { UserOrganizationPermissionsService } from 'src/services/user-organization-permissions/user-organization-permissions.service';

@Controller()
export class UserOrganizationPermissionsController {
  constructor(
    private readonly userOrganizationPermissionsService: UserOrganizationPermissionsService,
  ) {}

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Post()
  async createPermission(
    @Body() permissionData: Prisma.UserOrganizationPermissionsCreateInput,
  ): Promise<UserOrganizationPermissions> {
    return this.userOrganizationPermissionsService.createPermissions(
      permissionData,
    );
  }
}
