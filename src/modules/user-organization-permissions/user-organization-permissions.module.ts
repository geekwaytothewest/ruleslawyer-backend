import { Module } from '@nestjs/common';
import { UserOrganizationPermissionsController } from '../../controllers/user-organization-permissions/user-organization-permissions.controller';
import { OrganizationService } from '../../services/organization/organization.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [UserOrganizationPermissionsController],
  imports: [UserModule],
  providers: [
    UserOrganizationPermissionsService,
    PrismaService,
    OrganizationService,
  ],
  exports: [UserOrganizationPermissionsService],
})
export class UserOrganizationPermissionsModule {}
