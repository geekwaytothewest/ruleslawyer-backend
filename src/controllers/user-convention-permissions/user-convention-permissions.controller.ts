import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Prisma, UserConventionPermissions } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { ConventionGuard } from '../../guards/convention.guard';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';

@Controller()
export class UserConventionPermissionsController {
  constructor(
    private readonly userConventionPermissionsService: UserConventionPermissionsService,
  ) {}

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Post()
  async createPermission(
    @Body() permissionData: Prisma.UserConventionPermissionsCreateInput,
  ): Promise<UserConventionPermissions> {
    return this.userConventionPermissionsService.createPermissions(
      permissionData,
    );
  }
}
