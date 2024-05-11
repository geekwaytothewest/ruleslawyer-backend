import { HttpModule } from 'nestjs-http-promise';
import { Module } from '@nestjs/common';
import { UserConventionPermissionsController } from '../../controllers/user-convention-permissions/user-convention-permissions.controller';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import { ConventionModule } from '../convention/convention.module';
import { OrganizationModule } from '../organization/organization.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [HttpModule, ConventionModule, OrganizationModule, UserModule],
  controllers: [UserConventionPermissionsController],
  providers: [UserConventionPermissionsService, PrismaService],
  exports: [UserConventionPermissionsService],
})
export class UserConventionPermissionsModule {}
