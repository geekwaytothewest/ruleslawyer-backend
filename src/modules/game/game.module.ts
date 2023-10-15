import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { GameController } from '../../controllers/game/game.controller';
import { GameService } from '../../services/game/game.service';

@Module({
  controllers: [GameController],
  providers: [PrismaService, GameService],
  exports: [GameService],
})
export class GameModule {}
