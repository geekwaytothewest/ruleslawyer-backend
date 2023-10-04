import { Module } from '@nestjs/common';
import { UserConventionPermissionsController } from 'src/controllers/user-convention-permissions/user-convention-permissions.controller';
import { ConventionService } from 'src/services/convention/convention.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserConventionPermissionsService } from 'src/services/user-convention-permissions/user-convention-permissions.service';

@Module({
  controllers: [UserConventionPermissionsController],
  providers: [
    UserConventionPermissionsService,
    PrismaService,
    ConventionService,
  ],
  exports: [UserConventionPermissionsService],
})
export class UserConventionPermissionsModule {}
