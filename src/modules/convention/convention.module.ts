import { HttpModule } from 'nestjs-http-promise';
import { Module } from '@nestjs/common';
import { ConventionController } from '../../controllers/convention/convention.controller';
import { ConventionService } from '../../services/convention/convention.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { CollectionModule } from '../collection/collection.module';
import { AttendeeModule } from '../attendee/attendee.module';
import { CheckOutModule } from '../check-out/check-out.module';
import { ConventionGuard } from '../../guards/convention/convention.guard';

@Module({
  imports: [HttpModule, CollectionModule, AttendeeModule, CheckOutModule],
  controllers: [ConventionController],
  providers: [
    ConventionService,
    TabletopeventsService,
    PrismaService,
    OrganizationService,
    ConventionGuard,
  ],
  exports: [ConventionService, ConventionGuard],
})
export class ConventionModule {}
