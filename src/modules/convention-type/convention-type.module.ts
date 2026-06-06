import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionTypeController } from '../../controllers/convention-type/convention-type.controller';
import { ConventionTypeService } from '../../services/convention-type/convention-type.service';
import { ConventionTypeGuard } from '../../guards/convention-type/convention-type.guard';

@Module({
  imports: [],
  controllers: [ConventionTypeController],
  providers: [
    PrismaService,
    OrganizationService,
    ConventionTypeService,
    ConventionTypeGuard,
  ],
  exports: [ConventionTypeService, ConventionTypeGuard],
})
export class ConventionTypeModule {}
