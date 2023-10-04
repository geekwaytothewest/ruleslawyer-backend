import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UserConventionPermissionsController } from 'src/controllers/user-convention-permissions/user-convention-permissions.controller';
import { AttendeeService } from 'src/services/attendee/attendee.service';
import { ConventionService } from 'src/services/convention/convention.service';
import { OrganizationService } from 'src/services/organization/organization.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { TabletopeventsService } from 'src/services/tabletopevents/tabletopevents.service';
import { UserConventionPermissionsService } from 'src/services/user-convention-permissions/user-convention-permissions.service';

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
