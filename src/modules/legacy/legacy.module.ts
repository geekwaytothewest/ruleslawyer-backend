import { Module } from '@nestjs/common';
import { LegacyController } from 'src/controllers/legacy/legacy.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CollectionModule } from '../collection/collection.module';
import { OrganizationModule } from '../organization/organization.module';
import { CopyModule } from '../copy/copy.module';
import { ConventionModule } from '../convention/convention.module';
import { AttendeeModule } from '../attendee/attendee.module';
import { CheckOutModule } from '../check-out/check-out.module';

@Module({
  controllers: [LegacyController],
  providers: [PrismaService],
  exports: [],
  imports: [
    CollectionModule,
    OrganizationModule,
    CopyModule,
    ConventionModule,
    AttendeeModule,
    CheckOutModule,
  ],
})
export class LegacyModule {}
