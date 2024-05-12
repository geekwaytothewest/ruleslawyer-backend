import { Module } from '@nestjs/common';
import { CollectionService } from '../../services/collection/collection.service';
import { CopyModule } from '../copy/copy.module';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { CollectionController } from '../../controllers/collection/collection.controller';
import { AttendeeModule } from '../attendee/attendee.module';
import { CollectionReadGuard } from '../../guards/collection/collection-read.guard';
import { CollectionWriteGuard } from '../../guards/collection/collection-write.guard';

@Module({
  imports: [CopyModule, AttendeeModule],
  controllers: [CollectionController],
  providers: [
    CollectionService,
    PrismaService,
    OrganizationService,
    CollectionReadGuard,
    CollectionWriteGuard,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
