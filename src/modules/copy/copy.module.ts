import { Module } from '@nestjs/common';
import { CopyController } from '../../controllers/copy/copy.controller';
import { CopyService } from '../../services/copy/copy.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';

@Module({
  imports: [],
  controllers: [CopyController],
  providers: [CopyService, PrismaService, OrganizationService],
  exports: [CopyService],
})
export class CopyModule {}
