import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { GameController } from '../../controllers/game/game.controller';
import { GameService } from '../../services/game/game.service';
import { GameGuard } from '../../guards/game/game.guard';
import { OrganizationService } from '../../services/organization/organization.service';
import { CopyModule } from '../copy/copy.module';

@Module({
  controllers: [GameController],
  providers: [PrismaService, GameService, OrganizationService, GameGuard],
  exports: [GameService],
  imports: [CopyModule],
})
export class GameModule {}
