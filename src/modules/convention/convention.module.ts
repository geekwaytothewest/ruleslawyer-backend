import { HttpModule } from 'nestjs-http-promise';
import { Module, forwardRef } from '@nestjs/common';
import { ConventionController } from '../../controllers/convention/convention.controller';
import { ConventionService } from '../../services/convention/convention.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AttendeeModule } from '../attendee/attendee.module';
import { CheckOutModule } from '../check-out/check-out.module';
import { ConventionReadGuard } from '../../guards/convention/convention-read.guard';
import { ConventionWriteGuard } from '../../guards/convention/convention-write.guard';
import { OrganizationModule } from '../organization/organization.module';
import { CollectionModule } from '../collection/collection.module';

@Module({
  imports: [
    HttpModule,
    AttendeeModule,
    CheckOutModule,
    forwardRef(() => CollectionModule),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [ConventionController],
  providers: [
    ConventionService,
    TabletopeventsService,
    PrismaService,
    ConventionReadGuard,
    ConventionWriteGuard,
  ],
  exports: [ConventionService, ConventionReadGuard, ConventionWriteGuard],
})
export class ConventionModule {}
