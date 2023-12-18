import { Module } from '@nestjs/common';
import { LegacyController } from '../../controllers/legacy/legacy.controller';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CollectionModule } from '../collection/collection.module';
import { OrganizationModule } from '../organization/organization.module';
import { CopyModule } from '../copy/copy.module';
import { ConventionModule } from '../convention/convention.module';
import { AttendeeModule } from '../attendee/attendee.module';
import { CheckOutModule } from '../check-out/check-out.module';
import { GameModule } from '../game/game.module';
import { UserConventionPermissionsModule } from '../user-convention-permissions/user-convention-permissions.module';

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
    GameModule,
		UserConventionPermissionsModule,
  ],
})
export class LegacyModule {}
