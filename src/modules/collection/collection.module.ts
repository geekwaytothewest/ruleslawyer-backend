import { Module } from '@nestjs/common';
import { CollectionService } from '../../services/collection/collection.service';
import { CopyModule } from '../copy/copy.module';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CollectionGuard } from '../../guards/collection/collection.guard';
import { OrganizationService } from '../../services/organization/organization.service';

@Module({
  imports: [CopyModule],
  controllers: [],
  providers: [
    CollectionService,
    PrismaService,
    CollectionGuard,
    OrganizationService,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
