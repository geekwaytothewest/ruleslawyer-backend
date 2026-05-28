import { Module } from '@nestjs/common';
import { PermissionsController } from '../../controllers/permissions/permissions.controller';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { UserOrganizationPermissionsModule } from '../user-organization-permissions/user-organization-permissions.module';
import { UserConventionPermissionsModule } from '../user-convention-permissions/user-convention-permissions.module';

@Module({
  imports: [
    UserModule,
    UserOrganizationPermissionsModule,
    UserConventionPermissionsModule,
  ],
  controllers: [PermissionsController],
  providers: [PrismaService],
})
export class PermissionsModule {}
