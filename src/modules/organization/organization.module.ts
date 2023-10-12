import { HttpModule } from 'nestjs-http-promise';
import { Module } from '@nestjs/common';
import { OrganizationController } from '../../controllers/organization/organization.controller';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { CollectionService } from '../../services/collection/collection.service';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import { UserService } from '../../services/user/user.service';
import { CopyService } from '../../services/copy/copy.service';

@Module({
  imports: [HttpModule],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    UserService,
    ConventionService,
    PrismaService,
    UserConventionPermissionsService,
    AttendeeService,
    TabletopeventsService,
    CollectionService,
    CopyService,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
