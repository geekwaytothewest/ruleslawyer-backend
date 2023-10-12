import { HttpModule } from 'nestjs-http-promise';
import { Module } from '@nestjs/common';
import { ConventionController } from '../../controllers/convention/convention.controller';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import { UserService } from '../../services/user/user.service';

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
