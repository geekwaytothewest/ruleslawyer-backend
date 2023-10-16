import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AttendeeModule } from '../attendee/attendee.module';
import { CheckOutService } from '../../services/check-out/check-out.service';
import { CopyModule } from '../copy/copy.module';
import { CheckOutGuard } from '../../guards/check-out/check-out.guard';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { HttpModule } from 'nestjs-http-promise';

@Module({
  imports: [AttendeeModule, CopyModule, HttpModule],
  controllers: [],
  providers: [
    CheckOutService,
    PrismaService,
    CheckOutGuard,
    ConventionService,
    OrganizationService,
    TabletopeventsService,
  ],
  exports: [CheckOutService],
})
export class CheckOutModule {}
