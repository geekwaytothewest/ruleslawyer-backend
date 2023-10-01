import { Module } from '@nestjs/common';
import { OrganizationController } from 'src/controllers/organization/organization.controller';
import { OrganizationService } from 'src/services/organization/organization.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserService } from 'src/services/user/user.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, UserService, PrismaService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
