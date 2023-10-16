import { HttpModule } from 'nestjs-http-promise';
import { Module } from '@nestjs/common';
import { OrganizationController } from '../../controllers/organization/organization.controller';
import { OrganizationService } from '../../services/organization/organization.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserOrganizationPermissionsModule } from '../user-organization-permissions/user-organization-permissions.module';
import { ConventionModule } from '../convention/convention.module';
import { CollectionModule } from '../collection/collection.module';
import { CopyService } from '../../services/copy/copy.service';
import { CheckOutModule } from '../check-out/check-out.module';

@Module({
  imports: [
    HttpModule,
    UserOrganizationPermissionsModule,
    ConventionModule,
    CollectionModule,
    CheckOutModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, PrismaService, CopyService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
