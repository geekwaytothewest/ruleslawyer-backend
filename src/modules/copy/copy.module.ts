import { Module } from '@nestjs/common';
import { CopyController } from '../../controllers/copy/copy.controller';
import { CopyService } from '../../services/copy/copy.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { CopyGuard } from '../../guards/copy/copy.guard';

@Module({
  imports: [],
  controllers: [CopyController],
  providers: [CopyService, PrismaService, OrganizationService, CopyGuard],
  exports: [CopyService, CopyGuard],
})
export class CopyModule {}
