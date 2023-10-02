import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConventionController } from 'src/controllers/convention/convention.controller';
import { AttendeeService } from 'src/services/attendee/attendee.service';
import { ConventionService } from 'src/services/convention/convention.service';
import { OrganizationService } from 'src/services/organization/organization.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { TabletopeventsService } from 'src/services/tabletopevents/tabletopevents.service';
import { UserConventionPermissionsService } from 'src/services/user-convention-permissions/user-convention-permissions.service';
import { UserService } from 'src/services/user/user.service';

@Module({
  imports: [HttpModule],
  controllers: [ConventionController],
  providers: [
    ConventionService,
    UserService,
    OrganizationService,
    PrismaService,
    TabletopeventsService,
    UserConventionPermissionsService,
    AttendeeService,
  ],
  exports: [ConventionService],
})
export class ConventionModule {}
