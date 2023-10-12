import { HttpModule } from 'nestjs-http-promise';
import { Module } from '@nestjs/common';
import { UserConventionPermissionsController } from '../../controllers/user-convention-permissions/user-convention-permissions.controller';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';

@Module({
  imports: [HttpModule],
  controllers: [UserConventionPermissionsController],
  providers: [
    UserConventionPermissionsService,
    PrismaService,
    ConventionService,
    OrganizationService,
    AttendeeService,
    TabletopeventsService,
  ],
  exports: [UserConventionPermissionsService],
})
export class UserConventionPermissionsModule {}
