import { Module, forwardRef } from '@nestjs/common';
import { CollectionService } from '../../services/collection/collection.service';
import { CopyModule } from '../copy/copy.module';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CollectionController } from '../../controllers/collection/collection.controller';
import { AttendeeModule } from '../attendee/attendee.module';
import { CollectionReadGuard } from '../../guards/collection/collection-read.guard';
import { CollectionWriteGuard } from '../../guards/collection/collection-write.guard';
import { ConventionModule } from '../convention/convention.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    CopyModule,
    AttendeeModule,
    forwardRef(() => ConventionModule),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [CollectionController],
  providers: [
    CollectionService,
    PrismaService,
    CollectionReadGuard,
    CollectionWriteGuard,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
