import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { GameController } from '../../controllers/game/game.controller';
import { GameService } from '../../services/game/game.service';
import { CopyModule } from '../copy/copy.module';

@Module({
  controllers: [GameController],
  providers: [PrismaService, GameService],
  exports: [GameService],
  imports: [CopyModule],
})
export class GameModule {}
