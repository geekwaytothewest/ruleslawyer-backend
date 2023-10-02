import { Module } from '@nestjs/common';
import { UserOrganizationPermissionsController } from 'src/controllers/user-organization-permissions/user-organization-permissions.controller';
import { OrganizationService } from 'src/services/organization/organization.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserOrganizationPermissionsService } from 'src/services/user-organization-permissions/user-organization-permissions.service';

@Module({
  controllers: [UserOrganizationPermissionsController],
  providers: [
    UserOrganizationPermissionsService,
    PrismaService,
    OrganizationService,
  ],
  exports: [UserOrganizationPermissionsService],
})
export class UserOrganizationPermissionsModule {}
