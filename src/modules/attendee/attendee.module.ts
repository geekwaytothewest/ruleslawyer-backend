import { Module } from '@nestjs/common';
import { HttpModule } from 'nestjs-http-promise';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { AttendeeController } from '../../controllers/attendee/attendee.controller';
import { AttendeeGuard } from '../../guards/attendee/attendee.guard';
import { CopyModule } from '../copy/copy.module';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { CheckOutService } from '../../services/check-out/check-out.service';
import { GameService } from '../../services/game/game.service';
import { BoardGameGeekService } from '../../services/boardgamegeek/boardgamegeek.service';

@Module({
  imports: [CopyModule, HttpModule],
  controllers: [AttendeeController],
  providers: [
    AttendeeService,
    PrismaService,
    AttendeeGuard,
    ConventionService,
    OrganizationService,
    TabletopeventsService,
    CheckOutService,
    GameService,
    BoardGameGeekService,
  ],
  exports: [AttendeeService],
})
export class AttendeeModule {}
