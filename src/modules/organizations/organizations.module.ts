import { Module } from '@nestjs/common';
import { OrganizationController } from 'src/controllers/organization/organization.controller';
import { ConventionService } from 'src/services/convention/convention.service';
import { OrganizationService } from 'src/services/organization/organization.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserConventionPermissionsService } from 'src/services/user-convention-permissions/user-convention-permissions.service';
import { UserService } from 'src/services/user/user.service';

@Module({
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    UserService,
    ConventionService,
    PrismaService,
    UserConventionPermissionsService,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
